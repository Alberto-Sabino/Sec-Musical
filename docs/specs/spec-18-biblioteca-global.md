# Biblioteca Global por padrão (escopo `global|setor`) + `admin_global` + hardening de rules (v2)

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Baseline:** 2026-10-06  
**Objetivo:** permitir que arquivos da Biblioteca sejam **globais por padrão** (visíveis em todos os setores), com opção de restringir a um setor; manter `nivel_acesso` (1/2) independente de escopo; introduzir claim `admin_global` para governança de escrita em globais.

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

---

## 0) Contexto e fatos que o agente deve assumir como verdade

1) O projeto usa arquitetura em camadas: **tela → caso de uso → repositório/infra**.
2) O contrato de upload é centralizado em `src/servicos/casos_de_uso/regrasUpload.js`.
3) O contrato de caminhos (`id_nuvem`) é fonte única para localizar binários no Storage.
4) O projeto já usa **custom claims** para hardening de rules (Spec 17): `ativo`, `nivel_acesso`, `ids_setor`.
5) Existe callable `syncClaimsFromUsuario` (produção pendente de Billing/Blaze) que espelha `usuarios/{uid}` → claims.

---

## 1) Escopo desta spec

### 1.1 Entregas obrigatórias

A) **Modelo de dados**: adicionar `escopo` em `arquivos` com valores `'global' | 'setor'` (fonte única via enum).  
B) **UI/UX padronizada (criação e edição)**: no formulário admin de arquivo, exibir:
- checkbox: **“Restringir o arquivo ao setor”** (default **desmarcada**)
- select de setor ao lado (default **desabilitado**; habilita quando checkbox marcada)

C) **Regras de escopo derivadas na UI**:
- checkbox **marcada** → `escopo='setor'` e `id_setor` obrigatório (valor do select)
- checkbox **desmarcada** → `escopo='global'` **somente se** o admin tiver `admin_global=true`

D) **Governança de UI**:
- Admin **sem** `admin_global=true`:
  - não deve ter como escolher `escopo='global'`.
  - implementação recomendada: checkbox travada como marcada (ou ocultar checkbox e manter select sempre habilitado). **Não inventar novo padrão**: escolher uma das duas e manter consistente.
- Admin **com** `admin_global=true`:
  - pode criar/editar globais.

E) **Edição de escopo**: permitir mudar `escopo` após criado, com regras:
- `global → setor`: permitido para admin_global; exige seleção de setor destino (select) dentre os setores do admin.
- `setor → global`: permitido apenas para `admin_global`.

F) **Storage paths**: introduzir caminho oficial para globais:
- Global: `biblioteca_global/{nivel_1|nivel_2}/{id_arquivo}.{ext}`
- Setor (existente): `biblioteca/{id_setor}/{nivel_1|nivel_2}/{id_arquivo}.{ext}`

G) **Rules** (Firestore + Storage): endurecer para suportar globais com governança:
- leitura global: usuário ativo (respeitando `nivel_1|nivel_2`)
- escrita global: somente `admin_global` (e necessariamente admin)
- escrita setor: admin do setor

H) **Claims**: adicionar claim `admin_global` com regra de consistência:
- **nunca** permitir `admin_global=true` quando `nivel_acesso != 2`.

I) **Testes de rules**: atualizar/adicionar cenários para globais.

### 1.2 Fora de escopo (proibições)
- Não criar módulo novo de gestão de usuários/claims.
- Não mudar contrato de Solicitações.
- Não introduzir backend tradicional.
- Não mudar o design system base além do necessário para checkbox/select.
- Não implementar “compartilhamento parcial” (ex.: global só para alguns setores). Global é **do sistema**.

---

## 2) Decisões de negócio (fixas)

1) **Escopo não se mistura com nível de acesso**:
   - `escopo` ∈ {`global`, `setor`}
   - `nivel_acesso` ∈ {1, 2} (quem pode ver: usuário vs admin)
   - Ex.: “global só para admin” = `escopo='global'` + `nivel_acesso=2`.

2) **Global é global do sistema**: visível para todos os setores cadastrados e futuros.

3) Governança:
   - Admin comum (nivel 2) pode atuar apenas nos setores em `ids_setor`.
   - Admin com claim `admin_global=true` pode atuar também nos arquivos globais.

---

## 3) Contrato de dados (Firestore)

### 3.1 Coleção `arquivos`

Adicionar campo:
- `escopo`: string, obrigatório para novos documentos, valores permitidos: `'global' | 'setor'`.

Regras de consistência:
- Se `escopo == 'setor'`:
  - `id_setor` é obrigatório e deve ser um setor real.
- Se `escopo == 'global'`:
  - `id_setor` deve ser **ausente** ou `null` (preferir ausente).

Compatibilidade com legados:
- Documentos antigos sem `escopo` devem ser tratados como `escopo='setor'`.

### 3.2 Coleção `usuarios`

Adicionar campo:
- `admin_global`: boolean (default `false`).

Regra de consistência:
- `admin_global` só pode ser `true` se `nivel_acesso == 2`.

---

## 4) Fonte única de verdade (enums)

Criar enum para escopo:
- `src/enums/escopoArquivos.js`

