import type { TransactionBank } from '../config/transactionBanks';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  bank: TransactionBank;
  amount: string;
  category: string;
  description: string;
  occurred_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionFormValues {
  type: TransactionType;
  bank: TransactionBank;
  amount: string;
  category: string;
  description: string;
  occurred_at: string;
}

export interface TransactionPayload {
  type: TransactionType;
  bank: TransactionBank;
  amount: string;
  category: string;
  description: string;
  occurred_at: string;
}
