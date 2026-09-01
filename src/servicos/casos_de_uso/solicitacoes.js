// Casos de uso do Usuário para o domínio de Solicitações (Spec 06).
// Orquestram o repositório e aplicam as regras de experiência.
import {
  novaReferenciaSolicitacao,
  criarSolicitacao as criarNoRepo,
  listarPorSolicitante,
  obterSolicitacao as obterNoRepo,
  atualizarSolicitacao,
  registrarAuditoria,
  listarAuditoria,
} from '@/servicos/repositorios/repositorioSolicitacoes'
import { baixarArquivo } from '@/servicos/infraestrutura_arquivos'

// Tipos oficiais de solicitação (contrato do MVP).
export const TIPOS_SOLICITACAO = [
  { valor: 'troca_instrumento', rotulo: 'Troca de instrumento' },
  { valor: 'avaliacao', rotulo: 'Avaliação' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
  { valor: 'ficha', rotulo: 'Ficha' },
  { valor: 'acesso', rotulo: 'Acesso' },
]

// Status oficiais.
export const STATUS = {
  EM_ABERTO: 'em_aberto',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
}

// Rótulos amigáveis dos status (fonte única de exibição).
export const STATUS_ROTULOS = {
  [STATUS.EM_ABERTO]: 'Em aberto',
  [STATUS.EM_ANDAMENTO]: 'Em andamento',
  [STATUS.CONCLUIDA]: 'Concluída',
  [STATUS.CANCELADA]: 'Cancelada',
}

// Opções de status para filtros, derivadas dos rótulos (sem duplicar valores).
export const STATUS_OPCOES = Object.entries(STATUS_ROTULOS).map(([valor, rotulo]) => ({
  valor,
  rotulo,
}))

// Ações oficiais registradas na auditoria de solicitações.
export const ACAO_AUDITORIA = {
  CRIADA: 'criada',
  EDITADA: 'editada',
  CANCELADA: 'cancelada',
  ASSUMIDA: 'assumida',
  RESPONDIDA: 'respondida',
  ANEXO_FINAL: 'anexo_final',
  CONCLUIDA: 'concluida',
}

export function rotuloTipo(tipo) {
  const t = TIPOS_SOLICITACAO.find((x) => x.valor === tipo)
  return t ? t.rotulo : tipo
}

// Cria uma solicitação para o usuário atual.
// dados: { idUsuario, nomeUsuario, idSetor, tipo, nomeBeneficiario, descricao }.
// nome_beneficiario e descricao são obrigatórios.
export async function criarSolicitacao({
  idUsuario,
  nomeUsuario,
  idSetor,
  tipo,
  nomeBeneficiario,
  descricao,
}) {
  if (!tipo) {
    throw new Error('Selecione o tipo da solicitação.')
  }
  if (!nomeBeneficiario?.trim()) {
    throw new Error('Informe a pessoa afetada.')
  }
  if (!descricao?.trim()) {
    throw new Error('Informe a descrição da solicitação.')
  }

  const referencia = novaReferenciaSolicitacao()
  const idSolicitacao = referencia.id

  await criarNoRepo(idSolicitacao, {
    id_setor: idSetor,
    id_solicitante: idUsuario,
    nome_solicitante: nomeUsuario || '',
    nome_beneficiario: nomeBeneficiario.trim(),
    tipo,
    descricao: descricao.trim(),
  })

  await registrarAuditoria(idSolicitacao, {
    acao: ACAO_AUDITORIA.CRIADA,
    id_usuario: idUsuario,
    status_anterior: '',
    status_novo: STATUS.EM_ABERTO,
  })

  return { id_solicitacao: idSolicitacao }
}

// Lista apenas as solicitações do próprio usuário.
export async function listarMinhasSolicitacoes(idUsuario) {
  return listarPorSolicitante(idUsuario)
}

export async function obterSolicitacao(idSolicitacao) {
  return obterNoRepo(idSolicitacao)
}

export async function listarHistorico(idSolicitacao) {
  return listarAuditoria(idSolicitacao)
}

// Edita a solicitação — permitido apenas enquanto em_aberto.
// Só a descrição e o tipo mudam; nome_beneficiario é imutável após a criação.
// O usuário não altera status, id_responsavel, conclusao nem id_nuvem.
export async function editarSolicitacao(solicitacao, { tipo, descricao }, idUsuario) {
  if (solicitacao.status !== STATUS.EM_ABERTO) {
    throw new Error('Só é possível editar enquanto a solicitação estiver em aberto.')
  }
  if (!descricao?.trim()) {
    throw new Error('Informe a descrição da solicitação.')
  }

  await atualizarSolicitacao(solicitacao.id_solicitacao, {
    tipo,
    descricao: descricao.trim(),
  })

  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.EDITADA,
    id_usuario: idUsuario,
    status_anterior: STATUS.EM_ABERTO,
    status_novo: STATUS.EM_ABERTO,
  })
}

// Cancela a solicitação — permitido apenas enquanto em_aberto.
export async function cancelarSolicitacao(solicitacao, idUsuario) {
  if (solicitacao.status !== STATUS.EM_ABERTO) {
    throw new Error('Só é possível cancelar enquanto a solicitação estiver em aberto.')
  }

  await atualizarSolicitacao(solicitacao.id_solicitacao, {
    status: STATUS.CANCELADA,
  })

  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.CANCELADA,
    id_usuario: idUsuario,
    status_anterior: STATUS.EM_ABERTO,
    status_novo: STATUS.CANCELADA,
  })
}

// Baixa o anexo final — apenas quando a solicitação está concluida e possui id_nuvem.
export async function baixarAnexoFinal(solicitacao) {
  if (solicitacao.status !== STATUS.CONCLUIDA) {
    throw new Error('O anexo final só fica disponível quando a solicitação é concluída.')
  }
  if (!solicitacao.id_nuvem) {
    throw new Error('Esta solicitação não possui anexo final.')
  }
  return baixarArquivo(solicitacao.id_nuvem)
}
