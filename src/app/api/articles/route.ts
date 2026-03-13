import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') || undefined,
      pillar_id: searchParams.get('pillar_id') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      location_id: searchParams.get('location_id') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const { data, count } = await getArticles(filters);

    return NextResponse.json({
      articles: data,
      total: count,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
