# Spec 14 — Biblioteca: descoberta por tipos, busca por nome, metadados, legados e upload

## Objetivo
Transformar o módulo Biblioteca em uma experiência guiada por tipos e busca por nome, substituindo a antiga entrada por listagem completa com select de tipo.

Esta spec cobre:
- nova tela inicial da Biblioteca;
- nova tela de listagem por tipo;
- nova tela de resultados da busca por nome;
- identificação visual por tipo;
- exibição de tamanho do arquivo;
- tratamento explícito de arquivos legados;
- suporte real a `.PDF` e `.XLSX` na Biblioteca;
- validações de formato e tamanho específicas da Biblioteca;
- correção do fluxo técnico de binário e `id_nuvem` no upload/edição/download.

## Resultado esperado
Ao final desta spec, o projeto deve ter:
- uma tela inicial da Biblioteca com busca por nome e cards de tipos;
- uma tela própria para listagem por tipo;
- uma tela própria para resultados da busca;
- remoção da antiga visão “todos os documentos”;
- remoção do antigo filtro por tipo via select;
- cards de documento mais informativos, com tamanho do arquivo em MB;
- suporte real a arquivos `.PDF` e `.XLSX` na Biblioteca;
- ordenação alfabética na listagem por tipo;
- validação de upload da Biblioteca com regras centralizadas;
- tratamento seguro para arquivos legados sem `tamanho_bytes` e sem `extensao_arquivo`;
- download correto para `.pdf` e `.xlsx`;
- correção do bug de reenvio simbólico herdado da fase mock.

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
- `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`;
- `docs/specs/spec-13-shell-autenticado-e-orientacao-global.md`.

## Dependência explícita da Spec 13
Esta spec depende diretamente da Spec 13 e deve reaproveitar:
- barra inferior persistente;
- regra de módulo ativo;
- regra de `← Voltar`;
- shell autenticado;
- uso mínimo de ícones locais.

Antes de finalizar esta spec, o Kiro deve ampliar o mapeamento do módulo ativo para incluir:
- `biblioteca` → módulo `Biblioteca`
- `biblioteca-tipo` → módulo `Biblioteca`
- `biblioteca-busca` → módulo `Biblioteca`
- `arquivo-novo` → módulo `Biblioteca`
- `arquivo-editar` → módulo `Biblioteca`

## Fonte de verdade para esta spec
Em caso de dúvida, seguir esta ordem:
1. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `docs/specs/spec-12-ajustes-tipos-e-comum-congregacao.md`
3. `docs/specs/spec-13-shell-autenticado-e-orientacao-global.md`
4. esta spec
5. código já existente do repositório

Se houver conflito real entre esta spec e o contrato de dados atual, parar e pedir confirmação humana.

## Escopo desta spec
Esta spec cobre:
- Lote C — descoberta e escaneabilidade da Biblioteca;
- parte da Sprint 3 ligada aos metadados da Biblioteca;
- parte da Sprint 3 ligada ao upload da Biblioteca;
- correções técnicas mínimas necessárias para `.pdf` e `.xlsx`.

## Fora de escopo
Não implementar aqui:
- paginação da Biblioteca;
- retorno da antiga listagem completa;
- retorno do antigo filtro por tipo via select;
- busca full-text com serviço externo;
- Firestore Enterprise text search;
- Algolia, Meilisearch ou solução externa de busca;
- alteração do módulo de Solicitações;
- criação de novo módulo;
- compressão automática de arquivos;
- mudança da barra inferior já decidida na Spec 13.

## Decisões já fechadas que o Kiro deve tratar como obrigatórias
- A Biblioteca não abre mais com listagem completa.
- A descoberta passa a acontecer por escolha de tipo ou busca por nome do arquivo.
- Não deve existir mais visão ou opção explícita de `todos os documentos`.
- A barra de busca por nome aparece somente na tela inicial da Biblioteca.
- A busca por nome abre uma tela própria de resultados.
- A tela de resultados da busca pode misturar arquivos de tipos diferentes.
- A listagem por tipo não exibe busca por nome.
- A listagem por tipo não exibe select de filtro por tipo.
- O tipo de arquivo é representado por ícone.
- O status e o nível de acesso continuam sendo representados por badge/indicador semântico já existente.
- A ordenação alfabética vale apenas para a listagem por tipo.
- O tamanho do arquivo deve aparecer em MB:
- na listagem por tipo;
- na tela de resultados da busca;
- na modal de ação do arquivo.
- A paginação foi removida do módulo da Biblioteca.
- Na Biblioteca, os formatos permitidos são `.PDF` e `.XLSX`.
- O limite padrão de upload na Biblioteca é 2 MB.
- Existe exceção apenas para arquivos do tipo `metodos`, com limite de 50 MB.
- Ícones do Lucide continuam locais, sem biblioteca completa.
- O arquivo único de configuração de upload deve ser exatamente `src/servicos/casos_de_uso/regrasUpload.js`.

