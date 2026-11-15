import { useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { Button, IconButton } from '@components/ui/buttons';
import type { DebtorDetailSidebarProps } from '../interfaces';
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
} from '../../../../utils/formatters';

export default function DebtorDetailSidebar({
  debtor,
  onClose,
  onEdit,
  onDelete,
}: DebtorDetailSidebarProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes do devedor"
        className="transaction-drawer__backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="debtor-detail-title"
        aria-modal="true"
        className="transaction-drawer__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">
              <Eye size="var(--icon-size-13)" aria-hidden="true" />
              Detalhes do devedor
            </span>
            <h2 id="debtor-detail-title">{debtor.name}</h2>
            <p>Consulte os dados deste valor a receber.</p>
          </div>
          <IconButton
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div className="debtor-detail">
          <div className="debtor-detail__amount">
            <span>Valor devido</span>
            <strong>{formatCurrency(debtor.amount)}</strong>
          </div>
          <dl className="debtor-detail__list">
            <div>
              <dt>Nome</dt>
              <dd>{debtor.name}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{formatDateOnly(debtor.occurred_at)}</dd>
            </div>
            {debtor.created_at && (
              <div>
                <dt>Cadastrado em</dt>
                <dd>{formatDateTime(debtor.created_at)}</dd>
              </div>
            )}
            {debtor.updated_at && (
              <div>
                <dt>Última atualização</dt>
                <dd>{formatDateTime(debtor.updated_at)}</dd>
              </div>
            )}
          </dl>
        </div>

        <footer className="transaction-form__actions">
          <Button onClick={onDelete} variant="secondary">
            Excluir
          </Button>
          <Button onClick={onEdit} iconPosition="leading">
            Editar devedor
          </Button>
        </footer>
      </aside>
    </div>
  );
}
