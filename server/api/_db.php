<?php
/* ============================================================
 *  _db.php: shared by every API file.
 *  Every other file starts with:  require __DIR__ . '/_db.php';
 *
 *  It does five things:
 *    1. Lets the website (on GitHub Pages) talk to this API (CORS)
 *    2. Connects to MySQL (db(), query())
 *    3. Sends answers back as JSON (send(), fail())
 *    4. Reads what the website sent (input(), need())
 *    5. Knows who is signed in (current_user(), felipe(), only_...())
 * ============================================================ */


/* ---------- 1. CORS: which websites may call this API ----------
 * Browsers block a page on one address (github.io) from calling an
 * API on another address (our server) unless the API says it's ok. */
$allowed = explode(',', getenv('ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://localhost:4173,http://localhost:4176,https://carlosz98.github.io');
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

/* Security headers on every answer:
 *   nosniff      → the browser treats our answer only as JSON, never as a script
 *   DENY         → nobody can put the API inside a hidden frame on another site
 *   no-referrer  → our addresses aren't leaked to other sites
 *   no-store     → answers with personal data (your account, Felipe's messages)
 *                  are never saved in a browser or proxy cache */
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

// the browser "asks first" with OPTIONS before a POST; just say yes
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


/* ---------- 2. The database connection ----------
 * The settings come from "environment variables", so the same code
 * works on your computer (XAMPP) and on Google Cloud.
 * If none are set, it uses XAMPP's defaults (root, no password). */
function db(): PDO
{
    static $pdo = null;            // connect only once per request
    if ($pdo) return $pdo;

    $name   = getenv('DB_NAME') ?: 'voz_del_desierto';
    $user   = getenv('DB_USER') ?: 'root';
    $pass   = getenv('DB_PASS') ?: '';
    $socket = getenv('DB_SOCKET'); // on Cloud Run: /cloudsql/PROJECT:REGION:INSTANCE

    $dsn = $socket
        ? "mysql:unix_socket=$socket;dbname=$name;charset=utf8mb4"
        : 'mysql:host=' . (getenv('DB_HOST') ?: '127.0.0.1') . ';port=' . (getenv('DB_PORT') ?: '3306') . ";dbname=$name;charset=utf8mb4";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // errors become exceptions
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // rows come back as ['title' => ...]
        PDO::ATTR_EMULATE_PREPARES   => false,                  // real prepared statements (numbers stay numbers)
    ]);
    $pdo->exec("SET time_zone = '+00:00'"); // store and send every date in UTC
    return $pdo;
}

// Run a query safely. The ? or :name marks get filled with $params,
// so a visitor can never sneak SQL into our queries (SQL injection).
function query(string $sql, array $params = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}


/* ---------- 3. Answers ---------- */
function send($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    send(['error' => $message], $status);
}

// If anything breaks, answer with JSON instead of a PHP error page
set_exception_handler(function (Throwable $e) {
    if ($e instanceof PDOException && $e->getCode() === '23000') {
        fail('That already exists, or it points to something that does not exist.', 409);
    }
    error_log($e);                 // full details go to the server log only
    fail('Server error', 500);
});


/* ---------- 4. Reading what the website sent ---------- */
function method(): string
{
    return $_SERVER['REQUEST_METHOD'];
}

// The JSON body of a POST or PUT, as an array
function input(): array
{
    static $data = null;
    if ($data === null) {
        $data = json_decode(file_get_contents('php://input') ?: '[]', true);
        if (!is_array($data)) fail('Send JSON');
    }
    return $data;
}

// Make sure these fields were sent and aren't too long. Returns them trimmed.
//   need(['name' => 100, 'text' => 2000])  → max length of each
function need(array $fields): array
{
    $in = input();
    $out = [];
    foreach ($fields as $field => $max) {
        $value = trim((string)($in[$field] ?? ''));
        if ($value === '') fail("Missing: $field");
        if (mb_strlen($value) > $max) fail("Too long: $field (max $max)");
        $out[$field] = $value;
    }
    return $out;
}

/* ---------- Kind words: the bad-word filter ----------
 * kind_text($comment, $name, ...) stops with a polite 400 if any of the
 * texts has a word from _words.json. Nothing is saved when that happens.
 * Felipe's own writing is not checked.
 *
 * To catch tricks, each text is first "normalized":
 *   "¡PUTA!" → "puta"    (lowercase, no accents)
 *   "put4"   → "puta"    (numbers and symbols that look like letters)
 *   "p u t a", "p.u.t.a" → "puta"  (single letters split apart)
 * and each word is checked as written AND with repeated letters
 * squeezed ("puuuuta" → "puta"). Whole words only, so "computadora"
 * or "disputa" are fine even though they contain "puta". */
