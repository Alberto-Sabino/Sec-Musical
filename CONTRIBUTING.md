# Como contribuir

Guia rápido para quem for mexer no código do Portal Musical. A ideia aqui é
economizar o seu tempo: reunir num lugar só as convenções que já estão espalhadas
pelo projeto, para você não precisar descobrir tudo lendo arquivo por arquivo.

Se algo neste guia divergir do código, o código manda — mas avise/atualize aqui.

O "porquê" das decisões de UX e de estilo está em `docs/decisoes-ux.md`.

## Stack

- Vue 3 (`<script setup>`) + Vue Router.
- Vite para dev/build.
- Firebase (Auth, Firestore, Storage). Em desenvolvimento tudo roda contra os
  emuladores locais (Docker) — ver `docs/setup-local.md`.

Sem biblioteca de UI, sem gerenciador de estado externo, sem lib de ícones. Se
for tentado a adicionar uma dependência, pense duas vezes: quase tudo aqui foi
feito com o mínimo de dependências de propósito.

## Como rodar

```bash
npm install
cp .env.example .env.local        # preencher as chaves
docker compose up -d emuladores   # sobe Auth/Firestore/Storage
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

- **Tipos e status**: `servicos/casos_de_uso/solicitacoes.js`
  (`STATUS`, `STATUS_ROTULOS`, `TIPOS_SOLICITACAO`) e
  `servicos/casos_de_uso/biblioteca.js` (`TIPOS_ARQUIVO`, `NIVEL_ARQUIVO`).
  Nunca faça array/enum paralelo.
- **Regras de upload** (formatos, limites, exceção de Métodos): só em
  `servicos/casos_de_uso/regrasUpload.js`.
- **Navegação por módulos** (destino de cada módulo, mapa rota → módulo ativo,
  quais rotas são "iniciais"): `composables/usarNavegacaoModulos.js`.
- **Design system** (cores, espaçamentos, tipografia, foco visível, utilitários):
  `componentes/tokens.css`.
- **Caminho do arquivo no Storage** (`id_nuvem`): montado em
  `servicos/casos_de_uso/bibliotecaCaminhos.js`. Formato oficial:
  `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}`.

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
- **Storage não lê o Firestore.** Por isso o controle fino (só admin envia,
  isolamento por setor) fica na camada de casos de uso/UI e nas regras do
  Firestore; o `storage.rules` valida o básico (autenticado, tipo, tamanho).
- **Bucket**: o seeder e o app têm que usar o mesmo bucket
  (`VITE_FIREBASE_STORAGE_BUCKET`). Se divergirem, o arquivo é gravado num bucket
  que o app não consulta e você vê 404 no download/remoção.
- **Emulador é persistente**: os dados ficam num volume Docker (exporta ao
  derrubar, importa ao subir). Para começar limpo, remova o volume — ver
  `docs/setup-local.md`.
- **Produção do Storage** depende de Billing e ainda não foi validada; trate como
  pendente.

## Ao terminar

- `npm run build` passando, `lint` e `format` aplicados.
- Se mexeu em regra/dado, os testes de regras passando.
- Textos de interface: curtos e claros (mobile-first). Marcações
  `// TODO: revisar mensagem` sinalizam copy provisória — sinta-se livre para
  fechar o texto e remover a marcação.
