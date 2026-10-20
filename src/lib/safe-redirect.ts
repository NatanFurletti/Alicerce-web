/**
 * Valida o destino de um redirecionamento vindo da URL (`/entrar?redirect=...`).
 *
 * Sem validação, `?redirect=https://site-falso.com` levaria o usuário, logo depois de
 * digitar a senha no site verdadeiro, para uma cópia falsa — um *open redirect*. Só
 * caminhos internos são aceitos: começam com `/`, mas não com `//` ou `/\`, que o
 * navegador interpreta como outro domínio.
 */
export function getSafeRedirect(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || !value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
