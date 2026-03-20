import { NextResponse } from 'next/server';
import { getArticleStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const stats = await getArticleStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
