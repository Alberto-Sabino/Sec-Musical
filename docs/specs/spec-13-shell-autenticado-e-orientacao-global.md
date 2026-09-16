# Spec 13 — Shell autenticado, navegação global e orientação inicial

## Objetivo
Implementar a base estrutural da Sprint 3 para que a área autenticada do Portal Musical funcione como um sistema único, navegável por módulos, com foco em previsibilidade, clareza e baixo risco de alucinação na implementação.

Esta spec cobre apenas o que é transversal e global:
- shell autenticado;
- navegação global persistente;
- comportamento de `← Voltar`;
- estrutura da home;
- contexto do usuário;
- uso global e mínimo de ícones locais;
- padrão de proteção contra perda de formulário ao trocar de rota.

Esta spec não cobre a nova Biblioteca nem as novas listagens de Solicitações em profundidade. Esses temas ficam nas specs seguintes.

## Resultado esperado
Ao final desta spec, o projeto deve ter:
- uma barra inferior persistente na área autenticada;
- navegação direta entre módulos sem passar obrigatoriamente pelo Início;
- destaque claro do módulo ativo;
- regra estável de `← Voltar` nas telas internas;
- home reorganizada com contexto do usuário, seletor de setor e cards de módulos;
- base pronta para uso de ícones locais do Lucide sem instalar biblioteca completa;
- proteção contra perda acidental de formulário ao trocar de rota.

## Pré-condições obrigatórias
Só executar esta spec após considerar como base consolidada:
- `README.md`;
- `docs/index-operacional-mvp.md`;
- `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`;
- `docs/steering/steering-01.md`;
- `docs/steering/steering-02.md`;
- `docs/steering/steering-03.md`;
- `docs/steering/steering-04.md`;
- `docs/steering/steering-05.md`;
- `docs/specs/spec-09-execucao-operacional-sprint-1.md`;
- `docs/specs/spec-10-execucao-operacional-sprint-2.md`;
- `docs/specs/spec-11-melhoria-infraestrutura-local.md`;
- `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`.

## Fonte de verdade para esta spec
Em caso de dúvida, seguir esta ordem:
1. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
2. esta spec
3. `docs/steering/steering-01.md` até `docs/steering/steering-05.md`
4. código já existente no repositório

Se houver conflito real entre esta spec e o contrato de dados, parar e pedir confirmação humana.

## Escopo desta spec
Esta spec cobre:
- Lote A — orientação global e reorganização da home;
- Lote B — shell autenticado com barra inferior persistente.

## Fora de escopo
Não implementar aqui:
- nova tela inicial da Biblioteca por tipos;
- busca por nome na Biblioteca;
- listagem por tipo da Biblioteca;
- tela de resultados da busca da Biblioteca;
- filtros e paginação completos de Solicitações;
- validações de upload específicas da Biblioteca e de Solicitações;
- compressão de arquivos;
- revisão ampla de microcopy em todas as telas;
- novos campos de dados;
- novos módulos;
- mudança de rotas públicas;
- mudança de autenticação;
- instalação da biblioteca completa do Lucide.

## Decisões já fechadas que o Kiro deve tratar como obrigatórias
- Não usar fotos.
- Não usar imagens decorativas.
- Manter a fonte atual do sistema.
- Usar ícones do Lucide apenas por cópia local dos SVGs realmente usados.
- Não importar a biblioteca completa do Lucide.
- Não criar menu lateral.
- Não criar menu flutuante como navegação estrutural.
- O Início continua sempre acessível, mas não é intermediário obrigatório entre módulos.
- A navegação principal da área autenticada será uma barra inferior.
- A barra inferior mostra apenas módulos, nunca ações.
- `Nova solicitação` e `Novo arquivo` não entram na barra principal.
- O botão `Início` no topo deixa de existir.
- Os botões `Início` já espalhados nas telas internas devem ser removidos nesta spec.
- O `← Voltar` aparece apenas em telas internas e usa exatamente o histórico real de navegação, equivalente a `route.back()`.
- Não haverá fallback customizado para o `← Voltar`.
- É aceitável que, em acesso direto a link profundo sem histórico útil na SPA, `route.back()` saia do fluxo atual.
- Em telas com formulário em andamento, a troca de rota deve exigir confirmação.
- A home pode ter espaço reservado para atalhos futuros, mas não deve renderizar componente vazio nem placeholder visual.

