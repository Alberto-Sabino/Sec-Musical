# Spec 23 — Hard cut: capabilities como única base (remover legado) + `cargo` + `arquivo_privado`

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-20  
**Objetivo:** concluir a migração iniciada na Spec 22 removendo completamente o legado (`nivel_acesso`, `admin_global`) e adotando **capabilities** como única base de autorização (Firestore) e **caps** como única base de autorização no Storage (Custom Claims). Substituir o “nível de acesso” do arquivo por `arquivo_privado` (booleano) e substituir o “nível de acesso” do usuário por `cargo` (string de exibição).

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

---

## 0) Decisões fixas (não negociar)

1) **Sem backend tradicional.** Continuar full Vue + Firebase.  
2) **Fonte de verdade de autorização:** `usuarios/{uid}.capabilities` (Firestore).  
3) **Fonte de verdade do Storage:** Custom Claims `caps: string[]` + `ids_setor` + `ativo`.  
4) **Remover legado:** `usuarios.nivel_acesso` e `usuarios.admin_global` deixam de existir no contrato, no código, nas rules, no seed, nos testes e na documentação.  
5) **Anexo final de Solicitações:** permanece **somente solicitante lê** (não mudar essa decisão).  
6) **Criação de Solicitações:** permanece **somente encarregado** (`solicitacoes_criar`).  
7) **`arquivo_privado` default = `false`** (arquivo nasce público por padrão).  
8) **Governança global:** arquivos globais são gerenciados exclusivamente por capability `biblioteca_gerenciar_global` (não existe mais `admin_global`).  
9) **Capability ausente = false.**  
10) **Produção:** como há apenas 2 usuários em produção (do próprio responsável), é aceitável deletar e recriar usuários conforme o novo padrão (sem script obrigatório de migração em produção). Em emulador, o seed deve refletir o novo contrato.

---

## 1) Escopo desta spec

### 1.1 Inclui

A) Remover `nivel_acesso` e `admin_global` do contrato de `usuarios`.  
B) Introduzir `cargo: string` em `usuarios` (exibição; não autoriza).  
C) Substituir `arquivos.nivel_acesso` por `arquivos.arquivo_privado: boolean` (default false).  
D) Atualizar Firestore Rules para usar **somente** capabilities (sem fallback legado).  
E) Atualizar Storage Rules para usar **somente** `caps` (sem `nivel_acesso/admin_global`).  
F) Atualizar Cloud Function `syncClaimsFromUsuario` para emitir apenas `ativo`, `ids_setor`, `caps`.  
G) Atualizar frontend (sessão, UI, guards, casos de uso, repositórios) removendo dependências do legado.  
H) Atualizar seed do emulador e scripts auxiliares para o novo contrato.  
I) Atualizar testes (unit + rules) e documentação impactada, removendo trechos antigos e contratos não utilizados.

### 1.2 Não inclui

- Hierarquia Administração/Regional.  
- Novos perfis (Ancião/Regional) com permissões novas (isso vem depois).  
- Módulo de gestão de usuários/perfis por UI.

---

## 2) Contrato de dados (mudanças)

### 2.1 Coleção `usuarios`

**Remover campos:**
- `nivel_acesso`
- `admin_global`

**Adicionar campo:**
- `cargo: string` (ex.: "Encarregado Local", "Secretário Musical", "Ancião da Música", "Encarregado Regional", etc.)

**Manter:**
- `ativo: boolean`
- `ids_setor: array<string>`
- `capabilities: map<string, boolean>` (Spec 22)

Regras:
- `cargo` é apenas exibição; não deve ser usado para autorização.
- capability ausente => false.

### 2.2 Coleção `arquivos`

**Remover campo:**
- `nivel_acesso` (1/2)

**Adicionar campo:**
- `arquivo_privado: boolean`  
  - `false` => público (equivalente ao antigo `nivel_acesso=1`)  
  - `true` => privado/restrito (equivalente ao antigo `nivel_acesso=2`)  
  - default operacional: `false`

**Manter:**
- `escopo: 'global'|'setor'`
- `id_setor` (somente quando escopo setor)
- `id_nuvem`, `tipo`, `titulo`, etc.

### 2.3 Coleção `solicitacoes`

Sem mudança de contrato nesta spec (exceto remoção de qualquer dependência de `nivel_acesso` do usuário no frontend/rules).

---

## 3) Enums (fonte única de verdade)

### 3.1 Capabilities

Manter `src/enums/capabilities.js` (Spec 22).  
Regra: não hardcodar strings de capability.

### 3.2 Claims

Atualizar `src/enums/claims.js` para conter apenas:

```js
export const CLAIM = {
  ATIVO: 'ativo',
  IDS_SETOR: 'ids_setor',
  CAPS: 'caps',
}
```

Remover qualquer referência a `nivel_acesso` e `admin_global` do enum de claims.

### 3.3 Arquivo privado

Criar enum simples (opcional) para evitar magic boolean em alguns pontos críticos, se fizer sentido:
- `src/enums/arquivoPrivado.js` com helpers `ehPrivado(arquivo)` etc.  
(Se não houver reutilização real, manter local e simples.)

