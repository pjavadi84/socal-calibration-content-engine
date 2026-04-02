import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildGoogleAuthUrl, generateOAuthState, getGoogleOAuthConfig } from '@/lib/gsc/oauth';

export async function GET() {
  const { baseUrl } = getGoogleOAuthConfig();
  const redirectUri = new URL('/api/gsc/callback', baseUrl).toString();

  const state = generateOAuthState();
  const jar = await cookies();
  jar.set('gsc_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });

  const authUrl = buildGoogleAuthUrl({ redirectUri, state });
  return NextResponse.redirect(authUrl);
}

