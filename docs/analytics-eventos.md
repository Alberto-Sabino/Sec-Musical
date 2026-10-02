# Analytics — Eventos GA4 do Portal Musical MVP

Este documento descreve os eventos de Google Analytics (GA4) do projeto: onde
são disparados, quais parâmetros carregam e que relatórios podem ser montados no
console — com foco em **conversão** e **conclusão de fluxos**.

Fonte de verdade dos nomes: `src/enums/eventosAnalytics.js`.
Disparo central: `dispararEvento(nome, parametros)` em
`src/servicos/firebase/analytics.js`.

> O analytics só envia dados quando `VITE_APP_MODE=producao`. Em `emulador` os
> eventos são ignorados silenciosamente (nenhuma chamada de rede).

---

## 1. Convenções (padrão GA4)

- Nome de evento e de parâmetro: `snake_case`, no máximo **40 caracteres**.
- Valor de parâmetro (string): no máximo **100 caracteres**.
- Máximo de **25 parâmetros** por evento.
- Estratégia: **poucos nomes de evento + parâmetros**. Variações da mesma ação
  (alvo, etapa, filtro) viram parâmetro, não um novo nome. Isso preserva a
  capacidade de filtro no console via _custom dimension_ e evita truncamento.

---

## 2. Parâmetros

### 2.1 Parâmetros automáticos do GA4

Todo evento recebe automaticamente os parâmetros coletados pela GTAG, entre eles:
`page_location`, `page_referrer`, `page_title`, `ga_session_id`,
`ga_session_number`, `engagement_time_msec`, além de dados de dispositivo,
geografia e origem de tráfego. Não é preciso enviá-los manualmente.

### 2.2 Parâmetros por evento (deste projeto)

Não há um parâmetro custom único enviado em **todos** os eventos. O evento de
tela (`acesso_tela`) tem seu próprio trio padrão (`tela`, `origem`, `destino`).
Os demais eventos carregam parâmetros específicos, descritos na seção 4.

Convém registrar como **custom dimensions** no GA4 os parâmetros usados em
relatórios: `tela`, `origem`, `destino`, `alvo`, `acao`, `tipo`, `status`,
`filtro`, `valor`, `formulario`, `motivo`, `operacao`.

---

## 3. Evento de tela: `acesso_tela`

Disparado automaticamente pelo guard de rota (`src/router/guards.js`,
`router.afterEach`) a cada navegação concluída. Substitui um evento por tela por
**um único evento parametrizado**.

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `tela`    | Identificador da tela de destino (`meta.tela`). | `detalhe_solicitacao` |
| `origem`  | Path normalizado da tela anterior, ou `null` na primeira navegação. | `/biblioteca` |
| `destino` | Path normalizado da tela atual. | `/solicitacoes/#` |

Peculiaridades:

- `origem` e `destino` são **normalizados**: segmentos dinâmicos (ids, tipo) são
  mascarados com `#` e query strings são descartadas
  (`/solicitacoes/42?x=1` → `/solicitacoes/#`). Isso evita expor ids ou dados
  sensíveis e mantém a cardinalidade baixa nos relatórios.
- Valores possíveis de `tela`: ver `TELAS` no enum (login, esqueci_senha,
  redefinir_senha, alterar_senha, perfil, inicio, biblioteca,
  biblioteca_lista_tipo, biblioteca_busca, biblioteca_novo_arquivo,
  biblioteca_editar_arquivo, minhas_solicitacoes, nova_solicitacao,
  detalhe_solicitacao, editar_solicitacao, fila_solicitacoes, fila_detalhe).

---

## 4. Ações (`ACOES`)

### 4.1 Navegação

| Evento | Onde | Parâmetros | Observação |
|--------|------|------------|------------|
| `navegacao_menu` | `BarraInferior` | `alvo` = `inicio` \| `biblioteca` \| `solicitacoes` | Clique na barra inferior. |
| `navegacao_voltar` | `CabecalhoPagina` | `origem` = nome da rota atual | Botão “← Voltar”. |

### 4.2 Home

| Evento | Onde | Parâmetros |
|--------|------|------------|
| `inicio_abrir_perfil` | `PaginaInicial` | — |
| `inicio_abrir_biblioteca` | `PaginaInicial` | — |
| `inicio_abrir_solicitacoes` | `PaginaInicial` | — |

