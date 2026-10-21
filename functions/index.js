// Cloud Functions (Spec 23 — hard cut): sincroniza Custom Claims a partir de
// usuarios/{uid}. Callable manual (não-trigger). Ver docs/guias/claims-e-sincronizacao.md.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { CAP, ErroClaims, extrairClaims } from './claims.js'

initializeApp()

// Capabilities que caracterizam um administrador (setor ou global). Enquanto não
// existe UI de gestão de usuários (capability usuarios_gerenciar), a callable é
// autorizada por estas capabilities, presentes nos perfis admin atuais.
const CAPS_ADMIN = [CAP.BIBLIOTECA_GERENCIAR_SETOR, CAP.BIBLIOTECA_GERENCIAR_GLOBAL]

function ehAdminPorCaps(token) {
  const caps = Array.isArray(token?.caps) ? token.caps : []
  return token?.ativo === true && CAPS_ADMIN.some((cap) => caps.includes(cap))
}

// Autorização: admin ativo (por capability) sincroniza qualquer uid.
export const syncClaimsFromUsuario = onCall(async (request) => {
  const auth = request.auth
  if (!auth) {
    throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
  }
  if (!ehAdminPorCaps(auth.token)) {
    throw new HttpsError(
      'permission-denied',
      'Apenas administradores ativos podem sincronizar claims.',
    )
  }

  const uid = request.data?.uid
  if (typeof uid !== 'string' || uid.length === 0) {
    throw new HttpsError('invalid-argument', 'Parâmetro "uid" é obrigatório.')
  }

  const snap = await getFirestore().collection('usuarios').doc(uid).get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Documento de usuário não encontrado.')
  }

  // ErroClaims (puro) → HttpsError, preservando code e mensagem.
  let claims
  try {
    claims = extrairClaims(snap.data())
  } catch (e) {
    if (e instanceof ErroClaims) {
      throw new HttpsError(e.code, e.message)
    }
    throw e
  }

  await getAuth().setCustomUserClaims(uid, claims)

  // Observabilidade (Spec 17 §7.5): sem e-mails/senhas/tokens.
  logger.info('syncClaimsFromUsuario', {
    uid_alvo: uid,
    uid_executor: auth.uid,
    ativo: claims.ativo,
    qtd_setores: claims.ids_setor.length,
    qtd_caps: claims.caps.length,
  })

  return { ok: true }
})
