<?php
/* ============================================================
 *  comments.php: comments on articles, videos and episodes
 *
 *  GET    comments.php?type=article&id=1          → the comments
 *  POST   comments.php  {type, id, name, text}    → anyone comments
 *  DELETE comments.php?id=40                      → Felipe removes one
 *
 *  If Felipe is signed in, his comment gets his gold "host" badge
 *  and his name automatically.
 * ============================================================ */
require __DIR__ . '/_db.php';

// which table each "type" lives in
const TABLES = ['article' => 'articles', 'video' => 'videos', 'episode' => 'episodes'];

function type_param(?string $type): string
{
    if (!isset(TABLES[$type])) fail('type must be article, video or episode');
    return $type;
}

if (method() === 'GET') {
    send(comments_for(type_param($_GET['type'] ?? null), id_param()));
}

if (method() === 'POST') {
    $in     = input();
    $type   = type_param($in['type'] ?? null);
    $itemId = filter_var($in['id'] ?? null, FILTER_VALIDATE_INT) ?: fail('Missing: id');

    // make sure the article/video/episode exists
    $table = TABLES[$type];
    if (!query("SELECT 1 FROM $table WHERE id = ?", [$itemId])->fetch()) fail('Not found', 404);

    $felipe = felipe();
    $text   = need(['text' => 2000])['text'];
    $name   = $felipe ? $felipe['name'] : need(['name' => 100])['name'];

    query(
        'INSERT INTO comments (item_type, item_id, name, text, is_felipe) VALUES (?, ?, ?, ?, ?)',
        [$type, $itemId, $name, $text, $felipe ? 1 : 0]
    );
    $id = (int)db()->lastInsertId();
    send(query('SELECT id, name, text, is_felipe, created_at FROM comments WHERE id = ?', [$id])->fetch(), 201);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM comments WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Comment not found', 404);
}

fail('Method not allowed', 405);
