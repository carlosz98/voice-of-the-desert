<?php
/* ============================================================
 *  videos.php: the videos page
 *
 *  GET    videos.php                     → all videos, newest first
 *  GET    videos.php?from=felipe         → only Felipe's (or =community)
 *  GET    videos.php?slug=...            → one video + its comments
 *  POST   videos.php      {title, ...}   → Felipe adds one
 *  PUT    videos.php?id=2 {note: "..."}  → Felipe edits one
 *  DELETE videos.php?id=2                → Felipe deletes one
 * ============================================================ */
require __DIR__ . '/_db.php';

const VIDEO_COLUMNS = ['slug', 'title', 'from_who', 'creator', 'description', 'note', 'length', 'views', 'photo', 'photo_pos', 'video_url'];
const FROM = ['felipe', 'community'];

if (method() === 'GET') {
    if (isset($_GET['slug'])) {
        $video = query('SELECT * FROM videos WHERE slug = ?', [$_GET['slug']])->fetch();
        if (!$video) fail('Video not found', 404);
        $video['comments'] = comments_for('video', $video['id']);
        send($video);
    }

    $sql = "SELECT v.*, (SELECT COUNT(*) FROM comments c WHERE c.item_type = 'video' AND c.item_id = v.id) AS comment_count
              FROM videos v WHERE 1 = 1";
    $params = [];
    if (!empty($_GET['from'])) {
        $sql .= ' AND v.from_who = ?';
        $params[] = $_GET['from'];
    }
    send(query($sql . ' ORDER BY v.published_at DESC', $params)->fetchAll());
}

if (method() === 'POST') {
    $felipe = only_felipe();
    $data = need(['title' => 255]) + input();
    $data['slug'] = slugify($data['slug'] ?? $data['title']);
    $data['creator'] ??= $felipe['name'];
    one_of($data, 'from_who', FROM);
    $id = save('videos', VIDEO_COLUMNS, $data);
    send(query('SELECT * FROM videos WHERE id = ?', [$id])->fetch(), 201);
}

if (method() === 'PUT') {
    only_felipe();
    $id = id_param();
    one_of(input(), 'from_who', FROM);
    save('videos', VIDEO_COLUMNS, input(), $id);
    $video = query('SELECT * FROM videos WHERE id = ?', [$id])->fetch();
    $video ? send($video) : fail('Video not found', 404);
}

if (method() === 'DELETE') {
    only_felipe();
    $id = id_param();
    query("DELETE FROM comments WHERE item_type = 'video' AND item_id = ?", [$id]);
    $gone = query('DELETE FROM videos WHERE id = ?', [$id])->rowCount();
    $gone ? send(['ok' => true]) : fail('Video not found', 404);
}

fail('Method not allowed', 405);
