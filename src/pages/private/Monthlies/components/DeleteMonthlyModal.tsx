// React imports
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// Component imports
import { Button } from '@components/ui/buttons';

// Interface imports
import type { Monthly } from '@interface/monthly';

// Utility imports
import { formatCurrency } from '../../../../utils/formatters';

interface DeleteMonthlyModalProps {
  monthly: Monthly;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Exported page component - DeleteMonthlyModal
export default function DeleteMonthlyModal({
  monthly,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteMonthlyModalProps) {
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

  // Render the monthly deletion confirmation modal
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
        aria-labelledby="delete-monthly-title"
        aria-modal="true"
        className="transaction-confirmation__dialog"
        role="alertdialog"
      >
        <span className="transaction-confirmation__icon">
          <AlertTriangle size="var(--icon-size-22)" aria-hidden="true" />
        </span>
        <h2 id="delete-monthly-title">Excluir mensalidade?</h2>
        <p>
          A mensalidade <strong>{monthly.name}</strong> de{' '}
          <strong>{formatCurrency(monthly.amount)}</strong> e seu histórico de
          baixas serão excluídos permanentemente.
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
