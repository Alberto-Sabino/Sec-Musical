# Plano operacional executável — desenvolvimento 100% pelo Kiro

## Objetivo
Transformar a documentação já consolidada do Portal Musical MVP em um fluxo de execução direta pelo Kiro, eliminando camadas redundantes de planejamento na hora de desenvolver.

## Diagnóstico de exagero
Sim, havia uma redundância real entre alguns artefatos de planejamento.

O que é útil:
- documento técnico mestre;
- steering files;
- specs de domínio;
- um plano operacional de execução.

O que vira excesso quando o objetivo passa a ser desenvolvimento imediato:
- voltar ao backlog para rediscutir ordem que já está implícita nas dependências;
- ter plano de sprint e depois outro documento só para repetir a ordem das sprints;
- usar backlog, sprint e ordem recomendada como três camadas ativas ao mesmo tempo.

## Decisão operacional a partir de agora
Para desenvolvimento 100% pelo Kiro, a governança ativa fica reduzida a quatro camadas:

### Camada 1 — Fonte principal do produto
- **Documento técnico mestre — Portal Musical MVP**

### Camada 2 — Guardrails permanentes
- **Steering 01 — Produto e limites do MVP**
- **Steering 02 — Arquitetura Vue + Firebase**
- **Steering 03 — Dados, autorização e segurança**
- **Steering 04 — Design system base e UX mobile-first**
- **Steering 05 — Protocolo de uso do Kiro**

### Camada 3 — Specs base do domínio
- **Spec 01 a Spec 08**

### Camada 4 — Execução prática
- **Spec 09 — Execução operacional da Sprint 1**
- **Spec 10 — Execução operacional da Sprint 2**

## O que deixa de ser camada ativa do Kiro
Os seguintes documentos continuam úteis, mas passam a ser **referência de gestão** e não roteiro primário de implementação:
- Backlog do MVP — épicos, histórias e ordem de execução
- Plano de sprints do MVP — fechamento do backlog em Sprint 1 e Sprint 2
- Sprint 1 — Base autenticada + Biblioteca ponta a ponta
- Sprint 2 — Solicitações ponta a ponta + segurança final + publicação piloto

Em resumo: eles continuam válidos, mas o Kiro não precisa navegar neles para cada tarefa se as Specs 09 e 10 já estiverem sendo seguidas.

## Regra prática de leitura para o Kiro
### Para Sprint 1
Ler nesta ordem:
1. Documento técnico mestre
2. Steering 01 a 05
3. Spec 09
4. Specs base citadas dentro da Spec 09

### Para Sprint 2
Ler nesta ordem:
1. Documento técnico mestre
2. Steering 01 a 05
3. Spec 10
4. Specs base citadas dentro da Spec 10

## Protocolo operacional por lote
Para cada lote de execução, o Kiro deve:
1. identificar o lote ativo;
2. resumir o objetivo em uma frase;
3. listar os arquivos ou módulos que serão afetados;
4. implementar somente o que o lote pede;
5. validar build, regras e comportamento correspondente;
6. registrar o que foi entregue, riscos e pendências;
7. só avançar ao próximo lote se o critério de saída do lote atual estiver satisfeito.

## Regra de não reabertura desnecessária
Durante a execução:
- não reabrir discussão de escopo já consolidado;
- não criar novos campos de dados sem decisão explícita;
- não mudar o fluxo de status;
- não introduzir backend tradicional;
- não criar componentes ou camadas genéricas sem necessidade concreta no lote atual.

## Regra de parada obrigatória
O Kiro deve parar e pedir intervenção apenas se houver:
- dependência externa ausente;
- credencial ou configuração obrigatória indisponível;
- conflito real entre docs ativos;
- necessidade de mudar contrato de dados ou regra de segurança;
- necessidade de introduzir nova tecnologia relevante.

## Critério de pronto operacional
Uma entrega só conta como pronta se:
- estiver aderente ao documento técnico mestre;
- respeitar steering e spec correspondente;
- funcionar sem operação manual escondida;
- tiver tratamento mínimo de erro;
- não prometer na UI o que as regras não suportam;
- estiver validada no contexto local aplicável.

## Fluxo oficial de execução a partir daqui
### Etapa 1
Executar integralmente a **Spec 09 — Execução operacional da Sprint 1**.

### Etapa 2
Somente após o gate de saída da Spec 09, executar a **Spec 10 — Execução operacional da Sprint 2**.

## Prompt operacional-base para abrir no Kiro
Use este texto como ponto de partida da execução:

> Leia o Documento técnico mestre — Portal Musical MVP, os Steering 01 a 05 e a spec operacional ativa. Execute o lote atual sem expandir escopo. Mantenha aderência ao contrato de dados, às regras de segurança e ao design system base. Antes de implementar, resuma objetivo e arquivos impactados. Depois da implementação, registre validações, riscos e pendências.

## Resultado esperado
Com este plano, a documentação deixa de ser principalmente gerencial e passa a funcionar como trilho de execução direta pelo Kiro.