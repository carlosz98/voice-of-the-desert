<?php
/* ============================================================
 *  video-info.php: Felipe pastes a YouTube link.
 *
 *  GET video-info.php?url=https://youtu.be/abc123XYZ_0
 *    → { youtube_id, video_url, title, channel, thumbnail }
 *
 *  The link is only READ to find the video's 11-letter id; the address
 *  we ask YouTube is built from that id, so a pasted link can't send
 *  our server anywhere else. Free, no key needed (YouTube oEmbed).
 * ============================================================ */
require __DIR__ . '/_db.php';
require __DIR__ . '/_web.php';

if (method() !== 'GET') fail('Method not allowed', 405);
only_felipe();

/* youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID · /embed/ID · /live/ID */
function youtube_id(string $link): ?string
{
    $pattern = '#^(?:https?://)?(?:www\.|m\.|music\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/)|youtu\.be/)([A-Za-z0-9_-]{11})(?:[?&\#/].*)?$#';
    return preg_match($pattern, trim($link), $m) ? $m[1] : null;
}

$id = youtube_id((string) ($_GET['url'] ?? ''));
if (!$id) fail("That doesn't look like a YouTube link. Copy it from the Share button on YouTube.");

$watch = "https://www.youtube.com/watch?v=$id";
$video = [
    'youtube_id' => $id,
    'video_url'  => $watch,
    'title'      => '',
    'channel'    => '',
    'thumbnail'  => "https://i.ytimg.com/vi/$id/hqdefault.jpg",
];

// YOUTUBE_OEMBED_URL can point somewhere else for the tests
$base = getenv('YOUTUBE_OEMBED_URL') ?: 'https://www.youtube.com/oembed';
$answer = web_get($base . '?' . http_build_query(['url' => $watch, 'format' => 'json']));
if ($answer && $answer['status'] === 404) fail("That video can't be found. It may be private or removed.", 404);
$info = $answer && $answer['status'] === 200 ? json_decode($answer['body'], true) : null;
if (is_array($info)) {
    $video['title'] = plain($info['title'] ?? '');
    $video['channel'] = plain($info['author_name'] ?? '');
}
// even without the title, the id and picture are enough to continue
send($video);
