import type { Debtor, DebtorPayload } from '@interface/debtor';
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const debtorsPath = '/api/v1/debtors/';

export interface DebtorPage {
  results: Debtor[];
  count: number | null;
  hasNext: boolean;
}

export interface DebtorListParams {
  page: number;
  pageSize: number;
}

function parseAmount(value: unknown): string {
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    !String(value).trim() ||
    !Number.isFinite(Number(value)) ||
    Number(value) <= 0
  ) {
    throw new Error('A API retornou um valor devido inválido.');
  }
  return String(value);
}

function parseDebtor(value: unknown): Debtor {
  if (typeof value !== 'object' || value === null) {
    throw new Error('A API retornou um devedor em formato inválido.');
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    typeof record.name !== 'string' ||
    !record.name.trim() ||
    typeof record.occurred_at !== 'string' ||
    Number.isNaN(new Date(record.occurred_at).getTime())
  ) {
    throw new Error('A API retornou um devedor sem os campos esperados.');
  }

  return {
    id: record.id,
    name: record.name,
    amount: parseAmount(record.amount),
    occurred_at: record.occurred_at,
    ...(typeof record.created_at === 'string'
      ? { created_at: record.created_at }
      : {}),
    ...(typeof record.updated_at === 'string'
      ? { updated_at: record.updated_at }
      : {}),
  };
}

function parseDebtorPage(payload: unknown): DebtorPage {
  if (Array.isArray(payload)) {
    return {
      results: payload.map(parseDebtor),
      count: payload.length,
      hasNext: false,
    };
  }
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('A API retornou uma lista de devedores inválida.');
  }

  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.results)) {
    throw new Error('A API retornou uma lista de devedores inválida.');
  }
  if (
    record.next !== undefined &&
    record.next !== null &&
    typeof record.next !== 'string'
  ) {
    throw new Error('A API retornou um endereço de paginação inválido.');
  }
  if (
    record.count !== undefined &&
    (typeof record.count !== 'number' ||
      !Number.isInteger(record.count) ||
      record.count < 0)
  ) {
    throw new Error('A API retornou uma contagem de devedores inválida.');
  }

  return {
    results: record.results.map(parseDebtor),
    count: typeof record.count === 'number' ? record.count : null,
    hasNext: typeof record.next === 'string',
  };
}

export async function listDebtors(
  params: DebtorListParams,
): Promise<DebtorPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });
  const payload = await apiRequest<unknown>(
    `${debtorsPath}?${query.toString()}`,
  );
  const result = parseDebtorPage(payload);
  if (!Array.isArray(payload)) {
    return result;
  }

  const start = (params.page - 1) * params.pageSize;
  return {
    ...result,
    results: result.results.slice(start, start + params.pageSize),
    hasNext: start + params.pageSize < result.results.length,
  };
}

export async function getDebtor(id: string): Promise<Debtor> {
  const payload = await apiRequest<unknown>(
    `${debtorsPath}${encodeURIComponent(id)}/`,
  );
  return parseDebtor(payload);
}

export function createDebtor(debtor: DebtorPayload): Promise<unknown> {
  return apiJsonRequest(debtorsPath, 'POST', debtor);
}

export function updateDebtor(
  id: string,
  debtor: DebtorPayload,
): Promise<unknown> {
  return apiJsonRequest(
    `${debtorsPath}${encodeURIComponent(id)}/`,
    'PATCH',
    debtor,
  );
}

export function deleteDebtor(id: string): Promise<unknown> {
  return apiRequest(`${debtorsPath}${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  });
}