## Tipos oficiais da Biblioteca
Usar exatamente os tipos oficiais definidos em `TIPOS_ARQUIVO` em `src/servicos/casos_de_uso/biblioteca.js`, conforme a Spec 12:
- `circulares`
- `topicos`
- `metodos`
- `planos_aula`
- `provas`
- `modelos`
- `outros`

O Kiro não deve criar novos tipos nem hardcode paralelo fora da constante oficial.

## Arquivos e áreas do projeto que devem ser inspecionados primeiro
O Kiro deve revisar antes de alterar:
- `src/modulos/biblioteca/PaginaBiblioteca.vue`
- `src/modulos/biblioteca/DetalheArquivo.vue`
- `src/modulos/admin/PaginaArquivoForm.vue`
- `src/router/index.js`
- `src/componentes/CabecalhoPagina.vue`
- `src/componentes/BaseCard.vue`
- `src/componentes/BaseBotao.vue`
- `src/componentes/UploaderArquivo.vue`
- `src/componentes/EstadoVazio.vue`
- `src/componentes/tokens.css`
- `src/composables/usarSessao.js`
- `src/servicos/casos_de_uso/biblioteca.js`
- `src/servicos/casos_de_uso/bibliotecaAdmin.js`
- `src/servicos/casos_de_uso/formato.js`
- `src/servicos/infraestrutura_arquivos/firebase.js`
- `src/servicos/infraestrutura_arquivos/index.js`
- `src/servicos/repositorios/repositorioArquivos.js`
- `storage.rules`
- `tests/regras/arquivos.test.js`, se vier a existir

## Estratégia operacional obrigatória
Antes de implementar:
- identificar quais partes pertencem à tela inicial, à listagem por tipo, à busca por nome e ao upload;
- listar os arquivos afetados;
- preservar os comportamentos administrativos existentes, exceto onde esta spec manda mudar.

Durante a execução:
- não reativar a visão antiga da Biblioteca;
- não manter as duas arquiteturas em paralelo;
- não criar busca dependente de serviço externo;
- não instalar biblioteca nova;
- não criar solução sofisticada de search sem necessidade;
- não assumir que todos os arquivos já possuem `tamanho_bytes` e `extensao_arquivo`.

## Regra anti-alucinação para a busca por nome
A busca por nome da Biblioteca deve ser implementada de forma compatível com a stack atual do MVP.

O Kiro deve:
- reutilizar o escopo de visibilidade já existente da Biblioteca por setor e perfil;
- buscar sobre o campo de título do arquivo;
- usar estratégia compatível com o projeto atual sem introduzir novos serviços.

O Kiro não deve:
- assumir disponibilidade de full-text search corporativo;
- introduzir Algolia, Meilisearch ou outro serviço;
- inventar infraestrutura externa;
- travar a spec em recursos não aprovados.

Para o MVP, é aceitável que a busca por nome seja construída a partir da lista visível de arquivos do setor/perfil e filtrada por nome em camada de aplicação, desde que:
- respeite visibilidade por perfil;
- respeite setor ativo;
- produza resultados corretos;
- não altere contrato de segurança.

## Regra anti-alucinação para textos das descrições por tipo
Cada card de tipo deve ter descrição curta com exemplos de conteúdo daquele grupo.

O Kiro deve:
- escrever descrições curtas, conservadoras e fáceis de revisar;
- usar linguagem funcional;
- evitar texto promocional;
- evitar afirmar regras de negócio não documentadas.

O Kiro não deve:
- criar textos longos;
- criar copy publicitária;
- inventar fluxos ou restrições não aprovadas.

## Lote C — nova experiência da Biblioteca

### Objetivo do lote
Substituir a entrada antiga da Biblioteca por uma navegação em três camadas:
1. tela inicial do módulo;
2. listagem por tipo;
3. resultados da busca por nome.

