# Índice da documentação — Portal Musical MVP

Mapa da pasta `docs/`. O MVP está **funcional em produção** (Hosting, Auth,
Firestore e regras de Storage publicados). A documentação registra as decisões, o
contrato do domínio e a evolução das specs.

> Estado vivo do projeto: ver [`decisoes/status-execucao.md`](decisoes/status-execucao.md).
> É a fonte única de "o que já foi feito e o que falta".

---

## Estado atual (resumo)

- **Sprints 1, 2 e 3 concluídas.** Specs 09 a 16 aplicadas; Analytics GA4 ativo
  (só em `producao`).
- **Specs 17 a 23** aplicadas (Custom Claims + hardening de rules + Cloud
  Functions, Biblioteca Global, UI Motion, primeiro acesso, auditoria de anexo,
  capabilities e hard cut do legado).
- **Produção plena (dia da virada concluído):** Hosting, Firestore (regras +
  índices), Authentication, **Cloud Storage real** e **Cloud Functions**
  (`syncClaimsFromUsuario`) publicados e validados. **Cloud Billing (Blaze)
  ativo** — não há mais pendência de Billing. Registro em
  [`decisoes/dia-da-virada.md`](decisoes/dia-da-virada.md); runbook executado em
  [`guias/guia-publicacao-piloto.md`](guias/guia-publicacao-piloto.md).

---

## Estrutura da pasta

```
docs/
  README-docs.md            ← este índice
  master/                   ← documento técnico mestre (fonte de verdade do produto)
  steering/                 ← guardrails permanentes (01 a 05)
  specs/                    ← specs de domínio e de execução (01 a 19, contínuas)
  guias/                    ← runbooks e referências operacionais
  decisoes/                 ← decisões de UX/código e status de execução
```

---

## Fonte de verdade (ordem de precedência)

Em caso de dúvida, conflito ou ambiguidade, seguir esta ordem:

1. `master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `steering/steering-01.md` … `steering-05.md`
3. `specs/` — a spec mais específica do tema em questão
4. Código já existente no repositório

Se houver conflito real entre documentos, **parar e pedir confirmação humana**.

---

## master/

- `documento-tecnico-mestre-portal-musical-mvp.md` — visão técnica do produto,
  contrato de dados, arquitetura Vue + Firebase e limites do MVP.

## steering/

Guardrails permanentes (ler antes de qualquer implementação):

- `steering-01.md` — Produto e limites do MVP
- `steering-02.md` — Arquitetura Vue + Firebase
- `steering-03.md` — Dados, autorização e segurança
- `steering-04.md` — Design system base e UX mobile-first
- `steering-05.md` — Protocolo de uso do Kiro

## specs/

Numeração contínua. **01 a 08** são as specs base de domínio (contrato funcional
e técnico, permanecem válidas como referência). **09 em diante** são execução e
evoluções.

| Spec | Tema |
|------|------|
| 01 | Fundação técnica, ambiente e estrutura inicial |
| 02 | Autenticação, sessão e contexto do usuário |
| 03 | Design system base e layout mobile-first |
| 04 | Biblioteca — consulta, listagem, filtro e download |
| 05 | Biblioteca admin — cadastro, edição, remoção e auditoria |
| 06 | Solicitações do usuário — criação, acompanhamento, edição, cancelamento |
| 07 | Solicitações admin — fila, tratamento, comentário, anexo final, conclusão |
| 08 | Segurança, auditoria e testes críticos |
| 09 | Execução operacional da Sprint 1 |
| 10 | Execução operacional da Sprint 2 |
| 11 | Melhoria de infraestrutura local (flag `VITE_APP_MODE`, fim do mock) |
| 12 | Ajustes de tipos e campo `comum_congregacao` |
| 13 | Shell autenticado e orientação global |
| 14 | Biblioteca — nova descoberta, busca e metadados |
| 15 | Solicitações — filtros, listagem, paginação e linearidade |
| 16 | Autenticação — senha e perfil do usuário |
| 17 | Custom Claims + hardening de rules + sync via Cloud Functions |
| 18 | Biblioteca Global (escopo global\|setor) + `admin_global` |
| 19 | UI Motion (animações leves e padronizadas) |
| 20 | Primeiro acesso — troca obrigatória de senha (flag `primeiro_acesso`) |
| 21 | Solicitações — auditoria `anexo_visualizado` (após download com sucesso) |
| 22 | Capabilities & Claims — `usuarios.capabilities` + claim `caps[]` (legado mantido) |
| 23 | Hard cut — remove `nivel_acesso`/`admin_global`; `cargo` + `arquivo_privado`; capabilities/caps como única base |
| 24 | Hardening de Storage Rules (extensão no path + nível válido) + testes anti-bypass + consistência de seeds |

## guias/

Runbooks e referências operacionais:

- `setup-local.md` — como rodar o projeto localmente (emuladores via Docker, seeds, testes).
- `guia-publicacao-piloto.md` — runbook de publicação e ativação do Billing (deploys restantes).
- `claims-e-sincronizacao.md` — Custom Claims do Storage: o que são, como sincronizar e depurar.
- `analytics-eventos.md` — eventos GA4, parâmetros e relatórios sugeridos.
- `piloto-seed-dados.md` — estrutura exata dos documentos iniciais (contrato de dados).
- `piloto-indicadores.md` — indicadores simples para acompanhar o piloto.

## decisoes/

- `decisoes-ux.md` — decisões de UX e de código do ciclo de polimento (o "porquê").
- `status-execucao.md` — **estado vivo**: histórico por lote, specs aplicadas e pendências.

---

## Ordem de leitura recomendada

Para contexto completo antes de implementar:

1. `master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `steering/steering-01.md` a `steering-05.md`
3. `decisoes/status-execucao.md` (o que já está pronto e o que falta)
4. A(s) spec(s) específica(s) do tema em que vai trabalhar
5. `guias/setup-local.md` para subir o ambiente

> Para execução histórica das Sprints, as Specs 09 (Sprint 1) e 10 (Sprint 2)
> descrevem os lotes. Ambas já estão concluídas; novas evoluções entram como
> specs próprias (padrão das Specs 11 a 19).

---

## Regra de manutenção

Se uma decisão funcional ou técnica mudar: atualizar primeiro a spec mais
específica afetada, refletir no documento mestre/steering se necessário e
registrar o resultado em `decisoes/status-execucao.md`. Não deixar a documentação
afirmar algo que o código ou o estado de produção não sustentem.
