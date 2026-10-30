<?php
/* ============================================================
 *  desk.php: "From Felipe's desk", his short notes
 *
 *  GET    desk.php                    → latest 20, newest first
 *  POST   desk.php  {text, kind, ...} → Felipe posts a note
 *  DELETE desk.php?id=4               → Felipe deletes one
 * ============================================================ */
require __DIR__ . '/_db.php';
const KINDS = ['note', 'shared', 'music', 'podcast', 'photo'];

if (method() === 'GET') {
    send(query('SELECT * FROM desk_notes ORDER BY created_at DESC LIMIT 20')->fetchAll());
}

if (method() === 'POST') {
    only_felipe();
    $data = need(['text' => 1000]) + input();
    $data['kind'] ??= 'note';
    one_of($data, 'kind', KINDS);
    $id = save('desk_notes', ['kind', 'text', 'meta', 'photo'], $data);
    send(query('SELECT * FROM desk_notes WHERE id = ?', [$id])->fetch(), 201);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM desk_notes WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Note not found', 404);
}

fail('Method not allowed', 405);
