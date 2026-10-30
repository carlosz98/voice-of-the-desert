<?php
/* ============================================================
 *  songs.php: the music page
 *
 *  GET    songs.php                     → all songs, newest first
 *  GET    songs.php?genre=Bolero        → one genre
 *  POST   songs.php?id=4&play=1         → anyone: count one play
 *  POST   songs.php      {title, ...}   → Felipe adds one
 *  PUT    songs.php?id=4 {album: "..."} → Felipe edits one
 *  DELETE songs.php?id=4                → Felipe deletes one
 * ============================================================ */
require __DIR__ . '/_db.php';

const SONG_COLUMNS = ['title', 'artist', 'album', 'genre', 'length_seconds', 'plays', 'photo', 'photo_pos', 'audio_url'];
const GENRES = ['Norteño', 'Bolero', 'Corrido', 'Ranchera', 'Sacred'];

if (method() === 'GET') {
    $sql = 'SELECT * FROM songs';
    $params = [];
    if (!empty($_GET['genre'])) {
        $sql .= ' WHERE genre = ?';
        $params[] = $_GET['genre'];
    }
    send(query($sql . ' ORDER BY added_at DESC', $params)->fetchAll());
}

if (method() === 'POST') {
    // a visitor pressed play: add 1 (nothing else can be changed this way)
    if (isset($_GET['play'])) {
        $id = id_param();
        query('UPDATE songs SET plays = plays + 1 WHERE id = ?', [$id]);
        send(query('SELECT id, plays FROM songs WHERE id = ?', [$id])->fetch() ?: fail('Song not found', 404));
    }

    only_felipe();
    $data = need(['title' => 150, 'artist' => 150, 'genre' => 20]) + input();
    $data['length_seconds'] = (int)($data['length_seconds'] ?? 0);
    one_of($data, 'genre', GENRES);
    $id = save('songs', SONG_COLUMNS, $data);
    send(query('SELECT * FROM songs WHERE id = ?', [$id])->fetch(), 201);
}

if (method() === 'PUT') {
    only_felipe();
    $id = id_param();
    one_of(input(), 'genre', GENRES);
    save('songs', SONG_COLUMNS, input(), $id);
    $song = query('SELECT * FROM songs WHERE id = ?', [$id])->fetch();
    $song ? send($song) : fail('Song not found', 404);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM songs WHERE id = ?', [id_param()])->rowCount(); // its dedications go too (CASCADE)
    $gone ? send(['ok' => true]) : fail('Song not found', 404);
}

fail('Method not allowed', 405);
