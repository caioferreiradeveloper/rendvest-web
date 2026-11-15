import type {
  Loan,
  LoanDetails,
  LoanPaymentPayload,
  LoanPayload,
} from '@interface/loan';

export interface LoanFormSidebarProps {
  loan: Loan | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (loan: LoanPayload) => Promise<boolean>;
}

export interface LoanDetailsSidebarProps {
  details: LoanDetails;
  openPaymentOnLoad?: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  onAddPayment: (
    loanId: string,
    payment: LoanPaymentPayload,
  ) => Promise<boolean>;
}

export interface DeleteLoanModalProps {
  loan: Loan;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
