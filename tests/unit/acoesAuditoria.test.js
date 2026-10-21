// Testes de unidade dos rótulos de auditoria de solicitações (Spec 21).
// node:test puro. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ACAO_AUDITORIA,
  rotuloAcaoAuditoria,
} from '../../src/enums/acoesAuditoria.js'

test('ANEXO_VISUALIZADO tem o valor canônico esperado', () => {
  assert.equal(ACAO_AUDITORIA.ANEXO_VISUALIZADO, 'anexo_visualizado')
})

test('rotuloAcaoAuditoria mapeia anexo_visualizado para "Anexo visualizado"', () => {
  assert.equal(rotuloAcaoAuditoria('anexo_visualizado'), 'Anexo visualizado')
})

test('rotuloAcaoAuditoria mapeia as demais ações conhecidas', () => {
  assert.equal(rotuloAcaoAuditoria(ACAO_AUDITORIA.CRIADA), 'Solicitação criada')
  assert.equal(rotuloAcaoAuditoria(ACAO_AUDITORIA.ANEXO_FINAL), 'Anexo final adicionado')
  assert.equal(rotuloAcaoAuditoria(ACAO_AUDITORIA.CONCLUIDA), 'Concluída')
})

test('rotuloAcaoAuditoria retorna a própria ação quando desconhecida', () => {
  assert.equal(rotuloAcaoAuditoria('acao_inexistente'), 'acao_inexistente')
})
