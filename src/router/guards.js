// Guards de rota: autenticação e papel.
// Usam o estado reativo da sessão e aguardam a inicialização do observador de auth.
import { watch } from 'vue'
import { usarSessao } from '@/composables/usarSessao'
import { existeFormularioSujo, pedirConfirmacaoSaida } from '@/composables/usarGuardaFormulario'

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
    const requerAdmin = para.meta?.requerAdmin === true

    // Rota de login: se já autenticado com contexto válido, redireciona ao início.
    if (para.name === 'login') {
      return estado.autenticado ? { name: 'inicio' } : true
    }

    if (requerAuth && !estado.autenticado) {
      return { name: 'login' }
    }

    if (requerAdmin && estado.contexto?.ehAdmin !== true) {
      // Usuário sem papel de admin não acessa rota administrativa.
      return { name: 'inicio' }
    }

    return true
  })
}
