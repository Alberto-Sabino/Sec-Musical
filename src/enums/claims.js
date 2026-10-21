// Fonte única dos nomes de CLAIMS espelhados no ID token (Spec 23).
// `caps` é a lista de strings de capabilities usada pelas Storage Rules.
// Autorização 100% por capabilities; não há mais legado de perfil no token.

export const CLAIM = {
  ATIVO: 'ativo',
  IDS_SETOR: 'ids_setor',
  CAPS: 'caps',
}
