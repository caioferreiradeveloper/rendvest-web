// React imports
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

// Component imports
import { InputDate, InputNumber, InputText } from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, IconButton } from '@components/ui/buttons';

// Interface imports
import type { WishlistItem, WishlistItemPayload } from '@interface/wishlist';

interface WishlistItemFormSidebarProps {
  item: WishlistItem | null;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: WishlistItemPayload) => Promise<boolean>;
}

// Exported page component - WishlistItemFormSidebar
export default function WishlistItemFormSidebar({
  item,
  error,
  isSaving,
  onClose,
  onSave,
}: WishlistItemFormSidebarProps) {
  const [values, setValues] = useState<WishlistItemPayload>(() => ({
    name: item?.name ?? '',
    amount: item?.amount ?? '',
    expected_purchase_date: item?.expected_purchase_date ?? null,
  }));
  const [formError, setFormError] = useState<string | null>(null);
  const title = item ? 'Editar item' : 'Novo item';

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
  function updateField<Key extends keyof WishlistItemPayload>(key: Key, value: WishlistItemPayload[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }

  // Function to validate and save the wishlist item
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setFormError('Informe o nome do item.');
      return;
    }

    if (await onSave({ ...values, name, amount: Number(values.amount).toFixed(2) })) {
      onClose();
    }
  }

  // Render the item form sidebar
  return (
    <div className="transaction-drawer">
      <button
        aria-label="Fechar formulário do item"
        className="transaction-drawer__backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="item-form-title"
        aria-modal="true"
        className="transaction-drawer__panel transaction-form__panel"
        role="dialog"
      >
        <header className="transaction-drawer__header">
          <div>
            <h2 id="item-form-title">{title}</h2>
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
              id="item-name"
              label="Nome"
              fieldClassName="form-grid__item--span-4"
              maxLength={255}
              required
              disabled={isSaving}
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            <InputNumber
              id="item-amount"
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
            <InputDate
              id="wishlist-expected-date"
              label="Data prevista da compra (opcional)"
              fieldClassName="form-grid__item--span-2"
              disabled={isSaving}
              value={values.expected_purchase_date ?? ''}
              onChange={(event) => updateField('expected_purchase_date', event.target.value || null)}
            />
          </div>

          {(formError ?? error) && (
            <MessageAlert kind="error" message={formError ?? error ?? ''} />
          )}

          <footer className="transaction-form__actions">
            <Button disabled={isSaving} onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Salvando...' : 'Salvar item'}
            </Button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
