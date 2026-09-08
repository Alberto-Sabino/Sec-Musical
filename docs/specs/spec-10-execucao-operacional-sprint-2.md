# Spec 10 — Execução operacional da Sprint 2

## Objetivo
Converter a Sprint 2 em um roteiro executável direto pelo Kiro, fechando o módulo de Solicitações, a segurança restante, a validação final e a publicação do piloto.

## Resultado esperado da Sprint 2
Ao final desta spec, o projeto deve ter:
- Solicitações ponta a ponta para usuário e admin;
- transação de assumir solicitação funcionando;
- comentário público e anexo final funcionando;
- auditoria mínima de solicitações;
- regras finais de Firestore e Storage publicadas;
- MVP validado para piloto controlado.

## Pré-condição obrigatória
Esta spec só deve começar depois que a Spec 09 estiver realmente concluída.

Isso implica:
- projeto estável;
- autenticação pronta;
- setor ativo do admin funcionando;
- Biblioteca ponta a ponta entregue;
- regras e testes da Sprint 1 já validados.

## Docs obrigatórios para esta execução
Ler antes de iniciar:
- Documento técnico mestre — Portal Musical MVP
- Steering 01 a Steering 05
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first
- Spec 06 — Solicitações do usuário: criação, acompanhamento, edição, cancelamento e download
- Spec 07 — Solicitações admin: fila, tratamento, comentário, anexo final e conclusão
- Spec 08 — Segurança, auditoria e testes críticos

## Regra de execução desta spec
- usar a base já criada na Sprint 1;
- não reconstruir estruturas por preferência técnica;
- não expandir o domínio de Solicitações além do escopo aprovado;
- não publicar o piloto sem fechar regras e testes críticos.

## Lote 6 — Solicitações do usuário
### Objetivo
Entregar a experiência do Encarregado para abrir, acompanhar, editar, cancelar e baixar devolutiva final das próprias solicitações.

### Stories cobertas
- E7-S1
- E7-S2
- E7-S3
- E7-S4
- E7-S5
- E7-S6
- E7-S7
- E7-S8

### Entregas obrigatórias
- tela de nova solicitação;
- persistência com estado inicial correto;
- listagem apenas das solicitações do próprio usuário;
- detalhe da solicitação;
- edição enquanto `em_aberto`;
- cancelamento enquanto `em_aberto`;
- download do anexo final quando `concluida`;
- histórico mínimo de status no detalhe.

### Regras específicas
- `id_solicitante` é o próprio usuário;
- `id_setor` é o setor do usuário;
- `status` nasce como `em_aberto`;
- `id_responsavel` nasce vazio;
- `id_nuvem` nasce vazio;
- o usuário não anexa arquivo na abertura da solicitação no MVP.

### Critério de saída do lote
- o usuário consegue abrir e acompanhar suas próprias solicitações;
- edição e cancelamento obedecem ao status;
- o detalhe exibe informações essenciais com clareza.

## Lote 7 — Fila administrativa e tratamento das solicitações
### Objetivo
Entregar a experiência do admin para operar a fila do setor ativo, assumir atendimento e concluir solicitações.

### Stories cobertas
- E8-S1
- E8-S2
- E8-S3
- E8-S4
- E8-S5
- E8-S6
- E8-S7
- E8-S8
- E8-S9
- E8-S10

### Entregas obrigatórias
- fila do admin por setor ativo;
- filtro por status;
- detalhe administrativo da solicitação;
- transação de assumir solicitação;
- gravação de `id_responsavel`;
- comentário público;
- upload do anexo final;
- conclusão da solicitação;
- cancelamento administrativo;
- exibição de responsável e data da última atualização.

### Regras específicas
- o admin só opera no setor ativo pertencente a `ids_setor`;
- assumir solicitação exige transação e validação de `em_aberto`;
- o anexo final deve seguir o contrato oficial de `id_nuvem`;
- a conclusão só ocorre depois do tratamento compatível com o fluxo definido.

### Regra transitória para anexo final
> Decisão superada (registro histórico): o mock do anexo final foi substituído pelo Storage real via emulador local (ver `docs/specs/spec-11-melhoria-infraestrutura-local.md`). O texto abaixo permanece como registro da Sprint 2.

