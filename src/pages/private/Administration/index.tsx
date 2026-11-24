import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Eye, Mail, UserRound, UserRoundCheck, UserRoundX, type LucideIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import MessageAlert from '@components/ui/MessageAlert';
import { Button, ButtonLink, IconButton } from '@components/ui/buttons';
import { administrationLinks } from '@config/administration';
import { useToast } from '@contexts/ToastContext';
import {
  administrationService,
  type AdminPage,
  type AdminUser,
  type ContactMessage,
  type UserAction,
} from '@services/administration/administrationService';
import ApiError from '@services/api/ApiError';
import { toApiAlert } from '@services/api/apiFeedback';
import './Administration.scss';

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const dateOnly = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const userActions = {
  approve: { label: 'Aprovar', icon: UserRoundCheck, success: 'Cadastro aprovado.' },
  disable: { label: 'Desabilitar', icon: UserRoundX, success: 'Usuário desabilitado.' },
  enable: { label: 'Reabilitar', icon: UserRoundCheck, success: 'Usuário reabilitado.' },
};

export function AdministrationPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="administration-page">
      <header>
        <span>Administrador</span>
        <h1>{title}</h1>
      </header>
      {children}
    </main>
  );
}

function useAdminPage<T>(fetchPage: (page: number, signal: AbortSignal) => Promise<AdminPage<T>>) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<AdminPage<T> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await fetchPage(page, controller.signal);
        if (!controller.signal.aborted) setResult(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (page > 1 && error instanceof ApiError && error.status === 404) {
          setPage(page - 1);
          return;
        }
        setError(toApiAlert(error, 'Não foi possível carregar os dados.').message);
      }
    }

    void load();
    return () => controller.abort();
  }, [fetchPage, page, revision]);

  function goTo(nextPage: number) {
    setError('');
    setResult(null);
    setPage(nextPage);
  }

  function reload() {
    setError('');
    setResult(null);
    setRevision((value) => value + 1);
  }

  return { result, error, page, goTo, reload };
}

export function ListStatus({ error, reload }: { error: string; reload: () => void }) {
  return error ? (
    <div className="administration-feedback">
      <MessageAlert kind="error" message={error} />
      <Button variant="secondary" onClick={reload}>Tentar novamente</Button>
    </div>
  ) : <p role="status">Carregando…</p>;
}

interface AdministrationListProps {
  title: string;
  icon: LucideIcon;
  description: string;
  listTitle: string;
  columns: string[];
  emptyMessage: string;
  result: AdminPage<unknown> | null;
  error: string;
  page: number;
  goTo: (page: number) => void;
  reload: () => void;
  saving?: boolean;
  children: ReactNode;
}

