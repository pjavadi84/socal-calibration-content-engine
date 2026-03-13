import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { inngest } from '@/jobs/inngest';
import { createBatch } from '@/lib/db/queries';

const BatchRequestSchema = z.object({
  pillarIds: z.array(z.string().uuid()).min(1),
  categoryIds: z.array(z.string().uuid()).min(1),
  locationIds: z.array(z.string().uuid()).min(1),
  targetLength: z.enum(['short', 'medium', 'long']).optional().default('long'),
});

const MAX_BATCH_SIZE = 12;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { pillarIds, categoryIds, locationIds, targetLength } = parsed.data;

    // Calculate combinations
    const combinations: Array<{
      pillarId: string;
      categoryId: string;
      locationId: string;
    }> = [];

    for (const pillarId of pillarIds) {
      for (const categoryId of categoryIds) {
        for (const locationId of locationIds) {
          combinations.push({ pillarId, categoryId, locationId });
        }
      }
    }

    if (combinations.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          error: `Batch too large: ${combinations.length} articles exceeds maximum of ${MAX_BATCH_SIZE}. Reduce your selection.`,
        },
        { status: 400 }
      );
    }

    // Create batch record
    const batch = await createBatch({
      total_items: combinations.length,
      completed_items: 0,
      failed_items: 0,
      status: 'in_progress',
    });

    // Send Inngest events for each combination
    const events = combinations.map((combo) => ({
      name: 'content/article.generate' as const,
      data: {
        ...combo,
        targetLength,
        batchId: batch.id,
      },
    }));

    await inngest.send(events);

    return NextResponse.json(
      {
        batchId: batch.id,
        totalArticles: combinations.length,
        status: 'in_progress',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batch generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch generation failed' },
      { status: 500 }
    );
  }
}
