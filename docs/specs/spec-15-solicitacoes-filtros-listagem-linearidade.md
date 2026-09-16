# Spec 15 — Solicitações: filtros, listagens, paginação, linearidade, estado vazio e validação de anexo

## Objetivo
Reorganizar o módulo de Solicitações para deixá-lo mais escaneável, previsível e consistente entre encarregado e secretário, com:
- filtros sempre visíveis;
- ordenação estável;
- paginação simples;
- melhor identificação visual do tipo;
- detalhes mais lineares;
- histórico com data e hora;
- validação do anexo final do módulo.

## Resultado esperado
Ao final desta spec, o projeto deve ter:
- listagens de Solicitações com filtro por status e tipo;
- status iniciais pré-selecionados;
- paginação de 15 itens por página quando necessária;
- tipo identificado por ícone nas listagens e detalhes;
- detalhes do secretário reorganizados em fluxo linear;
- detalhes do encarregado reorganizados em leitura linear;
- histórico com data e hora;
- validação do anexo final de Solicitações com PDF de até 2 MB;
- estado vazio com SVG + texto;
- mesma lógica de listagem para encarregado e secretário.

## Pré-condições obrigatórias
Só executar esta spec após considerar como base consolidada:
- `README.md`
- `docs/index-operacional-mvp.md`
- `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
- `docs/steering/steering-01.md`
- `docs/steering/steering-02.md`
- `docs/steering/steering-03.md`
- `docs/steering/steering-04.md`
- `docs/steering/steering-05.md`
- `docs/specs/spec-09-execucao-operacional-sprint-1.md`
- `docs/specs/spec-10-execucao-operacional-sprint-2.md`
- `docs/specs/spec-11-melhoria-infraestrutura-local.md`
- `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`
- `docs/specs/spec-13-shell-autenticado-e-orientacao-global.md`
- a Spec 14 da Biblioteca já materializada no repositório, com o arquivo `src/servicos/casos_de_uso/regrasUpload.js` criado

## Dependências explícitas
Esta spec depende da ordem:
1. Spec 13
2. Spec 14
3. Spec 15

Esta spec depende da Spec 13 para:
- shell autenticado;
- barra inferior;
- `← Voltar`;
- regra de módulo ativo;
- proteção de troca de rota em formulários.

Esta spec depende da Spec 14 para:
- base de ícones locais do Lucide já adotada no projeto;
- evolução retrocompatível de `EstadoVazio.vue`, se tiver sido feita;
- arquivo único de regras de upload em `src/servicos/casos_de_uso/regrasUpload.js`.

## Fonte de verdade para esta spec
Em caso de dúvida, seguir esta ordem:
1. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`
3. `docs/specs/spec-13-shell-autenticado-e-orientacao-global.md`
4. esta spec
5. código já existente do repositório

Se houver conflito real com o fluxo oficial de status do módulo, parar e pedir confirmação humana.

## Escopo desta spec
Esta spec cobre:
- listagem do encarregado;
- listagem do secretário;
- filtros de Solicitações;
- paginação de Solicitações;
- identificação visual do tipo;
- linearidade das telas de detalhe;
- histórico com data e hora;
- validação de anexo final do módulo;
- estado vazio com SVG.

## Fora de escopo
Não implementar aqui:
- novo fluxo de status;
- novos tipos de solicitação;
- upload de arquivo na criação da solicitação do encarregado;
- obrigatoriedade de anexo final;
- novo módulo;
- busca textual global em Solicitações;
- alteração do módulo Biblioteca;
- compressão automática;
- mudança da barra inferior;
- mudança da autenticação;
- mudança de regras de acesso;
- variação de extensão no anexo final de Solicitações.

## Decisões já fechadas que o Kiro deve tratar como obrigatórias
- Em Solicitações, haverá filtro por status sempre visível.
- O filtro por status permite multiseleção.
- O estado inicial da listagem deve trazer `Em aberto` e `Em andamento`.
- `Concluída` e `Cancelada` entram no mesmo filtro por status.
- Em Solicitações, haverá filtro por tipo sempre visível.
- O filtro por tipo é de seleção única.
- O tipo da solicitação deve ter identificação visual por ícone.
- A lógica de filtros deve ser a mesma para encarregado e secretário.
- As listagens de Solicitações devem ser ordenadas da mais recente para a mais antiga.
- Paginação de Solicitações é fixa em 15 itens por página.
- A paginação só aparece se o filtro atual retornar mais de 15 itens.
- O componente de paginação deve permitir:
- avançar;
- retornar;
- ir para página específica;
- exibir total de páginas;
- exibir total de itens.
- O estado vazio deve mostrar um único SVG com texto claro.
- Em Solicitações, anexos aceitos são apenas `.PDF`.
- Em Solicitações, o limite de anexo é 2 MB sem exceção.
- O upload inválido mantém o restante da tela e impede a ação correspondente.
- Não implementar compressão automática.
- O anexo final de Solicitações continua sendo PDF fixo e não herda a variação de extensão da Biblioteca.

