import { useCallback, useState, type FormEvent } from 'react';
import { useToast } from '@contexts/ToastContext';

const requiredFieldsMessage =
  'Preencha os campos obrigatórios para continuar.';

export default function useRequiredFormValidation() {
  const { showToast } = useToast();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const notifyInvalidFields = useCallback(
    (message = requiredFieldsMessage) => {
      setHasAttemptedSubmit(true);
      showToast({
        kind: 'error',
        title: 'Confira os campos',
        message,
      });
    },
    [showToast],
  );

  const handleInvalidCapture = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const firstInvalidField = event.currentTarget.querySelector(':invalid');
      if (event.target === firstInvalidField) {
        notifyInvalidFields();
      }
    },
    [notifyInvalidFields],
  );

  const hasMissingCustomRequiredFields = useCallback(
    (form: HTMLFormElement) => {
      const hasMissingField = form.querySelector(
        '[aria-required="true"][data-required-empty="true"]',
      );
      if (!hasMissingField) {
        return false;
      }

      notifyInvalidFields();
      return true;
    },
    [notifyInvalidFields],
  );

  return {
    hasAttemptedSubmit,
    handleInvalidCapture,
    hasMissingCustomRequiredFields,
    notifyInvalidFields,
  };
}
