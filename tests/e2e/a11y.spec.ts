import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** WCAG 2.0 / 2.1 / 2.2 — axe tags must all be listed (tags do not cascade across WCAG versions). */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Pages to audit – each entry is [label, URL-suffix]
/** Stable routes for CI (axe critical/serious = 0). Additional hubs: fix landmarks/contrast then add here — see AUDIT.md */
const PAGES: [string, string][] = [
  ['Explore / Home', './'],
  ['Settings', './?view=settings'],
  ['Library', './?view=library'],
  ['Audiothek', './?view=audio'],
  ['Videothek', './?view=movies'],
  ['Images Hub', './?view=image'],
  ['Rec Room', './?view=recroom'],
  ['Storyteller', './?view=storyteller'],
  ['Help', './?view=help'],
];

for (const [label, url] of PAGES) {
  test(`a11y: ${label} – keine kritischen Verstöße (WCAG 2.2 AA / axe)`, async ({ page }) => {
    await page.goto(url);
    await page.waitForSelector('#main-content', { timeout: 15_000 });
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_AA_TAGS)
      .exclude(['iframe[src*="archive.org"]'])
      .analyze();

    const critical = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );

    if (critical.length > 0) {
      const details = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description}\n` +
            v.nodes
              .slice(0, 3)
              .map((n) => `  • ${n.target.join(', ')}`)
              .join('\n'),
        )
        .join('\n\n');
      expect(critical, `Accessibility violations on "${label}":\n\n${details}`).toHaveLength(0);
    }
  });
}

test('a11y: Skip-Link ist sichtbar bei Fokus', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  const skipLink = page.locator('a[href="#main-content"]');
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toBeFocused();
});

test('a11y: Modaler Fokus-Trap – Fokus kehrt nach Schließen zurück', async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('#main-content');

  const settingsBtn = page.getByRole('button', { name: /Einstellungen|Settings/i }).first();
  await settingsBtn.focus();
  await settingsBtn.click();

  await expect(page.getByRole('heading', { name: /Einstellungen|Settings/i })).toBeVisible();
});

test('a11y: forced-colors — keine kritischen axe-Verstöße (WCAG 2.2 Tags)', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('./');
  await page.waitForSelector('#main-content', { timeout: 15_000 });
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .exclude(['iframe[src*="archive.org"]'])
    .analyze();

  const critical = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  );

  expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
});

test('a11y: Mindest-Zielgröße 24×24 px für sichtbare Bedienelemente im Hauptbereich', async ({
  page,
}) => {
  await page.goto('./');
  await page.waitForSelector('#main-content', { timeout: 15_000 });
  await page.waitForTimeout(300);

  const undersized = await page.evaluate(() => {
    const selectors =
      '#main-content button, #main-content a[href], #main-content [role="button"]:not([aria-hidden="true"])';
    const nodes = Array.from(document.querySelectorAll(selectors));
    const bad: string[] = [];

    for (const el of nodes) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest('.sr-only')) continue;

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')
        continue;

      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;

      if (r.width < 24 || r.height < 24) {
        bad.push(
          `${el.tagName}${el.className ? `.${String(el.className).split(/\s+/).slice(0, 3).join('.')}` : ''} ${Math.round(r.width)}×${Math.round(r.height)}`,
        );
      }
    }
    return bad;
  });

  expect(undersized, undersized.join('\n')).toEqual([]);
});
