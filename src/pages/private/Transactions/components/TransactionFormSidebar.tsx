// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

// Component imports
import {
  InputDateTime,
  InputNumber,
  InputText,
  SelectField,
  TextArea,
} from '@components/forms/fields';
import InvoiceSelect from '@components/private/InvoiceSelect';
import FieldShell from '@components/forms/fields/FieldShell';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Config imports
import { transactionBankOptions } from '@config/transactionBanks';

// Hook imports
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';

// Utility imports
import { getLocalDateTimeValue } from '../../../../utils/date';

// Interface imports
import type {
  Transaction,
  TransactionFormValues,
  TransactionType,
} from '@interface/transaction';
import type { TransactionFormSidebarProps } from '../interfaces';

// Function to get the initial form values based on the transaction and initial type
function getInitialValues(
  transaction: Transaction | null,
  initialType: TransactionType,
): TransactionFormValues {
  if (transaction) {
    return {
      type: transaction.type,
      bank: transaction.bank,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      occurred_at: getLocalDateTimeValue(transaction.occurred_at),
      invoice: transaction.invoice ?? null,
      invoice_month: transaction.invoice_month ?? null,
    };
  }

  return {
    type: initialType,
    bank: '',
    amount: '',
    category: '',
    description: '',
    occurred_at: getLocalDateTimeValue(),
  };
}


// Exported page component - TransactionFormSidebar
export default function TransactionFormSidebar({
  transaction,
  initialType,
  isSaving,
  error,
  onClose,
  onSave,
}: TransactionFormSidebarProps) {

  // State to manage form values and error messages
  const [values, setValues] = useState(() =>
    getInitialValues(transaction, initialType),
  );
  const invoiceMonth = values.invoice_month || values.occurred_at.slice(0, 7) || getLocalDateTimeValue().slice(0, 7);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    hasAttemptedSubmit,
    handleInvalidCapture,
    hasMissingCustomRequiredFields,
  } = useRequiredFormValidation();

  // Effect to handle closing the form on Escape key press and preventing body scroll
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
  function updateField<Key extends keyof TransactionFormValues>(
    key: Key,
    value: TransactionFormValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    setFormError(null);
  }

  // Function to handle form submission, validate inputs, and save the transaction
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasMissingCustomRequiredFields(event.currentTarget)) {
      return;
    }

    const amount = Number(values.amount);
    const occurredAt = new Date(values.occurred_at);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Informe um valor maior que zero.');
      return;
    }
    if (Number.isNaN(occurredAt.getTime())) {
      setFormError('Informe uma data e horário válidos.');
      return;
    }

    const saved = await onSave({
      ...values,
      amount: amount.toFixed(2),
      occurred_at: occurredAt.toISOString(),
      invoice: values.type === 'expense' ? values.invoice ?? null : null,
      invoice_month: values.type === 'expense' && values.invoice ? invoiceMonth : null,
    });

    if (saved) {
      onClose();
    }
  }

  // Determine the title and message to display based on the transaction state and form error
  const title = transaction ? 'Editar lançamento' : 'Novo lançamento';
  const message = formError ?? error;

  // Render the form sidebar with fields, error messages, and action buttons
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar formulário"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="transaction-form-title"
        aria-modal="true"
        className="transaction-drawer__panel transaction-form__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Movimentação financeira</span>
            <h2 id="transaction-form-title">{title}</h2>
            <p>
              {transaction
                ? 'Atualize os dados deste lançamento.'
                : 'Preencha os dados para registrar uma movimentação.'}
            </p>
          </div>
          <IconButton
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar formulário"
            onClick={onClose}
            disabled={isSaving}
          />
        </header>

        <form
          className={`transaction-form${hasAttemptedSubmit ? ' form-validation-attempted' : ''}`}
          onInvalidCapture={handleInvalidCapture}
          onSubmit={handleSubmit}
        >
          <div className="transaction-form__fields">
            <SelectField<TransactionType>
              disabled={Boolean(transaction) || isSaving}
              fieldClassName="form-grid__item--span-2"
              hint={
                transaction
                  ? 'O tipo é definido no cadastro e não pode ser alterado.'
                  : undefined
              }
              id="transaction-type"
              label="Tipo"
              onChange={(type) => {
                if (type === values.type) {
                  return;
                }
                setValues((current) => ({ ...current, type, invoice: null, invoice_month: null }));
              }}
              options={[
                { value: 'income', label: 'Ganho' },
                { value: 'expense', label: 'Gasto' },
              ]}
              required
              validationAttempted={hasAttemptedSubmit}
              value={values.type}
            />

            <SelectField
              disabled={isSaving}
              fieldClassName="form-grid__item--span-2"
              id="transaction-bank"
              label="Banco"
              onChange={(bank) => updateField('bank', bank)}
              options={transactionBankOptions}
              required
              validationAttempted={hasAttemptedSubmit}
              value={values.bank}
            />

            <InputText
              disabled={isSaving}
              fieldClassName="form-grid__item--span-2"
              id="transaction-category"
              label="Categoria"
              maxLength={80}
              placeholder="Ex.: Salário, moradia"
              required
              value={values.category}
              onChange={(event) => updateField('category', event.target.value)}
            />
            <InputNumber
              disabled={isSaving}
              fieldClassName="form-grid__item--span-1"
              id="transaction-amount"
              label="Valor"
              min="0.01"
              placeholder="0,00"
              required
              step="0.01"
              value={values.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
            <InputDateTime
              disabled={isSaving}
              fieldClassName="form-grid__item--span-1"
              id="transaction-occurred-at"
              label="Data e horário"
              required
              value={values.occurred_at}
              onChange={(event) =>
                updateField('occurred_at', event.target.value)
              }
            />
            {values.type === 'expense' && (
              <>
                <InvoiceSelect
                  id="transaction-invoice"
                  month={invoiceMonth}
                  value={values.invoice ?? null}
                  disabled={isSaving}
                  onChange={(invoice) => updateField('invoice', invoice)}
                />
                {values.invoice && (
                  <FieldShell
                    id="transaction-invoice-month"
                    label="Mês da fatura"
                    className="form-grid__item--span-2"
                  >
                    <input
                      className="field-control"
                      id="transaction-invoice-month"
                      type="month"
                      value={invoiceMonth}
                      disabled={isSaving}
                      onChange={(event) => {
                        if (/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) {
                          updateField('invoice_month', event.target.value);
                        }
                      }}
                    />
                  </FieldShell>
                )}
              </>
            )}
            <TextArea
              disabled={isSaving}
              fieldClassName="form-grid__item--span-4"
              id="transaction-description"
              label="Descrição"
              maxLength={5000}
              placeholder="Adicione detalhes (opcional)"
              rows={4}
              value={values.description}
              onChange={(event) =>
                updateField('description', event.target.value)
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
                : transaction
                  ? 'Salvar alterações'
                  : 'Cadastrar lançamento'}
            </Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
