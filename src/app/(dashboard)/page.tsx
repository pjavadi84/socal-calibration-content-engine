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
} from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getArticleStats();

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
