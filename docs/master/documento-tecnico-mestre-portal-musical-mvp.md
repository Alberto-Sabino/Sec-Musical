# Documento técnico mestre — Portal Musical MVP

## 1. Objetivo deste documento
Consolidar em uma única referência a visão funcional, técnica, operacional e de segurança do MVP do **Portal Musical**, usando como base as notas já aprovadas no workspace.

Este documento deve servir para:
- alinhar produto, operação e desenvolvimento;
- orientar execução assistida por IA;
- apoiar o setup técnico do projeto;
- reduzir ambiguidades antes da implementação;
- facilitar onboarding e manutenção futura.

---

## 2. Contexto do problema
Hoje, parte importante da comunicação entre **Encarregados** e **Secretários Musicais** acontece de forma dispersa, principalmente por WhatsApp, conversas diretas e circulação manual de documentos.

Isso gera:
- dúvidas simples e recorrentes chegando individualmente aos Secretários;
- documentos espalhados em grupos e conversas privadas;
- risco de uso de versões antigas ou desatualizadas;
- baixa rastreabilidade das solicitações operacionais;
- ausência de um local único para consulta, acompanhamento e devolutiva.

O problema principal não é apenas armazenar arquivos, mas **centralizar a informação oficial e organizar o fluxo operacional entre Encarregados e Secretários**.

---

## 3. Objetivo do MVP
Criar um **portal web simples, mobile-first e escalável**, acessado preferencialmente por celular, para centralizar:

1. **Biblioteca de conteúdos oficiais** da parte musical;
2. **Solicitações operacionais** feitas pelos Encarregados;
3. **Devolutiva organizada** dos Secretários dentro do próprio sistema.

### Critérios de sucesso do MVP
O MVP será considerado bem-sucedido quando houver:
- redução perceptível de dúvidas simples enviadas por WhatsApp;
- uso do portal como fonte principal de documentos oficiais;
- centralização das solicitações por setor;
- acompanhamento simples do fluxo por parte do Secretário;
- capacidade do Encarregado de consultar status e baixar a devolutiva final.

---

## 4. Perfis e modelo de operação
### 4.1 Usuário
Representa o **Encarregado local ou regional**.

### 4.2 Admin
Representa o **Secretário Musical**.

### 4.3 Regra de precedência
Se uma pessoa acumular, na prática, os dois papéis, no sistema ela será cadastrada **somente como Admin**.

### 4.4 Regra de setores
- Usuário comum pertence a **um único setor**.
- Admin pode atuar em **um ou mais setores**.
- O Admin deve operar, na interface, com **um setor ativo por vez**, para simplificar navegação, consultas e regras.

---

## 5. Escopo funcional do MVP
O MVP possui **dois módulos principais**.

### 5.1 Biblioteca
Função: centralizar documentos oficiais da parte musical.

Tipos iniciais:
- circulares
- topicos
- metodos - planos_aula - provas - modelos - outros Funcionalidades: - listar arquivos permitidos; - filtrar por tipo; - baixar arquivo; - permitir ao Admin cadastrar, atualizar e remover arquivos; - permitir auditoria básica de alterações. ### 5.2 Solicitações Função: organizar pedidos operacionais e a devolutiva correspondente. Tipos iniciais: - avaliacao_exame
- ingresso_gem
- troca_instrumento
- compra_manutencao
- transferencia
- novo_colaborador

Status:
- em_aberto - em_andamento
- concluida
- cancelada

Funcionalidades do Usuário:
- criar solicitação;
- listar as próprias solicitações;
- editar enquanto estiver em aberto;
- cancelar enquanto estiver em aberto;
- baixar anexo final ao concluir.

Funcionalidades do Admin:
- ver fila do setor;
- filtrar por status;
- assumir solicitação em aberto;
- registrar comentário público;
- anexar arquivo final único;
- concluir ou cancelar a solicitação.

---

## 6. Regras de negócio principais
### Biblioteca
- Todo usuário autenticado vê apenas os documentos compatíveis com seu perfil e setor.
- Arquivos restritos só são visíveis para Admin.
- Somente Admin pode cadastrar, atualizar e remover arquivos.

### Solicitações
- Toda solicitação nasce como `em_aberto`.
- O Usuário só vê as próprias solicitações.
- O Usuário só pode editar ou cancelar enquanto a solicitação estiver `em_aberto`.
- O Admin só pode ver e tratar solicitações de setores aos quais está vinculado.
- A solicitação terá **um único anexo final** no MVP.

