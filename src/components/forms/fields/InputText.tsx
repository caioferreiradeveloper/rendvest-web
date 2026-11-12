import type { InputHTMLAttributes } from 'react';
import FieldShell, { getFieldDescriptionIds } from './FieldShell';

export interface InputTextProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'size' | 'className' | 'type'
  > {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
  type?: 'text' | 'email' | 'search' | 'tel' | 'url';
}

export default function InputText({
  id,
  label,
  hint,
  error,
  fieldClassName,
  type = 'text',
  required,
  ...inputProps
}: InputTextProps) {
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
        className="field-control"
        id={id}
        required={required}
        type={type}
      />
    </FieldShell>
  );
}
