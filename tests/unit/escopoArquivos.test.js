// Testes de unidade do enum de escopo de arquivos (Spec 18).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ESCOPO_ARQUIVO,
  ESCOPOS_VALIDOS,
  escopoValido,
  escopoDoArquivo,
  ehGlobal,
  podeGerenciarArquivo,
} from '../../src/enums/escopoArquivos.js'

test('ESCOPO_ARQUIVO expõe apenas global e setor', () => {
  assert.deepEqual(ESCOPO_ARQUIVO, { GLOBAL: 'global', SETOR: 'setor' })
  assert.deepEqual([...ESCOPOS_VALIDOS].sort(), ['global', 'setor'])
})

test('escopoValido aceita somente valores do contrato', () => {
  assert.equal(escopoValido('global'), true)
  assert.equal(escopoValido('setor'), true)
  assert.equal(escopoValido('qualquer'), false)
  assert.equal(escopoValido(undefined), false)
  assert.equal(escopoValido(null), false)
})

test('escopoDoArquivo trata legados (sem escopo) como setor', () => {
  assert.equal(escopoDoArquivo({ escopo: 'global' }), 'global')
  assert.equal(escopoDoArquivo({ escopo: 'setor' }), 'setor')
  assert.equal(escopoDoArquivo({}), 'setor')
  assert.equal(escopoDoArquivo({ escopo: 'invalido' }), 'setor')
  assert.equal(escopoDoArquivo(null), 'setor')
})

test('ehGlobal reconhece apenas o valor global', () => {
  assert.equal(ehGlobal('global'), true)
  assert.equal(ehGlobal('setor'), false)
})

test('podeGerenciarArquivo: setor liberado para qualquer admin; global exige admin_global', () => {
  // arquivo de setor
  assert.equal(podeGerenciarArquivo({ escopo: 'setor' }, false), true)
  assert.equal(podeGerenciarArquivo({ escopo: 'setor' }, true), true)
  // arquivo global
  assert.equal(podeGerenciarArquivo({ escopo: 'global' }, true), true)
  assert.equal(podeGerenciarArquivo({ escopo: 'global' }, false), false)
  // legado (sem escopo) = setor
  assert.equal(podeGerenciarArquivo({}, false), true)
  // valor de admin_global não-booleano é tratado como não elegível para global
  assert.equal(podeGerenciarArquivo({ escopo: 'global' }, undefined), false)
})
