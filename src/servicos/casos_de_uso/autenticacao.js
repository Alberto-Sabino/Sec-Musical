// Casos de uso de autenticação e contexto operacional.
// Orquestram o repositório e aplicam as regras de experiência da Spec 02/09.
import {
  autenticar,
  encerrarSessao,
  obterDocumentoUsuario,
} from '@/servicos/repositorios/repositorioAutenticacao'

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
    comum_congregacao: documento.comum_congregacao || '',
    nivel_acesso: nivelAcesso,
    ativo: documento.ativo,
    ids_setor: idsSetor,
    ehAdmin,
  }

  return { ok: true, motivo: null, contexto }
}
