import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Mesmas regras do alicerce-api: nada de `any` e nenhuma variável esquecida.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Camada de serviço isolada: só `services/` (e a sessão, que registra o
    // middleware) falam com a API. Componentes e hooks chamam serviços.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/features/*/services/**',
      'src/features/auth/session/**',
      'src/lib/api/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/api/client',
              message:
                'Componentes e hooks não chamam a API. Crie ou use uma função em features/<feature>/services.',
            },
            {
              name: 'openapi-fetch',
              message:
                'Use o cliente de @/lib/api/client, dentro de uma camada de serviço.',
            },
          ],
        },
      ],
    },
  },
  // Por último: desliga as regras de estilo que brigariam com o Prettier.
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/lib/api/schema.d.ts',
  ]),
]);

export default eslintConfig;