---

## 4) Cloud Function — syncClaimsFromUsuario (hard cut)

Arquivos:
- `functions/index.js`
- `functions/claims.js`

### 4.1 Claims finais

A Function deve emitir apenas:
- `ativo: boolean`
- `ids_setor: array<string>`
- `caps: array<string>`

Remover:
- `nivel_acesso`
- `admin_global`

### 4.2 Fonte de `caps`

`caps` deve ser derivado **somente** de `usuarios/{uid}.capabilities`.

Regras:
- se `capabilities` ausente => `caps=[]`
- se `capabilities` presente => incluir apenas chaves com valor `true` e que existam no enum `CAP`.

### 4.3 Autorização da callable

Manter a política atual (admin-only) **mas agora baseada em capability**, não em `nivel_acesso`:
- exigir `request.auth.token.ativo == true`
- exigir `request.auth.token.caps` conter `usuarios_gerenciar` **OU** (se você ainda não quer liberar isso) manter temporariamente a política atual até existir UI de gestão.

**Decisão para esta spec:** como `usuarios_gerenciar` ainda não é usado por UI, manter a política atual de admin-only pode ficar impossível sem `nivel_acesso`. Portanto, nesta spec, a callable deve autorizar por capability **mínima** existente em perfis admin atuais, por exemplo:
- `biblioteca_gerenciar_setor` (admin setorial) OU `biblioteca_gerenciar_global` (admin global)

> Stop condition: se isso ficar ambíguo, parar e pedir confirmação humana antes de publicar.

### 4.4 Testes unitários

Atualizar `tests/unit/syncClaims.test.js`:
- remover cenários de legado (`nivel_acesso/admin_global`)
- cobrir derivação de `caps` a partir de `capabilities`
- cobrir filtragem por enum (capability desconhecida não entra)

---

## 5) Storage Rules — hard cut para `caps`

Arquivo: `storage.rules`.

### 5.1 Remover helpers legados

Remover qualquer helper que use:
- `request.auth.token.nivel_acesso`
- `request.auth.token.admin_global`

Manter helpers:
- autenticado/ativo
- pertenceAoSetor via `ids_setor`
- `temCap(cap)` via `caps`

### 5.2 Biblioteca por setor

Manter comportamento, mas agora 100% por caps:
- ler `nivel_1`: `biblioteca_ler_publicos`
- ler `nivel_2`: `biblioteca_ler_privados`
- escrever/remover: `biblioteca_gerenciar_setor`

### 5.3 Biblioteca global

- ler `nivel_1`: `biblioteca_ler_publicos`
- ler `nivel_2`: `biblioteca_ler_privados`
- escrever/remover: `biblioteca_gerenciar_global`

### 5.4 Solicitações (anexo final)

Manter:
- read: somente solicitante
- write/delete: `solicitacoes_agir_setor` + pertenceAoSetor

---

## 6) Firestore Rules — hard cut para capabilities

Arquivo: `firestore.rules`.

### 6.1 Remover helpers legados

Remover:
- `ehAdmin()` baseado em `nivel_acesso`
- `ehAdminGlobal()` baseado em `admin_global`
- qualquer gate por `nivel_acesso`

Adicionar helpers:
- `temCap(chave)` lendo `docUsuario().capabilities[chave] == true` (ausente => false)

### 6.2 `usuarios/{uid}`

- read: somente o próprio
- write: negar tudo (exceto exceções já aprovadas no projeto, como `primeiro_acesso true→false`, se existir)

### 6.3 `arquivos/{id}`

Atualizar leitura e escrita para usar `arquivo_privado`:

- read:
  - se `arquivo_privado == false`: exige `biblioteca_ler_publicos`
  - se `arquivo_privado == true`: exige `biblioteca_ler_privados`
  - e respeitar escopo global vs setor (global visível a todos; setor exige pertencer ao setor)

- create/update/delete:
  - escopo setor: exige `biblioteca_gerenciar_setor` e setor permitido
  - escopo global: exige `biblioteca_gerenciar_global` e `id_setor` ausente

### 6.4 `solicitacoes/{id}`

Trocar gates para capabilities (sem legado):
- create: exige `solicitacoes_criar` e demais validações já existentes
- read:
  - solicitante: `solicitacoes_ver_proprias`
  - admin do setor: `solicitacoes_ver_setor` + pertenceAoSetor
- update:
  - solicitante em aberto: manter regra atual, mas gate por `solicitacoes_ver_proprias`
  - admin: gate por `solicitacoes_agir_setor` + regras de transição/responsável

---

## 7) Frontend — hard cut

Arquivos afetados (prováveis):
- `src/servicos/casos_de_uso/autenticacao.js` (contexto do usuário)
- `src/composables/usarSessao.js` (derivados)
- `src/router/guards.js` (requerAdmin -> capabilities)
- `src/modulos/**` (gating de UI admin)
- `src/servicos/casos_de_uso/biblioteca*.js` e `repositorioArquivos.js` (substituir `nivel_acesso` do arquivo por `arquivo_privado`)
- `src/servicos/casos_de_uso/solicitacoes*.js` (remover dependência de `nivel_acesso` do usuário)

