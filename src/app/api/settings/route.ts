import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db/queries';

function maskPassword(password: string | null): string | null {
  if (!password) return null;
  if (password.length <= 4) return '••••';
  return '••••' + password.slice(-4);
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      ...settings,
      wp_app_password: maskPassword(settings.wp_app_password),
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.wp_site_url !== undefined) updates.wp_site_url = body.wp_site_url;
    if (body.wp_username !== undefined) updates.wp_username = body.wp_username;
    if (body.auto_push_on_approve !== undefined) updates.auto_push_on_approve = body.auto_push_on_approve;
    if (body.authoritative_apis_enabled !== undefined) updates.authoritative_apis_enabled = body.authoritative_apis_enabled;
    if (body.authoritative_apis_config !== undefined) updates.authoritative_apis_config = body.authoritative_apis_config;
    if (body.gsc_enabled !== undefined) updates.gsc_enabled = body.gsc_enabled;
    if (body.gsc_site_url !== undefined) updates.gsc_site_url = body.gsc_site_url;
    if (body.gsc_url_prefix !== undefined) updates.gsc_url_prefix = body.gsc_url_prefix;
    if (body.authoritative_nist_enabled !== undefined) updates.authoritative_nist_enabled = body.authoritative_nist_enabled;
    if (body.authoritative_iso_alerts_enabled !== undefined) updates.authoritative_iso_alerts_enabled = body.authoritative_iso_alerts_enabled;
    if (body.author_name !== undefined) updates.author_name = body.author_name;
    if (body.author_title !== undefined) updates.author_title = body.author_title;
    if (body.author_bio !== undefined) updates.author_bio = body.author_bio;
    if (body.author_image_url !== undefined) updates.author_image_url = body.author_image_url;
    if (body.author_profile_url !== undefined) updates.author_profile_url = body.author_profile_url;

    // Only update password if it's not the masked value
    if (body.wp_app_password !== undefined && !body.wp_app_password.startsWith('••••')) {
      updates.wp_app_password = body.wp_app_password;
    }

    const settings = await updateSettings(updates);
    return NextResponse.json({
      ...settings,
      wp_app_password: maskPassword(settings.wp_app_password),
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
