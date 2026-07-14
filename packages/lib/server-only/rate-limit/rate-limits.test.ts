import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { signupRateLimit } from './rate-limits';

describe('signupRateLimit', () => {
  const originalBypassValue = process.env.DANGEROUS_BYPASS_RATE_LIMITS;

  beforeEach(() => {
    process.env.DANGEROUS_BYPASS_RATE_LIMITS = 'true';
  });

  afterEach(() => {
    process.env.DANGEROUS_BYPASS_RATE_LIMITS = originalBypassValue;
  });

  it('allows a shared IP to submit more than three distinct signup attempts', async () => {
    const result = await signupRateLimit.check({ ip: '203.0.113.10' });

    expect(result.limit).toBe(100);
  });

  it('still limits repeated attempts for one email to three', async () => {
    const result = await signupRateLimit.check({
      ip: '203.0.113.10',
      identifier: 'person@pivotbrands.com',
    });

    expect(result.limit).toBe(3);
  });
});
