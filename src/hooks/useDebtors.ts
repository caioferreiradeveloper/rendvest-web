import { useCallback, useEffect, useRef, useState } from 'react';
import type { Debtor, DebtorPayload } from '@interface/debtor';
import {
  createDebtor as createDebtorRequest,
  deleteDebtor as deleteDebtorRequest,
  getDebtor,
  listDebtors,
  updateDebtor as updateDebtorRequest,
  type DebtorListParams,
} from '@services/debtors/debtorService';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export default function useDebtors({ page, pageSize }: DebtorListParams) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setDebtors([]);
    setTotalCount(null);
    setHasNext(false);

    try {
      const result = await listDebtors({ page, pageSize });
      if (currentRequestId !== requestId.current) {
        return;
      }
      setDebtors(result.results);
      setTotalCount(result.count);
      setHasNext(result.hasNext);
    } catch (loadError) {
      if (currentRequestId !== requestId.current) {
        return;
      }
      setError(getErrorMessage(loadError));
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [page, pageSize]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadDetail = useCallback(async (id: string): Promise<Debtor | null> => {
    setIsLoadingDetail(true);
    setError(null);
    try {
      const debtor = await getDebtor(id);
      setSelectedDebtor(debtor);
      return debtor;
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const create = useCallback(
    async (debtor: DebtorPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createDebtorRequest(debtor);
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
    async (id: string, debtor: DebtorPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await updateDebtorRequest(id, debtor);
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

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteDebtorRequest(id);
        setSelectedDebtor(null);
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

  const clearError = useCallback(() => setError(null), []);
  const clearSelectedDebtor = useCallback(() => setSelectedDebtor(null), []);

  return {
    debtors,
    selectedDebtor,
    totalCount,
    hasNext,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    reload,
    create,
    update,
    remove,
    loadDetail,
    clearError,
    clearSelectedDebtor,
  };
}
