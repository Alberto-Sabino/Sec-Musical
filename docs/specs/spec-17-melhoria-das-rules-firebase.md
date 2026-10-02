# Spec técnica (orientada a agentes de IA) — Custom Claims + Hardening de Rules (Firestore/Storage) + Sync via Cloud Functions

**Projeto:** Portal Musical MVP (Vue/Vite + Firebase)  
**Data:** 2026-10-02  
**Escopo desta spec:** orientar um agente de IA a implementar **Custom Claims** e **endurecer** (hardening) as regras de **Firestore** e **Cloud Storage**, mantendo o projeto **frontend puro + Firebase** (sem servidor próprio), usando **Cloud Functions (callable)** apenas para **provisionar/sincronizar claims**.

> Esta spec é orientada a execução, mas não substitui revisão humana, especialmente em segurança.

---

## 0) Contexto do repositório (fatos que o agente deve assumir como verdade)

1) O projeto roda **Auth + Firestore + Storage** em emuladores via Docker, montando `firestore.rules`, `firestore.indexes.json` e `storage.rules` como volumes para iterar sem rebuild.  
2) Existe pipeline local/CI para rules: `npm run test:rules` executa `firebase emulators:exec --only firestore,storage "node --test ... tests/regras"`.  
3) O Storage de **produção** está pendente de Billing/Blaze; o modo padrão de desenvolvimento é `VITE_APP_MODE=emulador` (arquivos reais via Storage emulator).  
4) O contrato de caminhos (`id_nuvem`) é fonte única para localizar binários no Storage:
- Biblioteca: `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{ext}`  
- Solicitações (resposta final): `solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf`

---

## 1) Princípios obrigatórios (não negociáveis)

1) **Negar por padrão** e liberar apenas o necessário (Firestore e Storage).  
2) **Não confiar na UI**: qualquer usuário autenticado pode chamar SDK diretamente; segurança real deve estar nas Rules.  
3) **Não expandir escopo**: não criar novos módulos, coleções, campos, status, rotas ou fluxos sem referência explícita no projeto.  
4) **Não inventar contrato de dados**: campos e status devem ser os já existentes no código/rules/specs.  
5) **Mudanças devem ser testáveis**: toda alteração relevante em rules deve vir acompanhada de atualização/adição de testes em `tests/regras/*`.  
6) **Sem backend próprio**: permitido usar **Firebase gerenciado** (Cloud Functions) apenas para provisionar Custom Claims; não criar servidor/infra própria.

---

## 2) Decisões de segurança já confirmadas (o agente deve respeitar)

### 2.1 Solicitações “assumidas”
Depois que uma solicitação é assumida, **somente o responsável que assumiu** pode alterá-la.

### 2.2 Download da resposta final
Somente o **solicitante** que criou a solicitação pode **baixar a resposta final** (arquivo `resposta.pdf` no Storage).

> Se qualquer regra existente conflitar com estas decisões, o agente deve parar e pedir confirmação humana antes de alterar o contrato.

---

## 3) Escopo desta entrega (o que o agente DEVE fazer)

### 3.1 Implementar modelo de autorização por Custom Claims
Definir e documentar um conjunto mínimo de claims para suportar:
- **perfil** (admin vs usuário comum)
- **setores permitidos** (lista de `id_setor`)
- **ativo** (para negar tudo rapidamente sem depender do Firestore em Storage Rules)

### 3.2 Implementar Cloud Function callable para sincronizar claims (Opção B)
Criar uma Function callable que:
- recebe `{ uid }`
- lê `usuarios/{uid}` no Firestore
- espelha os campos relevantes para custom claims (`ativo`, `nivel_acesso`, `ids_setor`)
- só pode ser executada por **qualquer admin** (não por usuário comum)

### 3.3 Integrar claims ao frontend (Vue)
Atualizar o fluxo de sessão para:
- observar mudanças de token (`onIdTokenChanged`)
- ler claims (`getIdTokenResult`)
- forçar refresh quando necessário (`getIdTokenResult(user, true)` ou `user.getIdToken(true)`)

### 3.4 Atualizar Firestore Rules (hardening)
Manter o modelo atual (coleções `usuarios`, `setores`, `arquivos`, `solicitacoes`) e reforçar:
- validação de schema (tipos, campos obrigatórios, campos imutáveis)
- transições de status (especialmente em `solicitacoes`)
- isolamento por setor e perfil
- regra “assumida só pelo responsável”

