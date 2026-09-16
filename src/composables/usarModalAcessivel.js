// Acessibilidade de modais/diálogos (Bloco 1).
// - prende o foco dentro do diálogo enquanto aberto (focus trap);
// - fecha no Esc;
// - devolve o foco ao elemento que abriu ao fechar.
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
  let gatilho = null // elemento que tinha o foco antes de abrir

  function focaveis() {
    const caixa = refCaixa.value
    if (!caixa) {
      return []
    }
    return Array.from(caixa.querySelectorAll(SELETOR_FOCAVEIS)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
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
    // Focus trap: mantém o Tab circulando dentro do diálogo.
    const itens = focaveis()
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
    gatilho = document.activeElement
    document.addEventListener('keydown', aoTeclar, true)
    await nextTick()
    const itens = focaveis()
    if (itens.length > 0) {
      itens[0].focus()
    } else if (refCaixa.value) {
      refCaixa.value.focus()
    }
  }

  function desativar() {
    document.removeEventListener('keydown', aoTeclar, true)
    // Devolve o foco ao elemento que abriu o diálogo.
    if (gatilho && typeof gatilho.focus === 'function') {
      gatilho.focus()
    }
    gatilho = null
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
