import { NextResponse } from 'next/server';
import { checkFreshness } from '@/lib/knowledge';

export async function GET() {
  const report = checkFreshness();
  return NextResponse.json(report);
}
