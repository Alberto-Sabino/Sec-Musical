# Spec 12 — Ajuste de tipos e campo Comum Congregação

## Objetivo
Registrar três ajustes consolidados nesta sessão: (1) revisão das constantes de
tipos de arquivo e de solicitação; (2) inclusão do campo `comum_congregacao` no
contrato de `usuarios` e `solicitacoes`, com regra de segurança; (3) atualização
do seed do emulador (remoção do seeding de arquivos e novo conjunto de usuários).

## Contexto
Encarregados do mesmo setor não eram distinguíveis por comum. O campo
`comum_congregacao` passa a identificar a comum de cada usuário e acompanha toda
solicitação como valor fixo denormalizado, visível ao solicitante e ao admin.
Em paralelo, os rótulos/valores de tipos foram revisados para refletir o
vocabulário operacional real.

## 1. Tipos oficiais revisados

### Tipos de arquivo (`TIPOS_ARQUIVO` — `src/servicos/casos_de_uso/biblioteca.js`)
| valor | rótulo |
|---|---|
| `circulares` | Circulares |
| `topicos` | Tópicos |
| `metodos` | Métodos |
| `planos_aula` | Planos de aula |
| `provas` | Provas |
| `modelos` | Modelos |
| `outros` | Outros |

### Tipos de solicitação (`TIPOS_SOLICITACAO` — `src/servicos/casos_de_uso/solicitacoes.js`)
| valor | rótulo |
|---|---|
| `avaliacao_exame` | Avaliação/Exame |
| `ingresso_gem` | Ingresso no GEM |
| `troca_instrumento` | Troca de instrumento |
| `compra_manutencao` | Compra/Manutenção |
| `transferencia` | Transferência |
| `novo_colaborador` | Novo colaborador |

- Valores em `snake_case`; as constantes são a fonte única, consumidas por
  import nas telas (sem valores hardcoded).

## 2. Campo `comum_congregacao`

### Contrato de dados (alteração aprovada)
- `usuarios`: novo campo `comum_congregacao` (string, texto livre, valor fixo do
  usuário). Não exige unicidade — vários usuários podem compartilhar a mesma comum.
- `solicitacoes`: novo campo `comum_congregacao` (string), **denormalizado** na
  criação a partir do contexto do solicitante — mesmo padrão de `nome_solicitante`.
  É **obrigatório** e **imutável** após a criação.

### Fluxo
- `carregarContextoUsuario` expõe `comum_congregacao` no contexto de sessão.
- `criarSolicitacao` recebe `comumCongregacao` do contexto, valida presença e
  grava no documento via repositório.

### Regra de segurança (`firestore.rules`)
- Na criação de solicitação: `comum_congregacao` deve ser string não-vazia e
  **igual** a `docUsuario().comum_congregacao` (impede falsificação).
- Imutável nos updates do solicitante e do admin.

### UI
- Form de nova solicitação: exibido no subtítulo (valor fixo, não editável).
- Detalhe do usuário e detalhe do admin: exibido na lista de dados.
- Fila do admin: exibido na meta de cada item (ajuda a distinguir solicitantes
  do mesmo setor).

## 3. Seed do emulador (`scripts/seed-emulador.mjs`)
- Removido o seeding de `arquivos` (Biblioteca nasce vazia).
- Conjunto de usuários redefinido (senha padrão `senha123`):
  - Alberto Sabino da Silva — Secretário (nível 2) — Cachoeira — comum Quilombo
  - Daniel Gomes de Araújo — Secretário (nível 2) — Cachoeira + Queluz — comum Bairro União
  - Usuário Central — Encarregado (nível 1) — Cachoeira — comum Central
  - Usuário Embaú — Encarregado (nível 1) — Cachoeira — comum Embaú
  - Usuário Bairro da Figueira — Encarregado (nível 1) — Queluz — comum Bairro da Figueira
- `celular` passa a ser gravado por usuário; documento grava `comum_congregacao`.
- Log final resumido (nome - email - senha - nível), com colunas alinhadas.

## Restrições preservadas
- Coleções, subcoleções e formato de `id_nuvem` inalterados.
- Nenhum novo status, fluxo ou Cloud Function.
- Storage de produção segue pendente de Billing.

## Validação
- `npm run build`: OK.
- `eslint` (src, scripts, tests): sem erros.
- Testes de regras (Docker): 61/61 pass, incluindo os novos casos de
  `comum_congregacao` (ausente, divergente do cadastro, alteração pelo dono).

## Documentação sincronizada
- `docs/master/documento-tecnico-mestre-portal-musical-mvp.md` (contratos, nota do campo, tipos).
- `docs/steering/steering-03.md` (contratos `usuarios` e `solicitacoes`).
- `docs/piloto-seed-dados.md` (exemplo de usuário e tipo de arquivo).
- `README.md` (regra "descobrir antes de executar" + fluxo de testes via Docker).
