// Testes de extrairClaims (Spec 17 + Spec 18). Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NIVEL_USUARIO, NIVEL_ADMIN, ErroClaims, extrairClaims } from '../../functions/claims.js'

function docAdmin(extra = {}) {
  return { ativo: true, nivel_acesso: NIVEL_ADMIN, ids_setor: ['cachoeira'], ...extra }
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
      () => extrairClaims(docAdmin({ ativo })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('nivel_acesso fora de {1,2} lança invalid-argument', () => {
  for (const nivel of [undefined, 0, 3, '2', null]) {
    assert.throws(
      () => extrairClaims(docAdmin({ nivel_acesso: nivel })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('ids_setor ausente, vazio ou não-array lança invalid-argument', () => {
  for (const ids of [undefined, [], 'cachoeira', null, {}]) {
    assert.throws(
      () => extrairClaims(docAdmin({ ids_setor: ids })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('ids_setor com item inválido (não-string ou vazio) lança invalid-argument', () => {
  for (const ids of [['cachoeira', ''], ['cachoeira', 123], ['']]) {
    assert.throws(
      () => extrairClaims(docAdmin({ ids_setor: ids })),
      (e) => e instanceof ErroClaims && e.code === 'invalid-argument',
    )
  }
})

test('usuário comum (nível 1) válido: admin_global sempre false', () => {
  const claims = extrairClaims({
    ativo: true,
    nivel_acesso: NIVEL_USUARIO,
    ids_setor: ['cachoeira'],
    admin_global: true,
  })
  assert.deepEqual(claims, {
    ativo: true,
    nivel_acesso: 1,
    ids_setor: ['cachoeira'],
    admin_global: false,
  })
})

test('admin (nível 2) sem admin_global: default false', () => {
  const claims = extrairClaims(docAdmin())
  assert.equal(claims.admin_global, false)
})

test('admin (nível 2) com admin_global=true: preserva true', () => {
  const claims = extrairClaims(docAdmin({ admin_global: true, ids_setor: ['a', 'b'] }))
  assert.deepEqual(claims, {
    ativo: true,
    nivel_acesso: 2,
    ids_setor: ['a', 'b'],
    admin_global: true,
  })
})

test('admin_global só vira true com o booleano literal true (não truthy)', () => {
  for (const v of [1, 'true', {}]) {
    assert.equal(extrairClaims(docAdmin({ admin_global: v })).admin_global, false)
  }
})
