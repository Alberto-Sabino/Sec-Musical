# Spec 22 — Capabilities & Claims (migração compatível com legado)

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-20  
**Objetivo:** introduzir um modelo evolutivo de **capabilities** (fonte de verdade no Firestore) e um espelho mínimo em **Custom Claims** (lista de strings) para endurecer e preparar autorização por perfil **sem quebrar o comportamento atual** do MVP. Esta spec mantém compatibilidade com o legado (`nivel_acesso`, `admin_global`) e prepara o hard cut para uma spec seguinte.

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

---

## 0) Decisões fixas (não negociar)

1) **Sem backend tradicional.** Continuar full Vue + Firebase.  
2) **Fonte de verdade:** Firestore (`usuarios/{uid}`) contém capabilities.  
3) **Claims:** espelham um subconjunto mínimo como **lista de strings** (`caps: string[]`).  
4) **Compatibilidade com legado:** manter `nivel_acesso` e `admin_global` nesta spec. O hard cut será feito em spec posterior.  
5) **Capability ausente = false.** (Ausência no mapa do Firestore ou na lista de claims implica “não permitido”.)  
6) **Sem hierarquia nova:** continuar usando `ids_setor` (setor).  
7) **Anexo final de Solicitações:** permanece **somente solicitante lê** (não mudar Storage Rules desse ponto).  
8) **Criação de Solicitações:** por enquanto, **somente encarregado** (capability `solicitacoes_criar` separada).  
9) **Emulador-first:** deve ser validável via emuladores + testes unitários + testes de rules. Produção fica pendente de Billing/Blaze (como já é hoje).

---

## 1) Escopo desta spec

### 1.1 Inclui

A) Adicionar campo `capabilities` em `usuarios/{uid}` (mapa booleano).  
B) Definir enum único de capabilities e claims (sem magic strings).  
C) Atualizar Cloud Function `syncClaimsFromUsuario` para emitir claim `caps: string[]` (lista).  
D) Atualizar `storage.rules` para autorizar usando `caps` (mantendo comportamento atual).  
E) Atualizar `firestore.rules` para autorizar usando `capabilities` **com fallback compatível** para o legado (mantendo comportamento atual).  
F) Atualizar frontend (sessão/derivados) para usar capabilities como fonte principal de gating de UI (defesa em profundidade).  
G) Atualizar seed do emulador para preencher `capabilities` coerentes com os perfis atuais.  
H) Atualizar testes (unit + rules) e documentação impactada, removendo/ajustando trechos que ficarem falsos.

### 1.2 Não inclui

- Hard cut removendo `nivel_acesso`/`admin_global` do código e do contrato (isso é a próxima spec).  
- Novos perfis (Ancião/Regional) e mudanças de hierarquia (Administração/Regional).  
- Módulo de gestão de usuários/perfis por UI.

---

## 2) Modelo de capabilities (contrato)

### 2.1 Campo novo em `usuarios/{uid}`

Adicionar:

```js
capabilities: {
  biblioteca_ler_publicos: boolean,
  biblioteca_ler_privados: boolean,
  biblioteca_gerenciar_setor: boolean,
  biblioteca_gerenciar_global: boolean,

  solicitacoes_criar: boolean,
  solicitacoes_ver_proprias: boolean,
  solicitacoes_ver_setor: boolean,
  solicitacoes_agir_setor: boolean,

  usuarios_ver: boolean,
  usuarios_gerenciar: boolean,
}
```

Regras:
- Campo ausente ou chave ausente => tratar como `false`.
- Não criar capabilities fora do enum oficial (ver §3).

### 2.2 Matriz inicial (equivalente ao comportamento atual)

**Encarregado (nivel_acesso=1)**  
- biblioteca_ler_publicos = true  
- biblioteca_ler_privados = false  
- biblioteca_gerenciar_setor = false  
- biblioteca_gerenciar_global = false  
- solicitacoes_criar = true  
- solicitacoes_ver_proprias = true  
- solicitacoes_ver_setor = false  
- solicitacoes_agir_setor = false  
- usuarios_ver = false  
- usuarios_gerenciar = false  

**Secretário de setor (nivel_acesso=2, admin_global=false)**  
- biblioteca_ler_publicos = true  
- biblioteca_ler_privados = true  
- biblioteca_gerenciar_setor = true  
- biblioteca_gerenciar_global = false  
- solicitacoes_criar = false  
- solicitacoes_ver_proprias = true  
- solicitacoes_ver_setor = true  
- solicitacoes_agir_setor = true  
- usuarios_ver = false  
- usuarios_gerenciar = false  

