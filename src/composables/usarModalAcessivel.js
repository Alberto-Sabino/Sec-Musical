// Deixa as modais utilizáveis por teclado e leitor de tela, sem precisar repetir
// a mesma lógica em cada uma. Faz três coisas: prende o foco dentro do diálogo
// enquanto ele está aberto, fecha no Esc e devolve o foco ao elemento que abriu.
//
// Uso:
//   const caixa = ref(null)
//   usarModalAcessivel(() => props.aberto, caixa, () => emit('fechar'))
// onde `caixa` é o ref do elemento container do diálogo.
import { watch, nextTick, onBeforeUnmount } from 'vue'

const SELETOR_FOCAVEIS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function usarModalAcessivel(estaAberto, refCaixa, aoFechar) {
  let gatilhoAnterior = null

  function elementosFocaveis() {
    const caixa = refCaixa.value

    if (!caixa) {
      return []
    }

    return Array.from(caixa.querySelectorAll(SELETOR_FOCAVEIS)).filter(
      (elemento) => elemento.offsetParent !== null || elemento === document.activeElement,
    )
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault()

      if (typeof aoFechar === 'function') {
        aoFechar()
      }

      return
    }

    if (evento.key !== 'Tab') {
      return
    }

    const itens = elementosFocaveis()

    if (itens.length === 0) {
      return
    }

    const primeiro = itens[0]
    const ultimo = itens[itens.length - 1]

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primeiro.focus()
    }
  }

  async function ativar() {
    gatilhoAnterior = document.activeElement
    document.addEventListener('keydown', aoTeclar, true)

    await nextTick()

    const itens = elementosFocaveis()

    if (itens.length > 0) {
      itens[0].focus()
    } else if (refCaixa.value) {
      refCaixa.value.focus()
    }
  }

  function desativar() {
    document.removeEventListener('keydown', aoTeclar, true)

    if (gatilhoAnterior && typeof gatilhoAnterior.focus === 'function') {
      gatilhoAnterior.focus()
    }

    gatilhoAnterior = null
  }

  watch(
    estaAberto,
    (aberto) => {
      if (aberto) {
        ativar()
      } else {
        desativar()
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', aoTeclar, true)
  })
}
