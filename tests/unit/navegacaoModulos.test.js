// Testes de unidade da navegação por módulos (Spec 13).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MODULO,
  moduloDaRota,
  ehRotaInicialDeModulo,
  destinoDoModulo,
} from '../../src/composables/usarNavegacaoModulos.js'

test('moduloDaRota mapeia subfluxos ao módulo correto', () => {
  assert.equal(moduloDaRota('inicio'), MODULO.INICIO)
  assert.equal(moduloDaRota('biblioteca'), MODULO.BIBLIOTECA)
  assert.equal(moduloDaRota('arquivo-novo'), MODULO.BIBLIOTECA)
  assert.equal(moduloDaRota('arquivo-editar'), MODULO.BIBLIOTECA)
  assert.equal(moduloDaRota('biblioteca-tipo'), MODULO.BIBLIOTECA)
  assert.equal(moduloDaRota('biblioteca-busca'), MODULO.BIBLIOTECA)
  assert.equal(moduloDaRota('minhas-solicitacoes'), MODULO.SOLICITACOES)
  assert.equal(moduloDaRota('solicitacao-detalhe'), MODULO.SOLICITACOES)
  assert.equal(moduloDaRota('fila-detalhe'), MODULO.SOLICITACOES)
})

test('moduloDaRota retorna null para rota fora dos módulos (ex.: login)', () => {
  assert.equal(moduloDaRota('login'), null)
  assert.equal(moduloDaRota('rota-inexistente'), null)
})

test('ehRotaInicialDeModulo: telas iniciais não mostram ← Voltar', () => {
  for (const inicial of ['inicio', 'biblioteca', 'minhas-solicitacoes', 'fila-solicitacoes']) {
    assert.equal(ehRotaInicialDeModulo(inicial), true, `${inicial} deveria ser inicial`)
  }
})

test('ehRotaInicialDeModulo: telas internas mostram ← Voltar', () => {
  for (const interna of [
    'arquivo-novo',
    'arquivo-editar',
    'biblioteca-tipo',
    'biblioteca-busca',
    'solicitacao-nova',
    'solicitacao-editar',
    'solicitacao-detalhe',
    'fila-detalhe',
  ]) {
    assert.equal(ehRotaInicialDeModulo(interna), false, `${interna} deveria ser interna`)
  }
})

test('destinoDoModulo respeita o perfil para Solicitações', () => {
  // encarregado (não admin) -> minhas-solicitacoes; admin -> fila-solicitacoes
  assert.deepEqual(destinoDoModulo(MODULO.SOLICITACOES, false), { name: 'minhas-solicitacoes' })
  assert.deepEqual(destinoDoModulo(MODULO.SOLICITACOES, true), { name: 'fila-solicitacoes' })
})

test('destinoDoModulo para Biblioteca e Início independe do perfil', () => {
  assert.deepEqual(destinoDoModulo(MODULO.BIBLIOTECA, false), { name: 'biblioteca' })
  assert.deepEqual(destinoDoModulo(MODULO.BIBLIOTECA, true), { name: 'biblioteca' })
  assert.deepEqual(destinoDoModulo(MODULO.INICIO, false), { name: 'inicio' })
  assert.deepEqual(destinoDoModulo(MODULO.INICIO, true), { name: 'inicio' })
})
