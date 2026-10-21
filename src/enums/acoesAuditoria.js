// Fonte única das AÇÕES de auditoria de solicitações e seus rótulos de exibição
// (Specs 06/07/21). Módulo puro, sem dependências do SDK, para ser reusado pelas
// telas de detalhe (solicitante e admin) e coberto por teste unitário.

export const ACAO_AUDITORIA = {
  CRIADA: 'criada',
  EDITADA: 'editada',
  CANCELADA: 'cancelada',
  ASSUMIDA: 'assumida',
  RESPONDIDA: 'respondida',
  ANEXO_FINAL: 'anexo_final',
  CONCLUIDA: 'concluida',
  ANEXO_VISUALIZADO: 'anexo_visualizado',
}

export const ROTULOS_ACAO_AUDITORIA = {
  [ACAO_AUDITORIA.CRIADA]: 'Solicitação criada',
  [ACAO_AUDITORIA.EDITADA]: 'Solicitação editada',
  [ACAO_AUDITORIA.CANCELADA]: 'Cancelada',
  [ACAO_AUDITORIA.ASSUMIDA]: 'Assumida pelo responsável',
  [ACAO_AUDITORIA.RESPONDIDA]: 'Respondida',
  [ACAO_AUDITORIA.ANEXO_FINAL]: 'Anexo final adicionado',
  [ACAO_AUDITORIA.CONCLUIDA]: 'Concluída',
  [ACAO_AUDITORIA.ANEXO_VISUALIZADO]: 'Anexo visualizado',
}

export function rotuloAcaoAuditoria(acao) {
  return ROTULOS_ACAO_AUDITORIA[acao] || acao
}
