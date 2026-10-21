// Testes de extrairClaims (Spec 23 — hard cut). Rodar: npm run test:unit
// Claims finais: ativo, ids_setor, caps. Sem legado (nivel_acesso/admin_global).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CAP, ErroClaims, extrairClaims, capabilitiesParaLista } from '../../functions/claims.js'

function docBase(extra = {}) {
  return { ativo: true, ids_setor: ['cachoeira'], ...extra }
}

test('documento ausente lança not-found', () => {
  assert.throws(
    () => extrairClaims(null),
    (e) => e instanceof ErroClaims && e.code === 'not-found',
  )
  assert.throws(
    () => extrairClaims(undefined),
    (e) => e instanceof ErroClaims && e.code === 'not-found',
  )
})

test('ativo ausente ou não-booleano lança invalid-argument', () => {
  for (const ativo of [undefined, 'true', 1, null]) {
    assert.throws(
      () => extrairClaims(docBase({ ativo })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('ids_setor ausente, vazio ou não-array lança invalid-argument', () => {
  for (const ids of [undefined, [], 'cachoeira', null, {}]) {
    assert.throws(
      () => extrairClaims(docBase({ ids_setor: ids })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('ids_setor com item inválido (não-string ou vazio) lança invalid-argument', () => {
  for (const ids of [['cachoeira', ''], ['cachoeira', 123], ['']]) {
    assert.throws(
      () => extrairClaims(docBase({ ids_setor: ids })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('claims finais contêm apenas ativo, ids_setor e caps', () => {
  const claims = extrairClaims(
    docBase({ capabilities: { [CAP.BIBLIOTECA_LER_PUBLICOS]: true } }),
  )
  assert.deepEqual(Object.keys(claims).sort(), ['ativo', 'caps', 'ids_setor'])
  assert.equal(claims.ativo, true)
  assert.deepEqual(claims.ids_setor, ['cachoeira'])
})

test('caps deriva exclusivamente de capabilities (true entra, false/ausente não)', () => {
  const claims = extrairClaims(
    docBase({
      capabilities: {
        [CAP.BIBLIOTECA_LER_PUBLICOS]: true,
        [CAP.BIBLIOTECA_GERENCIAR_SETOR]: true,
        [CAP.BIBLIOTECA_LER_PRIVADOS]: false,
      },
    }),
  )
  assert.deepEqual(claims.caps, [CAP.BIBLIOTECA_LER_PUBLICOS, CAP.BIBLIOTECA_GERENCIAR_SETOR])
})

test('capabilities ausente => caps vazio', () => {
  assert.deepEqual(extrairClaims(docBase()).caps, [])
})

test('capability desconhecida não entra em caps (filtra pelo enum)', () => {
  const claims = extrairClaims(
    docBase({ capabilities: { capability_inexistente: true, [CAP.USUARIOS_VER]: true } }),
  )
  assert.deepEqual(claims.caps, [CAP.USUARIOS_VER])
})

test('capabilitiesParaLista ignora entradas não-true', () => {
  assert.deepEqual(capabilitiesParaLista({ [CAP.USUARIOS_VER]: 1, [CAP.USUARIOS_GERENCIAR]: true }), [
    CAP.USUARIOS_GERENCIAR,
  ])
  assert.deepEqual(capabilitiesParaLista(null), [])
  assert.deepEqual(capabilitiesParaLista(undefined), [])
})
