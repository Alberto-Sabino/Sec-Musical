// Casos de uso do Admin para o domínio de Solicitações (Spec 07).
// Transição de status respeita estritamente o fluxo válido do MVP.
import {
  listarPorSetor,
  assumirComTransacao,
  atualizarSolicitacao,
  registrarAuditoria,
} from '@/servicos/repositorios/repositorioSolicitacoes'
import { enviarArquivo } from '@/servicos/infraestrutura_arquivos'
import { STATUS, ACAO_AUDITORIA } from '@/servicos/casos_de_uso/solicitacoes'

// Transições administrativas válidas:
// em_aberto -> em_andamento; em_andamento -> concluida;
// em_aberto -> cancelada; em_andamento -> cancelada.
const TRANSICOES_VALIDAS = {
  concluida: [STATUS.EM_ANDAMENTO],
  cancelada: [STATUS.EM_ABERTO, STATUS.EM_ANDAMENTO],
}

// Monta o id_nuvem oficial do anexo final de solicitações.
// solicitacoes/{id_setor}/{id_solicitante}/{id_solicitacao}/resposta.pdf
function montarIdNuvemResposta(solicitacao) {
  return `solicitacoes/${solicitacao.id_setor}/${solicitacao.id_solicitante}/${solicitacao.id_solicitacao}/resposta.pdf`
}

// Lista a fila do setor ativo, com filtro opcional por status.
export async function listarFila(idSetor, status) {
  return listarPorSetor(idSetor, status || null)
}

// Assume a solicitação (transação). Retorna { ok, motivo }.
export async function assumirSolicitacao(solicitacao, idResponsavel, nomeResponsavel) {
  const resultado = await assumirComTransacao(
    solicitacao.id_solicitacao,
    idResponsavel,
    nomeResponsavel,
  )
  if (resultado.ok) {
    await registrarAuditoria(solicitacao.id_solicitacao, {
      acao: ACAO_AUDITORIA.ASSUMIDA,
      id_usuario: idResponsavel,
      status_anterior: STATUS.EM_ABERTO,
      status_novo: STATUS.EM_ANDAMENTO,
    })
  }
  return resultado
}

// Registra/atualiza a conclusão (resposta do responsável).
// Permitido apenas enquanto em_andamento; a conclusão é obrigatória e não pode ser esvaziada.
export async function responder(solicitacao, conclusao, idUsuario) {
  if (solicitacao.status !== STATUS.EM_ANDAMENTO) {
    throw new Error('Só é possível responder enquanto a solicitação estiver em andamento.')
  }
  if (!conclusao?.trim()) {
    throw new Error('Informe a conclusão da solicitação.')
  }

  await atualizarSolicitacao(solicitacao.id_solicitacao, { conclusao: conclusao.trim() })
  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.RESPONDIDA,
    id_usuario: idUsuario,
    status_anterior: solicitacao.status,
    status_novo: solicitacao.status,
  })
}

// Anexa o arquivo final: envia ao Storage e grava id_nuvem na solicitação.
// Não conclui aqui; a conclusão é uma ação explícita.
export async function anexarFinal(solicitacao, arquivo, idUsuario) {
  if (!arquivo) {
    throw new Error('Selecione um arquivo para anexar.')
  }
  const idNuvem = montarIdNuvemResposta(solicitacao)
  await enviarArquivo(idNuvem, arquivo)
  await atualizarSolicitacao(solicitacao.id_solicitacao, { id_nuvem: idNuvem })
  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.ANEXO_FINAL,
    id_usuario: idUsuario,
    status_anterior: solicitacao.status,
    status_novo: solicitacao.status,
  })
  return { id_nuvem: idNuvem }
}

// Conclui a solicitação (em_andamento -> concluida).
export async function concluirSolicitacao(solicitacao, idUsuario) {
  if (!TRANSICOES_VALIDAS.concluida.includes(solicitacao.status)) {
    throw new Error('Só é possível concluir uma solicitação em andamento.')
  }
  await atualizarSolicitacao(solicitacao.id_solicitacao, { status: STATUS.CONCLUIDA })
  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.CONCLUIDA,
    id_usuario: idUsuario,
    status_anterior: solicitacao.status,
    status_novo: STATUS.CONCLUIDA,
  })
}

// Cancela administrativamente (em_aberto ou em_andamento -> cancelada).
export async function cancelarSolicitacaoAdmin(solicitacao, idUsuario) {
  if (!TRANSICOES_VALIDAS.cancelada.includes(solicitacao.status)) {
    throw new Error('Transição de status inválida para cancelamento.')
  }
  await atualizarSolicitacao(solicitacao.id_solicitacao, { status: STATUS.CANCELADA })
  await registrarAuditoria(solicitacao.id_solicitacao, {
    acao: ACAO_AUDITORIA.CANCELADA,
    id_usuario: idUsuario,
    status_anterior: solicitacao.status,
    status_novo: STATUS.CANCELADA,
  })
}