### Transições válidas de status
#### Usuário
- `em_aberto -> em_aberto`
- `em_aberto -> cancelada`

#### Admin
- `em_aberto -> em_andamento`
- `em_andamento -> concluida`
- `em_aberto -> cancelada`
- `em_andamento -> cancelada`

---

## 7. Páginas mínimas do MVP
- login
- início
- biblioteca
- detalhe de arquivo
- minhas solicitações
- nova solicitação
- detalhe da solicitação
- fila do admin
- detalhe administrativo da solicitação
- cadastro/edição de arquivo

---

## 8. Arquitetura técnica escolhida
A solução será construída com arquitetura simples baseada em **Vue + Firebase**, evitando backend tradicional no fluxo principal do MVP.

### Stack principal
- **Vue** para interface
- **Firebase Authentication** para login e sessão
- **Cloud Firestore** para dados
- **Cloud Storage** para arquivos
- **Firebase Hosting** para publicação
- **Firebase Security Rules** para autorização
- **Firebase Emulator Suite** para desenvolvimento e testes locais
- **Git** para versionamento
- **Firebase CLI** para deploy e configuração

### Decisão central
No MVP:
- o upload e o download acontecem pela própria aplicação;
- Firestore e Storage são tratados como parte central da arquitetura;
- a segurança não depende apenas da interface;
- não haverá backend tradicional obrigatório para o fluxo principal.

### Quando adicionar Cloud Functions
Somente se houver necessidade real de:
- lógica privilegiada adicional;
- notificações automáticas;
- rotinas agendadas;
- integrações externas;
- saneamento automático de dados órfãos.

---

## 9. Contrato de dados consolidado
### Coleção `usuarios`
Campos principais:
- `id_usuario`
- `nome_completo`
- `email`
- `celular`
- `comum_congregacao`
- `nivel_acesso`
- `ativo`
- `ids_setor`
- `data_criacao`
- `data_atualizacao`

### Coleção `setores`
Campos principais:
- `id_setor`
- `nome`
- `ativo`
- `data_criacao`
- `data_atualizacao`

### Coleção `arquivos`
Campos principais:
- `id_arquivo`
- `id_setor`
- `tipo`
- `titulo`
- `nivel_acesso`
- `id_nuvem`
- `id_usuario`
- `data_inclusao`
- `data_atualizacao`

### Coleção `solicitacoes`
Campos principais:
- `id_solicitacao`
- `id_setor`
- `id_solicitante`
- `nome_solicitante`
- `comum_congregacao`
- `nome_beneficiario`
- `id_responsavel`
- `nome_responsavel`
- `tipo`
- `status`
- `descricao`
- `conclusao`
- `id_nuvem`
- `data_solicitacao`
- `data_atualizacao`

> `nome_solicitante` e `nome_responsavel` são campos de exibição (denormalizados):
> gravados na criação (solicitante) e ao assumir (responsável). Evitam expor `id`
> na interface e mantêm a leitura de `usuarios` restrita ao próprio documento.
>
> `comum_congregacao` (exibido na interface como "Comum Congregação") é um valor fixo
> atribuído ao usuário em `usuarios` e **denormalizado** na solicitação na criação
> (mesmo padrão de `nome_solicitante`). É **obrigatório** e **imutável** após a criação.
> A regra de segurança exige que o valor gravado seja igual ao do documento do próprio
> solicitante. Visível ao solicitante e ao admin do setor.
>
> `nome_beneficiario` (exibido na interface como "Pessoa afetada") identifica o músico
> ou instrutor para quem a ficha é gerada. É **obrigatório** na criação e **imutável**
> depois (nem solicitante nem responsável podem alterá-lo).
>
> `descricao` é o texto do solicitante (obrigatório na criação). Só pode ser editado
> enquanto a solicitação está `em_aberto`.
>
> `conclusao` é a resposta do responsável. Nasce vazia, só pode ser gravada/alterada
> enquanto `em_andamento` e é exibida ao solicitante apenas quando a solicitação está
> `concluida`. Ao concluir, cancelar ou assumir, o valor de `conclusao` é imutável.

### Subcoleções de auditoria
- `arquivos/{id_arquivo}/auditoria`
- `solicitacoes/{id_solicitacao}/auditoria`

