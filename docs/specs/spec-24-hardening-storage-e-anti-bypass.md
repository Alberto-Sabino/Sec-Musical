# Spec 24 — Hardening de Storage Rules + testes anti-bypass + consistência de seeds

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)
**Baseline:** 2026-10-22 (pós dia da virada — produção plena, Billing/Blaze ativo)
**Origem:** avaliação externa em `docs/relatorio-gemini-acoes.md` (plano P1). Os itens P0 (virada de Storage/Functions, CORS, download real) já foram concluídos na virada — ver `docs/decisoes/dia-da-virada.md`. Esta spec trata apenas melhorias P1.
**Objetivo:** ampliar a cobertura de testes anti-bypass do Storage e alinhar a documentação de seeds aos scripts reais. A validação de extensão no path entra como **melhoria oportunística / débito técnico** — não como pendência ou falha de segurança.

> **Enquadramento de segurança (importante):** o Storage **já está bem endurecido** — autorização 100% por capabilities (`caps[]`), validação de MIME (`contentType`) e de tamanho, isolamento por setor, resposta final legível só pelo solicitante e `deny` por padrão em todo path fora do contrato. A validação de extensão no path é **defesa em profundidade adicional**, não correção de vulnerabilidade. Se não for trivial/limpa de implementar, **registrar como débito técnico** e seguir — sem tratar como pendência aberta.

> Esta spec é orientada a execução por agente de IA. Não substitui revisão humana, especialmente em segurança.

> **Resultado da execução (2026-10-22):** aplicada no branch `feature/v0.6.0`. O hardening de extensão (§2) foi implementado de forma limpa (`matches()` ancorado em `$`), somado à restrição de nível (`nivel_1|nivel_2`) no create/update/delete da biblioteca — não foi necessário registrar como débito técnico. Testes anti-bypass A–E adicionados; suíte de regras 152/152. Consistência de seeds corrigida. Deploy de produção: `firebase deploy --only storage`.

---

## 0) Decisões fixas (não negociar)

1. **Sem mudança de contrato de dados.** Nada de novos campos, coleções, status ou `id_nuvem`. Caminhos de Storage permanecem os atuais (`biblioteca/`, `biblioteca_global/`, `solicitacoes/`).
2. **Autorização continua 100% por capabilities** (`caps[]`) — Spec 23. Esta spec não reintroduz legado nem muda o modelo de autorização.
3. **A extensão no path é melhoria opcional (defesa em profundidade), não correção de falha.** O `contentType` (MIME) continua sendo a validação primária. Se a checagem de extensão não for trivial/limpa no emulador, **registrar como débito técnico** e não bloquear a entrega.
4. **Extensões aceitas por área (alinhadas ao MIME já validado):**
   - Biblioteca (setor e global): `pdf` ou `xlsx`.
   - Solicitações (resposta final): `pdf`.
5. **Não introduzir Cloud Functions, dependências novas nem alterar o fluxo de claims.**

---

## 1) Escopo desta spec

### 1.1 Inclui
- adicionar testes anti-bypass em `tests/regras/storage.test.js` (path inválido, `{allPaths=**}` negado, MIME divergente do esperado);
- endurecer `storage.rules` para exigir extensão coerente no último segmento do path, por área (`.pdf`/`.xlsx` na biblioteca; `.pdf` em solicitações);
- revisar a consistência entre os scripts de seed (`scripts/`) e a documentação que os cita (`docs/guias/setup-local.md`, `docs/guias/piloto-seed-dados.md`), ajustando o que estiver divergente;
- atualizar documentação impactada para refletir o estado real.

### 1.2 Não inclui
- paginação/cursor nas listagens (P2 — fica para quando "doer");
- cache de globais por sessão (P2);
- padronização do contrato de erro `throw` vs `{ ok, erro }` (P2);
- upgrade `firebase` 11→12 e runtime Node das Functions (manutenção já registrada em `docs/decisoes/dia-da-virada.md`);
- qualquer mudança em Firestore Rules ou no frontend de autorização.

---

