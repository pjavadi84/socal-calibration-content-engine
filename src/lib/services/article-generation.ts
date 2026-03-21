import { generateJSON } from '@/lib/llm';
import {
  buildArticlePrompt,
  buildKeywordExtractionPrompt,
  GeneratedArticleSchema,
  ExtractedKeywordsSchema,
  type ArticleLength,
} from '@/lib/prompts/article';
import { selectVariation } from '@/lib/prompts/variation';
import { calculateSEOScore } from '@/lib/seo/scoring';
import { generateArticleJsonLd } from '@/lib/jsonld/generators';
import { retrieveKnowledge } from '@/lib/knowledge';
import { retrieveAuthoritativeContext } from '@/lib/authoritative';
import { injectClusterLinks } from '@/lib/services/cluster-linking';
import { fillPractitionerNotes } from '@/lib/services/practitioner-fill';
import { generateArticleImages } from '@/lib/services/article-images';
import { refineForYoast } from '@/lib/services/yoast-refinement';
import * as db from '@/lib/db/queries';

// ─── Content Velocity Controls ───────────────────────────────────────

const VELOCITY_SCHEDULE = [
  { maxMonth: 2, limit: 12 },
  { maxMonth: 4, limit: 20 },
  { maxMonth: Infinity, limit: 30 },
] as const;

// Engine launch date — used to calculate which velocity tier we're in
const ENGINE_LAUNCH_DATE = new Date('2026-03-17');

function getMonthlyArticleLimit(): number {
  const now = new Date();
  const monthsActive = Math.max(
    0,
    (now.getFullYear() - ENGINE_LAUNCH_DATE.getFullYear()) * 12 +
      (now.getMonth() - ENGINE_LAUNCH_DATE.getMonth())
  );

  for (const tier of VELOCITY_SCHEDULE) {
    if (monthsActive < tier.maxMonth) {
      return tier.limit;
    }
  }
  return 30;
}

export async function checkVelocityLimit(): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const limit = getMonthlyArticleLimit();

  const { count } = await db.getArticles({
    limit: 1,
    offset: 0,
  });

  // Count articles created this month by querying with date filter
  const dbClient = (await import('@/lib/db/client')).createServiceClient();
  const { count: monthCount } = await dbClient
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)
    .neq('status', 'failed');

  const currentCount = monthCount || 0;
  return { allowed: currentCount < limit, currentCount, limit };
}

