// Implementação FIREBASE da infraestrutura de arquivos (Cloud Storage).
// Comunica com o Storage real via SDK. Em desenvolvimento aponta para o
// Storage emulator (ver src/servicos/firebase/index.js), que NÃO exige Billing.
//
// IMPORTANTE: o Storage de PRODUÇÃO permanece pendente de Cloud Billing/Blaze
// e NÃO deve ser declarado concluído/validado enquanto Billing não estiver ativo.
// Esta implementação existe para permitir upload/download/remoção reais contra
// o emulador local, mantendo o contrato oficial de `id_nuvem`.
//
// Contrato da interface (única implementação da infra de arquivos):
//   baixarArquivo(idNuvem: string): Promise<{ nome: string, blob: Blob }>
//   enviarArquivo(idNuvem: string, arquivo: File): Promise<{ id_nuvem: string }>
//   removerArquivo(idNuvem: string): Promise<{ removido: boolean }>

import { ref as storageRef, uploadBytes, getBytes, deleteObject } from 'firebase/storage'
import { storage } from '@/servicos/firebase'

// Deriva o nome do arquivo a partir do `id_nuvem` oficial.
// id_nuvem: biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf
function nomeArquivoDeIdNuvem(idNuvem) {
  const partes = String(idNuvem).split('/')
  return partes[partes.length - 1] || 'arquivo.pdf'
}

// Baixa os bytes reais persistidos no Storage sob o caminho `id_nuvem`.
// Usa getBytes (ArrayBuffer) em vez de getBlob para evitar exigência de CORS
// no bucket, o que simplifica o uso contra o emulador.
export async function baixarArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }

  const nome = nomeArquivoDeIdNuvem(idNuvem)
  const referencia = storageRef(storage, idNuvem)
  const bytes = await getBytes(referencia)
  const blob = new Blob([bytes], { type: 'application/pdf' })

  return { nome, blob }
}

// Envia o arquivo para o caminho oficial de `id_nuvem`, persistindo os bytes.
export async function enviarArquivo(idNuvem, arquivo) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }
  if (!arquivo) {
    throw new Error('arquivo ausente')
  }

  const referencia = storageRef(storage, idNuvem)
  await uploadBytes(referencia, arquivo)

  return { id_nuvem: idNuvem }
}

// Remove o objeto do Storage no caminho `id_nuvem`.
export async function removerArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }

  await deleteObject(storageRef(storage, idNuvem))

  return { removido: true }
}
