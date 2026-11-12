import type { ReactNode } from 'react';
import type { NativeButtonProps } from './buttonStyles';
import { getButtonClassName } from './buttonStyles';

export interface IconButtonProps extends NativeButtonProps {
  icon: ReactNode;
  label: string;
  className?: string;
  variant?: 'primary' | 'dark' | 'light' | 'secondary' | 'text';
}

export default function IconButton({
  icon,
  label,
  className,
  variant = 'secondary',
  type = 'button',
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      {...buttonProps}
      aria-label={label}
      className={getButtonClassName({
        variant,
        className: ['button--icon', className].filter(Boolean).join(' '),
      })}
      title={label}
      type={type}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
