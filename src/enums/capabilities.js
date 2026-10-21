// Fonte única das CAPABILITIES do MVP (Spec 22). Capabilities são a autorização
// por perfil no Firestore (documento usuarios/{uid}.capabilities) e espelhadas
// como lista de strings (claim `caps`) para as Storage Rules.
//
// Regra: ausência de uma capability (no mapa ou na lista) significa "não
// permitido". Não hardcodar strings de capability fora deste módulo.

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

export function capValida(valor) {
  return TODAS_CAPABILITIES.includes(valor)
}

// Lê uma capability do mapa usuarios/{uid}.capabilities. Ausência = false.
export function temCapability(capabilities, cap) {
  return !!capabilities && capabilities[cap] === true
}

// Converte o mapa de capabilities na lista de strings (claim `caps`), contendo
// apenas capabilities válidas marcadas como true.
export function capabilitiesParaLista(capabilities) {
  if (!capabilities || typeof capabilities !== 'object') {
    return []
  }
  return TODAS_CAPABILITIES.filter((cap) => capabilities[cap] === true)
}

// Matriz inicial (Spec 22 §2.2): deriva o mapa de capabilities a partir do perfil
// (nível e governança global). Usada pelo seed/scripts para gerar o mapa inicial
// dos perfis atuais; a autorização em runtime lê o mapa persistido no documento.
export function capabilitiesDoLegado(nivelAcesso, adminGlobal = false) {
  const admin = nivelAcesso === 2
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
