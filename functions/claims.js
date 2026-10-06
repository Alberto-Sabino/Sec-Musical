// Derivação pura de Custom Claims (Spec 17 + Spec 18). Sem I/O nem deps externas,
// para ser testável no host. Erros usam code estável mapeado a HttpsError no index.

export const NIVEL_USUARIO = 1
export const NIVEL_ADMIN = 2

export class ErroClaims extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ErroClaims'
    this.code = code
  }
}

// Valida usuarios/{uid} e deriva os claims. admin_global só é true para nível 2.
export function extrairClaims(dados) {
  if (!dados) {
    throw new ErroClaims('not-found', 'Documento de usuário não encontrado.')
  }

  const ativo = dados.ativo
  const nivelAcesso = dados.nivel_acesso
  const idsSetor = dados.ids_setor

  if (typeof ativo !== 'boolean') {
    throw new ErroClaims('invalid-argument', 'Campo "ativo" ausente ou inválido.')
  }
  if (nivelAcesso !== NIVEL_USUARIO && nivelAcesso !== NIVEL_ADMIN) {
    throw new ErroClaims('invalid-argument', 'Campo "nivel_acesso" ausente ou inválido.')
  }
  if (!Array.isArray(idsSetor) || idsSetor.length === 0) {
    throw new ErroClaims('invalid-argument', 'Campo "ids_setor" ausente ou vazio.')
  }
  if (!idsSetor.every((s) => typeof s === 'string' && s.length > 0)) {
    throw new ErroClaims('invalid-argument', 'Campo "ids_setor" contém valor inválido.')
  }

  // admin_global (Spec 18): nunca true fora de admin.
  const adminGlobal = nivelAcesso === NIVEL_ADMIN && dados.admin_global === true

  return {
    ativo,
    nivel_acesso: nivelAcesso,
    ids_setor: idsSetor,
    admin_global: adminGlobal,
  }
}
