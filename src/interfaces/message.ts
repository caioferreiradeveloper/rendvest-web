import type { MessageAlertKind } from '@config/apiStatusCodes';

export type ToastMessage = {
  kind: MessageAlertKind;
  title: string;
  message: string;
};