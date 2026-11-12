export const authEndpoints = {
  csrf: '/api/v1/auth/csrf/',
  login: '/api/v1/auth/login/',
  logout: '/api/v1/auth/logout/',
  refresh: '/api/v1/auth/refresh/',
} as const;

export const authEvents = {
  unauthorized: 'rendvest:unauthorized',
} as const;
