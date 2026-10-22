# Status de Execução — Portal Musical MVP

## Regra de uso
Atualizar este arquivo ao final de cada lote, de forma curta e objetiva.

Não escrever relatórios longos.
Não repetir contexto já documentado.
Não registrar intenção como se fosse entrega concluída.

---

## Estado atual
- Fase ativa: **Sprint 3 concluída** (Specs 13, 14, 15 e 16 aplicadas) + Analytics GA4 + **Spec 17 aplicada** (Custom Claims + hardening de rules + Cloud Functions) + **Spec 18 aplicada** (Biblioteca Global: escopo global|setor + admin_global) + **Spec 19 aplicada** (UI Motion: animações leves e padronizadas) + **Spec 20 aplicada** (primeiro acesso: troca obrigatória de senha via flag `primeiro_acesso`) + **Spec 21 aplicada** (auditoria `anexo_visualizado` após download do anexo final) + **Spec 22 aplicada** (capabilities no Firestore + claim `caps[]`; autorização migrada, legado mantido) + **Spec 23 aplicada** (hard cut: legado `nivel_acesso`/`admin_global` removido; `cargo` + `arquivo_privado` + capabilities/caps como única base)
- Ambiente de produção: **funcional e completo** — Hosting (v0.5.0), Firestore (regras + índices), Authentication, **Cloud Storage real** e **Cloud Functions** (`syncClaimsFromUsuario`) publicados, operando e validados; Analytics GA4 ativo
- Sprints anteriores: Sprint 1 (Spec 09) e Sprint 2 (Spec 10) concluídas; ajustes Spec 11 e Spec 12 aplicados
- Status geral: **MVP em produção plena (dia da virada concluído)** — ver `docs/decisoes/dia-da-virada.md`
- **Billing/Blaze:** **ativo**. Cloud Storage real (bucket `sec-musical-mvp.firebasestorage.app` em `southamerica-east1`) e Cloud Functions no ar. Não há mais pendência de Billing.

### Dia da virada (produção) — concluído
- **Publicação completa:** Hosting, Firestore (regras + índices), Storage (regras + bucket real), Cloud Functions e CORS do bucket publicados; runbook executado em `docs/guias/guia-publicacao-piloto.md` (§B/§C). Registro em `docs/decisoes/dia-da-virada.md`.
- **Correções da virada:** (1) visibilidade de arquivo privado no formulário (select booleano→token string, `biblioteca.js`/`PaginaArquivoForm.vue`); (2) índices compostos de `arquivos` para o perfil que vê privados (listagem por tipo + busca), que faltavam em produção (`firestore.indexes.json`).
- **Pendências conhecidas (aceitas, pós-piloto):** upgrade `firebase` 11→12 (CVE transitório de `@grpc/grpc-js`, fora do bundle do browser); runtime das Cloud Functions Node 20 (descomissionamento em 2026-10-30) — reavaliar upgrade antes de novo deploy de Functions.

### Spec 13 — Shell autenticado, navegação global e orientação inicial
- Status: aplicado (produção)
- Resultado: barra inferior persistente na área autenticada (`BarraInferior.vue`); navegação direta entre módulos; destaque do módulo ativo (`usarNavegacaoModulos.js`); regra estável de `← Voltar` (`route.back()`); home reorganizada com contexto do usuário, seletor de setor e cards de módulos; ícones locais do Lucide por cópia de SVG; proteção contra perda de formulário ao trocar de rota (`usarGuardaFormulario.js`)
- Validação: `npm run build` OK; `npm run lint` OK
- Pendências: nenhuma

