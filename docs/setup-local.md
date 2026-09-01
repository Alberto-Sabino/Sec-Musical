# Setup local — Portal Musical MVP

Guia curto para rodar o projeto localmente. Não cobre produção.

## Pré-requisitos
- Node 20+
- npm
- Docker (apenas para os testes de regras)

## Instalação
```bash
npm install
cp .env.example .env.local   # preencher as chaves do Firebase
```

## Variáveis de ambiente
Ver `.env.example`. Destaques:
- `VITE_USE_EMULATORS=true` — conecta Auth/Firestore/Storage aos emuladores locais.
- `VITE_FILE_INFRA=mock` — infraestrutura de arquivos simulada (sem Billing). Use `firebase` só quando o Storage real estiver ativo.

## Executar a aplicação
```bash
npm run dev       # servidor de desenvolvimento (Vite)
npm run build     # build de produção
npm run preview   # pré-visualizar o build
```

## Emuladores Firebase
```bash
npm run emulators   # requer Firebase CLI e Java (JRE)
```

## Testes de regras (Firestore) via Docker
Rodam em container isolado (Node + JRE + firebase-tools), sem tocar o host:
```bash
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test
```
Os testes ficam em `tests/regras/` e validam cenários permitidos e bloqueados de `usuarios` e `arquivos`.

## Estado atual
- Arquivos (upload/download) operam em modo `mock`; Storage real e regras de Storage seguem pendentes de Billing.
- Acompanhar progresso por lote em `docs/status-execucao.md`.
