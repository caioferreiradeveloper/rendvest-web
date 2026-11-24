import { apiJsonRequest, apiRequest } from '../api/apiClient';

const apiPath = '/api/v1/investments/';

export interface Investment {
  id: number;
  asset: string;
  amount: string;
  invested_at: string;
  quantity: number | null;
}

interface InvestmentInput {
  asset: string;
  amount: string;
  invested_at: string;
  quantity: string;
}

interface AssetPage {
  results: { ticker: string; name: string | null; segment: string | null }[];
  next_page: number | null;
}

export function listInvestments(signal: AbortSignal) {
  return apiRequest<Investment[]>(apiPath, { signal });
}

export function createInvestment(investment: InvestmentInput) {
  return apiJsonRequest<Investment>(apiPath, 'POST', investment);
}

export function searchFundAssets(query: string, page: number, signal: AbortSignal) {
  const params = new URLSearchParams({ type: 'fii', q: query, page: String(page) });
  return apiRequest<AssetPage>(`${apiPath}assets/?${params}`, { signal });
}
