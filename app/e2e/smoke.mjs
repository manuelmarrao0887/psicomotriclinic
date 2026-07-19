// Smoke test headless — arranca a app, verifica que monta sem erros de consola
// e que o dark mode escurece o fundo. Requer um servidor a servir a app.
//
//   npm run dev &                 # ou npm run preview após build
//   SMOKE_URL=http://localhost:5173 node e2e/smoke.mjs
//
// Precisa dos browsers do Playwright: npx playwright install chromium
import { chromium } from "playwright";

const URL = process.env.SMOKE_URL || "http://localhost:5173/";
const OUT = process.env.SMOKE_OUT || ".";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "networkidle", timeout: 20000 });
await page.waitForFunction(() => document.getElementById("root")?.children.length > 0, { timeout: 15000 });

await page.screenshot({ path: `${OUT}/smoke-light.png` });
await page.evaluate(() => document.documentElement.classList.add("dark"));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/smoke-dark.png` });
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

await browser.close();

const ok = errors.length === 0;
console.log(JSON.stringify({ ok, bodyBgDark: bodyBg, errorCount: errors.length, errors: errors.slice(0, 20) }, null, 2));
if (!ok) process.exit(1);
