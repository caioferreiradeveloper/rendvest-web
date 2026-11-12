import type {
  Loan,
  LoanDetails,
  LoanInstallment,
  LoanInstallmentStatus,
  LoanPaymentResult,
  LoanPaymentPayload,
  LoanPayload,
} from '../../interfaces/loan';
import type { TransactionBank } from '../../config/transactionBanks';
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const loansPath = '/api/v1/loans/';

interface ApiPage<T> {
  results: T[];
  next: string | null;
}

function parseBank(value: unknown): TransactionBank {
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
  throw new Error('A API retornou um banco inválido para o empréstimo.');
}

function parseAmount(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    !String(value).trim() ||
    !Number.isFinite(Number(value))
  ) {
    throw new Error(`A API retornou o campo "${key}" inválido.`);
  }
  return String(value);
}

function parseOptionalAmount(
  record: Record<string, unknown>,
  key: string,
): string | null {
  if (record[key] === null || record[key] === undefined) {
    return null;
  }
  return parseAmount(record, key);
}

function parseLoan(value: unknown): Loan {
  if (typeof value !== 'object' || value === null) {
    throw new Error('A API retornou um empréstimo em formato inválido.');
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    typeof record.term_months !== 'number' ||
    typeof record.started_at !== 'string' ||
    typeof record.first_due_date !== 'string'
  ) {
    throw new Error('A API retornou um empréstimo sem os campos esperados.');
  }

  return {
    id: record.id,
    bank: parseBank(record.bank ?? ''),
    contracted_amount: parseAmount(record, 'contracted_amount'),
    iof_amount: parseAmount(record, 'iof_amount'),
    financed_amount: parseAmount(record, 'financed_amount'),
    monthly_interest_percentage: parseAmount(
      record,
      'monthly_interest_percentage',
    ),
    monthly_cet_percentage: parseOptionalAmount(
      record,
      'monthly_cet_percentage',
    ),
    term_months: record.term_months,
    started_at: record.started_at,
    first_due_date: record.first_due_date,
    monthly_installment_amount: parseAmount(
      record,
      'monthly_installment_amount',
    ),
    total_with_interest: parseAmount(record, 'total_with_interest'),
    amount_paid: parseAmount(record, 'amount_paid'),
    remaining_amount: parseAmount(record, 'remaining_amount'),
    ...(typeof record.created_at === 'string'
      ? { created_at: record.created_at }
      : {}),
    ...(typeof record.updated_at === 'string'
      ? { updated_at: record.updated_at }
      : {}),
  };
}

function parseInstallment(value: unknown): LoanInstallment {
  if (typeof value !== 'object' || value === null) {
    throw new Error('A API retornou uma parcela em formato inválido.');
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.number !== 'number' ||
    typeof record.due_date !== 'string' ||
    (record.status !== 'pending' &&
      record.status !== 'partial' &&
      record.status !== 'paid' &&
      record.status !== 'overdue')
  ) {
    throw new Error('A API retornou uma parcela sem os campos esperados.');
  }

  return {
    number: record.number,
    due_date: record.due_date,
    amount_due: parseAmount(record, 'amount_due'),
    interest_amount: parseAmount(record, 'interest_amount'),
    principal_amount: parseAmount(record, 'principal_amount'),
    amount_paid: parseAmount(record, 'amount_paid'),
    remaining_amount: parseAmount(record, 'remaining_amount'),
    status: record.status as LoanInstallmentStatus,
  };
}

function parsePage<T>(
  payload: unknown,
  parseItem: (item: unknown) => T,
): ApiPage<T> {
  if (Array.isArray(payload)) {
    return { results: payload.map(parseItem), next: null };
  }
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('A API retornou uma lista em formato inválido.');
  }
  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.results)) {
    throw new Error('A API retornou uma lista sem os resultados esperados.');
  }
  if (
    record.next !== undefined &&
    record.next !== null &&
    typeof record.next !== 'string'
  ) {
    throw new Error('A API retornou um endereço de paginação inválido.');
  }
  return {
    results: record.results.map(parseItem),
    next: typeof record.next === 'string' ? record.next : null,
  };
}

function getNextPath(next: string, collectionPath: string): string {
  const nextUrl = new URL(next, window.location.origin);
  const collectionUrl = new URL(collectionPath, window.location.origin);
  if (nextUrl.pathname !== collectionUrl.pathname) {
    throw new Error('A API retornou um endereço de paginação inesperado.');
  }
  return `${nextUrl.pathname}${nextUrl.search}`;
}

async function getAllPages<T>(
  initialPath: string,
  parseItem: (item: unknown) => T,
): Promise<T[]> {
  const items: T[] = [];
  const visitedPaths = new Set<string>();
  let path = initialPath;

  while (path) {
    if (visitedPaths.has(path)) {
      throw new Error('A API retornou uma paginação circular.');
    }
    visitedPaths.add(path);
    const page = parsePage(await apiRequest<unknown>(path), parseItem);
    items.push(...page.results);
    path = page.next ? getNextPath(page.next, initialPath) : '';
  }

  return items;
}

export function listLoans(): Promise<Loan[]> {
  return getAllPages(loansPath, parseLoan);
}

export async function getLoanDetails(id: string): Promise<LoanDetails> {
  const encodedId = encodeURIComponent(id);
  const [loanPayload, installments] = await Promise.all([
    apiRequest<unknown>(`${loansPath}${encodedId}/`),
    getAllPages(
      `${loansPath}${encodedId}/installments/`,
      parseInstallment,
    ),
  ]);
  return { loan: parseLoan(loanPayload), installments };
}

export function createLoan(loan: LoanPayload): Promise<unknown> {
  return apiJsonRequest(loansPath, 'POST', loan);
}

export function updateLoan(id: string, loan: LoanPayload): Promise<unknown> {
  return apiJsonRequest(
    `${loansPath}${encodeURIComponent(id)}/`,
    'PATCH',
    loan,
  );
}

export function deleteLoan(id: string): Promise<unknown> {
  return apiRequest(`${loansPath}${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  });
}

export function createLoanPayment(
  loanId: string,
  payment: LoanPaymentPayload,
): Promise<LoanPaymentResult> {
  return apiJsonRequest<unknown>(
    `${loansPath}${encodeURIComponent(loanId)}/payments/`,
    'POST',
    payment,
  ).then((value) => {
    if (typeof value !== 'object' || value === null) {
      throw new Error('A API retornou um pagamento em formato inválido.');
    }
    const record = value as Record<string, unknown>;
    if (typeof record.expense_transaction_id !== 'string') {
      throw new Error('A API retornou um pagamento sem os campos esperados.');
    }
    return {
      interest_portion: parseAmount(record, 'interest_portion'),
      principal_portion: parseAmount(record, 'principal_portion'),
      expense_transaction_id: record.expense_transaction_id,
    };
  });
}
