// Fonte única de regras de upload do projeto (Specs 14 e 15).
// Não duplicar formatos/limites em componentes, casos de uso ou infraestrutura.

const MB = 1024 * 1024

// Extensões e MIME types aceitos, por formato.
const FORMATOS = {
  pdf: {
    extensao: 'pdf',
    mime: 'application/pdf',
  },
  xlsx: {
    extensao: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
}

// Regras do módulo Biblioteca: PDF e XLSX; 2 MB padrão; exceção `metodos` = 50 MB.
const BIBLIOTECA = {
  formatos: [FORMATOS.pdf, FORMATOS.xlsx],
  limitePadraoBytes: 2 * MB,
  excecoesPorTipo: {
    metodos: 50 * MB,
  },
}

// Regras do módulo Solicitações: apenas PDF; 2 MB; sem exceção.
const SOLICITACOES = {
  formatos: [FORMATOS.pdf],
  limitePadraoBytes: 2 * MB,
  excecoesPorTipo: {},
}

// Extensão normalizada (minúscula, sem ponto) a partir do nome do arquivo.
export function extensaoDoNome(nome) {
  if (!nome || typeof nome !== 'string') {
    return ''
  }
  const ponto = nome.lastIndexOf('.')
  if (ponto < 0) {
    return ''
  }
  return nome.slice(ponto + 1).toLowerCase()
}

// Limite aplicável na Biblioteca conforme o tipo selecionado.
export function limiteBibliotecaBytes(tipo) {
  return BIBLIOTECA.excecoesPorTipo[tipo] ?? BIBLIOTECA.limitePadraoBytes
}

// Limite fixo do anexo final de Solicitações.
export function limiteSolicitacoesBytes() {
  return SOLICITACOES.limitePadraoBytes
}

// Extensões aceitas por módulo (para atributo accept e validação).
export function extensoesBiblioteca() {
  return BIBLIOTECA.formatos.map((f) => f.extensao)
}
export function extensoesSolicitacoes() {
  return SOLICITACOES.formatos.map((f) => f.extensao)
}

// Atributo `accept` de <input type=file> por módulo.
export function acceptBiblioteca() {
  return BIBLIOTECA.formatos.map((f) => `.${f.extensao}`).join(',')
}
export function acceptSolicitacoes() {
  return SOLICITACOES.formatos.map((f) => `.${f.extensao}`).join(',')
}

// Valida um arquivo da Biblioteca conforme o tipo. Retorna { ok, erro }.
export function validarArquivoBiblioteca(arquivo, tipo) {
  if (!arquivo) {
    return { ok: false, erro: 'Selecione um arquivo.' }
  }
  const ext = extensaoDoNome(arquivo.name)
  if (!extensoesBiblioteca().includes(ext)) {
    return { ok: false, erro: 'Formato não aceito. Envie PDF ou XLSX.' }
  }
  const limite = limiteBibliotecaBytes(tipo)
  if (arquivo.size > limite) {
    return { ok: false, erro: `Arquivo acima do limite de ${limite / MB} MB.` }
  }
  return { ok: true, erro: '' }
}

// Valida o anexo final de Solicitações (PDF, 2 MB). Retorna { ok, erro }.
export function validarAnexoSolicitacao(arquivo) {
  if (!arquivo) {
    return { ok: false, erro: 'Selecione um arquivo.' }
  }
  const ext = extensaoDoNome(arquivo.name)
  if (!extensoesSolicitacoes().includes(ext)) {
    return { ok: false, erro: 'Formato não aceito. Envie um PDF.' }
  }
  const limite = limiteSolicitacoesBytes()
  if (arquivo.size > limite) {
    return { ok: false, erro: `Arquivo acima do limite de ${limite / MB} MB.` }
  }
  return { ok: true, erro: '' }
}

// Texto de hint da Biblioteca conforme o tipo selecionado.
export function hintBiblioteca(tipo) {
  const limite = limiteBibliotecaBytes(tipo)
  return `PDF ou XLSX · Max: ${limite / MB} MB`
}

// Texto de hint do anexo de Solicitações.
export function hintSolicitacoes() {
  const limite = limiteSolicitacoesBytes()
  return `PDF · Max: ${limite / MB} MB`
}