## Tipos e status oficiais
Usar exclusivamente as constantes oficiais já existentes:
- `TIPOS_SOLICITACAO` em `src/servicos/casos_de_uso/solicitacoes.js`
- `STATUS`
- `STATUS_ROTULOS`
- `STATUS_OPCOES`

O Kiro não deve criar arrays paralelos hardcoded como fonte primária.

## Arquivos e áreas do projeto que devem ser inspecionados primeiro
O Kiro deve revisar antes de alterar:
- `src/modulos/solicitacoes/PaginaMinhasSolicitacoes.vue`
- `src/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue`
- `src/modulos/solicitacoes/PaginaSolicitacaoForm.vue`
- `src/modulos/admin/PaginaFilaSolicitacoes.vue`
- `src/modulos/admin/PaginaFilaDetalhe.vue`
- `src/router/index.js`
- `src/componentes/CabecalhoPagina.vue`
- `src/componentes/BaseCard.vue`
- `src/componentes/BaseBotao.vue`
- `src/componentes/BaseSelect.vue`
- `src/componentes/UploaderArquivo.vue`
- `src/componentes/EstadoVazio.vue`
- `src/componentes/BadgeStatus.vue`
- `src/componentes/tokens.css`
- `src/servicos/casos_de_uso/solicitacoes.js`
- `src/servicos/casos_de_uso/solicitacoesAdmin.js`
- `src/servicos/casos_de_uso/formato.js`
- `src/servicos/casos_de_uso/regrasUpload.js`
- `src/servicos/repositorios/repositorioSolicitacoes.js`

## Estratégia operacional obrigatória
Antes de implementar:
- separar claramente listagens, detalhes, histórico e validação de anexo;
- preservar regras de domínio já existentes;
- aplicar mudanças visuais e de experiência sem reescrever o domínio de status.

Durante a execução:
- não criar novo status;
- não alterar transições válidas;
- não criar campo novo em `solicitacoes` sem necessidade real;
- não adicionar upload na criação da solicitação do encarregado;
- não tornar anexo final obrigatório para concluir.

## Regra anti-alucinação para filtros e paginação
Nesta spec, o Kiro deve preferir solução simples e previsível para o MVP.

A estratégia obrigatória para as novas listagens principais é:
- carregar o escopo base visível do usuário;
- aplicar filtros em memória;
- aplicar ordenação em memória;
- aplicar paginação em memória sobre a lista já filtrada.

Isso vale para:
- `PaginaMinhasSolicitacoes.vue`
- `PaginaFilaSolicitacoes.vue`

O Kiro não deve:
- basear a nova listagem principal em query única de status;
- criar combinação excessiva de queries por status + tipo + página;
- introduzir cursores complexos desnecessários;
- depender de infraestrutura nova para paginação.

## Regra para compatibilidade com repositório atual
O parâmetro antigo de `status` nas funções de repositório pode permanecer temporariamente para compatibilidade interna, se necessário.

Porém:
- ele não deve ser a base da nova estratégia de listagem principal;
- o Kiro não deve deixar código morto novo;
- se houver refatoração simples e segura para reduzir ambiguidade, ela é permitida.

## Regra anti-alucinação para ícones do tipo
O ícone do tipo de solicitação é obrigatório como reforço visual, mas não deve gerar hack visual em campos nativos de select.

O Kiro deve:
- usar ícones nas listagens e nos títulos/detalhes onde há ganho real;
- manter o filtro por tipo simples;
- criar um mapa estável `tipo -> ícone` usando os tipos oficiais.

O Kiro não deve:
- tentar embutir ícones em select nativo de forma instável;
- adicionar ícones decorativos sem função;
- assumir que esse mapa já existia antes desta spec.

## Lote D — listagens, filtros, ordenação e paginação

### Objetivo do lote
Fazer as listagens de Solicitações funcionarem com a mesma lógica entre encarregado e secretário, com foco em:
- leitura rápida;
- filtros sempre visíveis;
- tipo identificável;
- paginação simples.

### Filtro por status
O filtro por status deve:
- ficar sempre visível;
- permitir multiseleção;
- nascer com `Em aberto` e `Em andamento` já selecionados;
- permitir adicionar ou remover `Concluída` e `Cancelada`.

Regra de combinação:
- a listagem final deve respeitar os status selecionados;
- se nenhum status estiver selecionado, a lista resultante pode ficar vazia;
- o Kiro não deve forçar re-seleção automática sem necessidade.

