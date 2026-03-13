import { serve } from 'inngest/next';
import { inngest } from '@/jobs/inngest';
import { generateArticleJob } from '@/jobs/generate-article';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateArticleJob],
});
