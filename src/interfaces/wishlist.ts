export interface WishlistItemPayload {
  name: string;
  amount: string;
  expected_purchase_date: string | null;
}

export interface WishlistItem extends WishlistItemPayload {
  id: string;
  created_at: string;
  updated_at: string;
}
