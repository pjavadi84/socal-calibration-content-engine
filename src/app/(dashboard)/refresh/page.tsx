import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type RefreshItem = {
  id: string;
  article_id: string;
  status: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
  gsc_snapshot: any;
  articles?: {
    title?: string | null;
    wp_post_url?: string | null;
    primary_keyword?: string | null;
  } | null;
};

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'queued') return 'secondary';
  if (status === 'failed') return 'destructive';
  if (status === 'completed') return 'outline';
  return 'default';
}

async function fetchQueue(): Promise<RefreshItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/refresh`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export default async function RefreshQueuePage() {
  const items = await fetchQueue();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Refresh Queue</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Opportunities (GSC-driven)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No refresh items yet. Once GSC is connected and the weekly sync runs, page-2 opportunities will show up here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Primary keyword</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Snapshot</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[380px] truncate">
                      {item.articles?.wp_post_url ? (
                        <a
                          className="underline underline-offset-4"
                          href={item.articles.wp_post_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.articles?.title || item.article_id}
                        </a>
                      ) : (
                        item.articles?.title || item.article_id
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {item.articles?.primary_keyword || '—'}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">{item.reason || '—'}</TableCell>
                    <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                      {item.gsc_snapshot ? JSON.stringify(item.gsc_snapshot) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form
                          action={async () => {
                            'use server';
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                            await fetch(`${baseUrl}/api/refresh`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, status: 'dismissed' }),
                            });
                          }}
                        >
                          <Button variant="outline" size="sm" type="submit">
                            Dismiss
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            'use server';
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                            await fetch(`${baseUrl}/api/refresh`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, status: 'completed' }),
                            });
                          }}
                        >
                          <Button size="sm" type="submit">
                            Mark done
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

