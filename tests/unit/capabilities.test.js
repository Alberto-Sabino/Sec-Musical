// Testes de unidade das capabilities (Specs 22/23).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CAP,
  TODAS_CAPABILITIES,
  capValida,
  temCapability,
  capabilitiesParaLista,
  capabilitiesDoLegado,
} from '../../src/enums/capabilities.js'

test('capValida reconhece apenas capabilities do enum', () => {
  assert.ok(capValida(CAP.BIBLIOTECA_LER_PUBLICOS))
  assert.ok(!capValida('inexistente'))
})

test('temCapability trata ausência como false', () => {
  assert.equal(temCapability(null, CAP.BIBLIOTECA_LER_PUBLICOS), false)
  assert.equal(temCapability({}, CAP.BIBLIOTECA_LER_PUBLICOS), false)
  assert.equal(
    temCapability({ [CAP.BIBLIOTECA_LER_PUBLICOS]: false }, CAP.BIBLIOTECA_LER_PUBLICOS),
    false,
  )
  assert.equal(
    temCapability({ [CAP.BIBLIOTECA_LER_PUBLICOS]: true }, CAP.BIBLIOTECA_LER_PUBLICOS),
    true,
  )
})

test('capabilitiesParaLista retorna só as marcadas true, na ordem do enum', () => {
  const lista = capabilitiesParaLista({
    [CAP.BIBLIOTECA_LER_PRIVADOS]: true,
    [CAP.BIBLIOTECA_LER_PUBLICOS]: true,
    [CAP.USUARIOS_VER]: false,
  })
  assert.deepEqual(lista, [CAP.BIBLIOTECA_LER_PUBLICOS, CAP.BIBLIOTECA_LER_PRIVADOS])
})

// capabilitiesDoLegado permanece como gerador do mapa inicial dos perfis (seed).
test('capabilitiesDoLegado — encarregado (nível 1)', () => {
  const caps = capabilitiesDoLegado(1, false)
  assert.equal(caps[CAP.BIBLIOTECA_LER_PUBLICOS], true)
  assert.equal(caps[CAP.BIBLIOTECA_LER_PRIVADOS], false)
  assert.equal(caps[CAP.BIBLIOTECA_GERENCIAR_SETOR], false)
  assert.equal(caps[CAP.SOLICITACOES_CRIAR], true)
  assert.equal(caps[CAP.SOLICITACOES_VER_SETOR], false)
  assert.equal(caps[CAP.SOLICITACOES_AGIR_SETOR], false)
})

test('capabilitiesDoLegado — secretário de setor (nível 2)', () => {
  const caps = capabilitiesDoLegado(2, false)
  assert.equal(caps[CAP.BIBLIOTECA_LER_PRIVADOS], true)
  assert.equal(caps[CAP.BIBLIOTECA_GERENCIAR_SETOR], true)
  assert.equal(caps[CAP.BIBLIOTECA_GERENCIAR_GLOBAL], false)
  assert.equal(caps[CAP.SOLICITACOES_CRIAR], false)
  assert.equal(caps[CAP.SOLICITACOES_VER_SETOR], true)
  assert.equal(caps[CAP.SOLICITACOES_AGIR_SETOR], true)
})

test('capabilitiesDoLegado — secretário global (nível 2 + global)', () => {
  assert.equal(capabilitiesDoLegado(2, true)[CAP.BIBLIOTECA_GERENCIAR_GLOBAL], true)
})

test('TODAS_CAPABILITIES cobre as 10 capabilities oficiais', () => {
  assert.equal(TODAS_CAPABILITIES.length, 10)
})
