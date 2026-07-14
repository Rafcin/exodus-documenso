import { match } from 'ts-pattern';

import { env } from '../../utils/env';
import type { JobDefinition, TriggerJobOptions } from './_internal/job';
import type { BaseJobProvider as JobClientProvider } from './base';
import { BullMQJobProvider } from './bullmq';
import { InngestJobProvider } from './inngest';
import { LocalJobProvider } from './local';

export class JobClient<T extends ReadonlyArray<JobDefinition> = []> {
  private _provider: JobClientProvider | null = null;

  public constructor(private readonly definitions: T) {}

  private getProvider() {
    if (this._provider) {
      return this._provider;
    }

    const provider = match(env('NEXT_PRIVATE_JOBS_PROVIDER'))
      .with('inngest', () => InngestJobProvider.getInstance())
      .with('bullmq', () => BullMQJobProvider.getInstance())
      .otherwise(() => LocalJobProvider.getInstance());

    this.definitions.forEach((definition) => {
      provider.defineJob(definition);
    });

    this._provider = provider;

    return provider;
  }

  public triggerJob(options: TriggerJobOptions<T>) {
    return this.getProvider().triggerJob(options);
  }

  public getApiHandler() {
    return this.getProvider().getApiHandler();
  }

  /**
   * Start the cron scheduler for any registered cron jobs.
   *
   * Call this once at application startup after the instance is ready to
   * process requests. No-op for providers that handle cron externally
   * (e.g. Inngest).
   */
  public startCron() {
    this.getProvider().startCron();
  }
}
