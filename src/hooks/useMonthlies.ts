import { useCallback, useEffect, useRef, useState } from 'react';
import type { Monthly, MonthlyPayload, MonthlySettlementPayload } from '@interface/monthly';
import {
  createMonthly as createMonthlyRequest,
  deleteMonthly as deleteMonthlyRequest,
  getMonthlyDetail,
  listMonthlies,
  settleMonthly as settleMonthlyRequest,
  updateMonthly as updateMonthlyRequest,
  type MonthlyListParams,
} from '@services/monthlies/monthlyService';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export default function useMonthlies({ month, page, pageSize, type }: MonthlyListParams) {
  const [monthlies, setMonthlies] = useState<Monthly[]>([]);
  const [selectedMonthly, setSelectedMonthly] = useState<Monthly | null>(null);
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
    setMonthlies([]);
    setTotalCount(null);
    setHasNext(false);

    try {
      const result = await listMonthlies({ month, page, pageSize, type });
      if (currentRequestId !== requestId.current) {
        return;
      }
      setMonthlies(result.results);
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
  }, [month, page, pageSize, type]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadDetail = useCallback(async (id: string): Promise<Monthly | null> => {
    setIsLoadingDetail(true);
    setError(null);
    try {
      const monthly = await getMonthlyDetail(id, month);
      setSelectedMonthly(monthly);
      return monthly;
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  }, [month]);

  const create = useCallback(
    async (monthly: MonthlyPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createMonthlyRequest(monthly, month);
        await reload();
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [month, reload],
  );

  const update = useCallback(
    async (id: string, monthly: MonthlyPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await updateMonthlyRequest(id, monthly, month);
        await reload();
        return true;
      } catch (saveError) {
        setError(getErrorMessage(saveError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [month, reload],
  );

  const remove = useCallback(
    async (id: string, refreshList: boolean): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteMonthlyRequest(id);
        setSelectedMonthly(null);
        if (refreshList) {
          await reload();
        }
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

  const settle = useCallback(
    async (id: string, settlement: MonthlySettlementPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await settleMonthlyRequest(id, settlement);
        setSelectedMonthly(null);
        await reload();
        return true;
      } catch (settlementError) {
        setError(getErrorMessage(settlementError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearSelectedMonthly = useCallback(() => setSelectedMonthly(null), []);

  return {
    monthlies,
    selectedMonthly,
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
    settle,
    loadDetail,
    clearError,
    clearSelectedMonthly,
  };
}
