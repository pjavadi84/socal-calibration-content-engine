'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Pillar = { id: string; name: string };
type Category = { id: string; name: string; pillar_id: string };
type Location = { id: string; display_name: string };

export default function BatchGeneratePage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedPillarIds, setSelectedPillarIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [targetLength, setTargetLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [batchStatus, setBatchStatus] = useState<{
    batchId: string;
    totalArticles: number;
    completed: number;
  } | null>(null);

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
        toast.error('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  function toggleSelection(id: unknown, list: string[], setter: (v: string[]) => void) {
    const val = String(id);
    setter(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  }

  // Calculate combinations
  const catIds = selectedCategoryIds.length > 0
    ? selectedCategoryIds
    : categories
        .filter((c) => selectedPillarIds.includes(c.pillar_id))
        .map((c) => c.id);
  const locIds = selectedLocationIds.length > 0 ? selectedLocationIds : [''];
  const totalCombinations = catIds.length * locIds.length;

  async function handleBatchGenerate() {
    if (totalCombinations === 0) {
      toast.error('Select at least one pillar/category');
      return;
    }
    if (totalCombinations > 12) {
      toast.error('Maximum 12 articles per batch');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/articles/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarIds: selectedPillarIds,
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : catIds,
          locationIds: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
          targetLength,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Batch generation failed');
      }

      const data = await res.json();
      setBatchStatus({
        batchId: data.batchId,
        totalArticles: data.totalArticles,
        completed: 0,
      });
      toast.success(`Batch started: ${data.totalArticles} articles queued`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Batch generation failed');
    } finally {
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
        <h1 className="text-2xl font-semibold">Batch Generate</h1>
        <Link href="/generate">
          <Button variant="outline">Single Generate</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Content</CardTitle>
            <CardDescription>Choose pillars, categories, and locations to generate articles for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pillars</Label>
              <Select onValueChange={(v) => toggleSelection(v, selectedPillarIds, setSelectedPillarIds)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add pillar" />
                </SelectTrigger>
                <SelectContent>
                  {pillars.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {selectedPillarIds.map((id) => {
                  const p = pillars.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {p?.name}
                      <button onClick={() => toggleSelection(id, selectedPillarIds, setSelectedPillarIds)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories (optional — defaults to all from selected pillars)</Label>
              <Select onValueChange={(v) => toggleSelection(v, selectedCategoryIds, setSelectedCategoryIds)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => selectedPillarIds.length === 0 || selectedPillarIds.includes(c.pillar_id))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {selectedCategoryIds.map((id) => {
                  const c = categories.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {c?.name}
                      <button onClick={() => toggleSelection(id, selectedCategoryIds, setSelectedCategoryIds)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Locations (optional)</Label>
              <Select onValueChange={(v) => toggleSelection(v, selectedLocationIds, setSelectedLocationIds)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {selectedLocationIds.map((id) => {
                  const l = locations.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {l?.display_name}
                      <button onClick={() => toggleSelection(id, selectedLocationIds, setSelectedLocationIds)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 text-center">
              <div className="text-3xl font-bold">{totalCombinations}</div>
              <div className="text-sm text-muted-foreground">articles to generate</div>
              {totalCombinations > 12 && (
                <p className="mt-2 text-sm text-destructive">
                  Maximum 12 articles per batch. Reduce your selection.
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleBatchGenerate}
              disabled={loading || totalCombinations === 0 || totalCombinations > 12}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Starting batch...
                </>
              ) : (
                `Generate ${totalCombinations} Articles`
              )}
            </Button>

            {batchStatus && (
              <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm font-medium">Batch queued</p>
                <p className="text-sm text-muted-foreground">
                  {batchStatus.totalArticles} articles are being generated in the background.
                  Check the Articles page for progress.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
