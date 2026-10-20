/**
 * Converte um número digitado em pt-BR para `number`. Devolve `NaN` se não for número.
 *
 * Regras, nesta ordem:
 * 1. "R$", "%" e espaços são ignorados.
 * 2. Com vírgula: formato brasileiro. Pontos são milhar e a vírgula é decimal
 *    ("1.234,56").
 * 3. Sem vírgula, um único ponto seguido de 1 ou 2 dígitos é decimal ("9.75"): é
 *    como muita gente digita taxa.
 * 4. Sem vírgula, os demais pontos são milhar ("500.000").
 *
 * A ambiguidade de "1.500" (mil e quinhentos ou um e meio?) é resolvida pela regra 4,
 * a leitura natural em pt-BR. O valor interpretado aparece formatado ao lado do campo,
 * então um engano fica visível antes do envio.
 */
export function parseDecimalBR(value: string): number {
  const cleaned = value.replace(/R\$|%|\s/g, '');

  const brazilian = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/;
  if (cleaned.includes(',')) {
    if (!brazilian.test(cleaned)) return NaN;
    return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  if (/^-?\d+\.\d{1,2}$/.test(cleaned)) return Number(cleaned);

  if (!brazilian.test(cleaned)) return NaN;
  return Number(cleaned.replace(/\./g, ''));
}
