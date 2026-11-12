import { useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { Button, IconButton } from '../../../components/ui/buttons';
import { getTransactionBankLabel } from '../../../config/transactionBanks';
import type { Transaction } from '../../../interfaces/transaction';

interface TransactionDetailSidebarProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

function formatCurrency(value: string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : '—';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export default function TransactionDetailSidebar({
  transaction,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailSidebarProps) {
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

  const isIncome = transaction.type === 'income';

  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes"
        className="transaction-drawer__backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="transaction-detail-title"
        aria-modal="true"
        className="transaction-drawer__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">
              <Eye size={13} aria-hidden="true" />
              Detalhes do lançamento
            </span>
            <h2 id="transaction-detail-title">
              {transaction.description || transaction.category}
            </h2>
            <p>Consulte as informações desta movimentação.</p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div className="transaction-detail">
          <div
            className={`transaction-detail__amount ${
              isIncome
                ? 'transaction-detail__amount--income'
                : 'transaction-detail__amount--expense'
            }`}
          >
            <span>{isIncome ? 'Ganho' : 'Gasto'}</span>
            <strong>
              {isIncome ? '+' : '−'}
              {formatCurrency(transaction.amount)}
            </strong>
          </div>
          <dl className="transaction-detail__list">
            <div>
              <dt>Categoria</dt>
              <dd>{transaction.category}</dd>
            </div>
            <div>
              <dt>Banco</dt>
              <dd>{getTransactionBankLabel(transaction.bank)}</dd>
            </div>
            <div>
              <dt>Data e horário</dt>
              <dd>{formatDate(transaction.occurred_at)}</dd>
            </div>
            <div>
              <dt>Descrição</dt>
              <dd>{transaction.description || 'Sem descrição'}</dd>
            </div>
            <div>
              <dt>Criado em</dt>
              <dd>
                {transaction.created_at
                  ? formatDate(transaction.created_at)
                  : 'Não informado'}
              </dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>
                {transaction.updated_at
                  ? formatDate(transaction.updated_at)
                  : 'Não informado'}
              </dd>
            </div>
          </dl>
        </div>

        <footer className="transaction-form__actions">
          <Button onClick={onDelete} variant="secondary">
            Excluir
          </Button>
          <Button onClick={onEdit} iconPosition="leading">
            Editar lançamento
          </Button>
        </footer>
      </aside>
    </div>
  );
}