**Secretário global (nivel_acesso=2, admin_global=true)**  
- tudo do secretário de setor +  
- biblioteca_gerenciar_global = true  
- solicitacoes_criar = false  
- usuarios_ver/usuarios_gerenciar = false (por enquanto)

> Observação: `solicitacoes_ver_proprias` para admin fica `true` por compatibilidade e simplicidade (não muda regras de segurança; é apenas capability).

---

## 3) Fonte única de verdade (enums) — obrigatório

### 3.1 Enum de capabilities (novo)

Criar arquivo:

- `src/enums/capabilities.js`

Conteúdo mínimo:

```js
export const CAP = {
  BIBLIOTECA_LER_PUBLICOS: 'biblioteca_ler_publicos',
  BIBLIOTECA_LER_PRIVADOS: 'biblioteca_ler_privados',
  BIBLIOTECA_GERENCIAR_SETOR: 'biblioteca_gerenciar_setor',
  BIBLIOTECA_GERENCIAR_GLOBAL: 'biblioteca_gerenciar_global',

  SOLICITACOES_CRIAR: 'solicitacoes_criar',
  SOLICITACOES_VER_PROPRIAS: 'solicitacoes_ver_proprias',
  SOLICITACOES_VER_SETOR: 'solicitacoes_ver_setor',
  SOLICITACOES_AGIR_SETOR: 'solicitacoes_agir_setor',

  USUARIOS_VER: 'usuarios_ver',
  USUARIOS_GERENCIAR: 'usuarios_gerenciar',
}

export const TODAS_CAPABILITIES = Object.values(CAP)

export function capValida(valor) {
  return TODAS_CAPABILITIES.includes(valor)
}
```

Regra: não hardcodar strings de capability em UI/casos de uso/rules tests.

### 3.2 Enum de claims (novo)

Criar arquivo:

- `src/enums/claims.js`

Conteúdo mínimo:

```js
export const CLAIM = {
  ATIVO: 'ativo',
  IDS_SETOR: 'ids_setor',
  CAPS: 'caps',
}
```

> Nota: nesta spec, `nivel_acesso` e `admin_global` permanecem existindo como legado, mas o objetivo é que Storage Rules passem a depender de `caps`. O hard cut removerá `nivel_acesso/admin_global` das claims.

---

## 4) Cloud Function — syncClaimsFromUsuario (migração)

Arquivos:
- `functions/index.js`
- `functions/claims.js`

### 4.1 Novo contrato de claims

Além de `ativo` e `ids_setor`, a Function deve emitir:

- `caps: string[]`

Regras:
- `caps` deve conter apenas valores do enum `CAP`.
- Se `capabilities` estiver ausente no documento, `caps` deve ser `[]`.
- Capability ausente => não entra na lista.

### 4.2 Compatibilidade com legado (nesta spec)

Enquanto `capabilities` não existir (ou estiver incompleto), a Function deve derivar `caps` a partir do legado:

- Se `nivel_acesso == 1` (encarregado): gerar caps conforme matriz do §2.2 (encarregado).
- Se `nivel_acesso == 2` (admin): gerar caps conforme matriz do §2.2 (secretário de setor).
- Se `nivel_acesso == 2 && admin_global == true`: incluir também `biblioteca_gerenciar_global`.

Prioridade:
1) Se `capabilities` existir no documento e for um objeto, usar `capabilities` como fonte principal.
2) Caso contrário, derivar do legado.

### 4.3 Validação e erros

- Se `ativo` não for boolean, lançar erro.
- Se `ids_setor` não for array não-vazio de strings, lançar erro.
- Não setar claims parciais.

### 4.4 Testes unitários (functions/claims)

Atualizar `tests/unit/syncClaims.test.js` para cobrir:
- derivação de `caps` a partir de `capabilities` (objeto)  
- derivação de `caps` a partir do legado (`nivel_acesso`, `admin_global`)  
- capability ausente => não entra em `caps`  
- `solicitacoes_criar` presente apenas para encarregado (na derivação do legado)

---

## 5) Storage Rules — migrar autorização para `caps` (mantendo comportamento)

Arquivo: `storage.rules`.

### 5.1 Helpers

Adicionar helper:

- `function temCap(cap) { return ativo() && cap in request.auth.token.caps; }`

> Observação: `caps` é array. Em rules, `x in array` funciona como membership.

