import type { TransactionBank } from '@config/transactionBanks';

// Interface imports
import type { TransactionType } from '@interface/transaction';

export interface MonthlyPayload {
  name: string;
  type: TransactionType;
  amount?: string;
  is_invoice?: boolean;
  invoice?: string | null;
  start_date: string;
  end_date: string | null;
}

export interface MonthlySettlementPayload {
  bank: TransactionBank;
  month: string;
  amount?: string;
  settled_on?: string;
}

export interface MonthlySettlement {
  month: string;
  due_date: string;
  type: TransactionType;
  amount: string;
  settled_on: string;
}

export interface Monthly extends MonthlyPayload {
  id: string;
  amount: string;
  invoice_total?: string | null;
  month: string;
  due_date: string | null;
  is_settled: boolean;
  settlement: MonthlySettlement | null;
  created_at: string;
  updated_at: string;
}
