<?php
/* ============================================================
 *  dedications.php: "dedicate a song"
 *
 *  GET    dedications.php                                → newest first, with song names
 *  POST   dedications.php {name, to_whom, song_id, message} → anyone sends one
 *  DELETE dedications.php?id=2                           → Felipe removes one
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() === 'GET') {
    // JOIN: each dedication together with its song's title and artist
    send(query(
        'SELECT d.id, d.name, d.to_whom, d.message, d.created_at,
                s.id AS song_id, s.title AS song_title, s.artist AS song_artist
           FROM dedications d JOIN songs s ON s.id = d.song_id
          ORDER BY d.created_at DESC
          LIMIT 50'
    )->fetchAll());
}

if (method() === 'POST') {
    $in     = need(['name' => 100, 'to_whom' => 150]);
    $songId = filter_var(input()['song_id'] ?? null, FILTER_VALIDATE_INT) ?: fail('Missing: song_id');
    $msg    = mb_substr(trim((string)(input()['message'] ?? '')), 0, 500);

    // if the song doesn't exist, the FOREIGN KEY stops it (409 from _db.php)
    query('INSERT INTO dedications (name, to_whom, song_id, message) VALUES (?, ?, ?, ?)', [$in['name'], $in['to_whom'], $songId, $msg]);
    $id = (int)db()->lastInsertId();
    send(query(
        'SELECT d.id, d.name, d.to_whom, d.message, d.created_at, s.id AS song_id, s.title AS song_title, s.artist AS song_artist
           FROM dedications d JOIN songs s ON s.id = d.song_id WHERE d.id = ?',
        [$id]
    )->fetch(), 201);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM dedications WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Dedication not found', 404);
}

fail('Method not allowed', 405);
