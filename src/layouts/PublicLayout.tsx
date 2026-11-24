import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import PublicHeader from '@components/navigation/PublicHeader';
import './PublicLayout.scss';

export default function PublicLayout() {
  const pathname = useLocation().pathname.replace(/\/$/, '');
  const isRegisterPage = pathname === '/cadastre-se';
  const isAuthPage = pathname === '/login' || isRegisterPage;

  return (
    <div className={`site-shell${isAuthPage ? ' site-shell--auth' : ''}${isRegisterPage ? ' site-shell--register' : ''}`}>
      {!isAuthPage && <PublicHeader />}
      <Outlet />
      {!isAuthPage && (
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <Link className="brand brand--footer" to="/">
              <span className="brand__mark" aria-hidden="true">
                <Sprout size="var(--icon-size-18)" strokeWidth={2.2} />
              </span>
              <span>rendvest</span>
            </Link>
            <p>Pequenos passos. Um futuro mais tranquilo.</p>
            <Link className="site-footer__link" to="/contato">
              Vamos conversar <ArrowUpRight size="var(--icon-size-15)" aria-hidden="true" />
            </Link>
          </div>
          <div className="container site-footer__legal">
            <span>© {new Date().getFullYear()} Rendvest</span>
            <span>Feito para cuidar do que vem pela frente.</span>
          </div>
        </footer>
      )}
    </div>
  );
}