function kind_normalize(string $text): string
{
    $text = mb_strtolower($text, 'UTF-8');
    $text = strtr($text, [
        'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a', 'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
        'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i', 'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o',
        'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u', 'ñ' => 'n', 'ç' => 'c',
        '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't', '@' => 'a', '$' => 's',
    ]);
    // "p u t a", "p.u.t.a", "p-u-t-a": 3 or more single letters in a row → one word
    return preg_replace_callback(
        '/(?<!\p{L})\p{L}(?:[\s.\-_*·]+\p{L}(?!\p{L})){2,}/u',
        fn($m) => preg_replace('/[^\p{L}]/u', '', $m[0]),
        $text
    );
}

function kind_words(): array
{
    static $words = null;
    if ($words === null) {
        $raw = json_decode(file_get_contents(__DIR__ . '/_words.json'), true);
        $words = [];
        foreach (['exact', 'prefix', 'contains'] as $kind) {
            $words[$kind] = array_map(fn($w) => kind_normalize($w), $raw[$kind] ?? []);
        }
    }
    return $words;
}

// true if the text has a word from the list
function has_bad_word(string $text): bool
{
    $w = kind_words();
    $text = kind_normalize($text);
    foreach ($w['contains'] as $bad) {             // emoji like 🖕, or "fuck" inside any word
        if ($bad !== '' && mb_strpos($text, $bad) !== false) return true;
    }
    foreach (preg_split('/[^\p{L}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY) as $word) {
        $squeezed = preg_replace('/(\p{L})\1+/u', '$1', $word);   // "puuuuta" → "puta"
        foreach ([$word, $squeezed] as $form) {
            if (in_array($form, $w['exact'], true)) return true;
            foreach ($w['prefix'] as $start) {
                if ($start !== '' && str_starts_with($form, $start)) return true;
            }
            foreach ($w['contains'] as $bad) {
                if ($bad !== '' && str_contains($form, $bad)) return true;
            }
        }
    }
    return false;
}

function kind_text(?string ...$texts): void
{
    if (felipe()) return; // Felipe's own words aren't filtered
    foreach ($texts as $text) {
        if ($text !== null && $text !== '' && has_bad_word($text)) {
            fail('Please keep it kind: your text has a word we don\'t allow here. Please change it and try again.', 422);
        }
    }
}

/* ---------- Profile pictures ----------
 * avatar_value($v) checks what the website sent for a picture:
 *   null / ""             → no picture (initials are shown)
 *   "preset:cactus"       → one of the site's drawings
 *   "data:image/...;base64,..." → a small photo. It must really be an image
 *                           (PHP opens it to check), at most 512×512 and 100 KB.
 * Anything else is refused, so nobody can sneak in a script or a huge file. */
const AVATAR_PRESETS = ['cactus', 'sun', 'mountain', 'guitar', 'bird', 'moon', 'coffee', 'cross'];

function avatar_value($v): ?string
{
    if ($v === null || $v === '') return null;
    if (!is_string($v)) fail('That picture can\'t be used.');
    if (preg_match('/^preset:([a-z]+)$/', $v, $m)) {
        if (!in_array($m[1], AVATAR_PRESETS, true)) fail('That picture can\'t be used.');
        return $v;
    }
    if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $v, $m)) fail('That picture can\'t be used.');
    $bytes = base64_decode($m[2], true);
    if ($bytes === false || strlen($bytes) > 100 * 1024) fail('That picture is too big.');
    $info = @getimagesizefromstring($bytes);       // is it really an image?
    if (!$info || !in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) fail('That picture can\'t be used.');
    if ($info[0] > 512 || $info[1] > 512) fail('That picture is too big.');
    return $v;
}

// The value must be one from the list (for ENUM columns like genre)
//   one_of($data, 'genre', ['Norteño', 'Bolero', ...])
function one_of(array $data, string $field, array $allowed): void
{
    if (isset($data[$field]) && !in_array($data[$field], $allowed, true)) {
        fail("$field must be one of: " . implode(', ', $allowed));
    }
}

// A number from the address (?id=3), or stop with an error
function id_param(string $name = 'id'): int
{
    $id = filter_var($_GET[$name] ?? null, FILTER_VALIDATE_INT);
    if (!$id) fail("Missing: $name");
    return $id;
}

// "The Night Market!" → "the-night-market"
function slugify(string $text): string
{
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text); // á → a, ñ → n
    $text = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $text), '-'));
    return substr($text, 0, 100) ?: 'post-' . time();
}

