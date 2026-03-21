import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, getSocialPostsByArticle, getSettings } from '@/lib/db/queries';
import { pushArticleToWordPress, type WPCredentials } from '@/lib/wordpress/client';
import { generateJsonLdScript } from '@/lib/jsonld/generators';
import { hasPendingPractitionerNotes, extractPractitionerNotes } from '@/lib/validation/practitioner-notes';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);
    const socialPosts = await getSocialPostsByArticle(id);

    return NextResponse.json({ article, socialPosts });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Article not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...updates } = body;

    // Helper to get WP credentials from DB settings
    async function getWPCreds(): Promise<WPCredentials | undefined> {
      try {
        const settings = await getSettings();
        if (settings.wp_site_url && settings.wp_username && settings.wp_app_password) {
          return {
            siteUrl: settings.wp_site_url,
            username: settings.wp_username,
            appPassword: settings.wp_app_password,
          };
        }
      } catch { /* fall through to env vars */ }
      return undefined;
    }

    // Helper to build author byline from settings
    async function getAuthorByline(): Promise<string | undefined> {
      try {
        const settings = await getSettings();
        if (settings.author_name) {
          const parts = [settings.author_name];
          if (settings.author_title) parts.push(settings.author_title);
          return `By ${parts.join(', ')}`;
        }
      } catch { /* ignore */ }
      return undefined;
    }

    // Handle special actions
    if (action === 'approve') {
      const article = await updateArticle(id, { status: 'approved' });

      // Auto-push if enabled (skip if practitioner notes remain)
      let wordpress: { wpPostId: number; wpPostUrl: string } | undefined;
      let pendingNotes: string[] | undefined;
      try {
        const settings = await getSettings();
        const hasNotes = article.body_html ? hasPendingPractitionerNotes(article.body_html) : false;
        if (hasNotes && article.body_html) {
          pendingNotes = extractPractitionerNotes(article.body_html);
        }
        if (settings.auto_push_on_approve && article.title && article.body_html && !hasNotes) {
          const creds = await getWPCreds();
          const fullArticle = await getArticleById(id);
          const { generateJsonLdScript } = await import('@/lib/jsonld/generators');
          const jsonLdScript = fullArticle.json_ld
            ? generateJsonLdScript(fullArticle.json_ld)
            : undefined;

          const authorByline = await getAuthorByline();
          wordpress = await pushArticleToWordPress({
            title: article.title,
            body_html: article.body_html,
            meta_title: article.meta_title || article.title,
            meta_description: article.meta_description || '',
            slug: article.slug || '',
            category_name: fullArticle.categories?.name || 'Uncategorized',
            json_ld: jsonLdScript,
            author_byline: authorByline,
          }, creds);

          await updateArticle(id, {
            wp_post_id: wordpress.wpPostId,
            wp_post_url: wordpress.wpPostUrl,
          });
        }
      } catch (err) {
        console.error('Auto-push to WordPress failed:', err);
        // Don't block approval on WP failure
      }

      // Re-fetch to get latest state (including wp fields if auto-pushed)
      const latest = await getArticleById(id);
      return NextResponse.json({ article: latest, wordpress, pendingNotes });
    }

    if (action === 'reject') {
      const article = await updateArticle(id, { status: 'rejected' });
      return NextResponse.json({ article });
    }

    if (action === 'push_to_wordpress') {
      const article = await getArticleById(id);

      if (!article.title || !article.body_html) {
        return NextResponse.json(
          { error: 'Article has no content to push' },
          { status: 400 }
        );
      }

      // Block push if practitioner notes remain unfilled
      if (hasPendingPractitionerNotes(article.body_html)) {
        const pendingNotes = extractPractitionerNotes(article.body_html);
        return NextResponse.json(
          {
            error: 'Article has unresolved practitioner notes. Please fill in or remove all <!-- PRACTITIONER_NOTE: --> comments before pushing.',
            pendingNotes,
          },
          { status: 422 }
        );
      }

      const jsonLdScript = article.json_ld
        ? generateJsonLdScript(article.json_ld)
        : undefined;

      const creds = await getWPCreds();
      const authorByline = await getAuthorByline();
      const wpResult = await pushArticleToWordPress({
        title: article.title,
        body_html: article.body_html,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || '',
        slug: article.slug || '',
        category_name: article.categories?.name || 'Uncategorized',
        json_ld: jsonLdScript,
        author_byline: authorByline,
      }, creds);

      const updated = await updateArticle(id, {
        wp_post_id: wpResult.wpPostId,
        wp_post_url: wpResult.wpPostUrl,
      });

      return NextResponse.json({ article: updated, wordpress: wpResult });
    }

    // Generic update
    const article = await updateArticle(id, updates);
    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
