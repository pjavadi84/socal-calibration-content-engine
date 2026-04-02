import { exchangeRefreshTokenForAccessToken } from './oauth';

export type GscSearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

export async function querySearchAnalytics(params: {
  refreshToken: string;
  siteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  urlPrefix?: string;
  dimensions?: Array<'page' | 'query'>;
  rowLimit?: number;
}) {
  const accessToken = await exchangeRefreshTokenForAccessToken(params.refreshToken);

  const url = new URL(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(params.siteUrl)}/searchAnalytics/query`
  );

  const body: Record<string, unknown> = {
    startDate: params.startDate,
    endDate: params.endDate,
    dimensions: params.dimensions || ['page'],
    rowLimit: params.rowLimit ?? 250,
  };

  if (params.urlPrefix) {
    body.dimensionFilterGroups = [
      {
        groupType: 'and',
        filters: [
          {
            dimension: 'page',
            operator: 'contains',
            expression: params.urlPrefix,
          },
        ],
      },
    ];
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    rows?: GscSearchAnalyticsRow[];
    responseAggregationType?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message || 'GSC query failed');
  }

  return data.rows || [];
}

export async function inspectUrl(params: {
  refreshToken: string;
  siteUrl: string;
  inspectionUrl: string;
}) {
  const accessToken = await exchangeRefreshTokenForAccessToken(params.refreshToken);

  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      siteUrl: params.siteUrl,
      inspectionUrl: params.inspectionUrl,
    }),
  });

  const data = (await res.json()) as {
    inspectionResult?: {
      indexStatusResult?: {
        verdict?: string;
        coverageState?: string;
        lastCrawlTime?: string;
        canonicalUrl?: string;
        robotsTxtState?: string;
        indexingState?: string;
      };
    };
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message || 'URL inspection failed');
  }

  return data.inspectionResult?.indexStatusResult || null;
}

