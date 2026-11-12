import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/buttons';
import MessageAlert from '../ui/MessageAlert';

function AuthLoading() {
  return (
    <main className="auth-loading" role="status" aria-live="polite">
      <span className="auth-loading__spinner" aria-hidden="true" />
      <span>Verificando sua sessão…</span>
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
