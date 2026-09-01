# Spec 02 — Autenticação, sessão e contexto do usuário

## Objetivo
Garantir que o sistema identifique corretamente quem está logado, qual é seu papel, se está ativo e a quais setores pertence, para que todas as demais funcionalidades operem com contexto seguro.

## Atores
- Usuário
- Admin

---

## Escopo desta spec
Inclui:
- login;
- logout;
- restauração de sessão;
- carregamento do documento do usuário autenticado;
- resolução de `nivel_acesso`, `ativo` e `ids_setor`;
- guards de rota por autenticação;
- guards por papel;
- definição de setor ativo para admin.

Não inclui:
- gestão completa de usuários por interface;
- alteração de permissões pelo cliente;
- cadastro livre de novos perfis operacionais.

---

## Regras principais
- ninguém usa o sistema sem autenticação;
- o usuário autenticado lê apenas o próprio documento em `usuarios`;
- `nivel_acesso`, `ids_setor` e `ativo` não podem ser alterados pelo cliente comum;
- Usuário comum possui exatamente um setor;
- Admin pode possuir um ou mais setores;
- se o Admin tiver mais de um setor, a interface trabalha com **um setor ativo por vez**.

---

## Fluxo principal
1. A pessoa acessa a tela de login.
2. Informa credenciais.
3. O sistema autentica via Firebase Authentication.
4. Após autenticar, a aplicação carrega o documento correspondente em `usuarios`.
5. O sistema valida:
- se o usuário existe no contexto operacional;
- se está ativo;
- qual é seu `nivel_acesso`;
- quais são seus setores.
6. A aplicação monta o contexto da sessão.
7. O usuário é redirecionado para a experiência correta.

---

## Comportamentos esperados
### Usuário comum
- entra no sistema já associado ao seu único setor;
- acessa apenas páginas do fluxo de consulta e solicitação;
- não acessa telas administrativas.

### Admin
- entra no sistema com seu conjunto de setores;
- escolhe ou assume um setor ativo na experiência administrativa;
- navega entre biblioteca administrativa e fila de solicitações do setor.

---

## Estados importantes
- carregando sessão
- autenticado e ativo
- autenticado mas sem documento operacional válido
- autenticado porém inativo
- erro de autenticação
- sessão expirada

---

## Regras de UX mínimas
- feedback claro em caso de falha no login;
- bloqueio de acesso visual a rotas não autorizadas;
- redirecionamento previsível após login e logout;
- indicação do setor ativo quando o perfil for admin.

---

## Critérios de aceite
- login funciona e cria sessão autenticada;
- logout encerra a sessão corretamente;
- ao autenticar, o sistema carrega o documento do usuário no banco;
- o sistema distingue corretamente Usuário e Admin;
- o sistema bloqueia acesso a rotas incompatíveis com o perfil;
- o admin consegue operar com um setor ativo por vez;
- usuários inativos ou sem contexto válido não seguem para uso operacional.

---

## Dependências
- Spec 01 — Fundação técnica, ambiente e estrutura inicial

---

## Diretriz final
Sem esta spec, todo o restante do MVP fica sem contexto confiável. Ela é a base prática de autorização, navegação e experiência segura do sistema.