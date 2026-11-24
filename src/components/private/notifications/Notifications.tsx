import { AlertTriangle, Bell, Check, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { administrationLinks } from '@config/administration';
import { Button, ButtonLink, IconButton } from '@components/ui/buttons';
import Skeleton from '@components/ui/Skeleton';
import { listNotifications, markNotificationRead, type SystemNotification } from '@services/notifications/notificationService';
import './Notifications.scss';

const typeLabels = { system: 'Sistema', alert: 'Alerta', news: 'Notícia' };
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const refreshInterval = 60_000;

function NotificationDialog({ titleId, onDismiss, children }: {
  titleId: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog className="notification-dialog" ref={dialogRef} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onDismiss(); }}>
      {children}
    </dialog>
  );
}

function NotificationDate({ notification }: { notification: SystemNotification }) {
  return <time dateTime={notification.date}>{dateFormat.format(new Date(notification.date))}</time>;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<SystemNotification[] | null>(null);
  const [alertsAtLogin, setAlertsAtLogin] = useState<Set<number> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [readError, setReadError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const readIds = useRef(new Set<number>());
  const readRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timeout: number;

    async function load() {
      try {
        const data = await listNotifications(controller.signal);
        if (controller.signal.aborted) return;
        setNotifications(data.map((item) => readIds.current.has(item.id) ? { ...item, status: 'read' } : item));
        setAlertsAtLogin((previous) => previous ?? new Set(data.filter(
          (item) => item.type === 'alert' && item.status === 'no_read',
        ).map(({ id }) => id)));
        setLoadError(false);
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (!controller.signal.aborted) timeout = window.setTimeout(load, refreshInterval);
      }
    }

    void load();
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [refresh]);

  useEffect(() => () => readRequest.current?.abort(), []);

  const unread = notifications?.filter(({ status }) => status === 'no_read') ?? [];
  const activeAlert = unread.filter(({ id }) => alertsAtLogin?.has(id)).at(-1);

  async function markRead(id: number) {
    if (readRequest.current) return;
    const controller = new AbortController();
    readRequest.current = controller;
    setMarkingId(id);
    setReadError(false);

    try {
      const updated = await markNotificationRead(id, controller.signal);
      if (controller.signal.aborted) return;
      readIds.current.add(id);
      setNotifications((previous) => previous?.map((item) => item.id === id ? updated : item) ?? null);
    } catch {
      if (!controller.signal.aborted) setReadError(true);
    } finally {
      if (!controller.signal.aborted) setMarkingId(null);
      if (readRequest.current === controller) readRequest.current = null;
    }
  }

  function closeCenter() {
    setReadError(false);
    setIsOpen(false);
  }

  return (
    <>
      <div className="notification-trigger">
        <IconButton icon={<Bell size={18} />} variant="text" aria-haspopup="dialog"
          label={unread.length ? `Notificações, ${unread.length} não lidas` : 'Notificações'}
          onClick={() => {
            setIsOpen(true);
            setRefresh((current) => current + 1);
          }} />
        {unread.length > 0 && <span className="notification-trigger__count" aria-hidden="true">
          {unread.length > 99 ? '99+' : unread.length}
        </span>}
      </div>

      {activeAlert && (
        <NotificationDialog key={activeAlert.id} titleId="notification-alert-title"
          onDismiss={() => void markRead(activeAlert.id)}>
          <header className="transaction-drawer__header">
            <div>
              <span className="notification-type notification-type--alert"><AlertTriangle size={15} aria-hidden="true" /> Aviso importante</span>
              <h2 id="notification-alert-title">{activeAlert.title}</h2>
              <p><NotificationDate notification={activeAlert} /></p>
            </div>
            <IconButton icon={<X size={18} />} label="Fechar e marcar como lido" disabled={markingId !== null}
              onClick={() => void markRead(activeAlert.id)} />
          </header>
          <div className="notification-dialog__body">
            <p className="notification-description">{activeAlert.description}</p>
            {readError && <p className="notification-error" role="alert">Não foi possível salvar a leitura. Tente novamente.</p>}
          </div>
          <footer className="transaction-form__actions">
            <Button disabled={markingId !== null} onClick={() => void markRead(activeAlert.id)}>
              {markingId === activeAlert.id ? 'Salvando…' : 'Entendi'}
            </Button>
          </footer>
        </NotificationDialog>
      )}

      {isOpen && !activeAlert && (
        <NotificationDialog titleId="notifications-title" onDismiss={closeCenter}>
          <header className="transaction-drawer__header">
            <div>
              <h2 id="notifications-title">Notificações</h2>
              <p>{unread.length} {unread.length === 1 ? 'não lida' : 'não lidas'}</p>
            </div>
            <IconButton icon={<X size={18} />} label="Fechar notificações" onClick={closeCenter} />
          </header>
          <div className="notification-dialog__body">
            {loadError && (
              <div className="notification-feedback">
                <p className="notification-error" role="alert">Não foi possível atualizar as notificações.</p>
                <Button variant="secondary" size="small" onClick={() => {
                  setLoadError(false);
                  setRefresh((value) => value + 1);
                }}>Tentar novamente</Button>
              </div>
            )}
            {!notifications && !loadError && <div role="status" aria-label="Carregando notificações">
              <Skeleton width="70%" height={22} />
            </div>}
            {notifications?.length === 0 && !loadError && <p>Você ainda não tem notificações.</p>}
            {readError && <p className="notification-error" role="alert">Não foi possível marcar a notificação como lida.</p>}
            {!!notifications?.length && <ul className="notification-list">
              {notifications.map((item) => (
                <li className="notification-list__item" key={item.id} data-unread={item.status === 'no_read'}>
                  <div className="notification-list__meta">
                    <span className={`notification-type notification-type--${item.type}`}>{typeLabels[item.type]}</span>
                    <NotificationDate notification={item} />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="notification-description">{item.description}</p>
                  {item.contact_message_id != null && (
                    <ButtonLink
                      to={`${administrationLinks.messages.path}/${item.contact_message_id}`}
                      size="small"
                      variant="text"
                      onClick={closeCenter}
                    >
                      Abrir mensagem
                    </ButtonLink>
                  )}
                  {item.status === 'no_read' ? (
                    <Button variant="secondary" size="small" icon={<Check size={15} />} iconPosition="leading"
                      disabled={markingId !== null} onClick={() => void markRead(item.id)}>
                      {markingId === item.id ? 'Salvando…' : 'Marcar como lida'}
                    </Button>
                  ) : <span className="notification-list__read">Lida</span>}
                </li>
              ))}
            </ul>}
          </div>
        </NotificationDialog>
      )}
    </>
  );
}
