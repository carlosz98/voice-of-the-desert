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
 *    - password 8 to 72 characters, saved only as a hash
 *    - everyone who registers is a normal 'user'.
 *      Nobody can make themselves 'felipe' from here.
 * ============================================================ */
require __DIR__ . '/_db.php';

if (method() !== 'POST') fail('Method not allowed', 405);

$in       = need(['name' => 100, 'email' => 150]);
$email    = strtolower($in['email']);
$password = (string)(input()['password'] ?? '');   // exactly as typed: never trimmed
$town     = mb_substr(trim((string)(input()['town'] ?? '')), 0, 100) ?: null;

if ($password === '') fail('Missing: password');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('That email doesn\'t look right.');
check_password_rules($password);
if (query('SELECT 1 FROM users WHERE email = ?', [$email])->fetch()) {
    fail('There is already an account with that email. Try signing in.', 409);
}

// password_hash() turns the password into a bcrypt hash we can store safely.
// role is written here as 'user' by us: it never comes from the visitor.
query(
    "INSERT INTO users (name, email, password_hash, role, town) VALUES (?, ?, ?, 'user', ?)",
    [$in['name'], $email, password_hash($password, PASSWORD_DEFAULT), $town]
);
$user = query('SELECT * FROM users WHERE id = ?', [(int)db()->lastInsertId()])->fetch();

start_session($user); // sends { token, user }
