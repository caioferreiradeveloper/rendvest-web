import type { TransactionBank } from '../config/transactionBanks';

export type LoanInstallmentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Loan {
  id: string;
  bank: TransactionBank;
  contracted_amount: string;
  iof_amount: string;
  financed_amount: string;
  monthly_interest_percentage: string;
  monthly_cet_percentage: string | null;
  term_months: number;
  started_at: string;
  first_due_date: string;
  monthly_installment_amount: string;
  total_with_interest: string;
  amount_paid: string;
  remaining_amount: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoanInstallment {
  number: number;
  due_date: string;
  amount_due: string;
  interest_amount: string;
  principal_amount: string;
  amount_paid: string;
  remaining_amount: string;
  status: LoanInstallmentStatus;
}

export interface LoanPayload {
  bank: TransactionBank;
  contracted_amount: string;
  iof_amount: string;
  monthly_interest_percentage: string;
  monthly_cet_percentage: string;
  term_months: number;
  started_at: string;
  first_due_date: string;
}

export interface LoanPaymentPayload {
  installment_number: number;
  amount: string;
  paid_at?: string;
}

export interface LoanPaymentResult {
  interest_portion: string;
  principal_portion: string;
  expense_transaction_id: string;
}

export interface LoanDetails {
  loan: Loan;
  installments: LoanInstallment[];
}
