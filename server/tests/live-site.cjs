// ============================================================
//  live-site.cjs: the website in LIVE mode against PHP + MySQL.
//  It clicks through the site like a person (register, comment,
//  dedicate, message, submit, Felipe publishes...) and after each
//  step looks inside the database to prove it was really saved.
//
//  Needs, on this computer:
//    - MySQL with a FRESH copy of 01_schema.sql + 02_seed.sql
//    - the PHP API on http://127.0.0.1:8088
//        cd server/api && php -S 127.0.0.1:8088
//    - the site built for live mode, on port 4177
//        VITE_API_URL=http://127.0.0.1:8088 npx vite build --outDir dist-live
//        npx vite preview --outDir dist-live --port 4177
//    - Playwright (npm i -D playwright)
//
//  Run:  node server/tests/live-site.cjs
// ============================================================
const { chromium } = require("playwright");
const { execSync } = require("child_process");
const BASE = "http://localhost:4177/voice-of-the-desert";
const OUT = require("os").tmpdir();
const sql = q => execSync(`mariadb -N --default-character-set=utf8mb4 voz_del_desierto -e ${JSON.stringify(q)}`).toString().trim();
const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "ok  " : "FAIL"} ${name} ${extra}`);
const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, e.message.split("\n")[0]); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], apiCalls = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("request", r => r.url().includes(":8088/") && apiCalls.push(r.method() + " " + r.url().split(":8088/")[1]));
  await page.route(/getbible|open-meteo|radio-browser/, r => r.abort());

  await step("home loads from the database", async () => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector("#news", { timeout: 15000 });
    ok("home loads from the database", apiCalls.some(c => c.startsWith("GET articles.php")), `(${apiCalls.length} API calls)`);
    ok("home shows a DB story", (await page.textContent("#news")).includes("guitar maker") || (await page.textContent("#news")).includes("guitarrero"));
  });

  await step("news page", async () => {
    await page.goto(`${BASE}/noticias`);
    await page.waitForSelector("text=12 historias", { timeout: 10000 });
    ok("news page: 12 stories from MySQL", true);
  });

  // a story Felipe adds directly in the database shows up after reload
  await step("row added in SQL shows on the site", async () => {
    sql("INSERT INTO articles (slug, category, title, summary, body) VALUES ('desde-sql', 'Local', 'Written straight into MySQL', 'Added with an INSERT', 'Hola.')");
    await page.goto(`${BASE}/noticias`);
    await page.waitForSelector("text=Written straight into MySQL", { timeout: 10000 });
    ok("row added in SQL shows on the site", true);
    sql("DELETE FROM articles WHERE slug='desde-sql'");
  });

  await step("article page", async () => {
    await page.goto(`${BASE}/noticias/caballos-salvajes`);
    await page.waitForSelector("text=Para dejar un comentario", { timeout: 10000 });
    const txt = await page.textContent("article");
    ok("article body from DB", txt.includes("Rangers") || txt.includes("guardabosques"));
    ok("article comments from DB", apiCalls.some(c => c.includes("articles.php?slug=caballos-salvajes")));
  });

  await step("register", async () => {
    await page.goto(`${BASE}/cuenta?nueva=1`);
    await page.waitForSelector("text=Cree su cuenta");
    await page.waitForTimeout(400);
    await page.fill('input[autocomplete="name"]', "Carlos Live");
    await page.fill('input[type="email"]', "carlos.live@example.com");
    await page.fill('input[autocomplete="new-password"]', "nopal-2026");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Miembro desde", { timeout: 8000 });
    ok("register saved in users table", sql("SELECT COUNT(*) FROM users WHERE email='carlos.live@example.com'") === "1");
    ok("only a hash stored", sql("SELECT password_hash FROM users WHERE email='carlos.live@example.com'").startsWith("$2y$"));
    ok("session ticket stored as hash", sql("SELECT COUNT(*) FROM sessions s JOIN users u ON u.id=s.user_id WHERE u.email='carlos.live@example.com'") === "1");
    ok("demo note gone in live", !(await page.isVisible("text=Demo: por ahora")));
  });

  await step("comment", async () => {
    await page.goto(`${BASE}/noticias/caballos-salvajes`);
    await page.waitForSelector("text=Comenta como", { timeout: 8000 });
    await page.fill('input[id$="-comment"]', "Comentario guardado en MySQL");
    await page.click('button:has-text("Publicar")');
    await page.waitForSelector("text=Comentario guardado en MySQL");
    ok("comment saved in MySQL", sql("SELECT COUNT(*) FROM comments WHERE text='Comentario guardado en MySQL' AND name='Carlos Live'") === "1");
    await page.reload();
    await page.waitForSelector("text=Comentario guardado en MySQL", { timeout: 8000 });
    ok("comment still there after reload", true);
    await page.screenshot({ path: `${OUT}/live-comment.png` });
    ok("can't delete Felipe's comment (no button)", (await page.locator("li:has-text('Felipe Lerma') button:has-text('Borrar')").count()) === 0);
    await page.click("li:has-text('Comentario guardado en MySQL') button:has-text('Borrar')");
    await page.waitForTimeout(800);
    ok("delete own comment in MySQL", sql("SELECT COUNT(*) FROM comments WHERE text='Comentario guardado en MySQL'") === "0");
  });

  await step("dedication", async () => {
    await page.goto(`${BASE}/musica`);
    await page.locator("#ded-h").scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForSelector('text=Dedica una canción', { timeout: 8000 });
    const form = page.locator("form:has-text('Dedica una canción')");
    await form.locator("input").nth(1).fill("Mi abuela");
    await form.locator("select").selectOption({ index: 1 });
    await form.locator("textarea").fill("Con cariño desde Nueva York");
    await form.locator('button[type="submit"]').click();
    await page.waitForSelector("text=Con cariño desde Nueva York", { timeout: 8000 });
    ok("dedication saved with the right song", sql("SELECT s.title FROM dedications d JOIN songs s ON s.id=d.song_id WHERE d.to_whom='Mi abuela'") === "Luna de Parral");
    ok("dedication linked to my account", sql("SELECT COUNT(*) FROM dedications d JOIN users u ON u.id=d.user_id WHERE u.email='carlos.live@example.com'") === "1");
  });

  await step("song play counted", async () => {
    const before = Number(sql("SELECT plays FROM songs WHERE id=3"));
    await page.goto(`${BASE}/musica`);
    await page.locator("button:has-text('El caballo bayo')").first().click();
    await page.waitForTimeout(800);
    ok("song play counted", Number(sql("SELECT plays FROM songs WHERE id=3")) === before + 1, `(${before} → ${sql("SELECT plays FROM songs WHERE id=3")})`);
  });

  await step("message to Felipe", async () => {
    await page.goto(`${BASE}/felipe`);
    const form = page.locator("form:has-text('Mensaje')");
    await form.locator("textarea").fill("Saludos, Don Felipe");
    await form.locator('button[type="submit"]').click();
    await page.waitForSelector("text=Felipe leerá", { timeout: 8000 }).catch(() => {});
    ok("message saved", sql("SELECT COUNT(*) FROM messages WHERE message='Saludos, Don Felipe' AND name='Carlos Live'") === "1");
  });

  await step("submission", async () => {
    await page.goto(`${BASE}/subir`);
    await page.waitForSelector("text=Envía como", { timeout: 8000 });
    await page.fill('#upload input[maxlength="200"]', "Video de la feria");
    await page.fill('#upload input[type="url"]', "https://youtube.com/watch?v=abc");
    await page.click('button:has-text("Mandar a Felipe")');
    await page.waitForSelector("text=ya está con Felipe", { timeout: 8000 });
    ok("submission saved", sql("SELECT status FROM submissions WHERE title='Video de la feria'") === "pending");
  });

  await step("Felipe publishes", async () => {
    await page.goto(`${BASE}/cuenta`);
    await page.click('button:has-text("Salir")');
    await page.waitForSelector("text=Qué gusto verle de nuevo");
    await page.waitForTimeout(300);
    ok("sign out deletes ticket", sql("SELECT COUNT(*) FROM sessions s JOIN users u ON u.id=s.user_id WHERE u.email='carlos.live@example.com'") === "0");
    await page.fill('input[type="email"]', "felipe@example.com");
    await page.fill('input[autocomplete="current-password"]', "desierto");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Miembro desde", { timeout: 8000 });
    await page.goto(`${BASE}/panel`);
    await page.waitForSelector("text=Historias", { timeout: 8000 });
    ok("panel shows real counts", (await page.textContent("main")).includes("12"));
    await page.screenshot({ path: `${OUT}/live-panel.png` });
    // write news
    await page.click('nav button:has-text("Escribir noticia")');
    await page.fill('input[placeholder*="Plaza de Armas"]', "La feria de Santa Rita vuelve");
    await page.locator("textarea").first().fill("Del 20 al 30 de mayo, con juegos y música.");
    await page.click('button:has-text("Publicar")');
    await page.waitForSelector("text=Ya está en el sitio", { timeout: 10000 });
    ok("article saved in MySQL", sql("SELECT category FROM articles WHERE title='La feria de Santa Rita vuelve'") === "Local");
    await page.goto(`${BASE}/noticias`);
    await page.waitForSelector("text=La feria de Santa Rita vuelve", { timeout: 8000 });
    ok("new article on the news page", true);
    // quick note → desk
    await page.goto(`${BASE}/panel`);
    await page.click('nav button:has-text("Nota rápida")');
    await page.locator("textarea").first().fill("Buenos días a todos desde el panel");
    await page.click('button:has-text("Publicar")');
    await page.waitForSelector("text=Ya está en el sitio", { timeout: 10000 });
    ok("desk note saved", sql("SELECT kind FROM desk_notes WHERE text='Buenos días a todos desde el panel'") === "note");
    // comments desk: answer a reader
    await page.click('nav button:has-text("Comentarios")');
    await page.waitForSelector("li:has-text('Mi abuela'), li:has-text('Daniel P.')", { timeout: 8000 }).catch(() => {});
    const first = page.locator("main li").filter({ has: page.locator("input") }).first();
    await first.locator("input").fill("Gracias por escribir");
    await first.locator('button:has-text("Contestar")').click();
    await page.waitForTimeout(800);
    ok("Felipe's answer saved with badge", sql("SELECT COUNT(*) FROM comments WHERE text='Gracias por escribir' AND is_felipe=1") === "1");
    // review the submission
    await page.click('nav button:has-text("Envíos")');
    await page.waitForSelector("li:has-text('Video de la feria')", { timeout: 8000 });
    await page.click("li:has-text('Video de la feria') button:has-text('Aprobar')");
    await page.waitForTimeout(800);
    ok("submission approved in MySQL", sql("SELECT status FROM submissions WHERE title='Video de la feria'") === "approved");
  });

  await step("other pages", async () => {
    for (const path of ["/videos", "/videos/amanecer-en-la-sierra", "/podcast", "/podcast/el-hombre-que-camino-el-camino-real", "/musica", "/felipe"]) {
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(1200);
      const txt = await page.textContent("body");
      ok(`page ${path} loads`, !txt.includes("No pudimos cargar") && !txt.includes("not found") && !txt.includes("no encontrado"));
    }
  });

  await step("server down", async () => {
    const c2 = await browser.newContext();
    const p2 = await c2.newPage();
    await p2.route(/:8088\//, r => r.abort());
    await p2.goto(`${BASE}/`);
    await p2.waitForSelector("text=No pudimos cargar esto ahora", { timeout: 8000 });
    ok("server down: friendly message + retry", await p2.isVisible("button:has-text('Intentar de nuevo')"));
    await c2.close();
  });

  ok("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  console.log(results.join("\n"));
})();
