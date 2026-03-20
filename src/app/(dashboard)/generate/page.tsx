'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Pillar = { id: string; name: string };
type Category = { id: string; name: string; pillar_id: string };
type Location = { id: string; display_name: string };

export default function GeneratePage() {
  const router = useRouter();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pillarId, setPillarId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [targetLength, setTargetLength] = useState('medium');
  const [preGeneratedTitle, setPreGeneratedTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pillarsRes, categoriesRes, locationsRes] = await Promise.all([
          fetch('/api/matrix/pillars'),
          fetch('/api/matrix/categories'),
          fetch('/api/matrix/locations'),
        ]);
        setPillars(await pillarsRes.json());
        setCategories(await categoriesRes.json());
        setLocations(await locationsRes.json());
      } catch {
        toast.error('Failed to load content matrix data');
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const filteredCategories = pillarId
    ? categories.filter((c) => c.pillar_id === pillarId)
    : categories;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!pillarId || !categoryId) {
      toast.error('Please select a pillar and category');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarId,
          categoryId,
          locationId: locationId || undefined,
          targetLength,
          preGeneratedTitle: preGeneratedTitle || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      toast.success(`Article generated! SEO Score: ${data.seoScore}`);
      router.push(`/articles/${data.articleId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Generate Article</h1>
        <Link href="/generate/batch">
          <Button variant="outline">Batch Generate</Button>
        </Link>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>New Article</CardTitle>
          <CardDescription>
            Select content parameters and generate an SEO-optimized article.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label>Pillar</Label>
              <Select value={pillarId} onValueChange={(v) => { setPillarId(v || ''); setCategoryId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pillar" />
                </SelectTrigger>
                <SelectContent>
                  {pillars.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Select value={locationId} onValueChange={(v) => setLocationId(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="No location targeting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Length</Label>
              <Select value={targetLength} onValueChange={(v) => setTargetLength(v || 'medium')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~800 words)</SelectItem>
                  <SelectItem value="medium">Medium (~1500 words)</SelectItem>
                  <SelectItem value="long">Long (~2500 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pre-generated Title (optional)</Label>
              <Input
                value={preGeneratedTitle}
                onChange={(e) => setPreGeneratedTitle(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating... (30-60s)
                </>
              ) : (
                'Generate Article'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
