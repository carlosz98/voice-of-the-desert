# Back end: La Voz del Desierto

We're building it in steps:

1. **Database (MySQL)** ✅ is in `database/`.
2. **PHP API** ✅ is in `api/`. Small PHP files let the website read and write the database.
3. **Google Cloud** is next. The database goes to Cloud SQL, the PHP runs on Cloud Run, and photos/audio/video go to Cloud Storage. This step uses the $300 free credit.
4. **After class: move to Firestore.** A script copies everything, we compare the counts, and only then does the site switch. Cloud SQL gets turned off after a final backup, so nothing is lost and the site stays free.

The website itself stays on GitHub Pages. GitHub Pages can't run PHP, which is why the API lives in the cloud.

---

## Run it on your computer (XAMPP)

XAMPP comes with Apache (the web server), PHP and MySQL in one installer: https://www.apachefriends.org

1. **Start XAMPP.** In the XAMPP Control Panel, press **Start** for **Apache** and **MySQL**.
2. **Create the database.** Open http://localhost/phpmyadmin, go to the **Import** tab, and import these files in order:
   1. `server/database/01_schema.sql`
   2. `server/database/02_seed.sql`
3. **Put the API where Apache can see it.** Copy the `server/api` folder into XAMPP's `htdocs` folder and rename it `voz-api`:
   - Windows: `C:\xampp\htdocs\voz-api`
   - Mac: `/Applications/XAMPP/htdocs/voz-api`
4. **Check it works.** Open http://localhost/voz-api/. You should see:
   ```json
   {"api":"La Voz del Desierto","database":"ok", ...}
   ```
   Then try http://localhost/voz-api/articles.php to see all the news as JSON.

The API uses XAMPP's default settings (user `root`, no password). On Google Cloud, the same code reads the real settings from environment variables: `DB_HOST` or `DB_SOCKET`, `DB_NAME`, `DB_USER` and `DB_PASS`.

### Run the tests

`server/tests/api-test.sh` checks every API address 55 ways, including that visitors can't do Felipe's things. It needs a terminal with bash (Mac, Linux or Git Bash on Windows):

```bash
API=http://localhost/voz-api bash server/tests/api-test.sh
```

Run it on a fresh database (import the two SQL files again first), because it checks the starting numbers.

---

## The files

### `database/`

| File | What it does |
|---|---|
| `01_schema.sql` | Creates the database and its 10 tables. Run it first. **It erases the old tables, so don't run it on the live database.** |
| `02_seed.sql` | Fills the tables with the demo content: 12 articles, 6 videos, 10 songs, 5 episodes and 31 comments. |
| `03_practice.sql` | Example queries (SELECT, JOIN, INSERT, UPDATE, DELETE) to learn with. |

### `api/`

`_db.php` is shared by all the others: the connection, JSON answers, input checks and "is this Felipe?".

| Address | Who | What it does |
|---|---|---|
| `GET articles.php` | anyone | all news (`?category=Music`, `?q=horses`) |
| `GET articles.php?slug=...` | anyone | one article + its comments |
| `POST / PUT ?id= / DELETE ?id=` `articles.php` | Felipe | add / edit / delete |
| `GET videos.php` (`?from=felipe`, `?slug=`) | anyone | videos |
| `GET songs.php` (`?genre=Bolero`) | anyone | songs |
| `POST songs.php?id=4&play=1` | anyone | count one play |
| `GET episodes.php` (`?slug=`) | anyone | podcast |
| `GET comments.php?type=article&id=1` | anyone | comments |
| `POST comments.php` | anyone | leave a comment (Felipe's get his badge) |
| `GET / POST dedications.php` | anyone | dedicate a song |
| `POST messages.php` | anyone | write to Felipe |
| `GET messages.php` | Felipe | read his messages |
| `GET desk.php` | anyone | his desk notes |
| `POST login.php` | Felipe | sign in → get a token |
| `DELETE login.php` | Felipe | sign out |

Videos, songs, episodes and desk notes also have POST / PUT / DELETE for Felipe, the same as articles.

### How Felipe's sign-in works

1. He sends his email and password to `login.php`.
2. PHP checks the password against the **hash** in `admins` with `password_verify()`. The real password is never stored.
3. If it matches, PHP makes a random 64-character **token**, saves it in `admin_tokens` (valid for 7 days) and gives it to the website.
4. The website sends `Authorization: Bearer <token>` with every panel action. `only_felipe()` looks the token up, and without a valid one the answer is **401**.

Demo login: `felipe@example.com` / `desierto`. **Change both before the site goes live.**

### Safety built in

- **Prepared statements everywhere** (`query($sql, $params)`), so SQL injection doesn't work. A search for `' OR 1=1 --` just finds nothing.
- **Column whitelists** in `save()`, so a visitor can't set `is_felipe` or other columns they shouldn't.
- **Length limits** on names, comments and messages.
- **CORS** only lets the real site (and localhost while developing) call the API.

---

## If the sample content changes

`02_seed.sql` is generated from the site's sample data. To remake it:

```bash
node scripts/make-seed.mjs
```
