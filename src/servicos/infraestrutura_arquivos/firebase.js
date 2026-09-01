// Implementação FIREBASE da infraestrutura de arquivos (Cloud Storage).
// Pendente de Cloud Billing/Blaze. Mantém a mesma assinatura do contrato,
// mas NÃO deve ser declarada validada enquanto Storage real não estiver ativo.
//
// Contrato da interface:
//   baixarArquivo(idNuvem: string): Promise<{ nome: string, blob: Blob }>
//   enviarArquivo(idNuvem: string, arquivo: File): Promise<{ id_nuvem: string }>
//   removerArquivo(idNuvem: string): Promise<{ removido: boolean }>

const INDISPONIVEL =
  'Infraestrutura firebase de arquivos indisponível: Cloud Storage pendente de Billing.'

export async function baixarArquivo() {
  throw new Error(INDISPONIVEL)
}

export async function enviarArquivo() {
  throw new Error(INDISPONIVEL)
}

export async function removerArquivo() {
  throw new Error(INDISPONIVEL)
}
