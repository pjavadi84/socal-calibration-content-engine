export interface AuthoritativeQuery {
  pillar: string;
  category: string;
  industry: string | null;
  location: string | null;
  equipmentType: string | null;
}

export interface AuthoritativeResult {
  source: string;
  sourceLabel: string;
  rawData: unknown;
  sourceUrls: string[];
  resultCount: number;
}

export interface AuthoritativeClient {
  source: string;
  sourceLabel: string;
  isRelevant(query: AuthoritativeQuery): boolean;
  fetch(query: AuthoritativeQuery): Promise<AuthoritativeResult | null>;
}
