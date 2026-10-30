# Google Cloud: what we need before step 3

Get these ready and step 3 goes quickly. Things only **you** can do (your account, your card) are marked 👤. The rest we do together.

---

## A. Before we start 👤

- [ ] **A Google account** to own the project. A personal Gmail works. Use the one you'll keep after class, because Felipe's site will live there.
- [ ] **A credit or debit card.** Google asks for one to start the free trial. It **won't charge you** during the trial, and afterwards only if you choose to upgrade.
- [ ] **Your phone** for Google's verification text.
- [ ] **About 45 minutes** for the first setup.

## B. The account and the money 👤

- [ ] Go to https://console.cloud.google.com and accept the terms.
- [ ] **Start the free trial** to get the **$300 credit for 90 days**. Note the **end date** here: ________
- [ ] **Create a budget alert:** Billing → Budgets & alerts → Create budget.
  - Amount: **$5**
  - Emails at **50%, 90% and 100%**
  - That way you hear about any cost long before it matters.
- [ ] **Create the project.** Name: `voz-del-desierto`. Write down the **Project ID** Google gives it: ________

## C. Turn on the services (we do this together)

In the project, turn on these APIs:

- [ ] **Cloud SQL Admin API** for the MySQL database
- [ ] **Cloud Run Admin API** to run the PHP
- [ ] **Artifact Registry API** to store the PHP "box" (container) that Cloud Run runs
- [ ] **Cloud Build API** to build that box from our code
- [ ] **Secret Manager API** to keep the database password out of the code
- [ ] **Cloud Storage** (already on by default) for photos, songs and videos

## D. Decisions (already made, written down so we don't forget)

| Thing | Choice | Why |
|---|---|---|
| Region | **us-east1** (South Carolina) | Close to New York, and part of Google's free tier |
| Database | **Cloud SQL for MySQL 8**, edition **Enterprise**, machine **shared core (db-f1-micro)**, **10 GB** storage | The smallest and cheapest option, around $10 a month, paid by the credit |
| Database name | `voz_del_desierto` | Same as our `01_schema.sql` |
| Database user | `voz_api`, with a strong password stored in Secret Manager | The API never uses `root` |
| PHP | **Cloud Run**, service name `voz-api` | Free for a site this size (2 million requests a month) |
| Files | **Cloud Storage** bucket `voz-del-desierto-media`, in us-east1 | Free up to 5 GB |
| Website | stays on **GitHub Pages** | Already free and working |

## E. Passwords and secrets to create 👤

Use a password manager, and **never put these in GitHub**:

- [ ] **Database root password** (Cloud SQL asks for it when creating the database)
- [ ] **`voz_api` user password** (the one the PHP uses)
- [ ] **Felipe's real email and a new password** to replace the demo `felipe@example.com` / `desierto`

## F. What we do in step 3, in order

1. Create the Cloud SQL instance, its database and the `voz_api` user.
2. Import `01_schema.sql` and `02_seed.sql`. **Only once.** The schema erases tables, so we never run it again on the live database.
3. Change Felipe's login to his real email and password.
4. Add a `Dockerfile` to `server/` (PHP 8.3 + Apache + pdo_mysql).
5. Deploy `server/api` to Cloud Run, connected to Cloud SQL, with these environment variables:
   - `DB_SOCKET=/cloudsql/PROJECT_ID:us-east1:voz-db`
   - `DB_NAME`, `DB_USER`, and `DB_PASS` (from Secret Manager)
   - `ALLOWED_ORIGINS=https://carlosz98.github.io`
6. Open the Cloud Run address and check that it says `"database":"ok"`. Then run `server/tests/api-test.sh` against a **copy** of the database, never the live one.
7. Create the Storage bucket and upload the photos.
8. Put the API address in the website (`VITE_API_URL` in a GitHub Actions setting), push, and the live site starts using real data.

## G. Keeping it safe and cheap

- [ ] Turn on Cloud SQL **automatic daily backups** (7 days kept).
- [ ] Check the **Billing** page once a week during the trial.
- [ ] **Before the trial ends:** move to Firestore (step 4) or decide to pay, and export a final `.sql` backup first.
