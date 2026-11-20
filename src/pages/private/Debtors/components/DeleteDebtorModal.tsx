// React imports
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// Component imports
import { Button } from '@components/ui/buttons';

// Interface imports
import type { DeleteDebtorModalProps } from '../interfaces';

// Utility imports
import { formatCurrency } from '../../../../utils/formatters';

// Exported page component - DeleteDebtorModal
export default function DeleteDebtorModal({
  debtor,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteDebtorModalProps) {
  // Effect to handle closing the modal on Escape key press and preventing body scroll
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

  // Render the delete debtor confirmation modal
  return (
    <div className="transaction-confirmation">
      <button
        aria-label="Cancelar exclusão"
        className="transaction-confirmation__backdrop"
        disabled={isDeleting}
        onClick={onCancel}
        type="button"
      />
      <section
        aria-labelledby="delete-debtor-title"
        aria-modal="true"
        className="transaction-confirmation__dialog"
        role="alertdialog"
      >
        <span className="transaction-confirmation__icon">
          <AlertTriangle size="var(--icon-size-22)" aria-hidden="true" />
        </span>
        <h2 id="delete-debtor-title">Excluir registro?</h2>
        <p>
          O valor de <strong>{formatCurrency(debtor.amount)}</strong> devido por{' '}
          <strong>{debtor.debtor_name}</strong> será excluído permanentemente.
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
