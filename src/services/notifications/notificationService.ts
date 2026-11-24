import { apiRequest } from '@services/api/apiClient';

const notificationsPath = '/api/v1/notifications/';

export interface SystemNotification {
  id: number;
  title: string;
  description: string;
  date: string;
  contact_message_id?: number | null;
  type: 'system' | 'alert' | 'news';
  status: 'read' | 'no_read';
}

export function listNotifications(signal: AbortSignal) {
  return apiRequest<SystemNotification[]>(notificationsPath, { signal });
}

export function markNotificationRead(id: number, signal: AbortSignal) {
  return apiRequest<SystemNotification>(`${notificationsPath}${id}/read/`, { method: 'POST', signal });
}
