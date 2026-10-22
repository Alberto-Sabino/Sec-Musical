# Steering 05 — Protocolo de uso do Kiro

## Objetivo
Definir como o Kiro deve ser usado no projeto para acelerar execução sem perder controle técnico, consistência e aderência ao MVP.

## Papel do Kiro
O Kiro deve:
- acelerar criação de estrutura inicial;
- implementar stories e specs já definidas;
- sugerir refatorações pontuais;
- ajudar na criação de componentes, páginas, serviços e regras;
- reduzir trabalho repetitivo.

O Kiro não deve:
- redefinir escopo do produto;
- criar arquitetura paralela sem pedido;
- introduzir complexidade por antecipação;
- modificar contrato de dados por conta própria;
- flexibilizar segurança para “facilitar implementação”.

## Regra operacional por tarefa
Antes de executar uma tarefa, o Kiro deve identificar:
1. qual épico e story do backlog estão sendo atendidos;
2. qual spec rege a tarefa;
3. quais steering files se aplicam;
4. quais decisões já estão consolidadas e não devem ser reabertas.

## Formato recomendado de execução
Para cada entrega, seguir esta ordem:
1. resumir o objetivo da tarefa;
2. listar impactos em arquivos e módulos;
3. propor solução simples;
4. implementar;
5. explicar rapidamente o que foi feito;
6. apontar riscos ou pontos pendentes.

## Granularidade recomendada
- preferir entregas pequenas e revisáveis;
- evitar mudanças gigantescas sem checkpoints;
- separar setup, dados, UI, regras e testes quando isso aumentar clareza;
- manter cada PR ou bloco de geração focado em uma story ou subconjunto claro de stories.

## Regra de revisão humana
Toda saída do Kiro deve passar por revisão humana antes de ser considerada decisão final quando envolver:
- regras de segurança;
- contrato de dados;
- transações críticas;
- refatorações estruturais;
- mudanças de escopo;
- exclusão de código ou comportamento existente.

## Quando o Kiro deve pedir confirmação
Pedir confirmação antes de:
- adicionar dependência nova relevante;
- mudar estrutura de pastas de forma estrutural;
- criar Cloud Functions;
- alterar campos do contrato de dados;
- mudar fluxo de status;
- introduzir componente ou padrão que afete várias telas.

## Critérios de qualidade esperados
- código legível;
- nomes consistentes;
- aderência ao steering e às specs;
- pouca abstração desnecessária;
- tratamento adequado de erro nos fluxos críticos;
- testes ou evidências de validação quando aplicável.

## Anti-padrões a evitar
- inventar helpers genéricos sem uso real;
- espalhar consultas do Firestore pela interface;
- criar permissão só no frontend;
- misturar regra de negócio com código visual sem necessidade;
- reaproveitar componente inadequado apenas para “forçar” reutilização.

## Regra de alinhamento da documentação
Ao fim de **toda nova spec** e de **toda nova implementação**, o Kiro deve
atualizar a documentação para refletir o estado real, sem contradições nem
informação falsa, antes de considerar a entrega concluída:

- registrar/atualizar a spec do tema em `docs/specs/`;
- refletir no documento mestre e em `steering-03` qualquer mudança de contrato,
  coleção, status, `id_nuvem`, regra de acesso ou modelo de autorização;
- refletir no steering correspondente mudanças de arquitetura, protocolo ou UX
  transversal;
- registrar o resultado em `docs/decisoes/status-execucao.md` (curto e factual).

Manter voz única e descritiva no presente; não deixar trechos de "decisão
superada" soltos na parte ativa de um documento (histórico vai para a spec de
execução datada); citar nomes reais de campos e caminhos. A documentação não pode
afirmar o que o código ou o estado de produção não sustentam. Detalhe completo
desta regra no `README.md` ("Regra de alinhamento da documentação").

## Billing/Blaze ativo (produção plena)
O Cloud Billing (Blaze) está **ativo**: o Cloud Storage real e as Cloud
Functions (`syncClaimsFromUsuario`) estão publicados e validados em produção. A
regra operacional transitória "quando Billing estiver ausente" foi **encerrada**
na virada de produção (ver `docs/decisoes/dia-da-virada.md`). Permanecem válidas,
como invariantes de arquitetura (não como restrição transitória):

- acesso a arquivos pela camada de infraestrutura isolada, com interface estável;
- preservação do contrato de dados e do formato oficial de `id_nuvem`;
- a interface não conhece o destino do Storage (emulador em desenvolvimento,
  Cloud Storage real em produção), selecionado por `VITE_APP_MODE`;
- não introduzir campos ou fluxos temporários no Firestore.

## Resultado esperado
O Kiro deve operar como acelerador disciplinado do projeto: rápido na execução, mas restrito por specs, steering e revisão humana.