# Spec 09 — Execução operacional da Sprint 1

## Objetivo
Converter a Sprint 1 em um roteiro executável direto pelo Kiro, com lotes sequenciais, critérios de saída claros e dependência explícita das specs de domínio.

## Resultado esperado da Sprint 1
Ao final desta spec, o projeto deve ter:
- base técnica executável;
- Vue + Firebase configurados;
- design system base utilizável;
- autenticação e contexto do usuário funcionando;
- Biblioteca ponta a ponta para usuário e admin;
- upload, download, auditoria mínima e segurança correspondente da Biblioteca.

## Docs obrigatórios para esta execução
Ler antes de iniciar:
- Documento técnico mestre — Portal Musical MVP
- Steering 01 a Steering 05
- Spec 01 — Fundação técnica, ambiente e estrutura inicial
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first
- Spec 04 — Biblioteca: consulta, listagem, filtro e download
- Spec 05 — Biblioteca admin: cadastro, edição, remoção e auditoria
- Spec 08 — Segurança, auditoria e testes críticos

## Regra de execução desta spec
- executar lote por lote;
- não pular o lote atual por preferência técnica;
- não abrir a parte de Solicitações nesta fase, exceto estruturas neutras já necessárias ao projeto;
- segurança e testes do que for entregue devem nascer dentro da própria sprint.

## Lote 1 — Fundação executável do projeto
### Objetivo
Criar a base técnica reproduzível do repositório e deixar o projeto pronto para começar a receber módulos de negócio.

### Stories cobertas
- E1-S1
- E1-S2
- E1-S3
- E1-S4
- E1-S5
- E1-S6
- E1-S7

### Entregas obrigatórias
- repositório inicial organizado;
- aplicação Vue inicializada;
- integração de Firebase no projeto;
- configuração local de Auth, Firestore, Storage e Hosting;
- emuladores configurados;
- regras e índices versionados no projeto;
- convenção mínima documentada para setup local e execução.

### Arquivos e módulos esperados
- estrutura inicial em `src/` aderente ao steering técnico;
- configuração do Firebase;
- `firestore.rules`;
- `storage.rules`;
- `firestore.indexes.json`;
- arquivos de ambiente exemplificados;
- scripts de execução local;
- documentação curta de setup.

### Critério de saída do lote
- o projeto sobe localmente;
- a base de pastas está criada;
- emuladores conseguem ser iniciados;
- regras e índices já existem no versionamento;
- não há dependência estrutural obscura para seguir.

## Lote 2 — Design system base utilizável
### Objetivo
Criar a base visual mínima para acelerar as telas reais do MVP sem improvisação de interface.

### Stories cobertas
- E3-S1
- E3-S2
- E3-S3
- E3-S4
- E3-S5
- E3-S6
- E3-S7
- E3-S8

### Entregas obrigatórias
- tokens básicos de cor, tipografia e espaçamento;
- botão, input, select e textarea;
- card, header e container de página;
- loading, empty state, feedback de erro e sucesso;
- badge de status;
- modal de confirmação;
- uploader de arquivo.

### Regras específicas
- começar pelo celular;
- não adotar biblioteca visual complexa sem necessidade real;
- componentes devem nascer para uso imediato nas telas da sprint.

### Critério de saída do lote
- as telas de login e Biblioteca já podem ser montadas com componentes reutilizáveis;
- existe consistência mínima entre estados, ações e feedbacks;
- o uploader está pronto para o fluxo administrativo da Biblioteca.

## Lote 3 — Autenticação, sessão e contexto operacional
### Objetivo
Permitir login seguro, leitura do documento do usuário e resolução do setor ativo para admins.

### Stories cobertas
- E4-S1
- E4-S2
- E4-S3
- E4-S4
- E4-S5
- E4-S6
- E4-S7

### Entregas obrigatórias
- tela de login;
- logout funcional;
- carregamento do documento em `usuarios`;
- resolução de `nivel_acesso`, `ativo` e `ids_setor`;
- guards por autenticação;
- guards por papel;
- definição e persistência do setor ativo do admin.

### Regras específicas
- usuário inativo não entra no fluxo operacional;
- usuário sem documento operacional válido não entra no fluxo operacional;
- usuário comum trabalha com único setor;
- admin trabalha com um setor ativo por vez.

### Critério de saída do lote
- login e logout funcionam;
- contexto do usuário é carregado corretamente;
- guardas bloqueiam rotas indevidas;
- o admin consegue entrar já com setor ativo definido ou escolhê-lo de forma previsível.

