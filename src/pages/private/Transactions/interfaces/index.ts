// Interface imports
import type { Transaction, TransactionPayload, TransactionType } from "@interface/transaction";

// Interface for the props of the TransactionFormSidebar component
export interface TransactionFormSidebarProps {
  transaction: Transaction | null;
  initialType: TransactionType;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (transaction: TransactionPayload) => Promise<boolean>;
}

// Interface for the props of the TransactionDetailSidebar component
export interface TransactionDetailSidebarProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Interface for the props of the DeleteTransactionModal component
export interface DeleteTransactionModalProps {
  transaction: Transaction;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}