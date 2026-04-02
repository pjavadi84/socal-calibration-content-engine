import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/db/queries';
import { createServiceClient } from '@/lib/db/client';
import { updatePost, type WPCredentials } from '@/lib/wordpress/client';
import { generateArticleJsonLd, generateJsonLdScript } from '@/lib/jsonld/generators';

/**
 * POST /api/articles/repush
 *
 * Re-pushes all published articles that have a wp_post_id to WordPress.
 * This fixes stale content in WordPress (e.g. incorrect internal links,
 * outdated JSON-LD structured data) by regenerating JSON-LD and patching
 * the body HTML to replace old /blog/ URL prefixes, then updating the
 * WordPress post via the REST API.
 *
 * Query params:
 *   ?dry_run=true  — preview what would be updated without making changes
 */
export async function POST(request: NextRequest) {
  try {
    const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true';

    const settings = await getSettings();
    const creds: WPCredentials | undefined =
      settings.wp_site_url && settings.wp_username && settings.wp_app_password
        ? {
            siteUrl: settings.wp_site_url,
            username: settings.wp_username,
            appPassword: settings.wp_app_password,
          }
        : undefined;

    if (!creds && !dryRun) {
      return NextResponse.json(
        { error: 'WordPress credentials not configured in settings.' },
        { status: 400 }
      );
    }

    // Fetch all articles that have been pushed to WordPress
    const db = createServiceClient();
    const { data: articles, error } = await db
      .from('articles')
      .select(`
        id, title, slug, body_html, meta_title, meta_description,
        primary_keyword, seo_keywords, word_count, faq, json_ld,
        wp_post_id, wp_post_url, published_at,
        categories ( id, name, slug ),
        locations ( id, city, state )
      `)
      .not('wp_post_id', 'is', null)
      .not('body_html', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles with WordPress posts found.', results: [] });
    }

    // Build author info for JSON-LD
    let authorInfo: { name: string; title?: string; bio?: string; imageUrl?: string; profileUrl?: string } | undefined;
    if (settings.author_name) {
      authorInfo = {
        name: settings.author_name,
        title: settings.author_title || undefined,
        bio: settings.author_bio || undefined,
        imageUrl: settings.author_image_url || undefined,
        profileUrl: settings.author_profile_url || undefined,
      };
    }

    const results: Array<{
      id: string;
      title: string | null;
      slug: string | null;
      wp_post_id: number;
      status: 'updated' | 'skipped' | 'failed';
      changes: string[];
      error?: string;
    }> = [];

    for (const article of articles) {
      const changes: string[] = [];

      try {
        let bodyHtml = article.body_html || '';

        // 1. Fix internal links: /blog/slug → /slug
        const blogLinkPattern = /href="\/blog\//g;
        if (blogLinkPattern.test(bodyHtml)) {
          bodyHtml = bodyHtml.replace(/href="\/blog\//g, 'href="/');
          changes.push('Fixed internal link URLs (removed /blog/ prefix)');
        }

        // 2. Regenerate JSON-LD with corrected URLs (no /blog/ prefix)
        const loc = article.locations as unknown as { city: string; state: string } | null;
        const location = loc ? { city: loc.city, state: loc.state } : null;
        const cat = article.categories as unknown as { name: string } | null;

        const jsonLd = generateArticleJsonLd({
          article: {
            title: article.title || '',
            meta_description: article.meta_description || '',
            body_html: bodyHtml,
            word_count: article.word_count || 0,
            seo_keywords: (article.seo_keywords as string[]) || [],
            faq: article.faq as Array<{ question: string; answer: string }> | undefined,
          },
          location,
          category: cat?.name || 'Uncategorized',
          slug: article.slug,
          publishedAt: article.published_at,
          author: authorInfo,
        });

        const jsonLdScript = generateJsonLdScript(jsonLd);

        // 3. Replace old JSON-LD block in body HTML
        const jsonLdBlockPattern = /\n*<!-- JSON-LD Structured Data -->\n<script type="application\/ld\+json">[\s\S]*$/;
        if (jsonLdBlockPattern.test(bodyHtml)) {
          bodyHtml = bodyHtml.replace(
            jsonLdBlockPattern,
            `\n\n<!-- JSON-LD Structured Data -->\n${jsonLdScript}`
          );
          changes.push('Regenerated JSON-LD structured data with corrected URLs');
        }

        if (changes.length === 0) {
          results.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            wp_post_id: article.wp_post_id!,
            status: 'skipped',
            changes: ['No changes needed'],
          });
          continue;
        }

        if (dryRun) {
          results.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            wp_post_id: article.wp_post_id!,
            status: 'updated',
            changes: changes.map((c) => `[DRY RUN] ${c}`),
          });
          continue;
        }

        // 4. Update WordPress post
        const authorByline = settings.author_name
          ? `<p class="article-byline"><em>By ${settings.author_name}${settings.author_title ? `, ${settings.author_title}` : ''}</em></p>\n\n`
          : '';

        // Build full WP content (byline + body + JSON-LD)
        // Strip existing byline if present to avoid duplication
        let contentBody = bodyHtml;
        contentBody = contentBody.replace(
          /^<p class="article-byline"><em>By [^<]*<\/em><\/p>\n*/,
          ''
        );
        const wpContent = authorByline + contentBody;

        await updatePost(
          article.wp_post_id!,
          { content: wpContent },
          creds
        );

        // 5. Update body_html and json_ld in database
        const { error: updateError } = await db
          .from('articles')
          .update({
            body_html: bodyHtml,
            json_ld: jsonLd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) {
          throw new Error(`DB update failed: ${updateError.message}`);
        }

        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          wp_post_id: article.wp_post_id!,
          status: 'updated',
          changes,
        });
      } catch (err) {
        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          wp_post_id: article.wp_post_id!,
          status: 'failed',
          changes,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const updated = results.filter((r) => r.status === 'updated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      message: dryRun
        ? `Dry run complete. ${updated} articles would be updated, ${skipped} skipped.`
        : `Re-push complete. ${updated} updated, ${skipped} skipped, ${failed} failed.`,
      summary: { updated, skipped, failed, total: results.length },
      results,
    });
  } catch (error) {
    console.error('Bulk re-push failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Re-push failed' },
      { status: 500 }
    );
  }
}
