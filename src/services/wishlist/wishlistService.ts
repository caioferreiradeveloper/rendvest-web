// Interface imports
import type { WishlistItem, WishlistItemPayload } from '@interface/wishlist';

// Service imports
import { apiJsonRequest, apiRequest } from '../api/apiClient';

const wishlistBasePath = '/api/v1/wishlist/';

interface WishlistPage {
  results: WishlistItem[];
  count: number;
  next: string | null;
}

export function listWishlistItems(page: number): Promise<WishlistPage> {
  const query = new URLSearchParams({ page: String(page) });
  return apiRequest(`${wishlistBasePath}?${query}`);
}

export function getWishlistItemDetail(id: string): Promise<WishlistItem> {
  return apiRequest(`${wishlistBasePath}${encodeURIComponent(id)}/`);
}

export function createWishlistItem(item: WishlistItemPayload): Promise<WishlistItem> {
  return apiJsonRequest(`${wishlistBasePath}create/`, 'POST', item);
}

export function updateWishlistItem(id: string, item: WishlistItemPayload): Promise<WishlistItem> {
  return apiJsonRequest(`${wishlistBasePath}update/${encodeURIComponent(id)}/`, 'PATCH', item);
}

export function deleteWishlistItem(id: string): Promise<unknown> {
  return apiRequest(`${wishlistBasePath}delete/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  });
}
