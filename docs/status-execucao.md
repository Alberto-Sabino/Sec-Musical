# Status de Execução — Portal Musical MVP

## Regra de uso
Atualizar este arquivo ao final de cada lote, de forma curta e objetiva.

Não escrever relatórios longos.
Não repetir contexto já documentado.
Não registrar intenção como se fosse entrega concluída.

---

## Estado atual
- Fase ativa: **Sprint 3 concluída** (Specs 13, 14, 15 e 16 aplicadas) + Analytics GA4
- Ambiente de produção: **funcional** — Hosting, Firestore, Authentication configurados e operando em produção
- Sprints anteriores: Sprint 1 (Spec 09) e Sprint 2 (Spec 10) concluídas; ajustes Spec 11 e Spec 12 aplicados
- Status geral: MVP funcional em produção
- **Única pendência aberta:** configuração do **Cloud Storage em produção**, que depende da ativação da **Conta Billing (plano Blaze)**. Enquanto isso, operações de arquivo (upload/download/remoção) rodam contra o **Storage emulator** local em modo `emulador`.

### Pendência única (aberta)
- **Cloud Storage em produção (Billing/Blaze):** habilitar Billing, publicar `storage.rules` em produção e validar upload/download reais. Inclui a validação do **envio real de e-mail de redefinição de senha** (depende do mesmo ambiente de produção com template do Firebase Auth). Tudo mais já está funcional em produção.

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
- Resultado: instrumentação GA4 com fonte única de nomes (`src/enums/eventosAnalytics.js`) e disparo central `dispararEvento` (`src/servicos/firebase/analytics.js`); rastreio de navegação por tela (`src/servicos/casos_de_uso/analyticsNavegacao.js`, integrado ao `router/guards.js`); eventos de conversão/conclusão de fluxo; documentação em `docs/analytics-eventos.md`
- Comportamento: só envia dados quando `VITE_APP_MODE=producao`; em `emulador` os eventos são ignorados silenciosamente (sem chamadas de rede)
- Validação: `npm run build` OK; `npm run test:unit` OK (`tests/unit/analyticsNavegacao.test.js`)
- Pendências: nenhuma

### Spec 16 — Autenticação: senha e perfil do usuário
- Status: aplicado (produção)
- Resultado: fluxos "Esqueci minha senha" (rota pública), "Redefinir senha" via link do e-mail (rota pública, `verifyPasswordResetCode` + `confirmPasswordReset`) e "Alterar senha" (rota autenticada, `reauthenticateWithCredential` + `updatePassword`); tela de perfil "Minhas informações" (rota `perfil`) com dados cadastrais + ações Alterar senha/Sair, acessível por ícone de conta na Início; `sendPasswordResetEmail` com `actionCodeSettings.url` retornando à aplicação; `celular` exposto no contexto; regras/mensagens de senha centralizadas em `src/servicos/casos_de_uso/senha.js`; prop opcional `voltar` no `CabecalhoPagina`
- Segurança: campos `type="password"`; mensagens genéricas; resposta anti-enumeração no envio de redefinição; `alterar-senha` exige sessão + reautenticação
- Validação: `npm run lint` OK; `npm run test:unit` OK (regras puras de senha); `npm run build` OK
- Pendências: validação do envio real de e-mail de redefinição consolidada junto à pendência única (produção com Billing e template de e-mail do Firebase); ver `docs/specs/spec-16-autenticacao-senha.md`

### Mudança pós-Sprint — Infra de arquivos
- Status: aplicado
- Resultado: camada mock removida; infra de arquivos (upload/download/remoção) usa o SDK real do Storage contra o **Storage emulator** local (modo `emulador`); flag única `VITE_APP_MODE` (`emulador` | `producao`) substitui `VITE_USE_EMULATORS` + `VITE_FILE_INFRA`
- Segurança: escrita de arquivos restrita a admin pelo Firestore (server-side) + UI (guard/`v-if`); `storage.rules` liberam escrita a qualquer autenticado (sem custom claims)
- Validação: `npm run build` OK; `eslint src/` OK
- Pendências: Storage de **produção** e regras pendentes de Billing (não concluído); autorização fina de admin no Storage (custom claims / `firestore.get()`) adiada; ver `docs/specs/spec-11-melhoria-infraestrutura-local.md`

---

## Última atualização
- Data: 2026-09-30
- Responsável: Kiro
- Status: concluído

### Resumo
- Objetivo: sincronizar o status com a fase real do projeto; registrar Specs 13, 14, 15, 16 e Analytics; remover pendências já resolvidas; deixar explícita a única pendência aberta.
- Resultado: fase atual documentada como **Sprint 3 concluída + Analytics**, com produção funcional (Hosting, Firestore, Authentication). Pendências de deploy, regras Firestore de produção e fluxo de solicitações — antes listadas nos lotes — estão **resolvidas**. Permanece **uma única pendência**: Cloud Storage em produção, dependente da ativação da Conta Billing (Blaze).

### Validação
- `npm run build` OK
- `npm run lint` OK
- `npm run test:unit` OK (49/49)

### Pendências
- Cloud Storage em produção + Billing/Blaze (inclui validação do e-mail real de redefinição de senha)

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
- Resultado: guia passo a passo (`docs/guia-publicacao-piloto.md`), indicadores, seed de dados e script de emulador; Hosting, Firestore (regras/índices) e Authentication publicados e funcionais em produção
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