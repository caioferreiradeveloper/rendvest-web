// Interface imports
import type { Debtor, DebtorPayload, DebtorPaymentPayload } from '@interface/debtor';

// Interface for the props of the DebtorFormSidebar component
export interface DebtorFormSidebarProps {
  debtor: Debtor | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (debtor: DebtorPayload) => Promise<boolean>;
}

// Interface for the props of the DebtorDetailSidebar component
export interface DebtorDetailSidebarProps {
  debtor: Debtor;
  error: string | null;
  isSaving: boolean;
  onPay: (payment: DebtorPaymentPayload) => Promise<void>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Interface for the props of the DeleteDebtorModal component
export interface DeleteDebtorModalProps {
  debtor: Debtor;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
