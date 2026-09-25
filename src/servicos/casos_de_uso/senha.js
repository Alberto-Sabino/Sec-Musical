// Regras puras de validação e mensagens para os fluxos de senha.
// Fonte única das regras de criação de senha: as três telas (recuperar, alterar
// e redefinir) validam por aqui. Sem dependência de Vue/Firebase (testável por
// unidade com node:test).

// Comprimento mínimo alinhado ao Firebase Authentication.
export const TAMANHO_MINIMO_SENHA = 6

// Exige algo@algo.dominio; não valida existência.
const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mensagens centralizadas, reaproveitadas entre os fluxos.
const MENSAGENS = {
  emailObrigatorio: 'Informe o e-mail.',
  emailInvalido: 'Informe um e-mail válido.',
  camposObrigatorios: 'Preencha todos os campos.',
  senhaCurta: `A nova senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`,
  confirmacaoDivergente: 'A nova senha e a confirmação não coincidem.',
  senhaIgualAtual: 'A nova senha deve ser diferente da atual.',
}

const OK = { ok: true, erro: null }

function falha(erro) {
  return { ok: false, erro }
}

function texto(valor) {
  return typeof valor === 'string' ? valor : ''
}

export function emailValido(email) {
  return PADRAO_EMAIL.test(texto(email).trim())
}

// Regra central da nova senha: preenchimento, comprimento mínimo e confirmação.
// Compartilhada pelos fluxos de alteração e redefinição.
function validarParNovaSenha(nova, confirma) {
  if (!nova || !confirma) {
    return falha(MENSAGENS.camposObrigatorios)
  }
  if (nova.length < TAMANHO_MINIMO_SENHA) {
    return falha(MENSAGENS.senhaCurta)
  }
  if (nova !== confirma) {
    return falha(MENSAGENS.confirmacaoDivergente)
  }
  return OK
}

// Fluxo "Esqueci minha senha": valida o e-mail informado.
export function validarEmailRecuperacao(email) {
  const valor = texto(email).trim()

  if (!valor) {
    return falha(MENSAGENS.emailObrigatorio)
  }
  if (!emailValido(valor)) {
    return falha(MENSAGENS.emailInvalido)
  }
  return OK
}

// Fluxo "Alterar senha" (logado): par de nova senha + senha atual preenchida e
// diferente da nova.
export function validarAlteracaoSenha({ senhaAtual, novaSenha, confirmacao } = {}) {
  const atual = texto(senhaAtual)
  const nova = texto(novaSenha)
  const confirma = texto(confirmacao)

  if (!atual) {
    return falha(MENSAGENS.camposObrigatorios)
  }

  const resultado = validarParNovaSenha(nova, confirma)
  if (!resultado.ok) {
    return resultado
  }

  if (nova === atual) {
    return falha(MENSAGENS.senhaIgualAtual)
  }
  return OK
}

// Fluxo "Redefinir senha" (via link do e-mail): apenas o par de nova senha,
// pois o usuário esqueceu a senha atual.
export function validarNovaSenha({ novaSenha, confirmacao } = {}) {
  return validarParNovaSenha(texto(novaSenha), texto(confirmacao))
}
