<?php
/* ============================================================
 *  avatars.php: Felipe removes someone's profile picture
 *
 *  DELETE avatars.php?user=12   → Felipe only: that person's picture is
 *                                  removed (their initials show instead)
 *
 *  People change or remove their own picture on account.php.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() === 'DELETE') {
    only_felipe();
    $gone = query('UPDATE users SET avatar = NULL WHERE id = ? AND avatar IS NOT NULL', [id_param('user')])->rowCount();
    $gone ? send(['ok' => true]) : fail('No picture to remove', 404);
}

fail('Method not allowed', 405);
