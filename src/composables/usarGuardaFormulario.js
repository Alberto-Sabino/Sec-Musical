// Guarda de saída para formulários com alteração pendente (Spec 13).
// Sem store global: a página registra uma função "está sujo?" enquanto montada
// e a remove ao desmontar. O guard global de rota consulta esse registro e,
// se houver alteração pendente, pede confirmação via modal customizada
// (não usar window.confirm) antes de trocar de rota.
import { reactive } from 'vue'
import { onBeforeUnmount } from 'vue'

// Registro de verificadores ativos (não é store reativa; é um Set de checagens).
const verificadores = new Set()

// Registra a função de verificação da página atual e agenda sua remoção no unmount.
// verificador: () => boolean  (true = há alteração pendente)
export function registrarGuardaFormulario(verificador) {
  verificadores.add(verificador)
  onBeforeUnmount(() => {
    verificadores.delete(verificador)
  })
}

// Indica se alguma página montada tem alteração pendente.
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

// Estado reativo da modal de confirmação de saída (consumido por App.vue).
export const confirmacaoSaida = reactive({
  aberta: false,
  // resolve pendente da Promise de confirmação
  _resolver: null,
})

// Abre a modal e resolve com true (Sair) ou false (Continuar aqui).
// Retorna uma Promise<boolean>.
export function pedirConfirmacaoSaida() {
  return new Promise((resolver) => {
    confirmacaoSaida.aberta = true
    confirmacaoSaida._resolver = resolver
  })
}

// Responde à modal (chamado pelos botões em App.vue).
export function responderConfirmacaoSaida(sair) {
  confirmacaoSaida.aberta = false
  const resolver = confirmacaoSaida._resolver
  confirmacaoSaida._resolver = null
  if (resolver) {
    resolver(sair === true)
  }
}
