import { inngest } from './inngest';
import { fetchNistUpdates } from '@/lib/external-updates/nist';
import { fetchIsoRevisionAlerts } from '@/lib/external-updates/iso';
import * as db from '@/lib/db/queries';

export const externalUpdatesWeeklySyncJob = inngest.createFunction(
  { id: 'external-updates-weekly-sync' },
  { cron: '30 8 * * 1' }, // Mondays 08:30 UTC
  async ({ step }) => {
    const settings = await db.getSettings();

    const updates: Array<{
      source: string;
      title: string;
      url: string;
      published_at: string | null;
      summary: string | null;
      metadata: unknown;
    }> = [];

    if (settings.authoritative_nist_enabled) {
      const nist = await step.run('fetch-nist', async () => fetchNistUpdates(25));
      for (const u of nist) {
        updates.push({
          source: u.source,
          title: u.title,
          url: u.url,
          published_at: u.published_at,
          summary: u.summary || null,
          metadata: u.metadata || {},
        });
      }
    }

    if (settings.authoritative_iso_alerts_enabled) {
      const iso = await step.run('fetch-iso', async () => fetchIsoRevisionAlerts(10));
      for (const u of iso) {
        updates.push({
          source: u.source,
          title: u.title,
          url: u.url,
          published_at: u.published_at,
          summary: u.summary || null,
          metadata: u.metadata || {},
        });
      }
    }

    if (updates.length === 0) return { skipped: true };

    await step.run('persist-updates', async () => {
      const dbClient = (await import('@/lib/db/client')).createServiceClient();
      const { error } = await dbClient
        .from('external_updates')
        .upsert(
          updates.map((u) => ({
            source: u.source,
            title: u.title,
            url: u.url,
            published_at: u.published_at,
            summary: u.summary,
            metadata: u.metadata as never,
            fetched_at: new Date().toISOString(),
          })),
          { onConflict: 'source,url' }
        );
      if (error) throw new Error(error.message);
      return { count: updates.length };
    });

    return { success: true, count: updates.length };
  }
);

