import { chromium } from "@playwright/test";
import { report } from "../src/content/report";

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:4173");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    ({ friendName }) => {
      document.body.innerHTML =
        '<main id="og"><div class="og-meta">БЮРО НЕЗНАЧНИХ ДОСЛІДЖЕНЬ <span>ЗВІТ № 001</span></div><h1>Кількісний аналіз<br/>того, чому <span id="friend"></span><br/><em>помиляється.</em></h1><div class="og-bottom">Незначна суперечка. Непропорційні зусилля.<span>n = 1 · усі дані вигадані</span></div><div class="og-mark">↙</div></main>';
      document.querySelector("#friend")!.textContent = friendName;
      const style = document.createElement("style");
      style.textContent =
        'body{margin:0;background:#f1efe7;color:#242722}#og{padding:45px 55px;position:relative;height:630px}.og-meta,.og-bottom{font:12px "IBM Plex Mono";display:flex;justify-content:space-between;border-bottom:1px solid #242722;padding-bottom:20px;letter-spacing:.03em}#og h1{font:74px/1.2 "PT Serif";letter-spacing:-.045em;margin:45px 0;max-width:1030px}#og em{color:#b53727;font-family:"PT Serif"}.og-bottom{position:absolute;bottom:35px;left:55px;right:55px;border-bottom:0;border-top:1px solid #cdcfc3;padding-top:22px;font-size:11px}.og-mark{position:absolute;right:75px;bottom:100px;font:150px "IBM Plex Sans";color:#b53727}';
      document.head.append(style);
    },
    { friendName: report.friendName },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/og.png" });
  console.log("Created public/og.png (1200 × 630).");
} finally {
  await browser.close();
}
