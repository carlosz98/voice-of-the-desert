<?php
/* ============================================================
 *  articles.php: the news
 *
 *  GET    articles.php                       → all articles, newest first
 *  GET    articles.php?category=Music        → only one topic
 *  GET    articles.php?q=horses              → search title and summary
 *  GET    articles.php?slug=caballos-salvajes→ one article + its comments
 *  POST   articles.php        {title, ...}   → Felipe adds one
 *  PUT    articles.php?id=3   {take: "..."}  → Felipe edits one
 *  DELETE articles.php?id=3                  → Felipe deletes one
 * ============================================================ */
require __DIR__ . '/_db.php';

// columns Felipe is allowed to fill in
const ARTICLE_COLUMNS = ['slug', 'category', 'title', 'summary', 'body', 'source', 'take', 'long_take', 'photo', 'photo_pos', 'read_minutes', 'is_lead'];
const CATEGORIES = ['Local', 'Music', 'Culture', 'Nature', 'Faith'];

// body is saved as one text with blank lines between paragraphs;
// the website wants a list of paragraphs
function shape(array $a): array
{
    if (isset($a['body'])) $a['body'] = array_values(array_filter(preg_split('/\R\s*\R/', $a['body'])));
    return $a;
}

// ---------- read ----------
if (method() === 'GET') {

    // one article, with its comments
    if (isset($_GET['slug'])) {
        $article = query('SELECT * FROM articles WHERE slug = ?', [$_GET['slug']])->fetch();
        if (!$article) fail('Article not found', 404);
        $article = shape($article);
        $article['comments'] = comments_for('article', $article['id']);
        send($article);
    }

    // the list, built up step by step
    $sql = 'SELECT a.id, a.slug, a.category, a.title, a.summary, a.source, a.take, a.photo, a.photo_pos,
                   a.read_minutes, a.is_lead, a.published_at,
                   (SELECT COUNT(*) FROM comments c WHERE c.item_type = \'article\' AND c.item_id = a.id) AS comment_count
              FROM articles a WHERE 1 = 1';
    $params = [];
    if (!empty($_GET['category'])) {
        $sql .= ' AND a.category = ?';
        $params[] = $_GET['category'];
    }
    if (!empty($_GET['q'])) {
        $sql .= ' AND (a.title LIKE ? OR a.summary LIKE ?)';
        $params[] = '%' . $_GET['q'] . '%';
        $params[] = '%' . $_GET['q'] . '%';
    }
    $sql .= ' ORDER BY a.published_at DESC';
    send(query($sql, $params)->fetchAll());
}

// ---------- Felipe adds one ----------
if (method() === 'POST') {
    only_felipe();
    $data = need(['title' => 255, 'summary' => 5000, 'category' => 20]) + input();
    if (is_array($data['body'] ?? null)) $data['body'] = implode("\n\n", $data['body']);
    $data['body'] ??= '';
    $data['slug'] = slugify($data['slug'] ?? $data['title']);

    one_of($data, 'category', CATEGORIES);

    $id = save('articles', ARTICLE_COLUMNS, $data);
    send(shape(query('SELECT * FROM articles WHERE id = ?', [$id])->fetch()), 201);
}

// ---------- Felipe edits one ----------
if (method() === 'PUT') {
    only_felipe();
    $id = id_param();
    $data = input();
    if (is_array($data['body'] ?? null)) $data['body'] = implode("\n\n", $data['body']);
    one_of($data, 'category', CATEGORIES);
    save('articles', ARTICLE_COLUMNS, $data, $id);
    $article = query('SELECT * FROM articles WHERE id = ?', [$id])->fetch();
    $article ? send(shape($article)) : fail('Article not found', 404);
}

// ---------- Felipe deletes one (and its comments) ----------
if (method() === 'DELETE') {
    only_felipe();
    $id = id_param();
    query("DELETE FROM comments WHERE item_type = 'article' AND item_id = ?", [$id]);
    $gone = query('DELETE FROM articles WHERE id = ?', [$id])->rowCount();
    $gone ? send(['ok' => true]) : fail('Article not found', 404);
}

fail('Method not allowed', 405);
