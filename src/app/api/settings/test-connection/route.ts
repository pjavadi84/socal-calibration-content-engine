import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/wordpress/client';

export async function POST(request: NextRequest) {
  try {
    const { wp_site_url, wp_username, wp_app_password } = await request.json();

    if (!wp_site_url || !wp_username || !wp_app_password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const result = await testConnection({
      siteUrl: wp_site_url,
      username: wp_username,
      appPassword: wp_app_password,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Connection test failed' },
      { status: 500 }
    );
  }
}
