import type {
  Transaction,
  TransactionBank,
  TransactionPayload,
  TransactionType,
} from '../../interfaces/transaction';
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const transactionsBasePath = '/api/v1/transactions';

export interface TransactionPage {
  results: Transaction[];
  count: number | null;
  hasNext: boolean;
}

export interface TransactionListParams {
  page: number;
  pageSize: number;
  type?: TransactionType;
  typeBank?: TransactionBank;
}

function parseTransactionType(value: unknown): TransactionType {
  if (value === 'income' || value === 'expense') {
    return value;
  }
  throw new Error('A API retornou um tipo de lançamento inválido.');
}

function parseTransactionBank(value: unknown): TransactionBank {
  if (
    value === '' ||
    value === 'banco_do_brasil' ||
    value === 'bradesco' ||
    value === 'btg_pactual' ||
    value === 'c6_bank' ||
    value === 'caixa' ||
    value === 'inter' ||
    value === 'itau' ||
    value === 'mercado_pago' ||
    value === 'nubank' ||
    value === 'pagbank' ||
    value === 'picpay' ||
    value === 'santander' ||
    value === 'sicoob' ||
    value === 'sicredi' ||
    value === 'other'
  ) {
    return value;
  }
  throw new Error('A API retornou um banco inválido para o lançamento.');
}

function getCollectionPath(type: TransactionType): string {
  const collection = type === 'income' ? 'incomes' : 'expenses';
  return `${transactionsBasePath}/${collection}/`;
}

function parseTransaction(value: unknown): Transaction {
  if (typeof value !== 'object' || value === null) {
    throw new Error('A API retornou um lançamento em formato inválido.');
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    (record.type !== 'income' && record.type !== 'expense') ||
    (typeof record.amount !== 'string' && typeof record.amount !== 'number') ||
    typeof record.category !== 'string' ||
    typeof record.occurred_at !== 'string'
  ) {
    throw new Error('A API retornou um lançamento sem os campos esperados.');
  }

  return {
    id: record.id,
    type: parseTransactionType(record.type),
    bank: parseTransactionBank(record.bank ?? ''),
    amount: String(record.amount),
    category: record.category,
    description:
      typeof record.description === 'string' ? record.description : '',
    occurred_at: record.occurred_at,
    ...(typeof record.created_at === 'string'
      ? { created_at: record.created_at }
      : {}),
    ...(typeof record.updated_at === 'string'
      ? { updated_at: record.updated_at }
      : {}),
  };
}

function parseTransactionPage(payload: unknown): TransactionPage {
  if (Array.isArray(payload)) {
    return {
      results: payload.map(parseTransaction),
      count: payload.length,
      hasNext: false,
    };
  }

  if (typeof payload !== 'object' || payload === null) {
    throw new Error('A API retornou uma lista de lançamentos inválida.');
  }

  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.results)) {
    throw new Error('A API retornou uma lista de lançamentos inválida.');
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
    throw new Error('A API retornou uma contagem de lançamentos inválida.');
  }

  return {
    results: record.results.map(parseTransaction),
    count: typeof record.count === 'number' ? record.count : null,
    hasNext: typeof record.next === 'string',
  };
}

export async function listTransactions(
  params: TransactionListParams,
): Promise<TransactionPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });
  if (params.type) {
    query.set('type', params.type);
  }
  if (params.typeBank !== undefined) {
    query.set('type_bank', params.typeBank);
  }

  const payload = await apiRequest<unknown>(
    `${transactionsBasePath}/?${query.toString()}`,
  );
  const result = parseTransactionPage(payload);
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

export async function getTransactionDetail(
  id: string,
  type: TransactionType,
): Promise<Transaction> {
  const payload = await apiRequest<unknown>(
    `${getCollectionPath(type)}${encodeURIComponent(id)}/`,
  );
  const transaction = parseTransaction(payload);

  if (transaction.type !== type) {
    throw new Error('A API retornou um lançamento de tipo inesperado.');
  }

  return transaction;
}

export function createTransaction(
  transaction: TransactionPayload,
): Promise<unknown> {
  return apiJsonRequest(
    getCollectionPath(transaction.type),
    'POST',
    transaction,
  );
}

export function updateTransaction(
  id: string,
  transaction: TransactionPayload,
): Promise<unknown> {
  return apiJsonRequest(
    `${getCollectionPath(transaction.type)}${encodeURIComponent(id)}/`,
    'PATCH',
    transaction,
  );
}

export function deleteTransaction(
  id: string,
  type: TransactionType,
): Promise<unknown> {
  return apiRequest(
    `${getCollectionPath(type)}${encodeURIComponent(id)}/`,
    { method: 'DELETE' },
  );
}
