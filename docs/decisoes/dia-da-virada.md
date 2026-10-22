# Dia da virada — publicação em produção (2026-10-22)

Registro factual da virada do Portal Musical MVP para **produção plena**, com
Cloud Billing (Blaze) ativo. Branch publicada: `feature/v0.5.0`, mergeada em
`master`. Projeto Firebase: `sec-musical-mvp`.

Este documento é o registro datado da virada. O estado vivo do projeto fica em
`docs/decisoes/status-execucao.md`; o runbook executado, em
`docs/guias/guia-publicacao-piloto.md`.

---

## Decisões de infraestrutura

- **Billing/Blaze ativado.** Encerra a antiga "pendência única" de Billing.
- **Cloud Storage real:** bucket `sec-musical-mvp.firebasestorage.app`, região
  **`southamerica-east1`** (São Paulo), classe de uso padrão. Região escolhida
  por latência/performance para usuários no Brasil, aceitando o custo (baixo,
  não nulo).
- **Cloud Functions:** `syncClaimsFromUsuario` publicada em **`us-central1`**
  (região padrão), casada com o cliente (`getFunctions(app)` sem região). Decidido
  **não** mover a Function para São Paulo na virada: ganho de latência marginal
  (callable administrativa e rara) frente ao risco de inconsistência cliente↔servidor.

## Sequência executada (runbook §B/§C)

1. Firestore: deploy de regras + índices.
2. Storage: deploy de regras.
3. Cloud Functions: `npm install` em `functions/` + `firebase deploy --only functions`
   (habilitou as APIs necessárias; cleanup policy do Artifact Registry = 1 dia).
4. Usuários do piloto: criados via `scripts/seed-producao.mjs` (Admin SDK no Cloud
   Shell), que grava o doc `usuarios/{uid}` **e** injeta os custom claims na mesma
   execução — fechando o bootstrap do 1º admin e a sincronização sem passo manual.
5. CORS do bucket: `gsutil cors set` com as origens do Hosting
   (`sec-musical-mvp.web.app` e `sec-musical-mvp.firebaseapp.com`).
6. Hosting: `npm run build:prod` + `firebase deploy --only hosting` (v0.5.0).

## Usuários iniciais do piloto

Dois perfis (mesma pessoa) para validar os dois papéis:

- `albertosabino.as@gmail.com` — **Encarregado** (perfil comum).
- `albertosabino.secundario@gmail.com` — **Secretário global** (admin global).

Setor: `cachoeira-paulista-sp` (único em produção). `primeiro_acesso: true`
(troca obrigatória de senha no 1º login). Capabilities derivadas da matriz
oficial (Spec 22); claims espelham as capabilities (`ativo`, `ids_setor`, `caps`).

## Correções aplicadas durante a virada

1. **Visibilidade de arquivo privado (bug de formulário).** O `<select>` de
   visibilidade usava valores booleanos, mas `<option value>` nativo é sempre
   string; ao escolher "Privado", chegava a string `"true"` e `"true" === true`
   era `false`, salvando como **público**. Correção: tokens string
   (`'publico'`/`'privado'`) + conversores `privadoDoToken`/`tokenDePrivado` em
   `src/servicos/casos_de_uso/biblioteca.js`, com conversão no submit e na carga
   em edição (`src/modulos/admin/PaginaArquivoForm.vue`). Mantém `BaseSelect`
   genérico (string/número). Validado: build, lint, 79/79 unit, 140/140 rules.

2. **Índices compostos de `arquivos` faltando em produção.** As queries da
   Biblioteca para quem **vê privados** (admin/secretário) não incluem
   `arquivo_privado` no `where`, exigindo índices sem esse campo que não estavam
   versionados. Sintoma: "Não foi possível buscar os arquivos" em qualquer tipo e
   na busca, **apenas** para o secretário (o encarregado usa o caminho com
   `arquivo_privado==false`, que já tinha índice). Nunca apareceu no emulador
   (cria índices sob demanda). Correção: 4 índices adicionados em
   `firestore.indexes.json` e publicados:
   `(id_setor, tipo, data_atualizacao)`, `(escopo, tipo, data_atualizacao)`,
   `(id_setor, data_atualizacao)`, `(escopo, data_atualizacao)`. Houve um atraso
   de propagação mesmo após o status "Enabled".

## Validações concluídas (perfis Encarregado e Secretário global)

- Primeiro acesso: troca de senha obrigatória no 1º login (ambos).
- Solicitações: criar (encarregado), ver/assumir/comentar/anexar/concluir (secretário);
  somente o solicitante baixa a resposta.
- Biblioteca: visibilidade correta de público/privado × setor/global; privado
  some para o encarregado (valida a correção 1); listagem por tipo e busca como
  secretário (valida a correção 2).
- Download real de PDF/XLSX no navegador (valida CORS).
- Analytics GA4 registrando eventos em produção.
- Setores, arquivos, solicitações e usuários criados e operando.

## Pendências conhecidas (aceitas, pós-piloto)

- **Upgrade `firebase` 11→12.** `npm audit --omit=dev` reporta 4 high em
  `@grpc/grpc-js` (transitivo via `@firebase/firestore`). **Não afeta o bundle do
  browser** — grpc-js só roda em Node e está ausente em `dist/` (confirmado). O
  projeto está na minor mais alta da v11; a correção real é o major 12 (breaking),
  agendado como manutenção. **Não** usar `npm audit fix --force` (faz downgrade 11→9).
- **Runtime Node 20 das Cloud Functions.** Descomissionamento anunciado para
  2026-10-30. A Function existente continua rodando; reavaliar upgrade de runtime
  e `firebase-functions` antes de um novo deploy de Functions.

## Ambiente local (nota)

No ambiente local (emuladores) **não** se roda `syncClaimsFromUsuario` manualmente:
o `scripts/seed-emulador.mjs` injeta os claims junto com os usuários. A Function e
o bootstrap manual são exclusivos de produção.
