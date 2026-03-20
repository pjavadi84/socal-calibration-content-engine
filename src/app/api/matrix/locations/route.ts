import { NextResponse } from 'next/server';
import { getLocations } from '@/lib/db/queries';

export async function GET() {
  try {
    const locations = await getLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return NextResponse.json([], { status: 500 });
  }
}
