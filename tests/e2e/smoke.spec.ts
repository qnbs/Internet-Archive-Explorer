import { expect, test } from '@playwright/test';

const labels = {
  settings: /Einstellungen|Settings/i,
  explore: /Entdecken|Explore/i,
  scriptorium: /Scriptorium/i,
  aiSection: /KI-Funktionen|AI Features/i,
  save: /Speichern|Save/i,
  apiKeySaved: /Key gespeichert|Key saved/i,
  oauthOptional: /Optional:\s*Google OAuth/i,
  oauthLogin: /Mit Google anmelden|Sign in with Google/i,
};

async function openSettings(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: labels.settings }).first().click();
  await expect(page.getByRole('heading', { name: labels.settings })).toBeVisible();
}

test('API-Key kann gespeichert werden', async ({ page }) => {
  await openSettings(page);

  await page.getByRole('button', { name: labels.aiSection }).click();

  const apiInput = page.locator('#gemini-api-key-input');
  const keyValue = 'AIzaSySmokeTestKey_1234567890';
  await apiInput.fill(keyValue);
  await page.getByRole('button', { name: labels.save }).click();

  await expect(page.getByText(labels.apiKeySaved)).toBeVisible();
  await expect.poll(async () => page.evaluate(() => sessionStorage.getItem('gemini_api_key'))).toBe(
    keyValue,
  );

  await page.reload();
  await openSettings(page);
  await page.getByRole('button', { name: labels.aiSection }).click();
  await expect(page.getByText(labels.apiKeySaved)).toBeVisible();
});

test('Optionaler OAuth-Login ist sichtbar', async ({ page }) => {
  await openSettings(page);

  await page.getByRole('button', { name: labels.aiSection }).click();
  await page.locator('summary', { hasText: labels.oauthOptional }).click();

  await expect(page.getByRole('button', { name: labels.oauthLogin })).toBeVisible();
});

test('Grundnavigation über SideMenu funktioniert', async ({ page }) => {
  await page.goto('./?view=explore');

  const exploreButton = page.getByRole('button', { name: labels.explore }).first();
  await expect(exploreButton).toHaveAttribute('aria-current', 'page');

  const scriptoriumButton = page.getByRole('button', { name: labels.scriptorium }).first();
  await scriptoriumButton.click();
  await expect(scriptoriumButton).toHaveAttribute('aria-current', 'page');

  const settingsButton = page.getByRole('button', { name: labels.settings }).first();
  await settingsButton.click();
  await expect(settingsButton).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: labels.settings })).toBeVisible();
});
