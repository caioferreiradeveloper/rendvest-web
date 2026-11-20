// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { Eye, X } from 'lucide-react';

// Component imports
import { Button, IconButton } from '@components/ui/buttons';
import { InputDateTime, InputNumber, SelectField } from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';

// Config imports
import { transactionBankOptions, type TransactionBank } from '@config/transactionBanks';

// Utility imports
import { formatCurrency, formatDateTime } from '../../../../utils/formatters';
import { getDebtorStatus } from '../utils';

// Interface imports
import type { DebtorDetailSidebarProps } from '../interfaces';

// Exported page component - DebtorDetailSidebar
export default function DebtorDetailSidebar({
  debtor,
  error,
  isSaving,
  onPay,
  onClose,
  onEdit,
  onDelete,
}: DebtorDetailSidebarProps) {
  // State to manage the payment form
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(debtor.remaining_amount);
  const [paidAt, setPaidAt] = useState('');
  const [bank, setBank] = useState<TransactionBank>('');
  const canReceivePayment = !debtor.is_paid && Number(debtor.remaining_amount) > 0;

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

  // Function to submit the amount received
  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(paymentAmount);
    const paymentDate = paidAt ? new Date(paidAt) : null;
    if (
      isSaving ||
      !canReceivePayment ||
      !Number.isFinite(amount) ||
      amount < 0.01 ||
      amount > Number(debtor.remaining_amount) ||
      (paymentDate && Number.isNaN(paymentDate.getTime()))
    ) {
      return;
    }

    await onPay({
      bank,
      paid_amount: amount.toFixed(2),
      ...(paymentDate ? { paid_at: paymentDate.toISOString() } : {}),
    });
  }

  // Render the debtor details and payment actions
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes do devedor"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
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
            <h2 id="debtor-detail-title">{debtor.debtor_name}</h2>
            <p>Consulte os dados deste valor a receber.</p>
          </div>
          <IconButton
            disabled={isSaving}
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div className="debtor-detail">
          <div className="debtor-detail__amount">
            <span>Saldo a receber</span>
            <strong>{formatCurrency(debtor.remaining_amount)}</strong>
          </div>
          <dl className="debtor-detail__list">
            <div>
              <dt>Valor original</dt>
              <dd>{formatCurrency(debtor.amount)}</dd>
            </div>
            <div>
              <dt>Valor recebido</dt>
              <dd>{formatCurrency(debtor.paid_amount)}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>{getDebtorStatus(debtor)}</dd>
            </div>
            <div>
              <dt>Data e horário</dt>
              <dd>{formatDateTime(debtor.occurred_at)}</dd>
            </div>
            {debtor.description && (
              <div>
                <dt>Descrição</dt>
                <dd>{debtor.description}</dd>
              </div>
            )}
            {debtor.paid_at && (
              <div>
                <dt>Recebido em</dt>
                <dd>{formatDateTime(debtor.paid_at)}</dd>
              </div>
            )}
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
          {isPaymentOpen && (
            <form
              className="debtor-payment"
              id="debtor-payment-form"
              onSubmit={handlePaymentSubmit}
            >
              <InputNumber
                disabled={isSaving}
                id="debtor-payment-amount"
                label="Valor recebido (R$)"
                max={debtor.remaining_amount}
                min="0.01"
                required
                step="0.01"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
              />
              <SelectField
                id="debtor-payment-bank"
                label="Banco do recebimento"
                options={transactionBankOptions}
                value={bank}
                disabled={isSaving}
                onChange={setBank}
              />
              <InputDateTime
                disabled={isSaving}
                id="debtor-payment-date"
                label="Data e horário do recebimento"
                hint="Se deixar em branco, será registrado o horário atual."
                value={paidAt}
                onChange={(event) => setPaidAt(event.target.value)}
              />
              {Number(paymentAmount) > 0 &&
                Number(paymentAmount) < Number(debtor.remaining_amount) && (
                  <MessageAlert
                    kind="info"
                    message="O saldo restante continuará visível. Cada dívida aceita apenas um recebimento."
                  />
                )}
              {error && <MessageAlert kind="error" message={error} />}
            </form>
          )}
        </div>

        <footer className="transaction-form__actions">
          {isPaymentOpen ? (
            <>
              <Button
                disabled={isSaving}
                onClick={() => {
                  setPaymentAmount(debtor.remaining_amount);
                  setPaidAt('');
                  setBank('');
                  setIsPaymentOpen(false);
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button disabled={isSaving} form="debtor-payment-form" type="submit">
                {isSaving ? 'Registrando...' : 'Confirmar recebimento'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onDelete} variant="secondary">
                Excluir
              </Button>
              <Button onClick={onEdit} variant="secondary">
                Editar
              </Button>
              {canReceivePayment && (
                <Button onClick={() => setIsPaymentOpen(true)}>
                  Registrar recebimento
                </Button>
              )}
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
