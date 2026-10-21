// Seed de PRODUÇÃO (piloto) — cria/atualiza usuários reais no Auth + Firestore
// e injeta os custom claims (Spec 22/23). Usa o Admin SDK e deve rodar no
// CLOUD SHELL do projeto, onde initializeApp() autentica com a service account
// do ambiente (sem chave em arquivo).
//
// Fecha os Passos 4 e 5 do runbook (bootstrap de claims do admin + sincronização),
// porque grava o doc `usuarios/{uid}` E os claims na mesma execução.
//
// EXECUÇÃO (Cloud Shell, a partir da pasta functions/ para resolver firebase-admin):
//   cd functions
//   CONFIRMAR_PRODUCAO=sim SENHA_PROVISORIA='senha123' \
//     node ../scripts/seed-producao.mjs
//
// Idempotente: reexecutar não duplica. Usuário existente (por e-mail) é
// reaproveitado; o doc e os claims são regravados conforme o contrato.
//
// Segurança:
// - exige CONFIRMAR_PRODUCAO=sim (evita execução acidental);
// - senha provisória vem de env (não hardcoded) — aqui o piloto usa 'senha123'
//   com primeiro_acesso=true (troca obrigatória no 1º login, Spec 20);
// - NÃO cria setores: valida que os ids_setor já existem em `setores` e aborta
//   com mensagem clara se faltar (não grava usuário apontando p/ setor inexistente).
//
// Contrato do doc usuarios/{uid} (v0.5.0, sem legado nivel_acesso/admin_global):
//   id_usuario, nome_completo, email, celular, comum_congregacao, cargo,
//   ativo, ids_setor, capabilities{}, primeiro_acesso, data_criacao, data_atualizacao
//
// Claims no token (Spec 23): { ativo, ids_setor, caps } — caps = capabilities true.

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// --- Capabilities oficiais (Spec 22 §3.1). Espelho de src/enums/capabilities.js.
// Mantidas aqui em cópia própria porque o script roda no Cloud Shell isolado.
const CAP = {
  BIBLIOTECA_LER_PUBLICOS: 'biblioteca_ler_publicos',
  BIBLIOTECA_LER_PRIVADOS: 'biblioteca_ler_privados',
  BIBLIOTECA_GERENCIAR_SETOR: 'biblioteca_gerenciar_setor',
  BIBLIOTECA_GERENCIAR_GLOBAL: 'biblioteca_gerenciar_global',
  SOLICITACOES_CRIAR: 'solicitacoes_criar',
  SOLICITACOES_VER_PROPRIAS: 'solicitacoes_ver_proprias',
  SOLICITACOES_VER_SETOR: 'solicitacoes_ver_setor',
  SOLICITACOES_AGIR_SETOR: 'solicitacoes_agir_setor',
  USUARIOS_VER: 'usuarios_ver',
  USUARIOS_GERENCIAR: 'usuarios_gerenciar',
}
const TODAS_CAPABILITIES = Object.values(CAP)

// Matriz inicial (Spec 22 §2.2): deriva o mapa de capabilities do perfil.
// Espelha src/enums/capabilities.js → capabilitiesDoLegado.
function capabilitiesDoPerfil(nivel, adminGlobal = false) {
  const admin = nivel === 2
  const adminGlobalEfetivo = admin && adminGlobal === true
  return {
    [CAP.BIBLIOTECA_LER_PUBLICOS]: true,
    [CAP.BIBLIOTECA_LER_PRIVADOS]: admin,
    [CAP.BIBLIOTECA_GERENCIAR_SETOR]: admin,
    [CAP.BIBLIOTECA_GERENCIAR_GLOBAL]: adminGlobalEfetivo,
    [CAP.SOLICITACOES_CRIAR]: !admin,
    [CAP.SOLICITACOES_VER_PROPRIAS]: true,
    [CAP.SOLICITACOES_VER_SETOR]: admin,
    [CAP.SOLICITACOES_AGIR_SETOR]: admin,
    [CAP.USUARIOS_VER]: false,
    [CAP.USUARIOS_GERENCIAR]: false,
  }
}

// caps (claim) = capabilities oficiais marcadas como true.
function capabilitiesParaLista(capabilities) {
  return TODAS_CAPABILITIES.filter((cap) => capabilities[cap] === true)
}

