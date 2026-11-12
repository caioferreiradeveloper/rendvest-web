import { Link, type LinkProps } from 'react-router-dom';
import type { SharedButtonProps } from './buttonStyles';
import { getButtonClassName } from './buttonStyles';

export interface ButtonLinkProps
  extends SharedButtonProps,
    Omit<LinkProps, 'className' | 'children'> {}

export default function ButtonLink({
  children,
  icon,
  iconPosition = 'trailing',
  variant,
  size,
  fullWidth,
  className,
  ...linkProps
}: ButtonLinkProps) {
  const iconElement = icon ? (
    <span className="button__icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

  return (
    <Link
      {...linkProps}
      className={getButtonClassName({ variant, size, fullWidth, className })}
    >
      {iconPosition === 'leading' && iconElement}
      <span className="button__label">{children}</span>
      {iconPosition === 'trailing' && iconElement}
    </Link>
  );
}
