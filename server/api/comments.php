<?php
/* ============================================================
 *  comments.php: comments on articles, videos and episodes
 *
 *  GET    comments.php?type=article&id=1   → the comments (anyone can read)
 *  GET    comments.php?recent=1            → Felipe: the latest 30 from readers
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
    // Felipe's panel: the latest 30 comments from readers, everywhere,
    // with the title of what they commented on (LEFT JOIN, one per table)
    if (isset($_GET['recent'])) {
        only_felipe();
        send(query(
            "SELECT c.id, c.item_type, c.item_id, c.user_id, c.name, c.text, c.created_at,
                    COALESCE(a.title, v.title, e.title) AS item_title,
                    COALESCE(a.slug,  v.slug,  e.slug)  AS item_slug
               FROM comments c
               LEFT JOIN articles a ON c.item_type = 'article' AND a.id = c.item_id
               LEFT JOIN videos   v ON c.item_type = 'video'   AND v.id = c.item_id
               LEFT JOIN episodes e ON c.item_type = 'episode' AND e.id = c.item_id
              WHERE c.is_felipe = FALSE
              ORDER BY c.created_at DESC, c.id DESC
              LIMIT 30"
        )->fetchAll());
    }
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
    kind_text($text);                         // no bad words (_words.json)

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
