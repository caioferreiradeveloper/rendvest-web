import { ArrowUpRight, LogOut, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  privateModules,
  privateNavigationGroups,
} from '../config/privateModules';
import { Button, ButtonLink } from '../components/ui/buttons';
import MessageAlert from '../components/ui/MessageAlert';
import { useAuth } from '../hooks/useAuth';
import { toApiAlert, type ApiAlertMessage } from '../services/api/apiFeedback';
import './PrivateLayout.scss';

export default function PrivateLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState<ApiAlertMessage | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isTablePage =
    pathname === '/app/lancamentos' ||
    pathname === '/app/emprestimos-a-pagar';

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setLogoutError(
        toApiAlert(error, 'Não foi possível encerrar a sessão. Tente novamente.'),
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      className={`private-shell${isTablePage ? ' private-shell--table-page' : ''}`}
    >
      <aside className="private-sidebar">
        <Link className="brand private-sidebar__brand" to="/app/dashboard">
          <span className="brand__mark" aria-hidden="true">
            <Sprout size={19} strokeWidth={2.2} />
          </span>
          <span>rendvest</span>
        </Link>

        <div className="private-sidebar__workspace">
          <span className="private-sidebar__workspace-dot" />
          Área financeira
        </div>

        <nav className="private-nav" aria-label="Menu da área financeira">
          {privateNavigationGroups.map((group) => (
            <div className="private-nav__group" key={group.title}>
              <span className="private-nav__title">{group.title}</span>
              {group.modules.map((moduleKey) => {
                const module = privateModules[moduleKey];
                const ModuleIcon = module.icon;

                return (
                  <NavLink
                    className={({ isActive }) =>
                      `private-nav__link${isActive ? ' is-active' : ''}`
                    }
                    end
                    key={moduleKey}
                    to={module.path}
                  >
                    <ModuleIcon size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>{module.title}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="private-sidebar__bottom">
          <span>Área interna em construção</span>
          <ButtonLink
            className="private-sidebar__public-link"
            icon={<ArrowUpRight size={15} />}
            size="small"
            to="/"
            variant="text"
          >
            Voltar ao site
          </ButtonLink>
        </div>
      </aside>

      <div className="private-main">
        <header className="private-topbar">
          <span className="private-topbar__breadcrumb">
            Rendvest <span>/</span> Área financeira
          </span>
          <div className="private-topbar__actions">
            {logoutError && (
              <MessageAlert
                kind={logoutError.kind}
                message={logoutError.message}
                onDismiss={() => setLogoutError(null)}
                title={logoutError.title}
              />
            )}
            <span className="private-topbar__status">
              <span /> Em desenvolvimento
            </span>
            <Button
              className="private-topbar__logout"
              disabled={isLoggingOut}
              icon={<LogOut size={15} />}
              onClick={handleLogout}
              size="small"
              variant="text"
            >
              {isLoggingOut ? 'Saindo…' : 'Sair'}
            </Button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