### Filtro por tipo
O filtro por tipo deve:
- ficar sempre visível;
- ser de seleção única;
- nascer sem tipo específico selecionado, equivalente a “todos os tipos”;
- combinar com o filtro por status.

Regra de combinação:
- resultado final = status selecionados AND tipo selecionado, quando houver tipo;
- se não houver tipo selecionado, considerar todos os tipos.

### Estrutura mínima dos filtros
O Kiro deve garantir:
- filtro por status sempre visível e claramente interativo;
- filtro por tipo sempre visível;
- mesma lógica em `PaginaMinhasSolicitacoes.vue` e `PaginaFilaSolicitacoes.vue`.

O Kiro pode criar componente reutilizável para filtros se houver uso real nas duas telas.

### Tipo da solicitação com ícone
Cada item de listagem deve exibir o tipo da solicitação com ícone.

Regras:
- o ícone deve aparecer pelo menos na listagem e no cabeçalho do detalhe;
- não é obrigatório embutir ícone dentro das opções do filtro por tipo;
- o objetivo é facilitar reconhecimento visual, não decorar a tela.

### Ordenação
As listagens de Solicitações devem permanecer da mais recente para a mais antiga.

Regras:
- aplicar na visão do encarregado;
- aplicar na visão do secretário;
- não introduzir nova regra de ordenação secundária sem necessidade.

### Paginação
A paginação de Solicitações deve:
- ser fixa em 15 itens por página;
- ser calculada sobre a lista já filtrada;
- aparecer apenas quando o total filtrado for maior que 15;
- ser oculta quando o total filtrado for 15 ou menos;
- exibir total de itens;
- exibir total de páginas;
- permitir ir para próxima página;
- permitir voltar página;
- permitir ir para página específica.

Regras obrigatórias:
- ao mudar qualquer filtro, resetar para página 1;
- paginação nunca deve apontar para página inexistente;
- os totais exibidos devem refletir a lista filtrada, não a lista bruta.

### Estado vazio
Quando a lista filtrada estiver vazia:
- mostrar um único SVG;
- mostrar um texto claro;
- manter os filtros visíveis;
- não remover o contexto da tela.

O SVG não deve ser hardcoded com nome fictício nesta spec.
O usuário escolherá o SVG no momento da implementação.

Se `EstadoVazio.vue` ainda não suportar SVG:
- evoluir o componente de forma retrocompatível;
- não quebrar usos anteriores do componente.

## Lote D — linearidade das telas de detalhe

### Visão do secretário — ordem obrigatória
`PaginaFilaDetalhe.vue` deve ser reorganizada para seguir esta ordem lógica visual:

1. Identificação da solicitação
2. Assumir solicitação pendente
3. Anexar um arquivo
4. Adicionar uma conclusão
5. Concluir
6. Histórico

Regras:
- as seções devem permanecer em ordem fixa e sempre visíveis;
- o domínio atual não deve ser relaxado;
- antes de assumir, as seções que dependem de `em_andamento` podem aparecer visíveis, porém desabilitadas;
- `Assumir` continua disponível apenas quando `status === em_aberto`;
- `Anexar`, `Salvar conclusão` e `Concluir` continuam obedecendo as regras de domínio já existentes;
- `Cancelar` pode continuar disponível conforme regra atual, mas não deve dominar a hierarquia visual.

### Visão do encarregado — ordem obrigatória
`PaginaSolicitacaoDetalhe.vue` deve priorizar esta leitura:

1. Identificação da solicitação
2. Status atual e responsável
3. Dados da solicitação
4. Retorno/resposta da secretaria
5. Anexo final
6. Histórico

Regras:
- `Editar` e `Cancelar solicitação` continuam restritos ao estado `em_aberto`;
- `Baixar anexo final` aparece quando houver anexo final disponível;
- a página não deve misturar histórico com resposta final;
- não criar prévia de etapas pendentes.

### Histórico com data e hora
O histórico nas duas visões deve passar a exibir:
- data;
- hora.

O Kiro deve preferir helper reutilizável de formatação, por exemplo ampliando `src/servicos/casos_de_uso/formato.js`.

Regras:
- não substituir a data por texto relativo;
- não deixar hora escondida apenas em tooltip;
- manter leitura simples em mobile.

## Lote E — validação do anexo final em Solicitações

### Escopo real do upload neste módulo
Nesta fase, o upload em Solicitações se refere ao anexo final tratado pelo secretário em `PaginaFilaDetalhe.vue`.

O Kiro não deve:
- adicionar uploader na criação da solicitação do encarregado;
- inventar novo fluxo de anexo de solicitante.

### Formato permitido
No módulo de Solicitações:
- aceitar apenas `.PDF`

