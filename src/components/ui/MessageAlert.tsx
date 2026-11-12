import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MessageAlertKind } from '../../config/apiStatusCodes';
import { IconButton } from './buttons';
import './MessageAlert.scss';

interface MessageAlertProps {
  kind: MessageAlertKind;
  message: string;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

const alertIcons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
} satisfies Record<MessageAlertKind, LucideIcon>;

export default function MessageAlert({
  kind,
  message,
  title,
  className,
  onDismiss,
}: MessageAlertProps) {
  const AlertIcon = alertIcons[kind];

  return (
    <div
      className={[
        'message-alert',
        `message-alert--${kind}`,
        'message-alert--toast',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <AlertIcon
        className="message-alert__icon"
        size={19}
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="message-alert__content">
        {title && <strong className="message-alert__title">{title}</strong>}
        <p className="message-alert__message">{message}</p>
      </div>
      {onDismiss && (
        <IconButton
          className="message-alert__dismiss"
          icon={<X size={16} />}
          label="Fechar mensagem"
          onClick={onDismiss}
          variant="text"
        />
      )}
    </div>
  );
}