---

## 10. Convenção de arquivos e `id_nuvem` ### Biblioteca - `biblioteca/{id_setor}/nivel_1/{id_arquivo}`
- `biblioteca/{id_setor}/nivel_2/{id_arquivo}`

### Solicitações
- `solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta`

### Diretrizes
- o Firestore armazena apenas `id_nuvem`;
- não persistir URL pública fixa no banco;
- o download sempre parte do caminho salvo;
- o caminho deve refletir setor, contexto e permissão.

---

## Modo transitório de execução sem Cloud Storage de produção
Enquanto o projeto estiver sem Cloud Billing habilitado para o Cloud Storage for Firebase de produção, as operações de arquivo são executadas de forma **real** contra o **Storage emulator local**, que não exige Billing. Não há camada simulada (mock).

> Decisão atual (supera a estratégia de mock): como o desenvolvimento e o login dependem dos emuladores, a infraestrutura de arquivos usa o SDK real do Storage. Em desenvolvimento aponta para o emulador; em produção apontará para o Storage real (pendente de Billing). A antiga camada mock foi removida.

### Regras deste modo transitório
- a interface e os casos de uso permanecem iguais ao modo final;
- a seleção de destino (emulador vs produção) fica isolada na camada de infraestrutura, controlada por `VITE_APP_MODE`;
- a interface não conhece o destino do Storage;
- o contrato de dados não muda;
- `id_nuvem` continua obrigatório nos fluxos em que ele exista e deve seguir o formato oficial do projeto;
- não persistir URL pública fixa;
- não criar campos temporários no Firestore.

### Escopo permitido no modo transitório
Permitido:
- listar, baixar, enviar, substituir e remover arquivos da Biblioteca (reais, via emulador);
- enviar e baixar o anexo final de Solicitações (real, via emulador);
- persistir no Firestore somente os campos já previstos no contrato.

Não permitido:
- declarar o Storage de **produção** como validado;
- declarar as regras de Storage de **produção** como testadas;
- declarar a segurança de arquivos de **produção** como concluída;
- alterar o contrato de dados.

### Objetivo
Permitir avanço do desenvolvimento com operações de arquivo reais (via emulador), garantindo transição ao Storage de produção apenas trocando `VITE_APP_MODE` para `producao`, sem mudança de telas, fluxos ou contrato.

---

## 11. Segurança e autorização
### Princípios
- negar tudo por padrão;
- liberar apenas o necessário;
- não confiar na interface para segurança;
- usar Firestore e Storage como fonte real de proteção;
- impedir que o cliente se promova ou altere permissões críticas.

### Regras essenciais
- autenticado lê apenas o próprio documento em `usuarios`;
- leitura de `setores` permitida a usuário ativo que pertence ao setor (apenas para exibir o nome; sem escrita pelo cliente);
- cliente não altera `nivel_acesso`, `ids_setor` ou `ativo`;
- Usuário vê apenas biblioteca pública do próprio setor;
- Admin vê biblioteca pública e restrita dos próprios setores;
- Usuário vê apenas suas solicitações;
- Admin vê solicitações dos setores em que atua;
- apenas Admin envia arquivos para biblioteca e anexo final de solicitações.

### Proteção operacional
- arquivos não serão públicos;
- leitura e escrita dependerão de autenticação e regras;
- mudanças de status devem respeitar o fluxo definido;
- assumir solicitação deve acontecer com transação.

---

## 12. Fluxos críticos consolidados
### 12.1 Upload de arquivo da Biblioteca
1. gerar `id_arquivo`
2. montar `id_nuvem`
3. enviar para Storage
4. após sucesso, gravar documento em `arquivos`

### 12.2 Atualização com troca de arquivo
1. enviar novo arquivo
2. atualizar metadados e `id_nuvem`
3. remover arquivo antigo, se aplicável

### 12.3 Criação de solicitação
1. usuário cria solicitação
2. sistema grava com `status = em_aberto`
3. solicitação aparece na lista do solicitante

### 12.4 Assumir solicitação
1. admin lê solicitação
2. valida se ainda está `em_aberto`
3. transação grava `em_andamento`
4. grava `id_responsavel`
5. atualiza data

### 12.5 Upload de anexo final
1. montar caminho final
2. enviar arquivo ao Storage
3. atualizar solicitação com `id_nuvem`
4. gravar comentário, se houver
5. concluir solicitação

