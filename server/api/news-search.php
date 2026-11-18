<?php
/* ============================================================
 *  news-search.php: Felipe searches the news (Google News).
 *
 *  GET news-search.php?q=gobierno+prepararse&lang=es
 *    → [{ title, source, link, published, image }, ...]   (up to 12)
 *  GET news-search.php?topic=world        → what's happening now ("Lo que está pasando hoy")
 *      topics: top (Mexico's top stories), world, nation, chihuahua, faith
 *
 *  Only the headline, the newspaper's name, the date, the link and a
 *  small picture come back, never the whole story: Felipe writes the
 *  rest in his own words, and the link sends readers to the original.
 *
 *  Two free news feeds, no key needed:
 *    1. Bing News RSS   → has a small picture for most stories (asked first)
 *    2. Google News RSS → no pictures (used when Bing doesn't answer)
 * ============================================================ */
require __DIR__ . '/_db.php';
require __DIR__ . '/_web.php';

if (method() !== 'GET') fail('Method not allowed', 405);
only_felipe();

$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$region = $lang === 'en' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=es-419&gl=MX&ceid=MX:es-419';
$bingMarket = $lang === 'en' ? 'en-US' : 'es-MX';
// NEWS_RSS_URL / BING_RSS_URL can point somewhere else for the tests
$root = rtrim(getenv('NEWS_RSS_URL') ?: 'https://news.google.com/rss', '/');
$bing = getenv('BING_RSS_URL') ?: 'https://www.bing.com/news/search';

/* <News:Source>…</News:Source> and other tags with a "prefix:" (Bing uses them) */
function tag_text(SimpleXMLElement $item, string $tag): string
{
    return preg_match('#<' . preg_quote($tag, '#') . '>([^<]*)</#i', $item->asXML(), $m) ? $m[1] : '';
}

/* the story's small picture, if the feed has one (else null).
 * Bing: <News:Image>  · other feeds: <media:thumbnail url=…> or <media:content url=…> */
function picture_of(SimpleXMLElement $item): ?string
{
    $url = tag_text($item, 'News:Image');
    if ($url === '' && preg_match('#<media:(?:thumbnail|content)[^>]*\surl="([^"]+)"#i', $item->asXML(), $m)) $url = $m[1];
    $url = html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $url = preg_replace('#^http://#', 'https://', $url); // pictures only over https
    return preg_match('#^https://[^\s"<>]+$#', $url) ? $url : null;
}

/* Bing wraps the newspaper's address: bing.com/news/apiclick.aspx?…&url=https%3a%2f%2f…
 * → keep the newspaper's own address */
function real_link(string $link): string
{
    if (preg_match('#^https?://(www\.)?bing\.com/news/apiclick\.aspx#i', $link)) {
        parse_str((string) parse_url($link, PHP_URL_QUERY), $q);
        if (!empty($q['url']) && preg_match('#^https?://#', $q['url'])) return $q['url'];
    }
    return $link;
}

/* one news feed page (Bing or Google) → a list of stories */
function news_for(string $address): ?array
{
    $answer = web_get($address);
    if (!$answer || $answer['status'] !== 200) return null;
    // LIBXML_NONET: the XML can't make PHP load anything from the internet
    $xml = @simplexml_load_string($answer['body'], 'SimpleXMLElement', LIBXML_NONET | LIBXML_NOCDATA);
    if (!$xml || !isset($xml->channel)) return null;

    $list = [];
    foreach ($xml->channel->item as $item) {
        $source = plain((string) $item->source);
        $title = plain((string) $item->title);
        // Google writes "Headline - Newspaper": keep only the headline
        if ($source !== '' && str_ends_with($title, " - $source")) {
            $title = mb_substr($title, 0, mb_strlen($title) - mb_strlen(" - $source"));
        }
        $link = real_link((string) $item->link);
        if (!preg_match('#^https?://#', $link)) continue; // only real web links
        if ($source === '') $source = plain(tag_text($item, 'News:Source'));
        $time = strtotime((string) $item->pubDate);
        $list[] = [
            'title'     => $title,
            'source'    => $source,
            'link'      => $link,
            'published' => $time ? gmdate('c', $time) : null,
            'image'     => picture_of($item),
        ];
        if (count($list) === 12) break;
    }
    return $list;
}

/* the topics: only these, so nothing else can be asked for.
 *   [what to ask Bing, the Google News page] */
const TOPICS = [
    'top'       => ['México', ''],                                    // top stories
    'world'     => ['noticias internacionales', '/headlines/section/topic/WORLD'],
    'nation'    => ['México nacional', '/headlines/section/topic/NATION'],
    'chihuahua' => ['Chihuahua', '/search?q=Chihuahua%20when%3A2d'],
    'faith'     => ['iglesia fe', '/search?q=iglesia%20OR%20fe%20OR%20papa%20when%3A3d'],
];

/* ask Bing first (pictures); when it doesn't answer or finds nothing, ask Google */
function bing_then_google(string $bing, string $words, string $market, string $google): ?array
{
    $list = news_for($bing . '?' . http_build_query(['q' => $words, 'format' => 'rss', 'mkt' => $market, 'setlang' => substr($market, 0, 2)]));
    if ($list) return $list;
    return news_for($google);
}

if (isset($_GET['topic'])) {
    $topic = TOPICS[$_GET['topic']] ?? null;
    if ($topic === null) fail('Unknown topic');
    [$words, $path] = $topic;
    $list = bing_then_google($bing, $words, $bingMarket, $root . $path . (str_contains($path, '?') ? '&' : '?') . $region);
} else {
    $q = search_words();
    $list = bing_then_google($bing, $q, $bingMarket, "$root/search?q=" . rawurlencode("$q when:7d") . "&$region");
    // nothing this week: look further back
    if ($list === []) $list = news_for("$root/search?q=" . rawurlencode($q) . "&$region");
}
if ($list === null) fail("The news search isn't answering right now. Try again in a minute.", 502);
send($list);
