// Evita que o usuário perca dados ao sair de um formulário sem salvar.
// A ideia é simples: cada tela com formulário registra, enquanto está montada,
// uma função que diz se há alteração pendente; ao desmontar, ela se remove.
// O guard de rota consulta esse registro e, se algo estiver pendente, mostra a
// modal de confirmação (nada de window.confirm) antes de deixar sair.
// Preferimos esse registro leve a uma store global só para isso.
import { reactive } from 'vue'
import { onBeforeUnmount } from 'vue'

const verificadores = new Set()

// verificador: () => boolean (true = há alteração pendente)
export function registrarGuardaFormulario(verificador) {
  verificadores.add(verificador)

  onBeforeUnmount(() => {
    verificadores.delete(verificador)
  })
}

export function existeFormularioSujo() {
  for (const verificar of verificadores) {
    try {
      if (verificar()) {
        return true
      }
    } catch {
      // um verificador com erro não deve travar a navegação
    }
  }

  return false
}

// Estado da modal de confirmação, consumido por App.vue.
export const confirmacaoSaida = reactive({
  aberta: false,
  _resolver: null,
})

// Resolve com true (Sair) ou false (Continuar aqui).
export function pedirConfirmacaoSaida() {
  return new Promise((resolver) => {
    confirmacaoSaida.aberta = true
    confirmacaoSaida._resolver = resolver
  })
}

export function responderConfirmacaoSaida(sair) {
  confirmacaoSaida.aberta = false

  const resolver = confirmacaoSaida._resolver
  confirmacaoSaida._resolver = null

  if (resolver) {
    resolver(sair === true)
  }
}