// ─── Article Generation ──────────────────────────────────────────────

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
  knowledgeSources: string[];
  factDensityScore: number;
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

  // Check velocity limit
  const velocity = await checkVelocityLimit();
  if (!velocity.allowed) {
    throw new Error(
      `Monthly article limit reached (${velocity.currentCount}/${velocity.limit}). ` +
        `Content velocity is ramped gradually to avoid scaled content abuse detection.`
    );
  }

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
    // 2.5. Retrieve knowledge context (RAG step)
    const knowledgeResult = retrieveKnowledge({
      pillar: pillar.name,
      category: category.name,
      location: location?.city || null,
      equipmentType: category.name,
      industry: null,
    });

    // 2.55. Retrieve business context
    const businessResult = retrieveKnowledge({
      pillar: pillar.name,
      category: category.name,
      location: location?.city || null,
      equipmentType: null,
      industry: category.name,
      pathPrefix: 'business-context/',
      maxChars: 3000,
    });

    // 2.6. Retrieve authoritative context (Phase 6)
    let authoritativeContext = { context: '', sources: [] as string[] };
    try {
      const settings = await db.getSettings();
      if (settings.authoritative_apis_enabled) {
        const apiConfig = settings.authoritative_apis_config as Record<string, boolean>;
        authoritativeContext = await retrieveAuthoritativeContext(
          {
            pillar: pillar.name,
            category: category.name,
            location: location?.city || null,
            equipmentType: category.name,
            industry: null,
          },
          apiConfig
        );
      }
    } catch (err) {
      console.error('Authoritative API retrieval failed, continuing without:', err);
    }

    // 3. Generate article content (Step 1)
    // Select content variation for AI detection resistance
    const variationSeed = pillar.name + category.name + (location?.city || '');
    const variation = selectVariation(variationSeed);

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
      knowledgeContext: knowledgeResult.context || null,
      authoritativeContext: authoritativeContext.context || null,
      businessContext: businessResult.context || null,
      styleDirective: variation.styleDirective,
      articleFormat: variation.formatInstructions || undefined,
    });

    const contentResult = await generateJSON(prompt, GeneratedArticleSchema, {
      systemPrompt: variation.systemPrompt,
      temperature: variation.temperature,
      maxTokens: 16384,
    });

    const generated = contentResult.content;

    // 3.5. Auto-fill practitioner note placeholders using Gemini
    let filledBodyHtml = generated.body_html;
    let notesFilled = 0;
    try {
      const fillResult = await fillPractitionerNotes(generated.body_html, {
        pillar: pillar.name,
        category: category.name,
        location: location?.city || null,
        articleTitle: generated.title,
      });
      filledBodyHtml = fillResult.filledHtml;
      notesFilled = fillResult.notesFilled;
    } catch (err) {
      console.error('Practitioner note auto-fill failed, continuing with placeholders:', err);
    }

    // 4. Extract keywords (Step 2 — separate call, content-first)
    const keywordPrompt = buildKeywordExtractionPrompt(
      filledBodyHtml,
      location
    );

    const keywordResult = await generateJSON(
      keywordPrompt,
      ExtractedKeywordsSchema,
      { temperature: 0.3, maxTokens: 2048 }
    );

    const keywords = keywordResult.content;

    // 4.5. Yoast SEO refinement — ensure primary keyword is in meta title, meta description, first paragraph, and slug
    const slug = generated.slug_candidates[0] || '';
    const yoastRefined = refineForYoast({
      title: generated.title,
      metaTitle: generated.meta_title,
      metaDescription: generated.meta_description,
      bodyHtml: filledBodyHtml,
      primaryKeyword: keywords.primary_keyword,
      slug,
    });
    filledBodyHtml = yoastRefined.bodyHtml;
    const refinedMetaTitle = yoastRefined.metaTitle;
    const refinedMetaDescription = yoastRefined.metaDescription;
    const refinedSlug = yoastRefined.slug;

    // 5. Generate JSON-LD (moved before SEO scoring so scorer can check presence)

    // Build author info from settings (fetched earlier at line ~151)
    let authorSettings: { name: string; title?: string; bio?: string; imageUrl?: string; profileUrl?: string } | undefined;
    try {
      const settings = await db.getSettings();
      if (settings.author_name) {
        authorSettings = {
          name: settings.author_name,
          title: settings.author_title || undefined,
          bio: settings.author_bio || undefined,
          imageUrl: settings.author_image_url || undefined,
          profileUrl: settings.author_profile_url || undefined,
        };
      }
    } catch {
      // Settings may have already been fetched above; ignore errors
    }

    const jsonLd = generateArticleJsonLd({
      article: {
        title: generated.title,
        meta_description: refinedMetaDescription,
        body_html: filledBodyHtml,
        word_count: generated.word_count,
        seo_keywords: keywords.seo_keywords,
        faq: generated.faq,
      },
      location,
      category: category.name,
      slug: refinedSlug,
      author: authorSettings,
    });

    // 5.5. Cluster linking — inject links to sibling articles in same pillar/category
    let enrichedBodyHtml = filledBodyHtml;
    let clusterLinksAdded = 0;
    try {
      const siblings = await db.getSiblingArticles(article.id, pillarId, categoryId);
      if (siblings.length > 0) {
        const clusterResult = injectClusterLinks(filledBodyHtml, siblings, 3);
        enrichedBodyHtml = clusterResult.enrichedHtml;
        clusterLinksAdded = clusterResult.clusterLinksAdded;
      }
    } catch (err) {
      console.error('Cluster linking failed, continuing without:', err);
    }

    // 5.7. Generate and inject article images using Gemini
    try {
      const imageResult = await generateArticleImages(
        enrichedBodyHtml,
        article.id,
        generated.title,
        category.name,
        3,
        keywords.primary_keyword
      );
      enrichedBodyHtml = imageResult.enrichedHtml;
    } catch (err) {
      console.error('Article image generation failed, continuing without:', err);
    }

    // 6. Calculate SEO score (deterministic, no LLM)
    const seoAnalysis = calculateSEOScore({
      title: generated.title,
      meta_title: refinedMetaTitle,
      meta_description: refinedMetaDescription,
      content: enrichedBodyHtml,
      slug: refinedSlug,
      seo_keywords: keywords.seo_keywords,
      primary_keyword: keywords.primary_keyword,
      json_ld: jsonLd,
      clusterLinks: clusterLinksAdded,
    });

    // 7. Update article with all generated content
    const updatedArticle = await db.updateArticle(article.id, {
      status: 'pending_review',
      title: generated.title,
      body_html: enrichedBodyHtml,
      meta_title: refinedMetaTitle,
      meta_description: refinedMetaDescription,
      h2_structure: generated.h2_structure,
      slug_candidates: generated.slug_candidates,
      slug: refinedSlug,
      faq: generated.faq,
      word_count: generated.word_count,
      primary_keyword: keywords.primary_keyword,
      seo_keywords: keywords.seo_keywords,
      long_tail_keywords: keywords.long_tail_keywords || [],
      seo_score: seoAnalysis.total,
      seo_breakdown: seoAnalysis.breakdown,
      json_ld: jsonLd,
      fact_density_score: seoAnalysis.factDensity,
      fact_density_breakdown: seoAnalysis.breakdown.factDensity,
      knowledge_sources: [...knowledgeResult.sources, ...businessResult.sources, ...authoritativeContext.sources],
      practitioner_notes_added: notesFilled > 0,
    });

    return {
      articleId: updatedArticle.id,
      title: generated.title,
      seoScore: seoAnalysis.total,
      wordCount: generated.word_count,
      status: 'pending_review',
      knowledgeSources: knowledgeResult.sources,
      factDensityScore: seoAnalysis.factDensity,
    };
  } catch (error) {
    // Mark article as failed
    await db.updateArticle(article.id, {
      status: 'failed',
    });
    throw error;
  }
}
