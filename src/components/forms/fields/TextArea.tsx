import type { TextareaHTMLAttributes } from 'react';
import FieldShell, { getFieldDescriptionIds } from './FieldShell';

export interface TextAreaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'id' | 'className'
  > {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export default function TextArea({
  id,
  label,
  hint,
  error,
  fieldClassName,
  required,
  rows = 4,
  ...textareaProps
}: TextAreaProps) {
  return (
    <FieldShell
      className={fieldClassName}
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <textarea
        {...textareaProps}
        aria-describedby={getFieldDescriptionIds(id, hint, error)}
        aria-invalid={Boolean(error)}
        className="field-control field-control--textarea"
        id={id}
        required={required}
        rows={rows}
      />
    </FieldShell>
  );
}
