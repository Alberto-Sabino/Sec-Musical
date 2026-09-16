// Testes de unidade dos helpers de formatação (Specs 14/15).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatarData,
  formatarDataHora,
  formatarTamanho,
} from '../../src/servicos/casos_de_uso/formato.js'

const MB = 1024 * 1024

test('formatarData aceita Date e Firestore Timestamp (via toDate)', () => {
  const data = new Date('2026-03-15T10:00:00')
  assert.equal(formatarData(data), '15/03/2026')

  const timestampFalso = { toDate: () => new Date('2026-12-01T00:00:00') }
  assert.equal(formatarData(timestampFalso), '01/12/2026')
})

test('formatarData retorna — para valores vazios ou inválidos', () => {
  assert.equal(formatarData(null), '—')
  assert.equal(formatarData(undefined), '—')
  assert.equal(formatarData('data-invalida'), '—')
})

test('formatarDataHora inclui hora e minuto', () => {
  const data = new Date('2026-03-15T13:45:00')
  const saida = formatarDataHora(data)
  assert.match(saida, /15\/03\/2026/)
  assert.match(saida, /13:45/)
})

test('formatarDataHora retorna — para vazio/inválido', () => {
  assert.equal(formatarDataHora(null), '—')
  assert.equal(formatarDataHora('x'), '—')
})

test('formatarTamanho converte bytes em MB com vírgula', () => {
  assert.equal(formatarTamanho(2 * MB), '2,0 MB')
  assert.equal(formatarTamanho(1.5 * MB), '1,5 MB')
})

test('formatarTamanho trata valores muito pequenos', () => {
  assert.equal(formatarTamanho(1000), '< 0,1 MB')
  assert.equal(formatarTamanho(0), '< 0,1 MB')
})

test('formatarTamanho retorna — para legados sem tamanho_bytes', () => {
  assert.equal(formatarTamanho(null), '—')
  assert.equal(formatarTamanho(undefined), '—')
  assert.equal(formatarTamanho('abc'), '—')
})
