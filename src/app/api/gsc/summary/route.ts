import { NextResponse } from 'next/server';
import { getSettings, getGscSummary, listRefreshQueue } from '@/lib/db/queries';

export async function GET() {
  try {
    const settings = await getSettings();
    if (!settings.gsc_enabled) {
      return NextResponse.json({ enabled: false });
    }

    const urlPrefix = settings.gsc_url_prefix || '/blog/';
    const summary28 = await getGscSummary({ urlPrefix, days: 28 });
    const refreshQueue = await listRefreshQueue();

    return NextResponse.json({
      enabled: true,
      siteUrl: settings.gsc_site_url,
      urlPrefix,
      summary28,
      refreshQueueCount: refreshQueue.filter((r: any) => r.status === 'queued').length,
    });
  } catch (error) {
    console.error('Failed to fetch GSC summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch GSC summary' },
      { status: 500 }
    );
  }
}

