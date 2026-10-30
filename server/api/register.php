<?php
/* ============================================================
 *  register.php: create an account
 *
 *  POST register.php  {"name": "Rosa M.", "email": "...", "password": "...", "town": "Delicias"}
 *     → makes the account and signs them in right away
 *       (answers with a token, same as login.php)
 *
 *  Rules:
 *    - a real-looking email, and only one account per email
 *    - password at least 8 characters
 *    - everyone who registers is a normal 'user'.
 *      Nobody can make themselves 'felipe' from here.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() !== 'POST') fail('Method not allowed', 405);

$in = need(['name' => 100, 'email' => 150, 'password' => 200]);
$email = strtolower($in['email']);
$town  = mb_substr(trim((string)(input()['town'] ?? '')), 0, 100) ?: null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('That email doesn\'t look right.');
if (mb_strlen($in['password']) < 8)            fail('The password needs at least 8 characters.');
if (query('SELECT 1 FROM users WHERE email = ?', [$email])->fetch()) {
    fail('There is already an account with that email. Try signing in.', 409);
}

// password_hash() turns the password into a hash we can store safely
query(
    "INSERT INTO users (name, email, password_hash, role, town) VALUES (?, ?, ?, 'user', ?)",
    [$in['name'], $email, password_hash($in['password'], PASSWORD_DEFAULT), $town]
);
$user = query('SELECT * FROM users WHERE id = ?', [(int)db()->lastInsertId()])->fetch();

start_session($user); // sends { token, user }
