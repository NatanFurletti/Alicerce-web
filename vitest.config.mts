import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Testes rodam em UTC, e não no fuso da máquina. Na máquina de quem desenvolve (no
// Brasil), o fuso local já é o de Brasília, e um teste de data passaria mesmo que o
// código esquecesse de fixar `timeZone`. Em UTC, esse esquecimento aparece.
process.env.TZ = 'UTC';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mesmo alias do tsconfig: `@/` aponta para `src/`.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
