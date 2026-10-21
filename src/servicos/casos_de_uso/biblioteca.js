// Casos de uso da Biblioteca de consulta.
// Orquestram repositório (`arquivos`) e infraestrutura de arquivos (download).
import { listarArquivos } from '@/servicos/repositorios/repositorioArquivos'
import { baixarArquivo } from '@/servicos/infraestrutura_arquivos'

// Tipos oficiais de arquivo (contrato do MVP).
export const TIPOS_ARQUIVO = [
  { valor: 'circulares', rotulo: 'Circulares' },
  { valor: 'topicos', rotulo: 'Tópicos' },
  { valor: 'metodos', rotulo: 'Métodos' },
  { valor: 'planos_aula', rotulo: 'Planos de aula' },
  { valor: 'provas', rotulo: 'Provas' },
  { valor: 'modelos', rotulo: 'Modelos' },
  { valor: 'outros', rotulo: 'Outros' },
]

// Visibilidade do ARQUIVO (Spec 23): arquivo_privado=false é público; true é
// privado/restrito. Opções { valor, rotulo } para o select do formulário.
// Tokens de visibilidade para o <select> (BaseSelect trabalha com strings; o
// <option value> nativo é sempre string). A conversão para o booleano
// arquivo_privado (contrato de dados) é feita por privadoDoToken/tokenDePrivado.
export const ARQUIVO_PRIVADO_TOKEN = {
  PUBLICO: 'publico',
  PRIVADO: 'privado',
}

export const ARQUIVO_PRIVADO_OPCOES = [
  { valor: ARQUIVO_PRIVADO_TOKEN.PUBLICO, rotulo: 'Público' },
  { valor: ARQUIVO_PRIVADO_TOKEN.PRIVADO, rotulo: 'Privado' },
]

// Converte o token do <select> no booleano arquivo_privado (contrato de dados).
export function privadoDoToken(token) {
  return token === ARQUIVO_PRIVADO_TOKEN.PRIVADO
}

// Converte o booleano arquivo_privado no token do <select>.
export function tokenDePrivado(arquivoPrivado) {
  return arquivoPrivado === true ? ARQUIVO_PRIVADO_TOKEN.PRIVADO : ARQUIVO_PRIVADO_TOKEN.PUBLICO
}

// Rótulo de visibilidade a partir do booleano arquivo_privado.
export function rotuloArquivoPrivado(arquivoPrivado) {
  return arquivoPrivado === true ? 'Privado' : 'Público'
}

// Ações oficiais registradas na auditoria de arquivos.
export const ACAO_AUDITORIA_ARQUIVO = {
  CRIADO: 'criado',
  ATUALIZADO: 'atualizado',
  REMOVIDO: 'removido',
}

// Rótulo amigável de um tipo de arquivo. Fallback para o próprio valor.
export function rotuloTipoArquivo(tipo) {
  const encontrado = TIPOS_ARQUIVO.find((item) => item.valor === tipo)
  return encontrado ? encontrado.rotulo : tipo
}

// Lista a biblioteca do contexto (setor ativo + visibilidade), com filtro
// opcional por tipo. `podeVerPrivados` libera os arquivos privados (capability
// biblioteca_ler_privados). Os globais entram automaticamente — a união é feita
// no repositório (Spec 18).
export async function listarBiblioteca({ podeVerPrivados, idSetor, tipo }) {
  return listarArquivos({ idSetor, podeVerPrivados: podeVerPrivados === true, tipo: tipo || null })
}

// Normaliza texto para busca: minúsculo e sem acentos.
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Ordena arquivos alfabeticamente por título (case-insensitive, estável).
export function ordenarPorTitulo(arquivos) {
  return [...arquivos].sort((a, b) =>
    normalizar(a.titulo).localeCompare(normalizar(b.titulo), 'pt-BR'),
  )
}

// Lista arquivos de um tipo específico, ordenados alfabeticamente por título (Spec 14).
export async function listarBibliotecaPorTipo({ podeVerPrivados, idSetor, tipo }) {
  const lista = await listarBiblioteca({ podeVerPrivados, idSetor, tipo })
  return ordenarPorTitulo(lista)
}

// Busca por nome em todos os tipos visíveis do setor ativo (camada de aplicação).
// Retorna vazio para termo em branco.
export async function buscarBibliotecaPorNome({ podeVerPrivados, idSetor, termo }) {
  const alvo = normalizar(termo)
  if (!alvo) {
    return []
  }
  const lista = await listarBiblioteca({ podeVerPrivados, idSetor, tipo: null })
  return lista.filter((a) => normalizar(a.titulo).includes(alvo))
}

// Baixa um arquivo a partir do `id_nuvem` persistido.
// Retorna { nome, blob } vindos da infraestrutura de arquivos.
export async function baixarArquivoBiblioteca(idNuvem) {
  return baixarArquivo(idNuvem)
}
