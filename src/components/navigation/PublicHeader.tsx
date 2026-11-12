import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { ButtonLink } from '../ui/buttons';
import './PublicHeader.scss';

const navigation = [
  { label: 'Início', to: '/' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
];

export default function PublicHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/" aria-label="Rendvest — início">
          <span className="brand__mark" aria-hidden="true">
            <Sprout size={19} strokeWidth={2.2} />
          </span>
          <span>rendvest</span>
        </Link>

        <nav className="site-nav" aria-label="Navegação principal">
          {navigation.map(({ label, to }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `site-nav__link${isActive ? ' is-active' : ''}`
              }
              to={to}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <ButtonLink
          icon={<ArrowUpRight size={16} />}
          size="small"
          to="/login"
          variant="dark"
        >
          Entrar
        </ButtonLink>
      </div>
    </header>
  );
}
