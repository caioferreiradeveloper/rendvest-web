export interface Debtor {
  id: string;
  name: string;
  amount: string;
  occurred_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface DebtorPayload {
  name: string;
  amount: string;
  occurred_at: string;
}