Conteúdo mínimo:
- `ESCOPO_ARQUIVO = { GLOBAL: 'global', SETOR: 'setor' }`
- `escopoValido(valor)`

**Regra:** não hardcodar `'global'`/`'setor'` espalhado em telas/casos de uso/rules tests.

---

## 5) Caminhos oficiais (`id_nuvem`) e helpers

### 5.1 Atualizar `src/servicos/casos_de_uso/bibliotecaCaminhos.js`

Adicionar suporte a `escopo`:
- Se `escopo == 'global'`:
  - `biblioteca_global/{nivel}/{id_arquivo}.{ext}`
- Se `escopo == 'setor'`:
  - `biblioteca/{id_setor}/{nivel}/{id_arquivo}.{ext}`

---

## 6) Casos de uso (Biblioteca admin)

### 6.1 Cadastro (`cadastrarArquivo`)

Alterar entrada para incluir `escopo` e (quando aplicável) `id_setor`.

Ordem obrigatória:
1) gerar `id_arquivo`
2) montar `id_nuvem` (depende de `escopo`)
3) enviar Storage
4) persistir Firestore (inclui `escopo` e `id_setor` quando aplicável)
5) auditoria

### 6.2 Edição

Se mudar algo que altera o caminho (`escopo` e/ou `nivel_acesso` que muda `nivel_1|nivel_2`):
1) calcular `id_nuvem` antigo e novo
2) executar `moverArquivo(idAntigo, idNovo)`
3) atualizar Firestore com novo `id_nuvem`, `escopo`, `id_setor` (se aplicável), `nivel_acesso`
4) auditoria

---

## 7) Rules — Firestore (diretrizes)

- `arquivos/{id}` create/update/delete:
  - exigir `ativo==true` e `nivel_acesso==2`
  - se `escopo=='global'`: exigir `admin_global==true`
  - se `escopo=='setor'`: exigir `id_setor` ∈ `ids_setor`

- `usuarios/{uid}`:
  - impedir que usuário `nivel_acesso==1` consiga gravar `admin_global=true`.

---

## 8) Rules — Storage (diretrizes)

Adicionar `match`:
- `biblioteca_global/{nivel}/{arquivo}`

Autorização:
- leitura `nivel_1`: usuário ativo
- leitura `nivel_2`: somente admin
- escrita/remoção global: somente `admin_global`

Manter validações MIME/tamanho.

---

## 9) Claims: `admin_global`

- Fonte: `usuarios/{uid}.admin_global`.
- Sync: atualizar `syncClaimsFromUsuario`.
- Consistência obrigatória: se `nivel_acesso != 2`, forçar `admin_global=false` nas claims.

---

## 10) Testes (obrigatório)

Cobrir:
- admin comum não escreve globais
- admin_global escreve globais
- usuário comum lê globais `nivel_1` e não lê `nivel_2`
- tentativa de `admin_global=true` com `nivel_acesso=1` falha

---

## 11) Stop conditions (parar e perguntar)

Parar se precisar:
- criar campos além de `escopo` (arquivos) e `admin_global` (usuarios)
- alterar contrato de Solicitações
- alterar formato de `id_nuvem` de setor existente

---

## 12) Critérios de pronto

- build/lint/testes OK
- UI padronizada com checkbox + select
- rules e testes cobrindo governança global

---

## Apêndice — Arquivos prováveis a alterar

- `src/enums/escopoArquivos.js` (novo)
- `src/servicos/casos_de_uso/bibliotecaCaminhos.js`
- `src/servicos/casos_de_uso/bibliotecaAdmin.js`
- `src/modulos/admin/PaginaArquivoForm.vue`
- `src/servicos/repositorios/repositorioArquivos.js`
- `firestore.rules`
- `storage.rules`
- `functions/index.js`
- `tests/regras/*`
- `docs/claims-e-sincronizacao.md`

# Continuação
— UI: indicador de arquivo global + gating de ações + guard de edição (admin_global)
**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)
**Baseline:** 2026-10-06
**Pré-requisito:** Spec “Biblioteca Global por padrão (escopo `global|setor` + claim `admin_global`)” já implementada com sucesso.

## Objetivo
1) Adicionar um **indicador visual** na Biblioteca para esclarecer quais arquivos são **globais**.  
2) Garantir que **editar/excluir arquivos globais** seja possível **somente** para usuários com claim **`admin_global=true`**.
3) Garantir que usuários admin **não-globais** possam editar/excluir **somente** arquivos com `escopo='setor'`.
4) Implementar **guard** para impedir navegação direta para edição de arquivo global por usuário não elegível. 

## Escopo (o que fazer)

### A) Ícone “Global” (Lucide copiado localmente)
- Não instalar biblioteca Lucide (decisão técnica do projeto).
- Copiar o SVG do ícone de globo do Lucide e criar componente local:
- `src/componentes/icones/IconeGlobal.vue`
- O componente deve seguir o padrão dos ícones locais existentes (SVG estático, sem dependência runtime).

