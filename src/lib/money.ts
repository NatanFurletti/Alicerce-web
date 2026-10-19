/**
 * Conversões entre o que o usuário digita e o que a API espera.
 *
 * A API trafega dinheiro como **inteiro de centavos** e taxas como **decimal** (0.0975 =
 * 9,75%). O formulário trabalha em reais e em percentual, então a conversão acontece
 * uma vez, na borda, e nunca no meio da lógica de tela.
 */

/**
 * Reais para centavos, igual ao `toCents` da API.
 *
 * Arredonda o produto porque `19.99 * 100` é 1998.9999999999998 em ponto flutuante:
 * truncar daria um centavo a menos.
 */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

export function toReais(cents: number): number {
  return cents / 100;
}

/** Casas decimais aceitas pela API em taxas (`@IsNumber({ maxDecimalPlaces: 10 })`). */
const RATE_DECIMAL_PLACES = 10;
const RATE_SCALE = 10 ** RATE_DECIMAL_PLACES;

/**
 * Percentual digitado para taxa decimal: 9,75 → 0.0975.
 *
 * A divisão pura pode gerar uma dízima binária (`0.07 / 100` vale
 * 0.0007000000000000001), com mais casas do que a API aceita, e a requisição voltaria
 * com 400. Arredondar para a precisão da API elimina esse ruído.
 */
export function percentToRate(percent: number): number {
  return Math.round((percent / 100) * RATE_SCALE) / RATE_SCALE;
}

/** Taxa decimal para percentual exibível num campo: 0.0975 → 9.75. */
export function rateToPercent(rate: number): number {
  return Math.round(rate * 100 * RATE_SCALE) / RATE_SCALE;
}
