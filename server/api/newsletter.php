<?php
/* ============================================================
 *  newsletter.php: "The caravan letter" (the ticket form)
 *
 *  POST   newsletter.php  {"email": "..."}   → anyone joins the list
 *  GET    newsletter.php                     → Felipe: everyone on the list
 *  DELETE newsletter.php?id=4                → Felipe removes one
 *
 *  Joining twice answers the same "you're on the list", so nobody
 *  can use this to find out whose email is already there.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() === 'POST') {
    $email = strtolower(need(['email' => 150])['email']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('That email doesn\'t look right.');
    $me = current_user();
    // INSERT IGNORE: if the email is already there (UNIQUE), nothing happens
    query('INSERT IGNORE INTO newsletter (email, user_id) VALUES (?, ?)', [$email, $me['id'] ?? null]);
    send(['ok' => true], 201);
}

if (method() === 'GET') {
    only_felipe();
    send(query('SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC')->fetchAll());
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM newsletter WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Not found', 404);
}

fail('Method not allowed', 405);
