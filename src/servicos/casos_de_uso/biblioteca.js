// Casos de uso da Biblioteca de consulta.
// Orquestram repositório (`arquivos`) e infraestrutura de arquivos (download).
import { listarArquivos } from '@/servicos/repositorios/repositorioArquivos'
import { baixarArquivo } from '@/servicos/infraestrutura_arquivos'
import { NIVEL_ADMIN } from '@/servicos/casos_de_uso/autenticacao'

// Tipos oficiais de arquivo (contrato do MVP).
export const TIPOS_ARQUIVO = [
  { valor: 'circular', rotulo: 'Circular' },
  { valor: 'topico', rotulo: 'Tópico' },
  { valor: 'plano_aula', rotulo: 'Plano de aula' },
  { valor: 'modelo', rotulo: 'Modelo' },
  { valor: 'outros', rotulo: 'Outros' },
]

// Nível de acesso do ARQUIVO (contrato do MVP): 1 = público, 2 = restrito.
// Distinto do nivel_acesso do USUÁRIO (1 = usuário, 2 = admin), definido em autenticacao.js.
export const NIVEL_ARQUIVO = {
  PUBLICO: 1,
  RESTRITO: 2,
}

// Rótulos amigáveis do nível de acesso do arquivo (fonte única de exibição).
export const NIVEL_ARQUIVO_ROTULOS = {
  [NIVEL_ARQUIVO.PUBLICO]: 'Público',
  [NIVEL_ARQUIVO.RESTRITO]: 'Restrito',
}

// Opções { valor, rotulo } para selects de nível (rótulo com número entre parênteses).
export const NIVEL_ARQUIVO_OPCOES = [
  { valor: NIVEL_ARQUIVO.PUBLICO, rotulo: 'Público (nível 1)' },
  { valor: NIVEL_ARQUIVO.RESTRITO, rotulo: 'Restrito (nível 2)' },
]

// Ações oficiais registradas na auditoria de arquivos.
export const ACAO_AUDITORIA_ARQUIVO = {
  CRIADO: 'criado',
  ATUALIZADO: 'atualizado',
  REMOVIDO: 'removido',
}

// Rótulo amigável de um nível de acesso de arquivo. Fallback vazio para valores fora do contrato.
export function rotuloNivelArquivo(nivel) {
  return NIVEL_ARQUIVO_ROTULOS[nivel] || ''
}

// Rótulo amigável de um tipo de arquivo. Fallback para o próprio valor.
export function rotuloTipoArquivo(tipo) {
  const encontrado = TIPOS_ARQUIVO.find((item) => item.valor === tipo)
  return encontrado ? encontrado.rotulo : tipo
}

// Níveis visíveis conforme perfil:
// - usuário comum: apenas público (1);
// - admin: público (1) e restrito (2).
function niveisPorPerfil(nivelAcessoUsuario) {
  if (nivelAcessoUsuario === NIVEL_ADMIN) {
    return [NIVEL_ARQUIVO.PUBLICO, NIVEL_ARQUIVO.RESTRITO]
  }
  return [NIVEL_ARQUIVO.PUBLICO]
}

// Lista a biblioteca do contexto atual (setor ativo + perfil), com filtro opcional por tipo.
export async function listarBiblioteca({ nivelAcesso, idSetor, tipo }) {
  const niveis = niveisPorPerfil(nivelAcesso)
  return listarArquivos({ idSetor, niveis, tipo: tipo || null })
}

// Baixa um arquivo a partir do `id_nuvem` persistido.
// Retorna { nome, blob } vindos da infraestrutura de arquivos.
export async function baixarArquivoBiblioteca(idNuvem) {
  return baixarArquivo(idNuvem)
}
