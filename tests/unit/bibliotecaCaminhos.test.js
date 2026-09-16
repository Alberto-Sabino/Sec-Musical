// Testes de unidade da lógica de caminho/extensão da Biblioteca (Spec 14).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  montarIdNuvem,
  inferirExtensao,
} from '../../src/servicos/casos_de_uso/bibliotecaCaminhos.js'

test('montarIdNuvem usa nivel_1 para público e nivel_2 para restrito', () => {
  assert.equal(
    montarIdNuvem({ idSetor: 'cachoeira', nivelAcesso: 1, idArquivo: 'a1', extensao: 'pdf' }),
    'biblioteca/cachoeira/nivel_1/a1.pdf',
  )
  assert.equal(
    montarIdNuvem({ idSetor: 'queluz', nivelAcesso: 2, idArquivo: 'a2', extensao: 'xlsx' }),
    'biblioteca/queluz/nivel_2/a2.xlsx',
  )
})

test('montarIdNuvem respeita a extensão real informada', () => {
  const caminho = montarIdNuvem({
    idSetor: 's',
    nivelAcesso: 1,
    idArquivo: 'id',
    extensao: 'xlsx',
  })
  assert.ok(caminho.endsWith('.xlsx'))
})

test('inferirExtensao prioriza o campo persistido', () => {
  assert.equal(inferirExtensao({ extensao_arquivo: 'XLSX', id_nuvem: 'x/y/z.pdf' }), 'xlsx')
})

test('inferirExtensao faz parse do id_nuvem quando não há campo', () => {
  assert.equal(inferirExtensao({ id_nuvem: 'biblioteca/s/nivel_1/abc.xlsx' }), 'xlsx')
  assert.equal(inferirExtensao({ id_nuvem: 'biblioteca/s/nivel_2/abc.pdf' }), 'pdf')
})

test('inferirExtensao usa fallback pdf quando não é possível inferir', () => {
  assert.equal(inferirExtensao({}), 'pdf')
  assert.equal(inferirExtensao({ id_nuvem: 'sem-extensao' }), 'pdf')
  assert.equal(inferirExtensao(null), 'pdf')
})
