// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

// Component imports
import { InputDate, InputNumber, InputText, SelectField } from '@components/forms/fields';
import InvoiceSelect from '@components/private/InvoiceSelect';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Utility imports
import { getToday, monthlyTypeOptions } from '../utils';

// Interface imports
import type { Monthly, MonthlyPayload } from '@interface/monthly';

interface MonthlyFormSidebarProps {
  monthly: Monthly | null;
  initialIsInvoice: boolean;
  month: string;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: MonthlyPayload) => Promise<boolean>;
}

// Exported page component - MonthlyFormSidebar
export default function MonthlyFormSidebar({
  monthly,
  initialIsInvoice,
  month,
  error,
  isSaving,
  onClose,
  onSave,
}: MonthlyFormSidebarProps) {
  const [values, setValues] = useState<MonthlyPayload>(() => ({
    name: monthly?.name ?? '',
    type: monthly?.type ?? 'expense',
    amount: monthly?.amount ?? '',
    is_invoice: monthly?.is_invoice ?? initialIsInvoice,
    invoice: monthly?.invoice ?? null,
    start_date: monthly?.start_date ?? getToday(),
    end_date: monthly?.end_date ?? null,
  }));
  const [formError, setFormError] = useState<string | null>(null);
  const kind = values.is_invoice ? 'invoice' : values.type;
  const title = values.is_invoice
    ? monthly ? 'Editar fatura' : 'Nova fatura'
    : monthly ? 'Editar mensalidade' : 'Nova mensalidade';
  const kindOptions = values.is_invoice
    ? [{ value: 'invoice', label: 'Fatura' } as const]
    : monthlyTypeOptions;

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

  // Function to update form field values and reset form error
  function updateField<Key extends keyof MonthlyPayload>(key: Key, value: MonthlyPayload[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }

  // Function to validate and save the monthly schedule
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setFormError('Informe o nome da mensalidade.');
      return;
    }

    if (values.end_date && values.end_date < values.start_date) {
      setFormError('A data de fim deve ser igual ou posterior à data de início.');
      return;
    }

    if (await onSave({
      name,
      type: values.type,
      start_date: values.start_date,
      end_date: values.end_date,
      is_invoice: values.is_invoice,
      invoice: values.type === 'expense' && !values.is_invoice ? values.invoice : null,
      ...(values.is_invoice ? {} : { amount: Number(values.amount).toFixed(2) }),
    })) {
      onClose();
    }
  }

  // Render the monthly form sidebar
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar formulário de mensalidade"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="monthly-form-title"
        aria-modal="true"
        className="transaction-drawer__panel transaction-form__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <h2 id="monthly-form-title">{title}</h2>
            <p>O dia de início define o vencimento mensal.</p>
          </div>
          <IconButton
            disabled={isSaving}
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar formulário"
            onClick={onClose}
          />
        </header>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form__fields">
            <InputText
              id="monthly-name"
              label="Nome"
              fieldClassName="form-grid__item--span-4"
              maxLength={255}
              required
              disabled={isSaving}
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            <SelectField
              id="monthly-type"
              label="Tipo"
              fieldClassName="form-grid__item--span-2"
              options={kindOptions}
              disabled={isSaving || values.is_invoice}
              value={kind}
              onChange={(option) => {
                if (option === kind || option === 'invoice') {
                  return;
                }
                setFormError(null);
                setValues((current) => ({
                  ...current,
                  type: option,
                  invoice: null,
                }));
              }}
            />
            {!values.is_invoice && (
              <InputNumber
                id="monthly-amount"
                label="Valor (R$)"
                fieldClassName="form-grid__item--span-2"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                required
                disabled={isSaving}
                value={values.amount}
                onChange={(event) => updateField('amount', event.target.value)}
              />
            )}
            <InputDate
              id="monthly-start-date"
              label={values.is_invoice ? 'Primeiro vencimento' : 'Data de início'}
              fieldClassName="form-grid__item--span-2"
              required
              disabled={isSaving}
              value={values.start_date}
              onChange={(event) => updateField('start_date', event.target.value)}
            />
            <InputDate
              id="monthly-end-date"
              label="Data de fim (opcional)"
              fieldClassName="form-grid__item--span-2"
              min={values.start_date}
              disabled={isSaving}
              value={values.end_date ?? ''}
              onChange={(event) => updateField('end_date', event.target.value || null)}
            />
            {values.type === 'expense' && !values.is_invoice && (
              <InvoiceSelect
                id="monthly-invoice"
                month={month}
                value={values.invoice ?? null}
                disabled={isSaving}
                onChange={(invoice) => updateField('invoice', invoice)}
              />
            )}
          </div>

          {(formError ?? error) && (
            <MessageAlert kind="error" message={formError ?? error ?? ''} />
          )}

          <footer className="transaction-form__actions">
            <Button disabled={isSaving} onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Salvando...' : values.is_invoice ? 'Salvar fatura' : 'Salvar mensalidade'}
            </Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
