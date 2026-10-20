# Spec 20 — Primeiro acesso: troca obrigatória de senha (flag `primeiro_acesso`)

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-20  
**Objetivo:** aumentar segurança operacional forçando a troca da senha padrão no primeiro acesso, sem depender de Cloud Functions.

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

---

## 0) Decisões fixas (não negociar)

1) O estado de primeiro acesso é controlado por um **campo no Firestore**:
- `usuarios/{uid}.primeiro_acesso: boolean`
- default operacional: `true` para usuários recém-criados com senha padrão (fora do escopo automatizar criação; ver §8).

2) **Sem Cloud Functions** para este fluxo.

3) Enquanto `primeiro_acesso == true`, o usuário pode acessar **somente**:
- `/alterar-senha`
- `/perfil`

4) Enquanto `primeiro_acesso == true`, a UI deve bloquear navegação:
- **sem barra inferior**
- **sem botão “← Voltar”**
- qualquer tentativa de navegar para outras rotas autenticadas deve redirecionar para `/alterar-senha`.

5) Ao alterar a senha com sucesso:
- atualizar `usuarios/{uid}.primeiro_acesso` de `true` → `false`;
- encerrar sessão;
- redirecionar para `/login`.

---

## 1) Escopo desta spec

### 1.1 Inclui
- adicionar o campo `primeiro_acesso` ao contrato de dados (docs + seed do piloto, quando aplicável);
- endurecer Firestore Rules para permitir **apenas** a transição `true → false` do próprio usuário, sem permitir alteração de nenhum outro campo;
- bloquear navegação no frontend enquanto `primeiro_acesso == true`;
- ajustar telas `/alterar-senha` e `/perfil` para suportar o modo “primeiro acesso” (sem navegação global);
- atualizar/adicionar testes de rules e unitários necessários;
- atualizar documentação impactada para refletir o estado real (sem contratos antigos).

### 1.2 Não inclui
- módulo de gestão de usuários/perfis;
- envio de e-mail de boas-vindas;
- heurísticas por “senha padrão” (proibido);
- Cloud Functions novas.

---

## 2) Contrato de dados (mudança explícita)

### 2.1 Coleção `usuarios`
Adicionar campo:
- `primeiro_acesso: boolean`

Regras:
- pode existir ausente em legados; ausência deve ser tratada como `false` no frontend (não bloquear usuários antigos por falta do campo).

---

## 3) Firestore Rules (mudança cirúrgica em `usuarios`)

Arquivo: `firestore.rules`.

Hoje `usuarios/{uid}` é totalmente `write: false`. Esta spec introduz **uma única exceção**:

Permitir `update` **somente** quando:
- autenticado e `request.auth.uid == idUsuario`;
- `resource.data.primeiro_acesso == true`;
- `request.resource.data.primeiro_acesso == false`;
- **nenhum outro campo muda**.

Regras adicionais:
- `create` e `delete` continuam negados;
- qualquer tentativa de setar `primeiro_acesso=true` deve ser negada;
- qualquer tentativa de alterar outro campo (ex.: `nivel_acesso`, `ids_setor`, `admin_global`, etc.) deve continuar negada.

> Implementação recomendada: comparar o documento inteiro usando `request.resource.data.diff(resource.data).changedKeys()` e exigir que o conjunto seja exatamente `['primeiro_acesso']`.

---

## 4) Frontend — comportamento de bloqueio

### 4.1 Fonte de verdade do estado
O estado vem do **contexto do usuário** carregado do Firestore (não de claims).

Arquivos envolvidos:
- `src/servicos/casos_de_uso/autenticacao.js` (carregarContextoUsuario)
- `src/composables/usarSessao.js` (estado e derivados)
- `src/router/guards.js` (redirecionamentos)

### 4.2 Regras de navegação (guards)
Em `src/router/guards.js`, após a sessão estar autenticada e o contexto carregado:

- Se `estado.contexto.primeiro_acesso === true`:
  - permitir apenas rotas `alterar-senha` e `perfil`;
  - qualquer outra rota autenticada deve redirecionar para `{ name: 'alterar-senha' }`.

### 4.3 UI: esconder navegação global
- `App.vue`: a barra inferior deve **não aparecer** quando `primeiro_acesso === true`, mesmo em rotas autenticadas.
- `CabecalhoPagina.vue`: deve ser possível forçar `voltar=false` nas telas de `/alterar-senha` e `/perfil` quando `primeiro_acesso === true`.

---

## 5) Fluxo de alteração de senha (completar primeiro acesso)

