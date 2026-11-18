<?php
/* Pretend versions of Google News, iTunes, YouTube and Gemini, for the tests
 * (the test machine can't reach the real ones). Same answer shapes as the real sites.
 *   php -S 127.0.0.1:8099 router.php */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
file_put_contents(__DIR__ . '/last-request.txt', $_SERVER['REQUEST_URI'] . "\n" . file_get_contents('php://input'));

if ($path === '/bing') {
    // pretend Bing: answers with pictures, except for some words (so the Google fallback gets tested)
    $q = $_GET['q'] ?? '';
    if (preg_match('/solo google|internacionales|Chihuahua|nada/', $q)) { http_response_code(503); exit; }
    header('Content-Type: application/rss+xml');
    echo '<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:News="https://www.bing.com/news/search?q=x&amp;format=rss"><channel><title>Bing</title>';
    echo '<item><title>Familias se preparan para el invierno</title><link>http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=1&amp;url=https%3a%2f%2fwww.elheraldo.mx%2finvierno&amp;c=1&amp;mkt=es-mx</link><description>Resumen</description><pubDate>Tue, 17 Nov 2026 10:00:00 GMT</pubDate><News:Source>El Heraldo</News:Source><News:Image>http://www.bing.com/th?id=OVFT.abc&amp;pid=News</News:Image></item>';
    echo '<item><title>Sin foto</title><link>https://www.diario.mx/nota</link><pubDate>Tue, 17 Nov 2026 09:00:00 GMT</pubDate><News:Source>El Diario</News:Source><News:Image>javascript:alert(1)</News:Image></item>';
    echo '</channel></rss>';
    exit;
}
if (str_starts_with($path, '/news')) {
    header('Content-Type: application/rss+xml');
    $q = $_GET['q'] ?? '';
    if (str_contains($q, 'nada')) { echo '<?xml version="1.0"?><rss><channel><title>x</title></channel></rss>'; exit; }
    echo '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Google News</title>';
    $items = [
        ['El gobierno pide a la población prepararse ante la ola de frío - El Heraldo de Chihuahua', 'El Heraldo de Chihuahua', 'https://news.google.com/rss/articles/abc1'],
        ['Protección Civil abre refugios temporales en Ciudad Juárez &amp; Delicias - El Diario', 'El Diario', 'https://news.google.com/rss/articles/abc2'],
        ['Nota sin enlace válido - Mal', 'Mal', 'javascript:alert(1)'],
        ["Tema: $path - Agencia", 'Agencia', 'https://news.google.com/rss/articles/abc3'],
    ];
    foreach ($items as [$t, $s, $l]) {
        echo "<item><title>$t</title><link>$l</link><pubDate>Mon, 16 Nov 2026 14:00:00 GMT</pubDate><description>&lt;a href=\"$l\"&gt;x&lt;/a&gt;</description><source url=\"https://x\">$s</source></item>";
    }
    echo '</channel></rss>';
    exit;
}
if ($path === '/itunes') {
    header('Content-Type: application/json');
    echo json_encode(['resultCount' => 2, 'results' => [
        ['trackName' => 'Viento del Norte', 'artistName' => 'Los Norteños', 'collectionName' => 'Sierra', 'primaryGenreName' => 'Norteño', 'trackTimeMillis' => 201500, 'artworkUrl100' => 'https://is1-ssl.mzstatic.com/image/thumb/a/100x100bb.jpg', 'trackViewUrl' => 'https://music.apple.com/mx/song/1'],
        ['trackName' => '<b>Canción</b> dos', 'artistName' => 'Otro', 'artworkUrl100' => 'http://inseguro/100x100bb.jpg'],
    ]]);
    exit;
}
if ($path === '/oembed') {
    header('Content-Type: application/json');
    if (str_contains($_GET['url'] ?? '', 'GONEgone123')) { http_response_code(404); echo 'Not Found'; exit; }
    echo json_encode(['title' => 'Amanecer en la Sierra Tarahumara', 'author_name' => 'Canal del Desierto', 'thumbnail_url' => 'https://i.ytimg.com/vi/x/hqdefault.jpg']);
    exit;
}
if (preg_match('#^/gemini/([a-z0-9.\-]+):generateContent$#', $path, $m)) {
    header('Content-Type: application/json');
    if (($_SERVER['HTTP_X_GOOG_API_KEY'] ?? '') !== 'test-key') { http_response_code(403); echo '{}'; exit; }
    $req = json_decode(file_get_contents('php://input'), true);
    $notes = $req['contents'][0]['parts'][0]['text'] ?? '';
    if (str_contains($notes, 'LIMITE')) { http_response_code(429); echo '{}'; exit; }
    $draft = str_contains($req['systemInstruction']['parts'][0]['text'] ?? '', '"reflection"')
        ? ['reflection' => 'Este versículo me recuerda que no estamos solos.']
        : ['title' => 'El gobierno pide prepararse', 'summary' => 'Las autoridades piden a las familias prepararse.', 'take' => 'Yo creo que hay que estar listos, vecinos. <script>x</script>', 'extra' => 'no'];
    echo json_encode(['candidates' => [['content' => ['parts' => [['text' => "```json\n" . json_encode($draft, JSON_UNESCAPED_UNICODE) . "\n```"]]]]]]);
    exit;
}
http_response_code(404);
