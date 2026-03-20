import { NextResponse } from 'next/server';
import { getPillars } from '@/lib/db/queries';

export async function GET() {
  try {
    const pillars = await getPillars();
    return NextResponse.json(pillars);
  } catch (error) {
    console.error('Failed to fetch pillars:', error);
    return NextResponse.json([], { status: 500 });
  }
}
