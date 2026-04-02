import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokens, getGoogleOAuthConfig } from '@/lib/gsc/oauth';
import { updateSettings } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { baseUrl } = getGoogleOAuthConfig();
    const redirectUri = new URL('/api/gsc/callback', baseUrl).toString();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/settings?gsc=error&reason=${encodeURIComponent(error)}`, baseUrl));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?gsc=error&reason=missing_code', baseUrl));
    }

    const jar = await cookies();
    const expectedState = jar.get('gsc_oauth_state')?.value;
    jar.delete('gsc_oauth_state');

    if (!expectedState || expectedState !== state) {
      return NextResponse.redirect(new URL('/settings?gsc=error&reason=state_mismatch', baseUrl));
    }

    const tokens = await exchangeCodeForTokens({ code, redirectUri });

    await updateSettings({
      gsc_enabled: true,
      gsc_refresh_token: tokens.refresh_token,
      gsc_token_updated_at: new Date().toISOString(),
    });

    return NextResponse.redirect(new URL('/settings?gsc=connected', baseUrl));
  } catch (err) {
    const { baseUrl } = getGoogleOAuthConfig();
    const message = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.redirect(new URL(`/settings?gsc=error&reason=${encodeURIComponent(message)}`, baseUrl));
  }
}

