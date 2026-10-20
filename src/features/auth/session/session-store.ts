/**
 * Estado da sessão, fora do React.
 *
 * Fica fora do React porque é lido de dois mundos: dos componentes (via
 * `useSyncExternalStore`, em `useSession`) e do middleware HTTP, que precisa do token
 * a cada requisição e encerra a sessão quando a renovação falha. Um Context do React
 * não seria alcançável pelo middleware.
 *
 * Onde cada token vive:
 * - **access token: só em memória.** Dura 15 minutos e é o que dá acesso imediato à
 *   API; não persistir reduz o estrago de um eventual XSS.
 * - **refresh token: no `localStorage`.** É o que mantém a sessão depois de um F5.
 *   O trade-off está documentado no README.
 */

export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export type SessionState =
  /** Ainda não se sabe: a sessão está sendo restaurada (ou estamos no servidor). */
  | { readonly status: 'loading' }
  | { readonly status: 'authenticated'; readonly user: SessionUser }
  /** `expired` distingue "a sessão caiu" de "nunca entrou", para a tela avisar. */
  | { readonly status: 'anonymous'; readonly expired: boolean };

export const REFRESH_TOKEN_KEY = 'alicerce.refreshToken';

// Objetos constantes: `useSyncExternalStore` compara snapshots por referência, e um
// objeto novo a cada leitura faria o React renderizar em loop.
const LOADING: SessionState = { status: 'loading' };
const ANONYMOUS: SessionState = { status: 'anonymous', expired: false };
const EXPIRED: SessionState = { status: 'anonymous', expired: true };

let state: SessionState = LOADING;
let accessToken: string | null = null;
const listeners = new Set<() => void>();

function setState(next: SessionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

/**
 * `localStorage` pode lançar (modo privado restrito, armazenamento bloqueado) e não
 * existe no servidor. Falhar aqui não pode derrubar a aplicação: no pior caso, a sessão
 * apenas não sobrevive ao F5.
 */
function readStoredRefreshToken(): string | null {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeRefreshToken(value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    else window.localStorage.setItem(REFRESH_TOKEN_KEY, value);
  } catch {
    // Sem armazenamento disponível, a sessão vale só enquanto a aba estiver aberta.
  }
}

export const sessionStore = {
  getState: (): SessionState => state,
  getServerState: (): SessionState => LOADING,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAccessToken: (): string | null => accessToken,
  getRefreshToken: readStoredRefreshToken,

  /** Guarda um par de tokens novo (login ou renovação). A API rotaciona o refresh. */
  setTokens(tokens: TokenPair): void {
    accessToken = tokens.accessToken;
    storeRefreshToken(tokens.refreshToken);
  },

  /** Login concluído: tokens e usuário de uma vez. */
  signIn(tokens: TokenPair, user: SessionUser): void {
    sessionStore.setTokens(tokens);
    setState({ status: 'authenticated', user });
  },

  /** Sessão restaurada depois de um F5: o token já foi renovado, falta o usuário. */
  authenticate(user: SessionUser): void {
    setState({ status: 'authenticated', user });
  },

  /**
   * Encerra a sessão apagando os tokens do navegador. Não há chamada à API: os tokens
   * são stateless e a API não tem rota de logout (ADR-006 do alicerce-api).
   */
  signOut({ expired }: { expired: boolean }): void {
    accessToken = null;
    storeRefreshToken(null);
    setState(expired ? EXPIRED : ANONYMOUS);
  },

  /** Volta ao estado inicial. Só para testes. */
  reset(): void {
    accessToken = null;
    storeRefreshToken(null);
    setState(LOADING);
  },
};
