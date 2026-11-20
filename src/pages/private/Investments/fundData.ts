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
}

interface FundPrice {
  trade_date: string;
  close: Amount;
  adjusted_close: Amount;
  traded_amount: Amount;
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
}

interface Quote {
  trade_date: string;
  price: Amount;
}

export function readAmount(value: Amount | undefined): number | null {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function loadFundData(ticker: string, signal: AbortSignal) {
  const base = '/api/v1/investments';
  const symbol = encodeURIComponent(ticker);
  const path = `${base}/funds/${symbol}`;
  const options = { signal };

  const quoteRequest = apiRequest<{ prices: FundPrice[] }>(`${path}/prices/`, options)
    .then(async ({ prices }) => {
      prices.sort((a, b) => a.trade_date.localeCompare(b.trade_date));
      const last = prices.at(-1);
      const quote = last && readAmount(last.close) !== null
        ? { price: last.close, trade_date: last.trade_date }
        : await apiRequest<Quote>(`${base}/quotes/${symbol}/`, options).catch(() => null);
      return { prices, quote };
    })
    .catch(async () => ({
      prices: null,
      quote: signal.aborted
        ? null
        : await apiRequest<Quote>(`${base}/quotes/${symbol}/`, options).catch(() => null),
    }));

  const [profile, distributions, stats, market] = await Promise.all([
    apiRequest<FundProfile>(`${path}/`, options).catch(() => null),
    apiRequest<Distributions>(`${path}/distributions/`, options).catch(() => null),
    apiRequest<FundStats>(`${path}/stats/`, options).catch(() => null),
    quoteRequest,
  ]);

  return { profile, distributions, stats, ...market };
}