### Spec 14 — Biblioteca: descoberta por tipos, busca, metadados, legados e upload
- Status: aplicado (produção)
- Resultado: nova tela inicial da Biblioteca com busca por nome + cards de tipos (`PaginaBiblioteca.vue`); listagem por tipo (`PaginaBibliotecaTipo.vue`); resultados de busca (`PaginaBibliotecaBusca.vue`); remoção da antiga visão "todos os documentos" e do select de tipo; cards com tamanho em MB; suporte real a `.pdf` e `.xlsx`; ordenação alfabética; regras de upload centralizadas (`regrasUpload.js`); tratamento de arquivos legados sem `tamanho_bytes`/`extensao_arquivo`; correção do bug de reenvio simbólico da fase mock
- Validação: `npm run build` OK; `npm run lint` OK
- Pendências: nenhuma (upload/download reais dependem apenas do Storage em produção — pendência única global)

### Spec 15 — Solicitações: filtros, listagens, paginação, linearidade e anexo
- Status: aplicado (produção)
- Resultado: filtros sempre visíveis por status e tipo (`FiltrosSolicitacoes.vue`); status iniciais pré-selecionados; paginação de 15 itens (`PaginacaoLista.vue`); tipo identificado por ícone; detalhes lineares (secretário e encarregado); histórico com data e hora; validação de anexo final (PDF até 2 MB); estado vazio com SVG + texto; mesma lógica de listagem para encarregado e secretário (`usarListaSolicitacoes.js`)
- Validação: `npm run build` OK; `npm run lint` OK; `npm run test:unit` OK
- Pendências: nenhuma

### Analytics — Eventos GA4
- Status: aplicado (produção)
- Resultado: instrumentação GA4 com fonte única de nomes (`src/enums/eventosAnalytics.js`) e disparo central `dispararEvento` (`src/servicos/firebase/analytics.js`); rastreio de navegação por tela (`src/servicos/casos_de_uso/analyticsNavegacao.js`, integrado ao `router/guards.js`); eventos de conversão/conclusão de fluxo; documentação em `docs/guias/analytics-eventos.md`
- Comportamento: só envia dados quando `VITE_APP_MODE=producao`; em `emulador` os eventos são ignorados silenciosamente (sem chamadas de rede)
- Validação: `npm run build` OK; `npm run test:unit` OK (`tests/unit/analyticsNavegacao.test.js`)
- Pendências: nenhuma

### Spec 16 — Autenticação: senha e perfil do usuário
- Status: aplicado (produção)
- Resultado: fluxos "Esqueci minha senha" (rota pública), "Redefinir senha" via link do e-mail (rota pública, `verifyPasswordResetCode` + `confirmPasswordReset`) e "Alterar senha" (rota autenticada, `reauthenticateWithCredential` + `updatePassword`); tela de perfil "Minhas informações" (rota `perfil`) com dados cadastrais + ações Alterar senha/Sair, acessível por ícone de conta na Início; `sendPasswordResetEmail` com `actionCodeSettings.url` retornando à aplicação; `celular` exposto no contexto; regras/mensagens de senha centralizadas em `src/servicos/casos_de_uso/senha.js`; prop opcional `voltar` no `CabecalhoPagina`
- Segurança: campos `type="password"`; mensagens genéricas; resposta anti-enumeração no envio de redefinição; `alterar-senha` exige sessão + reautenticação
- Validação: `npm run lint` OK; `npm run test:unit` OK (regras puras de senha); `npm run build` OK
- Pendências: validação do envio real de e-mail de redefinição consolidada junto à pendência única (produção com Billing e template de e-mail do Firebase); ver `docs/specs/spec-16-autenticacao-senha.md`