## Lote 4 — Biblioteca de consulta
### Objetivo
Entregar a experiência de leitura da Biblioteca para usuário e admin com filtros, detalhe e download autenticado.

### Stories cobertas
- E5-S1
- E5-S2
- E5-S3
- E5-S4
- E5-S5
- E5-S6

### Entregas obrigatórias
- consulta de arquivos conforme perfil e setor;
- listagem ordenada por atualização;
- filtro por tipo;
- detalhe resumido do arquivo;
- download autenticado a partir de `id_nuvem`;
- sinalização visual de conteúdo público e restrito para admin.

### Regras específicas
- usuário comum só vê `nivel_acesso = 1` do próprio setor;
- admin vê documentos do setor ativo com `nivel_acesso = 1` e `2`;
- a UI não pode exibir ação que a regra não sustentará.

### Critério de saída do lote
- biblioteca funciona ponta a ponta para consulta;
- filtros e ordenação funcionam;
- download usa o caminho persistido;
- os estados de loading, vazio e erro estão cobertos.

### Regra transitória de arquivos para a Biblioteca
Se Cloud Storage for Firebase ainda não estiver disponível por ausência de Billing/Blaze, a Biblioteca pode ser entregue com infraestrutura simulada de arquivos, desde que:
- a UI permaneça igual à versão final;
- a consulta use o contrato oficial;
- o download seja simulado por implementação isolada;
- `id_nuvem` preserve o formato oficial.

### Critério adicional
A entrega com mock nesta fase conta como válida apenas para fluxo e interface.
Validação real de Storage permanece pendente para fechamento definitivo da parte de arquivo.

## Lote 5 — Biblioteca administrativa, auditoria e segurança da sprint
### Objetivo
Fechar a Biblioteca ponta a ponta, incluindo publicação administrativa, auditoria mínima e regras reais para o escopo entregue.

### Stories cobertas
- E6-S1
- E6-S2
- E6-S3
- E6-S4
- E6-S5
- E6-S6
- E6-S7
- E9-S1
- E9-S2
- E9-S4
- E10-S1
- E10-S3
- E10-S4
- E10-S7

### Entregas obrigatórias
- tela de cadastro e edição de arquivo;
- upload para Storage no fluxo correto;
- persistência dos metadados em `arquivos`;
- substituição de arquivo existente;
- remoção de arquivo;
- auditoria mínima em `arquivos/{id_arquivo}/auditoria`;
- regras de Firestore para `usuarios` e `arquivos`;
- regras de Storage para Biblioteca;
- testes dos cenários permitidos e bloqueados da entrega da sprint.

### Regras específicas
- primeiro enviar ao Storage, depois persistir no Firestore;
- `id_nuvem` deve seguir o contrato oficial da Biblioteca;
- somente admin pode publicar, editar e remover;
- auditoria mínima deve registrar ação, usuário e data.

### Regra transitória para upload administrativo
Se Storage real não estiver disponível:
- implementar interface de upload/substituição/remoção;
- implementar versão mock para comportamento de arquivo;
- persistir metadados compatíveis com o contrato;
- manter auditoria conforme o contrato;
- não declarar regras de Storage como concluídas.

### Critério de saída ajustado
Sem Billing/Blaze ativo, o lote pode fechar de forma parcial-operacional para fluxo, UI, Firestore e auditoria.
O fechamento definitivo da parte de arquivos depende de:
- Storage real
- regras reais de Storage
- validação de upload/download reais

### Critério de saída do lote
- admin publica, altera e remove documentos com fluxo funcional;
- usuário e admin leem apenas o que devem ler;
- regras bloqueiam acessos indevidos;
- testes mínimos da Biblioteca e autenticação estão validados.

## Gate final da Sprint 1
A Sprint 1 só termina quando todos os itens abaixo estiverem verdadeiros:
- setup local reproduzível;
- design system base pronto para reuso;
- autenticação e contexto operacional estáveis;
- setor ativo do admin funcional;
- Biblioteca de consulta funcionando para usuário e admin;
- Biblioteca administrativa funcionando com upload, persistência e remoção;
- auditoria mínima de arquivos registrada;
- regras e testes do escopo entregue funcionando.

## Proibição explícita nesta spec
Não iniciar como entrega da Sprint 1:
- criação e tratamento completo de solicitações;
- upload de anexo final de solicitações;
- conclusão do fluxo do usuário no módulo Solicitações;
- publicação do piloto.

## Saída para a próxima etapa
Somente após o gate final acima, seguir para a **Spec 10 — Execução operacional da Sprint 2**.