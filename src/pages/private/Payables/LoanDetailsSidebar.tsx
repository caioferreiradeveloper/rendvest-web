import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import {
  InputDateTime,
  InputNumber,
  SelectField,
} from '../../../components/forms/fields';
import MessageAlert from '../../../components/ui/MessageAlert';
import { Button, IconButton } from '../../../components/ui/buttons';
import BankLogo from '../../../components/ui/BankLogo';
import {
  getTransactionBankLabel,
  getTransactionBankLogoDomain,
} from '../../../config/transactionBanks';
import type {
  Loan,
  LoanDetails,
  LoanInstallment,
  LoanPaymentPayload,
} from '../../../interfaces/loan';

interface LoanDetailsSidebarProps {
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

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const statusLabels = {
  pending: 'Pendente',
  partial: 'Parcial',
  paid: 'Paga',
  overdue: 'Em atraso',
} as const;

function formatCurrency(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : '—';
}

function getInstallmentDiscount(installment: LoanInstallment): number {
  if (installment.status !== 'paid') {
    return 0;
  }

  const discount =
    Number(installment.amount_due) - Number(installment.amount_paid);
  return Number.isFinite(discount)
    ? Math.max(0, Math.round(discount * 100) / 100)
    : 0;
}

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function getLocalDateTimeValue(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function LoanDetailsSidebar({
  details,
  openPaymentOnLoad = false,
  isSaving,
  error,
  onClose,
  onEdit,
  onDelete,
  onAddPayment,
}: LoanDetailsSidebarProps) {
  const [paymentInstallmentNumber, setPaymentInstallmentNumber] = useState<
    number | null
  >(null);
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isPaymentScreen, setIsPaymentScreen] = useState(false);
  const autoOpenedPayment = useRef(false);
  const { loan, installments } = details;
  const totalPayable = Number(loan.total_with_interest);
  const paidTotal = Number(loan.amount_paid);
  const paidPercentage =
    totalPayable > 0 ? Math.min((paidTotal / totalPayable) * 100, 100) : 0;
  const paidInstallments = useMemo(
    () =>
      installments.filter(
        (installment) =>
          installment.status === 'paid' &&
          Number(installment.amount_paid) > 0,
      ).sort((first, second) => first.number - second.number),
    [installments],
  );
  const hasRegisteredPayments =
    Number(loan.amount_paid) > 0 ||
    installments.some((installment) => Number(installment.amount_paid) > 0);
  const recentPaidInstallments = paidInstallments.slice(-4).reverse();
  const totalDiscount = paidInstallments.reduce(
    (total, installment) =>
      total + Math.round(getInstallmentDiscount(installment) * 100),
    0,
  ) / 100;
  const selectedInstallment = useMemo(
    () =>
      installments.find(
        (installment) => installment.number === paymentInstallmentNumber,
      ) ?? null,
    [installments, paymentInstallmentNumber],
  );
  const payableInstallments = useMemo(
    () =>
      installments.filter(
        (installment) => Number(installment.remaining_amount) > 0,
      ),
    [installments],
  );
  const installmentOptions = useMemo(
    () =>
      payableInstallments.map((installment) => ({
        value: String(installment.number),
        label: `Parcela ${installment.number} · vence ${formatDate(installment.due_date)} · ${formatCurrency(installment.remaining_amount)}`,
      })),
    [payableInstallments],
  );

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

  useEffect(() => {
    if (!openPaymentOnLoad || autoOpenedPayment.current) {
      return;
    }
    autoOpenedPayment.current = true;
    setIsPaymentScreen(true);
    const firstUnpaidInstallment = installments.find(
      (installment) => Number(installment.remaining_amount) > 0,
    );
    if (firstUnpaidInstallment) {
      setPaymentInstallmentNumber(firstUnpaidInstallment.number);
      setAmount(firstUnpaidInstallment.remaining_amount);
      setPaidAt(getLocalDateTimeValue());
    }
  }, [installments, openPaymentOnLoad]);

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInstallment) {
      setFormError('Selecione uma parcela para registrar o pagamento.');
      return;
    }

    const paymentAmount = Number(amount);
    const maxAmount = Number(selectedInstallment.remaining_amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setFormError('Informe um valor de pagamento maior que zero.');
      return;
    }
    if (paymentAmount > maxAmount) {
      setFormError('O pagamento não pode exceder o saldo desta parcela.');
      return;
    }
    const paymentPayload: LoanPaymentPayload = {
      installment_number: selectedInstallment.number,
      amount: paymentAmount.toFixed(2),
    };
    if (paidAt) {
      const paidAtDate = new Date(paidAt);
      if (Number.isNaN(paidAtDate.getTime())) {
        setFormError('Informe uma data e horário válidos.');
        return;
      }
      paymentPayload.paid_at = paidAtDate.toISOString();
    }

