# Guia de publicação e piloto — execução manual

Runbook de publicação do MVP e do piloto controlado. A virada para produção
(Cloud Storage + Cloud Functions, com Billing/Blaze ativo) foi **executada e
concluída** — ver `docs/decisoes/dia-da-virada.md`. Os comandos abaixo
permanecem como referência para reexecução/manutenção. Comandos rodam a partir
da raiz do projeto, com `firebase login` feito.

> Repositório pronto: build gerando `dist/`, `firebase.json` (hosting + rewrites SPA
> + functions), `firestore.rules`, `firestore.indexes.json`, `storage.rules`
> (endurecidas com custom claims — Spec 17), Cloud Function `syncClaimsFromUsuario`
> em `functions/`, Analytics GA4 (ativo só em `producao`), seed de emulador e docs.
> Sobre claims/sincronização, ver `docs/guias/claims-e-sincronizacao.md`.

---

## Estado atual de produção (dia da virada concluído)

Projeto Firebase: `sec-musical-mvp`. **Billing/Blaze ativo.**

| Item                                   | Estado em produção                     |
| -------------------------------------- | -------------------------------------- |
| Hosting (frontend)                     | **Publicado** (v0.5.0, com Analytics)  |
| Authentication (e-mail/senha)          | **Configurado e operando**             |
| Firestore — regras                     | **Publicadas**                         |
| Firestore — índices                    | **Publicados** (inclui índices de `arquivos` para o perfil que vê privados) |
| Storage — regras (`storage.rules`)     | **Publicadas** (Spec 17)               |
| Analytics (GA4)                        | **Ativo** em `producao`                |
| **Cloud Storage (bucket real)**        | **Ativo** — `sec-musical-mvp.firebasestorage.app` (`southamerica-east1`) |
| **Cloud Functions (`functions/`)**     | **Publicadas** — `syncClaimsFromUsuario` (`us-central1`) |
| **CORS do bucket**                     | **Configurado** (origens do Hosting)   |

> A virada (§B) foi executada na ordem Functions → claims → Storage/CORS, com as
> validações do §C concluídas. Correções aplicadas durante a virada: visibilidade
> de arquivo privado no formulário e índices compostos de `arquivos` para o perfil
> que vê privados (listagem por tipo + busca). Detalhes em
> `docs/decisoes/dia-da-virada.md`.

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

## A. Publicar o Hosting com Analytics

> Fase **executada** na virada. Mantida como referência de republicação do
> frontend em produção. (A observação original "sem Billing" refletia o momento
> anterior à virada; hoje o Billing está ativo.)

Objetivo: publicar/republicar o frontend em produção com o Analytics já
configurado.

### A.1 Configuração de produção (`.env.prod`)
A build de produção usa o arquivo **`.env.prod`** (modo Vite `prod`), carregado
automaticamente por `npm run build:prod`. Não é preciso tocar na `.env.local` (que
fica dedicada ao modo emulador).

Garantir que `.env.prod` exista na raiz com as chaves reais do Firebase e:
```
VITE_APP_MODE=producao
VITE_FIREBASE_MEASUREMENT_ID=G-...   # ID GA4 do projeto (obrigatório p/ Analytics)
```
> `.env.prod` contém chaves reais e **não é commitado** (está no `.gitignore`).
> Como é um arquivo mode-specific, seu `VITE_APP_MODE` tem precedência sobre o da
> `.env.local` — então `build:prod` sempre sai em `producao`, sem risco de confusão.
> Em `producao`, o Analytics envia dados e a infra de arquivos aponta para o Storage
> real (as operações de arquivo só funcionam após o §B/Billing; consulta, Auth,
> Firestore e navegação funcionam normalmente).

### A.2 Validar localmente
```bash
npm install
npm run build:prod   # build de produção; termina sem erro; gera dist/
npm run test:unit    # helpers puros
```

