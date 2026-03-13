import { generateJSON } from '@/lib/llm';
import {
  buildArticlePrompt,
  buildKeywordExtractionPrompt,
  GeneratedArticleSchema,
  ExtractedKeywordsSchema,
  type ArticleLength,
} from '@/lib/prompts/article';
import { calculateSEOScore } from '@/lib/seo/scoring';
import { generateArticleJsonLd } from '@/lib/jsonld/generators';
import * as db from '@/lib/db/queries';

export interface GenerateArticleParams {
  pillarId: string;
  categoryId: string;
  locationId?: string;
  targetLength?: ArticleLength;
  preGeneratedTitle?: string;
  batchId?: string;
}

export interface GenerateArticleResult {
  articleId: string;
  title: string;
  seoScore: number;
  wordCount: number;
  status: string;
}

export async function generateArticle(
  params: GenerateArticleParams
): Promise<GenerateArticleResult> {
  const {
    pillarId,
    categoryId,
    locationId,
    targetLength = 'long',
    preGeneratedTitle,
    batchId,
  } = params;

  // 1. Fetch context
  const [pillar, category, location, internalLinks] = await Promise.all([
    db.getPillarById(pillarId),
    db.getCategoryById(categoryId),
    locationId ? db.getLocationById(locationId) : Promise.resolve(null),
    db.getInternalLinks(),
  ]);

  // 2. Create article record with "generating" status
  const article = await db.createArticle({
    pillar_id: pillarId,
    category_id: categoryId,
    location_id: locationId || null,
    status: 'generating',
    generation_batch_id: batchId || null,
  });

  try {
    // 3. Generate article content (Step 1)
    const prompt = buildArticlePrompt({
      pillar: { name: pillar.name, description: pillar.description || '' },
      category: { name: category.name, description: category.description || '' },
      location,
      internalLinks: internalLinks.map((l: Record<string, string>) => ({
        url: l.url,
        anchor_text: l.anchor_text,
        page_type: l.page_type,
      })),
      targetLength,
      preGeneratedTitle,
    });

    const contentResult = await generateJSON(prompt, GeneratedArticleSchema, {
      systemPrompt:
        'You are a technical content writer for SoCal Calibration, a precision calibration company in Southern California. Write authoritative, SEO-optimized articles.',
      temperature: 0.7,
      maxTokens: 16384,
    });

    const generated = contentResult.content;

    // 4. Extract keywords (Step 2 — separate call, content-first)
    const keywordPrompt = buildKeywordExtractionPrompt(
      generated.body_html,
      location
    );

    const keywordResult = await generateJSON(
      keywordPrompt,
      ExtractedKeywordsSchema,
      { temperature: 0.3, maxTokens: 2048 }
    );

    const keywords = keywordResult.content;

    // 5. Calculate SEO score (deterministic, no LLM)
    const slug = generated.slug_candidates[0] || '';
    const seoAnalysis = calculateSEOScore({
      title: generated.title,
      meta_description: generated.meta_description,
      content: generated.body_html,
      slug,
      seo_keywords: keywords.seo_keywords,
      primary_keyword: keywords.primary_keyword,
    });

    // 6. Generate JSON-LD
    const jsonLd = generateArticleJsonLd({
      article: {
        title: generated.title,
        meta_description: generated.meta_description,
        body_html: generated.body_html,
        word_count: generated.word_count,
        seo_keywords: keywords.seo_keywords,
        faq: generated.faq,
      },
      location,
      category: category.name,
      slug,
    });

    // 7. Update article with all generated content
    const updatedArticle = await db.updateArticle(article.id, {
      status: 'pending_review',
      title: generated.title,
      body_html: generated.body_html,
      meta_title: generated.meta_title,
      meta_description: generated.meta_description,
      h2_structure: generated.h2_structure,
      slug_candidates: generated.slug_candidates,
      slug: slug,
      faq: generated.faq,
      word_count: generated.word_count,
      primary_keyword: keywords.primary_keyword,
      seo_keywords: keywords.seo_keywords,
      long_tail_keywords: keywords.long_tail_keywords || [],
      seo_score: seoAnalysis.total,
      seo_breakdown: seoAnalysis.breakdown,
      json_ld: jsonLd,
    });

    return {
      articleId: updatedArticle.id,
      title: generated.title,
      seoScore: seoAnalysis.total,
      wordCount: generated.word_count,
      status: 'pending_review',
    };
  } catch (error) {
    // Mark article as failed
    await db.updateArticle(article.id, {
      status: 'failed',
    });
    throw error;
  }
}
