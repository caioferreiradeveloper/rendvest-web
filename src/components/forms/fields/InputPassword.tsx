import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { IconButton } from '../../ui/buttons';
import FieldShell, { getFieldDescriptionIds } from './FieldShell';

export interface InputPasswordProps
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

export default function InputPassword({
  id,
  label,
  hint,
  error,
  fieldClassName,
  required,
  ...inputProps
}: InputPasswordProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FieldShell
      className={fieldClassName}
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <span className="field-control-wrap">
        <input
          {...inputProps}
          aria-describedby={getFieldDescriptionIds(id, hint, error)}
          aria-invalid={Boolean(error)}
          className="field-control field-control--with-action"
          id={id}
          required={required}
          type={isVisible ? 'text' : 'password'}
        />
        <IconButton
          className="field-control__action"
          icon={
            isVisible ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )
          }
          label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        />
      </span>
    </FieldShell>
  );
}
