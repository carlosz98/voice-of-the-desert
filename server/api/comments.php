<?php
/* ============================================================
 *  comments.php: comments on articles, videos and episodes
 *
 *  GET    comments.php?type=article&id=1   → the comments (anyone can read)
 *  POST   comments.php  {type, id, text}   → signed-in people comment
 *  DELETE comments.php?id=40               → delete your own comment
 *                                            (Felipe can delete any)
 *
 *  The name comes from the account, so nobody can pretend to be
 *  someone else. Felipe's comments get his gold "host" badge.
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
    $me     = only_signed_in();               // you need an account to comment
    $in     = input();
    $type   = type_param($in['type'] ?? null);
    $itemId = filter_var($in['id'] ?? null, FILTER_VALIDATE_INT) ?: fail('Missing: id');

    // make sure the article/video/episode exists
    $table = TABLES[$type];
    if (!query("SELECT 1 FROM $table WHERE id = ?", [$itemId])->fetch()) fail('Not found', 404);

    $text = need(['text' => 2000])['text'];

    query(
        'INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe) VALUES (?, ?, ?, ?, ?, ?)',
        [$type, $itemId, $me['id'], $me['name'], $text, $me['role'] === 'felipe' ? 1 : 0]
    );
    $id = (int)db()->lastInsertId();
    send(query('SELECT id, user_id, name, text, is_felipe, created_at FROM comments WHERE id = ?', [$id])->fetch(), 201);
}

if (method() === 'DELETE') {
    $me = only_signed_in();
    $id = id_param();
    $comment = query('SELECT id, user_id FROM comments WHERE id = ?', [$id])->fetch();
    if (!$comment) fail('Comment not found', 404);

    // only the person who wrote it, or Felipe
    if ($me['role'] !== 'felipe' && (int)$comment['user_id'] !== (int)$me['id']) {
        fail('You can only delete your own comments.', 403);
    }
    query('DELETE FROM comments WHERE id = ?', [$id]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
