# Spec 04 — Biblioteca: consulta, listagem, filtro e download

## Objetivo
Permitir que usuários autorizados consultem a biblioteca oficial do setor de forma simples, confiável e compatível com suas permissões.

## Atores
- Usuário
- Admin

---

## Escopo desta spec
Inclui:
- tela de biblioteca;
- listagem de arquivos permitidos;
- filtro por tipo;
- ordenação por atualização;
- detalhe resumido do arquivo;
- download autenticado.

Não inclui:
- cadastro e edição de arquivo;
- auditoria detalhada administrativa;
- busca avançada com múltiplos filtros complexos.

---

## Regras de acesso
### Usuário
Pode ver apenas:
- arquivos do próprio setor;
- com `nivel_acesso = 1`.

### Admin
Pode ver:
- arquivos do setor ativo;
- com `nivel_acesso = 1` e `nivel_acesso = 2`.

---

## Dados exibidos por item
Cada item da biblioteca deve exibir, no mínimo:
- título
- tipo
- data da última atualização
- indicação visual de acesso, quando útil para admin

---

## Comportamento da tela de listagem
- carregar documentos permitidos ao contexto atual;
- permitir filtro por tipo;
- ordenar por atualização mais recente;
- permitir abrir detalhe ou ação de download;
- exibir estados de loading, vazio e erro.

---

## Comportamento do detalhe do arquivo
O detalhe deve mostrar, no mínimo:
- título
- tipo
- data de inclusão ou atualização relevante
- ação de download

No MVP, o detalhe pode ser uma página simples ou um painel/modal, desde que mantenha clareza operacional.

---

## Fluxo principal
1. Usuário acessa a biblioteca.
2. O sistema identifica perfil e setor ativo.
3. A aplicação consulta os arquivos compatíveis com esse contexto.
4. A lista é exibida em ordem recente.
5. O usuário filtra, abre o detalhe ou baixa o arquivo.

---

## Estados importantes
- carregando lista
- lista com resultados
- lista vazia
- erro ao carregar
- erro ao baixar

---

## Regras de UX mínimas
- a tela deve ser rápida de escanear no celular;
- os filtros devem ser simples e visíveis;
- o download deve ter ação clara;
- itens vazios ou sem resultado devem ter mensagem compreensível;
- o admin não deve se confundir entre documento público e restrito.

---

## Critérios de aceite
- Usuário vê apenas arquivos públicos do próprio setor;
- Admin vê arquivos públicos e restritos do setor ativo;
- o filtro por tipo funciona corretamente;
- a ordenação por atualização funciona;
- o download usa a referência salva em `id_nuvem`;
- a tela lida corretamente com vazio, loading e erro.

---

## Dependências
- Spec 02 — Autenticação, sessão e contexto do usuário
- Spec 03 — Design system base e layout mobile-first

---

## Diretriz final
A biblioteca do MVP deve ser **simples de consultar e difícil de usar errado**. O usuário precisa encontrar rapidamente o documento certo e confiar que aquela é a versão oficial disponível.