// Cloud Functions (Spec 17 + Spec 18): sincroniza Custom Claims a partir de
// usuarios/{uid}. Callable manual (não-trigger). Ver docs/claims-e-sincronizacao.md.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { NIVEL_ADMIN, ErroClaims, extrairClaims } from './claims.js'

initializeApp()

// Autorização (política A): qualquer admin ativo sincroniza qualquer uid.
export const syncClaimsFromUsuario = onCall(async (request) => {
  const auth = request.auth
  if (!auth) {
    throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
  }
  if (auth.token.nivel_acesso !== NIVEL_ADMIN || auth.token.ativo !== true) {
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
    nivel_acesso: claims.nivel_acesso,
    qtd_setores: claims.ids_setor.length,
    ativo: claims.ativo,
    admin_global: claims.admin_global,
  })

  return { ok: true }
})
