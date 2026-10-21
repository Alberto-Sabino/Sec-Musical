# Como contribuir

Guia rápido para quem for mexer no código do Portal Musical. A ideia aqui é
economizar o seu tempo: reunir num lugar só as convenções que já estão espalhadas
pelo projeto, para você não precisar descobrir tudo lendo arquivo por arquivo.

Se algo neste guia divergir do código, o código manda — mas avise/atualize aqui.

O "porquê" das decisões de UX e de estilo está em `docs/decisoes/decisoes-ux.md`.

## Stack

- Vue 3 (`<script setup>`) + Vue Router.
- Vite para dev/build.
- Firebase (Auth, Firestore, Storage). Em desenvolvimento tudo roda contra os
  emuladores locais (Docker) — ver `docs/guias/setup-local.md`.

Sem biblioteca de UI, sem gerenciador de estado externo, sem lib de ícones. Se
for tentado a adicionar uma dependência, pense duas vezes: quase tudo aqui foi
feito com o mínimo de dependências de propósito.

## Como rodar

```bash
npm install
cp .env.example .env.local        # preencher as chaves
docker compose up -d emuladores   # sobe Auth/Firestore/Storage/Functions
npm run seed:emulador             # usuários + setores
npm run seed:arquivos             # arquivos de exemplo
npm run seed:solicitacoes         # solicitações de exemplo
npm run dev                       # app (fala com os emuladores)
```

Antes de abrir um PR:

```bash
npm run build        # tem que passar
npm run test:unit    # helpers puros
npm run lint         # eslint --fix
npm run format       # prettier
```

Testes de regras (Firestore + Storage) rodam em container isolado:

```bash
docker build -f Dockerfile.rules-test -t portal-musical-rules-test .
docker run --rm portal-musical-rules-test
```

## Organização das pastas

```
src/
  app/            # shell (App.vue), home (PaginaInicial.vue), bootstrap
  componentes/    # componentes reutilizáveis (Base*, modais, barra, ícones/)
  composables/    # estado/lógica reutilizável (usar*)
  modulos/        # telas por domínio: autenticacao, biblioteca, solicitacoes, admin
  router/         # rotas e guards
  servicos/       # camadas de dados e integração (ver abaixo)
```

## A regra mais importante: camadas

O fluxo de dados segue sempre a mesma direção. Respeite isso e o resto se encaixa.

```
tela (.vue)  ->  caso de uso  ->  repositório       ->  Firestore
                              ->  infraestrutura     ->  Storage
```

- **Tela** (`modulos/`, `app/`): só apresentação e interação. Não fala com o
  Firebase direto.
- **Caso de uso** (`servicos/casos_de_uso/`): regra de negócio e orquestração.
  É aqui que ficam validações, transições de status, montagem de caminhos, etc.
- **Repositório** (`servicos/repositorios/`): as queries e escritas do Firestore.
- **Infraestrutura** (`servicos/infraestrutura_arquivos/`): upload/download/remoção
  no Storage.

Se precisar mudar uma regra de negócio, o lugar é o caso de uso — não a tela.

## Fontes únicas de verdade

Antes de criar uma constante ou repetir um valor, veja se já não existe:

- **Autorização (capabilities)**: `enums/capabilities.js` (`CAP`,
  `TODAS_CAPABILITIES`, `temCapability`, `capabilitiesParaLista`). É a **única**
  base de autorização por perfil. Nunca hardcode string de capability fora daqui.
- **Nomes de claims**: `enums/claims.js` (`CLAIM`: `ativo`, `ids_setor`, `caps`).
- **Tipos e status**: `servicos/casos_de_uso/solicitacoes.js`
  (`STATUS`, `STATUS_ROTULOS`, `TIPOS_SOLICITACAO`) e
  `servicos/casos_de_uso/biblioteca.js` (`TIPOS_ARQUIVO`, `ARQUIVO_PRIVADO_OPCOES`,
  `rotuloArquivoPrivado`). Nunca faça array/enum paralelo.
- **Escopo e visibilidade do arquivo**: `enums/escopoArquivos.js` (`ESCOPO_ARQUIVO`,
  `podeGerenciarArquivo`). Visibilidade é `arquivo_privado` (boolean): `false` =
  público, `true` = privado. Não existe mais `nivel_acesso`.
