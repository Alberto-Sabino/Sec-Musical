# Spec 21 — Solicitações: auditoria “anexo_visualizado” (após download com sucesso)

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-20  
**Objetivo:** registrar auditoria real (append-only) quando o solicitante baixar com sucesso o anexo final (`resposta.pdf`) de uma solicitação concluída.

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

---

## 0) Decisões fixas (não negociar)

1) O evento é registrado como **novo documento** em:
- `solicitacoes/{id_solicitacao}/auditoria/{autoId}`

2) Nome canônico da ação:
- `acao = 'anexo_visualizado'`

3) Payload completo (mesmo padrão dos demais):
- `acao`
- `id_usuario`
- `status_anterior`
- `status_novo`
- `data`

4) Analytics (GA4) registra **intenção** no clique (já existe `SOLICITACOES_BAIXAR_ANEXO`).  
A auditoria registra **somente após download com sucesso**.

5) Só registrar se:
- solicitação estiver `status == 'concluida'`
- e `id_nuvem` estiver preenchido (não vazio)

6) Somente o **solicitante** pode escrever esse registro.

---

## 1) Escopo desta spec

### 1.1 Inclui
- adicionar registro de auditoria após download bem-sucedido do anexo final;
- endurecer Firestore Rules para bloquear escrita indevida (status != concluida, id_nuvem vazio, usuário não-dono);
- atualizar UI para exibir “Anexo visualizado” no histórico;
- atualizar/adicionar testes de rules e unitários necessários;
- atualizar documentação impactada para refletir o estado real.

### 1.2 Não inclui
- notificações (“sininho”);
- permitir que admin leia o anexo (continua proibido por decisão de Storage);
- múltiplos anexos.

---

## 2) Implementação — Frontend (fluxo)

### 2.1 Onde disparar
Tela: `src/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue`

Hoje o clique em baixar já dispara GA4 antes do download. Manter isso.

Alterar o fluxo para:
1) disparar GA4 `SOLICITACOES_BAIXAR_ANEXO` (intenção) — **já existe**;
2) tentar baixar via `baixarAnexoFinal(solicitacao)` (caso de uso);
3) **somente se sucesso**:
   - registrar auditoria `anexo_visualizado` via caso de uso (novo);
4) baixar o blob no navegador.

> Importante: a auditoria deve ocorrer **após** o download ter retornado bytes com sucesso (sem exception).

### 2.2 Caso de uso
Adicionar no domínio de Solicitações:
- `src/servicos/casos_de_uso/solicitacoes.js`

Criar função:
- `registrarAnexoVisualizado(solicitacao, idUsuario)` (nome pode variar, mas deve ser explícito)

Regras:
- validar `solicitacao.status == 'concluida'`;
- validar `solicitacao.id_nuvem` não vazio;
- chamar `repositorioSolicitacoes.registrarAuditoria(...)` com:
  - `acao: 'anexo_visualizado'`
  - `id_usuario: idUsuario`
  - `status_anterior: solicitacao.status`
  - `status_novo: solicitacao.status`

### 2.3 Repositório
Reaproveitar `src/servicos/repositorios/repositorioSolicitacoes.js`:
- já existe `registrarAuditoria(idSolicitacao, dados)` que grava `acao`, `id_usuario`, `status_*` e `data=serverTimestamp()`.

Não criar coleção nova.

---

## 3) Firestore Rules (endurecer auditoria)

Arquivo: `firestore.rules`

Na subcoleção:
- `solicitacoes/{id}/auditoria/{idAud}`

Endurecer para o caso `acao == 'anexo_visualizado'`:

Permitir `create` somente se:
- autenticado e ativo;
- `request.resource.data.id_usuario == request.auth.uid`;
- o usuário é o **solicitante** da solicitação pai:
  - `get(/databases/$(database)/documents/solicitacoes/$(id)).data.id_solicitante == request.auth.uid`
- a solicitação pai está concluída:
  - `status == 'concluida'`
- a solicitação pai tem `id_nuvem` preenchido (não vazio)
- `status_anterior == status_novo == 'concluida'` (ou igual ao status atual)

E negar por padrão qualquer outra escrita indevida.

> Observação: esta regra é “defesa em profundidade”. A UI já não mostra botão sem `id_nuvem`, mas a regra deve bloquear mesmo assim.

---

## 4) UI — exibição do histórico

Onde quer que o histórico de auditoria seja exibido (tela de detalhe do solicitante e/ou admin), mapear:
- `acao == 'anexo_visualizado'` → rótulo “Anexo visualizado”.

Não inventar novo componente; seguir padrão existente de histórico.

---

## 5) Testes (obrigatório)

### 5.1 Tests de rules (Firestore)
Arquivo recomendado: `tests/regras/solicitacoes.test.js`

Adicionar cenários:

A) **permitido**: solicitante cria auditoria `anexo_visualizado` quando a solicitação está `concluida` e `id_nuvem` não vazio.  
B) **bloqueado**: solicitante tenta criar `anexo_visualizado` quando status != `concluida`.  
C) **bloqueado**: solicitante tenta criar `anexo_visualizado` com `id_nuvem` vazio.  
D) **bloqueado**: outro usuário tenta criar auditoria na solicitação alheia.  
E) **bloqueado**: admin tenta criar `anexo_visualizado` (não é solicitante).  
F) **bloqueado**: solicitante tenta forjar `id_usuario` diferente do próprio.

> Ajustar o seed do teste para criar uma solicitação concluída com `id_nuvem` preenchido.

### 5.2 Testes unitários
Adicionar teste unitário para o mapeamento de rótulo da auditoria (helper puro), se existir um mapa central.  
Se não existir, criar um helper puro em `src/servicos/casos_de_uso/solicitacoes.js` (ex.: `rotuloAcaoAuditoria`) e cobrir em `tests/unit/`.

---

## 6) Documentação (obrigatório — refletir estado real)

Atualizar:
1) `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`:
   - registrar que existe auditoria “anexo_visualizado” (append-only) em Solicitações.

2) `docs/steering/steering-03.md`:
   - se houver lista de ações/auditoria, incluir a nova ação (ou ao menos registrar que auditoria inclui eventos de visualização).

3) `docs/decisoes/status-execucao.md`:
   - registrar o resultado (curto e factual).

---

## 7) Critérios de aceite

- [ ] Ao clicar em “Baixar anexo”, o GA4 registra intenção (evento já existente).
- [ ] Se o download falhar, **não** registra auditoria `anexo_visualizado`.
- [ ] Se o download tiver sucesso, registra **um novo** documento de auditoria com:
  - `acao='anexo_visualizado'`
  - `id_usuario` do solicitante
  - `status_anterior == status_novo == 'concluida'`
  - `data` via `serverTimestamp()`
- [ ] Firestore Rules bloqueiam tentativa de registrar:
  - em solicitação não concluída,
  - com `id_nuvem` vazio,
  - por usuário que não é o solicitante,
  - com `id_usuario` forjado.
- [ ] UI exibe “Anexo visualizado” no histórico.
- [ ] Testes:
  - [ ] `npm run test:unit` passa
  - [ ] `npm run test:rules` passa

---

## 8) Stop conditions (parar e pedir confirmação humana)

Parar se precisar:
- mudar o contrato de Storage (quem lê o anexo);
- permitir que admin leia o anexo;
- criar coleção nova para auditoria;
- criar campos novos em `solicitacoes` para contornar auditoria.
