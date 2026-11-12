import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import FieldShell from './FieldShell';
import BankLogo from '../../ui/BankLogo';
import './SelectField.scss';

export interface SelectFieldOption<Value extends string = string> {
  value: Value;
  label: string;
  logoDomain?: string;
}

interface SelectFieldProps<Value extends string> {
  id: string;
  label: string;
  options: readonly SelectFieldOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fieldClassName?: string;
}

export default function SelectField<Value extends string>({
  id,
  label,
  options,
  value,
  onChange,
  hint,
  error,
  required,
  disabled,
  fieldClassName,
}: SelectFieldProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, isOpen]);

  function chooseOption(option: SelectFieldOption<Value>) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setIsOpen(true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setIsOpen((open) => !open);
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) =>
        (current + direction + options.length) % options.length,
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseOption(options[index]);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setIsOpen(false);
    }
  }

  return (
    <FieldShell
      className={fieldClassName}
      error={error}
      hint={hint}
      id={id}
      labelId={`${id}-label`}
      label={label}
      required={required}
    >
      <div className="select-field" ref={containerRef}>
        <button
          aria-activedescendant={
            isOpen ? `${id}-option-${activeIndex}` : undefined
          }
          aria-controls={`${id}-options`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          className="field-control select-field__trigger"
          disabled={disabled}
          id={id}
          onClick={() => {
            setActiveIndex(selectedIndex);
            setIsOpen((open) => !open);
          }}
          onKeyDown={handleTriggerKeyDown}
          role="combobox"
          type="button"
        >
          <span className="select-field__value">
            {selectedOption && (
              <>
                <BankLogo
                  label={selectedOption.label}
                  logoDomain={selectedOption.logoDomain}
                  size="small"
                />
                <span>{selectedOption.label}</span>
              </>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={isOpen ? 'select-field__chevron is-open' : 'select-field__chevron'}
            size={16}
          />
        </button>
        {isOpen && (
          <div
            className="select-field__options"
            id={`${id}-options`}
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {options.map((option, index) => (
              <button
                aria-selected={option.value === value}
                className={`select-field__option ${
                  index === activeIndex ? 'is-active' : ''
                }`}
                id={`${id}-option-${index}`}
                key={option.value || 'empty-option'}
                onClick={() => chooseOption(option)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                type="button"
              >
                <BankLogo
                  label={option.label}
                  logoDomain={option.logoDomain}
                  size="small"
                />
                <span>{option.label}</span>
                {option.value === value && (
                  <Check
                    aria-hidden="true"
                    className="select-field__check"
                    size={15}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
}
