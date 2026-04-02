/**
 * Regenerate Missing Articles Script
 *
 * Regenerates 6 specific articles that were lost from the database,
 * then auto-approves and pushes them to WordPress.
 *
 * Usage:
 *   npx tsx scripts/regenerate-missing-articles.ts
 *
 * Prerequisites:
 *   - Dev server running at http://localhost:3000
 *   - WordPress credentials configured in settings
 *   - Gemini API key configured
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

interface ArticleSpec {
  pillarId: string;
  categoryId: string;
  locationId?: string;
  targetLength: 'long';
  expectedSlug: string;
  description: string;
}

// Map each lost article to its content matrix coordinates
const ARTICLES_TO_REGENERATE: ArticleSpec[] = [
  {
    // NIST Traceability & Measurement Accuracy
    pillarId: 'a0000000-0000-0000-0000-000000000002', // Industry Compliance
    categoryId: 'b0000000-0000-0000-0000-000000000011', // NIST Traceability
    targetLength: 'long',
    expectedSlug: 'nist-traceability-measurement-accuracy',
    description: 'NIST Traceability & Measurement Accuracy (Industry Compliance)',
  },
  {
    // Industrial Scale Calibration SoCal Guide
    pillarId: 'a0000000-0000-0000-0000-000000000001', // Calibration Services
    categoryId: 'b0000000-0000-0000-0000-000000000001', // Scale Calibration
    targetLength: 'long',
    expectedSlug: 'industrial-scale-calibration-socal-guide',
    description: 'Industrial Scale Calibration SoCal Guide (Calibration Services, no location)',
  },
  {
    // Mastering Scale Calibration in Irvine, CA
    pillarId: 'a0000000-0000-0000-0000-000000000001', // Calibration Services
    categoryId: 'b0000000-0000-0000-0000-000000000001', // Scale Calibration
    locationId: 'c0000000-0000-0000-0000-000000000001', // Irvine, CA
    targetLength: 'long',
    expectedSlug: 'mastering-scale-calibration-irvine-ca',
    description: 'Scale Calibration in Irvine, CA (Calibration Services + Location)',
  },
  {
    // Industrial Scales & Balances Calibration Guide
    pillarId: 'a0000000-0000-0000-0000-000000000003', // Equipment Guides
    categoryId: 'b0000000-0000-0000-0000-000000000019', // Scales & Balances
    targetLength: 'long',
    expectedSlug: 'industrial-scales-balances-calibration-guide',
    description: 'Scales & Balances Calibration Guide (Equipment Guides)',
  },
  {
    // Precision Scale Calibration in San Diego
    pillarId: 'a0000000-0000-0000-0000-000000000001', // Calibration Services
    categoryId: 'b0000000-0000-0000-0000-000000000001', // Scale Calibration
    locationId: 'c0000000-0000-0000-0000-000000000022', // San Diego, CA
    targetLength: 'long',
    expectedSlug: 'precision-scale-calibration-san-diego',
    description: 'Scale Calibration in San Diego (Calibration Services + Location)',
  },
  {
    // Medical Device Calibration Safety & Compliance
    pillarId: 'a0000000-0000-0000-0000-000000000001', // Calibration Services
    categoryId: 'b0000000-0000-0000-0000-000000000006', // Medical Equipment Calibration
    targetLength: 'long',
    expectedSlug: 'medical-device-calibration-safety-compliance',
    description: 'Medical Device Calibration Safety & Compliance (Calibration Services)',
  },
];

async function apiCall(path: string, method: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function regenerateArticle(spec: ArticleSpec, index: number) {
  const label = `[${index + 1}/${ARTICLES_TO_REGENERATE.length}]`;

  console.log(`\n${label} Generating: ${spec.description}`);
  console.log(`     Pillar: ${spec.pillarId}`);
  console.log(`     Category: ${spec.categoryId}`);
  if (spec.locationId) console.log(`     Location: ${spec.locationId}`);

  // Step 1: Generate article
  console.log(`${label} Step 1/3: Generating article content (this may take 1-2 minutes)...`);
  const generateResult = await apiCall('/api/articles/generate', 'POST', {
    pillarId: spec.pillarId,
    categoryId: spec.categoryId,
    locationId: spec.locationId,
    targetLength: spec.targetLength,
  });

  const articleId = generateResult.articleId;
  console.log(`${label} Generated: "${generateResult.title}" (SEO: ${generateResult.seoScore}, Words: ${generateResult.wordCount})`);
  console.log(`${label} Article ID: ${articleId}`);

  // Step 2: Approve (triggers auto-push if enabled in settings)
  console.log(`${label} Step 2/3: Approving article...`);
  const approveResult = await apiCall(`/api/articles/${articleId}`, 'PATCH', {
    action: 'approve',
  });

  if (approveResult.wordpress) {
    console.log(`${label} Auto-pushed to WordPress: ${approveResult.wordpress.wpPostUrl}`);
    console.log(`${label} WP Post ID: ${approveResult.wordpress.wpPostId}`);
    return {
      ...spec,
      articleId,
      title: generateResult.title,
      seoScore: generateResult.seoScore,
      wordCount: generateResult.wordCount,
      wpPostUrl: approveResult.wordpress.wpPostUrl,
      wpPostId: approveResult.wordpress.wpPostId,
      pushed: true,
    };
  }

  // Step 3: Manual push if auto-push is not enabled
  console.log(`${label} Step 3/3: Pushing to WordPress...`);
  const pushResult = await apiCall(`/api/articles/${articleId}`, 'PATCH', {
    action: 'push_to_wordpress',
  });

  console.log(`${label} Pushed to WordPress: ${pushResult.wordpress.wpPostUrl}`);

  return {
    ...spec,
    articleId,
    title: generateResult.title,
    seoScore: generateResult.seoScore,
    wordCount: generateResult.wordCount,
    wpPostUrl: pushResult.wordpress.wpPostUrl,
    wpPostId: pushResult.wordpress.wpPostId,
    pushed: true,
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('SoCal Calibration — Regenerate Missing Articles');
  console.log('='.repeat(70));
  console.log(`\nTarget: ${ARTICLES_TO_REGENERATE.length} articles`);
  console.log(`Server: ${BASE_URL}`);

  // Verify server is reachable
  try {
    await fetch(`${BASE_URL}/api/stats`);
  } catch {
    console.error(`\nERROR: Cannot reach ${BASE_URL}. Is the dev server running?`);
    console.error('Start it with: pnpm dev');
    process.exit(1);
  }

  const results: Array<Record<string, unknown>> = [];
  const errors: Array<{ spec: ArticleSpec; error: string }> = [];

  // Generate sequentially to avoid rate limits and respect velocity checks
  for (let i = 0; i < ARTICLES_TO_REGENERATE.length; i++) {
    const spec = ARTICLES_TO_REGENERATE[i];
    try {
      const result = await regenerateArticle(spec, i);
      results.push(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n[${i + 1}/${ARTICLES_TO_REGENERATE.length}] FAILED: ${msg}`);
      errors.push({ spec, error: msg });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nSucceeded: ${results.length}`);
  console.log(`Failed:    ${errors.length}`);

  if (results.length > 0) {
    console.log('\nGenerated Articles:');
    for (const r of results) {
      console.log(`  - ${r.title}`);
      console.log(`    URL: ${r.wpPostUrl}`);
      console.log(`    SEO: ${r.seoScore} | Words: ${r.wordCount}`);
    }
  }

  if (errors.length > 0) {
    console.log('\nFailed Articles:');
    for (const e of errors) {
      console.log(`  - ${e.spec.description}`);
      console.log(`    Error: ${e.error}`);
    }
  }

  console.log('\nNext steps:');
  console.log('  1. Review the articles in the dashboard');
  console.log('  2. In WordPress, change each post from Draft to Published');
  console.log('  3. Request re-indexing in Google Search Console for each URL');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
