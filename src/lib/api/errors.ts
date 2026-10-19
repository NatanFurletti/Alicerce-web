/**
 * Erros da API traduzidos para o usuário.
 *
 * A API devolve `{ statusCode, code, message, ... }` e garante que o `code` é estável,
 * enquanto a `message` pode mudar. Por isso a tela decide o texto pelo `code`, e a
 * mensagem original fica guardada para depuração.
 */

/** Código usado quando a requisição nem chegou a ter resposta (rede, CORS, API fora). */
export const NETWORK_ERROR = 'NETWORK_ERROR';

const FRIENDLY_MESSAGES: Record<string, string> = {
  [NETWORK_ERROR]:
    'Não foi possível conectar ao servidor. Se a API estava inativa, a primeira ' +
    'chamada pode levar até um minuto. Tente de novo em instantes.',
  VALIDATION_ERROR: 'Alguns dados estão em formato inválido. Revise os campos.',
  UNAUTHORIZED: 'Sua sessão expirou. Entre novamente.',
  INVALID_TOKEN: 'Sua sessão expirou. Entre novamente.',
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
  EMAIL_ALREADY_IN_USE: 'Este e-mail já está cadastrado.',
  SIMULATION_NOT_FOUND: 'Simulação não encontrada.',
  LTV_EXCEEDED:
    'A entrada é insuficiente: o valor financiado passa do limite permitido. ' +
    'Aumente a entrada.',
  DOWN_PAYMENT_EXCEEDS_PROPERTY_VALUE:
    'A entrada precisa ser menor que o valor do imóvel.',
  TERM_EXCEEDS_MAXIMUM: 'O prazo informado é maior que o máximo permitido.',
  INCOME_COMMITMENT_EXCEEDED:
    'A primeira parcela compromete mais da renda do que o permitido. Aumente a ' +
    'entrada, o prazo ou a renda informada.',
  RATE_LIMIT_EXCEEDED:
    'Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.',
  INTERNAL_ERROR: 'Erro inesperado no servidor. Tente novamente em instantes.',
};

const FALLBACK_MESSAGE = 'Algo deu errado. Tente novamente.';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Mensagem original da API, para depuração. Não deve ir para a tela. */
    readonly apiMessage?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Monta o erro a partir de uma resposta HTTP de falha. */
  static fromResponse(status: number, body: unknown): ApiError {
    if (isErrorBody(body)) {
      return new ApiError(status, body.code, messageFor(body.code), body.message);
    }
    // Corpo fora do envelope esperado (um proxy no caminho, por exemplo).
    const code = status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR';
    return new ApiError(status, code, messageFor(code));
  }

  /** A requisição falhou antes de haver resposta. */
  static network(cause: unknown): ApiError {
    const error = new ApiError(0, NETWORK_ERROR, messageFor(NETWORK_ERROR));
    error.cause = cause;
    return error;
  }
}

function messageFor(code: string): string {
  return FRIENDLY_MESSAGES[code] ?? FALLBACK_MESSAGE;
}

function isErrorBody(body: unknown): body is { code: string; message: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof body.code === 'string' &&
    'message' in body &&
    typeof body.message === 'string'
  );
}

/** Texto para exibir na tela a partir de qualquer erro. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FALLBACK_MESSAGE;
}

/** Erros que repetir não resolve: a requisição está errada, não o servidor. */
export function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}
