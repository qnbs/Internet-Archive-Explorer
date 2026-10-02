import { expect, test } from '@playwright/test';

const labels = {
  settings: /Einstellungen|Settings/i,
  explore: /Entdecken|Explore/i,
  scriptorium: /Scriptorium/i,
  aiSection: /KI-Funktionen|AI Features/i,
  save: /Validieren & Speichern|Validate & Save/i,
  apiKeySaved: /Schlüssel gespeichert|Key saved/i,
  oauthOptional: /Optional:\s*Google OAuth/i,
  oauthLogin: /Mit Google anmelden|Sign in with Google/i,
};

async function openSettings(page: import('@playwright/test').Page) {
  await page.goto('./?view=settings');
  await page.waitForSelector('#main-content', { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: labels.settings })).toBeVisible({
    timeout: 45_000,
  });
}

test('@smoke API-Key kann gespeichert werden', async ({ page }) => {
  await openSettings(page);

  const aiSectionButton = page.getByRole('button', { name: labels.aiSection });
  await aiSectionButton.click();
  await expect(aiSectionButton).toHaveClass(/bg-accent-700|bg-accent-50|bg-accent-500\/20/);

  const apiInput = page.locator('#gemini-api-key-input');
  const keyValue = 'AIzaSySmokeTestKey_1234567890';
  await apiInput.fill(keyValue);
  await page.getByRole('button', { name: labels.save }).click();

  await expect(page.getByText(labels.apiKeySaved)).toBeVisible();
  await expect
    .poll(async () => page.evaluate(() => sessionStorage.getItem('gemini_api_key')))
    .toBe(keyValue);

  await page.reload();
  await openSettings(page);
  const aiSectionButtonAfterReload = page.getByRole('button', { name: labels.aiSection });
  await expect(aiSectionButtonAfterReload).not.toHaveClass(/bg-accent-700/);
  await aiSectionButtonAfterReload.click();
  await expect(aiSectionButtonAfterReload).toHaveClass(
    /bg-accent-700|bg-accent-50|bg-accent-500\/20/,
  );
  await expect(page.getByText(labels.apiKeySaved)).toBeVisible();
});

test('Optionaler OAuth-Login ist sichtbar', async ({ page }) => {
  await openSettings(page);

  await page.getByRole('button', { name: labels.aiSection }).click();
  await page.locator('summary', { hasText: labels.oauthOptional }).click();

  await expect(page.getByRole('button', { name: labels.oauthLogin })).toBeVisible();
});

test('@smoke Grundnavigation über Views funktioniert', async ({ page }) => {
  await page.goto('./?view=explore');
  await page.waitForSelector('#main-content', { timeout: 15_000 });
  await expect(page.getByText(/Trending Now|Gerade beliebt/i)).toBeVisible({ timeout: 45_000 });

  await page.goto('./?view=scriptorium');
  await expect(page.getByRole('heading', { name: labels.scriptorium, level: 1 })).toBeVisible({
    timeout: 45_000,
  });

  await page.goto('./?view=settings');
  await expect(page.getByRole('heading', { name: labels.settings })).toBeVisible({
    timeout: 45_000,
  });
});

test('Uploader-Hub zeigt Beitragende', async ({ page }) => {
  await page.goto('./?view=uploaderHub');
  await page.waitForSelector('#main-content', { timeout: 15_000 });

  // i18n: solange loadableTranslations lädt, liefert t() '' — einzelnes Namespace-Response reicht nicht.
  const hubH1 = page.locator('#main-content').getByRole('heading', { level: 1 });
  await expect(hubH1).toHaveText(/Uploader Hub|Uploader-Hub/, { timeout: 45_000 });

  await expect(
    page.getByRole('heading', { name: /Featured|Vorgestellte/i, level: 2 }),
  ).toBeVisible();
});
