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
- `VITE_APP_MODE` — modo único da aplicação (flag única que deriva emuladores + destino dos arquivos):
  - `emulador` — emuladores locais ligados; upload/download/remoção reais via **Storage emulator** (não exige Billing). Modo de desenvolvimento (padrão). O login e o desenvolvimento dependem dos emuladores.
  - `producao` — sem emuladores; Storage real de **produção** (pendente de Billing; não considerar concluído enquanto Billing não estiver ativo).

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
- Arquivos (upload/download) usam o **Storage real via SDK** apontando para o **Storage emulator** local (modo `emulador`), sem exigir Billing. O Storage de **produção** segue pendente de Billing.
- Acompanhar progresso por lote em `docs/status-execucao.md`.
