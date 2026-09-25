// Testes de unidade das regras puras de senha (validação e mensagens).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  emailValido,
  validarEmailRecuperacao,
  validarAlteracaoSenha,
  validarNovaSenha,
  TAMANHO_MINIMO_SENHA,
} from '../../src/servicos/casos_de_uso/senha.js'

test('emailValido aceita formatos comuns e rejeita inválidos', () => {
  assert.equal(emailValido('usuario@exemplo.com'), true)
  assert.equal(emailValido('  usuario@exemplo.com  '), true)
  assert.equal(emailValido('sem-arroba.com'), false)
  assert.equal(emailValido('sem@dominio'), false)
  assert.equal(emailValido('com espaco@exemplo.com'), false)
  assert.equal(emailValido(''), false)
  assert.equal(emailValido(null), false)
})

test('validarEmailRecuperacao exige campo preenchido', () => {
  const r = validarEmailRecuperacao('   ')
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'Informe o e-mail.')
})

test('validarEmailRecuperacao exige formato válido', () => {
  const r = validarEmailRecuperacao('invalido')
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'Informe um e-mail válido.')
})

test('validarEmailRecuperacao aceita e-mail válido (com trim)', () => {
  const r = validarEmailRecuperacao('  usuario@exemplo.com ')
  assert.deepEqual(r, { ok: true, erro: null })
})

test('validarAlteracaoSenha exige todos os campos', () => {
  const r = validarAlteracaoSenha({ senhaAtual: 'atual1', novaSenha: '', confirmacao: '' })
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'Preencha todos os campos.')
})

test('validarAlteracaoSenha aplica comprimento mínimo', () => {
  const r = validarAlteracaoSenha({ senhaAtual: 'atual1', novaSenha: '123', confirmacao: '123' })
  assert.equal(r.ok, false)
  assert.match(r.erro, new RegExp(String(TAMANHO_MINIMO_SENHA)))
})

test('validarAlteracaoSenha exige confirmação coincidente', () => {
  const r = validarAlteracaoSenha({
    senhaAtual: 'atual1',
    novaSenha: 'novasenha',
    confirmacao: 'outrasenha',
  })
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'A nova senha e a confirmação não coincidem.')
})

test('validarAlteracaoSenha exige nova senha diferente da atual', () => {
  const r = validarAlteracaoSenha({
    senhaAtual: 'mesma123',
    novaSenha: 'mesma123',
    confirmacao: 'mesma123',
  })
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'A nova senha deve ser diferente da atual.')
})

test('validarAlteracaoSenha aceita entrada válida', () => {
  const r = validarAlteracaoSenha({
    senhaAtual: 'atual123',
    novaSenha: 'novasenha',
    confirmacao: 'novasenha',
  })
  assert.deepEqual(r, { ok: true, erro: null })
})

test('validarNovaSenha exige ambos os campos', () => {
  const r = validarNovaSenha({ novaSenha: 'novasenha', confirmacao: '' })
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'Preencha todos os campos.')
})

test('validarNovaSenha aplica comprimento mínimo', () => {
  const r = validarNovaSenha({ novaSenha: '123', confirmacao: '123' })
  assert.equal(r.ok, false)
  assert.match(r.erro, new RegExp(String(TAMANHO_MINIMO_SENHA)))
})

test('validarNovaSenha exige confirmação coincidente', () => {
  const r = validarNovaSenha({ novaSenha: 'novasenha', confirmacao: 'outrasenha' })
  assert.equal(r.ok, false)
  assert.equal(r.erro, 'A nova senha e a confirmação não coincidem.')
})

test('validarNovaSenha aceita entrada válida (sem exigir senha atual)', () => {
  const r = validarNovaSenha({ novaSenha: 'novasenha', confirmacao: 'novasenha' })
  assert.deepEqual(r, { ok: true, erro: null })
})