Distinção proposital: abrir Biblioteca/Solicitações **pela home** (cards) é
evento diferente de abrir **pela barra** (`navegacao_menu`). Assim é possível
comparar qual ponto de entrada é mais usado.

### 4.3 Perfil

| Evento | Onde | Parâmetros |
|--------|------|------------|
| `perfil_acao` | `PaginaPerfil` | `acao` = `alterar_senha` \| `sair` |

### 4.4 Biblioteca

| Evento | Onde | Parâmetros |
|--------|------|------------|
| `biblioteca_buscar` | `PaginaBiblioteca` | — |
| `biblioteca_cadastrar_arquivo` | `PaginaBiblioteca` (admin) | — |
| `biblioteca_abrir_arquivo` | `PaginaBibliotecaTipo` | `tipo` |
| `biblioteca_abrir_resultado_busca` | `PaginaBibliotecaBusca` | `tipo` |
| `biblioteca_download` | `DetalheArquivo` | `tipo` |

Peculiaridade: abrir um arquivo **pela lista de tipo** e **pelo resultado da
busca** são eventos distintos (mesma ação, origem diferente). O `biblioteca_download`
marca a **intenção** de baixar; falha real de download emite também
`erro_integracao_firebase` (ver 5.3).

### 4.5 Solicitações

| Evento | Onde | Parâmetros |
|--------|------|------------|
| `solicitacoes_nova` | `PaginaMinhasSolicitacoes` | — |
| `solicitacoes_abrir` | `PaginaMinhasSolicitacoes` | `tipo`, `status` |
| `solicitacoes_abrir_detalhe` | `PaginaFilaSolicitacoes` (admin) | `tipo`, `status` |
| `solicitacoes_editar` | `PaginaSolicitacaoDetalhe` | `tipo` |
| `solicitacoes_salvar_edicao` | `PaginaSolicitacaoForm` | `tipo` |
| `solicitacoes_cancelar` | `PaginaSolicitacaoDetalhe`, `PaginaFilaDetalhe` | `tipo` |
| `solicitacoes_confirmar_cancelar` | `PaginaSolicitacaoDetalhe`, `PaginaFilaDetalhe` | `tipo` |
| `solicitacoes_assumir` | `PaginaFilaDetalhe` (admin) | `tipo` |
| `solicitacoes_selecionar_anexo` | `PaginaFilaDetalhe` (admin) | — |
| `solicitacoes_anexar_arquivo` | `PaginaFilaDetalhe` (admin) | — |
| `solicitacoes_salvar_comentario` | `PaginaFilaDetalhe` (admin) | — |
| `solicitacoes_concluir` | `PaginaFilaDetalhe` (admin) | `tipo` |
| `solicitacoes_baixar_anexo` | `PaginaSolicitacaoDetalhe` | `tipo` |

Peculiaridades:

- `solicitacoes_cancelar` marca a **abertura do modal** de cancelamento;
  `solicitacoes_confirmar_cancelar` marca a **confirmação**. A diferença entre
  os dois mede desistência no cancelamento.
- `solicitacoes_abrir` (usuário) e `solicitacoes_abrir_detalhe` (admin) são
  separados porque representam jornadas diferentes (dono da solicitação vs. fila
  administrativa).

### 4.6 Filtros

| Evento | Onde | Parâmetros |
|--------|------|------------|
| `solicitacoes_filtrar` | `FiltrosSolicitacoes` | `filtro` = `status` \| `tipo`; `valor` |

`valor` recebe o status alternado, o tipo escolhido, ou `todos` quando o tipo é
limpo.

---

## 5. Erros (`ERROS`)

### 5.1 `erro_formulario`

Consolidação de todos os erros de submit de formulário.

| Parâmetro | Valores |
|-----------|---------|
| `formulario` | `biblioteca_novo_arquivo`, `biblioteca_editar_arquivo`, `solicitacao_nova`, `solicitacao_editar`, `solicitacao_concluir`, `alterar_senha`, `login` |
| `motivo` | `validacao`, `integracao`, `credenciais`, ou o motivo de contexto do login (`sem_documento`, `inativo`, `sem_setor`) |

