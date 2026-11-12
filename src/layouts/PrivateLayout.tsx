import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  privateModules,
  privateNavigationGroups,
} from '../config/privateModules';
import { ButtonLink } from '../components/ui/buttons';
import './PrivateLayout.scss';

export default function PrivateLayout() {
  return (
    <div className="private-shell">
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
          <span className="private-topbar__status">
            <span /> Em desenvolvimento
          </span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
