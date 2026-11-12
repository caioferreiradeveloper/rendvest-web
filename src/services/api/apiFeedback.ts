import { getApiStatusFeedback } from '../../config/apiStatusCodes';
import type { MessageAlertKind } from '../../config/apiStatusCodes';
import ApiError from './ApiError';

export interface ApiAlertMessage {
  kind: MessageAlertKind;
  title: string;
  message: string;
}

export function toApiAlert(
  error: unknown,
  fallbackMessage: string,
): ApiAlertMessage {
  const status = error instanceof ApiError ? error.status : 0;
  const feedback = getApiStatusFeedback(status);
  const message =
    error instanceof Error && error.message.trim()
      ? error.message
      : fallbackMessage;

  return { ...feedback, message };
}
