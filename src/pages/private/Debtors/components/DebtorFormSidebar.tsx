// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

// Component imports
import {
  InputDateTime,
  InputNumber,
  InputText,
  TextArea,
} from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Hook imports
import useRequiredFormValidation from '@hooks/useRequiredFormValidation';

// Utility imports
import { getLocalDateTimeValue } from '../../../../utils/date';

// Interface imports
import type { Debtor, DebtorPayload } from '@interface/debtor';
import type { DebtorFormSidebarProps } from '../interfaces';

// Function to get the initial form values based on the debtor
function getInitialValues(debtor: Debtor | null): DebtorPayload {
  return {
    debtor_name: debtor?.debtor_name ?? '',
    amount: debtor?.amount ?? '',
    description: debtor?.description ?? '',
    occurred_at: getLocalDateTimeValue(debtor?.occurred_at),
  };
}

// Exported page component - DebtorFormSidebar
export default function DebtorFormSidebar({
  debtor,
  isSaving,
  error,
  onClose,
  onSave,
}: DebtorFormSidebarProps) {
  // State to manage form values and error messages
  const [values, setValues] = useState(() => getInitialValues(debtor));
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
  function updateField<Key extends keyof DebtorPayload>(
    key: Key,
    value: DebtorPayload[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }

  // Function to handle form submission, validate inputs, and save the debtor
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasMissingCustomRequiredFields(event.currentTarget)) {
      return;
    }

    const amount = Number(values.amount);
    const occurredAt = new Date(values.occurred_at);
    if (!values.debtor_name.trim()) {
      setFormError('Informe o nome de quem deve.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Informe um valor devido maior que zero.');
      return;
    }
    if (debtor && amount < Number(debtor.paid_amount)) {
      setFormError('O valor devido precisa cobrir o valor já recebido.');
      return;
    }
    if (Number.isNaN(occurredAt.getTime())) {
      setFormError('Informe uma data e horário válidos.');
      return;
    }

    const saved = await onSave({
      debtor_name: values.debtor_name.trim(),
      amount: amount.toFixed(2),
      description: values.description.trim(),
      occurred_at:
        debtor && values.occurred_at === getLocalDateTimeValue(debtor.occurred_at)
          ? debtor.occurred_at
          : occurredAt.toISOString(),
    });

    if (saved) {
      onClose();
    }
  }

  // Determine the title and message to display
  const message = formError ?? error;
  const title = debtor ? 'Editar devedor' : 'Novo devedor';

  // Render the debtor form sidebar with fields, error messages, and action buttons
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
              maxLength={255}
              placeholder="Ex.: Maria Silva"
              required
              value={values.debtor_name}
              onChange={(event) => updateField('debtor_name', event.target.value)}
            />
            <InputDateTime
              disabled={isSaving}
              fieldClassName="form-grid__item--span-1"
              id="debtor-occurred-at"
              label="Data e horário"
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
              max="9999999999.99"
              min="0.01"
              placeholder="0,00"
              required
              step="0.01"
              value={values.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
            <TextArea
              disabled={isSaving}
              fieldClassName="form-grid__item--span-4"
              id="debtor-description"
              label="Descrição"
              placeholder="Adicione detalhes (opcional)"
              rows={4}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
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