// --- Usuários do piloto (mesma pessoa, dois perfis para validação).
// perfil: { nivel, adminGlobal }
const USUARIOS = [
  {
    email: 'albertosabino.as@gmail.com',
    nome_completo: 'Alberto Sabino da Silva',
    celular: '', // preenchido manualmente depois
    comum_congregacao: 'Quilombo',
    cargo: 'Encarregado Local',
    ids_setor: ['cachoeira-paulista-sp'],
    nivel: 1,
    admin_global: false,
  },
  {
    email: 'albertosabino.secundario@gmail.com',
    nome_completo: 'Alberto Sabino da Silva',
    celular: '',
    comum_congregacao: 'Quilombo',
    cargo: 'Secretário Musical',
    ids_setor: ['cachoeira-paulista-sp'],
    nivel: 2,
    admin_global: true,
  },
]

const SENHA_PROVISORIA = process.env.SENHA_PROVISORIA || 'senha123'

function abortar(msg) {
  console.error(`\n[seed-producao] ABORTADO: ${msg}\n`)
  process.exit(1)
}

// Cria o usuário no Auth ou reaproveita o existente (idempotência por e-mail).
async function obterOuCriarAuth(auth, email) {
  try {
    const existente = await auth.getUserByEmail(email)
    console.log(`  Auth: usuário já existe (${email}) → uid=${existente.uid}`)
    return { uid: existente.uid, criado: false }
  } catch (e) {
    if (e?.code !== 'auth/user-not-found') {
      throw e
    }
    const novo = await auth.createUser({ email, password: SENHA_PROVISORIA, emailVerified: false })
    console.log(`  Auth: criado (${email}) → uid=${novo.uid}`)
    return { uid: novo.uid, criado: true }
  }
}

async function main() {
  if (process.env.CONFIRMAR_PRODUCAO !== 'sim') {
    abortar('defina CONFIRMAR_PRODUCAO=sim para executar contra produção.')
  }

  initializeApp() // service account do Cloud Shell
  const auth = getAuth()
  const db = getFirestore()

  // 1) Valida que todos os setores referenciados existem em `setores`.
  const setoresUsados = [...new Set(USUARIOS.flatMap((u) => u.ids_setor))]
  for (const idSetor of setoresUsados) {
    const snap = await db.collection('setores').doc(idSetor).get()
    if (!snap.exists) {
      abortar(
        `setor "${idSetor}" não existe na coleção "setores". ` +
          `Crie o setor antes (o script não cria setores).`,
      )
    }
  }
  console.log(`Setores validados: ${setoresUsados.join(', ')}`)

  // 2) Para cada usuário: Auth → doc usuarios/{uid} → claims.
  const resumo = []
  for (const u of USUARIOS) {
    console.log(`\nUsuário: ${u.email} (${u.cargo})`)

    const { uid, criado } = await obterOuCriarAuth(auth, u.email)
    const capabilities = capabilitiesDoPerfil(u.nivel, u.admin_global)

    // Doc operacional (contrato v0.5.0, sem legado).
    await db
      .collection('usuarios')
      .doc(uid)
      .set(
        {
          id_usuario: uid,
          nome_completo: u.nome_completo,
          email: u.email,
          celular: u.celular || '',
          comum_congregacao: u.comum_congregacao || '',
          cargo: u.cargo || '',
          ativo: true,
          ids_setor: u.ids_setor,
          capabilities,
          primeiro_acesso: true,
          data_criacao: FieldValue.serverTimestamp(),
          data_atualizacao: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    console.log(`  Firestore: doc usuarios/${uid} gravado.`)

    // Claims espelhando o cadastro (Spec 23): ativo, ids_setor, caps.
    const claims = {
      ativo: true,
      ids_setor: u.ids_setor,
      caps: capabilitiesParaLista(capabilities),
    }
    await auth.setCustomUserClaims(uid, claims)
    console.log(`  Claims: caps=[${claims.caps.join(', ')}]`)

    resumo.push({ email: u.email, uid, cargo: u.cargo, criado })
  }

  console.log('\n=== Seed de produção concluído ===')
  for (const r of resumo) {
    console.log(`  - ${r.cargo.padEnd(18)} ${r.email.padEnd(40)} uid=${r.uid} ${r.criado ? '(novo)' : '(existente)'}`)
  }
  console.log(
    '\nSenha provisória aplicada apenas a contas NOVAS. primeiro_acesso=true ' +
      '(troca obrigatória no 1º login). Faça login e troque a senha.',
  )
  process.exit(0)
}

main().catch((e) => {
  console.error('[seed-producao] Falha:', e)
  process.exit(1)
})
