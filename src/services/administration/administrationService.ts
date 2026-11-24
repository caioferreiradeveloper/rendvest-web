import { apiJsonRequest, apiRequest } from '@services/api/apiClient';

const usersPath = '/api/v1/users/';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  pending_approval: boolean;
  can_manage: boolean;
}

interface ContactFields {
  name: string;
  email: string;
  message: string;
  monthly_goal: string | null;
  preferred_date: string | null;
}

export interface ContactMessage extends ContactFields {
  id: number;
  created_at: string;
}

export interface AdminPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminDashboard {
  total_users: number;
  active_users: number;
  pending_users: number;
  disabled_users: number;
  contact_messages: number;
}

export type UserAction = 'approve' | 'disable' | 'enable';

export const administrationService = {
  getDashboard(signal: AbortSignal) {
    return apiRequest<AdminDashboard>(`${usersPath}admin/dashboard/`, { signal });
  },
  register(data: { first_name: string; last_name: string; email: string; password: string }) {
    return apiJsonRequest(`${usersPath}external-create/`, 'POST', data, { retryAfterRefresh: false });
  },
  sendContact(data: ContactFields) {
    return apiJsonRequest(`${usersPath}contact/`, 'POST', data, { retryAfterRefresh: false });
  },
  listUsers(page: number, pending: boolean, signal: AbortSignal) {
    return apiRequest<AdminPage<AdminUser>>(
      `${usersPath}admin/?page=${page}&pending=${pending}`, { signal },
    );
  },
  changeUserStatus(id: string, action: UserAction) {
    return apiJsonRequest<AdminUser>(`${usersPath}admin/${id}/status/`, 'POST', { action });
  },
  listMessages(page: number, signal: AbortSignal) {
    return apiRequest<AdminPage<ContactMessage>>(`${usersPath}admin/messages/?page=${page}`, { signal });
  },
  getMessage(id: string, signal: AbortSignal) {
    return apiRequest<ContactMessage>(`${usersPath}admin/messages/${encodeURIComponent(id)}/`, { signal });
  },
};
