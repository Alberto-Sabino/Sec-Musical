// Utilitário de formatação de data para exibição.
// Aceita Firestore Timestamp, Date, número (ms) ou string ISO.
export function formatarData(valor) {
  if (!valor) {
    return '—'
  }

  const data = converterParaData(valor)

  if (Number.isNaN(data.getTime())) {
    return '—'
  }

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Normaliza os formatos aceitos (Firestore Timestamp, Date, número ou string) em Date.
function converterParaData(valor) {
  if (typeof valor?.toDate === 'function') {
    return valor.toDate()
  } // Firestore Timestamp
  if (valor instanceof Date) {
    return valor
  }
  return new Date(valor)
}

// Formata data e hora para exibição (Spec 15: histórico com data e hora).
export function formatarDataHora(valor) {
  if (!valor) {
    return '—'
  }
  const data = converterParaData(valor)
  if (Number.isNaN(data.getTime())) {
    return '—'
  }
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Formata um tamanho em bytes para MB legível (Spec 14).
// Retorna '—' quando o valor não existir (arquivos legados sem tamanho_bytes).
export function formatarTamanho(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
    return '—'
  }
  const mb = Number(bytes) / (1024 * 1024)
  if (mb < 0.1) {
    return '< 0,1 MB'
  }
  // Uma casa decimal, com vírgula (pt-BR).
  return `${mb.toFixed(1).replace('.', ',')} MB`
}
