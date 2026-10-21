# Steering 03 — Dados, autorização e segurança

## Objetivo
Manter toda implementação aderente ao contrato de dados, às regras de acesso e ao modelo de segurança oficial do MVP.

## Fonte de verdade
Usar como referência principal:
- o documento técnico mestre (contrato de dados e segurança);
- as specs de domínio e de segurança (`docs/specs/`);
- as regras publicadas (`firestore.rules` e `storage.rules`).

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
- `comum_congregacao`
- `nivel_acesso`
- `admin_global`
- `ativo`
- `ids_setor`
- `primeiro_acesso`
- `data_criacao`
- `data_atualizacao`

### `arquivos`
- `id_arquivo`
- `id_setor`
- `escopo`
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
- no primeiro acesso, conclui a troca obrigatória de senha marcando `primeiro_acesso` de `true` para `false` no próprio documento — única escrita permitida em `usuarios`, sem alterar nenhum outro campo;
- lê os arquivos públicos do próprio setor e os arquivos públicos globais;
- cria solicitação apenas no próprio setor;
- lê apenas as próprias solicitações;
- edita ou cancela apenas enquanto `em_aberto`;
- não define `id_responsavel`;
- não grava `id_nuvem` na solicitação;
- baixa o anexo final apenas das próprias solicitações; ninguém mais o lê;
- registra a auditoria `anexo_visualizado` (append-only) após baixar com sucesso o anexo final da própria solicitação `concluida` com `id_nuvem` — nenhum outro perfil pode gravar esse evento.

### Admin
- lê apenas o próprio documento de usuário;
- opera apenas nos setores presentes em `ids_setor`;
- cria, atualiza e remove arquivos de setor do próprio contexto;
- cria, atualiza e remove arquivos globais apenas com `admin_global`;
- vê a fila de solicitações do setor ativo;
- assume, responde, anexa e conclui solicitações do próprio setor;
- uma vez assumida a solicitação, apenas o responsável que a assumiu pode alterá-la;
- não lê o anexo final da solicitação (restrito ao solicitante);
- não opera fora dos setores aos quais pertence.

## Contrato oficial de `id_nuvem` ### Biblioteca - `biblioteca/{id_setor}/nivel_1/{id_arquivo}.pdf`
- `biblioteca/{id_setor}/nivel_2/{id_arquivo}.pdf`

### Biblioteca Global
- `biblioteca_global/nivel_1/{id_arquivo}.pdf`
- `biblioteca_global/nivel_2/{id_arquivo}.pdf`

### Solicitações
- `solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf`

## Autorização por camada
O Firestore autoriza pelo documento `usuarios/{uid}`, lido pelas próprias regras.
O Storage autoriza por Custom Claims no token (`ativo`, `nivel_acesso`,
`ids_setor`, `admin_global`), porque as regras de Storage não leem o Firestore.
Os claims espelham o documento `usuarios/{uid}`: provisionados pela sincronização
oficial em produção e injetados pelo seeder no ambiente local, de modo que
desenvolvimento e produção usam a mesma versão de regra.

O Storage de **produção** e suas regras permanecem pendentes de Cloud Billing e
não devem ser declarados concluídos. Em desenvolvimento, as operações de arquivo
são reais contra o Storage emulator local, respeitando o mesmo contrato de dados
e o formato oficial de `id_nuvem`.

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
4. gravar `conclusao`, se houver
5. concluir solicitação

## Regras para o Kiro
- não adicionar campos extras por conveniência;
- não usar URL pública persistida no banco;
- não flexibilizar transições de status;
- não permitir upload por Usuário em solicitações no MVP;
- não mover responsabilidade de segurança para o frontend.

## Resultado esperado
Toda implementação deve manter isolamento por perfil e setor, consistência de dados e segurança real desde a infraestrutura.