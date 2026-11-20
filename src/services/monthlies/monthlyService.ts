// Interface imports
import type { Monthly, MonthlyPayload, MonthlySettlementPayload } from '@interface/monthly';
import type { TransactionType } from '@interface/transaction';

// Service imports
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const monthliesBasePath = '/api/v1/monthlies/';

export interface MonthlyListParams {
  month: string;
  page: number;
  pageSize: number;
  type?: TransactionType | '';
  isInvoice?: boolean;
}

interface MonthlyPage {
  results: Monthly[];
  count: number | null;
  hasNext: boolean;
}

export async function listMonthlies({
  month,
  page,
  pageSize,
  type,
  isInvoice,
}: MonthlyListParams): Promise<MonthlyPage> {
  const query = new URLSearchParams({
    month,
    page: String(page),
    page_size: String(pageSize),
  });
  if (type) {
    query.set('type', type);
  }

  if (isInvoice !== undefined) {
    query.set('is_invoice', String(isInvoice));
  }

  const payload = await apiRequest<
    Monthly[] | { results: Monthly[]; count?: number; next?: string | null }
  >(`${monthliesBasePath}?${query}`);

  if (Array.isArray(payload)) {
    const start = (page - 1) * pageSize;
    return {
      results: payload.slice(start, start + pageSize),
      count: payload.length,
      hasNext: start + pageSize < payload.length,
    };
  }
  if (!Array.isArray(payload?.results)) {
    throw new Error('A API retornou uma lista de mensalidades inválida.');
  }
  return {
    results: payload.results,
    count: payload.count ?? null,
    hasNext: Boolean(payload.next),
  };
}

// Fetch all pages because the invoice selector must include every registered invoice.
export async function listInvoices(month: string): Promise<Monthly[]> {
  const results: Monthly[] = [];
  let page = 1;
  let hasNext: boolean;

  do {
    const response = await listMonthlies({ month, page, pageSize: 20, isInvoice: true });
    results.push(...response.results);
    hasNext = response.hasNext;
    page += 1;
  } while (hasNext);

  return results;
}

export function getMonthlyDetail(id: string, month: string): Promise<Monthly> {
  return apiRequest(`${monthliesBasePath}${encodeURIComponent(id)}/?${new URLSearchParams({ month })}`);
}

export function createMonthly(monthly: MonthlyPayload, month: string): Promise<Monthly> {
  return apiJsonRequest(
    `${monthliesBasePath}create/?${new URLSearchParams({ month })}`,
    'POST',
    monthly,
  );
}

export function updateMonthly(id: string, monthly: MonthlyPayload, month: string): Promise<Monthly> {
  return apiJsonRequest(
    `${monthliesBasePath}update/${encodeURIComponent(id)}/?${new URLSearchParams({ month })}`,
    'PATCH',
    monthly,
  );
}

export function deleteMonthly(id: string): Promise<unknown> {
  return apiRequest(`${monthliesBasePath}delete/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  });
}

export function settleMonthly(id: string, settlement: MonthlySettlementPayload): Promise<unknown> {
  return apiJsonRequest(
    `${monthliesBasePath}${encodeURIComponent(id)}/settle/`,
    'POST',
    settlement,
  );
}
