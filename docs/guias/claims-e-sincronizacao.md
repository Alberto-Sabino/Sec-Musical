# Custom Claims e sincronização (Spec 17)

Como o Portal Musical autoriza acesso no **Cloud Storage** usando **Custom Claims**
do Firebase Auth, como provisioná-los e como depurar.

> Firestore continua autorizando via documento `usuarios/{uid}` (as regras do
> Firestore leem o Firestore). As **Storage Rules** não leem o Firestore, por isso
> dependem dos **claims** no token.

---

## 1) Quais claims existem

Fonte de verdade: documento `usuarios/{uid}`. As claims espelham:

| Claim          | Tipo            | Origem (`usuarios/{uid}`) | Significado                          |
| -------------- | --------------- | ------------------------- | ------------------------------------ |
| `ativo`        | `boolean`       | `ativo`                   | `false` → nega tudo no Storage       |
| `ids_setor`    | `array<string>` | `ids_setor`               | setores aos quais o usuário pertence |
| `caps`         | `array<string>` | `capabilities`            | capabilities concedidas (Spec 22/23) |

A claim `caps` é a lista de strings derivada **exclusivamente** do mapa
`usuarios/{uid}.capabilities` (ausente => `[]`). Capabilities oficiais:
`biblioteca_ler_publicos`, `biblioteca_ler_privados`, `biblioteca_gerenciar_setor`,
`biblioteca_gerenciar_global`, `solicitacoes_criar`, `solicitacoes_ver_proprias`,
`solicitacoes_ver_setor`, `solicitacoes_agir_setor`, `usuarios_ver`,
`usuarios_gerenciar`. Ausência de uma capability = não permitido. Não há mais
`nivel_acesso`/`admin_global` no token (removidos no hard cut da Spec 23).

As Storage Rules (`storage.rules`) usam esses claims via `temCap(cap)` (membership
em `caps`):

- **Biblioteca por setor** (`biblioteca/{id_setor}/nivel_1|nivel_2/...`):
  - leitura: `biblioteca_ler_publicos` (nivel_1) / `biblioteca_ler_privados` (nivel_2) + pertencer ao setor;
  - escrita/remoção: `biblioteca_gerenciar_setor` + pertencer ao setor.
- **Biblioteca global** (`biblioteca_global/nivel_1|nivel_2/...`):
  - leitura: `biblioteca_ler_publicos` (nivel_1) / `biblioteca_ler_privados` (nivel_2);
  - escrita/remoção: `biblioteca_gerenciar_global`.
- **Solicitações** (`solicitacoes/{id_setor}/{id_solicitante}/{id}/resposta.pdf`):
  - leitura: **somente o solicitante** (`request.auth.uid == id_solicitante`) — nem admin lê;
  - escrita/remoção: `solicitacoes_agir_setor` + pertencer ao setor.

Limites: claims têm limite de tamanho no token; manter apenas os campos acima.
Não usar nomes reservados de OIDC (`sub`, `iat`, `iss`, etc.).

---

## 2) Como sincronizar claims (produção)

A sincronização é feita pela Cloud Function callable **`syncClaimsFromUsuario`**
(`functions/index.js`).

Contrato:

- Entrada: `{ uid: string }`
- Saída: `{ ok: true }` (ou erro padronizado `HttpsError`)
- Autorização: **qualquer admin ativo** pode executar (ver §5, melhoria futura).
- Efeito: lê `usuarios/{uid}` e grava os claims `ativo`, `ids_setor` e `caps`
  (lista de capabilities derivada do mapa `capabilities`).

### Deploy (Billing/Blaze ativo)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

> A Function `syncClaimsFromUsuario` está **publicada e validada em produção**
> (`us-central1`). Billing ativo. Use os comandos acima para redeploys futuros.

### Chamada pelo cliente (admin autenticado)

No frontend existe o wrapper em `src/servicos/repositorios/repositorioAutenticacao.js`:

```js
import {
  sincronizarClaimsUsuario,
  forcarAtualizacaoToken,
} from '@/servicos/repositorios/repositorioAutenticacao'

await sincronizarClaimsUsuario(uidAlvo) // chama a Function
await forcarAtualizacaoToken() // renova o token do usuário atual
```

Quando sincronizar: ao criar o usuário, ao mudar `capabilities`/`ids_setor`/`ativo`,
ou ao revogar acesso (`ativo = false`).

---

## 3) Como forçar o refresh no cliente

Os claims só entram no token quando um token novo é emitido. Para refletir
imediatamente após a sincronização:

```js
import { forcarAtualizacaoToken } from '@/servicos/repositorios/repositorioAutenticacao'
await forcarAtualizacaoToken() // getIdTokenResult(user, true) por baixo
```

A sessão (`src/composables/usarSessao.js`) observa `onIdTokenChanged`, então após o
refresh os derivados `claims`, `idsSetorClaim`, `ativoClaim` se
atualizam sozinhos.

---

## 4) Como depurar (ver claims no token)

No console do navegador, com o usuário logado:

```js
import { getAuth } from 'firebase/auth'
const r = await getAuth().currentUser.getIdTokenResult(true)
console.log(r.claims) // { ativo, ids_setor, caps, ... }
```

Ou inspecione `usarSessao().estado.claims` no app.

---

## 5) Ambiente local (emulador)

O ambiente local usa **a mesma versão** de `storage.rules` de produção (que exige
claims). Por isso o seeder injeta os claims:

```bash
docker compose up -d emuladores
npm run seed:emulador   # cria usuários + setores E injeta claims (ativo/ids_setor/caps)
```

O seeder chama o endpoint REST `accounts:update` do Auth emulator (o mesmo que o
Admin SDK usa), sem precisar do Admin SDK no host. Se recriar usuários, rode o seed
novamente para reinjetar os claims.

> Como ainda não há piloto implantado, os dados locais podem ser descartados e
> recriados do zero (sandbox). Ver `docs/guias/setup-local.md`.

---

## 6) Melhoria futura (registrada — não implementada nesta spec)

**Restringir o sync por setor do admin executor.** Hoje (decisão confirmada,
política A) **qualquer admin ativo pode sincronizar qualquer uid**. Melhoria
proposta para spec futura: exigir interseção entre os `ids_setor` do admin
executor e os `ids_setor` do uid alvo, de modo que um admin só sincronize usuários
dos setores que ele administra. Impacto: reduz superfície de abuso entre setores.
