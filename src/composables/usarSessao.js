// Estado de sessão do app, num único lugar. Guarda o usuário autenticado, o
// contexto operacional resolvido (perfil, setores, comum congregação), o setor
// ativo e os estados de carregamento. As telas leem daqui em vez de falar com o
// Auth direto. É um reactive compartilhado no módulo — o app tem uma sessão só.
import { reactive, computed, readonly } from 'vue'
import { observarTokenId, obterClaims } from '@/servicos/repositorios/repositorioAutenticacao'
import {
  fazerLogin,
  fazerLogout,
  carregarContextoUsuario,
} from '@/servicos/casos_de_uso/autenticacao'
import { obterNomesSetores } from '@/servicos/repositorios/repositorioSetores'

const CHAVE_SETOR_ATIVO = 'portal_musical:setor_ativo'

const estado = reactive({
  // ciclo de vida da sessão
  inicializando: true, // aguardando primeira resposta do observador de auth
  carregandoContexto: false,
  autenticado: false,
  // dados
  usuarioAuth: null, // usuário do Firebase Auth
  contexto: null, // contexto operacional resolvido (ou null)
  claims: {}, // custom claims do ID token (Spec 17): nivel_acesso, ids_setor, ativo
  setorAtivo: null,
  nomesSetores: {}, // mapa { id_setor: nome } dos setores do usuário
  // erros de sessão
  erroContexto: null, // 'sem_documento' | 'inativo' | 'sem_setor'
})

let observadorIniciado = false

function lerSetorPersistido() {
  try {
    return localStorage.getItem(CHAVE_SETOR_ATIVO)
  } catch {
    return null
  }
}

function persistirSetor(idSetor) {
  try {
    if (!idSetor) {
      localStorage.removeItem(CHAVE_SETOR_ATIVO)
      return
    }
    localStorage.setItem(CHAVE_SETOR_ATIVO, idSetor)
  } catch {
    // ignora indisponibilidade de storage
  }
}

// Resolve o setor ativo:
// - usuário comum: sempre o seu único setor;
// - admin: setor persistido se ainda válido, senão o primeiro da lista.
function resolverSetorAtivo(contexto) {
  const setores = contexto.ids_setor
  if (!contexto.ehAdmin) {
    return setores[0]
  }
  const persistido = lerSetorPersistido()
  if (persistido && setores.includes(persistido)) {
    return persistido
  }
  return setores[0]
}

function limparSessao() {
  estado.autenticado = false
  estado.usuarioAuth = null
  estado.contexto = null
  estado.claims = {}
  estado.setorAtivo = null
  estado.nomesSetores = {}
  estado.erroContexto = null
}

async function aplicarUsuarioAuth(usuario) {
  if (!usuario) {
    limparSessao()
    persistirSetor(null)
    return
  }

  estado.usuarioAuth = usuario
  estado.carregandoContexto = true
  estado.erroContexto = null

  // Lê os custom claims do ID token (Spec 17). Não bloqueia a sessão se falhar;
  // o contexto do Firestore continua sendo a fonte do fluxo operacional.
  try {
    estado.claims = await obterClaims(usuario)
  } catch {
    estado.claims = {}
  }

  const resultado = await carregarContextoUsuario(usuario.uid)

  if (!resultado.ok) {
    // Autenticado, porém sem contexto operacional válido.
    estado.autenticado = false
    estado.contexto = null
    estado.setorAtivo = null
    estado.erroContexto = resultado.motivo
    estado.carregandoContexto = false
    // encerra a sessão de auth para não deixar credencial órfã
    await fazerLogout().catch(() => {})
    estado.usuarioAuth = null
    return
  }

  estado.contexto = resultado.contexto
  estado.setorAtivo = resolverSetorAtivo(resultado.contexto)
  persistirSetor(estado.setorAtivo)
  estado.autenticado = true
  estado.carregandoContexto = false

  // Carrega os nomes dos setores do usuário (exibição). Falha não bloqueia a sessão.
  try {
    estado.nomesSetores = await obterNomesSetores(resultado.contexto.ids_setor)
  } catch {
    estado.nomesSetores = {}
  }
}

// Inicia o observador de sessão uma única vez (chamado no bootstrap do app).
// Usa onIdTokenChanged (Spec 17): reage a sign-in/out E a refresh de token/claims,
// mantendo `estado.claims` em dia quando os custom claims mudam.
function iniciarObservadorSessao() {
  if (observadorIniciado) {
    return
  }
  observadorIniciado = true
  observarTokenId(async (usuario) => {
    await aplicarUsuarioAuth(usuario)
    estado.inicializando = false
  })
}

async function login(email, senha) {
  // O carregamento do contexto ocorre pelo observador de sessão.
  await fazerLogin(email, senha)
}

async function logout() {
  await fazerLogout()
  // limpeza efetiva ocorre no observador (usuario = null)
}

// Define o setor ativo do admin (um por vez), validando contra os setores permitidos.
function definirSetorAtivo(idSetor) {
  const contexto = estado.contexto
  if (!contexto || !contexto.ehAdmin) {
    return false
  }
  if (!contexto.ids_setor.includes(idSetor)) {
    return false
  }
  estado.setorAtivo = idSetor
  persistirSetor(idSetor)
  return true
}

export function usarSessao() {
  const nomeSetor = (idSetor) => estado.nomesSetores[idSetor] || idSetor || '—'

  return {
    estado: readonly(estado),
    // derivados (contexto do Firestore — fonte do fluxo operacional)
    ehAdmin: computed(() => estado.contexto?.ehAdmin === true),
    // Governança global (Spec 18): prioriza o claim (fonte das rules); cai para o
    // contexto do Firestore quando o claim ainda não foi sincronizado.
    ehAdminGlobal: computed(
      () =>
        (estado.claims?.nivel_acesso === 2 && estado.claims?.admin_global === true) ||
        estado.contexto?.admin_global === true,
    ),
    setoresDisponiveis: computed(() => estado.contexto?.ids_setor || []),
    // derivados dos custom claims (Spec 17) — fonte usada pelas Storage Rules
    claims: computed(() => estado.claims || {}),
    ehAdminClaim: computed(() => estado.claims?.nivel_acesso === 2),
    idsSetorClaim: computed(() => estado.claims?.ids_setor || []),
    ativoClaim: computed(() => estado.claims?.ativo === true),
    // opções { valor, rotulo } para selects de setor (rótulo = nome do setor)
    opcoesSetor: computed(() =>
      (estado.contexto?.ids_setor || []).map((id) => ({
        valor: id,
        rotulo: nomeSetor(id),
      })),
    ),
    // nome do setor ativo para exibição
    nomeSetorAtivo: computed(() => nomeSetor(estado.setorAtivo)),
    nomeSetor,
    // ações
    iniciarObservadorSessao,
    login,
    logout,
    definirSetorAtivo,
  }
}
