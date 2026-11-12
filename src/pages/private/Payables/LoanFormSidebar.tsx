import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  InputDate,
  InputNumber,
  SelectField,
} from '../../../components/forms/fields';
import MessageAlert from '../../../components/ui/MessageAlert';
import { Button, IconButton } from '../../../components/ui/buttons';
import { transactionBankOptions } from '../../../config/transactionBanks';
import type { Loan, LoanPayload } from '../../../interfaces/loan';

interface LoanFormSidebarProps {
  loan: Loan | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (loan: LoanPayload) => Promise<boolean>;
}

interface LoanFormValues {
  bank: Loan['bank'];
  contracted_amount: string;
  iof_amount: string;
  monthly_interest_percentage: string;
  monthly_cet_percentage: string;
  term_months: string;
  started_at: string;
  first_due_date: string;
}

function getLocalDate(): string {
  const today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function getInitialValues(loan: Loan | null): LoanFormValues {
  return {
    bank: loan?.bank ?? '',
    contracted_amount: loan?.contracted_amount ?? '',
    iof_amount: loan?.iof_amount ?? '0.00',
    monthly_interest_percentage: loan?.monthly_interest_percentage ?? '',
    monthly_cet_percentage: loan?.monthly_cet_percentage ?? '',
    term_months: loan ? String(loan.term_months) : '',
    started_at: loan?.started_at.slice(0, 10) ?? getLocalDate(),
    first_due_date: loan?.first_due_date ?? '',
  };
}

export default function LoanFormSidebar({
  loan,
  isSaving,
  error,
  onClose,
  onSave,
}: LoanFormSidebarProps) {
  const [values, setValues] = useState(() => getInitialValues(loan));
  const [formError, setFormError] = useState<string | null>(null);

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

  function updateField<Key extends keyof LoanFormValues>(
    key: Key,
    value: LoanFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contractedAmount = Number(values.contracted_amount);
    const iofAmount = Number(values.iof_amount);
    const monthlyInterest = Number(values.monthly_interest_percentage);
    const monthlyCet = Number(values.monthly_cet_percentage);
    const termMonths = Number(values.term_months);

    if (!Number.isFinite(contractedAmount) || contractedAmount <= 0) {
      setFormError('Informe um valor contratado maior que zero.');
      return;
    }
    if (!Number.isFinite(iofAmount) || iofAmount < 0) {
      setFormError('Informe um valor de IOF válido.');
      return;
    }
    if (!Number.isFinite(monthlyInterest) || monthlyInterest < 0) {
      setFormError('Informe uma taxa de juros mensal válida.');
      return;
    }
    if (
      !values.monthly_cet_percentage.trim() ||
      !Number.isFinite(monthlyCet) ||
      monthlyCet < 0
    ) {
      setFormError('Informe um CET mensal válido.');
      return;
    }
    if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 32767) {
      setFormError('Informe um prazo válido, em meses.');
      return;
    }
    if (!values.started_at || !values.first_due_date) {
      setFormError('Informe as datas de início e do primeiro vencimento.');
      return;
    }
    if (values.first_due_date < values.started_at) {
      setFormError('O primeiro vencimento não pode ser anterior ao início.');
      return;
    }

    const saved = await onSave({
      bank: values.bank,
      contracted_amount: contractedAmount.toFixed(2),
      iof_amount: iofAmount.toFixed(2),
      monthly_interest_percentage: monthlyInterest.toFixed(4),
      monthly_cet_percentage: monthlyCet.toFixed(4),
      term_months: termMonths,
      started_at: values.started_at,
      first_due_date: values.first_due_date,
    });

    if (saved) {
      onClose();
    }
  }

  const message = formError ?? error;

  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar formulário de empréstimo"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="loan-form-title"
        aria-modal="true"
        className="transaction-drawer__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Compromisso financeiro</span>
            <h2 id="loan-form-title">
              {loan ? 'Editar empréstimo' : 'Novo empréstimo'}
            </h2>
            <p>
              {loan
                ? 'Atualize os dados e as condições do contrato.'
                : 'Informe os valores e as condições do contrato.'}
            </p>
          </div>
          <IconButton
            disabled={isSaving}
            icon={<X size={18} />}
            label="Fechar formulário"
            onClick={onClose}
          />
        </header>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form__fields">
            <SelectField
              disabled={isSaving}
              id="loan-bank"
              label="Banco"
              onChange={(bank) => updateField('bank', bank)}
              options={transactionBankOptions}
              value={values.bank}
            />
            <InputNumber
              autoFocus
              disabled={isSaving}
              id="loan-contracted-amount"
              label="Valor liberado (R$)"
              min="0.01"
              placeholder="0,00"
              required
              step="0.01"
              value={values.contracted_amount}
              onChange={(event) =>
                updateField('contracted_amount', event.target.value)
              }
            />
            <InputNumber
              disabled={isSaving}
              id="loan-iof-amount"
              label="IOF do contrato (R$)"
              min="0"
              placeholder="0,00"
              required
              step="0.01"
              value={values.iof_amount}
              onChange={(event) =>
                updateField('iof_amount', event.target.value)
              }
            />
            <InputNumber
              disabled={isSaving}
              id="loan-monthly-interest-percentage"
              label="Taxa efetiva mensal (%)"
              min="0"
              placeholder="Ex.: 8,45"
              required
              step="0.0001"
              value={values.monthly_interest_percentage}
              onChange={(event) =>
                updateField('monthly_interest_percentage', event.target.value)
              }
            />
            <InputNumber
              disabled={isSaving}
              id="loan-monthly-cet-percentage"
              label="CET mensal (%)"
              min="0"
              placeholder="Ex.: 8,888"
              required
              step="0.0001"
              value={values.monthly_cet_percentage}
              onChange={(event) =>
                updateField('monthly_cet_percentage', event.target.value)
              }
            />
            <InputNumber
              disabled={isSaving}
              id="loan-term-months"
              label="Prazo (meses)"
              min="1"
              max="32767"
              placeholder="Ex.: 7"
              required
              step="1"
              value={values.term_months}
              onChange={(event) =>
                updateField('term_months', event.target.value)
              }
            />
            <InputDate
              disabled={isSaving}
              id="loan-started-at"
              label="Data de início"
              required
              value={values.started_at}
              onChange={(event) => updateField('started_at', event.target.value)}
            />
            <InputDate
              disabled={isSaving}
              id="loan-first-due-date"
              label="Vencimento da primeira parcela"
              required
              value={values.first_due_date}
              onChange={(event) =>
                updateField('first_due_date', event.target.value)
              }
            />
          </div>

          {message && (
            <MessageAlert
              kind="error"
              message={message}
            />
          )}

          <footer className="transaction-form__actions">
            <Button
              disabled={isSaving}
              onClick={onClose}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving
                ? 'Salvando...'
                : loan
                  ? 'Salvar alterações'
                  : 'Cadastrar empréstimo'}
            </Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