    const created = await onAddPayment(loan.id, paymentPayload);
    if (created) {
      setPaymentInstallmentNumber(null);
      setAmount('');
      setPaidAt('');
      setFormError(null);
      setIsPaymentScreen(false);
    }
  }

  function openPaymentForm(installment: LoanInstallment) {
    setPaymentInstallmentNumber(installment.number);
    setAmount(installment.remaining_amount);
    setPaidAt(getLocalDateTimeValue());
    setFormError(null);
    setIsPaymentScreen(true);
  }

  function closePaymentScreen() {
    setPaymentInstallmentNumber(null);
    setAmount('');
    setPaidAt('');
    setFormError(null);
    setIsPaymentScreen(false);
  }

  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar detalhes do empréstimo"
        className="transaction-drawer__backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="loan-detail-title"
        aria-modal="true"
        className="transaction-drawer__panel loan-details-sidebar__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Empréstimo a pagar</span>
            <h2 id="loan-detail-title">
              {isPaymentScreen ? 'Registrar pagamento' : 'Detalhes do empréstimo'}
            </h2>
            <p>
              {isPaymentScreen
                ? 'Escolha a parcela e informe o valor que deseja pagar.'
                : 'Consulte as condições e acompanhe cada parcela.'}
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            label="Fechar detalhes"
            onClick={onClose}
          />
        </header>

        <div
          className={`loan-detail-content${isPaymentScreen ? ' loan-detail-content--payment' : ''}`}
        >
          {isPaymentScreen ? (
            <section aria-label="Registrar pagamento" className="loan-payment-screen">
              <button
                className="loan-payment-screen__back"
                onClick={closePaymentScreen}
                type="button"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Voltar aos detalhes
              </button>

              {payableInstallments.length ? (
                <div className="loan-payment-screen__layout">
                  <form
                    className="loan-payment-screen__form"
                    onSubmit={handlePaymentSubmit}
                  >
                    <SelectField
                      disabled={isSaving}
                      fieldClassName="loan-payment-screen__select"
                      id="loan-payment-installment"
                      label="Parcela a pagar"
                      onChange={(value) => {
                        const installment = payableInstallments.find(
                          (item) => String(item.number) === value,
                        );
                        if (installment) {
                          setPaymentInstallmentNumber(installment.number);
                          setAmount(installment.remaining_amount);
                          setFormError(null);
                        }
                      }}
                      options={installmentOptions}
                      value={
                        selectedInstallment
                          ? String(selectedInstallment.number)
                          : ''
                      }
                    />

                    {selectedInstallment && (
                      <>
                        <div className="loan-payment-hero">
                          <div className="loan-payment-hero__top">
                            <span className="loan-payment-hero__icon">
                              <CircleDollarSign size={20} aria-hidden="true" />
                            </span>
                            <span
                              className={`loan-installment__status loan-installment__status--${selectedInstallment.status}`}
                            >
                              {statusLabels[selectedInstallment.status]}
                            </span>
                          </div>
                          <span className="loan-payment-hero__label">
                            Saldo desta parcela
                          </span>
                          <strong>
                            {formatCurrency(selectedInstallment.remaining_amount)}
                          </strong>
                          <div className="loan-payment-hero__meta">
                            <span>
                              Parcela {selectedInstallment.number} de{' '}
                              {installments.length}
                            </span>
                            <span>
                              Vencimento {formatDate(selectedInstallment.due_date)}
                            </span>
                          </div>
                        </div>

                        <div className="loan-payment-screen__amount">
                          <InputNumber
                            autoFocus
                            disabled={isSaving}
                            fieldClassName="loan-payment-screen__amount-field"
                            id="loan-payment-amount"
                            label="Valor do pagamento"
                            max={Number(
                              selectedInstallment.remaining_amount,
                            ).toFixed(2)}
                            min="0.01"
                            placeholder="0,00"
                            required
                            step="0.01"
                            value={amount}
                            onChange={(event) => {
                              setAmount(event.target.value);
                              setFormError(null);
                            }}
                          />
                          <button
                            className="loan-payment-screen__full-amount"
                            disabled={isSaving}
                            onClick={() =>
                              setAmount(selectedInstallment.remaining_amount)
                            }
                            type="button"
                          >
                            Usar saldo total
                          </button>
                        </div>

                        <InputDateTime
                          disabled={isSaving}
                          id="loan-payment-paid-at"
                          label="Data do pagamento (opcional)"
                          value={paidAt}
                          onChange={(event) => {
                            setPaidAt(event.target.value);
                            setFormError(null);
                          }}
                        />
                        <p className="loan-payment-screen__hint">
                          O pagamento pode ser parcial e não pode exceder o
                          saldo da parcela.
                        </p>
                      </>
                    )}

                    {(formError || error) && (
                      <MessageAlert
                        kind="error"
                        message={formError ?? error ?? ''}
                      />
                    )}

                    <footer className="loan-payment-screen__actions">
                      <Button
                        disabled={isSaving}
                        onClick={closePaymentScreen}
                        type="button"
                        variant="secondary"
                      >
                        Cancelar
                      </Button>
                      <Button
                        disabled={isSaving || !selectedInstallment}
                        icon={<CircleDollarSign size={16} />}
                        type="submit"
                      >
                        {isSaving ? 'Registrando...' : 'Confirmar pagamento'}
                      </Button>
                    </footer>
                  </form>

                  <aside
                    aria-label="Evolução e histórico de pagamentos"
                    className="loan-payment-overview"
                  >
                    <section className="loan-payment-progress">
                      <div className="loan-payment-progress__heading">
                        <span>Progresso do empréstimo</span>
                        <strong>{paidPercentage.toFixed(0)}%</strong>
                      </div>
                      <div
                        aria-label={`${paidPercentage.toFixed(0)}% quitado`}
                        className="loan-progress"
                        role="progressbar"
                        aria-valuenow={paidPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span style={{ width: `${paidPercentage}%` }} />
                      </div>
                      <div className="loan-payment-progress__totals">
                        <span>
                          Pago <strong>{formatCurrency(paidTotal)}</strong>
                        </span>
                        <span>
                          Restante{' '}
                          <strong>{formatCurrency(loan.remaining_amount)}</strong>
                        </span>
                      </div>
                      <span className="loan-payment-progress__count">
                        {paidInstallments.length} de {installments.length}{' '}
                        parcelas quitadas
                      </span>
                    </section>

                    <section className="loan-payment-history">
                      <header>
                        <div>
                          <h3>Parcelas pagas</h3>
                          <span>
                            {paidInstallments.length}{' '}
                            {paidInstallments.length === 1
                              ? 'parcela quitada'
                              : 'parcelas quitadas'}
                          </span>
                        </div>
                        <strong>{formatCurrency(totalDiscount)}</strong>
                      </header>
                      <p className="loan-payment-history__note">
                        Desconto: valor previsto menos o total pago.
                      </p>
                      {recentPaidInstallments.length ? (
                        <ul className="loan-payment-history__list">
                          {recentPaidInstallments.map((installment) => {
                            const discount =
                              getInstallmentDiscount(installment);

                            return (
                              <li key={installment.number}>
                                <span>
                                  Parcela {installment.number}
                                  <small>{formatDate(installment.due_date)}</small>
                                </span>
                                <span>
                                  <strong>
                                    {formatCurrency(installment.amount_paid)}
                                  </strong>
                                  <small>
                                    {discount > 0
                                      ? `${formatCurrency(discount)} de desconto`
                                      : 'Sem desconto'}
                                  </small>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="loan-payment-history__empty">
                          Nenhuma parcela foi quitada ainda.
                        </p>
                      )}
                      {paidInstallments.length > recentPaidInstallments.length && (
                        <span className="loan-payment-history__more">
                          Consulte as demais parcelas nos detalhes do contrato.
                        </span>
                      )}
                    </section>
                  </aside>
                </div>
              ) : (
                <div className="loan-payment-screen__empty">
                  <span>
                    <CalendarDays size={23} aria-hidden="true" />
                  </span>
                  <strong>Todas as parcelas estão pagas</strong>
                  <p>Não há saldo pendente para este empréstimo.</p>
                </div>
              )}
            </section>
          ) : (
            <>
          <section className="loan-detail-summary" aria-label="Resumo">
            <div className="loan-detail-summary__bank">
              <BankLogo
                label={getTransactionBankLabel(loan.bank)}
                logoDomain={getTransactionBankLogoDomain(loan.bank)}
              />
              <div>
                <span>Instituição financeira</span>
                <strong>{getTransactionBankLabel(loan.bank)}</strong>
              </div>
            </div>
            <div className="loan-detail-summary__amounts">
              <div>
                <span>Total a pagar</span>
                <strong>{formatCurrency(loan.total_with_interest)}</strong>
              </div>
              <div>
                <span>Valor financiado</span>
                <strong>{formatCurrency(loan.financed_amount)}</strong>
              </div>
              <div>
                <span>Pago</span>
                <strong className="loan-value--paid">
                  {formatCurrency(loan.amount_paid)}
                </strong>
              </div>
              <div>
                <span>Saldo restante</span>
                <strong className="loan-value--remaining">
                  {formatCurrency(loan.remaining_amount)}
                </strong>
              </div>
            </div>
            <div
              aria-label={`${paidPercentage.toFixed(0)}% quitado`}
              className="loan-progress"
              role="progressbar"
              aria-valuenow={paidPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${paidPercentage}%` }} />
            </div>
            <div className="loan-progress__summary">
              <span>
                {paidInstallments.length} de {installments.length} parcelas
                quitadas
              </span>
              <span>
                Descontos registrados {formatCurrency(totalDiscount)}
              </span>
            </div>
          </section>

          <dl className="loan-detail-list">
            <div>
              <dt>Valor liberado</dt>
              <dd>{formatCurrency(loan.contracted_amount)}</dd>
            </div>
            <div>
              <dt>IOF</dt>
              <dd>{formatCurrency(loan.iof_amount)}</dd>
            </div>
            <div>
              <dt>Taxa mensal</dt>
              <dd>{loan.monthly_interest_percentage}%</dd>
            </div>
            <div>
              <dt>CET mensal</dt>
              <dd>
                {loan.monthly_cet_percentage === null
                  ? 'Não informado'
                  : `${loan.monthly_cet_percentage}%`}
              </dd>
            </div>
            <div>
              <dt>Parcela mensal</dt>
              <dd>{formatCurrency(loan.monthly_installment_amount)}</dd>
            </div>
            <div>
              <dt>Prazo</dt>
              <dd>{loan.term_months} meses</dd>
            </div>
            <div>
              <dt>Início</dt>
              <dd>{formatDate(loan.started_at)}</dd>
            </div>
            <div>
              <dt>Primeiro vencimento</dt>
              <dd>{formatDate(loan.first_due_date)}</dd>
            </div>
          </dl>

          <section className="loan-payments">
            <header className="loan-payments__header">
              <div>
                <h3>Parcelas</h3>
                <p>{installments.length} parcelas no contrato</p>
              </div>
            </header>

            {installments.length ? (
              <ol className="loan-installment-list">
                {installments.map((installment) => {
                  const canPay =
                    Number(installment.remaining_amount) > 0 &&
                    installment.status !== 'paid';
                  return (
                    <li
                      className="loan-installment"
                      key={installment.number}
                    >
                      <div className="loan-installment__heading">
                        <div>
                          <strong>Parcela {installment.number}</strong>
                          <span>Vence em {formatDate(installment.due_date)}</span>
                        </div>
                        <span
                          className={`loan-installment__status loan-installment__status--${installment.status}`}
                        >
                          {statusLabels[installment.status]}
                        </span>
                      </div>
                      <dl className="loan-installment__amounts">
                        <div>
                          <dt>Valor</dt>
                          <dd>{formatCurrency(installment.amount_due)}</dd>
                        </div>
                        <div>
                          <dt>Pago</dt>
                          <dd>{formatCurrency(installment.amount_paid)}</dd>
                        </div>
                        <div>
                          <dt>Saldo</dt>
                          <dd>{formatCurrency(installment.remaining_amount)}</dd>
                        </div>
                      </dl>
                      <div className="loan-installment__breakdown">
                        <span>
                          Juros {formatCurrency(installment.interest_amount)}
                        </span>
                        <span>
                          Principal {formatCurrency(installment.principal_amount)}
                        </span>
                        {installment.status === 'paid' && (
                          <span>
                            Desconto{' '}
                            {formatCurrency(getInstallmentDiscount(installment))}
                          </span>
                        )}
                      </div>
                      {canPay && (
                        <Button
                          disabled={isSaving}
                          icon={<Plus size={14} />}
                          onClick={() => openPaymentForm(installment)}
                          size="small"
                          variant="secondary"
                        >
                          Pagar parcela
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="loan-payments__empty">
                <CalendarDays size={18} aria-hidden="true" />
                <span>Nenhuma parcela retornada pela API.</span>
              </div>
            )}
          </section>
            </>
          )}
        </div>

        {!isPaymentScreen && (
          <footer className="transaction-form__actions">
            <Button
              disabled={hasRegisteredPayments}
              onClick={() => onDelete(loan)}
              title={
                hasRegisteredPayments
                  ? 'Não é possível excluir após registrar pagamentos.'
                  : undefined
              }
              variant="secondary"
            >
              Excluir
            </Button>
            <Button
              disabled={hasRegisteredPayments}
              icon={<Pencil size={15} />}
              iconPosition="leading"
              onClick={() => onEdit(loan)}
              title={
                hasRegisteredPayments
                  ? 'Não é possível editar após registrar pagamentos.'
                  : undefined
              }
            >
              Editar empréstimo
            </Button>
          </footer>
        )}
      </aside>
    </div>
  );
}
