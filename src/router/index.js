// Mapa de rotas do app. Cada rota tem um `name` estável — é por esse nome que a
// navegação e o mapa de módulo ativo (usarNavegacaoModulos) se orientam, então
// evite renomear sem necessidade. `meta.requerAuth`/`requerAdmin` são lidos pelas
// guardas em guards.js.
import { createRouter, createWebHistory } from 'vue-router'
import { registrarGuards } from './guards'
import { TELAS } from '../enums/eventosAnalytics'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modulos/autenticacao/PaginaLogin.vue'),
    meta: { tela: TELAS.LOGIN }
  },
  {
    path: '/esqueci-senha',
    name: 'esqueci-senha',
    component: () => import('@/modulos/autenticacao/PaginaEsqueciSenha.vue'),
    meta: { tela: TELAS.ESQUECI_SENHA }
  },
  {
    path: '/redefinir-senha',
    name: 'redefinir-senha',
    component: () => import('@/modulos/autenticacao/PaginaRedefinirSenha.vue'),
    meta: { tela: TELAS.REDEFINIR_SENHA }
  },
  {
    path: '/alterar-senha',
    name: 'alterar-senha',
    component: () => import('@/modulos/autenticacao/PaginaAlterarSenha.vue'),
    meta: { requerAuth: true, tela: TELAS.ALTERAR_SENHA },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/modulos/autenticacao/PaginaPerfil.vue'),
    meta: { requerAuth: true, tela: TELAS.PERFIL },
  },
  {
    path: '/',
    name: 'inicio',
    component: () => import('@/app/PaginaInicial.vue'),
    meta: { requerAuth: true, tela: TELAS.INICIO },
  },
  {
    path: '/biblioteca',
    name: 'biblioteca',
    component: () => import('@/modulos/biblioteca/PaginaBiblioteca.vue'),
    meta: { requerAuth: true, tela: TELAS.BIBLIOTECA },
  },
  {
    path: '/biblioteca/tipo/:tipo',
    name: 'biblioteca-tipo',
    component: () => import('@/modulos/biblioteca/PaginaBibliotecaTipo.vue'),
    meta: { requerAuth: true, tela: TELAS.BIBLIOTECA_TIPO },
  },
  {
    path: '/biblioteca/busca',
    name: 'biblioteca-busca',
    component: () => import('@/modulos/biblioteca/PaginaBibliotecaBusca.vue'),
    meta: { requerAuth: true, tela: TELAS.BIBLIOTECA_BUSCA },
  },
  {
    path: '/biblioteca/novo',
    name: 'arquivo-novo',
    component: () => import('@/modulos/admin/PaginaArquivoForm.vue'),
    meta: { requerAuth: true, requerAdmin: true, tela: TELAS.ARQUIVO_NOVO },
  },
  {
    path: '/biblioteca/:id/editar',
    name: 'arquivo-editar',
    component: () => import('@/modulos/admin/PaginaArquivoForm.vue'),
    meta: { requerAuth: true, requerAdmin: true, tela: TELAS.ARQUIVO_EDITAR },
  },
  {
    path: '/solicitacoes',
    name: 'minhas-solicitacoes',
    component: () => import('@/modulos/solicitacoes/PaginaMinhasSolicitacoes.vue'),
    meta: { requerAuth: true, tela: TELAS.MINHAS_SOLICITACOES },
  },
  {
    path: '/solicitacoes/nova',
    name: 'solicitacao-nova',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoForm.vue'),
    meta: { requerAuth: true, tela: TELAS.SOLICITACAO_NOVA },
  },
  {
    path: '/solicitacoes/:id',
    name: 'solicitacao-detalhe',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue'),
    meta: { requerAuth: true, tela: TELAS.SOLICITACAO_DETALHE },
  },
  {
    path: '/solicitacoes/:id/editar',
    name: 'solicitacao-editar',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoForm.vue'),
    meta: { requerAuth: true, tela: TELAS.SOLICITACAO_EDITAR },
  },
  {
    path: '/fila',
    name: 'fila-solicitacoes',
    component: () => import('@/modulos/admin/PaginaFilaSolicitacoes.vue'),
    meta: { requerAuth: true, requerAdmin: true, tela: TELAS.FILA_SOLICITACOES },
  },
  {
    path: '/fila/:id',
    name: 'fila-detalhe',
    component: () => import('@/modulos/admin/PaginaFilaDetalhe.vue'),
    meta: { requerAuth: true, requerAdmin: true, tela: TELAS.FILA_DETALHE },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

registrarGuards(router)
