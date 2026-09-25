# Spec 16 — Autenticação: senha e perfil do usuário

## Objetivo
Permitir que o usuário recupere o acesso via e-mail de redefinição, altere a
própria senha estando autenticado e consulte seus dados cadastrais numa tela de
perfil ("Minhas informações") que reúne as ações da conta. Tudo usando o Firebase
Authentication e a arquitetura em camadas já existente (UI → composables/casos de
uso → repositório → SDK).

## Resultado esperado
Ao final desta spec, o projeto deve ter:
- fluxo "Esqueci minha senha" acessível a partir do login (rota pública), com o
  link do e-mail retornando para a aplicação;
- tela de "Redefinir senha" na aplicação (rota pública), acionada pelo link do
  e-mail, que valida o código e efetiva a nova senha;
- fluxo "Alterar senha" acessível a partir do perfil (rota autenticada);
- tela "Minhas informações" (perfil) com dados cadastrais e as ações da conta
  (Alterar senha e Sair), acessível por um ícone de conta na Início;
- validação de formato de e-mail e de critérios de senha antes do envio;
- mensagens de sucesso e erro claras e genéricas (sem expor detalhes de backend);
- resposta anti-enumeração no envio de redefinição (sucesso neutro mesmo para
  e-mail não cadastrado).

