// Testes de unidade dos parâmetros dos eventos de tela do analytics.
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizarPath,
  parametrosEventoTela,
} from '../../src/servicos/casos_de_uso/analyticsNavegacao.js'

// Helper para simular o objeto de rota resolvido do vue-router.
function rota(path, { matchedPath = path } = {}) {
  return { path, matched: [{ path: matchedPath }] }
}

test('normalizarPath mantém paths estáticos inalterados', () => {
  assert.equal(normalizarPath(rota('/biblioteca')), '/biblioteca')
  assert.equal(normalizarPath(rota('/')), '/')
})

test('normalizarPath mascara segmentos dinâmicos com #', () => {
  // Usa o padrão da rota casada, não o valor real do id.
  assert.equal(
    normalizarPath({ path: '/solicitacoes/42', matched: [{ path: '/solicitacoes/:id' }] }),
    '/solicitacoes/#',
  )
  assert.equal(
    normalizarPath({
      path: '/biblioteca/tipo/partitura',
      matched: [{ path: '/biblioteca/tipo/:tipo' }],
    }),
    '/biblioteca/tipo/#',
  )
})

test('normalizarPath mascara múltiplos segmentos dinâmicos', () => {
  assert.equal(
    normalizarPath({ path: '/a/1/b/2', matched: [{ path: '/a/:x/b/:y' }] }),
    '/a/#/b/#',
  )
})

test('normalizarPath usa a última rota casada (rota filha) e ignora query', () => {
  // O padrão vem de matched, então query no path não afeta o resultado.
  assert.equal(
    normalizarPath({
      path: '/solicitacoes/42',
      matched: [{ path: '/solicitacoes' }, { path: '/solicitacoes/:id/editar' }],
    }),
    '/solicitacoes/#/editar',
  )
})

test('normalizarPath usa rota.path quando não há matched', () => {
  assert.equal(normalizarPath({ path: '/fallback', matched: [] }), '/fallback')
})

test('normalizarPath retorna null para entradas ausentes', () => {
  assert.equal(normalizarPath(null), null)
  assert.equal(normalizarPath(undefined), null)
  assert.equal(normalizarPath({ matched: [] }), null)
})

test('parametrosEventoTela: origem null na primeira navegação (sem nome de origem)', () => {
  const destino = { path: '/', name: 'inicio', matched: [{ path: '/' }] }
  const origemInicial = { path: '/', name: undefined, matched: [] }
  assert.deepEqual(parametrosEventoTela('inicio', destino, origemInicial), {
    tela: 'inicio',
    origem: null,
    destino: '/',
  })
})

test('parametrosEventoTela: origem e destino normalizados em navegação normal', () => {
  const de = { path: '/biblioteca', name: 'biblioteca', matched: [{ path: '/biblioteca' }] }
  const para = {
    path: '/solicitacoes/42',
    name: 'solicitacao-detalhe',
    matched: [{ path: '/solicitacoes/:id' }],
  }
  assert.deepEqual(parametrosEventoTela('detalhe_solicitacao', para, de), {
    tela: 'detalhe_solicitacao',
    origem: '/biblioteca',
    destino: '/solicitacoes/#',
  })
})

test('parametrosEventoTela: destino também é mascarado quando dinâmico', () => {
  const de = {
    path: '/biblioteca/tipo/partitura',
    name: 'biblioteca-tipo',
    matched: [{ path: '/biblioteca/tipo/:tipo' }],
  }
  const para = {
    path: '/biblioteca/99/editar',
    name: 'arquivo-editar',
    matched: [{ path: '/biblioteca/:id/editar' }],
  }
  assert.deepEqual(parametrosEventoTela('biblioteca_editar_arquivo', para, de), {
    tela: 'biblioteca_editar_arquivo',
    origem: '/biblioteca/tipo/#',
    destino: '/biblioteca/#/editar',
  })
})