---

## 13. Consultas e índices esperados
### Consultas principais
#### Biblioteca — usuário
- `id_setor = setor do usuário`
- `nivel_acesso = 1`
- filtro opcional por `tipo`

#### Biblioteca — admin
- `id_setor = setor ativo`
- filtro opcional por `nivel_acesso`
- filtro opcional por `tipo`

#### Solicitações — usuário
- `id_solicitante = usuário atual`

#### Solicitações — admin
- `id_setor = setor ativo`
- filtro opcional por `status`

### Índices recomendados
#### `arquivos`
- `id_setor + nivel_acesso + data_atualizacao`
- `id_setor + nivel_acesso + tipo + data_atualizacao`

#### `solicitacoes`
- `id_solicitante + data_solicitacao`
- `id_setor + status + data_atualizacao`
- `id_setor + data_atualizacao`

---

## 14. Desenvolvimento assistido por IA
O desenvolvimento será **assistido por agente de IA**, com uso do **Kiro** como apoio na implementação.

### Papel do Kiro
- gerar estruturas iniciais;
- acelerar componentes e telas;
- apoiar integrações;
- reduzir trabalho repetitivo;
- sugerir refatorações controladas;
- operar com base nas specs e no steering.

### Regra de governança
- a IA acelera;
- as specs orientam;
- o steering restringe e organiza;
- a validação humana aprova a execução.

---

## 15. Steering e padrões de implementação
### Princípios
- clareza antes de flexibilidade;
- simplicidade antes de abstração;
- evitar overengineering;
- não introduzir backend tradicional sem necessidade real;
- não criar campos e fluxos fora do que foi aprovado.

### Organização sugerida do projeto
- `src/app`
- `src/modulos`
- `src/modulos/biblioteca`
- `src/modulos/solicitacoes`
- `src/modulos/autenticacao`
- `src/modulos/admin`
- `src/servicos/firebase`
- `src/servicos/repositorios`
- `src/servicos/casos_de_uso`
- `src/componentes`
- `src/composables`
- `src/router`
- `src/tests`

---

## 16. Design system e consistência visual
Antes da construção intensiva de telas, será criada uma base de **componentes reutilizáveis** para funcionar como design system centralizado.

### Componentes iniciais esperados
- botão
- input
- select
- textarea
- card
- list item
- badge de status
- modal de confirmação
- uploader de arquivo
- empty state
- loading state

### Decisões centralizadas
- cores
- tipografia
- espaçamentos
- ícones
- estados visuais
- comportamento responsivo

Objetivo: garantir consistência visual, acelerar implementação e reduzir retrabalho.

---

## 17. Testes e validação
### Testes prioritários
- login e carregamento do usuário;
- leitura correta da biblioteca por perfil;
- criação de solicitação;
- edição e cancelamento em aberto;
- transação de assumir solicitação;
- upload e vínculo de `id_nuvem`;
- conclusão da solicitação;
- bloqueio de acesso indevido.

### Abordagem
- uso do **Firebase Emulator Suite**;
- testes manuais guiados pelos fluxos críticos;
- validação humana do código assistido por IA;
- verificação de segurança em Firestore e Storage.

---

## 18. Fora de escopo do MVP
- geração automática de fichas;
- preenchimento automático de PDFs;
- gestão completa de usuários por interface;
- múltiplos perfis ativos na interface;
- múltiplos anexos por solicitação;
- comentários internos separados dos públicos;
- workflows avançados de aprovação;
- notificações sofisticadas obrigatórias;
- trilha corporativa completa de auditoria.

---

## 19. Sequência lógica após esta consolidação
1. transformar o escopo em backlog executável;
2. criar specs operacionais por tela e fluxo;
3. criar steering específico para o Kiro;
4. definir design system base;
5. iniciar setup técnico do projeto Vue + Firebase.

---

## 20. Síntese final
O Portal Musical MVP nasce para resolver uma dor operacional clara: **tirar a comunicação dispersa do centro do processo e substituí-la por um portal simples, organizado, rastreável e seguro**.

A solução foi conscientemente desenhada para ser:
- simples de operar;
- barata no início;
- forte em controle de acesso;
- centrada em celular;
- evolutiva sem complexidade prematura.

Este documento passa a ser a principal referência consolidada para iniciar o bloco de execução do projeto.