### Spec 18 — Biblioteca Global (escopo global|setor) + admin_global + hardening de rules
- Status: aplicado localmente (emulador); deploy de produção pendente de Billing (storage.rules + functions)
- Resultado:
  - **Modelo de dados:** campo `escopo` ('global'|'setor') em `arquivos` (fonte única `src/enums/escopoArquivos.js`); legados sem `escopo` tratados como 'setor'. Campo `admin_global` (boolean) em `usuarios`.
  - **Caminhos:** `biblioteca_global/{nivel_1|nivel_2}/{id}.{ext}` para globais; setor mantém `biblioteca/{id_setor}/...` (`bibliotecaCaminhos.js`).
  - **Casos de uso/repositório:** cadastro/edição com escopo e `id_setor` condicional; listagem une setor + globais (`repositorioArquivos.js` + 2 índices novos em `firestore.indexes.json`).
  - **UI:** `PaginaArquivoForm.vue` com checkbox "Restringir o arquivo ao setor" + select de setor; checkbox travada/marcada para admin sem `admin_global`.
  - **Sessão:** derivado `ehAdminGlobal` (claim com fallback no contexto); `admin_global` exposto no contexto (`autenticacao.js`, `usarSessao.js`).
  - **Rules:** Firestore — leitura global (nível 2 só admin), escrita/remoção global só `admin_global` com `id_setor` ausente; escrita setor pelo admin do setor. Storage — novo `match biblioteca_global` (escrita/remoção só `admin_global`, MIME/teto mantidos).
  - **Claims:** `syncClaimsFromUsuario` passa a espelhar `admin_global` com consistência (`false` se `nivel_acesso != 2`); seeder injeta `admin_global` localmente.
  - **Testes:** unit do enum (`tests/unit/escopoArquivos.test.js`) e de caminhos globais; regras de Firestore e Storage com cenários globais e de governança.
- Continuação (UI — indicador + gating + guard):
  - `IconeGlobal.vue` (Lucide globe local); indicador de global nas listagens (`PaginaBibliotecaTipo.vue`, `PaginaBibliotecaBusca.vue`) e no detalhe (`DetalheArquivo.vue`).
  - Gating de Editar/Remover por elegibilidade: helper puro `podeGerenciarArquivo(arquivo, ehAdminGlobal)`; em `PaginaBibliotecaTipo.vue` as ações só aparecem para `ehAdmin && podeGerenciar(arquivo)` (global exige `admin_global`).
  - Guard em `PaginaArquivoForm.vue`: edição de arquivo global por quem não é `admin_global` é bloqueada (mensagem + redirect para `biblioteca`).
  - Testes: `podeGerenciarArquivo` coberto em `tests/unit/escopoArquivos.test.js`.
- Refinamentos de UI (formulário de arquivo):
  - dicas de escopo destacadas (setor em azul/info com `IconeBiblioteca`; global em amarelo/alerta com `IconeGlobal`);
  - padrão único de campo desabilitado nos componentes base (`BaseInput`/`BaseSelect`/`BaseTextarea`): fundo acinzentado, borda tracejada, texto esmaecido e `cursor: not-allowed` (tokens `--cor-desabilitado-*`);
  - transições (`<Transition>`) entre estados do formulário (carregando/bloqueado/card) e entre as dicas, com suporte a `prefers-reduced-motion`.
- Legibilidade: comentários sintetizados e escopo interno das funções separado por quebras de linha nos módulos da spec (sem mudança de comportamento).
- Decisões: governança de UI = sem `admin_global`, os controles de escopo (checkbox + select) **não são renderizados**; exibe-se apenas um aviso de que o arquivo fica restrito ao setor ativo. Com `admin_global`, checkbox + select controlam o escopo. Global não grava `id_setor` (removido no update via `deleteField`).
- Validação: `npm run build` OK; `npm run lint` OK; `npm run test:unit` OK; testes de regras (Docker) OK.
- Pendências: deploy de `functions`/`storage.rules` em produção segue na pendência única (Billing/Blaze).

