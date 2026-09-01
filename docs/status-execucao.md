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
- Status geral: em andamento
- Nota: Spec 09 fechada em modo parcial-operacional (pendência conhecida e aceita: Storage/Billing, restrita a arquivos)

---

## Última atualização
- Data: 2026-08-31
- Responsável: Kiro
- Status: concluído

### Resumo
- Objetivo: exibir nome do setor (não o id); ajustes de lista; seed do piloto.
- Resultado: nome do setor em toda a UI; regra de leitura de `setores`; seed com Cachoeira/Queluz.

### Arquivos impactados
- src/servicos/repositorios/repositorioSetores.js (novo)
- src/composables/usarSessao.js (nomesSetores, nomeSetorAtivo, opcoesSetor)
- src/app/PaginaInicial.vue, biblioteca/fila/forms (subtítulos com nome do setor)
- firestore.rules (regra de leitura de `setores`)
- tests/regras/arquivos.test.js (testes de `setores`)
- scripts/seed-emulador.mjs (setores/usuários do piloto)
- docs mestre e steering-03 (regra de `setores`)

### Nova regra de segurança (aprovada)
- `setores`: leitura por usuário autenticado+ativo que pertence ao setor; escrita negada. Documentada no mestre e steering-03.

### Validação
- Testes de regras (Docker): 47/47 pass
- `npm run build` OK
- Emulador recarregou as regras ("Rules updated")

### Pendências
- deploy real e Storage real: pendentes (Billing)

### Ambiente local controlado
- Emuladores via Docker; app no host (Vite). Seed atualizado:
  - setores: Cachoeira Paulista - SP, Queluz - SP
  - admins: admin.cachoeira (Cachoeira), admin.geral (Cachoeira+Queluz)
  - comuns: alberto/jamilton (Cachoeira), rubens (Queluz) — senha `senha123`
- Guia: `docs/ambiente-local.md`.

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