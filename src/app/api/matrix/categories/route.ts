import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/db/queries';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json([], { status: 500 });
  }
}
