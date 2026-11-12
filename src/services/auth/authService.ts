import { authEndpoints } from '../../config/auth';
import { apiJsonRequest, refreshSession } from '../api/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login(credentials: LoginCredentials): Promise<void> {
    return apiJsonRequest<void>(authEndpoints.login, 'POST', credentials, {
      retryAfterRefresh: false,
    });
  },

  refresh(): Promise<boolean> {
    return refreshSession();
  },

  logout(): Promise<void> {
    return apiJsonRequest<void>(authEndpoints.logout, 'POST', undefined, {
      retryAfterRefresh: false,
    });
  },
};
