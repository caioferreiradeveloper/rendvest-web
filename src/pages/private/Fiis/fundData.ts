import type { FundQuote } from '@services/investments/fundQuote';
import ApiError from '../../../services/api/ApiError';
import { apiRequest } from '../../../services/api/apiClient';

type Amount = number | string | null;

interface FundProfile {
  name: string | null;
  segment: string | null;
  fund_type: string | null;
  administrator: string | null;
  reference_date: string | null;
  close_price: Amount;
  pvp: Amount;
  dividend_yield_ttm: Amount;
  net_asset_value: Amount;
  total_shareholders: Amount;
  nav_per_share?: Amount;
  monthly_return_pct?: Amount;
  monthly_dividend_yield_pct?: Amount;
  shares_outstanding?: Amount;
  total_assets?: Amount;
  cnpj?: string | null;
  management_type?: string | null;
}

interface FundPrice {
  trade_date: string;
  close: Amount;
  adjusted_close: Amount;
  traded_amount?: Amount;
  volume?: Amount;
}

interface Payment {
  reference_date: string | null;
  record_date: string | null;
  payment_date: string | null;
  value_per_share: Amount;
  dy_month_pct: Amount;
}

interface Distributions {
  dividend_yield_ttm: Amount;
  payments: Payment[];
}

interface FundStats {
  trade_date: string;
  daily_change_pct: Amount;
  week_52_low: Amount;
  week_52_high: Amount;
  open?: Amount;
  day_low?: Amount;
  day_high?: Amount;
  previous_close?: Amount;
  volume?: Amount;
}

export function readAmount(value: Amount | undefined): number | null {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function getSection<T>(path: string, signal: AbortSignal) {
  try {
    const data = await apiRequest<T>(path, { signal });
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { data: null, status: null };
    }
    return { data, status: null };
  } catch (error) {
    return { data: null, status: error instanceof ApiError ? error.status : null };
  }
}

export async function loadFundData(ticker: string, signal: AbortSignal) {
  const path = `/api/v1/investments/funds/${encodeURIComponent(ticker)}/`;

  const [profile, distributions, stats, series, quote] = await Promise.all([
    getSection<FundProfile>(path, signal),
    getSection<Distributions>(`${path}distributions/`, signal),
    getSection<FundStats>(`${path}stats/`, signal),
    getSection<{ prices: FundPrice[] }>(`${path}prices/`, signal),
    getSection<FundQuote>(`${path}quote/`, signal),
  ]);

  const prices = Array.isArray(series.data?.prices)
    ? [...series.data.prices].sort((a, b) => a.trade_date.localeCompare(b.trade_date))
    : null;
  const payments = Array.isArray(distributions.data?.payments) ? distributions.data : null;

  return {
    profile: profile.data,
    distributions: payments,
    stats: stats.data,
    prices,
    quote: quote.data,
    notFound: [profile, distributions, stats, series, quote].every(({ status }) => status === 404),
  };
}