### 3.5 Atualizar Storage Rules (hardening com claims)
- Biblioteca: restringir leitura/escrita por **setor** e **perfil** usando claims.
- Solicitações (resposta final): aplicar decisão confirmada:
- **somente o solicitante lê** `resposta.pdf`.
- Validar MIME e tamanho conforme regras atuais, sem inventar novos limites.

### 3.6 Atualizar testes de rules
Ajustar `tests/regras/storage.test.js`, `tests/regras/arquivos.test.js`, `tests/regras/solicitacoes.test.js` para:
- simular usuários com claims (admin vs comum; setores diferentes)
- cobrir casos de acesso negado/permitido por setor/perfil
- cobrir “somente solicitante lê resposta final”
- cobrir “assumida só pelo responsável”

---

## 4) Fora de escopo (o agente NÃO deve fazer)

- Não criar painel admin novo, nem UI nova para gestão de usuários/setores.
- Não migrar estrutura de dados (coleções/campos) sem instrução explícita.
- Não alterar o contrato de `id_nuvem` (paths oficiais) sem validação humana.
- Não implementar “backend próprio” (Express, servidor, etc.).
- Não habilitar Billing/Blaze nem mexer em configuração de faturamento.
- Não alterar regras de negócio do domínio (tipos/status) fora do que já existe.
- Não “resolver” segurança de Storage em produção declarando como validada sem Billing.

---

## 5) Fonte de verdade: o que consultar no projeto ANTES de codar

O agente deve consultar sempre os arquivos abaixo antes de propor mudanças.

### 5.1 Regras e config Firebase
- `firestore.rules` (estado atual)
- `storage.rules` (estado atual)
- `firebase.json` (aponta rules e emuladores)
- `firestore.indexes.json` (índices existentes; evitar regras que exijam queries inviáveis)

### 5.2 Código de domínio (contrato)
- `src/servicos/casos_de_uso/biblioteca.js` (tipos e níveis de arquivo)
- `src/servicos/casos_de_uso/solicitacoes.js` e `src/servicos/casos_de_uso/solicitacoesAdmin.js` (status/transições)
- `src/servicos/casos_de_uso/bibliotecaCaminhos.js` (formato do `id_nuvem`)
- `src/servicos/casos_de_uso/regrasUpload.js` (limites finos por tipo; Storage aplica teto máximo)

### 5.3 Repositórios (campos reais gravados)
- `src/servicos/repositorios/repositorioArquivos.js` (campos gravados em `arquivos`)
- `src/servicos/repositorios/repositorioSolicitacoes.js` (campos gravados em `solicitacoes` + auditoria)
- `src/servicos/repositorios/repositorioAutenticacao.js` (sessão e leitura do usuário)

### 5.4 Sessão e guards
- `src/composables/usarSessao.js` (derivação de `ehAdmin`, setor ativo, etc.)
- `src/router/guards.js` e `src/router/index.js` (rotas `requerAdmin`)

### 5.5 Testes existentes
- `tests/regras/storage.test.js`
- `tests/regras/arquivos.test.js`
- `tests/regras/solicitacoes.test.js`

### 5.6 Documentação operacional (para não quebrar o fluxo do projeto)
- `docs/guia-publicacao-piloto.md` (ordem de deploy e ressalvas de Storage)
- `docs/status-execucao.md` (pendência única: Storage em produção)
- `docs/piloto-seed-dados.md` (estrutura exata dos documentos)

**Regra anti-alucinação:** se o agente não conseguir localizar um campo/status no código acima, ele deve parar e pedir confirmação humana.

---

## 6) Modelo de Custom Claims (contrato mínimo)

### 6.1 Claims mínimas
- `nivel_acesso`: number  
- `1` = usuário comum  
- `2` = admin
- `ids_setor`: array<string>  
- lista de setores aos quais o usuário pertence
- `ativo`: boolean  
- se `false`, negar tudo (útil para Storage Rules e para “revogar” acesso rapidamente)

### 6.2 Regras de consistência
- Claims devem refletir o documento `usuarios/{uid}` (fonte de cadastro), mas a segurança do Storage deve preferir claims.
- O agente não deve duplicar lógica de autorização em múltiplos lugares sem necessidade; preferir helpers.