### Spec 23 — Hard cut: capabilities como única base (remover legado) + `cargo` + `arquivo_privado`
- Status: aplicado localmente (emulador); deploy de produção pendente de Billing (functions + storage.rules)
- Resultado:
  - **Contrato `usuarios`:** removidos `nivel_acesso` e `admin_global`; adicionado `cargo` (string de exibição). `capabilities` é a única fonte de autorização.
  - **Contrato `arquivos`:** `nivel_acesso` substituído por `arquivo_privado` (boolean; false=público/nivel_1, true=privado/nivel_2; default false).
  - **Cloud Function:** `extrairClaims` emite apenas `ativo`, `ids_setor`, `caps` (derivado só de `capabilities`); callable autoriza por caps (`biblioteca_gerenciar_setor`|`biblioteca_gerenciar_global`).
  - **Storage Rules:** 100% por `temCap(caps)`; sem legado. Anexo final segue só do solicitante.
  - **Firestore Rules:** removidos `ehAdmin`/`ehAdminGlobal`/fallback legado; `temCap` lê só `capabilities`; `arquivos` usa `ehPrivado(arquivo_privado)`.
  - **Frontend:** contexto expõe `cargo` + `capabilities` (sem `ehAdmin`/`ehAdminGlobal`); `usarSessao` com derivados `pode*` + `podeVerPrivados` + `cargo`; guards por `meta.requerCapability`; biblioteca usa `arquivo_privado` (select Público/Privado) e caminhos `nivel_1|nivel_2`; `destinoDoModulo` por capability.
  - **Seed/scripts:** `seed-emulador` grava `cargo` + `capabilities` e injeta claims `ativo`/`ids_setor`/`caps`; `clonar-arquivos-setores` e `firestore.indexes.json` migrados para `arquivo_privado`.
  - **Testes:** unit (syncClaims caps-only, capabilities, bibliotecaCaminhos por arquivoPrivado, escopoArquivos) e regras (Firestore por capabilities + arquivo_privado, Storage por caps) atualizados; sem referências ao legado.
- Decisões: produção com poucos usuários pode recriar contas no novo padrão (sem script de migração); matriz `capabilitiesDoLegado` permanece só como gerador do mapa inicial no seed.
- Validação: `npm run test:unit` OK (79/79); `npm run build` OK; `eslint` limpo (src/tests/scripts/functions); testes de regras (Docker) OK (140/140); grep sem `nivel_acesso`/`admin_global` residual em código/rules/seed/testes.
- Pendências: deploy de `functions`/`storage.rules` em produção segue na pendência única (Billing/Blaze); recriar os usuários de produção no novo contrato.

### Spec 22 — Capabilities & Claims (migração compatível com legado)
- Status: aplicado localmente (emulador); deploy de produção pendente de Billing (functions + storage.rules)
- Resultado:
  - **Contrato:** campo `usuarios.capabilities` (mapa booleano, 10 chaves oficiais); fonte de verdade da autorização por perfil. Ausência de chave/mapa = false.
  - **Enums:** `src/enums/capabilities.js` (CAP, matriz `capabilitiesDoLegado` §2.2, `capabilitiesParaLista`, `resolverCapabilities`, `temCapability`) e `src/enums/claims.js` (CLAIM). Cópia espelhada da matriz em `functions/claims.js` (pacote isolado de deploy); teste de drift garante paridade.
  - **Cloud Function:** `extrairClaims` passa a emitir `caps: string[]` (capabilities do doc quando presentes, senão derivadas do legado), junto de `ativo`/`ids_setor` + legado `nivel_acesso`/`admin_global`.
  - **Storage Rules:** autorização por `temCap(cap)` sobre a claim `caps` (biblioteca: ler_publicos/ler_privados/gerenciar_setor; global: gerenciar_global; solicitações: agir_setor). Sem fallback legado no Storage (a Function garante `caps`). Anexo final segue legível só pelo solicitante.
  - **Firestore Rules:** helpers `capTrue`/`capLegado`/`temCap` (usa `capabilities` do doc; fallback legado quando ausente). Migrados `arquivos` (read/create/update/delete + auditoria) e `solicitacoes` (read/create/update + auditoria) — incluindo `solicitacoes_criar` só para quem tem a capability.
  - **Frontend:** `contexto.capabilities` via `resolverCapabilities`; derivados em `usarSessao` (`podeGerenciarBibliotecaSetor/Global`, `podeVer/AgirSolicitacoesSetor`, `podeCriarSolicitacao`); rotas admin usam `meta.requerCapability` e o guard migra de `requerAdmin` para capabilities.
  - **Seed:** `usuarios.capabilities` e claim `caps[]` preenchidos pela matriz do legado.
  - **Testes:** unit de capabilities (helpers + drift guard frontend↔functions) e de `caps` no `syncClaims`; storage.test em `caps[]`; arquivos/solicitacoes rules com `capabilities` no seed + bloqueio de `solicitacoes_criar` para admin.