### 5.1 Alterar senha
Tela: `src/modulos/autenticacao/PaginaAlterarSenha.vue`

Após `alterarSenha(...)` retornar sucesso:
1) chamar um novo caso de uso (ou função existente) para marcar `primeiro_acesso=false` no Firestore;
2) chamar `logout()` (encerrar sessão);
3) `router.push({ name: 'login' })`.

### 5.2 Marcar primeiro acesso como concluído
Criar um caso de uso pequeno em `src/servicos/casos_de_uso/autenticacao.js` (ou arquivo dedicado dentro de autenticação) que:
- valida que há usuário autenticado;
- executa update no documento `usuarios/{uid}` setando `primeiro_acesso=false`.

Implementação deve seguir o padrão do projeto:
`tela -> caso de uso -> repositório -> Firestore`.

Portanto:
- adicionar no `repositorioAutenticacao.js` uma função `marcarPrimeiroAcessoConcluido(uid)` (ou nome equivalente) que faz `updateDoc` no `usuarios/{uid}`.

---

## 6) Testes (obrigatório)

### 6.1 Tests de rules (Firestore)
Arquivo a atualizar: `tests/regras/arquivos.test.js` (onde já existem testes de `usuarios`).

Adicionar/ajustar cenários:

A) **permitido**: usuário atualiza `primeiro_acesso` de `true` → `false` no próprio doc.  
B) **bloqueado**: usuário tenta atualizar `primeiro_acesso` de `false` → `true`.  
C) **bloqueado**: usuário tenta atualizar `primeiro_acesso` e outro campo junto (ex.: `celular`).  
D) **bloqueado**: usuário tenta atualizar `primeiro_acesso` no doc de outro usuário.  
E) **bloqueado**: usuário tenta atualizar qualquer outro campo (mantém garantias antigas).

> Ajustar o seed do teste para incluir `primeiro_acesso: true` no documento do usuário de teste.

### 6.2 Testes unitários (helpers puros)
Adicionar um teste unitário para a regra de “rota permitida em primeiro acesso”, para evitar regressão.

Sugestão:
- criar helper puro em `src/router/primeiroAcesso.js` (ou em `src/router/guards.js` exportando função pura) que recebe:
  - `nomeRotaDestino`
  - `primeiroAcesso`
  - e retorna `permitido`/`redirect`.
- cobrir em `tests/unit/` com `node:test`.

---

## 7) Documentação (obrigatório — refletir estado real)

Atualizar:
1) `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`:
   - adicionar `primeiro_acesso` na lista de campos de `usuarios`;
   - descrever o comportamento de bloqueio e o fluxo de troca obrigatória.

2) `docs/steering/steering-03.md`:
   - adicionar `primeiro_acesso` na lista de campos estruturais de `usuarios`.

3) `docs/guias/piloto-seed-dados.md`:
   - incluir `primeiro_acesso` no exemplo de usuário (como opcional, default `true` para novos).

4) `docs/decisoes/status-execucao.md`:
   - registrar o resultado (curto e factual).

> Regra: remover/ajustar qualquer trecho que afirme “usuarios não tem write nenhum” sem mencionar a exceção do `primeiro_acesso`.

---

## 8) Operação / seed (fora do escopo automatizar)
Esta spec **não** altera `scripts/seed-emulador.mjs` para setar `primeiro_acesso=true` por padrão.  
O teste manual pode ser feito setando o campo manualmente no emulador/Firestore.

---

## 9) Critérios de aceite

- [ ] Usuário com `primeiro_acesso=true` é redirecionado automaticamente para `/alterar-senha`.
- [ ] Usuário com `primeiro_acesso=true` consegue acessar `/perfil`, mas não consegue acessar Biblioteca/Solicitações/Fila/Admin.
- [ ] Barra inferior não aparece durante `primeiro_acesso=true`.
- [ ] Botão “← Voltar” não aparece em `/alterar-senha` e `/perfil` durante `primeiro_acesso=true`.
- [ ] Ao alterar senha com sucesso:
  - [ ] `usuarios/{uid}.primeiro_acesso` vira `false`;
  - [ ] sessão é encerrada;
  - [ ] usuário volta para `/login`.
- [ ] Testes:
  - [ ] `npm run test:unit` passa
  - [ ] `npm run test:rules` passa (via Docker, como no projeto)

---

## 10) Stop conditions (parar e pedir confirmação humana)

Parar se precisar:
- criar qualquer campo além de `usuarios.primeiro_acesso`;
- permitir escrita em `usuarios` além da exceção `primeiro_acesso true→false`;
- mudar regras de Storage;
- introduzir Cloud Functions novas.
