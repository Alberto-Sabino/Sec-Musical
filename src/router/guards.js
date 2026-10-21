// Guardas de rota do app. Cuidam de quatro coisas antes de cada navegação:
// (1) se há formulário com alteração pendente, pede confirmação para sair;
// (2) espera a sessão terminar de inicializar (o observador do Auth);
// (3) barra acesso a rotas que exigem login; durante o primeiro acesso, só libera
//     alterar-senha e perfil (Spec 20);
// (4) barra rotas que exigem uma capability que o usuário não tem (Spec 22).
import { watch } from 'vue'
import { usarSessao } from '@/composables/usarSessao'
import { existeFormularioSujo, pedirConfirmacaoSaida } from '@/composables/usarGuardaFormulario'
import { dispararEvento } from '@/servicos/firebase/analytics'
import { EVENTO_ACESSO_TELA } from '@/enums/eventosAnalytics'
import { parametrosEventoTela } from '@/servicos/casos_de_uso/analyticsNavegacao'
import { avaliarPrimeiroAcesso } from './primeiroAcesso'
import { temCapability } from '@/enums/capabilities'

const { estado, iniciarObservadorSessao } = usarSessao()

// Garante que o observador esteja ativo e resolve quando a sessão terminar de inicializar.
function aguardarInicializacao() {
  iniciarObservadorSessao()
  if (!estado.inicializando) {
    return Promise.resolve()
  }
  return new Promise((resolver) => {
    const parar = watch(
      () => estado.inicializando,
      (inicializando) => {
        if (!inicializando) {
          parar()
          resolver()
        }
      },
    )
  })
}

// Registra as guardas globais no router.
export function registrarGuards(router) {
  router.beforeEach(async (para, de) => {
    // Proteção de saída: se a rota realmente muda e há formulário sujo, confirmar
    // via modal customizada (não window.confirm).
    const mudouRota = para.name !== de.name || para.fullPath !== de.fullPath
    if (mudouRota && existeFormularioSujo()) {
      const podeSair = await pedirConfirmacaoSaida()
      if (!podeSair) {
        return false
      }
    }

    await aguardarInicializacao()

    const requerAuth = para.meta?.requerAuth === true
    const requerCapability = para.meta?.requerCapability || null

    // Rota de login: se já autenticado com contexto válido, redireciona ao início.
    if (para.name === 'login') {
      return estado.autenticado ? { name: 'inicio' } : true
    }

    if (requerAuth && !estado.autenticado) {
      return { name: 'login' }
    }

    // Primeiro acesso (Spec 20): enquanto primeiro_acesso == true, só libera
    // alterar-senha e perfil; qualquer outra rota autenticada vai para alterar-senha.
    if (estado.autenticado && estado.contexto?.primeiro_acesso === true) {
      const decisao = avaliarPrimeiroAcesso(para.name, true)
      if (!decisao.permitido) {
        return { name: decisao.redirect }
      }
    }

    if (requerCapability && !temCapability(estado.contexto?.capabilities, requerCapability)) {
      // Sem a capability exigida pela rota: volta ao início (Spec 22).
      return { name: 'inicio' }
    }

    return true
  })

  // Analytics: após cada navegação, dispara EVENTO_ACESSO_TELA com { tela,
  // origem, destino }. Não bloqueia a navegação.
  router.afterEach((para, de) => {
    const tela = para.meta?.tela
    if (!tela) {
      return
    }

    dispararEvento(EVENTO_ACESSO_TELA, parametrosEventoTela(tela, para, de))
  })
}
