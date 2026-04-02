import { randomBytes } from 'crypto';

export const GSC_SCOPES = [
  // Search Analytics + site verification listing
  'https://www.googleapis.com/auth/webmasters.readonly',
  // URL Inspection requires broader scope
  'https://www.googleapis.com/auth/webmasters',
].join(' ');

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId) throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID');
  if (!clientSecret) throw new Error('Missing GOOGLE_OAUTH_CLIENT_SECRET');
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_APP_URL');

  return { clientId, clientSecret, baseUrl };
}

export function buildGoogleAuthUrl(params: {
  redirectUri: string;
  state: string;
}) {
  const { clientId } = getGoogleOAuthConfig();

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GSC_SCOPES);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('include_granted_scopes', 'true');
  // Force refresh_token on first connect (Google only issues it once per app+user unless consent forced)
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', params.state);

  return url.toString();
}

export function generateOAuthState(): string {
  return randomBytes(24).toString('hex');
}

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
}) {
  const { clientId, clientSecret } = getGoogleOAuthConfig();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Failed to exchange code');
  }

  if (!data.refresh_token) {
    // Still usable for immediate calls, but cannot sync in background.
    throw new Error(
      'Google did not return a refresh_token. Try disconnecting and reconnecting with consent.'
    );
  }

  return data as { access_token: string; refresh_token: string; expires_in: number };
}

export async function exchangeRefreshTokenForAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleOAuthConfig();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to refresh access token');
  }

  return data.access_token;
}

