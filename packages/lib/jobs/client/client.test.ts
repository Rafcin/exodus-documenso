import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const provider = vi.hoisted(() => ({
  defineJob: vi.fn(),
  getApiHandler: vi.fn(),
  startCron: vi.fn(),
  triggerJob: vi.fn(),
}));

const getInstance = vi.hoisted(() => vi.fn(() => provider));

vi.mock('../../utils/env', () => ({
  env: vi.fn(() => undefined),
}));

vi.mock('./bullmq', () => ({
  BullMQJobProvider: { getInstance },
}));

vi.mock('./inngest', () => ({
  InngestJobProvider: { getInstance },
}));

vi.mock('./local', () => ({
  LocalJobProvider: { getInstance },
}));

import { JobClient } from './client';

const definition = {
  id: 'test.lazy-job',
  name: 'Test lazy job',
  version: '1.0.0',
  trigger: {
    name: 'test.lazy-job',
    schema: z.object({ value: z.string() }),
  },
  handler: vi.fn(),
} as const;

describe('JobClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not initialize or register a provider until the client is used', async () => {
    const client = new JobClient([definition]);

    expect(getInstance).not.toHaveBeenCalled();
    expect(provider.defineJob).not.toHaveBeenCalled();

    await client.triggerJob({
      name: 'test.lazy-job',
      payload: { value: 'ready' },
    });

    expect(getInstance).toHaveBeenCalledOnce();
    expect(provider.defineJob).toHaveBeenCalledWith(definition);
    expect(provider.triggerJob).toHaveBeenCalledWith({
      name: 'test.lazy-job',
      payload: { value: 'ready' },
    });
  });
});