### Rotas obrigatórias da Biblioteca
A Biblioteca deve passar a trabalhar com estas rotas:
- `biblioteca` → tela inicial do módulo
- `biblioteca-tipo` → tela de listagem por tipo
- `biblioteca-busca` → tela de resultados da busca

Sugestão objetiva de paths:
- `/biblioteca`
- `/biblioteca/tipo/:tipo`
- `/biblioteca/busca`

Regra para busca:
- o termo de busca deve ir em query string, por exemplo `?q=modelo`
- termo vazio após `trim()` não deve disparar navegação para resultados

### Tela inicial da Biblioteca
`PaginaBiblioteca.vue` deixa de ser uma listagem de arquivos e passa a ser a tela inicial do módulo.

Ela deve exibir:
- cabeçalho do módulo;
- ação administrativa existente, se aplicável;
- barra de busca por nome;
- cards grandes por tipo.

Ela não deve exibir:
- listagem de documentos;
- select de filtro por tipo;
- opção `Todos os tipos`;
- opção `Todos os documentos`.

### Barra de busca da tela inicial
A barra de busca:
- aparece somente na tela inicial da Biblioteca;
- busca por nome do arquivo em todos os tipos visíveis ao usuário;
- ao submeter um termo válido, navega para `biblioteca-busca` com query string;
- não deve coexistir com a listagem por tipo;
- não deve reaparecer na tela de resultados nem na tela de listagem por tipo.

### Cards de tipo na tela inicial
Cada card de tipo deve mostrar:
- ícone do tipo;
- título com o rótulo oficial do tipo;
- descrição curta com exemplos de arquivos daquele tipo.

Regras:
- usar os tipos oficiais de `TIPOS_ARQUIVO`;
- não criar card extra para “todos”;
- não transformar o card em banner;
- não usar imagem decorativa;
- preservar linguagem visual dos cards já existentes no design system.

### Tela de listagem por tipo
A listagem por tipo deve existir em tela própria.

Esta tela:
- é acessada ao clicar em um card de tipo na tela inicial;
- deve exibir `← Voltar` conforme a Spec 13;
- deve exibir subtítulo com ícone do tipo e nome do tipo listado;
- não deve exibir busca por nome;
- não deve exibir select de tipo;
- deve listar apenas arquivos daquele tipo;
- deve manter comportamento administrativo já existente para editar e remover, quando o usuário for admin.

### Ordenação da listagem por tipo
A listagem por tipo deve ser ordenada alfabeticamente por título do arquivo.

Regra obrigatória:
- essa ordenação vale apenas para a listagem por tipo;
- não criar nova regra de ordenação para a tela inicial;
- não reordenar a busca por nome além do necessário para a estratégia adotada.

### Tela de resultados da busca
A busca por nome deve abrir uma tela própria de resultados.

Esta tela:
- deve exibir `← Voltar`;
- pode misturar arquivos de tipos diferentes;
- deve mostrar o tipo do arquivo em cada card individual;
- deve manter a visibilidade por perfil e setor já aplicada no módulo;
- pode reutilizar a modal de ação de arquivo;
- não deve exibir a barra de busca novamente;
- não deve exibir o select antigo de tipo.

### Estado vazio da busca
Se a busca por nome não encontrar resultados:
- mostrar estado vazio dedicado;
- sugerir tentar outro termo similar;
- não sugerir “remover filtro de tipo”, porque não existe mais filtro de tipo nessa tela.

Se for necessário evoluir `EstadoVazio.vue`, fazê-lo de forma retrocompatível e simples.

## Cartões de documento e metadados

### Exibição do tamanho do arquivo
O tamanho do arquivo deve ser exibido em MB de forma amigável.

Ele deve aparecer:
- na listagem por tipo;
- na tela de resultados da busca;
- na modal de ação ao clicar em um arquivo.

Ele não deve aparecer:
- na tela inicial da Biblioteca por tipos.

### Regra visual para o tamanho
O tamanho do arquivo deve ser apresentado:
- de forma limpa;
- de forma escaneável;
- sem competir com o título;
- com espaçamento coerente com os demais metadados.

### Modal de ação do arquivo
`DetalheArquivo.vue` deve continuar sendo o ponto de ação do arquivo, com ajustes necessários.

Ela deve passar a exibir:
- tipo;
- data de atualização;
- tamanho em MB;
- nível de acesso, quando aplicável ao admin;
- ação de download.

Ela deve continuar simples e não virar página complexa.

## Tratamento obrigatório de arquivos legados

