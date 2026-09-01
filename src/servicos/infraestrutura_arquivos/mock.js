// Implementação MOCK da infraestrutura de arquivos.
// Isolada da UI e dos casos de uso. Simula o download preservando o
// contrato oficial de `id_nuvem`. NÃO representa Storage real.
//
// Contrato da interface (comum a mock e firebase):
//   baixarArquivo(idNuvem: string): Promise<{ nome: string, blob: Blob }>
//   enviarArquivo(idNuvem: string, arquivo: File): Promise<{ id_nuvem: string }>
//   removerArquivo(idNuvem: string): Promise<{ removido: boolean }>

function nomeArquivoDeIdNuvem(idNuvem) {
  // id_nuvem oficial: biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf
  const partes = String(idNuvem).split('/')
  return partes[partes.length - 1] || 'arquivo.pdf'
}

export async function baixarArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }

  const nome = nomeArquivoDeIdNuvem(idNuvem)

  // Conteúdo simulado: apenas referencia o caminho persistido, sem URL pública fixa.
  const conteudo = `Arquivo simulado (mock).\nid_nuvem: ${idNuvem}\n`
  const blob = new Blob([conteudo], { type: 'text/plain' })

  return { nome, blob }
}

// Simula o envio de um arquivo para o caminho oficial de `id_nuvem`.
// Não persiste conteúdo real; apenas valida entradas e resolve o contrato.
export async function enviarArquivo(idNuvem, arquivo) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }
  if (!arquivo) {
    throw new Error('arquivo ausente')
  }
  return { id_nuvem: idNuvem }
}

// Simula a remoção de um arquivo do Storage.
export async function removerArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }
  return { removido: true }
}
