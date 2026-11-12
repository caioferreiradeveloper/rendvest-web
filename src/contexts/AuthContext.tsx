import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authEvents } from '../config/auth';
import ApiError from '../services/api/ApiError';
import {
  authService,
  type LoginCredentials,
} from '../services/auth/authService';

type AuthStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable';

interface AuthContextValue {
  status: AuthStatus;
  error: string | null;
  retrySession: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  const retrySession = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const isAuthenticated = await authService.refresh();
      setStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
    } catch (sessionError) {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : 'Não foi possível verificar sua sessão.',
      );
      setStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    void retrySession();

    const handleUnauthorized = () => {
      setError(null);
      setStatus('unauthenticated');
    };
    window.addEventListener(authEvents.unauthorized, handleUnauthorized);

    return () => {
      window.removeEventListener(authEvents.unauthorized, handleUnauthorized);
    };
  }, [retrySession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    await authService.login(credentials);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setError(null);
      setStatus('unauthenticated');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setError(null);
        setStatus('unauthenticated');
        return;
      }
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ status, error, retrySession, login, logout }),
    [status, error, retrySession, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