### 6.3 Limites e cuidados
- Custom claims têm limite de tamanho (payload serializado). Não colocar dados grandes.
- Não usar nomes reservados de OIDC (ex.: `sub`, `iat`, `iss`, etc.).

---

## 7) Cloud Functions — Sync de claims (Opção B)

### 7.1 Estratégia escolhida
**Callable function manual** (não-trigger) para sincronizar claims sob demanda.

Motivo:
- reduz risco de loops/cascata
- reduz invocações desnecessárias
- facilita auditoria operacional (“quem chamou e quando”)

### 7.2 Nome e contrato da Function
- Nome sugerido: `syncClaimsFromUsuario`
- Tipo: `https.onCall`
- Entrada: `{ uid: string }`
- Saída: `{ ok: true }` ou erro padronizado

### 7.3 Autorização (requisito do usuário)
**Qualquer admin** pode executar.

Regra:
- `request.auth` deve existir
- `request.auth.token.nivel_acesso === 2`
- `request.auth.token.ativo === true`
- (recomendado) o admin só pode sincronizar usuários de setores que ele administra:
- ler `usuarios/{request.auth.uid}` (ou usar claims `ids_setor`) e exigir interseção com `usuarios/{uid}.ids_setor`
- se isso ficar complexo, começar com “admin pode sync qualquer uid” e registrar como risco/pendência (exige aprovação humana)

> Anti-alucinação: o agente deve implementar a política exata acima e não “inventar” um super-admin oculto.

### 7.4 Fonte de verdade para claims
A Function deve ler `usuarios/{uid}` e extrair:
- `ativo`
- `nivel_acesso`
- `ids_setor`

Se algum campo estiver ausente ou inválido:
- lançar erro `invalid-argument` (ou equivalente) e não setar claims parciais.

### 7.5 Observabilidade mínima
- Logar (info) `uid alvo`, `uid executor`, e um hash/versão do payload (sem dados sensíveis).
- Não logar e-mails/senhas/tokens.

### 7.6 Segurança adicional (opcional, mas recomendada)
- Considerar `enforceAppCheck: true` na callable (se App Check estiver configurado no projeto).
- Se App Check não estiver configurado, não ativar enforcement sem aprovação (pode quebrar o app).

---

## 8) Integração no Vue (sessão e refresh de token)

### 8.1 Requisitos
O estado de sessão deve carregar:
- `user` (Firebase Auth user)
- `claims` (objeto)
- `ehAdmin` derivado (`claims.nivel_acesso === 2`)
- `ids_setor` derivado (`claims.ids_setor || []`)
- `ativo` derivado (`claims.ativo === true`)

### 8.2 Observação de token
- Usar `onIdTokenChanged` para reagir a sign-in/out e refresh.
- Usar `getIdTokenResult(user)` para ler claims.
- Ter função utilitária para forçar refresh após mudança de claims.

### 8.3 Padrão de implementação do projeto
- Não acessar Firebase SDK diretamente nas telas; seguir padrão: tela -> caso de uso -> repositório.
- Sessão centralizada em `src/composables/usarSessao.js`.
- Não instalar bibliotecas novas.

---

## 9) Firestore Rules — diretrizes de hardening (sem mudar contrato)

### 9.1 Diretrizes gerais
- `usuarios`: somente leitura do próprio usuário; sem write.
- `setores`: somente leitura para usuário ativo que pertence ao setor.
- `arquivos`:
- leitura: por setor + nível de acesso do arquivo + perfil do usuário
- escrita: somente admin do setor
- validar campos obrigatórios e tipos (não aceitar campos extras inesperados, se possível)
- `solicitacoes`:
- leitura: solicitante ou admin do setor
- create: somente solicitante, no próprio setor, com estado inicial correto
- update:
- solicitante só enquanto `em_aberto` (e apenas campos permitidos)
- admin do setor respeitando transições e decisão confirmada:
- após “assumida”, somente o responsável pode alterar

### 9.2 Anti-alucinação em rules
- Não criar novos status.
- Não criar novos campos.
- Se precisar validar campo, primeiro confirmar que ele existe no repositório/casos de uso.

---

## 10) Storage Rules — diretrizes de hardening com claims

### 10.1 Biblioteca (path oficial)
Path: `biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{ext}`

