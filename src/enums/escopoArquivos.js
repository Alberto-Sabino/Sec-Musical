// Fonte única do ESCOPO de arquivos da Biblioteca (Spec 18).
// escopo ∈ { 'global', 'setor' } define onde o arquivo é visível; é distinto de
// arquivo_privado (booleano, Spec 23), que define quem vê (público/privado).
// Não hardcodar 'global'/'setor' fora daqui.

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
// barreira real): arquivo global exige a capability biblioteca_gerenciar_global;
// arquivo de setor é liberado a quem gerencia a biblioteca do setor.
export function podeGerenciarArquivo(arquivo, podeGerenciarGlobal) {
  return ehGlobal(escopoDoArquivo(arquivo)) ? podeGerenciarGlobal === true : true
}
