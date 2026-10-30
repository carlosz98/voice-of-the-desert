-- ============================================================
--  La Voz del Desierto · database
--  Step 1 of 3 (database → PHP → cloud)
--
--  Run this file first, then 02_seed.sql.
--  Works on MySQL 8 (Google Cloud SQL) and MariaDB.
--
--  ⚠ It ERASES the tables and makes them again. Never run it
--    on the live database once real people are using the site.
--
--  One table for each thing on the site:
--    users        → everyone with an account (Felipe too, as role 'felipe')
--    sessions     → keeps people signed in after they log in
--    articles     → the news stories + Felipe's take on each
--    videos       → the videos page
--    songs        → the music page
--    episodes     → the podcast
--    comments     → comments on articles, videos AND episodes
--    dedications  → "dedicate a song" on the music page
--    messages     → "Write to Felipe" on his profile
--    desk_notes   → "From Felipe's desk", his short notes
-- ============================================================

CREATE DATABASE IF NOT EXISTS voz_del_desierto
  CHARACTER SET utf8mb4          -- utf8mb4 = accents (á, ñ) and emojis work
  COLLATE utf8mb4_unicode_ci;

USE voz_del_desierto;
SET NAMES utf8mb4;            -- read this file as utf8 too (for the ñ in Norteño)

-- Start clean every time this file runs (children first, because of the links)
DROP TABLE IF EXISTS sessions, admin_tokens, dedications, comments, messages, desk_notes,
                     episodes, songs, videos, articles, users, admins;


-- ------------------------------------------------------------
-- users: everyone who registers.
--   role 'user'   → a visitor with an account (can comment)
--   role 'felipe' → Felipe (can also use "Mi panel")
-- We NEVER save the real password, only a "hash" made by
-- PHP's password_hash(). Nobody can turn a hash back into
-- the password, not even us.
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,          -- shown next to their comments
  email         VARCHAR(150) NOT NULL UNIQUE,   -- UNIQUE: one account per email
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','felipe') NOT NULL DEFAULT 'user',
  town          VARCHAR(100),                   -- optional: "Delicias", "Parral"...
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);


-- ------------------------------------------------------------
-- sessions: when someone signs in, PHP gives their browser a
-- long random "ticket" (token). The browser sends it back with
-- every request, so they don't type their password each time.
-- Tickets expire after 30 days (7 for Felipe).
-- If the user is deleted, their tickets go too (CASCADE).
-- ------------------------------------------------------------
CREATE TABLE sessions (
  token      CHAR(64)  PRIMARY KEY,
  user_id    INT       NOT NULL,
  expires_at DATETIME  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- articles: a news story and what Felipe thinks about it
-- ------------------------------------------------------------
CREATE TABLE articles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(120) NOT NULL UNIQUE,  -- the web address: /noticias/<slug>
  category     ENUM('Local','Music','Culture','Nature','Faith') NOT NULL,
  title        VARCHAR(255) NOT NULL,
  summary      TEXT         NOT NULL,
  body         TEXT         NOT NULL,         -- paragraphs separated by a blank line
  source       VARCHAR(120),                  -- the newspaper it came from
  take         TEXT,                          -- Felipe's short take
  long_take    TEXT,                          -- Felipe's longer commentary
  photo        VARCHAR(255),                  -- picture file (later: Cloud Storage link)
  photo_pos    VARCHAR(20)  DEFAULT '50% 50%',-- which part of the photo to show
  read_minutes TINYINT      DEFAULT 3,
  is_lead      BOOLEAN      DEFAULT FALSE,    -- the big story at the top
  published_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- videos
-- ------------------------------------------------------------
CREATE TABLE videos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(120) NOT NULL UNIQUE,  -- /videos/<slug>
  title        VARCHAR(255) NOT NULL,
  from_who     ENUM('felipe','community') NOT NULL DEFAULT 'felipe',
  creator      VARCHAR(100) NOT NULL,         -- who filmed it
  description  TEXT,
  note         TEXT,                          -- Felipe's note
  length       VARCHAR(10),                   -- "24:10"
  views        INT          DEFAULT 0,
  photo        VARCHAR(255),
  photo_pos    VARCHAR(20)  DEFAULT '50% 50%',
  video_url    VARCHAR(255),                  -- the video file (added with the cloud step)
  published_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- songs
-- ------------------------------------------------------------
CREATE TABLE songs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(150) NOT NULL,
  artist         VARCHAR(150) NOT NULL,
  album          VARCHAR(150),
  genre          ENUM('Norteño','Bolero','Corrido','Ranchera','Sacred') NOT NULL,
  length_seconds SMALLINT     NOT NULL,       -- 246 = 4:06
  plays          INT          DEFAULT 0,
  photo          VARCHAR(255),
  photo_pos      VARCHAR(20)  DEFAULT '50% 50%',
  audio_url      VARCHAR(255),                -- the MP3 (added with the cloud step)
  added_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- episodes: the podcast
-- ------------------------------------------------------------
CREATE TABLE episodes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  number       INT          NOT NULL UNIQUE,  -- episode 12, 11, 10...
  slug         VARCHAR(120) NOT NULL UNIQUE,  -- /podcast/<slug>
  title        VARCHAR(255) NOT NULL,
  guest        VARCHAR(100),
  guest_role   VARCHAR(255),
  summary      TEXT,
  note         TEXT,                          -- Felipe's note
  chapters     TEXT,                          -- one per line: "2:15 Why walk it?"
  length       VARCHAR(10),
  photo        VARCHAR(255),
  photo_pos    VARCHAR(20)  DEFAULT '50% 50%',
  audio_url    VARCHAR(255),
  published_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- comments: ONE table for comments everywhere.
--   item_type says WHAT was commented (article, video, episode)
--   item_id   says WHICH one (its id in that table)
--   user_id   says WHO wrote it (their account)
-- New comments need an account. The sample comments from the
-- demo have no account (user_id is NULL), only a name.
-- If someone deletes their account, their comments go too.
-- ------------------------------------------------------------
CREATE TABLE comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  item_type  ENUM('article','video','episode') NOT NULL,
  item_id    INT          NOT NULL,
  user_id    INT          NULL,
  name       VARCHAR(100) NOT NULL,           -- copied from the account when posting
  text       TEXT         NOT NULL,
  is_felipe  BOOLEAN      DEFAULT FALSE,      -- shows his gold "host" badge
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (item_type, item_id),                 -- makes "comments for article 3" fast
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- dedications: "dedicate a song to someone"
-- song_id points to a row in songs (a FOREIGN KEY).
-- If the song is deleted, its dedications go with it.
-- Anyone can send one, with or without an account.
-- ------------------------------------------------------------
CREATE TABLE dedications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,           -- who sends it
  to_whom    VARCHAR(150) NOT NULL,           -- who it's for
  song_id    INT          NOT NULL,
  user_id    INT          NULL,               -- their account, if signed in
  message    TEXT,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- messages: "Write to Felipe". Only Felipe reads these.
-- Anyone can write, with or without an account.
-- ------------------------------------------------------------
CREATE TABLE messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  message    TEXT         NOT NULL,
  user_id    INT          NULL,               -- their account, if signed in
  is_read    BOOLEAN      DEFAULT FALSE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- desk_notes: "From Felipe's desk"
-- ------------------------------------------------------------
CREATE TABLE desk_notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  kind       ENUM('note','shared','music','podcast','photo') NOT NULL DEFAULT 'note',
  text       TEXT         NOT NULL,
  meta       VARCHAR(255),                    -- small line under it (song name, episode...)
  photo      VARCHAR(255),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