## 2) Hardening — `storage.rules` (extensão no path) — OPCIONAL

Arquivo: `storage.rules`

> **Natureza:** melhoria oportunística. Tentar implementar de forma limpa; se a sintaxe `matches()` não casar o segmento de path como esperado ou exigir contorno feio, **parar, não forçar, e registrar como débito técnico** (§6.4). Não é pendência de segurança.

A variável do último segmento de path já está disponível em cada `match` (hoje chamada `{arquivo}`). Validar a extensão com `.matches()` (regex CEL), **somando-se** às checagens de MIME/tamanho já existentes — sem remover nenhuma delas.

### 2.1 Helpers propostos (padrão existente do arquivo)
Adicionar helpers puros junto aos de MIME:

```
// Extensão coerente no último segmento do path (defesa em profundidade).
function temExtensao(arquivo, ext) {
  return arquivo.matches('.*[.]' + ext + '$');
}

function extensaoBiblioteca(arquivo) {
  return temExtensao(arquivo, 'pdf') || temExtensao(arquivo, 'xlsx');
}
```

> Observação: a regex deve casar com o nome real do objeto (segmento final). Validar o comportamento exato de `matches()` nos testes antes de dar como pronto; se o segmento capturado não corresponder ao esperado, parar e ajustar (ver §5 Stop conditions).

### 2.2 Aplicação por área
- `match /biblioteca/{idSetor}/{nivel}/{arquivo}`: em `create, update`, exigir `extensaoBiblioteca(arquivo)` além de `(ehPdf() || ehXlsx())` e `dentroTetoBiblioteca()`.
- `match /biblioteca_global/{nivel}/{arquivo}`: idem (`extensaoBiblioteca(arquivo)`).
- `match /solicitacoes/{idSetor}/{idSolicitante}/{idSolicitacao}/{arquivo}`: em `create, update`, exigir `temExtensao(arquivo, 'pdf')` além de `ehPdf()` e do teto de 2 MB.

> Coerência obrigatória: a extensão exigida tem de bater com o MIME já aceito. Não aceitar `.xlsx` onde o MIME é só PDF (solicitações), nem o contrário.

### 2.3 O que NÃO mudar
- Regras de leitura (`read`) permanecem como estão (não há extensão a validar em leitura).
- Regra `delete` permanece como está (não valida MIME/extensão hoje).
- O bloco final `match /{allPaths=**} { allow read, write: if false; }` permanece.

---

## 3) Testes anti-bypass — `tests/regras/storage.test.js`

Adicionar cenários novos (sem remover os existentes). Os casos C–E independem do hardening e são a melhoria principal de cobertura. A–B só se aplicam **se** o hardening opcional da §2 for implementado.

A) *(só com hardening §2)* **Extensão divergente do MIME (biblioteca):** upload com `contentType = application/pdf` mas path terminando em `.xlsx` (ou extensão arbitrária, ex.: `.exe`) → **bloqueado**.
B) *(só com hardening §2)* **Extensão divergente do MIME (solicitações):** `contentType = application/pdf` com path `resposta.docx` → **bloqueado**.
C) **MIME divergente do esperado com extensão "certa":** path `a.pdf` mas `contentType` de imagem → **bloqueado** (já coberto parcialmente; garantir que o caso permanece negado).
D) **`{allPaths=**}` negado explicitamente:** leitura e escrita em um path fora de todos os contratos (ex.: `raiz.pdf` na raiz ou `qualquer/coisa/x.pdf`) → **bloqueado**, inclusive para admin/admin_global.
E) **Path estruturalmente inválido:** nível desconhecido na biblioteca (ex.: `biblioteca/{setor}/nivel_3/x.pdf`) → **bloqueado**.

> Regressão obrigatória: os casos "permitidos" já existentes (PDF/XLSX válidos nos paths corretos) devem continuar passando. Se o hardening de extensão quebrar um caso legítimo, a regex está errada — corrigir a regra, não o teste.

Execução dos testes de regras (conforme `docs/guias/setup-local.md` e README):

```bash
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test
```

---

## 4) Consistência docs × scripts de seed