### B) Indicador visual na UI (Biblioteca) Adicionar indicador de “global” usando o ícone `IconeGlobal`:
1) **Listagens da Biblioteca**
- Exibir o ícone de globo quando `arquivo.escopo === 'global'`.
- O indicador deve ser discreto e escaneável (mobile-first), sem competir com título.
- Onde aplicar:
- `src/modulos/biblioteca/PaginaBibliotecaTipo.vue`
- (se existir listagem de busca) `src/modulos/biblioteca/PaginaBibliotecaBusca.vue` 
- (se existir listagem inicial que mostra arquivos) aplicar também; se a home só mostra cards de tipo, não aplicar.
2) **Modal de detalhe do arquivo**
- Exibir o indicador “global” também no detalhe/modal:
- `src/modulos/biblioteca/DetalheArquivo.vue`
- Objetivo: o usuário entender o escopo mesmo fora da listagem.

### C) Gating de ações (Editar/Remover) por elegibilidade
**Regra de UI (obrigatória):**
- Botões de **Editar** e **Remover** **não devem aparecer** para usuários não elegíveis.

Definição de elegibilidade:
- Se `arquivo.escopo === 'setor'`: admin pode editar/remover (respeitando regras já existentes do setor).
- Se `arquivo.escopo === 'global'`: somente admin com `admin_global=true` pode editar/remover. 

Aplicar gating em:
- `PaginaBibliotecaTipo.vue` (ações por item)
- `DetalheArquivo.vue` (se houver ações administrativas no modal)

> Observação: UI é defesa em profundidade. Rules continuam sendo a barreira real.

### D) Guard de rota/tela: impedir edição de global por não-admin_global

Implementar guard na tela de formulário admin:
- Arquivo: `src/modulos/admin/PaginaArquivoForm.vue`
- Cenário: usuário tenta acessar diretamente `/biblioteca/:id/editar` (ou rota equivalente) para um arquivo global.
- Regra:
- Se `ehEdicao` e `arquivoAtual.escopo === 'global'` e usuário **não** tem `admin_global=true`:
- não renderizar formulário de edição
- mostrar mensagem de erro curta
- redirecionar para `biblioteca` (ou voltar) de forma previsível

---

## Fonte de verdade / dependências

### 1) Sessão e claims
- A UI deve obter `admin_global` de forma confiável via sessão/claims (ex.: `usarSessao`).
- Se ainda não existir, expor um boolean derivado:
- `ehAdminGlobal` (preferível) ou `estado.contexto.admin_global`
- **Não inventar** nova fonte paralela (ex.: localStorage manual).

### 2) Enum de escopo
- Usar o enum/fonte única de verdade do escopo (`ESCOPO_ARQUIVO.GLOBAL|SETOR`), não hardcodar strings espalhadas.

---

## Testes e validação

### A) Testes automatizados (mínimo obrigatório)
- Se o projeto já tem testes unitários para helpers puros, adicionar testes pequenos apenas se criar helper puro novo (ex.: `podeGerenciarArquivo(arquivo, ehAdminGlobal)`).
- Não é obrigatório criar framework de teste de UI.

### B) Validação manual (obrigatória)
Com emuladores:

1) Logar como **admin sem `admin_global`**
- Ver ícone de globo nos arquivos globais.
- **Não** ver botões Editar/Remover em arquivos globais.
- Ver botões Editar/Remover apenas em arquivos `escopo='setor'`.
- Tentar acessar rota de edição de arquivo global via URL:
- deve bloquear (mensagem + redirect).

2) Logar como **admin com `admin_global=true`**
- Ver ícone de globo nos arquivos globais.
- Ver botões Editar/Remover em globais e em setor.
- Editar/remover global funciona.

3) Logar como **usuário comum**
- Ver ícone de globo nos globais visíveis (nivel_acesso=1).
- Não ver ações administrativas.

---

## Stop conditions (parar e perguntar)
O agente deve parar e pedir confirmação humana se:

1) Não conseguir localizar onde `escopo` está chegando na UI (campo ausente nos DTOs/queries).
2) Não existir forma confiável de ler `admin_global` na sessão/claims.
3) A implementação exigir mudar contrato de dados além do já aprovado (escopo + admin_global).
4) Houver conflito entre comportamento desejado e rules atuais (ex.: UI bloqueia mas rules permitem).

---

## Critérios de pronto
- Ícone `IconeGlobal.vue` criado e usado.
- Indicador de global aparece em listagens e no detalhe.
- Botões Editar/Remover **não aparecem** para globais quando usuário não é `admin_global`.
- Guard impede edição direta de globais por não `admin_global`.
- Build/lint/testes existentes continuam passando.

---

## Arquivos prováveis a alterar
- `src/componentes/icones/IconeGlobal.vue` (novo)
- `src/modulos/biblioteca/PaginaBibliotecaTipo.vue`
- `src/modulos/biblioteca/PaginaBibliotecaBusca.vue` (se aplicável)
- `src/modulos/biblioteca/DetalheArquivo.vue`
- `src/modulos/admin/PaginaArquivoForm.vue`
- `src/composables/usarSessao.js` (se precisar expor `ehAdminGlobal`)
- `src/enums/escopoArquivos.js` (apenas para importar/usar; não duplicar strings)