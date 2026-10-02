import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { app } from './index.js'
import { MODO_APP } from './config.js'

const analyticsAtivo = MODO_APP === 'producao'

let analyticsPromise

function obterAnalytics() {
  if (!analyticsAtivo) {
    return Promise.resolve(null)
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((suportado) => (suportado ? getAnalytics(app) : null))
      .catch(() => null)
  }

  return analyticsPromise
}

export async function dispararEvento(nome, parametros = {}) {
  const analytics = await obterAnalytics()

  if (analytics) {
    logEvent(analytics, nome, parametros)
  }
}
