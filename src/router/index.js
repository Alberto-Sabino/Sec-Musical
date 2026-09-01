import { createRouter, createWebHistory } from 'vue-router'
import { registrarGuards } from './guards'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modulos/autenticacao/PaginaLogin.vue'),
  },
  {
    path: '/',
    name: 'inicio',
    component: () => import('@/app/PaginaInicial.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/biblioteca',
    name: 'biblioteca',
    component: () => import('@/modulos/biblioteca/PaginaBiblioteca.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/biblioteca/novo',
    name: 'arquivo-novo',
    component: () => import('@/modulos/admin/PaginaArquivoForm.vue'),
    meta: { requerAuth: true, requerAdmin: true },
  },
  {
    path: '/biblioteca/:id/editar',
    name: 'arquivo-editar',
    component: () => import('@/modulos/admin/PaginaArquivoForm.vue'),
    meta: { requerAuth: true, requerAdmin: true },
  },
  {
    path: '/solicitacoes',
    name: 'minhas-solicitacoes',
    component: () => import('@/modulos/solicitacoes/PaginaMinhasSolicitacoes.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/solicitacoes/nova',
    name: 'solicitacao-nova',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoForm.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/solicitacoes/:id',
    name: 'solicitacao-detalhe',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoDetalhe.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/solicitacoes/:id/editar',
    name: 'solicitacao-editar',
    component: () => import('@/modulos/solicitacoes/PaginaSolicitacaoForm.vue'),
    meta: { requerAuth: true },
  },
  {
    path: '/fila',
    name: 'fila-solicitacoes',
    component: () => import('@/modulos/admin/PaginaFilaSolicitacoes.vue'),
    meta: { requerAuth: true, requerAdmin: true },
  },
  {
    path: '/fila/:id',
    name: 'fila-detalhe',
    component: () => import('@/modulos/admin/PaginaFilaDetalhe.vue'),
    meta: { requerAuth: true, requerAdmin: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

registrarGuards(router)
