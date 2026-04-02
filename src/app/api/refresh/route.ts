import { NextRequest, NextResponse } from 'next/server';
import { listRefreshQueue, updateRefreshQueueStatus } from '@/lib/db/queries';

export async function GET() {
  try {
    const items = await listRefreshQueue();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch refresh queue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch refresh queue' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    await updateRefreshQueueStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update refresh queue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update refresh queue' },
      { status: 500 }
    );
  }
}

