<?php
/* ============================================================
 *  account.php: your own account (you must be signed in)
 *
 *  GET    account.php                         → your details + how many comments and submissions
 *  PUT    account.php  {"name": "...", "town": "...", "avatar": "..."} → change your name, town or picture
 *  PUT    account.php  {"current_password": "...", "new_password": "..."} → change password
 *  DELETE account.php  {"password": "..."}    → delete your account and your comments
 * ============================================================ */
require __DIR__ . '/_db.php';

$me = only_signed_in();

// the full row, with the hash, only for checking passwords here
function my_row(int $id): array
{
    return query('SELECT * FROM users WHERE id = ?', [$id])->fetch();
}

if (method() === 'GET') {
    $comments    = (int)query('SELECT COUNT(*) FROM comments WHERE user_id = ?', [$me['id']])->fetchColumn();
    $submissions = (int)query('SELECT COUNT(*) FROM submissions WHERE user_id = ?', [$me['id']])->fetchColumn();
    send(public_user($me) + ['member_since' => $me['created_at'], 'comment_count' => $comments, 'submission_count' => $submissions]);
}

if (method() === 'PUT') {
    $in = input();

    // change password: they must know the current one
    if (isset($in['new_password'])) {
        $row = my_row($me['id']);
        if (!password_verify((string)($in['current_password'] ?? ''), $row['password_hash'])) {
            sleep(1); // slows down guessing, same as login
            fail('Your current password isn\'t right.', 401);
        }
        $new = (string)$in['new_password'];               // exactly as typed: never trimmed
        check_password_rules($new, 'The new password');
        query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), $me['id']]);
        // sign out everywhere else (a stolen ticket stops working), keep this one
        query('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?', [$me['id'], token_hash(bearer_token())]);
    }

    // change name / town
    $changes = [];
    if (isset($in['name'])) {
        $name = trim((string)$in['name']);
        if ($name === '' || mb_strlen($name) > 100) fail('Name must be 1 to 100 characters.');
        $changes['name'] = $name;
    }
    if (array_key_exists('town', $in)) {
        $changes['town'] = mb_substr(trim((string)$in['town']), 0, 100) ?: null;
    }
    if (array_key_exists('avatar', $in)) {
        $changes['avatar'] = avatar_value($in['avatar']);   // null removes the picture
    }
    kind_text($changes['name'] ?? null, $changes['town'] ?? null); // no bad words in names
    if ($changes) save('users', ['name', 'town', 'avatar'], $changes, $me['id']);

    send(public_user(my_row($me['id'])));
}

if (method() === 'DELETE') {
    if ($me['role'] === 'felipe') fail('Felipe\'s account can\'t be deleted from the website.', 403);
    $row = my_row($me['id']);
    if (!password_verify((string)(input()['password'] ?? ''), $row['password_hash'])) {
        sleep(1);
        fail('That password isn\'t right.', 401);
    }
    // CASCADE in the database removes their sessions and comments too
    query('DELETE FROM users WHERE id = ?', [$me['id']]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
