import { useCallback, useEffect, useState } from 'react';
import type {
  Loan,
  LoanDetails,
  LoanPaymentPayload,
  LoanPayload,
} from '../interfaces/loan';
import {
  createLoan as createLoanRequest,
  createLoanPayment as createLoanPaymentRequest,
  deleteLoan as deleteLoanRequest,
  getLoanDetails,
  listLoans,
  updateLoan as updateLoanRequest,
} from '../services/loans/loanService';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export default function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<LoanDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoans(await listLoans());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadDetails = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setError(null);
    try {
      const details = await getLoanDetails(id);
      setSelectedDetails(details);
      return details;
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const create = useCallback(
    async (loan: LoanPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createLoanRequest(loan);
        await reload();
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, loan: LoanPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await updateLoanRequest(id, loan);
        await reload();
        if (selectedDetails?.loan.id === id) {
          await loadDetails(id);
        }
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadDetails, reload, selectedDetails?.loan.id],
  );

  const remove = useCallback(
    async (loan: Loan): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteLoanRequest(loan.id);
        setSelectedDetails(null);
        await reload();
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const addPayment = useCallback(
    async (
      loanId: string,
      payment: LoanPaymentPayload,
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createLoanPaymentRequest(loanId, payment);
        await loadDetails(loanId);
        await reload();
        return true;
      } catch (paymentError) {
        setError(getErrorMessage(paymentError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadDetails, reload],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearSelectedDetails = useCallback(() => setSelectedDetails(null), []);

  return {
    loans,
    selectedDetails,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    reload,
    create,
    update,
    remove,
    loadDetails,
    addPayment,
    clearError,
    clearSelectedDetails,
  };
}
