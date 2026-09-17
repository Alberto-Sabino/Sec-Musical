// Concentra a lógica de listagem das solicitações: filtrar por status e tipo,
// ordenar da mais recente para a mais antiga e paginar — tudo em memória, sobre
// a lista que a tela já carregou. As duas visões (encarregado e secretário) usam
// isto para se comportarem igual. Optamos por filtrar/paginar no cliente porque
// o volume por setor é pequeno; evita um monte de query combinada no Firestore.
import { ref, computed, watch } from 'vue'
import { STATUS } from '@/servicos/casos_de_uso/solicitacoes'

const POR_PAGINA = 15

function emMilissegundos(valor) {
  if (!valor) {
    return 0
  }

  if (typeof valor.toDate === 'function') {
    return valor.toDate().getTime()
  }

  if (valor instanceof Date) {
    return valor.getTime()
  }

  const data = new Date(valor)

  return Number.isNaN(data.getTime()) ? 0 : data.getTime()
}

// listaBruta: Ref<array de solicitações do escopo visível do usuário>.
export function usarListaSolicitacoes(listaBruta) {
  const status = ref([STATUS.EM_ABERTO, STATUS.EM_ANDAMENTO])
  const tipo = ref('')
  const pagina = ref(1)

  const ordenada = computed(() =>
    [...(listaBruta.value || [])].sort(
      (a, b) =>
        emMilissegundos(b.data_atualizacao || b.data_solicitacao) -
        emMilissegundos(a.data_atualizacao || a.data_solicitacao),
    ),
  )

  const filtrada = computed(() =>
    ordenada.value.filter((solicitacao) => {
      const statusOk = status.value.includes(solicitacao.status)
      const tipoOk = !tipo.value || solicitacao.tipo === tipo.value

      return statusOk && tipoOk
    }),
  )

  const totalItens = computed(() => filtrada.value.length)
  const totalPaginas = computed(() => Math.max(1, Math.ceil(totalItens.value / POR_PAGINA)))
  const paginaSegura = computed(() => Math.min(pagina.value, totalPaginas.value))

  const paginada = computed(() => {
    const inicio = (paginaSegura.value - 1) * POR_PAGINA

    return filtrada.value.slice(inicio, inicio + POR_PAGINA)
  })

  // Qualquer mudança de filtro reinicia a paginação.
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
