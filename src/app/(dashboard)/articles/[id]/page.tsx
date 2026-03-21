'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, RefreshCw, Copy, ArrowLeft, Upload, ExternalLink, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Article = Record<string, unknown> & {
  id: string;
  title: string;
  status: string;
  body_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string | null;
  word_count: number | null;
  seo_score: number | null;
  seo_breakdown: Record<string, unknown> | null;
  fact_density_score: number | null;
  fact_density_breakdown: Record<string, unknown> | null;
  seo_keywords: string[] | null;
  primary_keyword: string | null;
  long_tail_keywords: string[] | null;
  json_ld: unknown;
  knowledge_sources: string[] | null;
  practitioner_notes_used: boolean | null;
  wp_post_id: number | null;
  wp_post_url: string | null;
  content_pillars: { id: string; name: string } | null;
  categories: { id: string; name: string; slug: string } | null;
  locations: { id: string; city: string; state: string; display_name: string } | null;
  created_at: string;
};

type SocialPost = {
  id: string;
  variant: string;
  content: string;
  hashtags: string[];
  call_to_action: string;
};

const PRACTITIONER_NOTE_PATTERN = /<!--\s*PRACTITIONER_NOTE:\s*([\s\S]*?)-->/g;

function extractPractitionerNotes(bodyHtml: string): string[] {
  const notes: string[] = [];
  const pattern = new RegExp(PRACTITIONER_NOTE_PATTERN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(bodyHtml)) !== null) {
    const suggestion = match[1].trim();
    if (suggestion) notes.push(suggestion);
  }
  return notes;
}

