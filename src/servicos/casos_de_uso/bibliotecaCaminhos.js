// Lógica pura de caminho/extensão da Biblioteca (Specs 14/18/23). Sem firebase/vue.
// Importado por testes de unidade via caminho relativo (node:test, sem alias "@"),
// por isso não importa de "@/enums": ESCOPO_GLOBAL espelha ESCOPO_ARQUIVO.GLOBAL.

const ESCOPO_GLOBAL = 'global'

// Monta o id_nuvem oficial conforme o escopo (Spec 18) e a visibilidade (Spec 23):
//   setor  → biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{ext}
//   global → biblioteca_global/nivel_1|nivel_2/{id_arquivo}.{ext}
// arquivoPrivado=true usa nivel_2; false (ou ausente) usa nivel_1.
// Escopo ausente é tratado como 'setor' (legados).
export function montarIdNuvem({ escopo, idSetor, arquivoPrivado, idArquivo, extensao }) {
  const segmentoNivel = arquivoPrivado === true ? 'nivel_2' : 'nivel_1'

  if (escopo === ESCOPO_GLOBAL) {
    return `biblioteca_global/${segmentoNivel}/${idArquivo}.${extensao}`
  }

  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.${extensao}`
}

// Extensão (Spec 14): campo persistido → parse do id_nuvem → 'pdf'.
export function inferirExtensao(arquivoAtual) {
  if (arquivoAtual?.extensao_arquivo) {
    return String(arquivoAtual.extensao_arquivo).toLowerCase()
  }

  const idNuvem = arquivoAtual?.id_nuvem || ''
  const nome = idNuvem.split('/').pop() || ''
  const ponto = nome.lastIndexOf('.')

  if (ponto >= 0) {
    return nome.slice(ponto + 1).toLowerCase()
  }

  return 'pdf'
}
