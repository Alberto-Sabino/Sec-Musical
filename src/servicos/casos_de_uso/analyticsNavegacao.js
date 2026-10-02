// Helpers puros dos parâmetros dos eventos de tela (sem Vue/Firebase, testáveis).

// Mascara segmentos dinâmicos (:id, :tipo) com '#' usando o padrão da rota
// casada, evitando expor ids. Ignora query/hash por partir do path definido.
export function normalizarPath(rota) {
  if (!rota) {
    return null
  }
  const definicao = rota.matched?.[rota.matched.length - 1]
  const padrao = definicao?.path ?? rota.path
  if (!padrao) {
    return null
  }
  return padrao.replace(/:[^/]+/g, '#')
}

export function parametrosEventoTela(tela, para, de) {
  return {
    tela,
    origem: de?.name ? normalizarPath(de) : null,
    destino: normalizarPath(para),
  }
}
