<?php
/* ============================================================
 *  _db.php: shared by every API file.
 *  Every other file starts with:  require __DIR__ . '/_db.php';
 *
 *  It does five things:
 *    1. Lets the website (on GitHub Pages) talk to this API (CORS)
 *    2. Connects to MySQL (db())
 *    3. Sends answers back as JSON (send(), fail())
 *    4. Reads what the website sent (input(), need())
 *    5. Checks if the visitor is Felipe (felipe(), only_felipe())
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
// The column names come from OUR list, never from the visitor.
function save(string $table, array $columns, array $data, ?int $id = null): int
{
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


/* ---------- 5. Is this Felipe? ----------
 * After login, the website sends:  Authorization: Bearer <token>
 * We look that token up in admin_tokens. */
function felipe(): ?array
{
    static $checked = false, $admin = null;
    if ($checked) return $admin;
    $checked = true;

    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/', $header, $m)) return null;

    $admin = query(
        'SELECT a.id, a.name, a.email
           FROM admin_tokens t JOIN admins a ON a.id = t.admin_id
          WHERE t.token = ? AND t.expires_at > UTC_TIMESTAMP()',
        [$m[1]]
    )->fetch() ?: null;
    return $admin;
}

// Use at the top of anything only Felipe may do
function only_felipe(): array
{
    return felipe() ?? fail('Only Felipe can do this. Please sign in.', 401);
}

// Comments for one article / video / episode, oldest first
function comments_for(string $type, int $id): array
{
    return query(
        'SELECT id, name, text, is_felipe, created_at
           FROM comments WHERE item_type = ? AND item_id = ?
          ORDER BY created_at, id',
        [$type, $id]
    )->fetchAll();
}