function AdministrationList({
  title, icon: Icon, description, listTitle, columns, emptyMessage,
  result, error, page, goTo, reload, saving, children,
}: AdministrationListProps) {
  const loading = result === null && !error;
  const blocked = !result || saving;

  return (
    <main className="private-page">
      <header className="private-page__header">
        <div className="private-page__heading">
          <span className="private-page__heading-icon">
            <Icon size="var(--icon-size-21)" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Administrador</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
      </header>

      {error && <MessageAlert kind="error" message={error} />}

      <section className="transaction-list" aria-labelledby="administration-list-title">
        <header className="transaction-list__header">
          <div><h2 id="administration-list-title">{listTitle}</h2></div>
        </header>
        <div className="transaction-table-wrap">
          <table className="transaction-table">
            <thead>
              <tr>
                {columns.map((column) => <th scope="col" key={column}>{column}</th>)}
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {result?.results.length ? children : (
                <tr>
                  <td className="transaction-table__state" colSpan={columns.length + 1}>
                    {loading ? (
                      <div className="table-loading" role="status">
                        <span className="loading-spinner loading-spinner--table" aria-hidden="true" />
                        <span>Carregando registros…</span>
                      </div>
                    ) : (
                      <div className="transaction-empty">
                        <span className="transaction-empty__icon">
                          <Icon size="var(--icon-size-22)" aria-hidden="true" />
                        </span>
                        <strong>{error ? 'Não foi possível carregar os registros' : emptyMessage}</strong>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="transaction-pagination">
          <span>
            {result && (result.count ? `${result.count} ${result.count === 1 ? 'registro' : 'registros'}` : 'Nenhum registro para exibir')}
          </span>
          <div className="transaction-pagination__controls">
            <IconButton disabled={blocked || !result?.previous} icon={<ArrowLeft size="var(--icon-size-16)" />}
              label="Página anterior" onClick={() => goTo(page - 1)} />
            <span>Página <strong>{page}</strong></span>
            <IconButton disabled={blocked || !result?.next} icon={<ArrowRight size="var(--icon-size-16)" />}
              label="Próxima página" onClick={() => goTo(page + 1)} />
            <Button disabled={loading || saving} onClick={reload} size="small" variant="text">
              {error ? 'Tentar novamente' : 'Atualizar'}
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export function AdminUsersPage({ pending = false }: { pending?: boolean }) {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) => administrationService.listUsers(page, pending, signal),
    [pending],
  );
  const { result, error, page, goTo, reload } = useAdminPage(fetchPage);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function changeStatus(user: AdminUser, action: UserAction) {
    setSavingId(user.id);
    try {
      await administrationService.changeUserStatus(user.id, action);
      showToast({ kind: 'success', title: 'Status atualizado', message: userActions[action].success });
    } catch (error) {
      showToast(toApiAlert(error, 'Não foi possível atualizar o usuário.'));
    } finally {
      setSavingId(null);
      reload();
    }
  }

  const { title, icon } = pending ? administrationLinks.pending : administrationLinks.users;
  return (
    <AdministrationList
      title={title}
      icon={icon}
      description={pending ? 'Revise os cadastros que aguardam aprovação.' : 'Consulte os cadastros e gerencie o acesso ao sistema.'}
      listTitle={pending ? 'Cadastros pendentes' : 'Usuários cadastrados'}
      columns={['Usuário', 'Perfil', 'Status']}
      emptyMessage={pending ? 'Nenhum cadastro aguardando aprovação' : 'Nenhum usuário cadastrado'}
      result={result}
      error={error}
      page={page}
      goTo={goTo}
      reload={reload}
      saving={savingId !== null}
    >
      {result?.results.map((user) => {
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
        const action = user.pending_approval ? 'approve' : user.is_active ? 'disable' : 'enable';
        const status = { approve: 'Pendente', disable: 'Ativo', enable: 'Desabilitado' }[action];
        const { icon: ActionIcon, label } = userActions[action];
        return (
          <tr key={user.id}>
            <td>
              <div className="transaction-table__name">
                <span className="transaction-type-icon transaction-type-icon--income">
                  <UserRound size="var(--icon-size-16)" aria-hidden="true" />
                </span>
                <div>
                  <strong>{name || user.email}</strong>
                  {name && <span>{user.email}</span>}
                </div>
              </div>
            </td>
            <td>{user.is_staff ? 'Administrador' : 'Usuário'}</td>
            <td><span className="transaction-category">{status}</span></td>
            <td className="transaction-table__actions">
              {user.can_manage && (
                <IconButton
                  label={savingId === user.id ? `Salvando alteração de ${user.email}` : `${label}: ${user.email}`}
                  icon={<ActionIcon size="var(--icon-size-16)" />}
                  disabled={savingId !== null}
                  onClick={() => void changeStatus(user, action)}
                />
              )}
            </td>
          </tr>
        );
      })}
    </AdministrationList>
  );
}

export function AdminMessagesPage() {
  const { result, error, page, goTo, reload } = useAdminPage(administrationService.listMessages);
  return (
    <AdministrationList
      title={administrationLinks.messages.title}
      icon={Mail}
      description="Consulte os contatos enviados pelo formulário do site."
      listTitle="Mensagens recebidas"
      columns={['Remetente', 'Data', 'Mensagem']}
      emptyMessage="Nenhuma mensagem recebida"
      result={result}
      error={error}
      page={page}
      goTo={goTo}
      reload={reload}
    >
      {result?.results.map((message) => (
        <tr key={message.id}>
          <td>
            <div className="transaction-table__name">
              <span className="transaction-type-icon transaction-type-icon--income">
                <Mail size="var(--icon-size-16)" aria-hidden="true" />
              </span>
              <div><strong>{message.name}</strong><span>{message.email}</span></div>
            </div>
          </td>
          <td className="transaction-table__date">
            <time dateTime={message.created_at}>{dateTime.format(new Date(message.created_at))}</time>
          </td>
          <td><span className="administration-message-preview">{message.message}</span></td>
          <td className="transaction-table__actions">
            <ButtonLink
              className="button--icon"
              icon={<Eye size="var(--icon-size-16)" />}
              title={`Abrir mensagem de ${message.name}`}
              to={String(message.id)}
              variant="secondary"
            >
              <span className="visually-hidden">Abrir mensagem de {message.name}</span>
            </ButtonLink>
          </td>
        </tr>
      ))}
    </AdministrationList>
  );
}

export function AdminMessagePage() {
  const { id = '' } = useParams();
  return <AdminMessageDetail key={id} id={id} />;
}

function AdminMessageDetail({ id }: { id: string }) {
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    administrationService.getMessage(id, controller.signal).then((message) => {
      if (!controller.signal.aborted) setMessage(message);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(toApiAlert(error, 'Não foi possível abrir a mensagem.').message);
    });
    return () => controller.abort();
  }, [id, revision]);

  return (
    <AdministrationPage title="Mensagem de contato">
      <ButtonLink to={administrationLinks.messages.path} variant="secondary">Voltar para mensagens</ButtonLink>
      {!message ? <ListStatus error={error} reload={() => {
        setError('');
        setRevision((value) => value + 1);
      }} /> : (
        <article className="administration-message">
          <h2>{message.name}</h2>
          <p>{message.email}</p>
          <time dateTime={message.created_at}>{dateTime.format(new Date(message.created_at))}</time>
          {message.monthly_goal !== null && <p>Meta mensal de {currency.format(Number(message.monthly_goal))}</p>}
          {message.preferred_date && <p>Data sugerida para retorno em {dateOnly.format(new Date(message.preferred_date))}</p>}
          <p className="administration-message__body">{message.message}</p>
        </article>
      )}
    </AdministrationPage>
  );
}