## Arquivos e áreas do projeto que devem ser inspecionados primeiro
O Kiro deve revisar antes de alterar:
- `src/app/App.vue`
- `src/app/PaginaInicial.vue`
- `src/router/index.js`
- `src/router/guards.js`
- `src/composables/usarSessao.js`
- `src/componentes/CabecalhoPagina.vue`
- `src/componentes/ContainerPagina.vue`
- `src/componentes/BaseCard.vue`
- `src/componentes/BaseBotao.vue`
- `src/componentes/tokens.css`
- `src/modulos/autenticacao/PaginaLogin.vue`
- `src/modulos/biblioteca/PaginaBiblioteca.vue`
- `src/modulos/admin/PaginaArquivoForm.vue`
- `src/modulos/solicitacoes/PaginaMinhasSolicitacoes.vue`
- `src/modulos/solicitacoes/PaginaSolicitacaoForm.vue`
- `src/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue`
- `src/modulos/admin/PaginaFilaSolicitacoes.vue`
- `src/modulos/admin/PaginaFilaDetalhe.vue`

Se for necessário criar novos arquivos, fazê-lo apenas se houver reutilização clara. Esta spec autoriza componente reutilizável de barra inferior e componente reutilizável de ícone local, se realmente necessário.

## Estratégia operacional obrigatória
Antes de implementar cada lote:
- identificar o lote;
- resumir objetivo em uma frase;
- listar arquivos que serão afetados;
- implementar apenas o escopo do lote;
- validar comportamento antes de avançar.

Durante a execução:
- não reabrir decisões já fechadas;
- não criar camada genérica sem uso real;
- não renomear rotas sem necessidade documental;
- não alterar regras de segurança;
- não mexer em Firestore ou Storage por preferência técnica;
- não inventar copy extensa onde o usuário sinalizou revisão manual posterior.

## Regra anti-alucinação para textos e microcopy
Nesta spec, o Kiro não deve fazer uma revisão ampla de títulos, mensagens e rótulos de forma criativa.

Pode:
- reorganizar estrutura visual;
- preservar textos já existentes;
- adicionar apenas textos curtos, funcionais e estritamente necessários para os novos cards de módulos e para o contexto da home.

Não pode:
- inventar linguagem promocional;
- criar textos longos;
- alterar massivamente a terminologia do produto;
- prometer comportamentos que ainda estarão nas specs seguintes.

## Regra anti-alucinação para ícones
O Kiro deve:
- usar apenas SVGs locais;
- copiar apenas os ícones realmente usados nesta spec;
- manter cor herdada por `currentColor` ou padrão equivalente simples;
- garantir que o uso de ícones seja funcional.

O Kiro não deve:
- instalar `lucide-vue`, `lucide-vue-next`, `@lucide/vue` ou pacote equivalente;
- usar CDN externa;
- criar catálogo de ícones sem necessidade;
- colocar ícone em todo elemento apenas por estética.

## Lote A — orientação global e reorganização da home

### Objetivo do lote
Reorganizar a home autenticada para funcionar como ponto de entrada claro do usuário logado, reforçando contexto, setor ativo e acesso aos módulos principais sem poluição visual.

### Entregas obrigatórias do lote
- Remover a lógica antiga de botão `Início` no topo das telas.
- Remover os botões `Início` já existentes nas telas internas e de listagem autenticadas, pois a navegação global passará a ser feita pela barra inferior.
- Preparar o cabeçalho para suportar `← Voltar` apenas em telas internas.
- Reorganizar a home autenticada para exibir, nesta ordem:
1. card de contexto do usuário logado;
2. seletor de setor;
3. cards dos módulos acessíveis;
4. área inferior livre, sem placeholder visível, preservando espaço natural para futuros atalhos.

### Card de contexto do usuário
O card de contexto na home deve mostrar:
- nome completo;
- perfil de acesso;
- setor atual;
- comum congregação.

Regras:
- o card deve permanecer compacto;
- não transformar esse bloco em painel administrativo;
- usar somente dados já disponíveis no contexto da sessão ou em estruturas já existentes;
- não criar novo campo de dados para sustentar este card;
- quando `comum_congregacao` estiver vazio, exibir `—`;
- não ocultar a linha de comum congregação quando o valor estiver vazio;
- não inventar fallback textual como “não se aplica”.

### Seletor de setor
O seletor de setor na home:
- deve continuar existindo;
- deve permanecer logo abaixo do card de contexto;
- não deve perder comportamento já existente de troca de setor;
- não deve ser substituído por outra navegação.

### Cards de módulos na home
Na home, o Kiro deve renderizar cards de módulos com:
- título;
- descrição curta;
- ícone local;
- ação de navegação para a página inicial do módulo.

Regras:
- na home, os módulos a destacar agora são `Biblioteca` e `Solicitações`;
- não renderizar card para `Início`, porque o usuário já está nele;
- as descrições devem ser curtas e funcionais;
- a descrição deve explicar o uso do módulo, não marketing do produto;
- os cards devem seguir o design system existente e não parecer componente de outro sistema.