### Limite de tamanho
No módulo de Solicitações:
- limite máximo de 2 MB
- sem exceção por tipo

### Regras técnicas do anexo final
Em Solicitações:
- o arquivo final continua sendo PDF fixo;
- o caminho e o nome técnico podem continuar coerentes com `resposta.pdf` ou equivalente já estável;
- não aplicar variação de extensão da Spec 14 neste módulo.

### Hint obrigatória abaixo do campo
O uploader do anexo final deve mostrar hint abaixo do campo com:
- formato aceito;
- limite máximo aplicável.

Se `UploaderArquivo.vue` já tiver sido evoluído na Spec 14, reutilizar essa capacidade.
Se não tiver, evoluir agora de forma simples e reutilizável.

### Erros de validação
Quando houver erro de validação no anexo final:
- mostrar mensagem clara;
- mostrar mensagem em vermelho;
- bloquear a ação de anexar enquanto o erro persistir;
- manter o restante da tela preenchido e funcional;
- não limpar automaticamente os outros campos.

Regra importante:
- anexo final continua opcional;
- um erro no anexo não deve transformar o anexo em obrigatório;
- não criar dependência falsa entre “não anexar” e “não poder concluir”, salvo se já houver regra de domínio explícita no código, o que não deve ser inventado aqui.

### Fonte única de regras
As regras de formato e tamanho devem reutilizar exatamente:
- `src/servicos/casos_de_uso/regrasUpload.js`

Esta spec não deve duplicar constantes de upload em outro arquivo.

## Arquitetura e implementação sugerida
O Kiro pode:
- evoluir `PaginaMinhasSolicitacoes.vue`;
- evoluir `PaginaFilaSolicitacoes.vue`;
- evoluir `PaginaSolicitacaoDetalhe.vue`;
- evoluir `PaginaFilaDetalhe.vue`;
- criar componente simples de paginação em `src/componentes/`;
- criar componente simples de filtro de status multiseleção se isso reduzir duplicação;
- ampliar `EstadoVazio.vue` com slot de SVG ou prop equivalente;
- ampliar `formato.js` para data e hora;
- reutilizar ícones locais do Lucide já adotados no projeto;
- reutilizar `regrasUpload.js`.

O Kiro não deve:
- criar store complexa só para filtros;
- inventar backend novo;
- mudar o contrato central de status;
- adicionar upload na abertura de solicitação do usuário;
- criar dependência da Biblioteca para fazer a paginação de Solicitações funcionar.

## Validação obrigatória da spec
Esta spec só pode ser dada como concluída se:
- `PaginaMinhasSolicitacoes.vue` e `PaginaFilaSolicitacoes.vue` tiverem filtros sempre visíveis;
- o filtro inicial de status vier com `Em aberto` e `Em andamento`;
- `Concluída` e `Cancelada` puderem ser incluídas no mesmo filtro;
- o filtro por tipo for de seleção única;
- o tipo for identificável por ícone na listagem;
- a ordenação permanecer da mais recente para a mais antiga;
- a paginação aparecer apenas acima de 15 itens filtrados;
- a paginação permitir avançar, voltar, página específica, total de páginas e total de itens;
- a mudança de filtro resetar a paginação para a primeira página;
- os detalhes do secretário seguirem a ordem definida;
- as seções dependentes de `em_andamento` poderem permanecer visíveis porém desabilitadas antes de assumir;
- os detalhes do encarregado seguirem a ordem definida;
- o histórico mostrar data e hora;
- o anexo final aceitar apenas PDF de até 2 MB;
- o erro de upload bloquear a ação de anexar e manter o restante da tela intacto;
- a build do projeto continuar íntegra.

## Forma de validação aceita para esta spec
Para esta spec, é suficiente validar comportamento:
- em ambiente local;
- com Firebase Emulator;
- com navegação manual nas duas visões de perfil.

O Kiro pode adicionar testes pequenos apenas para:
- helpers puros;
- regras de upload;
- formatação;
- mapeamentos de tipo e paginação.

Não é necessário introduzir framework completo de teste de UI para concluir esta spec.

## Restrições explícitas finais
Durante esta spec, o Kiro não deve:
- alterar a barra inferior;
- alterar a lógica de módulo ativo;
- criar novos status;
- criar novos tipos de solicitação;
- adicionar uploader na abertura de solicitação do encarregado;
- tornar anexo final obrigatório;
- instalar biblioteca completa de ícones;
- implementar compressão automática;
- alterar o módulo Biblioteca.

## Resultado final esperado
Ao concluir esta spec, o módulo de Solicitações do Portal Musical deve ter listagens mais controláveis, de/talhes mais lineares, histórico mais útil e tratamento de anexo final mais seguro, preservando a simplicidade do MVP e sem introduzir complexidade desnecessária.