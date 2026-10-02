# Guia de publicação e piloto — execução manual

Runbook para publicar o MVP, preparar o piloto controlado e, quando o Billing for
ativado, concluir os deploys restantes (Cloud Storage + Cloud Functions).
Comandos rodam a partir da raiz do projeto, com `firebase login` feito.

> Repositório pronto: build gerando `dist/`, `firebase.json` (hosting + rewrites SPA
> + functions), `firestore.rules`, `firestore.indexes.json`, `storage.rules`
> (endurecidas com custom claims — Spec 17), Cloud Function `syncClaimsFromUsuario`
> em `functions/`, Analytics GA4 (ativo só em `producao`), seed de emulador e docs.
> Sobre claims/sincronização, ver `docs/claims-e-sincronizacao.md`.

---

## Estado atual de produção (2026-10-02)

Projeto Firebase: `sec-musical-mvp`.

| Item                                   | Estado em produção                     |
| -------------------------------------- | -------------------------------------- |
| Hosting (frontend)                     | **Publicado** (republicar com Analytics — ver §A) |
| Authentication (e-mail/senha)          | **Configurado e operando**             |
| Firestore — regras                     | **Publicadas**                         |
| Firestore — índices                    | **Publicados**                         |
| Storage — regras (`storage.rules`)     | **Publicadas** (arquivo da Spec 17)    |
| Analytics (GA4)                        | Configurado com o ID do projeto; entra no ar com a nova build de Hosting |
| **Cloud Storage (bucket real)**        | **Pendente** — requer Billing/Blaze    |
| **Cloud Functions (`functions/`)**     | **Pendente** — requer Billing/Blaze    |

**Billing/Blaze:** ainda **não ativado**. Enquanto isso, upload/download/remoção
reais rodam contra o Storage emulator local (modo `emulador`), e os claims são
injetados pelo seeder. As Storage Rules já publicadas **só passam a vigorar de
fato** quando o bucket real existir (Billing) e os claims forem sincronizados em
produção pela Function.

> Atenção (consistência): as `storage.rules` em produção exigem custom claims. Como
> as Functions ainda não estão no ar, nenhum usuário de produção tem claims. Isso é
> inofensivo hoje porque o bucket real ainda não é usado. Ao ativar o Billing,
> seguir o §B **na ordem** (Functions → sincronizar claims → validar Storage), senão
> o acesso a arquivos será negado por ausência de claims.

---

