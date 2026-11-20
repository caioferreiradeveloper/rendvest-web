import type { TransactionBank } from '@config/transactionBanks';
import { apiRequest } from '../api/apiClient';

export interface MonthlyFlow {
  month: string;
  income: string;
  expenses: string;
  net: string;
}

export interface DashboardData {
  as_of: string;
  transactions: { balance: string; income: string; expenses: string; net: string; transaction_count: number };
  loans: { active_count: number; outstanding: string; paid_this_month: string; overdue_installments: number };
  debtors: { outstanding: string; open_count: number; received_this_month: string };
  wishlist: { count: number; total: string; planned_this_month: string };
  monthlies: { settled_count: number; pending_count: number; pending_income: string; pending_expenses: string };
  history: MonthlyFlow[];
  recent: { id: string; category: string; description: string; amount: string; type: 'income' | 'expense'; bank: string; occurred_at: string }[];
}

export function getDashboard(bank: TransactionBank, signal: AbortSignal): Promise<DashboardData> {
  const query = bank ? `?${new URLSearchParams({ bank })}` : '';
  return apiRequest(`/api/v1/dashboard/${query}`, { signal });
}