### Espaço para atalhos futuros
A home pode preservar espaço visual para atalhos futuros, mas:
- não deve criar um componente de atalhos agora;
- não deve renderizar área vazia com borda, rótulo ou placeholder;
- não deve mostrar “em breve”, “atalhos” ou qualquer texto especulativo;
- basta não comprimir artificialmente todo o conteúdo no topo se isso prejudicar evolução futura.

### Revisões textuais fora deste lote
O usuário informou que continuará revisando manualmente:
- títulos;
- rótulos de botões;
- mensagens;
- feedbacks.

Portanto, nesta spec o Kiro deve:
- preservar textos estáveis já existentes;
- introduzir apenas o mínimo necessário para a nova estrutura da home.

## Lote B — shell autenticado e barra inferior persistente

### Objetivo do lote
Criar uma camada de navegação global persistente por módulos, visível em toda a área autenticada, que permita troca direta entre módulos e deixe claro em qual módulo o usuário está.

### Entregas obrigatórias do lote
- Criar barra inferior persistente para a área autenticada.
- Exibir a barra em todas as telas autenticadas.
- Não exibir a barra na tela de login.
- Garantir destaque visual do módulo ativo.
- Garantir que cada item da barra navegue para a página inicial do módulo.
- Implementar proteção contra perda de formulário ao trocar de rota.

### Regras da barra inferior
A barra inferior deve:
- mostrar apenas módulos;
- usar ícone local + rótulo;
- ser fixa e consistente;
- respeitar o design system atual;
- ser pensada para futura evolução para PWA.

A barra não deve:
- exibir ações como `Nova solicitação` ou `Novo arquivo`;
- misturar navegação estrutural com atalhos operacionais;
- competir visualmente com o conteúdo principal;
- desaparecer em detalhes e formulários autenticados.

### Módulos atuais da barra
Nesta fase, a barra deve conter exatamente:
- `Início`
- `Biblioteca`
- `Solicitações`

Não adicionar:
- `Mais`
- `Ferramentas`
- `Atalhos`
- qualquer outro item estrutural

### Regra de navegação por módulo
Ao tocar em um módulo da barra:
- `Início` deve levar para a rota inicial autenticada;
- `Biblioteca` deve levar para a página inicial da Biblioteca;
- `Solicitações` deve levar para a página inicial do módulo de Solicitações conforme o perfil do usuário logado.

Regra obrigatória para `Solicitações`:
- se o usuário for encarregado, a página inicial do módulo é `minhas-solicitacoes`;
- se o usuário for secretário/admin, a página inicial do módulo é `fila-solicitacoes`.

O Kiro não deve inventar rota intermediária nova para isso.

### Destaque do módulo ativo
A barra deve indicar qual módulo está ativo no momento, inclusive em subfluxos.

Mapeamento obrigatório de rotas para módulo ativo:
- `inicio` pertence ao módulo `Início`
- `biblioteca` pertence ao módulo `Biblioteca`
- `arquivo-novo` pertence ao módulo `Biblioteca`
- `arquivo-editar` pertence ao módulo `Biblioteca`
- `minhas-solicitacoes` pertence ao módulo `Solicitações`
- `solicitacao-nova` pertence ao módulo `Solicitações`
- `solicitacao-detalhe` pertence ao módulo `Solicitações`
- `solicitacao-editar` pertence ao módulo `Solicitações`
- `fila-solicitacoes` pertence ao módulo `Solicitações`
- `fila-detalhe` pertence ao módulo `Solicitações`

Exemplo obrigatório:
- em `PaginaArquivoForm.vue`, o módulo destacado é `Biblioteca`;
- em `PaginaFilaDetalhe.vue`, o módulo destacado é `Solicitações`.

### Regra do `← Voltar`
O `← Voltar`:
- aparece apenas em telas que não são iniciais de módulo;
- usa exatamente o histórico real de navegação;
- não deve substituir o destino por rota fixa;
- não deve ter fallback customizado.

Telas iniciais de módulo onde `← Voltar` não deve aparecer:
- `inicio`
- `biblioteca`
- `minhas-solicitacoes`
- `fila-solicitacoes`

Telas internas onde `← Voltar` deve aparecer:
- `arquivo-novo`
- `arquivo-editar`
- `solicitacao-nova`
- `solicitacao-editar`
- `solicitacao-detalhe`
- `fila-detalhe`

### Guard de saída para formulários com alteração pendente
Como a barra inferior ficará sempre visível, o Kiro deve proteger troca de rota quando houver formulário em andamento.

Padrão obrigatório:
- rastreamento de estado sujo por página;
- flag local de alteração pendente;
- proteção local de saída por página ou mecanismo equivalente por rota;
- sem store global nova para isso.

Esta proteção deve valer, no mínimo, para:
- `PaginaArquivoForm.vue`
- `PaginaSolicitacaoForm.vue`
- `PaginaFilaDetalhe.vue` quando existir alteração local não salva em campos de conclusão, anexo ou equivalente

