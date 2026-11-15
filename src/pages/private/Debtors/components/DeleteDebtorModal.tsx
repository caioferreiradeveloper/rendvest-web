import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@components/ui/buttons';
import type { DeleteDebtorModalProps } from '../interfaces';
import { formatCurrency } from '../../../../utils/formatters';

export default function DeleteDebtorModal({
  debtor,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteDebtorModalProps) {
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
          <strong>{debtor.name}</strong> será excluído permanentemente.
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
