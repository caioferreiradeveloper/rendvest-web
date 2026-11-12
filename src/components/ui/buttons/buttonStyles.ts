import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'dark' | 'light' | 'secondary' | 'text';
export type ButtonSize = 'small' | 'medium';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function getButtonClassName({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className,
}: ButtonStyleOptions) {
  return [
    'button',
    `button--${variant}`,
    size === 'small' && 'button--small',
    fullWidth && 'button--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export interface SharedButtonProps extends ButtonStyleOptions {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'leading' | 'trailing';
}

export type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children'
>;
