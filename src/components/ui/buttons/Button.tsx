import type { SharedButtonProps, NativeButtonProps } from './buttonStyles';
import { getButtonClassName } from './buttonStyles';

export interface ButtonProps extends SharedButtonProps, NativeButtonProps {}

export default function Button({
  children,
  icon,
  iconPosition = 'trailing',
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const iconElement = icon ? (
    <span className="button__icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

  return (
    <button
      {...buttonProps}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      type={type}
    >
      {iconPosition === 'leading' && iconElement}
      <span className="button__label">{children}</span>
      {iconPosition === 'trailing' && iconElement}
    </button>
  );
}
