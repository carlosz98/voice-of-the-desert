<?php
/* ============================================================
 *  login.php: sign in and out (everyone, Felipe too)
 *
 *  POST   login.php   {"email": "...", "password": "..."}  → sign in, get a token
 *  GET    login.php   (with the token)                      → "who am I?"
 *  DELETE login.php   (with the token)                      → sign out
 *
 *  Why POST and not GET for signing in: GET puts the data in the
 *  web address (login.php?password=...), which browsers keep in
 *  their history and servers write to their logs. POST sends it
 *  inside the request, and HTTPS encrypts it on the way.
 *
 *  The answer says the person's role. If it's 'felipe', the
 *  website shows "Mi panel".
 * ============================================================ */
require __DIR__ . '/_db.php';

const MAX_TRIES   = 5;   // wrong passwords allowed...
const LOCK_MINUTES = 15; // ...in this many minutes, then the email is locked this long

// ---------- sign in ----------
if (method() === 'POST') {
    $email    = strtolower(need(['email' => 150])['email']);
    $password = (string)(input()['password'] ?? '');   // exactly as typed: never trimmed
    if ($password === '') fail('Missing: password');
    if (strlen($password) > 200) fail('Wrong email or password', 401);

    // 1. Too many wrong tries for this email lately? Stop here, before
    //    even checking the password, so guessing can't continue.
    $tries = (int)query(
        'SELECT COUNT(*) FROM login_attempts WHERE email = ? AND created_at > UTC_TIMESTAMP() - INTERVAL ? MINUTE',
        [$email, LOCK_MINUTES]
    )->fetchColumn();
    if ($tries >= MAX_TRIES) {
        fail('Too many wrong tries. For your safety, wait 15 minutes and try again.', 429);
    }

    // 2. Find the account and check the password against its hash.
    //    password_verify() hashes what was typed and compares.
    $user = query('SELECT * FROM users WHERE email = ?', [$email])->fetch();

    // Same message for "no such email" and "wrong password", so nobody
    // can use this to find out who has an account.
    if (!$user || !password_verify($password, $user['password_hash'])) {
        query('INSERT INTO login_attempts (email) VALUES (?)', [$email]); // count this wrong try
        sleep(1);                                                        // and slow the next one down
        fail('Wrong email or password', 401);
    }

    // 3. Right password: forget the wrong tries, tidy up old ones.
    query('DELETE FROM login_attempts WHERE email = ? OR created_at < UTC_TIMESTAMP() - INTERVAL 1 DAY', [$email]);

    // If PHP's default hashing ever gets stronger, upgrade this hash now
    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    start_session($user); // sends { token, user }
}

// ---------- who am I ----------
if (method() === 'GET') {
    send(public_user(only_signed_in()));
}

// ---------- sign out: this ticket stops working ----------
if (method() === 'DELETE') {
    only_signed_in();
    query('DELETE FROM sessions WHERE token_hash = ?', [token_hash(bearer_token())]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
