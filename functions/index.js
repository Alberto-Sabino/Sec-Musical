// Cloud Functions do Portal Musical MVP (Spec 17).
//
// Única responsabilidade: provisionar/sincronizar Custom Claims a partir do
// documento `usuarios/{uid}` no Firestore. Não é um backend próprio — é apenas
// Firebase gerenciado para espelhar cadastro -> claims (fonte de autorização
// usada pelas Storage Rules e pela sessão do app).
//
// Claims mínimas (Spec 17 §6.1):
//   - nivel_acesso: number (1 = usuário comum, 2 = admin)
//   - ids_setor:    array<string>
//   - ativo:        boolean
//
// Estratégia: callable manual (https.onCall), não-trigger (Spec 17 §7.1).
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'

initializeApp()

const NIVEL_USUARIO = 1
const NIVEL_ADMIN = 2

// Lê e valida os campos relevantes do documento usuarios/{uid}.
// Lança invalid-argument se algo estiver ausente/inválido (não seta claim parcial).
function extrairClaims(dados) {
  if (!dados) {
    throw new HttpsError('not-found', 'Documento de usuário não encontrado.')
  }

  const ativo = dados.ativo
  const nivelAcesso = dados.nivel_acesso
  const idsSetor = dados.ids_setor

  if (typeof ativo !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Campo "ativo" ausente ou inválido.')
  }
  if (nivelAcesso !== NIVEL_USUARIO && nivelAcesso !== NIVEL_ADMIN) {
    throw new HttpsError('invalid-argument', 'Campo "nivel_acesso" ausente ou inválido.')
  }
  if (!Array.isArray(idsSetor) || idsSetor.length === 0) {
    throw new HttpsError('invalid-argument', 'Campo "ids_setor" ausente ou vazio.')
  }
  if (!idsSetor.every((s) => typeof s === 'string' && s.length > 0)) {
    throw new HttpsError('invalid-argument', 'Campo "ids_setor" contém valor inválido.')
  }

  return { ativo, nivel_acesso: nivelAcesso, ids_setor: idsSetor }
}

// syncClaimsFromUsuario({ uid }): espelha usuarios/{uid} para os custom claims.
//
// Autorização (Spec 17 §7.3 — decisão humana confirmada, política A):
//   - request.auth deve existir;
//   - request.auth.token.nivel_acesso === 2 (admin);
//   - request.auth.token.ativo === true.
// Decisão: QUALQUER admin ativo pode sincronizar QUALQUER uid.
// Melhoria futura registrada (não implementada nesta spec): restringir o sync a
// uids cujos ids_setor tenham interseção com os setores do admin executor.
// Ver docs/claims-e-sincronizacao.md.
export const syncClaimsFromUsuario = onCall(async (request) => {
  const auth = request.auth
  if (!auth) {
    throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
  }
  if (auth.token.nivel_acesso !== NIVEL_ADMIN || auth.token.ativo !== true) {
    throw new HttpsError('permission-denied', 'Apenas administradores ativos podem sincronizar claims.')
  }

  const uid = request.data?.uid
  if (typeof uid !== 'string' || uid.length === 0) {
    throw new HttpsError('invalid-argument', 'Parâmetro "uid" é obrigatório.')
  }

  const snap = await getFirestore().collection('usuarios').doc(uid).get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Documento de usuário não encontrado.')
  }

  const claims = extrairClaims(snap.data())
  await getAuth().setCustomUserClaims(uid, claims)

  // Observabilidade mínima (Spec 17 §7.5): quem executou, alvo e versão do payload.
  // Não logar e-mails/senhas/tokens.
  logger.info('syncClaimsFromUsuario', {
    uid_alvo: uid,
    uid_executor: auth.uid,
    nivel_acesso: claims.nivel_acesso,
    qtd_setores: claims.ids_setor.length,
    ativo: claims.ativo,
  })

  return { ok: true }
})
