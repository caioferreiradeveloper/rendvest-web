// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

// Component imports
import { InputDate, InputNumber, SelectField } from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, ButtonLink, IconButton } from '@components/ui/buttons';

// Config imports
import { transactionBankOptions, type TransactionBank } from '@config/transactionBanks';

// Utility imports
import { formatCurrency, formatDateOnly } from '../../../../utils/formatters';
import { getMonthlyStatus, getToday } from '../utils';

// Interface imports
import type { Monthly, MonthlySettlementPayload } from '@interface/monthly';

interface MonthlyDetailSidebarProps {
  monthly: Monthly;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSettle: (payload: MonthlySettlementPayload) => Promise<void>;
}

// Exported page component - MonthlyDetailSidebar
export default function MonthlyDetailSidebar({
  monthly,
  error,
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onSettle,
}: MonthlyDetailSidebarProps) {
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [amount, setAmount] = useState(monthly.amount);
  const [settledOn, setSettledOn] = useState(getToday);
  const [bank, setBank] = useState<TransactionBank>('');
  const total = monthly.invoice_total ?? monthly.amount;
  const canSettle = Boolean(monthly.due_date) && !monthly.is_settled &&
    (!monthly.is_invoice || Number(total) > 0);
  const type = monthly.settlement?.type ?? monthly.type;

  // Effect to handle closing the sidebar on Escape key press and preventing body scroll
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSaving, onClose]);

  // Function to register a settlement for the selected month
  async function handleSettlementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSettle || isSaving) {
      return;
    }

    await onSettle({
      bank,
      month: monthly.month,
      ...(monthly.is_invoice ? {} : { amount: Number(amount).toFixed(2) }),
      settled_on: settledOn,
    });
  }

  // Render the monthly details and settlement actions
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes da mensalidade"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="monthly-detail-title"
        aria-modal="true"
        className="transaction-drawer__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">
              {isSettlementOpen ? 'Registrar baixa' : monthly.is_invoice ? 'Detalhes da fatura' : 'Detalhes da mensalidade'}
            </span>
            <h2 id="monthly-detail-title">{monthly.name}</h2>
          </div>
          <IconButton
            disabled={isSaving}
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div className="transaction-detail">
          <div className={`transaction-detail__amount transaction-detail__amount--${type}`}>
            <span>{monthly.is_settled ? 'Valor baixado' : monthly.is_invoice ? 'Total da fatura' : 'Valor previsto'}</span>
            <strong>{formatCurrency(monthly.settlement?.amount ?? total)}</strong>
          </div>
          <dl className="transaction-detail__list">
            <div>
              <dt>Tipo</dt>
              <dd>{monthly.is_invoice ? 'Fatura' : type === 'income' ? 'Ganho' : 'Gasto'}</dd>
            </div>
            <div>
              <dt>Vencimento do mês</dt>
              <dd>{monthly.due_date ? formatDateOnly(monthly.due_date) : '—'}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>{getMonthlyStatus(monthly)}</dd>
            </div>
            <div>
              <dt>Início</dt>
              <dd>{formatDateOnly(monthly.start_date)}</dd>
            </div>
            <div>
              <dt>Fim</dt>
              <dd>{monthly.end_date ? formatDateOnly(monthly.end_date) : 'Sem data de fim'}</dd>
            </div>
            {monthly.settlement && (
              <div>
                <dt>Baixa registrada em</dt>
                <dd>{formatDateOnly(monthly.settlement.settled_on)}</dd>
              </div>
            )}
          </dl>
          {(monthly.is_invoice || monthly.invoice) && !isSettlementOpen && (
            <div className="monthly-settlement">
              <ButtonLink
                to={`/app/lancamentos?${new URLSearchParams({ fatura: monthly.invoice ?? monthly.id, mes: monthly.month })}`}
                variant="secondary"
              >
                Ver gastos da fatura
              </ButtonLink>
            </div>
          )}
          {isSettlementOpen && (
            <form
              className="monthly-settlement"
              id="monthly-settlement-form"
              onSubmit={handleSettlementSubmit}
            >
              {!monthly.is_invoice && (
                <InputNumber
                  id="monthly-settlement-amount"
                  label={type === 'income' ? 'Valor recebido (R$)' : 'Valor pago (R$)'}
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  required
                  disabled={isSaving}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              )}
              <SelectField
                id="monthly-settlement-bank"
                label={type === 'income' ? 'Banco do recebimento' : 'Banco do pagamento'}
                options={transactionBankOptions}
                value={bank}
                disabled={isSaving}
                onChange={setBank}
              />
              <InputDate
                id="monthly-settlement-date"
                label={type === 'income' ? 'Data do recebimento' : 'Data do pagamento'}
                required
                disabled={isSaving}
                value={settledOn}
                onChange={(event) => setSettledOn(event.target.value)}
              />
              <p>
                {monthly.invoice
                  ? 'A baixa adiciona o valor à fatura deste mês.'
                  : 'A baixa gera um lançamento em Ganhos e gastos.'}
              </p>
              {error && <MessageAlert kind="error" message={error} />}
            </form>
          )}
        </div>

        <footer className="transaction-form__actions">
          {isSettlementOpen ? (
            <>
              <Button
                disabled={isSaving}
                onClick={() => {
                  setBank('');
                  setIsSettlementOpen(false);
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button disabled={isSaving} form="monthly-settlement-form" type="submit">
                {isSaving ? 'Registrando...' : 'Confirmar baixa'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onDelete} variant="secondary">Excluir</Button>
              <Button onClick={onEdit} variant="secondary">Editar</Button>
              {canSettle && (
                <Button onClick={() => setIsSettlementOpen(true)}>Registrar baixa</Button>
              )}
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
