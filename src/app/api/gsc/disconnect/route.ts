import { NextResponse } from 'next/server';
import { updateSettings } from '@/lib/db/queries';

export async function POST() {
  await updateSettings({
    gsc_enabled: false,
    gsc_refresh_token: null,
    gsc_token_updated_at: null,
  });
  return NextResponse.json({ success: true });
}

