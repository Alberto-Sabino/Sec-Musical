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

## Emuladores Firebase (via Docker, com persistência)
Os emuladores (Auth, Firestore, Storage) rodam em container:
```bash
docker compose up -d emuladores   # sobe Auth/Firestore/Storage
docker compose down               # derruba (exporta o estado antes de sair)
```
Persistência: os dados são mantidos entre reinícios num volume Docker
(`emulador-dados`, montado em `/data`). No `down`/`stop`, o entrypoint faz um
export explícito para `/data/export`; no `up` seguinte, reimporta esse estado.
Assim os dados não se perdem ao derrubar o container.

Para começar do zero (descartar os dados persistidos):
```bash
docker compose down
docker volume rm portalmusical_emulador-dados
docker compose up -d emuladores
```

Bucket do Storage: o seeder e a aplicação usam o mesmo bucket
(`VITE_FIREBASE_STORAGE_BUCKET`, ex.: `sec-musical-mvp.firebasestorage.app`).
Se divergirem, os arquivos são gravados num bucket que a app não consulta (404).

## Seeds do ambiente local
Com os emuladores no ar, popular dados de teste (nesta ordem):
```bash
npm run seed:emulador       # usuários + setores (cria contas no Auth)
npm run seed:arquivos       # 20 arquivos na Biblioteca (PDF e XLSX)
npm run seed:solicitacoes   # 20 solicitações (todos os status)
```

## Testes de unidade (sem emulador)
Helpers puros (formatação, regras de upload, navegação, caminhos da Biblioteca):
```bash
npm run test:unit
```

## Testes de regras (Firestore e Storage) via Docker
Rodam em container isolado (Node + JRE + firebase-tools), sem tocar o host:
```bash
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test
```
Os testes ficam em `tests/regras/` e validam cenários permitidos e bloqueados de
`usuarios`, `arquivos`, `solicitacoes` (Firestore) e dos caminhos de upload no
`storage.rules` (PDF/XLSX na Biblioteca; PDF no anexo de Solicitações).

## Estado atual
- Arquivos (upload/download) usam o **Storage real via SDK** apontando para o **Storage emulator** local (modo `emulador`), sem exigir Billing. O Storage de **produção** segue pendente de Billing.
- Acompanhar progresso por lote em `docs/status-execucao.md`.
