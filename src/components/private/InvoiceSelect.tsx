// React imports
import { useEffect, useState } from 'react';

// Component imports
import { SelectField } from '@components/forms/fields';
import MessageAlert from '@components/ui/MessageAlert';

// Service imports
import { listInvoices } from '@services/monthlies/monthlyService';

// Interface imports
import type { Monthly } from '@interface/monthly';

interface InvoiceSelectProps {
  id: string;
  month: string;
  value: string | null;
  disabled: boolean;
  onChange: (value: string | null) => void;
}

// Render the selector for existing invoices.
export default function InvoiceSelect({
  id,
  month,
  value,
  disabled,
  onChange,
}: InvoiceSelectProps) {
  const [invoices, setInvoices] = useState<Monthly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invoices for the selected billing month.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    listInvoices(month)
      .then((results) => {
        if (active) {
          setInvoices(results);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar as faturas.');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [month]);

  const options = [
    { value: '', label: 'Sem fatura' },
    ...invoices.map((invoice) => ({ value: invoice.id, label: invoice.name })),
  ];
  if (value && !options.some((option) => option.value === value)) {
    options.push({ value, label: 'Fatura vinculada' });
  }

  return (
    <>
      <SelectField
        id={id}
        label="Fatura (opcional)"
        fieldClassName="form-grid__item--span-2"
        disabled={disabled || isLoading}
        options={options}
        value={value ?? ''}
        onChange={(invoice) => onChange(invoice || null)}
        hint={isLoading ? 'Carregando faturas…' : undefined}
      />
      {error && (
        <div className="form-grid__item--span-4">
          <MessageAlert kind="error" message={error} />
        </div>
      )}
    </>
  );
}
