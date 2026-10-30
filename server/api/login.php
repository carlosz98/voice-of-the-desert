<?php
/* ============================================================
 *  login.php: sign in and out (everyone, Felipe too)
 *
 *  POST   login.php   {"email": "...", "password": "..."}  → sign in, get a token
 *  GET    login.php   (with the token)                      → "who am I?"
 *  DELETE login.php   (with the token)                      → sign out
 *
 *  The answer says the person's role. If it's 'felipe', the
 *  website shows "Mi panel".
 * ============================================================ */
require __DIR__ . '/_db.php';

// ---------- sign in ----------
if (method() === 'POST') {
    $in = need(['email' => 150, 'password' => 200]);

    $user = query('SELECT * FROM users WHERE email = ?', [strtolower($in['email'])])->fetch();

    // password_verify() compares the typed password with the saved hash.
    // Same message for "no such email" and "wrong password", so nobody
    // can use this to find out who has an account.
    if (!$user || !password_verify($in['password'], $user['password_hash'])) {
        sleep(1); // slows down anyone trying to guess passwords
        fail('Wrong email or password', 401);
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
    query('DELETE FROM sessions WHERE token = ?', [bearer_token()]);
    send(['ok' => true]);
}

fail('Method not allowed', 405);
