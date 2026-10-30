<?php
/* ============================================================
 *  episodes.php: the podcast
 *
 *  GET    episodes.php                    → all episodes, newest first
 *  GET    episodes.php?slug=...           → one episode + its comments
 *  POST   episodes.php      {title, ...}  → Felipe adds one
 *  PUT    episodes.php?id=5 {note: "..."} → Felipe edits one
 *  DELETE episodes.php?id=5               → Felipe deletes one
 * ============================================================ */
require __DIR__ . '/_db.php';

const EPISODE_COLUMNS = ['number', 'slug', 'title', 'guest', 'guest_role', 'summary', 'note', 'chapters', 'length', 'photo', 'photo_pos', 'audio_url'];

// chapters are saved one per line ("2:15 Why walk it?");
// the website wants [["2:15", "Why walk it?"], ...]
function shape(array $e): array
{
    $e['chapters'] = array_map(
        fn($line) => preg_split('/\s+/', trim($line), 2) + [1 => ''],
        array_values(array_filter(preg_split('/\R/', $e['chapters'] ?? ''), 'trim'))
    );
    return $e;
}

// and back: [["2:15", "Why walk it?"]] → "2:15 Why walk it?"
function chapters_to_text(array &$data): void
{
    if (is_array($data['chapters'] ?? null)) {
        $data['chapters'] = implode("\n", array_map(fn($c) => trim(($c[0] ?? '') . ' ' . ($c[1] ?? '')), $data['chapters']));
    }
}

if (method() === 'GET') {
    if (isset($_GET['slug'])) {
        $episode = query('SELECT * FROM episodes WHERE slug = ?', [$_GET['slug']])->fetch();
        if (!$episode) fail('Episode not found', 404);
        $episode = shape($episode);
        $episode['comments'] = comments_for('episode', $episode['id']);
        send($episode);
    }
    $rows = query("SELECT e.*, (SELECT COUNT(*) FROM comments c WHERE c.item_type = 'episode' AND c.item_id = e.id) AS comment_count
                     FROM episodes e ORDER BY e.number DESC")->fetchAll();
    send(array_map('shape', $rows));
}

if (method() === 'POST') {
    only_felipe();
    $data = need(['title' => 255]) + input();
    chapters_to_text($data);
    // next episode number, unless Felipe gave one
    $data['number'] ??= (int)query('SELECT COALESCE(MAX(number), 0) + 1 FROM episodes')->fetchColumn();
    $data['slug'] = slugify($data['slug'] ?? $data['title']);
    $id = save('episodes', EPISODE_COLUMNS, $data);
    send(shape(query('SELECT * FROM episodes WHERE id = ?', [$id])->fetch()), 201);
}

if (method() === 'PUT') {
    only_felipe();
    $id = id_param();
    $data = input();
    chapters_to_text($data);
    save('episodes', EPISODE_COLUMNS, $data, $id);
    $episode = query('SELECT * FROM episodes WHERE id = ?', [$id])->fetch();
    $episode ? send(shape($episode)) : fail('Episode not found', 404);
}

if (method() === 'DELETE') {
    only_felipe();
    $id = id_param();
    query("DELETE FROM comments WHERE item_type = 'episode' AND item_id = ?", [$id]);
    $gone = query('DELETE FROM episodes WHERE id = ?', [$id])->rowCount();
    $gone ? send(['ok' => true]) : fail('Episode not found', 404);
}

fail('Method not allowed', 405);
