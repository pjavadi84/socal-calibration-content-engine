import { inngest } from './inngest';
import { generateArticle } from '@/lib/services/article-generation';
import { generateSocialPosts } from '@/lib/services/social-generation';
import * as db from '@/lib/db/queries';

/**
 * Background job: Generate a single article
 * Triggered by: content/article.generate event
 */
export const generateArticleJob = inngest.createFunction(
  {
    id: 'generate-article',
    concurrency: { limit: 5 },
    retries: 3,
  },
  { event: 'content/article.generate' },
  async ({ event, step }) => {
    const { pillarId, categoryId, locationId, targetLength, batchId } =
      event.data;

    // Step 1: Generate the article
    const result = await step.run('generate-article', async () => {
      return generateArticle({
        pillarId,
        categoryId,
        locationId,
        targetLength: targetLength || 'long',
        batchId,
      });
    });

    // Step 2: Generate social posts
    await step.run('generate-social-posts', async () => {
      const article = await db.getArticleById(result.articleId);
      const location = article.locations;
      const locationName = location
        ? `${location.display_name}`
        : 'Southern California';

      return generateSocialPosts(
        result.articleId,
        result.title,
        article.meta_description || '',
        locationName
      );
    });

    // Step 3: Update batch progress if part of a batch
    if (batchId) {
      await step.run('update-batch', async () => {
        // Increment completed_items — in production, use an RPC for atomic increment
        return db.updateBatch(batchId, {
          completed_items: 1, // Will be replaced with atomic increment via RPC
        });
      });
    }

    return {
      articleId: result.articleId,
      title: result.title,
      seoScore: result.seoScore,
      wordCount: result.wordCount,
    };
  }
);
