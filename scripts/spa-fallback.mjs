// GitHub Pages has no server routing: a shared link like /noticias/mercado
// would 404. Serving the app as 404.html lets React Router show the right page.
import { copyFileSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
console.log("dist/404.html written (SPA fallback for GitHub Pages)");