Regras desejadas:
- `read`:
- usuário autenticado
- `request.auth.token.ativo == true`
- `id_setor` ∈ `request.auth.token.ids_setor`
- se `nivel_2`, exigir `request.auth.token.nivel_acesso == 2`
- `create/update/delete`:
- exigir admin (`nivel_acesso == 2`)
- exigir setor permitido
- validar MIME e tamanho (como já existe)

### 10.2 Solicitações (resposta final)
Path: `solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf`

Regras desejadas:
- `read`: somente se `request.auth.uid == id_solicitante`
- `create/update/delete`: somente admin do setor (via claims) e setor permitido

> Observação: mesmo que o admin possa escrever, a leitura deve permanecer “somente solicitante” por decisão confirmada.

---

## 11) Testes de rules — requisitos mínimos

### 11.1 Firestore tests
Cobrir:
- usuário comum não lê arquivo nível 2
- usuário comum não acessa setor fora de `ids_setor`
- admin acessa nível 2 apenas nos próprios setores
- solicitante só edita enquanto `em_aberto`
- admin respeita transições e “assumida só pelo responsável”

### 11.2 Storage tests
Cobrir:
- Biblioteca:
- usuário comum lê `nivel_1` do próprio setor
- usuário comum não lê `nivel_2`
- usuário não lê setor fora da claim
- admin lê `nivel_2` do próprio setor
- admin não escreve fora do setor
- Solicitações:
- solicitante lê `resposta.pdf`
- outro usuário autenticado não lê
- admin não lê (mesmo sendo admin), pois a decisão é “somente solicitante”

### 11.3 Anti-alucinação em testes
- Não criar fixtures com campos inexistentes.
- Reusar helpers existentes nos testes (se houver).
- Se o teste exigir claim, simular claim no contexto de auth do emulator (rules-unit-testing).

---

## 12) Checklist de validação (antes de finalizar PR)

1) `npm run test:rules` passa localmente.
2) Nenhuma rule ficou “auth-only” onde deveria ser setor/perfil.
3) Nenhuma mudança alterou contrato de dados (campos/status).
4) UI continua funcionando com claims ausentes? (definir fallback: negar ou tratar como “sem permissão”)
5) Documentar como provisionar/sincronizar claims (passo a passo).
6) Não declarar Storage de produção como validado sem Billing.

---

## 13) Técnicas anti-alucinação (obrigatórias para o agente)

### 13.1 Stop conditions (quando parar e pedir confirmação)
O agente deve parar e pedir confirmação humana se:
- não encontrar no código o campo que pretende validar em rules;
- não encontrar o status que pretende permitir/bloquear;
- precisar alterar path de Storage (`id_nuvem`) para viabilizar segurança;
- precisar criar nova coleção/subcoleção;
- precisar permitir escrita em `usuarios`;
- precisar mudar o fluxo de “modo emulador vs produção” (`VITE_APP_MODE`);
- precisar ativar App Check enforcement sem confirmação.

### 13.2 Rastreabilidade obrigatória
Para cada mudança proposta, o agente deve apontar:
- arquivo alterado
- trecho do código/rule atual que motivou a mudança
- teste que cobre a mudança

### 13.3 Não inventar
- Não inventar endpoints, painéis, ou fluxos de provisionamento sem aprovação.
- Não inventar claims além das mínimas sem justificativa.
- Não instalar libs novas.

---

## 14) Entregáveis esperados

1) `firestore.rules` atualizado (hardening)
2) `storage.rules` atualizado (claims + isolamento)
3) `tests/regras/*.test.js` atualizados
4) Implementação de Cloud Functions:
- pasta `functions/` (ou estrutura equivalente aprovada)
- callable `syncClaimsFromUsuario`
- documentação de deploy e uso
5) Documento curto (markdown) explicando:
- quais claims existem
- como sincronizar claims (passo a passo)
- como forçar refresh no cliente
- como depurar (ver claims no token)

---

## Apêndice A — Glossário rápido (para o agente)

- **Claim:** campo no JWT do Firebase Auth acessível em `request.auth.token`.
- **ID token:** token JWT usado para autenticar chamadas a Firebase; contém claims.
- **Hardening:** tornar regras mais estritas, validando schema e reduzindo permissões.
- **Callable Function:** função `https.onCall` invocada pelo SDK Firebase, com auth verificada.