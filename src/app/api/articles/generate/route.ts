import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateArticle } from '@/lib/services/article-generation';

const GenerateArticleRequestSchema = z.object({
  pillarId: z.string().uuid(),
  categoryId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  targetLength: z.enum(['short', 'medium', 'long']).optional().default('long'),
  preGeneratedTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateArticleRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await generateArticle(parsed.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Article generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
