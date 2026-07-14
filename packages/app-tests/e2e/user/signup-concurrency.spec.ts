import { expect, test } from '@playwright/test';

test('[USER] signup page survives a concurrent cold-start burst', async ({ request }) => {
  const probe = Date.now();

  const responses = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => request.get(`/signup?concurrencyProbe=${probe}-${index}`)),
  );

  expect(responses.map((response) => response.status())).toEqual(Array.from({ length: 10 }, () => 200));
});
