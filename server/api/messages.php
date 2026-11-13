<?php
/* ============================================================
 *  messages.php: "Write to Felipe"
 *
 *  POST   messages.php  {name, message}   → anyone writes to him
 *                       (signed in: name comes from the account)
 *  GET    messages.php                    → Felipe reads them (newest first)
 *  PUT    messages.php?id=3               → Felipe marks one as read
 *  DELETE messages.php?id=3               → Felipe deletes one
 *
 *  Visitors can SEND but never READ messages.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() === 'POST') {
    $me      = current_user();                // may be null: no account needed
    $name    = $me ? $me['name'] : need(['name' => 100])['name'];
    $message = need(['message' => 3000])['message'];
    kind_text($name, $message);               // no bad words, even in private
    query('INSERT INTO messages (name, message, user_id) VALUES (?, ?, ?)', [$name, $message, $me['id'] ?? null]);
    send(['ok' => true], 201);
}

if (method() === 'GET') {
    only_felipe();
    // LEFT JOIN: show the sender's email when they had an account, so Felipe can reply
    send(query(
        'SELECT m.*, u.email AS sender_email, u.town AS sender_town
           FROM messages m LEFT JOIN users u ON u.id = m.user_id
          ORDER BY m.created_at DESC'
    )->fetchAll());
}

if (method() === 'PUT') {
    only_felipe();
    query('UPDATE messages SET is_read = TRUE WHERE id = ?', [id_param()]);
    send(['ok' => true]);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM messages WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Message not found', 404);
}

fail('Method not allowed', 405);
