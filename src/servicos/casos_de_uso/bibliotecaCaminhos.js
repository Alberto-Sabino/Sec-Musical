// Lógica pura de caminho e extensão da Biblioteca (Spec 14).
// Sem dependências de firebase/vue — isolada para permitir testes de unidade.

// Nível de acesso RESTRITO do arquivo (contrato oficial: 1 = público, 2 = restrito).
// Valor local para manter este módulo puro (sem importar a camada que puxa firebase).
const NIVEL_RESTRITO = 2

// Monta o id_nuvem no formato oficial da Biblioteca, respeitando a extensão real.
// biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}
export function montarIdNuvem({ idSetor, nivelAcesso, idArquivo, extensao }) {
  const segmentoNivel = nivelAcesso === NIVEL_RESTRITO ? 'nivel_2' : 'nivel_1'
  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.${extensao}`
}

// Inferência de extensão (Spec 14): campo persistido -> parse do id_nuvem -> 'pdf'.
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
