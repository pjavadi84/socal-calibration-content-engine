import { serve } from 'inngest/next';
import { inngest } from '@/jobs/inngest';
import { generateArticleJob } from '@/jobs/generate-article';
import { gscWeeklySyncJob } from '@/jobs/gsc-sync';
import { externalUpdatesWeeklySyncJob } from '@/jobs/external-updates-sync';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateArticleJob, gscWeeklySyncJob, externalUpdatesWeeklySyncJob],
});
