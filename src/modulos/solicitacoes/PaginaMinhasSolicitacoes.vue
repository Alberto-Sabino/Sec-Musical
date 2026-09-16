<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Minhas solicitações">
      <template #acoes>
        <BaseBotao @click="irParaNova">Nova solicitação</BaseBotao>
      </template>
    </CabecalhoPagina>

    <FiltrosSolicitacoes v-model:status="lista.status.value" v-model:tipo="lista.tipo.value" />

    <EstadoCarregando v-if="carregando" texto="Carregando solicitações..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="lista.totalItens.value === 0"
      :titulo="bruta.length === 0 ? 'Nenhuma solicitação' : 'Nenhum resultado'"
      :descricao="
        bruta.length === 0
          ? 'Você ainda não abriu solicitações.'
          : 'Nenhuma solicitação corresponde aos filtros atuais.'
      "
    >
      <template #icone><IconeVazio /></template>
      <template v-if="bruta.length === 0" #acao>
        <BaseBotao @click="irParaNova">Nova solicitação</BaseBotao>
      </template>
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
                <span>Aberta em {{ formatarData(sol.data_solicitacao) }}</span>
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
import BaseBotao from '@/componentes/BaseBotao.vue'
import BadgeStatus from '@/componentes/BadgeStatus.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import FiltrosSolicitacoes from '@/componentes/FiltrosSolicitacoes.vue'
import PaginacaoLista from '@/componentes/PaginacaoLista.vue'
import IconeVazio from '@/componentes/icones/IconeVazio.vue'
import { usarSessao } from '@/composables/usarSessao'
import { usarListaSolicitacoes } from '@/composables/usarListaSolicitacoes'
import { rotuloTipo, listarMinhasSolicitacoes } from '@/servicos/casos_de_uso/solicitacoes'
import { formatarData } from '@/servicos/casos_de_uso/formato'
import { iconeTipoSolicitacao } from '@/modulos/solicitacoes/apresentacaoTipos'

const router = useRouter()
const { estado } = usarSessao()

const bruta = ref([])
const carregando = ref(false)
const erro = ref('')

const lista = usarListaSolicitacoes(bruta)

async function carregar() {
  if (!estado.contexto) {
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    bruta.value = await listarMinhasSolicitacoes(estado.contexto.id_usuario)
  } catch {
    erro.value = 'Não foi possível carregar suas solicitações.'
  } finally {
    carregando.value = false
  }
}

function abrir(sol) {
  router.push({ name: 'solicitacao-detalhe', params: { id: sol.id_solicitacao } })
}

function irParaNova() {
  router.push({ name: 'solicitacao-nova' })
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
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
  padding-left: calc(20px + var(--espaco-sm));
}
</style>
