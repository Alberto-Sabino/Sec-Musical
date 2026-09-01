# Steering 01 — Produto e limites do MVP

## Objetivo
Garantir que toda implementação permaneça aderente ao problema real do Portal Musical MVP e não desvie para funcionalidades prematuras.

## Problema que o produto resolve
O MVP existe para:
- centralizar documentos oficiais da parte musical;
- reduzir dependência de WhatsApp para dúvidas e pedidos recorrentes;
- organizar solicitações entre Encarregados e Secretários;
- permitir devolutiva rastreável dentro da própria plataforma.

## O que o MVP é
Uma aplicação web mobile-first com dois módulos principais:
1. Biblioteca
2. Solicitações

## Perfis oficiais
### Usuário
- representa Encarregado local ou regional;
- pertence a um único setor;
- consulta biblioteca pública do setor;
- cria e acompanha as próprias solicitações.

### Admin
- representa Secretário Musical;
- pode atuar em um ou mais setores;
- opera com um setor ativo por vez na interface;
- mantém biblioteca e trata solicitações.

## Regra de precedência
Se uma pessoa acumular papel de Encarregado e Secretário na prática, no sistema ela deve existir apenas como Admin.

## Escopo incluído no MVP
### Biblioteca
- listar documentos permitidos;
- filtrar por tipo;
- baixar arquivos;
- permitir ao Admin cadastrar, editar e remover arquivos;
- manter auditoria básica.

### Solicitações
- criar solicitação;
- listar solicitações próprias do Usuário;
- editar ou cancelar enquanto em aberto;
- listar fila do Admin por setor ativo;
- assumir solicitação;
- comentar publicamente;
- anexar arquivo final único;
- concluir ou cancelar.

## Fora de escopo
Não implementar no MVP:
- geração automática de fichas;
- múltiplos anexos por solicitação;
- comentários internos separados dos públicos;
- workflow avançado de aprovação;
- gestão completa de usuários por interface;
- notificações complexas obrigatórias;
- backend tradicional sem necessidade real;
- analytics sofisticado sem validação de uso.

## Critério de decisão de produto
Antes de adicionar qualquer item novo, responder:
1. resolve uma dor atual já confirmada?
2. entra claramente nos módulos Biblioteca ou Solicitações?
3. melhora a operação sem elevar demais a complexidade?
4. cabe no MVP sem expandir escopo lateral?

Se a resposta for majoritariamente não, o item deve ficar fora do MVP.

## Diretrizes para o Kiro
Ao gerar solução:
- preferir o caminho mais simples que preserve clareza e segurança;
- não criar telas, campos ou fluxos sem base nas specs;
- não introduzir permissões paralelas ao modelo oficial;
- não tentar “melhorar” o produto com conceitos não pedidos;
- manter foco em operação real no celular.

## Resultado esperado
Toda entrega deve fortalecer o objetivo central do MVP: substituir comunicação dispersa por um fluxo simples, oficial, seguro e rastreável.