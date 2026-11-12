export type MessageAlertKind = 'error' | 'success' | 'info';

export interface ApiStatusFeedback {
  kind: MessageAlertKind;
  title: string;
}

const knownStatusFeedback: Record<number, ApiStatusFeedback> = {
  200: { kind: 'success', title: 'Concluído' },
  201: { kind: 'success', title: 'Criado com sucesso' },
  204: { kind: 'success', title: 'Concluído' },
  400: { kind: 'error', title: 'Dados inválidos' },
  401: { kind: 'error', title: 'Não autenticado' },
  403: { kind: 'error', title: 'Acesso negado' },
  404: { kind: 'error', title: 'Não encontrado' },
  409: { kind: 'error', title: 'Conflito' },
  422: { kind: 'error', title: 'Não foi possível processar' },
  429: { kind: 'error', title: 'Muitas tentativas' },
  500: { kind: 'error', title: 'Erro no servidor' },
  502: { kind: 'error', title: 'Servidor indisponível' },
  503: { kind: 'error', title: 'Serviço indisponível' },
  504: { kind: 'error', title: 'Tempo de resposta excedido' },
};

export function getApiStatusFeedback(status: number): ApiStatusFeedback {
  const knownFeedback = knownStatusFeedback[status];
  if (knownFeedback) {
    return knownFeedback;
  }

  if (status >= 200 && status < 300) {
    return { kind: 'success', title: 'Concluído' };
  }

  if (status >= 300 && status < 400) {
    return { kind: 'info', title: 'Redirecionamento' };
  }

  if (status >= 400 && status < 500) {
    return { kind: 'error', title: 'Não foi possível concluir' };
  }

  if (status >= 500) {
    return { kind: 'error', title: 'Erro no servidor' };
  }

  return { kind: 'error', title: 'Falha de comunicação' };
}
