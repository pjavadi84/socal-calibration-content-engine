import { getArticleStats } from '@/lib/db/queries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  CalendarDays,
  Search,
  FlaskConical,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getArticleStats();
  let gscSummary:
    | { enabled: boolean; summary28?: { clicks: number; impressions: number; ctr: number | null; avgPosition: number | null }; refreshQueueCount?: number }
    | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/gsc/summary`, { cache: 'no-store' });
    if (res.ok) gscSummary = await res.json();
  } catch {
    gscSummary = null;
  }

  // Velocity limit based on age (simplified — first 2 months = 12/mo)
  const monthlyLimit = 12;

  const cards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      icon: FileText,
    },
    {
      title: 'This Month',
      value: `${stats.articlesThisMonth}/${monthlyLimit}`,
      icon: CalendarDays,
    },
    {
      title: 'Avg SEO Score',
      value: stats.avgSeoScore || '—',
      icon: Search,
    },
    {
      title: 'Avg Fact Density',
      value: stats.avgFactDensity || '—',
      icon: FlaskConical,
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Search Console (last 28 days)
          </CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {!gscSummary?.enabled && (
            <div className="text-sm text-muted-foreground">
              Connect Google Search Console in{' '}
              <Link href="/settings" className="underline underline-offset-4">
                Settings
              </Link>{' '}
              to track rankings and guide velocity ramping.
            </div>
          )}
          {gscSummary?.enabled && (
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Impressions</div>
                <div className="text-lg font-semibold">{gscSummary.summary28?.impressions ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Clicks</div>
                <div className="text-lg font-semibold">{gscSummary.summary28?.clicks ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">CTR</div>
                <div className="text-lg font-semibold">
                  {gscSummary.summary28?.ctr != null ? `${Math.round(gscSummary.summary28.ctr * 1000) / 10}%` : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Position</div>
                <div className="text-lg font-semibold">
                  {gscSummary.summary28?.avgPosition != null ? (Math.round(gscSummary.summary28.avgPosition * 10) / 10).toFixed(1) : '—'}
                </div>
              </div>
            </div>
          )}

          {gscSummary?.enabled && (
            <div className="text-sm text-muted-foreground">
              Refresh opportunities queued:{' '}
              <span className="font-medium text-foreground">
                {gscSummary.refreshQueueCount ?? 0}
              </span>{' '}
              (see the Refresh Queue page).
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(stats.statusCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Articles by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-lg font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