Objetivo: remover o risco de onboarding quebrado (item 10 do relatório).

1. Listar os scripts reais em `scripts/` (ex.: `seed-emulador.mjs`, `seed-producao.mjs`, `clonar-arquivos-setores.mjs` — confirmar nomes no repo).
2. Conferir se `docs/guias/setup-local.md` e `docs/guias/piloto-seed-dados.md` citam exatamente esses nomes, comandos e campos (`cargo`, `capabilities`, claims `ativo`/`ids_setor`/`caps`).
3. Ajustar a documentação para o estado real: remover referência a script/campo inexistente; corrigir nome/caminho/comando divergente.
4. **Não** criar scripts novos para "casar" com a doc; a fonte de verdade é o código. Se a doc descreve algo que não existe e deveria existir, **parar e perguntar** (ver §5).

---

## 5) Stop conditions (parar e pedir confirmação humana)

Parar se precisar:
- mudar o contrato de dados ou os caminhos de Storage;
- reintroduzir legado de perfil nas rules;
- a sintaxe `matches()` do Storage não casar o segmento de path como esperado (nesse caso, documentar o comportamento observado e perguntar antes de relaxar a regra);
- um caso legítimo (PDF/XLSX válido) passar a falhar e a correção exigir afrouxar MIME/tamanho;
- a doc de seeds descrever um script/campo que não existe e cuja criação ampliaria escopo.

---

## 6) Documentação (obrigatório — refletir estado real)

Ao concluir:
1. `docs/decisoes/status-execucao.md` — registrar a Spec 24 (curto e factual: hardening de extensão + testes anti-bypass + consistência de seeds).
2. `docs/README-docs.md` — adicionar a linha da Spec 24 na tabela de specs.
3. `docs/steering/steering-03.md` — se a validação de extensão no path for tratada como regra de segurança transversal, registrar a nota (defesa em profundidade sobre o MIME).
4. `docs/relatorio-gemini-acoes.md` — opcional: anotar quais itens P1 foram fechados por esta spec (sem reescrever o relatório original).
5. **Se o hardening de extensão (§2) não for implementado:** registrar em `docs/decisoes/status-execucao.md` como **débito técnico** — não como pendência ou falha de segurança. Texto sugerido: "validação de extensão no path do Storage não implementada; MIME + capabilities + `deny` por padrão já cobrem o acesso; reavaliar no futuro se houver demanda". Deixar claro que o Storage permanece endurecido.

Não afirmar conclusão de item sem o teste correspondente passando.

---

## 7) Critérios de aceite

- [ ] Testes anti-bypass C–E adicionados em `tests/regras/storage.test.js` (independem do hardening).
- [ ] Todos os casos "permitidos" pré-existentes continuam passando (sem regressão).
- [ ] `npm run test:unit` passa.
- [ ] Testes de regras (Docker) passam.
- [ ] `npm run build` OK e `eslint` limpo nos arquivos tocados.
- [ ] Docs de seeds (`setup-local.md`, `piloto-seed-dados.md`) consistentes com os scripts reais.
- [ ] `status-execucao.md` e `README-docs.md` atualizados.
- [ ] **Hardening de extensão (§2):** OU implementado com testes A–B passando, OU registrado como débito técnico (§6.5). Qualquer um dos dois satisfaz o critério.

---

## 8) Ordem de execução sugerida (lotes)

1. **Lote A — Testes anti-bypass de cobertura (independentes):** adicionar C–E e garantir que passam. É a melhoria principal e não depende do hardening.
2. **Lote B — Hardening de extensão (opcional):** tentar implementar os helpers de extensão e aplicá-los, com os testes A–B. Se a sintaxe `matches()` não casar limpa, **não forçar** — registrar débito técnico (§6.5) e seguir.
3. **Lote C — Consistência de seeds:** revisar e alinhar a documentação de seeds ao código real.
4. **Lote D — Documentação:** atualizar `status-execucao.md`, `README-docs.md` e steering se aplicável (incluindo o registro de débito técnico, se o Lote B não for concluído).