Onde: `PaginaArquivoForm`, `PaginaSolicitacaoForm`, `PaginaFilaDetalhe`
(fluxo concluir), `PaginaLogin`, `PaginaAlterarSenha`.

`motivo` separa erro de **validação local** (o usuário não preencheu certo) de
erro de **integração** (a operação falhou no backend) — distinção essencial para
saber se o atrito é de UX ou de infraestrutura.

### 5.2 `erro_generico`

| Parâmetro | Descrição |
|-----------|-----------|
| `origem`  | `info` do Vue error handler (componente/hook onde ocorreu). |

Onde: `src/app/main.js`, via `app.config.errorHandler`. Rede de segurança para
exceções de runtime não tratadas.

### 5.3 `erro_integracao_firebase`

| Parâmetro | Valores |
|-----------|---------|
| `operacao` | `download_biblioteca`, `download_anexo_solicitacao`, `salvar_comentario`, `anexar_final` |

Onde: `DetalheArquivo`, `PaginaSolicitacaoDetalhe`, `PaginaFilaDetalhe`. Marca
falhas em operações de Storage/Firestore disparadas pela UI.

---

## 6. Relatórios sugeridos no console GA4

### 6.1 Funil de conversão de solicitação (usuário)

Objetivo: medir quantos usuários que **iniciam** uma solicitação a **concluem**.

Etapas (exploração do tipo _Funil_):

1. `acesso_tela` com `tela = nova_solicitacao`
2. `acesso_tela` com `tela = minhas_solicitacoes` (retorno após criar)

Como a criação em si não tem evento de clique dedicado (o clique é
`solicitacoes_nova` e a criação é confirmada via formulário), use o **acesso à
tela de destino** (`minhas_solicitacoes`, para onde o form redireciona ao salvar)
como sinal de sucesso, ou marque `solicitacoes_nova` como início do funil.

### 6.2 Funil de tratamento/conclusão (admin) — principal indicador de conclusão de fluxo

Etapas (funil ordenado):

1. `solicitacoes_abrir_detalhe`
2. `solicitacoes_assumir`
3. `solicitacoes_salvar_comentario` **ou** `solicitacoes_anexar_arquivo`
4. `solicitacoes_concluir`

Esse funil responde: “de cada solicitação aberta na fila, quantas são assumidas,
tratadas e concluídas?”. As quedas entre etapas mostram onde o fluxo trava.

### 6.3 Taxa de conversão de download (biblioteca)

- Numerador: `biblioteca_download`
- Denominador: `biblioteca_abrir_arquivo` + `biblioteca_abrir_resultado_busca`

Mede quantas visualizações de arquivo viram download efetivo. Segmentar por
`tipo` mostra quais categorias de material são mais baixadas.

### 6.4 Marcar eventos-chave (key events / conversões)

No GA4, marque como _key event_:

- `solicitacoes_concluir` — conclusão do fluxo administrativo.
- `biblioteca_download` — objetivo central da Biblioteca.
- Opcional: `solicitacoes_nova` — engajamento do usuário.

Assim esses eventos aparecem como conversões nos relatórios padrão e podem ser
usados em comparações e audiências.

### 6.5 Saúde (erros)

- Relatório livre com dimensão `formulario`/`motivo` sobre `erro_formulario`
  para separar atrito de UX (validação) de falha de backend (integração).
- Monitorar `erro_integracao_firebase` por `operacao` para detectar problemas de
  Storage/Firestore.
- `erro_generico` por `origem` para regressões de runtime.

### 6.6 Pontos de entrada e navegação

- Comparar `navegacao_menu` (por `alvo`) vs. `inicio_abrir_*` para entender se os
  usuários navegam mais pela barra ou pelos cards da home.
- `acesso_tela` por `tela` para ranquear as telas mais acessadas; `origem`/`destino`
  para reconstruir caminhos de navegação.

---

## 7. Observações de manutenção

- Ao criar uma tela nova, adicione a chave em `TELAS` e o `meta.tela` na rota; o
  guard cuida do disparo automaticamente.
- Ao criar uma ação nova, adicione a chave em `ACOES` e dispare no handler
  correspondente. Prefira reaproveitar um evento existente + parâmetro a criar um
  nome novo.
- Mantenha nomes e valores dentro dos limites do GA4 (seção 1).
