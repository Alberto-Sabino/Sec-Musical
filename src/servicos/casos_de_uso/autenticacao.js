// Casos de uso de autenticação e contexto operacional.
// Orquestram o repositório e aplicam as regras de experiência da Spec 02/09.
import {
  autenticar,
  encerrarSessao,
  obterDocumentoUsuario,
  enviarEmailRedefinicaoSenha,
  verificarCodigoRedefinicao,
  confirmarRedefinicaoSenha,
  atualizarSenhaUsuario,
} from '@/servicos/repositorios/repositorioAutenticacao'
import {
  validarEmailRecuperacao,
  validarAlteracaoSenha,
  validarNovaSenha,
} from '@/servicos/casos_de_uso/senha'

// Valores oficiais de nivel_acesso: 1 = usuário, 2 = admin.
export const NIVEL_USUARIO = 1
export const NIVEL_ADMIN = 2

// Realiza o login via Firebase Auth.
// Não carrega o contexto aqui; a restauração/observação de sessão dispara o carregamento.
export async function fazerLogin(email, senha) {
  const credencial = await autenticar(email, senha)
  return credencial.user
}

export function fazerLogout() {
  return encerrarSessao()
}

// Carrega o documento operacional e resolve o contexto do usuário.
// Regras (Spec 09 Lote 3):
// - sem documento operacional válido => não entra no fluxo operacional;
// - usuário inativo => não entra no fluxo operacional.
// Retorna { ok, motivo, contexto }.
export async function carregarContextoUsuario(idUsuario) {
  const documento = await obterDocumentoUsuario(idUsuario)

  if (!documento) {
    return { ok: false, motivo: 'sem_documento', contexto: null }
  }

  if (documento.ativo !== true) {
    return { ok: false, motivo: 'inativo', contexto: null }
  }

  const nivelAcesso = documento.nivel_acesso
  const idsSetor = Array.isArray(documento.ids_setor) ? documento.ids_setor : []
  const ehAdmin = nivelAcesso === NIVEL_ADMIN

  // Usuário comum precisa de exatamente um setor; admin precisa de ao menos um.
  if (idsSetor.length === 0) {
    return { ok: false, motivo: 'sem_setor', contexto: null }
  }

  const contexto = {
    id_usuario: documento.id_usuario,
    nome_completo: documento.nome_completo || '',
    email: documento.email || '',
    celular: documento.celular || '',
    comum_congregacao: documento.comum_congregacao || '',
    nivel_acesso: nivelAcesso,
    ativo: documento.ativo,
    ids_setor: idsSetor,
    ehAdmin,
  }

  return { ok: true, motivo: null, contexto }
}

// Valida o e-mail e dispara o e-mail de redefinição. A resposta de sucesso é
// neutra (anti-enumeração): não revela se o e-mail está cadastrado.
export async function solicitarRedefinicaoSenha(email) {
  const validacao = validarEmailRecuperacao(email)
  if (!validacao.ok) {
    return { ok: false, erro: validacao.erro }
  }

  try {
    await enviarEmailRedefinicaoSenha(email.trim())
    return { ok: true, erro: null }
  } catch (e) {
    const codigo = e?.code || ''
    // E-mail inexistente/inválido também retorna sucesso neutro (anti-enumeração).
    if (codigo === 'auth/user-not-found' || codigo === 'auth/invalid-email') {
      return { ok: true, erro: null }
    }
    return { ok: false, erro: 'Não foi possível enviar o e-mail. Tente novamente.' }
  }
}

// Valida os campos, reautentica e atualiza a senha do usuário logado.
export async function alterarSenha({ senhaAtual, novaSenha, confirmacao } = {}) {
  const validacao = validarAlteracaoSenha({ senhaAtual, novaSenha, confirmacao })
  if (!validacao.ok) {
    return { ok: false, erro: validacao.erro }
  }

  try {
    await atualizarSenhaUsuario(senhaAtual, novaSenha)
    return { ok: true, erro: null }
  } catch (e) {
    const codigo = e?.code || ''
    if (
      codigo === 'auth/wrong-password' ||
      codigo === 'auth/invalid-credential' ||
      codigo === 'auth/invalid-login-credentials'
    ) {
      return { ok: false, erro: 'Senha atual incorreta.' }
    }
    if (codigo === 'auth/too-many-requests') {
      return { ok: false, erro: 'Muitas tentativas. Tente novamente mais tarde.' }
    }
    if (codigo === 'auth/requires-recent-login') {
      return { ok: false, erro: 'Sessão expirada. Entre novamente para alterar a senha.' }
    }
    return { ok: false, erro: 'Não foi possível alterar a senha. Tente novamente.' }
  }
}

// Traduz códigos de oobCode inválido/expirado para uma mensagem genérica.
function mensagemCodigoInvalido(codigo) {
  if (
    codigo === 'auth/expired-action-code' ||
    codigo === 'auth/invalid-action-code' ||
    codigo === 'auth/user-disabled' ||
    codigo === 'auth/user-not-found'
  ) {
    return 'O link de redefinição é inválido ou expirou. Solicite um novo e-mail.'
  }
  return 'Não foi possível validar o link. Solicite um novo e-mail.'
}

// Redefinição via link — etapa 1: valida o código e retorna o e-mail alvo
// (exibição/confirmação). Retorna { ok, email, erro }.
export async function verificarLinkRedefinicao(oobCode) {
  if (!oobCode) {
    return { ok: false, email: null, erro: 'Link inválido. Solicite um novo e-mail.' }
  }

  try {
    const email = await verificarCodigoRedefinicao(oobCode)
    return { ok: true, email, erro: null }
  } catch (e) {
    return { ok: false, email: null, erro: mensagemCodigoInvalido(e?.code || '') }
  }
}

// Redefinição via link — etapa 2: valida os campos e efetiva a nova senha com o
// código (não exige sessão ativa). Retorna { ok, erro }.
export async function redefinirSenhaComCodigo({ oobCode, novaSenha, confirmacao } = {}) {
  const validacao = validarNovaSenha({ novaSenha, confirmacao })
  if (!validacao.ok) {
    return { ok: false, erro: validacao.erro }
  }
  if (!oobCode) {
    return { ok: false, erro: 'Link inválido. Solicite um novo e-mail.' }
  }

  try {
    await confirmarRedefinicaoSenha(oobCode, novaSenha)
    return { ok: true, erro: null }
  } catch (e) {
    const codigo = e?.code || ''
    if (codigo === 'auth/weak-password') {
      return { ok: false, erro: 'A senha é muito fraca. Escolha uma senha mais forte.' }
    }
    return { ok: false, erro: mensagemCodigoInvalido(codigo) }
  }
}