### Novos campos
A coleção `arquivos` passa a persistir, a partir desta spec:
- `extensao_arquivo`
- `tamanho_bytes`

Regras:
- persistir ambos em novos uploads;
- persistir ambos quando houver substituição real do binário;
- `extensao_arquivo` deve ser salva em minúsculas, sem ponto;
- `tamanho_bytes` deve ser inteiro numérico;
- a UI formata MB apenas na camada de apresentação.

### Sem migração retroativa agora
Não haverá migração retroativa em massa nesta sprint.

Isso significa:
- arquivos legados podem continuar sem `extensao_arquivo`;
- arquivos legados podem continuar sem `tamanho_bytes`;
- a interface deve continuar funcionando mesmo nesses casos.

### Regra para inferir extensão em arquivos legados
Quando `extensao_arquivo` não existir, inferir a extensão nesta ordem:
1. usar `extensao_arquivo`, se existir;
2. fazer parse do `id_nuvem`;
3. se ainda assim não for possível inferir, assumir `pdf`.

Esta regra vale para:
- download;
- recálculo de `id_nuvem`;
- edição de metadados;
- qualquer lógica que precise conhecer a extensão real.

### Regra para exibir tamanho em arquivos legados
Quando `tamanho_bytes` não existir:
- exibir `—` como tamanho indisponível;
- não quebrar a listagem;
- não quebrar a modal;
- não bloquear download por ausência desse campo.

## Upload e contrato técnico da Biblioteca

### Arquivo central obrigatório de regras
Esta spec deve criar exatamente:
- `src/servicos/casos_de_uso/regrasUpload.js`

Este arquivo deve concentrar:
- formatos permitidos por módulo;
- limites por módulo;
- exceções por tipo;
- helpers simples de validação.

A Spec 15 deverá reutilizar este mesmo arquivo, sem duplicação.

### Mudança obrigatória no caminho do arquivo no Storage
Hoje a montagem do `id_nuvem` da Biblioteca presume `.pdf`.

Isso não é mais válido.

A partir desta spec, o caminho oficial da Biblioteca passa a ser:
- `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}`

Onde:
- `extensao` deve refletir o formato real do arquivo aprovado;
- formatos aceitos nesta spec: `pdf` e `xlsx`;
- a extensão deve ser normalizada em minúsculas.

O Kiro deve ajustar:
- geração de `id_nuvem`;
- download;
- substituição de binário;
- remoção;
- qualquer comentário técnico que ainda assuma `.pdf` fixo na Biblioteca.

### Regra de edição sem novo binário
É proibido manter a estratégia antiga de reenvio simbólico com objeto fictício como `{ nome }`.

Nova regra obrigatória:
- se a edição não altera o binário e não altera o caminho final, não fazer upload;
- se a edição não altera o binário, mas altera o caminho final, mover o binário existente de forma real;
- esse movimento deve usar o arquivo existente como fonte real de bytes;
- depois de gravar no novo caminho com sucesso, remover o antigo, quando aplicável;
- se o arquivo antigo não puder ser lido, falhar de forma explícita e não fingir sucesso.

O Kiro não deve:
- chamar `uploadBytes` com objeto simbólico;
- simular upload quando não houver binário real;
- mascarar erro técnico com atualização parcial inconsistente.

### Download com extensão e tipo corretos
O download da Biblioteca não pode mais assumir PDF fixo.

O Kiro deve garantir que o download funcione corretamente para:
- `.pdf`
- `.xlsx`

Regras:
- o nome final do arquivo deve respeitar a extensão real;
- o tipo MIME do blob ou estratégia equivalente deve respeitar a extensão real;
- o fallback genérico `arquivo.pdf` não é mais aceitável na Biblioteca;
- se o arquivo for legado sem `extensao_arquivo`, usar a regra de inferência por `id_nuvem` com fallback `pdf`.

## Validação de upload da Biblioteca

### Formatos permitidos
Na Biblioteca:
- permitir `.PDF`
- permitir `.XLSX`

Regras:
- validação deve considerar extensão e/ou tipo do arquivo de forma robusta;
- normalizar comparação sem depender de caixa alta/baixa.

### Limites de tamanho
Na Biblioteca:
- limite padrão: 2 MB
- exceção: tipo `metodos` pode chegar a 50 MB

Regras:
- a exceção vale somente para a Biblioteca;
- a exceção depende do tipo escolhido no formulário;
- demais tipos continuam em 2 MB;
- a hint e a validação devem reagir dinamicamente ao tipo selecionado.

