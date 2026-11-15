import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import MessageAlert from '@components/ui/MessageAlert';
import type { ToastMessage } from '@interface/message';

interface ToastContextValue {
  showToast: (message: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: ToastMessage) => {
    setToast(message);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(dismissToast, 5000);
    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <MessageAlert
          className="toast-message"
          kind={toast.kind}
          message={toast.message}
          onDismiss={dismissToast}
          title={toast.title}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }
  return context;
}
