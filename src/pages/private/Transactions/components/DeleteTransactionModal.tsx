// React imports
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// Component imports
import { Button } from '@components/ui/buttons';

// Interface imports
import type { DeleteTransactionModalProps } from '../interfaces';


// Exported page component - DeleteTransactionModal
export default function DeleteTransactionModal({
  transaction,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {

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

  // Render the delete transaction confirmation modal with transaction details and action buttons
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
        aria-labelledby="delete-transaction-title"
        aria-modal="true"
        className="transaction-confirmation__dialog"
        role="alertdialog"
      >
        <span className="transaction-confirmation__icon">
          <AlertTriangle size="var(--icon-size-22)" aria-hidden="true" />
        </span>
        <h2 id="delete-transaction-title">Excluir lançamento?</h2>
        <p>
          Esta ação excluirá permanentemente{' '}
          <strong>
            {transaction.description || transaction.category}
          </strong>
          . Não será possível desfazê-la.
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
