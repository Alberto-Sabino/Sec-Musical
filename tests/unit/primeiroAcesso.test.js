// Testes de unidade do gating de primeiro acesso (Spec 20).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { avaliarPrimeiroAcesso, ROTAS_PRIMEIRO_ACESSO } from '../../src/router/primeiroAcesso.js'

test('sem primeiro acesso: qualquer rota é permitida', () => {
  assert.deepEqual(avaliarPrimeiroAcesso('biblioteca', false), { permitido: true })
  assert.deepEqual(avaliarPrimeiroAcesso('fila-solicitacoes', false), { permitido: true })
})

test('em primeiro acesso: libera apenas alterar-senha e perfil', () => {
  for (const rota of ROTAS_PRIMEIRO_ACESSO) {
    assert.deepEqual(avaliarPrimeiroAcesso(rota, true), { permitido: true })
  }
})

test('em primeiro acesso: outras rotas redirecionam para alterar-senha', () => {
  for (const rota of ['inicio', 'biblioteca', 'minhas-solicitacoes', 'fila-solicitacoes']) {
    assert.deepEqual(avaliarPrimeiroAcesso(rota, true), {
      permitido: false,
      redirect: 'alterar-senha',
    })
  }
})