### Hint obrigatória abaixo do campo de upload
O formulário da Biblioteca deve mostrar, abaixo do uploader:
- formatos aceitos;
- limite padrão;
- exceção de `Métodos`, quando aplicável.

Se `UploaderArquivo.vue` precisar evoluir para suportar hint/ajuda, fazê-lo de forma simples e reutilizável.

### Erros de validação
Quando houver erro de validação de upload na Biblioteca:
- a mensagem deve ser clara;
- a mensagem deve aparecer em vermelho;
- a ação de salvar/cadastrar deve ficar desabilitada enquanto o estado inválido persistir;
- o restante do formulário deve permanecer preenchido;
- apenas o arquivo inválido deve ser tratado como pendente de correção.

## Arquitetura e implementação sugerida
O Kiro pode:
- transformar `PaginaBiblioteca.vue` em tela inicial do módulo;
- criar `PaginaBibliotecaTipo.vue`;
- criar `PaginaBibliotecaBusca.vue`;
- criar helper de busca e formatação no domínio da Biblioteca;
- criar helper para formatar tamanho em MB;
- ampliar `DetalheArquivo.vue`;
- evoluir `UploaderArquivo.vue` para aceitar ajuda/hint;
- atualizar `repositorioArquivos.js` e `bibliotecaAdmin.js` para suportar `tamanho_bytes`, `extensao_arquivo` e extensão real do `id_nuvem`;
- atualizar a infraestrutura de download para `.pdf` e `.xlsx`;
- corrigir o fluxo técnico de mover binário existente quando o caminho mudar sem novo upload.

O Kiro não deve:
- manter a tela antiga de listagem ampla em paralelo;
- instalar biblioteca de busca;
- criar novo backend;
- inventar cache complexo;
- reescrever toda a Biblioteca admin sem necessidade;
- manter o bug do reenvio simbólico.

## Validação obrigatória da spec
Esta spec só pode ser dada como concluída se:
- a Biblioteca inicial mostrar busca por nome e cards por tipo;
- a antiga listagem ampla tiver deixado de ser a entrada do módulo;
- não existir mais opção explícita de `todos os documentos`;
- existir tela própria de listagem por tipo;
- existir tela própria de resultados da busca;
- a busca respeitar setor e perfil;
- a listagem por tipo estiver em ordem alfabética;
- o tamanho em MB aparecer nos locais definidos;
- quando `tamanho_bytes` não existir, a UI exibir `—` sem quebrar;
- a modal de detalhe mostrar tamanho;
- uploads `.pdf` e `.xlsx` funcionarem na Biblioteca;
- uploads de tipo `metodos` aceitarem até 50 MB;
- demais tipos na Biblioteca respeitarem 2 MB;
- `tamanho_bytes` estiver sendo persistido corretamente em novos uploads e substituições;
- `extensao_arquivo` estiver sendo persistida corretamente em novos uploads e substituições;
- o download funcionar para `.pdf` e `.xlsx`;
- arquivos legados sem `extensao_arquivo` ainda possam ser baixados por inferência;
- o bug de reenvio simbólico tiver sido removido;
- a paginação da Biblioteca não exista;
- a build continue íntegra.

## Forma de validação aceita para esta spec
Para esta spec, é suficiente validar comportamento:
- em ambiente local;
- com Firebase Emulator;
- com navegação manual e cenários de upload/download locais.

A validação em produção do Storage pode ficar adiada até a habilitação de Billing/Storage real.
Isso não impede considerar esta spec pronta no contexto do MVP local.

## Restrições explícitas finais
Durante esta spec, o Kiro não deve:
- alterar regras da barra inferior;
- criar paginação da Biblioteca;
- reintroduzir filtro por tipo via select;
- reintroduzir visão “todos os documentos”;
- criar novo tipo de arquivo;
- exigir serviço de busca externa;
- alterar o módulo de Solicitações;
- implementar compressão automática;
- instalar a biblioteca completa do Lucide.

## Resultado final esperado
Ao concluir esta spec, a Biblioteca do Portal Musical deve funcionar como um módulo guiado por tipos e busca por nome, com telas mais previsíveis, metadados mais úteis, suporte real a `.pdf` e `.xlsx`, tratamento seguro de arquivos legados e upload mais robusto, preservando a simplicidade visual do MVP e sem introduzir dependências novas desnecessárias.