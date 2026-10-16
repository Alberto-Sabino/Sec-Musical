# Portal Musical MVP

Implementação orientada por IA com **Kiro**, usando **Vue + Firebase**, com execução controlada por documentação e foco em baixo desperdício de tokens.

---

## Objetivo deste repositório

Construir o **Portal Musical MVP** com execução disciplinada por IA, sem expansão indevida de escopo, sem backend tradicional e com segurança tratada desde o início.

> Para manutenção e evolução do código (convenções, arquitetura em camadas,
> fontes únicas de verdade e pontos de atenção do Firebase), ver
> [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Fonte de verdade

Em caso de dúvida, conflito ou ambiguidade, seguir esta ordem:

1. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `docs/steering/steering-01.md` até `docs/steering/steering-05.md`
3. `docs/specs/` — a spec mais específica do tema (01 a 19; 01–08 são as specs base de domínio)
4. `docs/decisoes/status-execucao.md` (estado vivo do projeto)
5. Código já existente no repositório

Se houver conflito real entre documentos, **parar e pedir confirmação humana**.

---

## Ordem obrigatória de leitura pelo Kiro

Antes de implementar qualquer coisa, ler nesta ordem:

1. `docs/README-docs.md` (índice e estado atual da documentação)
2. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
3. `docs/steering/steering-01.md`
4. `docs/steering/steering-02.md`
5. `docs/steering/steering-03.md`
6. `docs/steering/steering-04.md`
7. `docs/steering/steering-05.md`
8. `docs/decisoes/status-execucao.md` (o que já está pronto e o que falta)
9. A(s) spec(s) específica(s) do tema em `docs/specs/`

### Estado atual do projeto

O MVP está **funcional em produção** (Hosting, Auth, Firestore e regras de
Storage publicados). As Sprints 1, 2 e 3 estão concluídas (Specs 09 a 16), além
das Specs 17, 18 e 19. A **única pendência viva** é ativar o Cloud Billing
(Blaze) para o Cloud Storage real e o deploy das Cloud Functions — runbook em
`docs/guias/guia-publicacao-piloto.md` (§B).

### Specs base de domínio (01 a 08)

As Specs 01 a 08 (em `docs/specs/`) continuam válidas como contrato funcional e
técnico do domínio. Consultá-las ao mexer no tema correspondente:

- `docs/specs/spec-01-fundacao-tecnica-ambiente.md`
- `docs/specs/spec-02-autenticacao-sessao-contexto.md`
- `docs/specs/spec-03-design-system-base.md`
- `docs/specs/spec-04-biblioteca-consulta-listagem-download.md`
- `docs/specs/spec-05-biblioteca-admin-cadastro-auditoria.md`
- `docs/specs/spec-06-solicitacoes-usuario.md`
- `docs/specs/spec-07-solicitacoes-admin.md`
- `docs/specs/spec-08-seguranca-auditoria-testes.md`

### Execução histórica das Sprints

As Specs 09 (Sprint 1) e 10 (Sprint 2) descrevem os lotes de execução e estão
**concluídas**. Novas evoluções entram como specs próprias (padrão das Specs 11
a 19).

---

## Modo transitório sem Billing

Enquanto Cloud Billing / Blaze não estiver habilitado, o projeto avança com implementação real de UI, Auth, Firestore, navegação e regras de fluxo. As operações de arquivo (upload/download/remoção) também são **reais**, executadas contra o **Storage emulator local**, que não exige Billing.

> Decisão atual: a antiga camada de arquivos simulada (mock) foi removida. Como o desenvolvimento e o login já dependem dos emuladores, os arquivos passam a usar o SDK real do Storage apontando para o emulador. Não há mais implementação mock.

Regras:

- manter o mesmo contrato de dados do ambiente real;
- manter o formato oficial de `id_nuvem`;
- não criar campos temporários no Firestore;
- não considerar o Storage **de produção** (upload/download/regras) como concluído enquanto Billing não estiver ativo.

Implementação:

- interface estável para operações de arquivo, com uma única implementação real (`firebase.js`);
- o modo é controlado por `VITE_APP_MODE` (`emulador` | `producao`), sem reescrever telas ou casos de uso;
- `emulador`: Storage emulator local (sem Billing); `producao`: Storage real (pendente de Billing).

---

## Regras obrigatórias de execução

O Kiro deve:

- executar **lote por lote**;
- implementar **somente** o que o lote atual pede;
- respeitar **Vue + Firebase** como arquitetura oficial;
- respeitar o **contrato de dados** já definido;
- respeitar o **design system base**;
- aplicar **segurança real** desde o início;
- preferir soluções simples, diretas e locais ao escopo atual;
- evitar abstrações genéricas sem uso imediato.

O Kiro não deve:

- expandir escopo;
- inventar campos, coleções, enums, status ou fluxos;
- criar backend tradicional;
- introduzir Cloud Functions sem necessidade comprovada e aprovação;
- reabrir decisões já consolidadas;
- gerar estruturas paralelas por preferência técnica;
- prometer na UI algo que regras, dados ou fluxo não sustentem.

---

## Boas práticas para reduzir alucinação

Antes de alterar código, o Kiro deve:

1. identificar o lote ativo;
2. identificar os arquivos-fonte da decisão;
3. localizar no repositório os arquivos já existentes relacionados;
4. confirmar se o que vai criar já não existe;
5. usar nomes, tipos e contratos já documentados;
6. em caso de lacuna real, **parar e perguntar** em vez de inventar.

### Regras anti-alucinação

- Não assumir campos ausentes no contrato.
- Não assumir regras de segurança não documentadas.
- Não inferir fluxo alternativo sem base documental.
- Não criar rotas, componentes ou serviços “porque provavelmente serão úteis”.
- Não dizer que algo foi validado se não foi executado ou checado.
- Não afirmar conclusão de lote se o critério de saída ainda não foi satisfeito.

### Regras de ambiente e execução (ler antes de rodar qualquer comando)

- **Descobrir antes de executar**: para saber como algo roda (build, testes, emuladores, ambiente), consultar primeiro este README, os `docs/steering/` e as `docs/specs/` (especialmente `docs/guias/setup-local.md`). Nunca começar tentando executar código ou instalar dependências para "descobrir".
- **Não instalar dependências de sistema** (ex.: Java/JRE) no host. O ambiente já está provisionado.
- **Emuladores Firebase**: rodam no **Docker do usuário** e normalmente já estão em execução. Não iniciar/instalar emuladores no host.
- **Testes de regras (Firestore)**: executam em container isolado, conforme `docs/guias/setup-local.md`:
  ```bash
  docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
  docker run --rm portal-musical-rules-test
  ```
  Não usar `npm run test:rules` diretamente no host (depende de Java local, que não deve ser instalado).

### Em caso de incerteza

Fazer **uma pergunta objetiva por vez**, curta e específica.

Exemplo:

> Há conflito entre a spec ativa e o contrato de dados sobre `id_nuvem`. Confirmar qual fonte deve prevalecer?

---

## Política de escrita no chat

A comunicação deve ser **enxuta, escaneável e assertiva**.

### Não fazer

- textos longos explicando raciocínio;
- repetir contexto já conhecido;
- resumir documentos inteiros sem necessidade;
- narrar passo a passo irrelevante;
- justificar excessivamente decisões simples;
- produzir relatórios extensos a cada ação.

### Fazer

- responder com blocos curtos;
- usar bullets;
- citar paths exatos;
- informar status real;
- destacar bloqueios rapidamente;
- registrar somente o necessário para continuidade.

---

## Formato obrigatório de resposta do Kiro

Antes de implementar, responder com no máximo este formato:

```txt
Lote: [nome ou número] Objetivo: [1 frase] Arquivos: [lista curta] Ação: [1 frase]
```

Depois de implementar, responder com no máximo este formato:

```
Status: concluído | parcial | bloqueado
Feito:
- item 1
- item 2

Validação:
- item 1
- item 2

Pendências:
- nenhuma
```

### Limites de resposta

- Preferir respostas curtas.
- Evitar passar de 8 a 12 linhas por atualização normal.
- Só detalhar mais se houver:
- - bloqueio;
- - conflito entre docs;
- - mudança estrutural;
- - risco de segurança;
- - solicitação explícita do usuário.

---

## Regra de confirmação obrigatória

Parar e pedir confirmação antes de:

- adicionar dependência nova relevante;
- mudar estrutura de pastas de forma estrutural;
- criar Cloud Functions;
- alterar contrato de dados;
- alterar fluxo de status;
- alterar regra de segurança além do lote atual;
- introduzir padrão que impacte várias telas;
- apagar ou reescrever parte estrutural do projeto.

---

## Regra de implementação

Para cada lote:

1. resumir o objetivo em 1 frase;
2. listar arquivos impactados;
3. implementar apenas o escopo do lote;
4. validar build, comportamento e regras relacionadas;
5. registrar status curto;
6. só avançar se o critério de saída do lote estiver satisfeito.

## Definição de pronto

Uma entrega só conta como pronta se:

- estiver aderente à spec ativa;
- respeitar o documento técnico mestre;
- respeitar steering e contrato de dados;
- não depender de operação manual escondida;
- tiver tratamento mínimo de erro;
- não expuser ação que a regra não permite;
- estiver validada no contexto local aplicável;
- tiver a documentação alinhada conforme a regra abaixo.

## Regra de alinhamento da documentação

Ao fim de **toda nova spec** e de **toda nova implementação**, atualizar a
documentação para refletir o estado real do projeto, sem contradições nem
informação falsa. Antes de considerar a entrega concluída:

1. **Spec específica** — registrar/atualizar a spec do tema em `docs/specs/`.
2. **Contrato e segurança** — se mudaram campos, coleções, status, `id_nuvem`,
   regras de acesso ou modelo de autorização, refletir no documento mestre
   (`docs/master/`) e no `docs/steering/steering-03.md`.
3. **Steering** — se a decisão muda arquitetura, protocolo ou UX transversal,
   refletir no steering correspondente.
4. **Estado vivo** — registrar o resultado em `docs/decisoes/status-execucao.md`
   (curto e factual) e, se afetar leitura/estrutura, no `docs/README-docs.md`.

Formato obrigatório da documentação:

- voz única, descritiva e no presente; sem trechos de "decisão superada" soltos
  na parte ativa de um documento (histórico vai para a spec de execução datada);
- citar nomes reais de campos, caminhos e arquivos (sem placeholders que já têm
  valor definido);
- a precedência é documento mestre → steering → spec específica → código; em
  conflito real, **parar e pedir confirmação humana** em vez de inventar.

A documentação não pode afirmar o que o código ou o estado de produção não
sustentam. Se a spec mais específica diverge do mestre/steering, o código e a
spec prevalecem — e o mestre/steering devem ser atualizados na mesma entrega.

## Regra final

Se houver dúvida entre **inventar** e **perguntar**, o Kiro deve **perguntar**.
Se houver dúvida entre **abstrair** e **entregar o lote atual**, o Kiro deve **entregar o lote atual**.
Se houver dúvida entre **detalhar demais no chat** e **responder de forma objetiva**, o Kiro deve responder de forma objetiva.
