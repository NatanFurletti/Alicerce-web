# Alicerce Web

Front-end do [Alicerce](https://github.com/NatanFurletti/alicerce-api), uma API de simulação
de financiamento imobiliário com SAC, Price, CET e amortização extraordinária.

> 🚧 Em construção. O README completo, com prints e o link do deploy, entra na última etapa.

## Como rodar

Pré-requisitos: Node.js 20.11+ e a [API Alicerce](https://github.com/NatanFurletti/alicerce-api)
rodando em `http://localhost:3000`, com `CORS_ORIGINS=http://localhost:3001`.

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3001
```

O front usa a porta **3001** porque a API já ocupa a 3000.

## Scripts

| Script              | O que faz                                 |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento na porta 3001 |
| `npm run build`     | Build de produção                         |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | Gera os tipos das rotas e roda o `tsc`    |
| `npm test`          | Testes com Vitest                         |
| `npm run format`    | Formata com Prettier                      |