## 0. Pré-requisitos
- Node 20+ e npm instalados.
- Conta Firebase com o projeto `sec-musical-mvp`.
- Firebase CLI:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase use sec-musical-mvp     # ou: firebase use --add
  ```

---

## A. Publicar agora (sem Billing): nova build de Hosting com Analytics

Objetivo imediato: republicar o frontend em produção com o Analytics já
configurado, para o piloto. Não requer Billing.

### A.1 Variáveis de ambiente de produção
```bash
cp .env.example .env.local   # se ainda não existir
```
Preencher em `.env.local` as chaves reais do Firebase (Console > Configurações do
projeto). Para a build de produção com Analytics ativo:
```
VITE_APP_MODE=producao
VITE_FIREBASE_MEASUREMENT_ID=   # ID GA4 do projeto (obrigatório p/ Analytics)
```
> Em `producao`, o Analytics envia dados; em `emulador`, os eventos são ignorados.
> `VITE_APP_MODE=producao` também aponta a infra de arquivos para o Storage real —
> o que é esperado em produção, mas as operações de arquivo só funcionarão após o §B
> (Billing). Consulta/Firestore/Auth/navegação funcionam normalmente.

### A.2 Validar localmente
```bash
npm install
npm run build        # termina sem erro; gera dist/
npm run test:unit    # helpers puros
```

### A.3 Publicar o Hosting
```bash
npm run build
firebase deploy --only hosting
```
O CLI mostra a Hosting URL ao final. Validar no navegador: login, Biblioteca
(listagem/consulta), Solicitações (fluxo) e navegação. O envio de eventos GA4 pode
ser conferido em DebugView/Realtime do GA4.

> Nesta fase, qualquer upload/download real falha (bucket ainda inexistente). Isso é
> esperado até o §B.

---

## B. Ativação do Billing — deploys restantes (Storage + Functions)

Executar **nesta ordem** quando o Cloud Billing (plano Blaze) estiver ativo.

### B.1 Ativar Billing e confirmar o bucket
1. Console Firebase > Upgrade para o plano **Blaze**.
2. Confirmar/provisionar o bucket padrão de Storage
   (`VITE_FIREBASE_STORAGE_BUCKET=sec-musical-mvp.firebasestorage.app`). O mesmo
   bucket é usado pela aplicação e pelo seed; se divergir, a app lê de um bucket que
   não existe (404).

### B.2 (Re)publicar as regras do Storage
As regras já estão publicadas, mas republicar garante a versão da Spec 17 vigente:
```bash
firebase deploy --only storage
```

### B.3 Deploy das Cloud Functions
As Storage Rules dependem dos claims (`ativo`, `nivel_acesso`, `ids_setor`),
provisionados por `syncClaimsFromUsuario`.
```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```
> Região: a callable usa a região padrão (`us-central1`), compatível com o cliente
> (`getFunctions(app)` sem região explícita). Se mudar a região no deploy, ajustar o
> cliente com `getFunctions(app, '<regiao>')` em `src/servicos/firebase/index.js`.

### B.4 Sincronizar os claims dos usuários existentes
Sem claims, as Storage Rules **negam** acesso a arquivos. Após o deploy, sincronizar
cada usuário (um admin ativo chama a Function por uid). Opções:

- Pelo app (recomendado), logado como admin ativo: acionar o fluxo que chama
  `sincronizarClaimsUsuario('<uid-alvo>')` seguido de `forcarAtualizacaoToken()`
  (ambos em `src/servicos/repositorios/repositorioAutenticacao.js`). Caso não haja
  UI dedicada para isso, expor temporariamente um acionador no painel admin ou
  chamar a callable `syncClaimsFromUsuario` autenticado como admin.
- O **primeiro admin** é o caso especial: ele precisa de claims para poder chamar a
  Function (que exige `nivel_acesso==2` e `ativo==true` no token). Fazer o bootstrap
  do primeiro admin **uma vez** via Console (Cloud Shell) com o Admin SDK:
  ```bash
  # Cloud Shell do projeto, Node:
  node -e "const a=require('firebase-admin');a.initializeApp();a.auth().setCustomUserClaims('<uid-admin>',{ativo:true,nivel_acesso:2,ids_setor:['<setor>']}).then(()=>console.log('ok'))"
  ```
  Em seguida, esse admin sincroniza os demais pela Function.

> Refazer a sincronização sempre que mudar `nivel_acesso`, `ids_setor` ou `ativo`
> de um usuário. Detalhes e depuração em `docs/claims-e-sincronizacao.md`.

### B.5 Configurar CORS do bucket (necessário para download no navegador)
O download usa `getBytes` (requisição do navegador ao endpoint do Storage), sujeito
a **CORS**. Configurar o bucket para aceitar a origem do Hosting:
```bash
# cors.json (criar na raiz, temporário)
# [
#   {
#     "origin": ["https://<SEU-DOMINIO-HOSTING>"],
#     "method": ["GET"],
#     "responseHeader": ["Content-Type", "Content-Disposition"],
#     "maxAgeSeconds": 3600
#   }
# ]
gsutil cors set cors.json gs://sec-musical-mvp.firebasestorage.app
gsutil cors get gs://sec-musical-mvp.firebasestorage.app   # conferir
```
> `gsutil` vem com o Google Cloud SDK. Incluir todas as origens usadas (domínio
> custom e/ou `*.web.app`/`*.firebaseapp.com`). Sem CORS correto, a listagem
> funciona mas o download falha no navegador.

### B.6 App Check (opcional, NÃO ativar sem decisão)
A Function tem `enforceAppCheck` **desligado**. Só ativar App Check enforcement se o
projeto configurar App Check no cliente; caso contrário quebra as chamadas. Fora do
escopo atual (ver Spec 17 §7.6).

### B.7 Rebuild e redeploy do frontend em produção
Garantir a build de produção apontando ao Storage real:
```bash
# .env.local: VITE_APP_MODE=producao
npm run build
firebase deploy --only hosting
```

---

## C. Testes e validações pendentes (fazer na ativação do Billing)

Automatizáveis já cobertos localmente (manter verdes antes de publicar):
```bash
npm run test:unit                                   # 49/49 esperado
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test           # 95/95 esperado (Firestore+Storage)
```

Validações manuais que **só podem ser feitas com Storage/Functions reais** (hoje
pendentes de Billing):

- [ ] Chamada da callable `syncClaimsFromUsuario` por admin ativo retorna `{ ok: true }`.
- [ ] Chamada por não-admin é negada (`permission-denied`).
- [ ] Claims aparecem no token após `forcarAtualizacaoToken` (ver `docs/claims-e-sincronizacao.md` §4).
- [ ] Biblioteca: usuário comum lê `nivel_1` do próprio setor; **não** lê `nivel_2`; **não** lê setor fora da claim.
- [ ] Biblioteca: admin faz upload/edição/remoção no próprio setor; é negado fora do setor.
- [ ] Solicitações: admin do setor anexa `resposta.pdf`; **somente o solicitante** baixa a resposta (admin não baixa).
- [ ] Download real no navegador funciona (CORS OK) para PDF e XLSX.
- [ ] E-mail real de redefinição de senha chega (template do Firebase Auth) — ver `docs/specs/spec-16-autenticacao-senha.md`.

---

## 6. Preparar dados iniciais do piloto
Seguir `docs/piloto-seed-dados.md` (estrutura exata dos documentos).

1. **Setores**: criar o(s) setor(es) do piloto na coleção `setores`.
2. **Usuários**:
   - criar cada pessoa em Authentication (e-mail/senha);
   - criar o documento em `usuarios` com doc id = UID do Auth, definindo
     `nivel_acesso` (1 usuário / 2 admin), `ativo: true` e `ids_setor`;
   - **sincronizar os claims** desse usuário (§B.4) quando o Storage real estiver ativo.
3. **Biblioteca**: cadastrar os primeiros arquivos.
   - Com Storage de produção: usar a própria tela de admin (upload real).
   - Sem Billing: upload/download funcionam contra o Storage emulator local (modo `emulador`), seguindo o `id_nuvem` oficial.

> Ensaio local opcional (emulador): `npm run emulators` e, em outro terminal,
> `npm run seed:emulador` (popula dados **e** injeta claims).

---

## 7. Definir setor piloto e responsáveis
- Escolher 1 setor para começar.
- Definir ao menos 1 admin (Secretário) e os usuários (Encarregados) do setor.
- Comunicar a URL e as credenciais aos participantes.

---

## 8. Acompanhar indicadores
Seguir `docs/piloto-indicadores.md`:
- logins, consultas à Biblioteca, solicitações abertas/concluídas, erros críticos.

---

## 9. Checklist de saída do piloto
- [ ] Hosting publicado e acessível na URL (com Analytics em `producao`).
- [ ] Regras e índices do Firestore publicados.
- [ ] Regras de Storage publicadas.
- [ ] (Pós-Billing) Cloud Functions publicadas e claims sincronizados.
- [ ] (Pós-Billing) CORS do bucket configurado; download real validado.
- [ ] Setor piloto criado.
- [ ] Admin e usuários criados, ativos e com claims sincronizados.
- [ ] Primeiros arquivos na Biblioteca.
- [ ] Responsáveis definidos e avisados.
- [ ] Indicadores sendo coletados.

---

## Pendência conhecida (aceita)
Cloud Storage real e Cloud Functions permanecem pendentes de **Billing/Blaze**. Em
desenvolvimento, upload/download/remoção funcionam via Storage emulator e os claims
são injetados pelo seeder. Ao ativar o Billing, executar o **§B na ordem** e as
validações do **§C**. Enquanto o Billing não é ativado, o piloto opera com Hosting +
Auth + Firestore em produção e arquivos no emulador local.