- Decisões: legado (`nivel_acesso`/`admin_global`) mantido nesta spec (hard cut é a Spec 23); matriz duplicada em 3 formas (frontend JS, functions JS, rules CEL) por limite de arquitetura do Firebase, com teste de drift entre as duas cópias JS.
- Validação: `npm run test:unit` OK (87/87); `npm run build` OK; `eslint` limpo (src/tests/scripts/functions); testes de regras (Docker) OK (140/140).
- Pendências: deploy de `functions`/`storage.rules` em produção segue na pendência única (Billing/Blaze).

### Spec 21 — Solicitações: auditoria `anexo_visualizado` (após download com sucesso)
- Status: aplicado (frontend + rules; sem Cloud Functions)
- Resultado:
  - **Auditoria:** nova ação `anexo_visualizado` (append-only) em `solicitacoes/{id}/auditoria`, gravada pelo solicitante **após** baixar com sucesso o anexo final; payload padrão (`acao`, `id_usuario`, `status_anterior=status_novo='concluida'`, `data`).
  - **Fonte única:** módulo puro `src/enums/acoesAuditoria.js` (`ACAO_AUDITORIA`, `ROTULOS_ACAO_AUDITORIA`, `rotuloAcaoAuditoria`), reexportado por `solicitacoes.js` e usado nas duas telas de detalhe (solicitante e admin) — removidos os mapas locais duplicados.
  - **Fluxo:** `registrarAnexoVisualizado(solicitacao, idUsuario)` só registra com `status=='concluida'` e `id_nuvem` preenchido; em `PaginaSolicitacaoDetalhe.vue`, `baixar()` mantém o GA4 de intenção, baixa via `baixarAnexoFinal`, e **só após sucesso** registra a auditoria, atualiza o histórico e baixa o blob (falha de auditoria não impede o download).
  - **Rules:** `create` da auditoria passa a ramificar por `acao`: `anexo_visualizado` exige solicitante + solicitação pai `concluida` + `id_nuvem != ''` + `status_anterior==status_novo=='concluida'`; demais ações mantêm solicitante OU admin do setor, sempre com `id_usuario == uid`.
  - **UI:** histórico exibe "Anexo visualizado".
  - **Testes:** rules A–F em `tests/regras/solicitacoes.test.js` (seeds `sol_concluida` com `id_nuvem` e `sol_concluida_sem_anexo`); unit do rótulo em `tests/unit/acoesAuditoria.test.js`.
- Decisões: sem mudar contrato de Storage (admin não lê o anexo); sem coleção nova; sem campos novos em `solicitacoes`.
- Validação: `npm run test:unit` OK (72/72); `npm run build` OK; `eslint src/ tests/` limpo; testes de regras (Docker) OK (139/139).
- Pendências: nenhuma (fluxo independe de Billing).

