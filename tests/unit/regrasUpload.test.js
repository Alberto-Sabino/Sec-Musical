// Testes de unidade das regras de upload (Specs 14/15).
// node:test puro, sem dependências novas e sem emulador. Rodar: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  extensaoDoNome,
  limiteBibliotecaBytes,
  limiteSolicitacoesBytes,
  acceptBiblioteca,
  acceptSolicitacoes,
  validarArquivoBiblioteca,
  validarAnexoSolicitacao,
} from '../../src/servicos/casos_de_uso/regrasUpload.js'

const MB = 1024 * 1024
// Stub mínimo de File: a validação só lê name e size.
const arquivo = (name, size) => ({ name, size })

test('extensaoDoNome normaliza para minúsculo e sem ponto', () => {
  assert.equal(extensaoDoNome('Relatorio.PDF'), 'pdf')
  assert.equal(extensaoDoNome('planilha.XLSX'), 'xlsx')
  assert.equal(extensaoDoNome('arquivo.tar.gz'), 'gz')
  assert.equal(extensaoDoNome('sem_extensao'), '')
  assert.equal(extensaoDoNome(''), '')
  assert.equal(extensaoDoNome(null), '')
})

test('limite da Biblioteca: 2 MB padrão e 50 MB para metodos', () => {
  assert.equal(limiteBibliotecaBytes('circulares'), 2 * MB)
  assert.equal(limiteBibliotecaBytes('provas'), 2 * MB)
  assert.equal(limiteBibliotecaBytes('metodos'), 50 * MB)
  // tipo desconhecido cai no padrão
  assert.equal(limiteBibliotecaBytes('inexistente'), 2 * MB)
})

test('limite de Solicitações é fixo em 2 MB', () => {
  assert.equal(limiteSolicitacoesBytes(), 2 * MB)
})

test('accept da Biblioteca inclui pdf e xlsx; Solicitações só pdf', () => {
  assert.equal(acceptBiblioteca(), '.pdf,.xlsx')
  assert.equal(acceptSolicitacoes(), '.pdf')
})

test('validarArquivoBiblioteca aceita PDF e XLSX dentro do limite', () => {
  assert.deepEqual(validarArquivoBiblioteca(arquivo('a.pdf', 1 * MB), 'circulares'), {
    ok: true,
    erro: '',
  })
  assert.deepEqual(validarArquivoBiblioteca(arquivo('a.xlsx', 1 * MB), 'modelos'), {
    ok: true,
    erro: '',
  })
})

test('validarArquivoBiblioteca rejeita formato não aceito', () => {
  const r = validarArquivoBiblioteca(arquivo('imagem.png', 1000), 'circulares')
  assert.equal(r.ok, false)
  assert.match(r.erro, /Formato/)
})

test('validarArquivoBiblioteca aplica exceção de 50 MB apenas para metodos', () => {
  // 10 MB: reprovado em circulares (limite 2 MB), aprovado em metodos (50 MB)
  assert.equal(validarArquivoBiblioteca(arquivo('grande.pdf', 10 * MB), 'circulares').ok, false)
  assert.equal(validarArquivoBiblioteca(arquivo('metodo.pdf', 10 * MB), 'metodos').ok, true)
  // 51 MB: reprovado até em metodos
  assert.equal(validarArquivoBiblioteca(arquivo('enorme.pdf', 51 * MB), 'metodos').ok, false)
})

test('validarArquivoBiblioteca sem arquivo retorna erro', () => {
  assert.equal(validarArquivoBiblioteca(null, 'circulares').ok, false)
})

test('validarAnexoSolicitacao aceita apenas PDF até 2 MB', () => {
  assert.equal(validarAnexoSolicitacao(arquivo('resp.pdf', 1 * MB)).ok, true)
  // xlsx não é aceito em Solicitações
  assert.equal(validarAnexoSolicitacao(arquivo('resp.xlsx', 1000)).ok, false)
  // acima de 2 MB reprova
  assert.equal(validarAnexoSolicitacao(arquivo('resp.pdf', 3 * MB)).ok, false)
  // sem arquivo reprova
  assert.equal(validarAnexoSolicitacao(null).ok, false)
})
