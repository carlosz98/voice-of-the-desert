<?php
/* ============================================================
 *  messages.php: "Write to Felipe"
 *
 *  POST   messages.php  {name, message}   → anyone writes to him
 *  GET    messages.php                    → Felipe reads them (newest first)
 *  PUT    messages.php?id=3               → Felipe marks one as read
 *  DELETE messages.php?id=3               → Felipe deletes one
 *
 *  Visitors can SEND but never READ messages.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() === 'POST') {
    $in = need(['name' => 100, 'message' => 3000]);
    query('INSERT INTO messages (name, message) VALUES (?, ?)', [$in['name'], $in['message']]);
    send(['ok' => true], 201);
}

if (method() === 'GET') {
    only_felipe();
    send(query('SELECT * FROM messages ORDER BY created_at DESC')->fetchAll());
}

if (method() === 'PUT') {
    only_felipe();
    $done = query('UPDATE messages SET is_read = TRUE WHERE id = ?', [id_param()])->rowCount();
    send(['ok' => true]);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM messages WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Message not found', 404);
}

fail('Method not allowed', 405);
