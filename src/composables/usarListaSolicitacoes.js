// Filtro + ordenação + paginação em memória para listagens de Solicitações (Spec 15).
// Mesma lógica reutilizada pelas visões do encarregado e do secretário.
import { ref, computed, watch } from 'vue'
import { STATUS } from '@/servicos/casos_de_uso/solicitacoes'

const POR_PAGINA = 15

// Converte data (Timestamp/Date/número/string) em milissegundos para ordenação desc.
function ms(valor) {
  if (!valor) {
    return 0
  }
  if (typeof valor.toDate === 'function') {
    return valor.toDate().getTime()
  }
  if (valor instanceof Date) {
    return valor.getTime()
  }
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

// listaBruta: Ref<array de solicitações do escopo visível do usuário>.
export function usarListaSolicitacoes(listaBruta) {
  // Estado inicial de status: Em aberto + Em andamento (Spec 15).
  const status = ref([STATUS.EM_ABERTO, STATUS.EM_ANDAMENTO])
  const tipo = ref('') // '' = todos os tipos
  const pagina = ref(1)

  // Ordena por data_atualizacao desc (fallback data_solicitacao).
  const ordenada = computed(() =>
    [...(listaBruta.value || [])].sort(
      (a, b) =>
        ms(b.data_atualizacao || b.data_solicitacao) - ms(a.data_atualizacao || a.data_solicitacao),
    ),
  )

  // Aplica filtros de status (multiseleção) e tipo (único).
  const filtrada = computed(() =>
    ordenada.value.filter((s) => {
      const okStatus = status.value.includes(s.status)
      const okTipo = !tipo.value || s.tipo === tipo.value
      return okStatus && okTipo
    }),
  )

  const totalItens = computed(() => filtrada.value.length)
  const totalPaginas = computed(() => Math.max(1, Math.ceil(totalItens.value / POR_PAGINA)))

  // Página nunca aponta para inexistente.
  const paginaSegura = computed(() => Math.min(pagina.value, totalPaginas.value))

  const paginada = computed(() => {
    const inicio = (paginaSegura.value - 1) * POR_PAGINA
    return filtrada.value.slice(inicio, inicio + POR_PAGINA)
  })

  // Ao mudar qualquer filtro, volta para a página 1.
  watch([status, tipo], () => {
    pagina.value = 1
  })

  return {
    status,
    tipo,
    pagina,
    porPagina: POR_PAGINA,
    filtrada,
    paginada,
    totalItens,
    totalPaginas,
  }
}
