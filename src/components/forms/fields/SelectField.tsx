import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
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
  validationAttempted?: boolean;
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
  validationAttempted = false,
  fieldClassName,
}: SelectFieldProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  const expanded = isOpen && !disabled && options.length > 0;

  // Position the portaled options against the trigger without affecting the form's scroll area.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!expanded || !trigger || !list) {
      return;
    }

    function positionList() {
      if (!trigger || !list) {
        return;
      }

      const gap = 6;
      const viewportPadding = 8;
      const { top, bottom, left, width } = trigger.getBoundingClientRect();
      const availableBelow = window.innerHeight - bottom - gap - viewportPadding;
      const availableAbove = top - gap - viewportPadding;
      const menuWidth = Math.min(width, window.innerWidth - 2 * viewportPadding);
      list.style.width = `${menuWidth}px`;
      list.style.left = `${Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding))}px`;

      const preferredHeight = Math.min(260, list.scrollHeight + list.offsetHeight - list.clientHeight);
      const openAbove = availableBelow < preferredHeight && availableAbove > availableBelow;
      list.style.maxHeight = `${Math.max(0, Math.min(preferredHeight, openAbove ? availableAbove : availableBelow))}px`;
      list.style.top = `${openAbove ? top - gap - list.offsetHeight : bottom + gap}px`;
    }

    function handleOutsideClick(event: PointerEvent) {
      const target = event.target as Node;
      if (!trigger?.contains(target) && !list?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleScroll(event: Event) {
      if (event.target !== list) {
        setIsOpen(false);
      }
    }

    positionList();
    window.addEventListener('resize', positionList);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      window.removeEventListener('resize', positionList);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [expanded, options.length]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const option = optionRefs.current[activeIndex];
    if (!expanded || !list || !option) {
      return;
    }

    const listTop = list.getBoundingClientRect().top + list.clientTop;
    const optionRect = option.getBoundingClientRect();
    if (optionRect.top < listTop) {
      list.scrollTop -= listTop - optionRect.top;
    } else if (optionRect.bottom > listTop + list.clientHeight) {
      list.scrollTop += optionRect.bottom - (listTop + list.clientHeight);
    }
  }, [activeIndex, expanded]);

  function chooseOption(option: SelectFieldOption<Value>) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!expanded) {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) =>
        (current + direction + options.length) % options.length,
      );
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (expanded && options[activeIndex]) {
        chooseOption(options[activeIndex]);
      } else {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
      }
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
      <div className="select-field">
        <button
          aria-activedescendant={
            expanded ? `${id}-option-${activeIndex}` : undefined
          }
          aria-controls={expanded ? `${id}-options` : undefined}
          aria-expanded={expanded}
          aria-haspopup="listbox"
          aria-invalid={
            Boolean(error) ||
            Boolean(validationAttempted && required && !value)
          }
          aria-required={required}
          className="field-control select-field__trigger"
          data-required-empty={required && !value ? 'true' : undefined}
          disabled={disabled}
          id={id}
          onClick={() => {
            setActiveIndex(selectedIndex);
            setIsOpen((open) => !open);
          }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          role="combobox"
          type="button"
        >
          <span className="select-field__value">
            {selectedOption && (
              <>
                {selectedOption.logoDomain && (
                  <BankLogo
                    label={selectedOption.label}
                    logoDomain={selectedOption.logoDomain}
                    size="small"
                  />
                )}
                <span>{selectedOption.label}</span>
              </>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={expanded ? 'select-field__chevron is-open' : 'select-field__chevron'}
            size="var(--icon-size-16)"
          />
        </button>
        {expanded && createPortal(
          <div
            className="select-field__options"
            id={`${id}-options`}
            ref={listRef}
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
                onMouseDown={(event) => event.preventDefault()}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                tabIndex={-1}
                type="button"
              >
                {option.logoDomain && (
                  <BankLogo
                    label={option.label}
                    logoDomain={option.logoDomain}
                    size="small"
                  />
                )}
                <span>{option.label}</span>
                {option.value === value && (
                  <Check
                    aria-hidden="true"
                    className="select-field__check"
                    size="var(--icon-size-15)"
                  />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
      </div>
    </FieldShell>
  );
}
