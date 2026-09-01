# Steering 03 — Dados, autorização e segurança

## Objetivo
Manter toda implementação aderente ao contrato de dados, às regras de acesso e ao modelo de segurança oficial do MVP.

## Fonte de verdade
Usar como referência principal:
- Contrato de dados v1
- Regras de acesso e autorização — MVP
- Base para specs — Firebase, arquivos, regras e fluxos do MVP

## Princípios obrigatórios
- negar tudo por padrão;
- liberar apenas o necessário;
- não confiar na interface para segurança;
- tratar o documento do usuário como fonte real de perfil e setor;
- impedir elevação de privilégio pelo cliente;
- manter coerência entre Firestore, Storage e `id_nuvem`.

## Coleções oficiais
- `usuarios`
- `setores`
- `arquivos`
- `solicitacoes`

## Subcoleções oficiais
- `arquivos/{id_arquivo}/auditoria`
- `solicitacoes/{id_solicitacao}/auditoria`

## Campos estruturais que não podem ser inventados sem aprovação
### `usuarios`
- `id_usuario`
- `nome_completo`
- `email`
- `celular`
- `nivel_acesso`
- `ativo`
- `ids_setor`
- `data_criacao`
- `data_atualizacao`

### `arquivos`
- `id_arquivo`
- `id_setor`
- `tipo`
- `titulo`
- `nivel_acesso`
- `id_nuvem`
- `id_usuario`
- `data_inclusao`
- `data_atualizacao`

### `solicitacoes`
- `id_solicitacao`
- `id_setor`
- `id_solicitante`
- `nome_solicitante`
- `id_responsavel`
- `nome_responsavel`
- `tipo`
- `status`
- `comentario`
- `id_nuvem`
- `data_solicitacao`
- `data_atualizacao`

## Valores técnicos oficiais
### `nivel_acesso` - `1` = usuário - `2` = admin ### `status` - `em_aberto`
- `em_andamento`
- `concluida`
- `cancelada`

## Regras críticas de autorização
### Setores
- leitura de `setores` permitida a usuário autenticado e ativo que pertence ao setor;
- serve apenas para exibir o nome do setor (em vez do `id`) na interface;
- cliente não escreve em `setores`.

### Usuário
- lê apenas o próprio documento em `usuarios`;
- lê apenas arquivos públicos do próprio setor;
- cria solicitação apenas em seu setor;
- lê apenas as próprias solicitações;
- edita ou cancela apenas se estiver `em_aberto`;
- não define `id_responsavel`;
- não grava `id_nuvem` em solicitação.

### Admin
- lê apenas o próprio documento de usuário;
- opera apenas nos setores presentes em `ids_setor`;
- pode criar, atualizar e remover arquivos do próprio contexto;
- pode ver fila de solicitações do setor ativo;
- pode assumir, comentar, anexar e concluir solicitações;
- não pode operar fora do setor ao qual pertence.

## Contrato oficial de `id_nuvem` ### Biblioteca - `biblioteca/{id_setor}/nivel_1/{id_arquivo}.pdf`
- `biblioteca/{id_setor}/nivel_2/{id_arquivo}.pdf`

### Solicitações
- `solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf`

## Regra de segurança durante uso de mock
Mock de arquivo não substitui segurança real.

### Regras
- toda validação de Storage permanece pendente até implementação Firebase real;
- mocks não autorizam criação de campos extras;
- mocks não autorizam URLs públicas persistidas;
- mocks não autorizam flexibilização de perfil, setor ou status;
- resultados simulados devem respeitar o mesmo contrato que será exigido no ambiente real.

### Registro correto de status
Enquanto houver mock:
- upload real: não validado
- download real: não validado
- regras de Storage: não validadas
- segurança de arquivos: parcialmente pendente

## Fluxos críticos obrigatórios
### Cadastro de arquivo
1. gerar `id_arquivo`
2. montar `id_nuvem`
3. enviar para Storage
4. persistir documento em `arquivos`
5. registrar auditoria mínima

### Assumir solicitação
1. ler solicitação
2. verificar `status = em_aberto`
3. usar transação
4. gravar `status = em_andamento`
5. gravar `id_responsavel`

### Anexo final da solicitação
1. montar `id_nuvem`
2. enviar arquivo ao Storage
3. atualizar `id_nuvem`
4. atualizar comentário, se houver
5. concluir solicitação

## Regras para o Kiro
- não adicionar campos extras por conveniência;
- não usar URL pública persistida no banco;
- não flexibilizar transições de status;
- não permitir upload por Usuário em solicitações no MVP;
- não mover responsabilidade de segurança para o frontend.

## Resultado esperado
Toda implementação deve manter isolamento por perfil e setor, consistência de dados e segurança real desde a infraestrutura.