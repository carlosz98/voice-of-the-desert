<?php
/* ============================================================
 *  hello-db.php: STEP 1, PHP talking to MySQL.
 *  The smallest possible example, with nothing hidden.
 *
 *  Open it in a browser:  .../hello-db.php
 *  You get every article from the database, as JSON.
 * ============================================================ */

// 1. CONNECT PHP to MySQL.
//    PDO = "PHP Data Objects", PHP's built-in way to talk to databases.
//    It needs: where MySQL is (host), which database, the user, the password.
$pdo = new PDO(
    "mysql:host=127.0.0.1;dbname=voz_del_desierto;charset=utf8mb4", // where + which database
    getenv('DB_USER') ?: "root",                                      // user (XAMPP: root)
    getenv('DB_PASS') ?: ""                                           // password (XAMPP: empty)
);

// 2. ASK MySQL a question, in plain SQL (the same you'd type in phpMyAdmin).
$sql  = "SELECT id, title, category, published_at
           FROM articles
          ORDER BY published_at DESC";
$rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
//      ↑ run it         ↑ get ALL the rows, each as ['title' => '...', ...]

// 3. SEND the answer back as JSON, the format the website reads.
header("Content-Type: application/json; charset=utf-8");
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
