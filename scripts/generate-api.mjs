/**
 * Gera os tipos TypeScript da API a partir do OpenAPI publicado por ela.
 *
 *   npm run generate:api                    # API local, http://localhost:3000
 *   OPENAPI_URL=https://... npm run generate:api
 *
 * O arquivo gerado é versionado: o build e o CI não dependem da API estar no ar.
 * Quando o contrato muda, regenerar e commitar deixa a mudança visível no diff.
 */
import { writeFile } from 'node:fs/promises';

import openapiTS, { astToString } from 'openapi-typescript';

const source = process.env.OPENAPI_URL ?? 'http://localhost:3000/docs-json';
const target = new URL('../src/lib/api/schema.d.ts', import.meta.url);

const header =
  '/**\n' +
  ' * ARQUIVO GERADO por `npm run generate:api`. Não edite à mão.\n' +
  ` * Fonte: ${source}\n` +
  ' */\n\n';

try {
  const ast = await openapiTS(new URL(source));
  await writeFile(target, header + astToString(ast));
  console.log(`Tipos gerados a partir de ${source}`);
} catch (error) {
  console.error(`Falha ao gerar os tipos a partir de ${source}.`);
  console.error('A API está no ar? Veja o README do alicerce-api.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
