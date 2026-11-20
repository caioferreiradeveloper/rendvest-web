// React imports
import { useCallback, useEffect, useRef, useState } from 'react';

// Interface imports
import type { WishlistItem, WishlistItemPayload } from '@interface/wishlist';

// Service imports
import {
  createWishlistItem as createWishlistItemRequest,
  deleteWishlistItem as deleteWishlistItemRequest,
  getWishlistItemDetail,
  listWishlistItems,
  updateWishlistItem as updateWishlistItemRequest,
} from '@services/wishlist/wishlistService';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export default function useWishlist(page: number) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WishlistItem | null>(null);
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
    setItems([]);
    setTotalCount(null);
    setHasNext(false);

    try {
      const result = await listWishlistItems(page);
      if (currentRequestId !== requestId.current) {
        return;
      }
      setItems(result.results);
      setTotalCount(result.count);
      setHasNext(Boolean(result.next));
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
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadDetail = useCallback(async (id: string): Promise<WishlistItem | null> => {
    setIsLoadingDetail(true);
    setError(null);
    try {
      const item = await getWishlistItemDetail(id);
      setSelectedWishlistItem(item);
      return item;
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const create = useCallback(
    async (item: WishlistItemPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await createWishlistItemRequest(item);
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
    async (id: string, item: WishlistItemPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await updateWishlistItemRequest(id, item);
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
    async (id: string, refreshList: boolean): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteWishlistItemRequest(id);
        setSelectedWishlistItem(null);
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

  const clearError = useCallback(() => setError(null), []);
  const clearSelectedWishlistItem = useCallback(() => setSelectedWishlistItem(null), []);

  return {
    items,
    selectedWishlistItem,
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
    clearSelectedWishlistItem,
  };
}