const statusColors: Record<string, string> = {
  generating: 'bg-yellow-100 text-yellow-800',
  pending_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-600',
};

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) throw new Error('Article not found');
        const data = await res.json();
        setArticle(data.article);
        setSocialPosts(data.socialPosts || []);
      } catch {
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAction(action: string) {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.status === 422 && data.pendingNotes) {
        toast.error(
          `Cannot push: ${data.pendingNotes.length} practitioner note(s) need attention`,
          { duration: 6000 }
        );
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Action failed');
      setArticle(data.article);

      if (action === 'push_to_wordpress') {
        toast.success('Pushed to WordPress');
      } else if (data.wordpress) {
        toast.success('Article approved & pushed to WordPress');
      } else if (action === 'approve' && data.pendingNotes?.length) {
        toast.success('Article approved (auto-push skipped: practitioner notes pending)');
      } else {
        toast.success(`Article ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action}`);
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading('');
    }
  }

  async function handleDelete() {
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Article deleted');
      router.push('/articles');
    } catch {
      toast.error('Failed to delete article');
    } finally {
      setActionLoading('');
      setConfirmingDelete(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!article) {
    return <p className="py-20 text-center text-muted-foreground">Article not found</p>;
  }

  const seoBreakdown = article.seo_breakdown as Record<string, { score: number; maxScore: number }> | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/articles"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 size-4" />
            Back to articles
          </Link>
          <h1 className="text-2xl font-semibold">{article.title || 'Untitled'}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {article.content_pillars?.name && <span>{article.content_pillars.name}</span>}
            {article.categories?.name && (
              <>
                <span>/</span>
                <span>{article.categories.name}</span>
              </>
            )}
            {article.locations?.display_name && (
              <>
                <span>/</span>
                <span>{article.locations.display_name}</span>
              </>
            )}
            <Badge
              className={statusColors[article.status] || 'bg-gray-100 text-gray-600'}
              variant="secondary"
            >
              {article.status.replace('_', ' ')}
            </Badge>
            {article.wp_post_id && (
              <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                WP Synced
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {article.status === 'pending_review' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('approve')}
                disabled={!!actionLoading}
              >
                <Check className="mr-1 size-4" />
                {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('reject')}
                disabled={!!actionLoading}
              >
                <X className="mr-1 size-4" />
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          )}
          {article.wp_post_url ? (
            <a
              href={article.wp_post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              View on WordPress
            </a>
          ) : article.status === 'approved' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('push_to_wordpress')}
              disabled={!!actionLoading}
            >
              <Upload className="mr-1 size-4" />
              {actionLoading === 'push_to_wordpress' ? 'Pushing...' : 'Push to WordPress'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled title="Approve article first">
              <Upload className="mr-1 size-4" />
              Push to WordPress
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/generate?regenerate=${id}`);
            }}
          >
            <RefreshCw className="mr-1 size-4" />
            Regenerate
          </Button>
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Confirm Delete'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Meta</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {article.word_count ? `${article.word_count} words` : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Meta Title: </span>
                <span className="text-muted-foreground">{article.meta_title || '—'}</span>
              </div>
              <div>
                <span className="font-medium">Meta Description: </span>
                <span className="text-muted-foreground">{article.meta_description || '—'}</span>
              </div>
              <div>
                <span className="font-medium">Slug: </span>
                <span className="font-mono text-muted-foreground">{article.slug || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Article Content</CardTitle>
            </CardHeader>
            <CardContent>
              {article.body_html ? (
                <div
                  className="prose max-w-none prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-p:leading-7 prose-li:my-1 prose-img:rounded-lg prose-img:my-6"
                  dangerouslySetInnerHTML={{ __html: article.body_html }}
                />
              ) : (
                <p className="text-muted-foreground">No content yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Overall SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {article.seo_score ?? '—'}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Fact Density Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {article.fact_density_score ?? '—'}
                  <span className="text-lg text-muted-foreground">
                    /{seoBreakdown?.factDensity?.maxScore ?? 19}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {seoBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(seoBreakdown).map(([key, val]) => {
                  const max = val.maxScore || 15;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-mono">
                          {val.score}/{max}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(val.score / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {article.primary_keyword && (
                <div>
                  <span className="text-sm font-medium">Primary: </span>
                  <Badge variant="secondary">{article.primary_keyword}</Badge>
                </div>
              )}
              {article.seo_keywords && article.seo_keywords.length > 0 && (
                <div>
                  <span className="text-sm font-medium">SEO Keywords: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {article.seo_keywords.map((kw: string) => (
                      <Badge key={kw} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {article.long_tail_keywords && article.long_tail_keywords.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Long Tail: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {article.long_tail_keywords.map((kw: string) => (
                      <Badge key={kw} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Knowledge Sources Used</CardTitle>
            </CardHeader>
            <CardContent>
              {article.knowledge_sources && article.knowledge_sources.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {article.knowledge_sources.map((source: string, i: number) => (
                    <li key={i} className="text-muted-foreground">{source}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No knowledge sources recorded</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Practitioner Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {article.body_html && extractPractitionerNotes(article.body_html).length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span className="font-medium">
                      {extractPractitionerNotes(article.body_html).length} unfilled practitioner note(s) — resolve before pushing to WordPress
                    </span>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {extractPractitionerNotes(article.body_html).map((note, i) => (
                      <li key={i} className="rounded border border-amber-200 bg-amber-50/50 p-2">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Badge variant="outline">
                  No pending notes
                </Badge>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          {socialPosts.length > 0 ? (
            socialPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {post.variant}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `${post.content}\n\n${post.hashtags.map((h) => `#${h}`).join(' ')}\n\n${post.call_to_action}`
                        )
                      }
                    >
                      <Copy className="mr-1 size-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{post.content}</p>
                  <Separator />
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground">{post.call_to_action}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No social posts generated yet
            </p>
          )}
        </TabsContent>

        <TabsContent value="jsonld">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">JSON-LD Structured Data</CardTitle>
                {article.json_ld ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(article.json_ld, null, 2))}
                  >
                    <Copy className="mr-1 size-4" />
                    Copy
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {article.json_ld ? (
                <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(article.json_ld, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No JSON-LD data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
