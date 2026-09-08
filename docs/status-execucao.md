# Status de Execução — Portal Musical MVP

## Regra de uso
Atualizar este arquivo ao final de cada lote, de forma curta e objetiva.

Não escrever relatórios longos.
Não repetir contexto já documentado.
Não registrar intenção como se fosse entrega concluída.

---

## Estado atual
- Fase ativa: Sprint 2
- Spec ativa: `docs/specs/spec-10-execucao-operacional-sprint-2.md`
- Lote atual: Lote 9 (preparado; publicação manual pelo responsável)
- Atividade recente: Spec 12 — Ajuste de tipos e campo `comum_congregacao` (contrato + regra de segurança + seed)
- Status geral: em andamento
- Nota: Spec 09 fechada em modo parcial-operacional (pendência conhecida e aceita: Storage/Billing, restrita a arquivos)

### Mudança pós-Sprint — Infra de arquivos
- Status: aplicado
- Resultado: camada mock removida; infra de arquivos (upload/download/remoção) usa o SDK real do Storage contra o **Storage emulator** local (modo `emulador`); flag única `VITE_APP_MODE` (`emulador` | `producao`) substitui `VITE_USE_EMULATORS` + `VITE_FILE_INFRA`
- Segurança: escrita de arquivos restrita a admin pelo Firestore (server-side) + UI (guard/`v-if`); `storage.rules` liberam escrita a qualquer autenticado (sem custom claims)
- Validação: `npm run build` OK; `eslint src/` OK
- Pendências: Storage de **produção** e regras pendentes de Billing (não concluído); autorização fina de admin no Storage (custom claims / `firestore.get()`) adiada; ver `docs/specs/spec-11-melhoria-infraestrutura-local.md`

---

## Última atualização
- Data: 2026-09-08
- Responsável: Kiro
- Status: concluído

### Resumo
- Objetivo: revisar tipos (arquivo/solicitação); incluir `comum_congregacao`; atualizar seed.
- Resultado: novos tipos oficiais; campo `comum_congregacao` em `usuarios`/`solicitacoes` (obrigatório, denormalizado, imutável) com regra de segurança; seed sem arquivos e com novos usuários. Ver `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`.

### Arquivos impactados
- src/servicos/casos_de_uso/biblioteca.js (TIPOS_ARQUIVO)
- src/servicos/casos_de_uso/solicitacoes.js (TIPOS_SOLICITACAO; validação comum)
- src/servicos/casos_de_uso/autenticacao.js (comum_congregacao no contexto)
- src/servicos/repositorios/repositorioSolicitacoes.js (grava comum_congregacao)
- src/modulos/solicitacoes/PaginaSolicitacaoForm.vue (envio + exibição)
- src/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue, admin/PaginaFilaDetalhe.vue, admin/PaginaFilaSolicitacoes.vue (exibição)
- firestore.rules (validação/imutabilidade de comum_congregacao)
- scripts/seed-emulador.mjs (remoção de arquivos; novos usuários; log)
- tests/regras/solicitacoes.test.js, tests/regras/arquivos.test.js (novos tipos + casos comum)
- docs mestre, steering-03, piloto-seed-dados, README, spec-12 (nova)

### Nova regra de segurança (aprovada)
- `solicitacoes`: na criação, `comum_congregacao` deve ser string não-vazia e igual a `docUsuario().comum_congregacao`; imutável nos updates de solicitante e admin.

### Validação
- Testes de regras (Docker): 61/61 pass (inclui 3 novos casos de comum_congregacao)
- `npm run build` OK; `eslint` (src, scripts, tests) OK

### Ambiente local controlado
- Seed atualizado (senha `senha123`):
  - secretários: Alberto Sabino da Silva (Cachoeira), Daniel Gomes de Araújo (Cachoeira+Queluz)
  - encarregados: Central, Embaú (Cachoeira), Bairro da Figueira (Queluz)
  - arquivos: não semeados (Biblioteca nasce vazia)

### Pendências
- deploy real e Storage real: pendentes (Billing)

### Bloqueios
- deploy depende de Billing e credenciais do responsável (fora do alcance do agente)

---

## Histórico por lote

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
- Status: preparado (deploy manual pelo responsável)
- Resultado: guia passo a passo (`docs/guia-publicacao-piloto.md`), indicadores, seed de dados e script de emulador; hosting/regras/índices prontos para publicar
- Validação: `npm run build` OK (gera dist/); config de hosting/rewrites conferida
- Pendências: deploy real e criação de dados (Billing/login); Storage real

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