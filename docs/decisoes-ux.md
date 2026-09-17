# Decisões de UX e de código

Registro das decisões tomadas no ciclo de polimento pós-implementação (Sprint 3).
A intenção é deixar rastro do "porquê" — não só do que mudou — para quem for
manter o projeto depois. Convenções operacionais ficam no `CONTRIBUTING.md`;
aqui explicamos as escolhas.

## Acessibilidade

- **Foco visível global** (`tokens.css`, `:focus-visible`): anel de foco só na
  navegação por teclado, sem poluir o clique de mouse. Usa a cor primária.
- **Modais acessíveis** (`usarModalAcessivel`): fecham no `Esc`, prendem o foco
  enquanto abertas e devolvem o foco ao elemento que as abriu. Aplicado à
  confirmação, ao detalhe de arquivo e à confirmação de saída.
- **Rótulos dos cards clicáveis**: `aria-label` descritivo quando a leitura do
  conteúdo é ambígua (ex.: "Abrir categoria Circulares", "Abrir solicitação
  Novo colaborador — Em aberto").

## Navegação e ações

- **Voltar padronizado no topo**: a navegação de retorno é o `← Voltar` do
  cabeçalho, que aparece só em telas internas. Removemos os botões "Voltar"
  redundantes no rodapé dos formulários para não ter duas formas de fazer a
  mesma coisa.
- **Barra inferior — item ativo**: reforçado além da cor (peso de fonte maior no
  rótulo ativo + indicador que desliza entre módulos), para não depender só de
  cor. Animação leve, respeitando `prefers-reduced-motion`.
- **Linhas de ação responsivas** (`.acoes-responsivas` em `tokens.css`): no
  mobile os botões empilham em largura total; no desktop ficam lado a lado com a
  ação destrutiva à direita. É uma classe utilitária única, reaproveitada em
  formulários, detalhes e modais.
- **Hierarquia de botões**: um CTA primário por contexto; apoio é secundário;
  destrutivo usa `destrutivo` (ou `destrutivo-sutil`, sem preenchimento, nas
  ações por item de lista, para pesar menos que a ação principal).
- **Modal de saída**: "Continuar aqui" (secundário) à esquerda e "Sair"
  (destrutivo) à direita, seguindo o padrão do resto do sistema (destrutivo
  sempre à direita).

## Estados de carregamento

- **Carregamento inicial vs. recarga silenciosa**: cada tela com dados usa
  `carregandoInicial` para mostrar o spinner de tela cheia apenas no primeiro
  carregamento. Recarregar após uma ação (salvar, anexar, remover, concluir) é
  silencioso: os dados são reatribuídos e o Vue atualiza no lugar, sem trocar a
  tela nem pular para o topo. O "processando" fica no próprio botão
  (`:carregando`). Isso resolveu o efeito de "refresh" que jogava o scroll para
  cima a cada ação.
- **Exceção — busca da Biblioteca**: mantém o estado "Buscando..." em tela cheia,
  porque cada termo é uma consulta nova (contexto diferente), não uma recarga
  pós-ação. Manter resultados antigos durante a nova busca confundiria.
- **Vazio vs. carregando**: textos distintos e orientativos. Os estados vazios de
  Solicitações distinguem "não há dados" de "não há resultado para os filtros".

## Fluxo do secretário (detalhe da solicitação)

- **"Comentário" em vez de "Conclusão"** no rótulo de UI, para não confundir com
  o passo "Concluir". O campo persistido continua sendo `conclusao` (contrato de
  dados) — só o texto visível mudou.
- **Botões refletem o estado dos dados** (não o clique):
  - "Anexar arquivo" (primário) vira "Substituir anexo" (secundário) quando já
    há anexo salvo.
  - "Salvar comentário" fica secundário quando já há comentário salvo (texto
    mantido; muda só a variante).
  - "Assumir" permanece e desabilita depois de assumir; "Concluir" segue como CTA
    final (primário).
  Escolhemos o estado dos dados em vez do clique porque é estável: sobrevive a um
  reload da página.
- **Padrão de dois botões vs. um**: quando muda o texto/intenção conforme o
  estado, usamos dois `<BaseBotao>` com `v-if/v-else` (mais legível); quando muda
  só o estilo, um único botão com `:variante`.
- **Mensagens por card**: cada seção (assumir, anexar, comentário, concluir)
  mostra seu próprio feedback, em vez de uma mensagem única no topo.

## Confirmações destrutivas

- Sempre citam o item afetado (ex.: "Remover o arquivo X?", "Cancelar a
  solicitação de Y de Fulano?"), com versão mais curta quando o texto ficaria
  grande no mobile. Reduz erro em ações irreversíveis.

## Microcopy

- Preferência por texto curto e claro no mobile a texto "bonito" porém longo.
- Hints de upload no formato curto "PDF ou XLSX · Max: 2 MB" (a exceção de
  Métodos, 50 MB, aparece dinamicamente conforme o tipo).
- Marcações `// TODO: revisar mensagem` sinalizam copy provisória para revisão
  manual posterior.

## Estilo de código

- **Regras mecânicas no linter**: `curly: 'all'` garante chaves em toda
  condicional/loop e proíbe `if` inline em todo o projeto (com auto-fix).
- **Legibilidade acima de comentário**: preferimos nome/estrutura que se
  explicam a um comentário justificando código confuso. Comentário só onde
  agrega contexto não-óbvio.
- **Quebras semânticas**: linha em branco separando grupos (declarações,
  computeds, watchers, funções) e ao redor de condicionais/loops.
- **Cabeçalhos de arquivo humanizados** nos composables e configs, explicando o
  porquê de cada peça existir.