### 5.2 Biblioteca por setor (`biblioteca/{idSetor}/{nivel}/{arquivo}`)

Manter o mesmo comportamento atual, mas trocar a lógica:

- Leitura `nivel_1`: exige `temCap('biblioteca_ler_publicos')` e pertence ao setor.
- Leitura `nivel_2`: exige `temCap('biblioteca_ler_privados')` e pertence ao setor.
- Escrita/remoção: exige `temCap('biblioteca_gerenciar_setor')` e pertence ao setor.
- MIME/teto permanecem.

### 5.3 Biblioteca global (`biblioteca_global/{nivel}/{arquivo}`)

- Leitura `nivel_1`: exige `temCap('biblioteca_ler_publicos')`.
- Leitura `nivel_2`: exige `temCap('biblioteca_ler_privados')`.
- Escrita/remoção: exige `temCap('biblioteca_gerenciar_global')`.
- MIME/teto permanecem.

### 5.4 Solicitações (anexo final)

Manter decisão confirmada:
- leitura: somente solicitante (`request.auth.uid == id_solicitante`)
- escrita/remoção: exige `temCap('solicitacoes_agir_setor')` e pertence ao setor (via `ids_setor`)

### 5.5 Compatibilidade com legado (Storage)

Nesta spec, **não** manter fallback por `nivel_acesso/admin_global` no Storage Rules.  
Motivo: Storage Rules não leem Firestore; a fonte deve ser claims. A compatibilidade será garantida pela Function (que emite `caps` mesmo quando o doc ainda está legado).

---

## 6) Firestore Rules — migrar autorização para capabilities (com fallback)

Arquivo: `firestore.rules`.

### 6.1 Helpers

Adicionar helpers para capabilities lendo do doc do usuário:

- `function caps() { return docUsuario().capabilities; }`
- `function capTrue(chave) { return ('capabilities' in docUsuario()) && (chave in caps()) && caps()[chave] == true; }`

E fallback legado (nesta spec):
- `function capLegado(chave) { ... }` derivando do `nivel_acesso/admin_global` conforme matriz do §2.2.

Helper final:
- `function temCap(chave) { return capTrue(chave) || capLegado(chave); }`

### 6.2 Arquivos (`arquivos/{id}`)

Trocar autorização para capabilities (mantendo comportamento):

- Leitura:
  - se `nivel_acesso` do arquivo == 1 => exige `temCap('biblioteca_ler_publicos')` e (escopo global ou pertence ao setor)
  - se `nivel_acesso` do arquivo == 2 => exige `temCap('biblioteca_ler_privados')` e (escopo global ou pertence ao setor)

- Create/Update/Delete:
  - escopo setor: exige `temCap('biblioteca_gerenciar_setor')` e pertence ao setor
  - escopo global: exige `temCap('biblioteca_gerenciar_global')` e `id_setor` ausente

### 6.3 Solicitações (`solicitacoes/{id}`)

Manter regras atuais, mas trocar gates:

- Create (solicitante):
  - exige `temCap('solicitacoes_criar')`
  - e demais validações já existentes (setor, estado inicial, etc.)

- Read:
  - solicitante: exige `temCap('solicitacoes_ver_proprias')`
  - admin do setor: exige `temCap('solicitacoes_ver_setor')` e pertence ao setor

- Update:
  - solicitante em `em_aberto`: exige `temCap('solicitacoes_ver_proprias')` (ou capability específica de editar; manter como está nesta spec)
  - admin: exige `temCap('solicitacoes_agir_setor')` e demais regras (transições, responsável, etc.)

### 6.4 Usuários (`usuarios/{uid}`)

Manter leitura do próprio documento.

Escrita:
- manter como está (sem gestão por UI), exceto exceções já existentes no projeto (ex.: `primeiro_acesso` da Spec 20, se já estiver aplicada).

---

## 7) Frontend — sessão e gating por capabilities

Arquivos:
- `src/composables/usarSessao.js`
- `src/router/guards.js`
- telas admin (Biblioteca admin, fila admin)

### 7.1 Derivados

Adicionar derivados em `usarSessao` (exemplos):
- `podeGerenciarBibliotecaSetor`
- `podeGerenciarBibliotecaGlobal`
- `podeVerSolicitacoesSetor`
- `podeAgirSolicitacoesSetor`
- `podeCriarSolicitacao`

Fonte:
- preferir `estado.contexto.capabilities` (Firestore) para gating de UI.
- não usar claims para gating de UI (claims são para Storage).

