import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authEvents } from '@config/auth';
import ApiError from '@services/api/ApiError';
import {
  authService,
  type AuthenticatedUser,
  type LoginCredentials,
} from '@services/auth/authService';

type AuthStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
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
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const retrySession = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const isAuthenticated = await authService.refresh();
      setUser(isAuthenticated ? await authService.currentUser() : null);
      setStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
    } catch (sessionError) {
      setUser(null);
      if (isUnauthorizedError(sessionError)) {
        setStatus('unauthenticated');
        return;
      }

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
      setUser(null);
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
    setUser(await authService.currentUser());
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      setStatus('unauthenticated');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setUser(null);
        setError(null);
        setStatus('unauthenticated');
        return;
      }
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, error, retrySession, login, logout }),
    [status, user, error, retrySession, login, logout],
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
