import { apiRequest } from '../api/apiClient';

export interface FundQuote {
  price: string | number | null;
  trade_date: string | null;
}

export function fetchFundQuote(ticker: string, signal: AbortSignal) {
  return apiRequest<FundQuote>(`/api/v1/investments/funds/${encodeURIComponent(ticker)}/quote/`, { signal });
}