- **Ações de auditoria**: `enums/acoesAuditoria.js` (`ACAO_AUDITORIA`,
  `rotuloAcaoAuditoria`).
- **Regras de upload** (formatos, limites, exceção de Métodos): só em
  `servicos/casos_de_uso/regrasUpload.js`.
- **Navegação por módulos** (destino de cada módulo, mapa rota → módulo ativo,
  quais rotas são "iniciais"): `composables/usarNavegacaoModulos.js`.
- **Design system** (cores, espaçamentos, tipografia, foco visível, utilitários):
  `componentes/tokens.css`.
- **Caminho do arquivo no Storage** (`id_nuvem`): montado em
  `servicos/casos_de_uso/bibliotecaCaminhos.js`. Formato oficial:
  `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}`
  (`nivel_2` quando `arquivo_privado === true`).

## Convenções que já estão no código

Coisas que você vai encontrar e é bom seguir para manter a consistência:

- **Idioma**: nomes de variáveis, funções e componentes em português, alinhados
  ao domínio (ex.: `solicitacao`, `carregar`, `nomeSetorAtivo`).
- **Carregamento vs. recarga**: telas com dados usam `carregandoInicial` para o
  spinner de tela cheia (só no primeiro carregamento). Recarregar após uma ação
  (salvar, anexar, remover) é silencioso: reatribui os dados e deixa o Vue
  atualizar no lugar, sem trocar a tela nem pular pro topo. O "processando" fica
  no próprio botão (`:carregando`).
- **Linhas de ação (botões)**: use a classe utilitária `.acoes-responsivas`
  (definida em `tokens.css`). Mobile empilha em largura total; desktop fica lado
  a lado com a ação destrutiva à direita.
- **Botões**: um CTA primário por contexto; apoio é secundário; ação destrutiva
  usa `destrutivo` (ou `destrutivo-sutil` em listas, para pesar menos). Quando o
  botão só muda de estilo conforme o estado, um único `<BaseBotao>` com
  `:variante` basta; quando muda o texto/intenção, prefira dois botões com
  `v-if/v-else` (fica mais legível que empilhar ternários).
- **Voltar**: a navegação de retorno é o `← Voltar` do cabeçalho (aparece só em
  telas internas). Não coloque botão "Voltar" redundante no rodapé de formulário.
- **Modais**: use o composable `usarModalAcessivel` (Esc fecha, foco preso
  enquanto aberta, foco devolve ao abrir). Confirmação destrutiva cita o nome do
  item afetado.
- **Rótulo acessível**: cards clicáveis levam `aria-label` descritivo quando a
  leitura do conteúdo puder ficar ambígua.
- **Ícones**: são SVGs locais em `componentes/icones/` (copiados do Lucide). Não
  instale biblioteca de ícones. Para um ícone novo, crie um componente no mesmo
  padrão dos existentes.

## Firebase: o que dá mais trabalho

É a parte que exige mais cuidado. Um resumo para não tropeçar:

- **Regras de segurança** (`firestore.rules`, `storage.rules`) impõem o isolamento
  por setor/perfil e as transições de status válidas. Mudou regra? Rode os testes
  de regras (comando acima) antes de confiar.
- **Autorização por capabilities (Spec 23).** O Firestore autoriza lendo o mapa
  `usuarios/{uid}.capabilities`. O Storage **não lê o Firestore**, então autoriza
  por Custom Claims no token: `ativo`, `ids_setor` e `caps` (lista de capabilities),
  provisionados pela Cloud Function `syncClaimsFromUsuario` (e injetados pelo seeder
  no emulador). Não há mais `nivel_acesso`/`admin_global`. Capability ausente =
  negado (fail-closed).
- **Bucket**: o seeder e o app têm que usar o mesmo bucket
  (`VITE_FIREBASE_STORAGE_BUCKET`). Se divergirem, o arquivo é gravado num bucket
  que o app não consulta e você vê 404 no download/remoção.
- **Emulador é persistente**: os dados ficam num volume Docker (exporta ao
  derrubar, importa ao subir). Para começar limpo, remova o volume — ver
  `docs/guias/setup-local.md`.
- **Produção do Storage + Cloud Functions** dependem de Billing (Blaze) e ainda não
  foram validadas; trate como pendente. Runbook em
  `docs/guias/guia-publicacao-piloto.md` (§B).

