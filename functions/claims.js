// Derivação pura de Custom Claims (Spec 23 — hard cut). Sem I/O nem deps externas,
// para ser testável no host. Erros usam code estável mapeado a HttpsError no index.
//
// Claims finais: ativo, ids_setor, caps. Sem legado (nivel_acesso/admin_global).
// `caps` deriva EXCLUSIVAMENTE de usuarios/{uid}.capabilities (ausente => []).
//
// IMPORTANTE: functions/ é um pacote de deploy isolado e não importa de src/.
// As capabilities oficiais são mantidas aqui em cópia própria (espelho de
// src/enums/capabilities.js); o teste unitário garante paridade.

// Capabilities oficiais (Spec 22 §3.1). Espelho de src/enums/capabilities.js.
export const CAP = {
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

export const TODAS_CAPABILITIES = Object.values(CAP)

// Converte o mapa de capabilities na lista de strings (claim `caps`), contendo
// apenas capabilities oficiais marcadas como true.
export function capabilitiesParaLista(capabilities) {
  if (!capabilities || typeof capabilities !== 'object') {
    return []
  }
  return TODAS_CAPABILITIES.filter((cap) => capabilities[cap] === true)
}

export class ErroClaims extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ErroClaims'
    this.code = code
  }
}

// Valida usuarios/{uid} e deriva os claims finais (ativo, ids_setor, caps).
export function extrairClaims(dados) {
  if (!dados) {
    throw new ErroClaims('not-found', 'Documento de usuário não encontrado.')
  }

  const ativo = dados.ativo
  const idsSetor = dados.ids_setor

  if (typeof ativo !== 'boolean') {
    throw new ErroClaims('invalid-argument', 'Campo "ativo" ausente ou inválido.')
  }
  if (!Array.isArray(idsSetor) || idsSetor.length === 0) {
    throw new ErroClaims('invalid-argument', 'Campo "ids_setor" ausente ou vazio.')
  }
  if (!idsSetor.every((s) => typeof s === 'string' && s.length > 0)) {
    throw new ErroClaims('invalid-argument', 'Campo "ids_setor" contém valor inválido.')
  }

  return {
    ativo,
    ids_setor: idsSetor,
    caps: capabilitiesParaLista(dados.capabilities),
  }
}
