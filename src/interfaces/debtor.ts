import type { TransactionBank } from '@config/transactionBanks';

export interface DebtorPayload {
  debtor_name: string;
  amount: string;
  description: string;
  occurred_at: string;
}

export interface Debtor extends DebtorPayload {
  id: string;
  paid_amount: string;
  paid_at: string | null;
  is_paid: boolean;
  remaining_amount: string;
  created_at?: string;
  updated_at?: string;
}

export interface DebtorPaymentPayload {
  bank: TransactionBank;
  paid_amount: string;
  paid_at?: string;
}