### A.3 Publicar o Hosting
```bash
npm run build:prod
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
As Storage Rules dependem dos claims (`ativo`, `ids_setor`, `caps`),
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
  Function (que exige `ativo==true` e `caps` contendo `biblioteca_gerenciar_setor`
  ou `biblioteca_gerenciar_global`). Fazer o bootstrap do primeiro admin **uma vez**
  via Console (Cloud Shell) com o Admin SDK, espelhando o mapa `capabilities` do
  documento `usuarios/{uid}`:
  ```bash
  # Cloud Shell do projeto, Node (caps = lista de capabilities do admin):
  node -e "const a=require('firebase-admin');a.initializeApp();a.auth().setCustomUserClaims('<uid-admin>',{ativo:true,ids_setor:['<setor>'],caps:['biblioteca_ler_publicos','biblioteca_ler_privados','biblioteca_gerenciar_setor','biblioteca_gerenciar_global','solicitacoes_ver_proprias','solicitacoes_ver_setor','solicitacoes_agir_setor']}).then(()=>console.log('ok'))"
  ```
  Em seguida, esse admin sincroniza os demais pela Function.

> Refazer a sincronização sempre que mudar `capabilities`, `ids_setor` ou `ativo`
> de um usuário. Detalhes e depuração em `docs/guias/claims-e-sincronizacao.md`.

> Alternativa usada na virada: o script `scripts/seed-producao.mjs` (Admin SDK, no
> Cloud Shell) cria o doc `usuarios/{uid}` **e** injeta os claims na mesma
> execução, fechando B.4/B.5 para os usuários semeados sem bootstrap manual nem
> chamada à Function. Útil para criar os usuários iniciais do piloto com as
> capabilities da matriz oficial (Spec 22).

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
Garantir a build de produção apontando ao Storage real (usa `.env.prod`):
```bash
npm run build:prod
firebase deploy --only hosting
```

---

## C. Testes e validações (concluídos na virada)

Automatizáveis (mantidos verdes antes de publicar):
```bash
npm run test:unit                                   # unitários
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test           # rules (Firestore+Storage)
```

Validações manuais com Storage/Functions reais — **todas concluídas** nos perfis
Encarregado e Secretário global:

- [x] Chamada da callable `syncClaimsFromUsuario` por admin ativo retorna `{ ok: true }`.
- [x] Chamada por não-admin é negada (`permission-denied`).
- [x] Claims aparecem no token após `forcarAtualizacaoToken` (ver `docs/guias/claims-e-sincronizacao.md` §4).
- [x] Biblioteca: usuário comum lê público do próprio setor + globais públicos; **não** lê privados; **não** lê setor fora da claim.
- [x] Biblioteca (admin/secretário): listagem por tipo **e** busca funcionam vendo privados — exige os índices compostos de `arquivos` sem `arquivo_privado` (publicados na virada). O emulador não exige índice; validar **em produção, logado como admin**.
- [x] Biblioteca: admin marca arquivo como **Privado** e ele fica realmente privado (some para o encarregado) — correção de visibilidade no formulário.
- [x] Biblioteca: admin faz upload/edição/remoção no próprio setor; é negado fora do setor.
- [x] Solicitações: admin do setor anexa `resposta.pdf`; **somente o solicitante** baixa a resposta (admin não baixa).
- [x] Download real no navegador funciona (CORS OK) para PDF e XLSX.
- [x] Analytics GA4 registrando eventos em produção.
- [x] E-mail real de redefinição de senha chega (template do Firebase Auth) — ver `docs/specs/spec-16-autenticacao-senha.md`.

---

## 6. Preparar dados iniciais do piloto
Seguir `docs/guias/piloto-seed-dados.md` (estrutura exata dos documentos).

1. **Setores**: criar o(s) setor(es) do piloto na coleção `setores`.
2. **Usuários**:
   - criar cada pessoa em Authentication (e-mail/senha);
   - criar o documento em `usuarios` com doc id = UID do Auth, definindo
     `cargo` (exibição), `ativo: true`, `ids_setor` e o mapa `capabilities`
     (ver `docs/guias/piloto-seed-dados.md`);
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
Seguir `docs/guias/piloto-indicadores.md`:
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

## Pendências conhecidas (aceitas, pós-piloto)
A virada para produção foi **concluída** (Billing/Blaze ativo; Cloud Storage real
e Cloud Functions no ar). Permanecem, como manutenção futura (não bloqueiam):

- **Upgrade `firebase` 11→12:** o `npm audit` reporta CVE transitório em
  `@grpc/grpc-js` (via `@firebase/firestore`). Não afeta o bundle do browser
  (grpc-js só roda em Node; ausente em `dist/`). Correção real = upgrade para o
  major 12 (breaking), agendado. **Não** usar `npm audit fix --force` (faz
  downgrade 11→9).
- **Runtime das Cloud Functions Node 20:** descomissionamento em 2026-10-30.
  Reavaliar upgrade de runtime/`firebase-functions` antes de um novo deploy de
  Functions.

Registro completo da virada em `docs/decisoes/dia-da-virada.md`.
