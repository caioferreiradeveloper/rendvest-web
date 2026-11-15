import type {
  Transaction,
  TransactionPayload,
  TransactionType,
} from '@interface/transaction';

export interface TransactionFormSidebarProps {
  transaction: Transaction | null;
  initialType: TransactionType;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (transaction: TransactionPayload) => Promise<boolean>;
}

export interface TransactionDetailSidebarProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface DeleteTransactionModalProps {
  transaction: Transaction;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
