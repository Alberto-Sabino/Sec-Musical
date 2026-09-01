# Spec 06 — Solicitações do usuário: criação, acompanhamento, edição, cancelamento e download

## Objetivo
Permitir que o Encarregado abra e acompanhe solicitações operacionais dentro do portal, substituindo mensagens dispersas por um fluxo simples e rastreável.

## Atores
- Usuário

---

## Escopo desta spec
Inclui:
- tela de nova solicitação;
- listagem das próprias solicitações;
- detalhe da solicitação;
- edição enquanto `em_aberto`;
- cancelamento enquanto `em_aberto`;
- download do anexo final quando `concluida`.

Não inclui:
- envio de arquivo pelo usuário na abertura da solicitação;
- múltiplos anexos;
- comentários internos separados;
- workflow avançado de aprovação.

---

## Campos mínimos de criação
- `tipo`
- `comentario`, quando aplicável dentro do limite

Campos de sistema:
- `id_setor`
- `id_solicitante`
- `status = em_aberto`
- `id_responsavel = vazio`
- `id_nuvem = vazio`
- `data_solicitacao`
- `data_atualizacao`

---

## Regras de acesso
- o usuário vê apenas solicitações em que `id_solicitante` é ele mesmo;
- pode editar somente enquanto o status atual for `em_aberto`;
- pode cancelar somente enquanto o status atual for `em_aberto`;
- pode baixar o anexo final apenas quando a solicitação estiver `concluida`.

---

## Fluxo de criação
1. Usuário acessa a tela de nova solicitação.
2. Escolhe o tipo e preenche os campos visíveis.
3. O sistema grava a solicitação com o contexto do usuário.
4. A solicitação nasce em `em_aberto`.
5. Ela passa a aparecer na lista do próprio usuário.

---

## Fluxo de acompanhamento
- o usuário acessa `minhas solicitações`;
- visualiza a lista em ordem recente;
- abre uma solicitação para consultar status e informações principais;
- se estiver concluída, pode baixar o anexo final.

---

## Fluxo de edição
- permitido apenas em `em_aberto`;
- não pode definir `id_responsavel`;
- não pode anexar `id_nuvem`;
- não pode mudar para `em_andamento` nem `concluida`.

---

## Fluxo de cancelamento
- permitido apenas em `em_aberto`;
- o novo status passa a ser `cancelada`;
- a solicitação encerra o fluxo do ponto de vista do usuário.

---

## Estados importantes
- carregando lista
- sem solicitações
- criando solicitação
- solicitação criada com sucesso
- erro ao criar
- detalhe carregando
- edição bloqueada por status
- download disponível

---

## Regras de UX mínimas
- o usuário deve entender facilmente em que etapa a solicitação está;
- os status devem ser claros e visíveis;
- editar e cancelar só aparecem quando permitido;
- a lista deve ser simples para uso em celular;
- o download final deve ficar evidente quando houver resposta.

---

## Critérios de aceite
- o usuário cria uma solicitação com `status = em_aberto`;
- a solicitação fica associada ao setor do usuário;
- a listagem mostra apenas solicitações próprias;
- edição funciona somente em `em_aberto`;
- cancelamento funciona somente em `em_aberto`;
- o anexo final só pode ser baixado em `concluida`;
- o fluxo é legível e funcional no celular.

---

## Dependências
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first

---

## Diretriz final
A experiência do Usuário deve transformar um processo hoje difuso em algo **simples, previsível e tranquilizador**, com o mínimo de passos e o máximo de clareza.