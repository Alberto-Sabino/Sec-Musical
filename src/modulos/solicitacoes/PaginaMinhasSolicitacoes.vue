<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Minhas solicitações">
      <template #acoes>
        <BaseBotao @click="irParaNova">Nova</BaseBotao>
        <BaseBotao variante="secundario" @click="irParaInicio">Início</BaseBotao>
      </template>
    </CabecalhoPagina>

    <EstadoCarregando v-if="carregando" texto="Carregando solicitações..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="solicitacoes.length === 0"
      titulo="Nenhuma solicitação"
      descricao="Abra uma nova solicitação para começar."
    >
      <template #acao>
        <BaseBotao @click="irParaNova">Nova solicitação</BaseBotao>
      </template>
    </EstadoVazio>

    <ul v-else class="lista">
      <li v-for="sol in solicitacoes" :key="sol.id_solicitacao">
        <BaseCard>
          <button class="item" @click="abrir(sol)">
            <div class="item__topo">
              <span class="item__titulo">{{ rotuloTipo(sol.tipo) }}</span>
              <BadgeStatus :status="sol.status" />
            </div>
            <div class="item__meta">
              <span>Aberta em {{ formatarData(sol.data_solicitacao) }}</span>
            </div>
          </button>
        </BaseCard>
      </li>
    </ul>
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
import { usarSessao } from '@/composables/usarSessao'
import { rotuloTipo, listarMinhasSolicitacoes } from '@/servicos/casos_de_uso/solicitacoes'
import { formatarData } from '@/servicos/casos_de_uso/formato'

const router = useRouter()
const { estado } = usarSessao()

const solicitacoes = ref([])
const carregando = ref(false)
const erro = ref('')

async function carregar() {
  if (!estado.contexto) {
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    solicitacoes.value = await listarMinhasSolicitacoes(estado.contexto.id_usuario)
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

function irParaInicio() {
  router.push({ name: 'inicio' })
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
  justify-content: space-between;
  gap: var(--espaco-sm);
}
.item__titulo {
  font-weight: 600;
  color: var(--cor-texto);
}
.item__meta {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
</style>
