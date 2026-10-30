<?php
/* ============================================================
 *  index.php: open the API's address in a browser to check it works.
 *  It says whether the database answers, and lists every file.
 * ============================================================ */
require __DIR__ . '/_db.php';

$db = 'ok';
try {
    query('SELECT 1');
} catch (Throwable $e) {
    $db = 'not connected';
}

send([
    'api'      => 'La Voz del Desierto',
    'database' => $db,
    'files'    => ['register.php', 'login.php', 'account.php', 'articles.php', 'videos.php', 'songs.php', 'episodes.php', 'comments.php', 'dedications.php', 'messages.php', 'desk.php'],
]);
