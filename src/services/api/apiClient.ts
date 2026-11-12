import { authEndpoints, authEvents } from '../../config/auth';
import ApiError from './ApiError';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

interface ApiRequestOptions extends RequestInit {
  retryAfterRefresh?: boolean;
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>;
    for (const key of ['detail', 'message', 'error']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    const nonFieldErrors = record.non_field_errors;
    if (Array.isArray(nonFieldErrors) && typeof nonFieldErrors[0] === 'string') {
      return nonFieldErrors[0];
    }
  }

  return fallback;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return text;
    }
    throw error;
  }
}

function buildUrl(path: string): string {
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function dispatchUnauthorized(): void {
  window.dispatchEvent(new Event(authEvents.unauthorized));
}

async function fetchResponse(
  path: string,
  options: RequestInit,
): Promise<Response> {
  try {
    const headers = new Headers(options.headers);
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    return await fetch(buildUrl(path), {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        'O navegador não conseguiu concluir a requisição. Verifique se a URL da API está correta e se o CORS permite esta origem com credenciais e o header X-CSRFToken.',
        0,
        error,
      );
    }
    throw error;
  }
}

function getCsrfTokenFromCookie(): string | null {
  const csrfCookie = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('csrftoken='));

  if (!csrfCookie) {
    return null;
  }

  return csrfCookie.slice('csrftoken='.length) || null;
}

function getCsrfTokenFromBody(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const payload = body as Record<string, unknown>;
  for (const key of ['csrfToken', 'csrf_token', 'csrf']) {
    const token = payload[key];
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }
  }

  return null;
}

let csrfInFlight: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (!csrfInFlight) {
    csrfInFlight = (async () => {
      const response = await fetchResponse(authEndpoints.csrf, {
        method: 'GET',
      });
      const body = await readResponseBody(response);

      if (!response.ok) {
        throw new ApiError(
          getErrorMessage(body, 'Não foi possível obter a proteção CSRF.'),
          response.status,
          body,
        );
      }

      const token = getCsrfTokenFromBody(body) ?? getCsrfTokenFromCookie();
      if (!token) {
        throw new ApiError(
          `A API não retornou o token CSRF. Verifique a resposta do endpoint ${authEndpoints.csrf}.`,
          response.status,
          body,
        );
      }

      return token;
    })().finally(() => {
      csrfInFlight = null;
    });
  }

  return csrfInFlight;
}

function isMutatingRequest(method: string | undefined): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase());
}

let refreshInFlight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await fetchResponse(authEndpoints.refresh, {
        method: 'POST',
        headers: {
          'X-CSRFToken': await getCsrfToken(),
        },
      });

      if (response.status === 401) {
        dispatchUnauthorized();
        return false;
      }

      if (!response.ok) {
        const body = await readResponseBody(response);
        throw new ApiError(
          getErrorMessage(body, 'Não foi possível validar sua sessão.'),
          response.status,
          body,
        );
      }

      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { retryAfterRefresh = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  if (isMutatingRequest(requestOptions.method)) {
    headers.set('X-CSRFToken', await getCsrfToken());
  }
  const response = await fetchResponse(path, {
    ...requestOptions,
    headers,
  });

  if (response.status === 401 && retryAfterRefresh && path !== authEndpoints.refresh) {
    const sessionRefreshed = await refreshSession();
    if (sessionRefreshed) {
      return apiRequest<T>(path, {
        ...requestOptions,
        retryAfterRefresh: false,
      });
    }
  }

  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(body, 'Ocorreu um erro ao comunicar com a API.'),
      response.status,
      body,
    );
  }

  return body as T;
}

export function apiJsonRequest<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  return apiRequest<T>(path, {
    ...options,
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
