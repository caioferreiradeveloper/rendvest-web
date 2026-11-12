import Button, { type ButtonProps } from './Button';

export type TextButtonProps = Omit<ButtonProps, 'variant'>;

export default function TextButton(props: TextButtonProps) {
  return <Button {...props} variant="text" />;
}
