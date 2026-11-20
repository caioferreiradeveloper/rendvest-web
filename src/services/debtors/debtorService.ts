import type { Debtor, DebtorPayload, DebtorPaymentPayload } from '@interface/debtor';
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const debtorsBasePath = '/api/v1/debtors/';

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
    Number(value) < 0
  ) {
    throw new Error('A API retornou um valor monetário inválido.');
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
    typeof record.debtor_name !== 'string' ||
    !record.debtor_name.trim() ||
    typeof record.occurred_at !== 'string' ||
    Number.isNaN(new Date(record.occurred_at).getTime())
  ) {
    throw new Error('A API retornou um devedor sem os campos esperados.');
  }

  const amount = parseAmount(record.amount);
  const paidAmount = parseAmount(record.paid_amount ?? '0.00');
  const paidAt = typeof record.paid_at === 'string' ? record.paid_at : null;
  if (Number(amount) <= 0 || Number(paidAmount) > Number(amount)) {
    throw new Error('A API retornou valores inválidos para o devedor.');
  }

  // Derive read-only properties when the serializer omits them.
  const remainingAmount = record.remaining_amount ??
    (Number(amount) - Number(paidAmount)).toFixed(2);

  return {
    id: record.id,
    debtor_name: record.debtor_name,
    amount,
    description: typeof record.description === 'string' ? record.description : '',
    paid_amount: paidAmount,
    paid_at: paidAt,
    is_paid: typeof record.is_paid === 'boolean' ? record.is_paid : paidAt !== null,
    remaining_amount: parseAmount(remainingAmount),
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
    `${debtorsBasePath}?${query.toString()}`,
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

export async function getDebtorDetail(id: string): Promise<Debtor> {
  const payload = await apiRequest<unknown>(
    `${debtorsBasePath}${encodeURIComponent(id)}/`,
  );
  return parseDebtor(payload);
}

export function createDebtor(debtor: DebtorPayload): Promise<unknown> {
  return apiJsonRequest(`${debtorsBasePath}create/`, 'POST', debtor);
}

export function updateDebtor(
  id: string,
  debtor: DebtorPayload,
): Promise<unknown> {
  return apiJsonRequest(
    `${debtorsBasePath}update/${encodeURIComponent(id)}/`,
    'PATCH',
    debtor,
  );
}

export function deleteDebtor(id: string): Promise<unknown> {
  return apiRequest(`${debtorsBasePath}delete/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  });
}

export function payDebtor(
  id: string,
  payment: DebtorPaymentPayload,
): Promise<unknown> {
  return apiJsonRequest(
    `${debtorsBasePath}${encodeURIComponent(id)}/pay/`,
    'POST',
    payment,
  );
}
