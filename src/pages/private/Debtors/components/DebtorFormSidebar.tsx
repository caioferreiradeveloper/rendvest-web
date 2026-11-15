import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  InputDate,
  InputNumber,
  InputText,
} from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';
import type { Debtor } from '@interface/debtor';
import type { DebtorFormSidebarProps } from '../interfaces';

interface DebtorFormValues {
  name: string;
  amount: string;
  occurred_at: string;
}

function getLocalDate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function getInitialValues(debtor: Debtor | null): DebtorFormValues {
  return {
    name: debtor?.name ?? '',
    amount: debtor?.amount ?? '',
    occurred_at: debtor?.occurred_at.slice(0, 10) ?? getLocalDate(),
  };
}

export default function DebtorFormSidebar({
  debtor,
  isSaving,
  error,
  onClose,
  onSave,
}: DebtorFormSidebarProps) {
  const [values, setValues] = useState(() => getInitialValues(debtor));
  const [formError, setFormError] = useState<string | null>(null);
  const {
    hasAttemptedSubmit,
    handleInvalidCapture,
    hasMissingCustomRequiredFields,
  } = useRequiredFormValidation();

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

  function updateField<Key extends keyof DebtorFormValues>(
    key: Key,
    value: DebtorFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasMissingCustomRequiredFields(event.currentTarget)) {
      return;
    }

    const amount = Number(values.amount);
    const occurredAt = new Date(`${values.occurred_at}T00:00:00`);
    if (!values.name.trim()) {
      setFormError('Informe o nome de quem deve.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Informe um valor devido maior que zero.');
      return;
    }
    if (Number.isNaN(occurredAt.getTime())) {
      setFormError('Informe uma data válida.');
      return;
    }

    const saved = await onSave({
      name: values.name.trim(),
      amount: amount.toFixed(2),
      occurred_at: values.occurred_at,
    });

    if (saved) {
      onClose();
    }
  }

  const message = formError ?? error;
  const title = debtor ? 'Editar devedor' : 'Novo devedor';

  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar formulário de devedor"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="debtor-form-title"
        aria-modal="true"
        className="transaction-drawer__panel transaction-form__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <span className="eyebrow">Valor a receber</span>
            <h2 id="debtor-form-title">{title}</h2>
            <p>
              {debtor
                ? 'Atualize os dados deste valor a receber.'
                : 'Informe quem deve, a data e o valor.'}
            </p>
          </div>
          <IconButton
            disabled={isSaving}
            icon={<X size="var(--icon-size-18)" />}
            label="Fechar formulário"
            onClick={onClose}
          />
        </header>

        <form
          className={`transaction-form${hasAttemptedSubmit ? ' form-validation-attempted' : ''}`}
          onInvalidCapture={handleInvalidCapture}
          onSubmit={handleSubmit}
        >
          <div className="transaction-form__fields">
            <InputText
              disabled={isSaving}
              fieldClassName="form-grid__item--span-2"
              id="debtor-name"
              label="Nome de quem deve"
              maxLength={120}
              placeholder="Ex.: Maria Silva"
              required
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            <InputDate
              disabled={isSaving}
              fieldClassName="form-grid__item--span-1"
              id="debtor-occurred-at"
              label="Data"
              required
              value={values.occurred_at}
              onChange={(event) =>
                updateField('occurred_at', event.target.value)
              }
            />
            <InputNumber
              disabled={isSaving}
              fieldClassName="form-grid__item--span-1"
              id="debtor-amount"
              label="Valor devido (R$)"
              min="0.01"
              placeholder="0,00"
              required
              step="0.01"
              value={values.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
          </div>

          {message && <MessageAlert kind="error" message={message} />}

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
                : debtor
                  ? 'Salvar alterações'
                  : 'Cadastrar devedor'}
            </Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
