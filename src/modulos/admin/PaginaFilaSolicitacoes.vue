<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Fila de solicitações" :subtitulo="`Setor ativo: ${nomeSetorAtivo}`" />

    <FiltrosSolicitacoes v-model:status="lista.status.value" v-model:tipo="lista.tipo.value" />

    <EstadoCarregando v-if="carregando" texto="Carregando fila..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="lista.totalItens.value === 0"
      :titulo="bruta.length === 0 ? 'Nenhuma solicitação' : 'Nenhum resultado'"
      :descricao="
        bruta.length === 0
          ? 'Não há solicitações neste setor.'
          : 'Nenhuma solicitação corresponde aos filtros atuais.'
      "
    >
      <template #icone><IconeVazio /></template>
    </EstadoVazio>

    <template v-else>
      <ul class="lista">
        <li v-for="sol in lista.paginada.value" :key="sol.id_solicitacao">
          <BaseCard>
            <button
              class="item"
              :aria-label="`Abrir solicitação de ${rotuloTipo(sol.tipo)}`"
              @click="abrir(sol)"
            >
              <span class="item__topo">
                <component :is="iconeTipoSolicitacao(sol.tipo)" class="item__icone" />
                <span class="item__titulo">{{ rotuloTipo(sol.tipo) }}</span>
                <BadgeStatus :status="sol.status" />
              </span>
              <span class="item__meta">
                <span v-if="sol.comum_congregacao">{{ sol.comum_congregacao }}</span>
                <span>Atualizada em {{ formatarData(sol.data_atualizacao) }}</span>
                <span v-if="sol.id_responsavel">Responsável definido</span>
              </span>
            </button>
          </BaseCard>
        </li>
      </ul>

      <PaginacaoLista
        v-model:pagina="lista.pagina.value"
        :total-itens="lista.totalItens.value"
        :por-pagina="lista.porPagina"
      />
    </template>
  </ContainerPagina>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BadgeStatus from '@/componentes/BadgeStatus.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import FiltrosSolicitacoes from '@/componentes/FiltrosSolicitacoes.vue'
import PaginacaoLista from '@/componentes/PaginacaoLista.vue'
import IconeVazio from '@/componentes/icones/IconeVazio.vue'
import { usarSessao } from '@/composables/usarSessao'
import { usarListaSolicitacoes } from '@/composables/usarListaSolicitacoes'
import { rotuloTipo } from '@/servicos/casos_de_uso/solicitacoes'
import { listarFila } from '@/servicos/casos_de_uso/solicitacoesAdmin'
import { formatarData } from '@/servicos/casos_de_uso/formato'
import { iconeTipoSolicitacao } from '@/modulos/solicitacoes/apresentacaoTipos'

const router = useRouter()
const { estado, nomeSetorAtivo } = usarSessao()

const bruta = ref([])
const carregando = ref(false)
const erro = ref('')

// Filtro/ordenação/paginação em memória (mesma lógica das duas listagens).
const lista = usarListaSolicitacoes(bruta)

async function carregar() {
  if (!estado.setorAtivo) {
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    // Carrega o escopo completo do setor; filtros são aplicados em memória.
    bruta.value = await listarFila(estado.setorAtivo, null)
  } catch {
    erro.value = 'Não foi possível carregar a fila.'
  } finally {
    carregando.value = false
  }
}

function abrir(sol) {
  router.push({ name: 'fila-detalhe', params: { id: sol.id_solicitacao } })
}

onMounted(carregar)
</script>

<style scoped>
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xs);
}
.item__topo {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}
.item__icone {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--cor-primaria);
}
.item__titulo {
  font-weight: 600;
  color: var(--cor-texto);
  flex: 1;
}
.item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-md);
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
  padding-left: calc(20px + var(--espaco-sm));
}
</style>