## Como evoluir (autorização e novos recursos)

A autorização é 100% baseada em **capabilities** (Spec 22/23). Isso torna a maior
parte da evolução declarativa. Regras práticas:

### Adicionar uma nova capability (permissão)
Capability é a unidade de autorização. Para introduzir uma:

1. Declare a chave em `enums/capabilities.js` (`CAP`) — fonte única; sem magic
   strings fora daqui.
2. Reflita a chave na **cópia espelhada** da Cloud Function
   (`functions/claims.js`): `functions/` é um pacote de deploy isolado e **não
   importa de `src/`**, então a lista de capabilities oficiais é mantida nas duas.
   Mantenha-as idênticas.
3. Aplique o gate nas regras onde fizer sentido:
   - Firestore: `temCap('<cap>')` em `firestore.rules`.
   - Storage: `temCap('<cap>')` em `storage.rules` (lê a claim `caps`).
4. Exponha um derivado em `composables/usarSessao.js` (`pode*`) para gating de UI
   (defesa em profundidade — a barreira real são as regras).
5. Proteja rotas com `meta.requerCapability` em `router/index.js` (o guard já lê).
6. Preencha a capability no seed (`scripts/seed-emulador.mjs`) e, em produção, no
   mapa `capabilities` do documento `usuarios/{uid}` + ressincronizar claims.
7. Cubra com teste: unit em `tests/unit/capabilities.test.js` e cenários de regra
   em `tests/regras/`.

> Capability ausente = **negado**. Nunca dependa só do gate de UI; a regra é quem
> protege.

### Mudar o que um perfil pode fazer
Não crie "papéis" no código. Ajuste o mapa `capabilities` do usuário (no seed e no
documento). O perfil (`cargo`) é só rótulo de exibição e **não autoriza nada**.

### Visibilidade de arquivo
Use `arquivo_privado` (boolean). `false` = público (`biblioteca_ler_publicos`,
caminho `nivel_1`); `true` = privado (`biblioteca_ler_privados`, caminho `nivel_2`).
Não reintroduza `nivel_acesso`.

### Onde cada mudança "dói"
- **Baixo esforço**: nova tela/listagem (padrão tela → caso de uso → repositório);
  nova capability puramente de UI.
- **Médio / cuidado**: mudar a matriz de capabilities (ela vive em 3 formas —
  `src/enums` JS, `functions/claims.js` JS e as regras CEL — por limite do
  Firebase; alinhe as três). Qualquer mudança de contrato de dados ou de regra de
  segurança exige atualizar **rules + testes + docs na mesma entrega**.
- **Fora do escopo atual**: gestão de usuários por UI (as capabilities
  `usuarios_ver`/`usuarios_gerenciar` já estão reservadas no enum); hierarquia
  Administração/Regional e novos perfis (Ancião/Regional).

### Antes de adicionar dependência
Pense duas vezes. O projeto é propositalmente enxuto (sem lib de UI, estado ou
ícones). Dependência nova relevante é decisão que pede confirmação (ver README).

## Ao terminar

- `npm run build` passando, `lint` e `format` aplicados.
- Se mexeu em regra/dado, os testes de regras passando.
- Textos de interface: curtos e claros (mobile-first). Marcações
  `// TODO: revisar mensagem` sinalizam copy provisória — sinta-se livre para
  fechar o texto e remover a marcação.

## Histórico de versões:
- Master: manter o código em produção - iniciou somente com as funcionalidades base mas sem aprimoramento de UI.
- feature/v0.1.0: CTA, UX, aprimoramento visual (ícones, navigation, reset/update de senha) + rules, indexes e hosting.
- feature/v0.2.0: Google Analytics, eventos de negócio.
- feature/v0.3.0: Spec 19 — UI Motion (animações leves e padronizadas).
- feature/v0.4.0: Spec 20 (primeiro acesso: troca obrigatória de senha) + Spec 21 (auditoria `anexo_visualizado`).
- feature/v0.5.0: Spec 22 (capabilities + claim `caps[]`, migração compatível) + Spec 23 (hard cut: remoção de `nivel_acesso`/`admin_global`; `cargo` + `arquivo_privado`; autorização 100% por capabilities/caps).