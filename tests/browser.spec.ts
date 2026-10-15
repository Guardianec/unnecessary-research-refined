import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("entire report, interactions, accessibility and screenshots", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("h1")).toContainText("[ДРУГ]");
  await expect(page.locator(".exhibit")).toHaveCount(40);
  await page.screenshot({
    path: `test-results/${info.project.name}-opening.png`,
  });
  await page.getByRole("button", { name: "Зміст ↗" }).click();
  await expect(
    page.getByRole("navigation", { name: "Зміст звіту" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Зміст ↗" })).toBeFocused();
  for (const id of [
    "summary",
    "scope",
    "evidence",
    "statistics",
    "simulation",
    "strategy",
    "mechanism",
    "model",
    "review",
    "verdict",
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page
      .locator(`#${id}`)
      .screenshot({ path: `test-results/${info.project.name}-${id}.png` });
  }
  await page.getByText("Відкрити методологічний протокол").click();
  await expect(page.locator(".methods")).toBeVisible();
  await page
    .getByRole("button", { name: "Запустити 10 000 сценаріїв ↗" })
    .click();
  await expect(
    page.getByRole("button", { name: "Повторити симуляцію ↻" }),
  ).toBeEnabled({ timeout: 10000 });
  await expect(page.locator(".sim-results")).toContainText("10 000");
  await page.locator("#evidence").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.screenshot({
    path: `test-results/${info.project.name}-evidence-settled.png`,
  });
  await page
    .getByRole("button", { name: "Викриття вигаданих даних", exact: true })
    .click();
  await expect(page.locator(".risk-detail")).toContainText("Це не викриття");
  await page.locator("input#control-evidence").fill("0");
  await page.locator("input#control-sense").fill("0");
  await page.locator("input#control-confidence").fill("100");
  await expect(page.locator(".model-output")).toContainText(
    "Цілісність моделі порушено",
  );
  await page.getByRole("button", { name: "Відновити параметри ↺" }).click();
  await expect(page.locator("input#control-evidence")).toHaveValue("80");
  await page
    .getByRole("button", { name: "Контраргумент", exact: true })
    .click();
  await expect(page.locator(".graph-explanation")).toContainText(
    "Прийнято до розгляду",
  );
  await page.getByRole("button", { name: "Завантажити повний звіт ↗" }).click();
  await expect(page.locator(".notice")).toContainText(
    "Ви вже прочитали достатньо",
  );
  await page.getByRole("button", { name: "Оскаржити висновки ↗" }).click();
  await expect(page.locator(".notice")).toContainText("Апеляцію відхилено");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await page.locator("#top").scrollIntoViewIfNeeded();
  await page.keyboard.press("Tab");
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
test("skip link, keyboard sliders and base path assets", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Перейти до дослідження" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#summary$/);
  await page.locator("input#control-coffee").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("input#control-coffee")).toHaveValue("41");
  expect(
    await page.evaluate(
      () =>
        performance
          .getEntriesByType("resource")
          .filter((e) => e.name.includes("/assets/")).length,
    ),
  ).toBeGreaterThan(3);
});

test("motion can be stopped mid-intro and restored without hiding content", async ({
  page,
}) => {
  await page.goto("./");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator(".title-line > span").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator(".hero-aside")).toHaveCSS("clip-path", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await page.locator(".chapter-nav button").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator(".stats-strip > div").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator(".plot .draw").first()).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
});
