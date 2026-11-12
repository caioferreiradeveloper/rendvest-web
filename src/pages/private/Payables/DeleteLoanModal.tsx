import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/buttons';
import { getTransactionBankLabel } from '../../../config/transactionBanks';
import type { Loan } from '../../../interfaces/loan';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

interface DeleteLoanModalProps {
  loan: Loan;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteLoanModal({
  loan,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteLoanModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeleting, onCancel]);

  return (
    <div className="loan-confirmation">
      <button
        aria-label="Cancelar exclusão"
        className="transaction-confirmation__backdrop"
        disabled={isDeleting}
        onClick={onCancel}
        type="button"
      />
      <section
        aria-labelledby="delete-loan-title"
        aria-modal="true"
        className="transaction-confirmation__dialog"
        role="alertdialog"
      >
        <span className="transaction-confirmation__icon">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <h2 id="delete-loan-title">Excluir empréstimo?</h2>
        <p>
          O empréstimo de{' '}
          <strong>
            {currencyFormatter.format(
              Number(loan.total_with_interest),
            )}
          </strong>{' '}
          em <strong>{getTransactionBankLabel(loan.bank)}</strong> será excluído.
          Empréstimos com pagamentos registrados não podem ser removidos.
        </p>
        <footer className="transaction-confirmation__actions">
          <Button
            disabled={isDeleting}
            onClick={onCancel}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            className="button--danger"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
          </Button>
        </footer>
      </section>
    </div>
  );
}
