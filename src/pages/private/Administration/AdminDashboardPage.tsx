import { Mail, UserRoundCheck, UserRoundMinus, UsersRound, UserRoundX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { administrationLinks } from '@config/administration';
import { administrationService, type AdminDashboard } from '@services/administration/administrationService';
import { toApiAlert } from '@services/api/apiFeedback';
import { AdministrationPage, ListStatus } from './index';

const indicators = [
  { key: 'total_users', label: 'Total de usuários', icon: UsersRound, path: administrationLinks.users.path },
  { key: 'active_users', label: 'Usuários ativos', icon: UserRoundCheck },
  { key: 'pending_users', label: 'Cadastros pendentes', icon: UserRoundMinus, path: administrationLinks.pending.path },
  { key: 'disabled_users', label: 'Usuários desabilitados', icon: UserRoundX },
  { key: 'contact_messages', label: 'Mensagens recebidas', icon: Mail, path: administrationLinks.messages.path },
] as const;

const number = new Intl.NumberFormat('pt-BR');

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    administrationService.getDashboard(controller.signal).then((data) => {
      if (!controller.signal.aborted) setDashboard(data);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setError(toApiAlert(error, 'Não foi possível carregar os indicadores.').message);
      }
    });
    return () => controller.abort();
  }, [revision]);

  return (
    <AdministrationPage title="Dashboard">
      {dashboard ? (
        <dl className="administration-metrics" aria-label="Indicadores administrativos">
          {indicators.map(({ key, label, icon: Icon, ...item }) => (
            <div className="administration-metric" key={key}>
              <dt>
                <Icon size={19} aria-hidden="true" />
                {'path' in item ? <Link to={item.path}>{label}</Link> : label}
              </dt>
              <dd>{number.format(dashboard[key])}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <ListStatus error={error} reload={() => {
          setError('');
          setRevision((value) => value + 1);
        }} />
      )}
    </AdministrationPage>
  );
}