### Spec 20 — Primeiro acesso: troca obrigatória de senha (flag `primeiro_acesso`)
- Status: aplicado (frontend + rules; sem Cloud Functions)
- Resultado:
  - **Contrato de dados:** campo `usuarios.primeiro_acesso` (booleano); ausência em legados = `false`.
  - **Firestore Rules:** única exceção de escrita em `usuarios` — o próprio usuário troca `primeiro_acesso` de `true → false` no seu documento; `affectedKeys().hasOnly(['primeiro_acesso'])` garante que nenhum outro campo (inclusive adicionado) muda; `create`/`delete` seguem negados.
  - **Backend/sessão:** `repositorioAutenticacao.marcarPrimeiroAcessoConcluido(uid)` (`updateDoc`); caso de uso `concluirPrimeiroAcesso(uid)`; `primeiro_acesso` exposto no contexto (`autenticacao.js`) e derivado `primeiroAcesso` em `usarSessao.js`.
  - **Navegação:** helper puro `src/router/primeiroAcesso.js` (`avaliarPrimeiroAcesso` + `ROTAS_PRIMEIRO_ACESSO`); guard em `guards.js` libera só `alterar-senha` e `perfil` enquanto `primeiro_acesso == true`, redirecionando o resto para `alterar-senha`.
  - **UI:** `App.vue` esconde a barra inferior; `PaginaAlterarSenha.vue` e `PaginaPerfil.vue` ocultam o "← Voltar"; ao trocar a senha com sucesso no primeiro acesso, marca `primeiro_acesso=false`, encerra a sessão e volta ao `login`.
  - **Testes:** cenários de rules A–E em `tests/regras/arquivos.test.js` (seed do usuário com `primeiro_acesso: true`); unit do helper em `tests/unit/primeiroAcesso.test.js`. Ajuste: `test:unit` passa a descobrir os testes por glob (`tests/unit/**/*.test.js`) para compatibilidade com Node 22.
- Decisões: sem Cloud Functions; seed padrão não é alterado (teste manual seta o campo); `changedKeys()` trocado por `affectedKeys()` nas rules para também bloquear campos adicionados.
- Validação: `npm run test:unit` OK (68/68); `npm run build` OK; `eslint src/` OK; testes de regras (Docker) OK (133/133).
- Pendências: nenhuma (fluxo independe de Billing).

### Spec 19 — UI Motion (animações leves e padronizadas)
- Status: aplicado (produção)
- Resultado:
  - Tokens de motion em `src/componentes/tokens.css` (`--dur-1/2/3`, `--ease-standard/emphasized`, `--motion-y`, `--motion-scale`) e classes reutilizáveis `fade`, `fade-slide-up`, `modal-pop`, `route-fade` (só `opacity/transform`).
  - `prefers-reduced-motion: reduce` global (durações ~1ms + remove transform).
  - Aplicação: modal (`ModalConfirmacao.vue`) com backdrop `fade` + caixa `modal-pop`; modal de saída em `App.vue`; feedback (`MensagemFeedback.vue`) com `fade-slide-up`; loading (`EstadoCarregando.vue`) com `fade`; transição de rota no `App.vue`.
- Ajustes pós-implementação (ver §9 da spec):
  - `route-fade` tornada **enter-only** (removida animação de saída): a tela anterior desmontava visível durante o fade-out (campos limpando/layout quebrando). Agora só a tela que chega faz fade-in.
  - Flash "vazio → carrega → preenchido" em formulários de edição corrigido: `carregandoInicial` nasce `true` em modo edição (`ref(!!route.params.id)`) em `PaginaArquivoForm.vue` e `PaginaSolicitacaoForm.vue`.
- Decisões: sem novas dependências; sem `TransitionGroup` item-a-item em listas (risco de jank); sem mudança de contrato/rotas/regras.
- Validação: `npm run build` OK; `npm run lint` OK; `prettier --check` OK nos arquivos tocados.
- Pendências: nenhuma

### Spec 17 — Custom Claims + hardening de Rules (Firestore/Storage) + sync via Cloud Functions
- Status: aplicado localmente (emulador); deploy de produção pendente de Billing
- Resultado:
  - **Firestore hardening:** solicitação já assumida só pode ser alterada pelo responsável que assumiu (Spec 17 §2.1); novos testes em `tests/regras/solicitacoes.test.js`.
  - **Storage hardening com claims:** `storage.rules` passam a exigir custom claims (`ativo`, `nivel_acesso`, `ids_setor`); Biblioteca por setor/perfil (nível 2 só admin); resposta final de Solicitações legível **somente pelo solicitante** (Spec 17 §2.2) e gravável só por admin do setor; validação MIME/tamanho mantida.
  - **Cloud Function:** `functions/syncClaimsFromUsuario` (callable) espelha `usuarios/{uid}` → claims; autoriza qualquer admin ativo (política A).
  - **Frontend/sessão:** `onIdTokenChanged` + leitura de claims (`getIdTokenResult`) + utilitário de refresh e wrapper da callable (`repositorioAutenticacao.js`, `usarSessao.js`).
  - **Seeder:** `scripts/seed-emulador.mjs` injeta os claims no Auth emulator (REST `accounts:update`), para o dev rodar com as MESMAS rules de produção.
  - **Testes:** `tests/regras/storage.test.js` reescrito simulando claims (admin/comum/solicitante/inativo e setores).
  - **Docs:** `docs/guias/claims-e-sincronizacao.md` (claims, sync, refresh, debug, melhoria futura).