// INSERT (no $id) or UPDATE (with $id) using only the allowed columns.
// The column names come from OUR list, never from the visitor, and the
// VALUES always travel separately as :placeholders (no SQL injection).
function save(string $table, array $columns, array $data, ?int $id = null): int
{
    // second lock: a table or column name can only be plain lowercase letters and _
    foreach (array_merge([$table], $columns) as $name) {
        if (!preg_match('/^[a-z_]+$/', $name)) throw new LogicException("Bad SQL name: $name");
    }
    $values = array_intersect_key($data, array_flip($columns));
    if (!$values) fail('Nothing to save');

    if ($id) {
        $set = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($values)));
        query("UPDATE $table SET $set WHERE id = :id", $values + ['id' => $id]);
        return $id;
    }
    $cols  = implode(', ', array_keys($values));
    $marks = ':' . implode(', :', array_keys($values));
    query("INSERT INTO $table ($cols) VALUES ($marks)", $values);
    return (int)db()->lastInsertId();
}


/* ---------- 5. Who is signed in? ----------
 * After signing in, the website sends with every request:
 *     Authorization: Bearer <token>
 * We look that token up in the sessions table.
 *
 *   current_user()    → the signed-in person, or null
 *   felipe()          → Felipe if he's the one signed in, or null
 *   only_signed_in()  → stop with 401 unless someone is signed in
 *   only_felipe()     → stop with 401/403 unless it's Felipe
 */

// The token from the Authorization header, or null
function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    return preg_match('/^Bearer\s+([a-f0-9]{64})$/', $header, $m) ? $m[1] : null;
}

// The database only keeps a sha256 HASH of each ticket (see 01_schema.sql),
// so a copy of the sessions table can't be used to sign in as anyone.
function token_hash(string $token): string
{
    return hash('sha256', $token);
}

function current_user(): ?array
{
    static $checked = false, $user = null;
    if ($checked) return $user;
    $checked = true;

    $token = bearer_token();
    if (!$token) return null;

    $user = query(
        'SELECT u.id, u.name, u.email, u.role, u.town, u.avatar, u.created_at
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()',
        [token_hash($token)]
    )->fetch() ?: null;
    return $user;
}

// Passwords: 8 to 72 characters. bcrypt (what password_hash() uses)
// only looks at the first 72 bytes, so longer ones are refused instead
// of being quietly cut.
function check_password_rules(string $password, string $which = 'The password'): void
{
    if (mb_strlen($password) < 8) fail("$which needs at least 8 characters.");
    if (strlen($password) > 72)   fail("$which can be at most 72 characters.");
}

function felipe(): ?array
{
    $user = current_user();
    return ($user && $user['role'] === 'felipe') ? $user : null;
}

function only_signed_in(): array
{
    return current_user() ?? fail('Please sign in first.', 401);
}

function only_felipe(): array
{
    $user = only_signed_in();
    if ($user['role'] !== 'felipe') fail('Only Felipe can do this.', 403);
    return $user;
}

// Sign someone in: make a random ticket, save it, send it back.
// 32 random bytes = 64 hex characters, impossible to guess.
function start_session(array $user): void
{
    $token = bin2hex(random_bytes(32));
    $days  = $user['role'] === 'felipe' ? 7 : 30;   // Felipe's ticket expires sooner (it can do more)
    // the browser gets the ticket; the database only gets its hash
    query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ? DAY)', [token_hash($token), $user['id'], $days]);
    query('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [$user['id']]);
    query('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()'); // tidy up old tickets

    send(['token' => $token, 'user' => public_user($user)], 201);
}

// What the website may see about a user (never the password hash)
function public_user(array $u): array
{
    return [
        'id'    => (int)$u['id'],
        'name'  => $u['name'],
        'email' => $u['email'],
        'role'  => $u['role'],
        'town'  => $u['town'] ?? null,
        'avatar' => $u['avatar'] ?? null,
        'member_since' => $u['created_at'] ?? null, // "Miembro desde..."
    ];
}

// Comments for one article / video / episode, oldest first
function comments_for(string $type, int $id): array
{
    return query(
        'SELECT c.id, c.user_id, c.name, c.text, c.is_felipe, c.created_at, u.avatar
           FROM comments c LEFT JOIN users u ON u.id = c.user_id   -- the writer\'s picture
          WHERE c.item_type = ? AND c.item_id = ?
          ORDER BY c.created_at, c.id',
        [$type, $id]
    )->fetchAll();
}