Regras:
- se houver alteração pendente, qualquer troca de rota autenticada deve pedir confirmação;
- isso inclui clique na barra inferior;
- isso inclui outras mudanças de rota controladas pelo router;
- não perder dados silenciosamente;
- se não houver alteração pendente, a navegação segue normalmente.

O Kiro deve preferir solução simples e explícita, sem criar infraestrutura excessiva.

### Home e barra devem compartilhar a mesma lógica de destino
Os cards de módulos na home e os itens da barra inferior devem apontar para o mesmo destino por módulo.

Exemplo:
- card `Solicitações` na home deve respeitar o perfil do usuário da mesma forma que o item `Solicitações` da barra.

## Uso mínimo de ícones liberado nesta spec
Esta spec autoriza ícones locais, no mínimo, para:
- `Início`
- `Biblioteca`
- `Solicitações`
- `Voltar`
- `Sair`, se o elemento já existir e a alteração for de baixo risco

O Kiro pode criar um componente base de ícone local se isso evitar duplicação e se for realmente reutilizado em mais de uma tela.

## Arquitetura e implementação sugerida
O Kiro pode:
- criar um componente específico para a barra inferior dentro de `src/componentes/`;
- criar um componente simples para ícones locais dentro de `src/componentes/`;
- criar pasta local para SVGs reutilizados em `src/assets/` ou estrutura equivalente já compatível com o projeto;
- adaptar `App.vue` para funcionar como shell autenticado;
- adaptar `CabecalhoPagina.vue` para suportar o `← Voltar` com comportamento controlado pela rota atual;
- adaptar `guards.js` para sustentar confirmação de saída em formulários;
- aplicar a lógica de remoção dos botões `Início` já existentes nas telas afetadas por esta spec.

O Kiro não deve:
- desmontar a estrutura atual do projeto para criar shell complexo;
- criar store global nova apenas para esta spec;
- adicionar biblioteca de UI;
- adicionar biblioteca de ícones;
- alterar nomes das rotas sem necessidade.

## Validação obrigatória por lote

### Validação do Lote A
O Lote A só pode ser dado como concluído se:
- a home autenticada mostrar card de contexto do usuário com os quatro campos definidos;
- quando `comum_congregacao` estiver vazio, o card exibir `—`;
- o seletor de setor continuar presente e funcional;
- a home mostrar cards de `Biblioteca` e `Solicitações`;
- não existir componente vazio de atalhos;
- os botões `Início` do topo das telas afetadas tiverem sido removidos;
- o layout continuar coerente com o design system atual;
- não houver foto, banner ou ilustração decorativa.

### Validação do Lote B
O Lote B só pode ser dado como concluído se:
- a barra inferior aparecer em todas as telas autenticadas;
- a barra não aparecer na tela de login;
- cada item da barra levar à página inicial correta do módulo;
- o módulo ativo estiver destacado corretamente em todas as rotas mapeadas;
- o `← Voltar` aparecer apenas em telas internas;
- o `← Voltar` usar o histórico real da navegação;
- ao trocar de rota com formulário sujo, houver confirmação;
- ao trocar de rota sem alteração pendente, não houver bloqueio indevido.

## Critério de pronto da spec
Esta spec só conta como pronta quando todos os itens abaixo forem verdadeiros:
- shell autenticado com barra inferior está implantado;
- home foi reorganizada conforme esta spec;
- cards de módulos funcionam e navegam corretamente;
- regra de módulo ativo está correta;
- regra de `← Voltar` está correta;
- proteção de saída em formulários está funcionando;
- build do projeto permanece íntegro;
- não houve expansão indevida de escopo.

## Forma de validação aceita para esta spec
Para esta spec, é suficiente validar comportamento:
- em ambiente local;
- com navegação manual;
- sem exigir framework completo de teste de UI.

O Kiro pode adicionar testes pequenos apenas para helpers ou mapeamentos puros, se isso trouxer baixo custo e ganho claro de segurança.

## Restrições explícitas finais
Durante esta spec, o Kiro não deve:
- mudar contrato de dados;
- criar novo módulo;
- alterar regras de acesso;
- inventar funcionalidade de atalhos futuros;
- mexer na Biblioteca além do necessário para apontar navegação estrutural;
- mexer nas regras detalhadas de filtros, paginação e busca;
- instalar pacote completo de ícones;
- tratar esta spec como redesign visual amplo.

## Resultado final esperado
Ao concluir esta spec, a área autenticada do Portal Musical deve ter uma base estrutural clara, modular e persistente, com navegação direta entre módulos, contexto mais forte na home e comportamento previsível de retorno e troca de rota, sem poluição visual e sem dependência nova desnecessária.