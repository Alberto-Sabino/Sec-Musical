// Fonte única do ESCOPO de arquivos da Biblioteca (Spec 18).
// escopo ∈ { 'global', 'setor' } (onde o arquivo é visível) é distinto de
// nivel_acesso ∈ { 1, 2 } (quem vê). Não hardcodar 'global'/'setor' fora daqui.

export const ESCOPO_ARQUIVO = {
  GLOBAL: 'global',
  SETOR: 'setor',
}

export const ESCOPOS_VALIDOS = Object.values(ESCOPO_ARQUIVO)

export function escopoValido(valor) {
  return ESCOPOS_VALIDOS.includes(valor)
}

// Escopo de um documento. Legados sem o campo são tratados como 'setor' (§3.1).
export function escopoDoArquivo(arquivo) {
  const valor = arquivo?.escopo

  return escopoValido(valor) ? valor : ESCOPO_ARQUIVO.SETOR
}

export function ehGlobal(escopo) {
  return escopo === ESCOPO_ARQUIVO.GLOBAL
}

// Elegibilidade de UI para editar/remover (defesa em profundidade; rules são a
// barreira real): arquivo global exige admin_global; setor é liberado ao admin.
export function podeGerenciarArquivo(arquivo, ehAdminGlobal) {
  return ehGlobal(escopoDoArquivo(arquivo)) ? ehAdminGlobal === true : true
}