### 7.1 Contexto do usuário

- Remover `ehAdmin` derivado de `nivel_acesso`.
- Introduzir `cargo` no contexto para exibição.
- Derivados de permissão devem vir de `capabilities`.

### 7.2 Biblioteca (arquivo público/privado)

- Substituir qualquer enum/constante `NIVEL_ARQUIVO` por lógica baseada em `arquivo_privado`.
- Atualizar UI (labels) para “Público/Privado” conforme boolean.
- Atualizar `bibliotecaCaminhos.js`:
  - `nivel_1` quando `arquivo_privado == false`
  - `nivel_2` quando `arquivo_privado == true`

### 7.3 Guards e navegação

- `requerAdmin` deve ser substituído por gates de capability:
  - Biblioteca admin: `biblioteca_gerenciar_setor` (ou global)
  - Fila: `solicitacoes_ver_setor`

---

## 8) Seed e scripts

### 8.1 `scripts/seed-emulador.mjs`

- Remover escrita de `nivel_acesso` e `admin_global`.
- Adicionar `cargo` coerente com o perfil.
- Preencher `capabilities` conforme matriz vigente.
- Injetar claims no Auth emulator com:
  - `ativo`, `ids_setor`, `caps`

### 8.2 `scripts/clonar-arquivos-setores.mjs`

- Atualizar para copiar `arquivo_privado` em vez de `nivel_acesso`.
- Atualizar montagem de `id_nuvem` para usar `arquivo_privado` -> `nivel_1|nivel_2`.

---

## 9) Testes (obrigatório)

### 9.1 Tests de rules — Firestore

Atualizar:
- `tests/regras/arquivos.test.js`:
  - remover seed de `nivel_acesso/admin_global`
  - adicionar seed de `capabilities` e `cargo`
  - atualizar cenários globais/setor para capability `biblioteca_gerenciar_global`
  - atualizar leitura público/privado para `arquivo_privado`

- `tests/regras/solicitacoes.test.js`:
  - remover seed de `nivel_acesso`
  - adicionar capabilities
  - garantir que admin sem `solicitacoes_criar` não cria solicitação

### 9.2 Tests de rules — Storage

Atualizar `tests/regras/storage.test.js`:
- contexts devem usar `caps` (lista) + `ids_setor` + `ativo`
- remover qualquer uso de `nivel_acesso/admin_global`

### 9.3 Tests unitários

Atualizar/adicionar:
- `tests/unit/bibliotecaCaminhos.test.js` para cobrir `arquivo_privado` -> `nivel_1|nivel_2`
- `tests/unit/escopoArquivos.test.js` se houver dependência de `admin_global` (remover)
- `tests/unit/capabilities.test.js` (se existir) para garantir helper de capability

---

## 10) Documentação (obrigatório — refletir estado real)

Atualizar e remover trechos antigos:

1) `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
- remover `nivel_acesso/admin_global` de `usuarios`
- adicionar `cargo` e `capabilities`
- remover `nivel_acesso` de `arquivos` e adicionar `arquivo_privado`
- atualizar explicação de autorização (Firestore por capabilities; Storage por caps)

2) `docs/steering/steering-03.md`
- atualizar lista de campos oficiais
- remover referências a `nivel_acesso/admin_global` como base de autorização

3) `docs/guias/claims-e-sincronizacao.md`
- atualizar tabela de claims finais (`ativo`, `ids_setor`, `caps`)
- remover menções a `nivel_acesso/admin_global`

4) `docs/guias/piloto-seed-dados.md`
- atualizar exemplos para `cargo`, `capabilities`, `arquivo_privado`

5) `docs/decisoes/status-execucao.md`
- registrar hard cut concluído

Regra: documentação deve refletir o estado atual; não manter “histórico” na parte ativa.

---

## 11) Critérios de aceite

- [ ] Nenhum arquivo do projeto referencia `usuarios.nivel_acesso` ou `usuarios.admin_global`.
- [ ] Nenhuma rule referencia `nivel_acesso`/`admin_global` (Firestore/Storage).
- [ ] Claims finais são apenas `ativo`, `ids_setor`, `caps`.
- [ ] Biblioteca funciona com `arquivo_privado` (público/privado) e caminhos `nivel_1|nivel_2` coerentes.
- [ ] Governança global funciona por capability `biblioteca_gerenciar_global`.
- [ ] `npm run test:unit` passa.
- [ ] `npm run test:rules` passa (Docker).
- [ ] Documentação atualizada sem contradições.

---

## 12) Stop conditions (parar e pedir confirmação humana)

Parar se precisar:
- mudar regra do anexo final (quem lê);
- introduzir hierarquia (administração/regional);
- abrir escrita em `usuarios` além das exceções já aprovadas;
- criar capabilities fora do enum oficial.
