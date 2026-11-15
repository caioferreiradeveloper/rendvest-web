import type { Debtor, DebtorPayload } from '@interface/debtor';

export interface DebtorFormSidebarProps {
  debtor: Debtor | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (debtor: DebtorPayload) => Promise<boolean>;
}

export interface DebtorDetailSidebarProps {
  debtor: Debtor;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface DeleteDebtorModalProps {
  debtor: Debtor;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
