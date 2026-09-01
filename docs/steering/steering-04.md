# Steering 04 — Design system base e UX mobile-first

## Objetivo
Guiar a criação de componentes e padrões visuais do MVP para que a interface seja consistente, legível no celular e fácil de expandir.

## Princípios visuais
- simplicidade antes de sofisticação;
- legibilidade no celular;
- consistência entre fluxos de usuário e admin;
- foco em tarefa recorrente;
- baixo atrito de navegação e preenchimento.

## Papel do design system neste projeto
O design system deve:
- acelerar montagem de telas;
- reduzir variação desnecessária entre componentes;
- permitir que o Kiro reutilize padrões em vez de reinventar UI;
- garantir coerência visual mínima sem virar projeto paralelo.

## Tokens mínimos esperados
- paleta principal
- cores neutras
- cores de estados: sucesso, alerta, erro, informação
- tipografia base
- escala de espaçamento
- bordas e raios
- sombras, se forem realmente úteis

## Componentes prioritários
### Entrada e ação
- botão
- input
- select
- textarea
- uploader de arquivo

### Estrutura e exibição
- card
- cabeçalho de página
- container de conteúdo
- item de lista
- badge de status

### Feedback e estados
- loading state
- empty state
- mensagem de erro
- mensagem de sucesso
- modal de confirmação

## Padrões de layout
- começar sempre pelo layout de celular;
- ações principais devem aparecer cedo no fluxo visual;
- formulários devem ser curtos, claros e com rótulos objetivos;
- listas devem ser escaneáveis, com hierarquia simples;
- evitar sobrecarga de informação por tela.

## Padrões de status
Os status de solicitação devem manter significado visual estável:
- `em_aberto`
- `em_andamento`
- `concluida`
- `cancelada`

A mesma cor e o mesmo padrão devem aparecer em todas as telas para o mesmo status.

## Regras de consistência
- ações primárias devem ter o mesmo padrão visual;
- ações destrutivas devem ser claramente diferenciadas;
- upload e download precisam parecer fluxos distintos e previsíveis;
- estados de vazio, erro e carregamento devem ser reutilizados;
- telas administrativas podem ter mais ações, mas não outra linguagem visual base.

## Diretrizes para o Kiro
Ao gerar UI:
- reutilizar componentes existentes antes de criar novos;
- não criar variantes demais sem necessidade real;
- não sofisticar a interface com microinterações não pedidas;
- preferir clareza funcional a visual ornamental;
- manter responsividade simples e estável.

## Critério para criar novo componente
Criar componente novo apenas se:
1. ele for reutilizável em mais de uma tela; ou
2. ele concentrar um padrão importante do sistema.

Caso contrário, manter a solução local e simples.

## Resultado esperado
O MVP deve ter uma base visual enxuta, coerente e suficiente para montar rapidamente as telas principais com boa experiência no celular.