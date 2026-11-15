import type { TransactionBank } from "@config/transactionBanks";
import type { TransactionType } from "./transaction";

export type TransactionFilter = 'all' | TransactionType;
export type BankFilter = 'all' | TransactionBank;