## Pré-condições obrigatórias
Considerar como base consolidada:
- `README.md`
- `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
- `docs/decisoes-ux.md`
- `docs/specs/spec-13-shell-autenticado-e-orientacao-global.md` (shell, `← Voltar`)
- módulo de autenticação já existente (`PaginaLogin.vue`, `usarSessao`,
  `repositorioAutenticacao`, `casos_de_uso/autenticacao.js`).

## Fluxos implementados

### 1. Esqueci minha senha
1. Na tela de login, o link "Esqueci minha senha" leva à rota `esqueci-senha`.
2. O usuário informa o e-mail e envia.
3. Valida-se o formato do e-mail antes do envio.
4. Dispara `sendPasswordResetEmail` com `actionCodeSettings.url` apontando para
   a própria aplicação (`/redefinir-senha`), para que o link do e-mail retorne à
   interface (e não ao handler genérico do Firebase).
5. Sucesso: mensagem de confirmação neutra (não revela se o e-mail existe).
6. Erro real (ex.: falha de rede): mensagem genérica de "tente novamente".

### 2. Redefinir senha (via link do e-mail)
1. O link do e-mail abre `redefinir-senha` na aplicação, com o `oobCode` na query.
2. Ao montar, valida-se o código com `verifyPasswordResetCode`:
   - inválido/expirado: mensagem genérica + ação "Solicitar novo e-mail";
   - válido: exibe o formulário (mostra o e-mail alvo para confirmação).
3. O usuário informa a nova senha e a confirmação.
4. Valida-se: ambos preenchidos, comprimento mínimo (6) e confirmação coincidente.
5. Efetiva com `confirmPasswordReset(oobCode, novaSenha)` (não exige sessão).
6. Sucesso: mensagem de sucesso + ação "Ir para o login".
7. Erro: mensagens genéricas (link inválido/expirado, senha fraca).

### 3. Alterar senha (usuário logado)
1. Acessível pela tela de perfil (ação "Alterar senha"), rota `alterar-senha`
   (autenticada).
2. Formulário com senha atual, nova senha e confirmação.
3. Valida-se: todos os campos preenchidos, comprimento mínimo (6), nova senha ==
   confirmação e nova senha diferente da atual.
4. Reautentica com `reauthenticateWithCredential` (senha atual) e atualiza com
   `updatePassword`.
5. Sucesso: mensagem de sucesso.
6. Erro: mensagens genéricas por código (senha atual incorreta, muitas
   tentativas, sessão expirada, falha genérica).

### 4. Minhas informações (perfil)
1. Na Início, um ícone de conta no cabeçalho leva à rota `perfil` (autenticada).
2. A tela exibe dados cadastrais (somente leitura): nome, comum congregação,
   e-mail, celular e nível de acesso (rótulos "Secretário Musical" / "Encarregado
   Local", consistentes com a Início).
3. Reúne as ações da conta: "Alterar senha" (ícone `IconeSenha`) e "Sair".
4. Cabeçalho com `← Voltar`; título "Minhas informações".

## Arquivos

Novos:
- `src/servicos/casos_de_uso/senha.js` — regras puras de validação e mensagens
  (`emailValido`, `validarEmailRecuperacao`, `validarAlteracaoSenha`,
  `validarNovaSenha`, `TAMANHO_MINIMO_SENHA`), sem dependência de Vue/Firebase.
- `src/modulos/autenticacao/PaginaEsqueciSenha.vue` — tela de recuperação.
- `src/modulos/autenticacao/PaginaRedefinirSenha.vue` — tela de redefinição via
  link do e-mail (valida `oobCode`, pede nova senha, confirma).
- `src/modulos/autenticacao/PaginaAlterarSenha.vue` — tela de alteração (logado).
- `src/modulos/autenticacao/PaginaPerfil.vue` — tela "Minhas informações" (dados
  cadastrais + ações Alterar senha e Sair).
- `tests/unit/senha.test.js` — testes de unidade das regras puras.

Alterados:
- `src/servicos/repositorios/repositorioAutenticacao.js` — encapsula
  `sendPasswordResetEmail` (com `actionCodeSettings.url` para a aplicação),
  `verifyPasswordResetCode`, `confirmPasswordReset`,
  `reauthenticateWithCredential` + `updatePassword`.
- `src/servicos/casos_de_uso/autenticacao.js` — `solicitarRedefinicaoSenha`,
  `verificarLinkRedefinicao`, `redefinirSenhaComCodigo` e `alterarSenha`;
  o contexto do usuário passa a expor o campo existente `celular`.
- `src/router/index.js` — rotas `esqueci-senha`, `redefinir-senha` (públicas),
  `alterar-senha` e `perfil` (`meta.requerAuth`).
- `src/modulos/autenticacao/PaginaLogin.vue` — link "Esqueci minha senha"
  (navegação via `router.push`).
- `src/app/PaginaInicial.vue` — cabeçalho passa a ter um ícone de conta
  (`IconeConta`) que abre o perfil; as ações "Alterar senha" e "Sair" saíram da
  Início e vivem no perfil.
- `src/componentes/CabecalhoPagina.vue` — prop opcional `voltar` (default `null`
  mantém a decisão por módulo; `true/false` força a exibição do `← Voltar` em
  telas fora do conceito de módulo, como as de autenticação e o perfil).

## Conformidade UX/CTA
- Um CTA primário por tela ("Enviar e-mail", "Alterar senha").
- Sem botão "Voltar" redundante no rodapé do formulário; o retorno usa o
  `← Voltar` do cabeçalho (`docs/decisoes-ux.md`). O botão explícito só aparece
  nas telas de sucesso, como ação de conclusão.
- Navegação por `router.push` (padrão do projeto), sem introduzir `RouterLink`.

## Segurança
- Nenhuma senha é exibida em texto simples; campos são `type="password"`.
- Mensagens de erro genéricas; sem detalhes do backend.
- Resposta anti-enumeração no envio de redefinição.
- `alterar-senha` exige sessão (`requerAuth`) e reautenticação antes de atualizar.

## Testes
- `npm run test:unit` cobre as regras puras de `senha.js`.
- Validação executada: `npm run lint` (OK), `npm run test:unit` (OK),
  `npm run build` (OK).

## Ambiente de desenvolvimento (teste do fluxo)
Em modo `emulador`, o Auth emulator **não envia e-mail real**. Para testar o
fluxo completo de "Esqueci minha senha":
- ver o link de redefinição no log do container: `docker compose logs -f emuladores`;
- ou consultar os códigos pendentes:
  `curl "http://127.0.0.1:9099/emulator/v1/projects/sec-musical-mvp/oobCodes"`.

Com `actionCodeSettings.url`, o link do e-mail aponta para a aplicação
(`http://<host>:5173/redefinir-senha?oobCode=...`), abrindo a tela de redefinição
na interface — não o handler genérico do emulador. Usar um e-mail existente no
seed (`admin@exemplo.com` / `usuario@exemplo.com`).

## Pendências de produção
- **Envio real de e-mail de redefinição**: só validável em modo `producao`
  (Cloud Billing/Blaze) com o template de e-mail do Firebase Authentication
  configurado. Enquanto o Billing não estiver ativo, o envio real **não** é
  considerado concluído — o fluxo é testável apenas via Auth emulator (sem
  e-mail real). Alinhado à política do `README.md` (modo transitório sem Billing).
- **Domínio autorizado da `actionCodeSettings.url`**: em produção, o domínio da
  aplicação precisa estar na lista de domínios autorizados do Firebase Auth para
  o link do e-mail funcionar. Configuração pertence ao projeto de produção
  (pendente de Billing/deploy).
