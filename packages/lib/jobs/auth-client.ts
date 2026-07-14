import { env } from '../utils/env';
import type { TriggerJobOptions } from './client/_internal/job';
import type { BaseJobProvider } from './client/base';
import { SEND_CONFIRMATION_EMAIL_JOB_DEFINITION } from './definitions/emails/send-confirmation-email';
import { SEND_PASSWORD_RESET_SUCCESS_EMAIL_JOB_DEFINITION } from './definitions/emails/send-password-reset-success-email';

/**
 * Authentication only needs these two job definitions. Keeping this client
 * separate prevents session and signup requests from importing every document,
 * webhook, billing, and cron job during a serverless cold start.
 */
const authJobDefinitions = [
  SEND_CONFIRMATION_EMAIL_JOB_DEFINITION,
  SEND_PASSWORD_RESET_SUCCESS_EMAIL_JOB_DEFINITION,
] as const;

let providerPromise: Promise<BaseJobProvider> | null = null;

const getProvider = (): Promise<BaseJobProvider> => {
  if (!providerPromise) {
    providerPromise = (async () => {
      const providerName = env('NEXT_PRIVATE_JOBS_PROVIDER');
      let provider: BaseJobProvider;

      if (providerName === 'inngest') {
        const { InngestJobProvider } = await import('./client/inngest');
        provider = InngestJobProvider.getInstance();
      } else if (providerName === 'bullmq') {
        const { BullMQJobProvider } = await import('./client/bullmq');
        provider = BullMQJobProvider.getInstance();
      } else {
        const { LocalJobProvider } = await import('./client/local');
        provider = LocalJobProvider.getInstance();
      }

      provider.defineJob(SEND_CONFIRMATION_EMAIL_JOB_DEFINITION);
      provider.defineJob(SEND_PASSWORD_RESET_SUCCESS_EMAIL_JOB_DEFINITION);

      return provider;
    })();
  }

  return providerPromise;
};

export const authJobsClient = {
  async triggerJob(options: TriggerJobOptions<typeof authJobDefinitions>) {
    const provider = await getProvider();

    return provider.triggerJob(options);
  },
};
