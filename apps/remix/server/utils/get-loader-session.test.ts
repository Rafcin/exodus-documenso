import { expect, test } from 'vitest';

import { getOptionalLoaderContext } from './get-loader-session';

test('derives request metadata when a loader runs outside Hono context storage', () => {
  const request = new Request('https://documenso.pivotbrands.com/sign/example', {
    headers: {
      'user-agent': 'Pivot Brands signing regression test',
      'x-forwarded-for': '203.0.113.10',
    },
  });

  let context: ReturnType<typeof getOptionalLoaderContext> | undefined;

  expect(() => {
    context = getOptionalLoaderContext(request);
  }).not.toThrow();

  expect(context?.requestMetadata.userAgent).toBe('Pivot Brands signing regression test');
  expect(context?.requestMetadata.ipAddress).toBe('203.0.113.10');
});
