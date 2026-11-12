import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Transaction,
  TransactionPayload,
} from '../interfaces/transaction';
import {
  createTransaction as createTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  getTransactionDetail,
  listTransactions,
  updateTransaction as updateTransactionRequest,
  type TransactionListParams,
} from '../services/transactions/transactionService';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export default function useTransactions({
  page,
  pageSize,
  type,
  typeBank,
}: TransactionListParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setTransactions([]);
    setTotalCount(null);
    setHasNext(false);
    try {
      const result = await listTransactions({
        page,
        pageSize,
        type,
        typeBank,
      });
      if (currentRequestId !== requestId.current) {
        return;
      }
      setTransactions(result.results);
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
  }, [page, pageSize, type, typeBank]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (transaction: TransactionPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createTransactionRequest(transaction);
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
    async (
      id: string,
      transaction: TransactionPayload,
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await updateTransactionRequest(id, transaction);
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

  const loadDetail = useCallback(
    async (
      id: string,
      type: Transaction['type'],
    ): Promise<Transaction | null> => {
      setIsLoadingDetail(true);
      setError(null);
      try {
        const transaction = await getTransactionDetail(id, type);
        setSelectedTransaction(transaction);
        return transaction;
      } catch (detailError) {
        setError(getErrorMessage(detailError));
        return null;
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [],
  );

  const remove = useCallback(
    async (
      id: string,
      type: Transaction['type'],
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteTransactionRequest(id, type);
        setSelectedTransaction(null);
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

  const clearSelectedTransaction = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  return {
    transactions,
    selectedTransaction,
    isLoading,
    isLoadingDetail,
    isSaving,
    error,
    totalCount,
    hasNext,
    clearError: () => setError(null),
    reload,
    create,
    update,
    loadDetail,
    remove,
    clearSelectedTransaction,
  };
}
