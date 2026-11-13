<?php
/* ============================================================
 *  verses.php: Felipe's own verse of the day
 *
 *  GET    verses.php?day=2026-11-14     → anyone: that day's verse (404 if he set none)
 *  GET    verses.php?upcoming=1         → Felipe: today and the days ahead
 *  POST   verses.php {day, reference, text, reflection}  → Felipe sets a day
 *                                         (setting the same day again replaces it)
 *  DELETE verses.php?id=3               → Felipe removes one
 *
 *  Days are Chihuahua's calendar days (the website sends the date).
 * ============================================================ */
require __DIR__ . '/_db.php';

// a real date written as YYYY-MM-DD, or stop
function day_param(?string $day): string
{
    $d = DateTime::createFromFormat('!Y-m-d', (string)$day);
    if (!$d || $d->format('Y-m-d') !== $day) fail('day must look like 2026-11-14');
    return $day;
}

if (method() === 'GET') {
    if (isset($_GET['upcoming'])) {
        only_felipe();
        send(query('SELECT * FROM verses WHERE day >= ? ORDER BY day', [day_param($_GET['from'] ?? gmdate('Y-m-d', time() - 86400))])->fetchAll());
    }
    $verse = query('SELECT day, reference, text, reflection FROM verses WHERE day = ?', [day_param($_GET['day'] ?? null)])->fetch();
    $verse ? send($verse) : fail('No verse from Felipe for that day', 404);
}

if (method() === 'POST') {
    only_felipe();
    $in = need(['reference' => 80, 'text' => 2000]);
    $day = day_param(input()['day'] ?? null);
    $reflection = mb_substr(trim((string)(input()['reflection'] ?? '')), 0, 3000) ?: null;

    // one verse per day: if he already set this day, replace it
    query(
        'INSERT INTO verses (day, reference, text, reflection) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE reference = VALUES(reference), text = VALUES(text), reflection = VALUES(reflection)',
        [$day, $in['reference'], $in['text'], $reflection]
    );
    send(query('SELECT * FROM verses WHERE day = ?', [$day])->fetch(), 201);
}

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('DELETE FROM verses WHERE id = ?', [id_param()])->rowCount();
    $gone ? send(['ok' => true]) : fail('Not found', 404);
}

fail('Method not allowed', 405);
