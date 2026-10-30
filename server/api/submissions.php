<?php
/* ============================================================
 *  submissions.php: what people send Felipe from "Upload"
 *
 *  Signed-in people:
 *    POST   submissions.php  {kind, title, description, link, file_name}  → send one
 *    GET    submissions.php                    → MY submissions, newest first
 *    DELETE submissions.php?id=3               → take back one of mine (only while pending)
 *
 *  Felipe:
 *    GET    submissions.php?all=1              → everyone's (add &status=pending)
 *    PUT    submissions.php?id=3  {status, felipe_note}  → approve / decline, with a note
 *    DELETE submissions.php?id=3               → remove any
 * ============================================================ */
require __DIR__ . '/_db.php';

const KINDS    = ['video', 'music', 'podcast', 'news', 'photo'];
const STATUSES = ['pending', 'approved', 'declined'];

$me = only_signed_in();   // everything here needs an account

// one submission, with who sent it (JOIN users)
function find_submission(int $id): ?array
{
    return query(
        'SELECT s.*, u.name AS sender_name, u.email AS sender_email, u.town AS sender_town
           FROM submissions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ?',
        [$id]
    )->fetch() ?: null;
}

// ---------- read ----------
if (method() === 'GET') {
    // Felipe: everyone's, optionally only one status
    if (isset($_GET['all'])) {
        only_felipe();
        $sql = 'SELECT s.*, u.name AS sender_name, u.email AS sender_email, u.town AS sender_town
                  FROM submissions s JOIN users u ON u.id = s.user_id';
        $params = [];
        if (!empty($_GET['status'])) {
            one_of(['status' => $_GET['status']], 'status', STATUSES);
            $sql .= ' WHERE s.status = ?';
            $params[] = $_GET['status'];
        }
        // pending first, then newest
        send(query($sql . " ORDER BY s.status = 'pending' DESC, s.created_at DESC", $params)->fetchAll());
    }

    // everyone else: only their own
    send(query('SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC', [$me['id']])->fetchAll());
}

// ---------- send one ----------
if (method() === 'POST') {
    $in   = input();
    $data = need(['title' => 200, 'kind' => 20]);
    one_of($data, 'kind', KINDS);

    $description = mb_substr(trim((string)($in['description'] ?? '')), 0, 3000) ?: null;
    $link        = trim((string)($in['link'] ?? '')) ?: null;
    $fileName    = mb_substr(trim((string)($in['file_name'] ?? '')), 0, 255) ?: null;

    // a link must really be a web address
    if ($link && (!filter_var($link, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $link) || strlen($link) > 500)) {
        fail('That link doesn\'t look right. It should start with https://');
    }
    if (!$link && !$fileName) fail('Add a file or a link.');

    // no more than 10 a day per person, so nobody floods Felipe
    $today = (int)query('SELECT COUNT(*) FROM submissions WHERE user_id = ? AND created_at > UTC_TIMESTAMP() - INTERVAL 1 DAY', [$me['id']])->fetchColumn();
    if ($today >= 10) fail('You\'ve sent 10 today. Please try again tomorrow.', 429);

    query(
        'INSERT INTO submissions (user_id, kind, title, description, link, file_name) VALUES (?, ?, ?, ?, ?, ?)',
        [$me['id'], $data['kind'], $data['title'], $description, $link, $fileName]
    );
    send(find_submission((int)db()->lastInsertId()), 201);
}

// ---------- Felipe reviews one ----------
if (method() === 'PUT') {
    only_felipe();
    $id = id_param();
    if (!find_submission($id)) fail('Submission not found', 404);

    $in = input();
    one_of($in, 'status', STATUSES);
    $changes = [];
    if (isset($in['status'])) $changes['status'] = $in['status'];
    if (array_key_exists('felipe_note', $in)) $changes['felipe_note'] = mb_substr(trim((string)$in['felipe_note']), 0, 2000) ?: null;
    if (!$changes) fail('Nothing to save');

    save('submissions', ['status', 'felipe_note'], $changes, $id);
    query('UPDATE submissions SET reviewed_at = IF(status = \'pending\', NULL, UTC_TIMESTAMP()) WHERE id = ?', [$id]);
    send(find_submission($id));
}

// ---------- take one back ----------
if (method() === 'DELETE') {
    $id = id_param();
    $s = find_submission($id);
    if (!$s) fail('Submission not found', 404);

    if ($me['role'] !== 'felipe') {
        if ((int)$s['user_id'] !== (int)$me['id']) fail('You can only remove your own submissions.', 403);
        if ($s['status'] !== 'pending')           fail('Felipe already reviewed this one, so it can\'t be removed.', 409);
    }
    query('DELETE FROM submissions WHERE id = ?', [$id]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