Se Storage real ainda não estiver disponível, o anexo final da solicitação pode ser simulado por implementação de infraestrutura mock, desde que:
- o fluxo administrativo permaneça igual ao final;
- `id_nuvem` siga o contrato oficial;
- a UI não dependa de campos temporários;
- a conclusão da solicitação preserve as regras de status.

### Critério de saída do lote
- a fila administrativa funciona de ponta a ponta;
- concorrência ao assumir está controlada;
- comentário, anexo e conclusão operam no fluxo esperado.

## Lote 8 — Segurança, auditoria e testes críticos do domínio de Solicitações
### Objetivo
Fechar a proteção real das Solicitações e validar o domínio completo antes do piloto.

### Stories cobertas
- E9-S3
- E9-S5
- E9-S6
- E9-S7
- E10-S2
- E10-S5
- E10-S6
- E10-S7
- E10-S8
- E6-S8

### Entregas obrigatórias
- regras de Firestore para `solicitacoes`;
- regras de Storage para anexo final de solicitações;
- proteção das transições válidas de status;
- validação de tamanho e formato esperados de upload;
- auditoria mínima de solicitações;
- testes de criação, edição e cancelamento;
- testes da transação de assumir;
- testes de upload e download autenticado;
- validação mobile-first dos fluxos principais;
- exibição do histórico mínimo da auditoria da Biblioteca para admin, se ainda não concluída.

### Regras específicas
- negar tudo por padrão;
- não confiar na interface para autorização;
- bloquear transições inválidas;
- o usuário só baixa o anexo final quando a solicitação for sua e estiver `concluida`.

### Limite desta etapa em modo mock
Sem Storage real:
- regras de Firestore podem ser fechadas;
- regras de Storage ficam pendentes;
- upload/download autenticado de arquivo fica pendente de validação real;
- auditoria e transições de status podem ser validadas no escopo disponível.

### Critério de saída ajustado
O lote só fecha de forma definitiva quando as validações reais de Storage forem executadas.
Antes disso, o status correto é parcial, mesmo com fluxo completo simulado.

### Critério de saída do lote
- o domínio de Solicitações está protegido por regras reais;
- auditoria mínima está registrada;
- testes críticos passam no ambiente esperado;
- regressão dos fluxos de Biblioteca foi checada.

## Lote 9 — Publicação e piloto inicial
### Objetivo
Colocar o MVP em condição de uso controlado com dados e responsáveis mínimos definidos.

### Stories cobertas
- E11-S1
- E11-S2
- E11-S3
- E11-S4
- E11-S5
- E11-S6

### Entregas obrigatórias
- frontend publicado no Firebase Hosting;
- regras e índices publicados;
- usuários e setores iniciais preparados;
- primeiros documentos da Biblioteca carregados;
- definição do setor piloto e responsáveis operacionais;
- definição de indicadores simples de sucesso.

### Indicadores mínimos sugeridos
- quantidade de logins bem-sucedidos no piloto;
- quantidade de consultas à Biblioteca;
- quantidade de solicitações abertas e concluídas;
- redução percebida de demandas informais fora do portal;
- taxa de bloqueios ou erros operacionais críticos.

### Critério de saída do lote
- existe uma versão publicada funcional;
- o piloto tem contexto inicial preparado;
- o uso pode começar sem depender de lacuna estrutural do sistema.

## Gate final da Sprint 2
A Sprint 2 só termina quando todos os itens abaixo estiverem verdadeiros:
- solicitações do usuário funcionam ponta a ponta;
- fila do admin funciona ponta a ponta;
- a transação de assumir está válida;
- `id_responsavel` é gravado corretamente;
- o anexo final segue o contrato de `id_nuvem`;
- transições inválidas estão bloqueadas;
- auditoria mínima de solicitações está funcionando;
- regras finais estão publicadas;
- o MVP está disponível para piloto controlado.

## Proibição explícita nesta spec
Não incluir como parte desta entrega:
- múltiplos anexos por solicitação;
- comentários internos separados dos públicos;
- geração automática de fichas;
- gestão completa de usuários por interface;
- notificações sofisticadas;
- backend tradicional ou Cloud Functions sem necessidade comprovada.

## Resultado final
Ao concluir esta spec, o Portal Musical MVP entra em estado de operação piloto real dentro do escopo aprovado.