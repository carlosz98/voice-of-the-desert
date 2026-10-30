-- ============================================================
--  Practice queries. These are the same kinds of questions the
--  PHP API (step 2) will ask the database. Try them one by one.
-- ============================================================
USE voz_del_desierto;

-- 1. SELECT: read. The news page, newest first.
SELECT id, title, category, published_at
FROM articles
ORDER BY published_at DESC;

-- 2. WHERE: filter. Only the "Music" stories.
SELECT title FROM articles WHERE category = 'Music';

-- 3. One article by its web address (the article page).
SELECT * FROM articles WHERE slug = 'caballos-salvajes';

-- 4. The comments for article 1, oldest first.
SELECT name, text, is_felipe, created_at
FROM comments
WHERE item_type = 'article' AND item_id = 1
ORDER BY created_at;

-- 5. JOIN: put two tables together.
--    Each dedication with the name of its song.
SELECT d.name, d.to_whom, s.title AS song, s.artist
FROM dedications d
JOIN songs s ON s.id = d.song_id;

-- 6. COUNT + GROUP BY: how many comments each article has.
SELECT a.title, COUNT(c.id) AS total_comments
FROM articles a
LEFT JOIN comments c ON c.item_type = 'article' AND c.item_id = a.id
GROUP BY a.id
ORDER BY total_comments DESC;

-- 7. INSERT: write. A visitor leaves a comment.
INSERT INTO comments (item_type, item_id, name, text)
VALUES ('article', 1, 'Carlos', 'Testing the database!');

-- 8. UPDATE: change. Someone played a song.
UPDATE songs SET plays = plays + 1 WHERE id = 1;

-- 9. DELETE: remove. Felipe deletes that test comment.
DELETE FROM comments WHERE name = 'Carlos' AND text = 'Testing the database!';
