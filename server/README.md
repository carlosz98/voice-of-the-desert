# Back end: La Voz del Desierto

We're building it in three steps:

1. **Database (MySQL)** ✅ is in `database/`.
2. **PHP API** is next. These small PHP files let the website read and write the database.
3. **Cloud (Google Cloud)** comes last. The database goes to Cloud SQL, photos/audio/video go to Cloud Storage, and the PHP runs on Cloud Run.

The website itself stays on GitHub Pages. GitHub Pages can't run PHP, which is why the API lives in the cloud.

## The database

| File | What it does |
|---|---|
| `database/01_schema.sql` | Creates the database and its 9 tables. Run it first. |
| `database/02_seed.sql` | Fills the tables with the demo content: 12 articles, 6 videos, 10 songs, 5 episodes and 31 comments. |
| `database/03_practice.sql` | Example queries (SELECT, JOIN, INSERT, UPDATE, DELETE) to learn with. |

### Run it on your computer

Install MySQL (or XAMPP, which comes with MySQL and PHP). Then:

```bash
mysql -u root -p < server/database/01_schema.sql
mysql -u root -p < server/database/02_seed.sql
```

Or open each file in MySQL Workbench / phpMyAdmin and press Run.

### Felipe's login

The `admins` table never stores the password, only a hash made by PHP's `password_hash()`. The demo password is `desierto`. **Change it before the site goes live.**

### If the sample content changes

`02_seed.sql` is generated from the site's sample data. To remake it:

```bash
node scripts/make-seed.mjs
```
