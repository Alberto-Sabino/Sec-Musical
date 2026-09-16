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
// id_nuvem: biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{ext}
function nomeArquivoDeIdNuvem(idNuvem) {
  const partes = String(idNuvem).split('/')
  return partes[partes.length - 1] || 'arquivo'
}

// Extensão (minúscula, sem ponto) derivada do caminho.
function extensaoDeCaminho(idNuvem) {
  const nome = nomeArquivoDeIdNuvem(idNuvem)
  const ponto = nome.lastIndexOf('.')
  return ponto >= 0 ? nome.slice(ponto + 1).toLowerCase() : ''
}

// MIME type por extensão (Biblioteca: pdf, xlsx; anexo de solicitações: pdf).
const MIME_POR_EXTENSAO = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function mimeDeExtensao(ext) {
  return MIME_POR_EXTENSAO[ext] || 'application/octet-stream'
}

// Baixa os bytes reais persistidos no Storage sob o caminho `id_nuvem`.
// O tipo do Blob respeita a extensão real do caminho (não assume PDF fixo).
export async function baixarArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }

  const nome = nomeArquivoDeIdNuvem(idNuvem)
  const ext = extensaoDeCaminho(idNuvem)
  const referencia = storageRef(storage, idNuvem)
  const bytes = await getBytes(referencia)
  const blob = new Blob([bytes], { type: mimeDeExtensao(ext) })

  return { nome, blob }
}

// Envia o arquivo para o caminho oficial de `id_nuvem`, persistindo os bytes.
export async function enviarArquivo(idNuvem, arquivo) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }
  if (!arquivo || typeof arquivo.size !== 'number') {
    // Exige um binário real (File/Blob). Objeto simbólico não é aceito.
    throw new Error('arquivo inválido para envio')
  }

  const referencia = storageRef(storage, idNuvem)
  await uploadBytes(referencia, arquivo)

  return { id_nuvem: idNuvem }
}

// Move um binário existente de um caminho para outro, lendo os bytes reais da
// origem e regravando no destino. Usado quando o caminho muda sem novo upload
// (ex.: mudança de nível de acesso). Falha explicitamente se a origem não puder
// ser lida — nunca finge sucesso.
export async function moverArquivo(idNuvemOrigem, idNuvemDestino) {
  if (!idNuvemOrigem || !idNuvemDestino) {
    throw new Error('caminhos inválidos para mover arquivo')
  }
  if (idNuvemOrigem === idNuvemDestino) {
    return { id_nuvem: idNuvemDestino }
  }
  const bytes = await getBytes(storageRef(storage, idNuvemOrigem))
  const ext = extensaoDeCaminho(idNuvemDestino)
  const blob = new Blob([bytes], { type: mimeDeExtensao(ext) })
  await uploadBytes(storageRef(storage, idNuvemDestino), blob)
  return { id_nuvem: idNuvemDestino }
}

// Remove o objeto do Storage no caminho `id_nuvem`.
export async function removerArquivo(idNuvem) {
  if (!idNuvem || typeof idNuvem !== 'string') {
    throw new Error('id_nuvem inválido')
  }

  await deleteObject(storageRef(storage, idNuvem))

  return { removido: true }
}
