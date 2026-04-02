import { inngest } from './inngest';
import * as db from '@/lib/db/queries';
import { querySearchAnalytics, inspectUrl } from '@/lib/gsc/search-console';

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const gscWeeklySyncJob = inngest.createFunction(
  { id: 'gsc-weekly-sync' },
  { cron: '0 8 * * 1' }, // Mondays 08:00 UTC
  async ({ step }) => {
    const settings = await db.getSettings();
    if (!settings.gsc_enabled || !settings.gsc_refresh_token || !settings.gsc_site_url) {
      return { skipped: true };
    }

    const urlPrefix = settings.gsc_url_prefix || '/';

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const rows = await step.run('gsc-query-search-analytics', async () => {
      return querySearchAnalytics({
        refreshToken: settings.gsc_refresh_token!,
        siteUrl: settings.gsc_site_url!,
        startDate: toDateString(start),
        endDate: toDateString(end),
        urlPrefix,
        dimensions: ['page'],
        rowLimit: 250,
      });
    });

    await step.run('persist-page-metrics', async () => {
      // Search Analytics aggregates across range by default; we store it as "end date" snapshot
      const date = toDateString(end);
      const mapped = rows
        .map((r) => {
          const pageUrl = r.keys?.[0];
          if (!pageUrl) return null;
          return {
            page_url: pageUrl,
            date,
            clicks: Math.round(r.clicks || 0),
            impressions: Math.round(r.impressions || 0),
            ctr: r.ctr || 0,
            position: r.position || 0,
          };
        })
        .filter(Boolean) as Array<{
        page_url: string;
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;

      await db.upsertGscPageMetrics(mapped);
      return { count: mapped.length };
    });

    const published = await step.run('load-recent-published-articles', async () => {
      return db.getRecentPublishedArticlesWithUrls(20);
    });

    await step.run('url-inspection-best-effort', async () => {
      for (const a of published) {
        if (!a.wp_post_url) continue;
        try {
          const result = await inspectUrl({
            refreshToken: settings.gsc_refresh_token!,
            siteUrl: settings.gsc_site_url!,
            inspectionUrl: a.wp_post_url,
          });
          if (!result) continue;
          await db.insertGscUrlInspection({
            page_url: a.wp_post_url,
            verdict: result.verdict || null,
            coverage_state: result.coverageState || null,
            last_crawl_time: result.lastCrawlTime || null,
            canonical_url: result.canonicalUrl || null,
            robots_txt_state: result.robotsTxtState || null,
            indexing_state: result.indexingState || null,
          });
        } catch (err) {
          // URL inspection often fails if not enabled; ignore and continue
          console.error('GSC URL inspection failed:', err);
        }
      }
      return { inspected: published.length };
    });

    await step.run('refresh-queue-page2-opportunities', async () => {
      // Identify pages in 11–20 range from latest snapshot and map to articles by wp_post_url
      const snapshotDate = toDateString(end);
      const dbClient = (await import('@/lib/db/client')).createServiceClient();
      const { data: pageRows } = await dbClient
        .from('gsc_page_metrics')
        .select('page_url, clicks, impressions, ctr, position')
        .eq('date', snapshotDate)
        .gte('impressions', 10)
        .gte('position', 11)
        .lte('position', 20)
        .order('impressions', { ascending: false })
        .limit(30);

      const opportunities = (pageRows || []) as Array<{
        page_url: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;

      if (opportunities.length === 0) return { queued: 0 };

      // Load articles for mapping
      const { data: articleRows } = await dbClient
        .from('articles')
        .select('id, wp_post_url')
        .not('wp_post_url', 'is', null);

      const urlToArticleId = new Map<string, string>();
      for (const r of (articleRows || []) as Array<{ id: string; wp_post_url: string | null }>) {
        if (r.wp_post_url) urlToArticleId.set(r.wp_post_url, r.id);
      }

      let queued = 0;
      for (const o of opportunities) {
        const articleId = urlToArticleId.get(o.page_url);
        if (!articleId) continue;
        await db.upsertRefreshQueueItem({
          articleId,
          reason: 'Page 2 opportunity (avg position 11–20)',
          gscSnapshot: { snapshotDate, ...o },
          suggestedActions: {
            meta: true,
            internal_links: true,
            expand_sections: true,
          },
        });
        queued += 1;
      }
      return { queued };
    });

    return { success: true };
  }
);

