# Portal Musical MVP

Implementação orientada por IA com **Kiro**, usando **Vue + Firebase**, com execução controlada por documentação e foco em baixo desperdício de tokens.

---

## Objetivo deste repositório

Construir o **Portal Musical MVP** com execução disciplinada por IA, sem expansão indevida de escopo, sem backend tradicional e com segurança tratada desde o início.

---

## Fonte de verdade

Em caso de dúvida, conflito ou ambiguidade, seguir esta ordem:

1. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
2. `docs/specs/spec-09-execucao-operacional-sprint-1.md` ou `docs/specs/spec-10-execucao-operacional-sprint-2.md`
3. `docs/apoio/` (Specs 01 a 08)
4. `docs/steering/steering-01.md` até `docs/steering/steering-05.md`
5. Código já existente no repositório

Se houver conflito real entre documentos, **parar e pedir confirmação humana**.

---

## Ordem obrigatória de leitura pelo Kiro

Antes de implementar qualquer coisa, ler nesta ordem:

1. `docs/index-operacional-mvp.md`
2. `docs/master/documento-tecnico-mestre-portal-musical-mvp.md`
3. `docs/steering/steering-01.md`
4. `docs/steering/steering-02.md`
5. `docs/steering/steering-03.md`
6. `docs/steering/steering-04.md`
7. `docs/steering/steering-05.md`
8. `docs/specs/spec-09-execucao-operacional-sprint-1.md`

### Para Sprint 1

Usar como apoio:

- `docs/apoio/apoio-note-21.md`
- `docs/apoio/apoio-note-22.md`
- `docs/apoio/apoio-note-23.md`
- `docs/apoio/apoio-note-24.md`
- `docs/apoio/apoio-note-25.md`
- `docs/apoio/apoio-note-26.md`
- `docs/apoio/apoio-note-27.md`
- `docs/apoio/apoio-note-28.md`

### Para Sprint 2

Só iniciar após fechamento real da Spec 09:

- `docs/specs/spec-10-execucao-operacional-sprint-2.md`

---

## Modo transitório sem Billing

Enquanto Cloud Billing / Blaze não estiver habilitado, o projeto pode avançar com implementação real de UI, Auth, Firestore, navegação e regras de fluxo, usando mocks apenas nas operações de arquivo.

Regras:

- mockar somente a camada de infraestrutura de arquivos;
- não mockar no componente visual;
- manter o mesmo contrato de dados do ambiente real;
- manter o formato oficial de `id_nuvem`, mesmo em simulação;
- não criar campos temporários no Firestore;
- não considerar Storage, upload real, download real ou regras de Storage como concluídos enquanto Billing não estiver ativo.

Implementação esperada:

- interface estável para operações de arquivo;
- implementação `mock` e implementação `firebase`;
- troca por configuração, sem reescrever telas ou casos de uso.

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
- estiver validada no contexto local aplicável.

## Regra final

Se houver dúvida entre **inventar** e **perguntar**, o Kiro deve **perguntar**.
Se houver dúvida entre **abstrair** e **entregar o lote atual**, o Kiro deve **entregar o lote atual**.
Se houver dúvida entre **detalhar demais no chat** e **responder de forma objetiva**, o Kiro deve responder de forma objetiva.
