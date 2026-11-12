import type { InputHTMLAttributes } from 'react';
import FieldShell, { getFieldDescriptionIds } from './FieldShell';

export interface InputDateTimeProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'size' | 'className' | 'type'
  > {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export default function InputDateTime({
  id,
  label,
  hint,
  error,
  fieldClassName,
  required,
  ...inputProps
}: InputDateTimeProps) {
  return (
    <FieldShell
      className={fieldClassName}
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <input
        {...inputProps}
        aria-describedby={getFieldDescriptionIds(id, hint, error)}
        aria-invalid={Boolean(error)}
        className="field-control field-control--date"
        id={id}
        required={required}
        type="datetime-local"
      />
    </FieldShell>
  );
}
