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

## Regra operacional quando Billing estiver ausente
Se Cloud Storage for Firebase não puder ser usado por ausência de Billing/Blaze, o Kiro deve:
> Decisão superada (registro histórico): a "versão simulada" foi substituída pelo Storage real via emulador local. Mantém-se a diretriz de não declarar o Storage de produção concluído. Ver `docs/specs/spec-11-melhoria-infraestrutura-local.md`.

- seguir com UI, Auth, Firestore e fluxo;
- criar camada de infraestrutura de arquivos com interface estável;
- implementar versão simulada isolada;
- preservar contrato de dados e formato de `id_nuvem`;
- registrar explicitamente que Storage real e regras de Storage continuam pendentes.

O Kiro não deve:
- bloquear a sprint por ausência de Storage, se houver caminho mock controlado;
- declarar lote concluído como definitivo quando ele depender de validação real de Storage;
- introduzir campos ou fluxos temporários para sustentar a simulação.

## Resultado esperado
O Kiro deve operar como acelerador disciplinado do projeto: rápido na execução, mas restrito por specs, steering e revisão humana.