import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// O jsdom não implementa ResizeObserver, que o ResponsiveContainer do Recharts usa
// para medir o gráfico. Nos testes, o tamanho não importa: só precisa existir.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Desmonta o que cada teste renderizou, para um teste não enxergar o DOM do anterior.
afterEach(() => {
  cleanup();
});
