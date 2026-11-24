import type { ReactNode } from 'react';
import { Sprout } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { administrationLinks } from '@config/administration';
import { useAuth } from '@hooks/useAuth';
import { Button } from '../ui/buttons';
import MessageAlert from '../ui/MessageAlert';

function AuthLoading() {
  return (
    <main className="auth-loading" role="status" aria-live="polite">
      <span className="auth-loading__brand" aria-hidden="true">
        <span className="auth-loading__spinner" />
        <span className="auth-loading__mark">
          <Sprout size={24} strokeWidth={2} />
        </span>
      </span>
      <strong className="auth-loading__title">Preparando seu espaço</strong>
      <span className="auth-loading__message">Verificando sua sessão…</span>
    </main>
  );
}

interface AuthGuardProps {
  children: ReactNode;
}

export function RequireAuth({ children }: AuthGuardProps) {
  const { status, error, retrySession } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return <AuthLoading />;
  }

  if (status === 'unavailable') {
    return (
      <main className="auth-loading">
        {error && <MessageAlert kind="error" message={error} />}
        <Button onClick={() => void retrySession()}>Tentar novamente</Button>
      </main>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function RequireStaff() {
  const { user } = useAuth();
  return user?.is_staff ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
}

export function RequireFinancialArea() {
  const { user } = useAuth();
  return user?.is_staff ? <Navigate to={administrationLinks.dashboard.path} replace /> : <Outlet />;
}

export function RequireGuest({ children }: AuthGuardProps) {
  const { status } = useAuth();

  if (status === 'checking') {
    return <AuthLoading />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
