import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, getSocialPostsByArticle } from '@/lib/db/queries';
import { pushArticleToWordPress } from '@/lib/wordpress/client';
import { generateJsonLdScript } from '@/lib/jsonld/generators';

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

    // Handle special actions
    if (action === 'approve') {
      const article = await updateArticle(id, { status: 'approved' });
      return NextResponse.json({ article });
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

      const jsonLdScript = article.json_ld
        ? generateJsonLdScript(article.json_ld)
        : undefined;

      const wpResult = await pushArticleToWordPress({
        title: article.title,
        body_html: article.body_html,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || '',
        slug: article.slug || '',
        category_name: article.categories?.name || 'Uncategorized',
        json_ld: jsonLdScript,
      });

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
