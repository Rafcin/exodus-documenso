import { expect, type Page, test } from '@playwright/test';

import { signSignaturePad } from '../fixtures/signature';

test.use({ storageState: { cookies: [], origins: [] } });

test('[USER] sees an accurate message when signup is rate limited', async ({ page }: { page: Page }) => {
  await page.route('**/api/auth/email-password/signup', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later.',
        statusCode: 429,
      }),
    });
  });

  await page.goto('/signup');
  await page.getByLabel('Name').fill('Rate Limited User');
  await page.getByLabel('Email').fill('rate-limited@pivotbrands.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123#');

  await signSignaturePad(page);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();

  await expect(page.getByText('Too many signup attempts. Please wait and try again later.')).toBeVisible();
});
