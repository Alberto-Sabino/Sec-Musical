# Ambiente local controlado — emuladores via Docker

Roda um ambiente completo nos emuladores Firebase, sem tocar produção nem exigir Billing.
Emuladores em container; aplicação (Vite) no host.

Validado: emuladores sobem, seed popula dados e a app conecta nos emuladores.

---

## Pré-requisitos
- Docker (emuladores).
- Node 20+ no host (para app e seed).
- `npm install` já executado no host.

## Portas
- 4000 — Emulator UI (painel no navegador)
- 8080 — Firestore
- 9099 — Authentication
- 9199 — Storage
- 5173 — Aplicação (Vite dev, no host)

---

## Passo a passo

### 1. Subir os emuladores (container)
```bash
docker compose up emuladores
```
Aguardar as portas 8080 e 9099 responderem. Painel: http://127.0.0.1:4000

> Para rodar em segundo plano: `docker compose up -d emuladores`.

### 2. Popular dados de teste (host, outro terminal)
```bash
npm run seed:emulador
```
Cria:
- setor `setorA`
- `admin@exemplo.com` / `senha123` (admin)
- `usuario@exemplo.com` / `senha123` (usuário)
- 1 arquivo de exemplo na Biblioteca

> O seed contorna as regras (apenas para popular). As regras reais continuam ativas para a app.

### 3. Rodar a aplicação (host)
Confirmar em `.env.local`:
```
VITE_APP_MODE=emulador
```
> `emulador` liga os emuladores locais e usa Storage real via emulador (sem Billing).
> Dev e login dependem dos emuladores; para deploy real use `producao`.
Então:
```bash
npm run dev
```
Abrir http://127.0.0.1:5173 e entrar com um dos usuários do seed.

### 4. Encerrar
```bash
docker compose down
```
Os dados do emulador são efêmeros (somem ao derrubar o container).

---

## Notas
- Arquivos (upload/download) usam o Storage real via SDK apontando para o **Storage emulator** local (modo `emulador`), sem exigir Billing. O Storage de produção segue pendente de Billing.
- Para testar as regras de Firestore isoladamente: `docker build -f Dockerfile.rules-test -t portal-musical-rules-test . && docker run --rm portal-musical-rules-test` (42/42).
- Este ambiente é de ensaio; não substitui a validação real de Storage.
