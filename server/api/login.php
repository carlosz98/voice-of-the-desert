<?php
/* ============================================================
 *  login.php: Felipe signs in and out
 *
 *  POST   login.php   {"email": "...", "password": "..."}  → sign in, get a token
 *  GET    login.php   (with the token)                      → "who am I?"
 *  DELETE login.php   (with the token)                      → sign out
 * ============================================================ */
require __DIR__ . '/_db.php';

// ---------- sign in ----------
if (method() === 'POST') {
    $in = need(['email' => 150, 'password' => 200]);

    $admin = query('SELECT id, name, email, password_hash FROM admins WHERE email = ?', [$in['email']])->fetch();

    // password_verify() compares the typed password with the saved hash
    if (!$admin || !password_verify($in['password'], $admin['password_hash'])) {
        sleep(1); // slows down anyone trying to guess passwords
        fail('Wrong email or password', 401);
    }

    // a long random ticket: 32 random bytes = 64 hex characters
    $token = bin2hex(random_bytes(32));
    query('INSERT INTO admin_tokens (token, admin_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 7 DAY)', [$token, $admin['id']]);
    query('DELETE FROM admin_tokens WHERE expires_at < UTC_TIMESTAMP()'); // tidy up old tickets

    send(['token' => $token, 'name' => $admin['name'], 'email' => $admin['email']]);
}

// ---------- who am I ----------
if (method() === 'GET') {
    send(only_felipe());
}

// ---------- sign out ----------
if (method() === 'DELETE') {
    only_felipe();
    preg_match('/([a-f0-9]{64})/', $_SERVER['HTTP_AUTHORIZATION'], $m);
    query('DELETE FROM admin_tokens WHERE token = ?', [$m[1]]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
