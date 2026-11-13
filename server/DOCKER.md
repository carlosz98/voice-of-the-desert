# Docker walkthrough: how the PHP gets to Google Cloud

## The idea in one minute

On your computer, PHP runs because you installed XAMPP. Google Cloud Run doesn't have XAMPP. It runs **containers** instead.

- A **container** is a small, sealed computer that already has everything inside: Linux, Apache, PHP, the MySQL driver and our `server/api` files. It runs exactly the same anywhere.
- An **image** is the saved copy of that container, the "box" Cloud Run starts from.
- A **Dockerfile** is the recipe for building the image, one step per line.

```
Dockerfile (recipe) ──build──► image (the box) ──run──► container (the running API)
```

**You don't need Docker installed.** When we deploy, Google's Cloud Build reads `server/Dockerfile`, builds the image on Google's computers, and Cloud Run runs it.

## The Dockerfile, line by line

File: `server/Dockerfile`

| Step | Line | What it does |
|---|---|---|
| 1 | `FROM php:8.3-apache` | Start from the official image that already has PHP 8.3 and the Apache web server, like XAMPP in a box. |
| 2 | `RUN docker-php-ext-install pdo_mysql` | Add the MySQL driver. Without it, `new PDO("mysql:...")` fails. |
| 3 | `ENV PORT=8080` + the two `sed` lines | Cloud Run sends visitors to port 8080, but Apache listens on 80. `sed` edits Apache's settings so it listens on `${PORT}`. |
| 4 | `SetEnvIf Authorization ...` | Apache hides the `Authorization: Bearer <ticket>` header from PHP by default. This line passes it through. **We tested it: without this line, nobody can stay signed in.** |
| 5 | `ServerTokens Prod`, `display_errors = Off`, `Options -Indexes` | Safety: don't reveal versions, never show PHP errors to visitors (they go to the logs), no folder listings. The file is named `zz-...` so Apache reads it last and it wins. |
| 6 | `COPY api/ /var/www/html/` | Put our PHP files in Apache's web folder. |
| 7 | `EXPOSE 8080` | Documents the port. Apache starts by itself. |

`server/.dockerignore` lists what stays **out** of the box:

- `tests/` and `database/`
- the `.md` notes
- `hello-db.php`, the learning example that connects without a password

## Settings: same code, different computer

The image has **no passwords inside**. PHP reads its settings from environment variables when it starts:

| Variable | On your computer (XAMPP) | On Cloud Run |
|---|---|---|
| `DB_HOST` | `127.0.0.1` (default) | not used |
| `DB_SOCKET` | not used | `/cloudsql/PROJECT_ID:us-east1:voz-db` |
| `DB_NAME` | `voz_del_desierto` (default) | `voz_del_desierto` |
| `DB_USER` | `root` (default) | `voz_api` |
| `DB_PASS` | empty (default) | from Secret Manager |
| `ALLOWED_ORIGINS` | localhost (default) | `https://carlosz98.github.io` |

## How it was tested

Docker Hub is blocked in Claude's workspace, so the image itself couldn't be built there. Instead, the exact same steps were applied to the same Apache 2.4 + PHP 8.3, and:

- The full API test passed through Apache: **137/137**.
- The server says only `Server: Apache`, with no version, and folder listings are blocked.
- `hello-db.php` is not reachable (404).
- Removing step 4 broke sign-in, as expected, and putting it back fixed it.

On the cloud day, Cloud Build does the real build. If anything in the recipe is off, it fails before anything goes live.

## Cloud day: the deploy commands

Run these in **Cloud Shell**, the terminal inside the Google Cloud website, so you don't need to install anything. Replace `PROJECT_ID` with yours.

```bash
# 0. get the code
git clone -b database https://github.com/carlosz98/voice-of-the-desert.git
cd voice-of-the-desert

# 1. keep the database password in Secret Manager (you type it, it isn't saved in the history)
read -s DBPASS && printf %s "$DBPASS" | gcloud secrets create voz-db-pass --data-file=-

# 2. let Cloud Run read that secret and talk to Cloud SQL
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role=roles/cloudsql.client

# 3. build the box from server/Dockerfile and run it on Cloud Run
gcloud run deploy voz-api \
  --source server \
  --region us-east1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:us-east1:voz-db \
  --set-env-vars DB_SOCKET=/cloudsql/PROJECT_ID:us-east1:voz-db,DB_NAME=voz_del_desierto,DB_USER=voz_api,ALLOWED_ORIGINS=https://carlosz98.github.io \
  --set-secrets DB_PASS=voz-db-pass:latest
```

`--allow-unauthenticated` means "visitors don't need a Google login to reach the API". Our own sign-in (tickets) still protects everything private.

When it finishes, it prints an address like `https://voz-api-xxxxx-ue.a.run.app`. Open it: `{"database":"ok"}` means PHP reached Cloud SQL.

## If you install Docker later (optional)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) lets you build and run the same box on your own computer:

```bash
docker build -t voz-api server                    # build the image from the recipe
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal -e DB_PASS= \
  voz-api                                         # run it: open http://localhost:8080
docker ps                                         # list running containers
docker stop <id>                                  # stop one
```

`host.docker.internal` means "the computer outside the box", where XAMPP's MySQL runs.
