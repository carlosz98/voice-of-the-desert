<?php
/* ============================================================
 *  music-search.php: Felipe looks up a song (Apple's iTunes Search).
 *
 *  GET music-search.php?q=viento+del+norte
 *    → [{ title, artist, album, genre, seconds, artwork, link }, ...]
 *
 *  Fills in the song's details for him (name, artist, album, cover).
 *  The song file itself he still uploads. Free, no key needed.
 * ============================================================ */
require __DIR__ . '/_db.php';
require __DIR__ . '/_web.php';

if (method() !== 'GET') fail('Method not allowed', 405);
only_felipe();

$q = search_words();
// ITUNES_URL can point somewhere else for the tests
$base = getenv('ITUNES_URL') ?: 'https://itunes.apple.com/search';
$answer = web_get($base . '?' . http_build_query(['term' => $q, 'media' => 'music', 'entity' => 'song', 'limit' => 12, 'country' => 'MX']));
$data = $answer && $answer['status'] === 200 ? json_decode($answer['body'], true) : null;
if (!is_array($data)) fail("The music search isn't answering right now. Try again in a minute.", 502);

$list = [];
foreach ($data['results'] ?? [] as $s) {
    if (empty($s['trackName'])) continue;
    $art = (string) ($s['artworkUrl100'] ?? '');
    $list[] = [
        'title'   => plain($s['trackName']),
        'artist'  => plain($s['artistName'] ?? ''),
        'album'   => plain($s['collectionName'] ?? ''),
        'genre'   => plain($s['primaryGenreName'] ?? ''),
        'seconds' => isset($s['trackTimeMillis']) ? (int) round($s['trackTimeMillis'] / 1000) : null,
        // the 100×100 cover → a 600×600 one (same address, bigger size)
        'artwork' => str_starts_with($art, 'https://') ? str_replace('100x100bb', '600x600bb', $art) : null,
        'link'    => str_starts_with((string) ($s['trackViewUrl'] ?? ''), 'https://') ? $s['trackViewUrl'] : null,
    ];
}
send($list);
