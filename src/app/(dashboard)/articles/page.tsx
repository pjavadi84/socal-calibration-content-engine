'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Article = {
  id: string;
  title: string;
  status: string;
  seo_score: number | null;
  word_count: number | null;
  primary_keyword: string | null;
  wp_post_id: number | null;
  created_at: string;
  content_pillars: { id: string; name: string } | null;
  categories: { id: string; name: string } | null;
  locations: { id: string; city: string; state: string; display_name: string } | null;
};

const statusColors: Record<string, string> = {
  generating: 'bg-yellow-100 text-yellow-800',
  pending_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-600',
};

const PAGE_SIZE = 20;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (status !== 'all') params.set('status', status);

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [offset, status]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  function handleStatusChange(value: string | null) {
    setStatus(value || 'all');
    setOffset(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead>Pillar</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">SEO Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>WP</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/articles/${article.id}`}
                      className="font-medium hover:underline"
                    >
                      {article.title || 'Untitled'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.content_pillars?.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.categories?.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.locations?.display_name || '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {article.seo_score ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[article.status] || 'bg-gray-100 text-gray-600'}
                      variant="secondary"
                    >
                      {article.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {article.wp_post_id ? (
                      <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                        Synced
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