### 7.2 Guards

Atualizar `requerAdmin` para não depender de `ehAdmin` (nivel_acesso), e sim de capabilities:
- páginas administrativas de Biblioteca: exigir `biblioteca_gerenciar_setor` (ou global)
- fila admin: exigir `solicitacoes_ver_setor` (ver) e ações exigem `solicitacoes_agir_setor`

> Nesta spec, manter `ehAdmin` existente por compatibilidade, mas o guard deve migrar para capabilities.

---

## 8) Seed do emulador

Arquivo: `scripts/seed-emulador.mjs`.

- Ao criar documentos em `usuarios/{uid}`, preencher `capabilities` conforme matriz do §2.2.
- Manter `nivel_acesso/admin_global` por compatibilidade (hard cut depois).

Após criar o doc, a injeção de claims no Auth emulator deve incluir:
- `ativo`
- `ids_setor`
- `caps` (lista) — derivada do mesmo objeto `capabilities` (não duplicar lógica; criar helper no script).

---

## 9) Testes (obrigatório)

### 9.1 Tests de rules — Storage

Arquivo: `tests/regras/storage.test.js`.

- Atualizar contexts autenticados para usar `caps: [...]` em vez de `nivel_acesso/admin_global`.
- Cobrir cenários equivalentes aos atuais:
  - usuário com `biblioteca_ler_publicos` lê `nivel_1`
  - usuário sem `biblioteca_ler_privados` não lê `nivel_2`
  - admin setorial (cap gerenciar_setor) escreve no setor
  - admin global (cap gerenciar_global) escreve em `biblioteca_global`
  - solicitante lê anexo; admin não lê; admin do setor escreve anexo

### 9.2 Tests de rules — Firestore

Arquivos:
- `tests/regras/arquivos.test.js`
- `tests/regras/solicitacoes.test.js`

Atualizar seed dos testes para incluir `capabilities` nos docs `usuarios` e validar que:
- comportamento permanece igual ao atual, mas agora autorizado por capabilities.
- adicionar pelo menos 1 teste garantindo que `solicitacoes_criar` bloqueia criação para admin (cap false).

### 9.3 Tests unitários

Adicionar:
- `tests/unit/capabilities.test.js` cobrindo helper puro `temCapability(capabilities, cap)` e/ou derivação de matriz legado->caps (se existir helper puro no frontend).

---

## 10) Documentação (obrigatório — refletir estado real)

Atualizar:

1) `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
- adicionar `capabilities` em `usuarios`
- explicar que Storage autoriza por claims `caps` (lista) + `ids_setor` + `ativo`
- registrar que legado ainda existe nesta spec (hard cut em spec seguinte)

2) `docs/steering/steering-03.md`
- adicionar `capabilities` como campo oficial de `usuarios`
- ajustar texto que hoje define autorização por `nivel_acesso` para refletir capabilities

3) `docs/guias/claims-e-sincronizacao.md`
- atualizar tabela de claims para incluir `caps`
- explicar que `nivel_acesso/admin_global` são legado e serão removidos

4) `docs/decisoes/status-execucao.md`
- registrar entrega e pendências (curto e factual)

Regra: remover/ajustar trechos que ficarem falsos (sem “histórico” na parte ativa).

---

## 11) Critérios de aceite

- [ ] Usuários existentes (legado) continuam funcionando no emulador porque a Function deriva `caps` do legado quando `capabilities` não existe.
- [ ] Storage Rules passam a depender de `caps` (não de `nivel_acesso/admin_global`) e os testes de Storage passam.
- [ ] Firestore Rules passam a depender de `capabilities` com fallback legado e os testes de Firestore passam.
- [ ] UI/guards passam a usar capabilities para gating (defesa em profundidade).
- [ ] `npm run test:unit` passa.
- [ ] `npm run test:rules` passa (Docker).
- [ ] Documentação atualizada sem contradições.

---

## 12) Stop conditions (parar e pedir confirmação humana)

Parar se precisar:
- criar capabilities fora do enum oficial;
- mudar o contrato do anexo final (quem lê);
- introduzir hierarquia (administração/regional);
- introduzir backend tradicional;
- remover `nivel_acesso/admin_global` nesta spec (isso é a spec seguinte).

---

## 13) Próxima spec (planejada, não executar aqui)

**Spec 23 — Hard cut:** remover `nivel_acesso/admin_global` do código, rules, seed, docs e claims, mantendo apenas capabilities + caps.