- Decisões humanas: D1 implementar Functions (Billing em breve); D2 qualquer admin sincroniza qualquer uid (melhoria futura registrada); D3 rules endurecidas únicas (prod=dev) + seeder injeta claims (dados locais podem ser recriados).
- Validação: `npm run test:unit` OK; testes de regras (Docker) OK; `npm run build` OK.
- Pendências: deploy de `functions` e publicação das `storage.rules` em produção seguem na pendência única (Billing/Blaze); melhoria futura: restringir sync por setor do admin executor.

### Mudança pós-Sprint — Infra de arquivos
- Status: aplicado
- Resultado: camada mock removida; infra de arquivos (upload/download/remoção) usa o SDK real do Storage contra o **Storage emulator** local (modo `emulador`); flag única `VITE_APP_MODE` (`emulador` | `producao`) substitui `VITE_USE_EMULATORS` + `VITE_FILE_INFRA`
- Segurança: escrita de arquivos restrita a admin pelo Firestore (server-side) + UI (guard/`v-if`); `storage.rules` liberam escrita a qualquer autenticado (sem custom claims)
- Validação: `npm run build` OK; `eslint src/` OK
- Pendências: Storage de **produção** e regras pendentes de Billing (não concluído); autorização fina de admin no Storage (custom claims / `firestore.get()`) adiada; ver `docs/specs/spec-11-melhoria-infraestrutura-local.md`

---

## Última atualização
- Data: 2026-10-20
- Responsável: Kiro
- Status: concluído

### Resumo
- Objetivo: aplicar a Spec 23 (hard cut) — remover o legado `nivel_acesso`/`admin_global` de todo o projeto; `usuarios` ganha `cargo` (exibição); `arquivos.nivel_acesso` vira `arquivo_privado` (boolean); autorização 100% por capabilities (Firestore) e `caps` (Storage).
- Resultado: claims finais `ativo`/`ids_setor`/`caps`; rules, Function, frontend, seed, scripts, índices e testes migrados; documentação sem o legado. Sem referência residual a `nivel_acesso`/`admin_global` em código/rules/seed/testes.

### Validação
- `npm run test:unit` OK (79/79)
- `npm run build` OK; `eslint` limpo (src/tests/scripts/functions)
- Testes de regras (Docker) OK (140/140)

### Pendências
- Cloud Storage em produção + Billing/Blaze (deploy de `functions` e publicação de `storage.rules`); recriar os usuários de produção no novo contrato (`cargo` + `capabilities`)

### Bloqueios
- Ativação de Billing/Blaze depende do responsável (fora do alcance do agente)

---

## Histórico por lote

> Nota: os Lotes 1–9 abaixo são **registro histórico** das Sprints 1 e 2. Itens
> então marcados como pendentes — regras Firestore de produção, deploy/Hosting,
> Authentication e a antiga camada mock de arquivos — foram **resolvidos** por
> specs posteriores (11 a 16) e pela publicação em produção. A camada mock foi
> removida (ver "Mudança pós-Sprint — Infra de arquivos"). A única pendência
> viva do projeto é o Cloud Storage em produção (Billing), descrita no topo.

### Lote 1 — Fundação executável do projeto
- Status: concluído
- Resultado: setup Vue + Firebase, emuladores, regras e índices versionados
- Validação: `npm install` e `npm run build` OK
- Pendências: nenhuma

