# Spec 11 — Melhoria de infraestrutura local

## Objetivo
Registrar a Sprint de melhoria de infraestrutura local que substituiu a camada
de arquivos simulada (mock) por operações reais contra o Storage emulator, e
que unificou a configuração de ambiente numa única flag `VITE_APP_MODE`.

## Contexto
O desenvolvimento e o login já dependem dos emuladores locais (Auth, Firestore
e Storage). Nesse cenário, a camada mock de arquivos era desnecessária: o
Storage emulator não exige Cloud Billing e permite upload/download/remoção
reais. As decisões anteriores que autorizavam o mock (Specs 09/10, Steering
02/03/05, documento mestre) ficam registradas como histórico e foram anotadas
como superadas.

## Melhoria de infraestrutura local

### 1. Infra de arquivos real via emulador
- Implementado `src/servicos/infraestrutura_arquivos/firebase.js` usando o SDK
  do Cloud Storage:
  - `enviarArquivo(idNuvem, arquivo)` → `uploadBytes`;
  - `baixarArquivo(idNuvem)` → `getBytes` + `Blob` (`application/pdf`);
  - `removerArquivo(idNuvem)` → `deleteObject`.
- `getBytes` foi escolhido em vez de `getBlob` para evitar exigência de CORS no
  bucket, simplificando o uso contra o emulador.
- Mantido o contrato oficial de `id_nuvem` e a assinatura `{ nome, blob }` /
  `{ id_nuvem }`.

### 2. Remoção da camada mock
- Removido `src/servicos/infraestrutura_arquivos/mock.js`.
- `src/servicos/infraestrutura_arquivos/index.js` passa a reexportar a única
  implementação real (`firebase.js`), sem bifurcação.

### 3. Flag única de modo (`VITE_APP_MODE`)
- Substitui `VITE_USE_EMULATORS` + `VITE_FILE_INFRA`, que eram ortogonais e
  geravam combinações ambíguas.
- Valores:
  - `emulador` — emuladores locais ligados; arquivos reais via Storage emulator
    (sem Billing). Modo de desenvolvimento (padrão).
  - `producao` — sem emuladores; Storage real de produção (pendente de Billing).
- Derivação centralizada em `src/servicos/firebase/config.js`
  (`MODO_APP`, `usarEmuladores`); as demais camadas não leem env diretamente.

### 4. Aviso claro na inicialização
- `src/servicos/firebase/index.js` emite, ao iniciar, um `console.info` com o
  modo ativo, o estado dos emuladores e o destino do Storage.
- Em modo `producao`, emite um `console.warn` alertando que o destino é o
  Storage de produção (dependente de Billing e não concluído).

## Restrições preservadas
- O Storage de **produção** e suas regras continuam **pendentes de Billing** e
  **não** devem ser declarados concluídos/validados.
- Contrato de dados, formato de `id_nuvem` e telas/casos de uso permanecem
  inalterados.
- A transição para produção ocorre apenas trocando `VITE_APP_MODE=producao`.

## Documentos atualizados
- `README.md` (seção "Modo transitório sem Billing");
- documento mestre (seção do modo transitório de execução);
- `.env.example`, `docs/setup-local.md`, `docs/ambiente-local.md`,
  `docs/piloto-seed-dados.md`, `docs/guia-publicacao-piloto.md`,
  `docs/status-execucao.md`, `storage.rules`;
- notas de "decisão superada" em Specs 09/10 e Steering 02/03/05.

## Validação
- `npm run build` → OK;
- `eslint src/` → OK;
- ausência de referências a mock no código-fonte (`grep` em `src/`).

## Autorização de escrita de arquivos (decisão atual)
Requisito: apenas usuários **admin** podem enviar arquivos (Biblioteca) e anexar
o arquivo final (Solicitações).

Como isso é imposto hoje:
- **Firestore (barreira real, server-side):** `firestore.rules` já restringe
  `create/update/delete` de `arquivos` e as transições de `solicitacoes` a
  `ehAdmin()` (`nivel_acesso == 2` no documento do usuário). Um não-admin não
  consegue criar/alterar o metadado do arquivo nem gravar o `id_nuvem`.
- **UI (defesa em profundidade, client-side), em 3 camadas:**
  - papel `ehAdmin` derivado de `nivel_acesso === 2` (login), com comparação
    estrita em `usarSessao`;
  - ações e links de upload/anexo/editar/remover sob `v-if="ehAdmin"`;
  - rotas de escrita (`arquivo-novo`, `arquivo-editar`, `fila-solicitacoes`,
    `fila-detalhe`) com `requerAdmin: true` e guard que redireciona não-admin.
  - O componente `UploaderArquivo` só existe em telas de `src/modulos/admin/`.

Decisão sobre as regras de Storage:
- As `storage.rules` liberam leitura e escrita para **qualquer autenticado**
  (`request.auth != null`). Regras de Storage não leem o Firestore sem custom
  claims, então a distinção admin/não-admin não é feita na camada de Storage.
- Risco residual aceito: um não-admin autenticado poderia, via SDK direto (fora
  da UI), enviar bytes a um caminho do Storage. Esse arquivo ficaria **órfão** —
  sem documento correspondente no Firestore (cuja escrita é barrada), não
  aparece na Biblioteca nem em nenhuma solicitação. Impacto de fluxo nulo;
  apenas consumo de armazenamento.

## Pendências
- Storage de **produção** e suas regras seguem pendentes de Cloud Billing
  (não considerar concluído/validado).
- Autorização fina no **Storage** (restringir escrita a admin na própria rule)
  é pendência futura: exige custom claims ou `firestore.get()` nas
  `storage.rules`. Hoje o Storage confia em autenticado e a autorização real de
  admin é feita pelo Firestore + UI (ver seção acima).
- `storage.rules` permanecem marcadas como rascunho **não validado para
  produção**.
- Validação de upload/download reais em runtime deve ser feita com os
  emuladores no ar (`npm run emulators` + `npm run dev` com
  `VITE_APP_MODE=emulador`); requer recarregar o emulador após mudar as
  `storage.rules`.
