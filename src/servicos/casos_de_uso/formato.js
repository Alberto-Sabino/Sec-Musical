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
