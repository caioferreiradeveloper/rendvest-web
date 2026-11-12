import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  InputDateTime,
  InputNumber,
  InputText,
  SelectField,
  TextArea,
} from '../../../components/forms/fields';
import MessageAlert from '../../../components/ui/MessageAlert';
import { Button, IconButton } from '../../../components/ui/buttons';
import { transactionBankOptions } from '../../../config/transactionBanks';
import type {
  Transaction,
  TransactionFormValues,
  TransactionPayload,
  TransactionType,
} from '../../../interfaces/transaction';

interface TransactionFormSidebarProps {
  transaction: Transaction | null;
  initialType: TransactionType;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (transaction: TransactionPayload) => Promise<boolean>;
}

function getLocalDateTimeValue(value?: string): string {
  const date = value ? new Date(value) : new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

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

export default function TransactionFormSidebar({
  transaction,
  initialType,
  isSaving,
  error,
  onClose,
  onSave,
}: TransactionFormSidebarProps) {
  const [values, setValues] = useState(() =>
    getInitialValues(transaction, initialType),
  );
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

  function updateField<Key extends keyof TransactionFormValues>(
    key: Key,
    value: TransactionFormValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
    });

    if (saved) {
      onClose();
    }
  }

  const title = transaction ? 'Editar lançamento' : 'Novo lançamento';
  const message = formError ?? error;

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
        className="transaction-drawer__panel"
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
            icon={<X size={18} />}
            label="Fechar formulário"
            onClick={onClose}
            disabled={isSaving}
          />
        </header>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form__fields">
            <div className="field">
              <label className="field__label" htmlFor="transaction-type">
                Tipo
              </label>
              <select
                className="field-control"
                disabled={Boolean(transaction) || isSaving}
                id="transaction-type"
                onChange={(event) =>
                  updateField(
                    'type',
                    event.target.value as TransactionType,
                  )
                }
                value={values.type}
              >
                <option value="income">Ganho</option>
                <option value="expense">Gasto</option>
              </select>
              {transaction && (
                <span className="field__hint">
                  O tipo é definido no cadastro e não pode ser alterado.
                </span>
              )}
            </div>

            <SelectField
              disabled={isSaving}
              id="transaction-bank"
              label="Banco"
              onChange={(bank) => updateField('bank', bank)}
              options={transactionBankOptions}
              value={values.bank}
            />

            <InputNumber
              autoFocus
              disabled={isSaving}
              id="transaction-amount"
              label="Valor"
              min="0.01"
              placeholder="0,00"
              required
              step="0.01"
              value={values.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
            <InputText
              disabled={isSaving}
              id="transaction-category"
              label="Categoria"
              maxLength={80}
              placeholder="Ex.: Salário, moradia"
              required
              value={values.category}
              onChange={(event) => updateField('category', event.target.value)}
            />
            <InputDateTime
              disabled={isSaving}
              id="transaction-occurred-at"
              label="Data e horário"
              required
              value={values.occurred_at}
              onChange={(event) =>
                updateField('occurred_at', event.target.value)
              }
            />
            <TextArea
              disabled={isSaving}
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
