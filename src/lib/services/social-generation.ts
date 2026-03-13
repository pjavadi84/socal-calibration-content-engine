import { generateJSON } from '@/lib/llm';
import {
  buildSocialPostPrompt,
  SocialPostSchema,
  type SocialVariant,
} from '@/lib/prompts/social';
import * as db from '@/lib/db/queries';

const VARIANTS: SocialVariant[] = ['educational', 'practical', 'promotional'];

export interface GenerateSocialPostsResult {
  posts: Array<{
    variant: SocialVariant;
    postId: string;
    content: string;
    hashtags: string[];
    callToAction: string;
  }>;
  status: 'success' | 'partial' | 'error';
  error?: string;
}

export async function generateSocialPosts(
  articleId: string,
  articleTitle: string,
  articleSummary: string,
  location?: string
): Promise<GenerateSocialPostsResult> {
  const posts: GenerateSocialPostsResult['posts'] = [];
  const errors: string[] = [];

  for (const variant of VARIANTS) {
    try {
      const prompt = buildSocialPostPrompt({
        articleTitle,
        articleSummary,
        location,
        variant,
      });

      const result = await generateJSON(prompt, SocialPostSchema, {
        temperature: 0.8,
        maxTokens: 1024,
      });

      const post = result.content;

      // Validate content length
      if (post.content.length < 50) {
        errors.push(`${variant}: content too short (${post.content.length} chars)`);
        continue;
      }

      const saved = await db.createSocialPost({
        article_id: articleId,
        variant,
        platform: 'linkedin',
        content: post.content,
        hashtags: post.hashtags,
        call_to_action: post.call_to_action,
        is_selected: false,
      });

      posts.push({
        variant,
        postId: saved.id,
        content: post.content,
        hashtags: post.hashtags,
        callToAction: post.call_to_action,
      });

      // Brief pause between generations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      errors.push(
        `${variant}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  if (posts.length === VARIANTS.length) {
    return { posts, status: 'success' };
  } else if (posts.length > 0) {
    return { posts, status: 'partial', error: errors.join('; ') };
  } else {
    return { posts: [], status: 'error', error: errors.join('; ') };
  }
}