### Lote 2 — Design system base utilizável
- Status: concluído
- Resultado: tokens + botão, input, select, textarea, card, cabeçalho, container, badge de status, loading, empty, feedback, modal e uploader
- Validação: compile-check dos SFCs e `npm run build` OK
- Pendências: nenhuma

### Lote 3 — Autenticação, sessão e contexto operacional
- Status: concluído
- Resultado: login/logout, carregamento do doc `usuarios`, resolução de nivel_acesso/ativo/ids_setor, guards por auth e papel, setor ativo do admin persistido
- Validação: compile-check e `npm run build` OK
- Pendências: validação em emuladores (Auth+Firestore) por execução manual

### Lote 4 — Biblioteca de consulta
- Status: parcial-operacional (mock de arquivos)
- Resultado: listagem por perfil/setor, filtro por tipo, ordenação por atualização, detalhe e download simulado; sinalização público/restrito para admin
- Validação: compile-check e `npm run build` OK
- Pendências: download/Storage reais e regras de Storage (Billing)

### Lote 5 — Biblioteca administrativa, auditoria e segurança da sprint
- Status: parcial-operacional (mock de arquivos; Firestore/regras/testes concluídos)
- Resultado: cadastro/edição/substituição/remoção (admin), auditoria mínima em subcoleção, regras Firestore reais para usuarios/arquivos
- Validação: `npm run build` OK; testes de regras Firestore no emulador (Docker) 20/20 pass
- Pendências: Storage real, regras de Storage e upload/download reais (Billing)

### Lote 6 — Solicitações do usuário
- Status: parcial (fluxo/UI/Firestore via emulador)
- Resultado: nova/editar/cancelar em_aberto, listagem própria, detalhe com histórico mínimo, download final quando concluida
- Validação: compile-check e `npm run build` OK
- Pendências: regras Firestore de `solicitacoes` (Lote 8); anexo final via mock (Storage)

### Lote 7 — Fila administrativa e tratamento das solicitações
- Status: parcial (fluxo/UI/Firestore via emulador)
- Resultado: fila por setor ativo + filtro status, assumir com transação, comentário, anexo final (mock), concluir e cancelar com transições válidas, responsável/datas e histórico
- Validação: compile-check e `npm run build` OK
- Pendências: regras Firestore de `solicitacoes` (Lote 8); anexo final via mock (Storage)

### Lote 8 — Segurança, auditoria e testes críticos do domínio de Solicitações
- Status: parcial (Firestore/regras/testes concluídos; Storage pendente)
- Resultado: regras Firestore reais de `solicitacoes` (leitura por perfil/setor, criação com estado inicial, transições válidas de status, auditoria); regressão de Biblioteca checada
- Validação: testes de regras no emulador (Docker) 42/42 pass; `npm run build` OK
- Pendências: regras de Storage e upload/download reais (Billing)

### Lote 9 — Publicação e piloto inicial
- Status: concluído (publicado em produção)
- Resultado: guia passo a passo (`docs/guias/guia-publicacao-piloto.md`), indicadores, seed de dados e script de emulador; Hosting, Firestore (regras/índices) e Authentication publicados e funcionais em produção
- Validação: `npm run build` OK (gera dist/); Hosting/Firestore/Auth operando em produção
- Pendências: apenas Cloud Storage em produção (Billing) — ver "Pendência única" no topo

---

## Regras de atualização pelo Kiro
Ao concluir um lote:
1. atualizar `Estado atual`;
2. preencher `Última atualização`;
3. registrar o lote no `Histórico por lote`;
4. mover o próximo lote para `Lote atual`, se aplicável;
5. manter escrita curta, factual e escaneável.

### Formato obrigatório
Usar frases curtas.

Exemplo:
- Status: concluído
- Resultado: setup inicial criado e Firebase configurado
- Validação: app sobe localmente e emuladores iniciam
- Pendências: ajustar `.env.example`

### Proibições
Não escrever:
- raciocínio longo;
- justificativas extensas;
- resumo de documentos;
- promessas futuras vagas;
- texto promocional sobre o que foi feito.