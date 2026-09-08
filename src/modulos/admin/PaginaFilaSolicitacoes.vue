<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Fila de solicitações" :subtitulo="`Setor ativo: ${nomeSetorAtivo}`">
      <template #acoes>
        <BaseBotao variante="secundario" @click="irParaInicio">Início</BaseBotao>
      </template>
    </CabecalhoPagina>

    <div class="filtro">
      <BaseSelect
        v-model="statusSelecionado"
        rotulo="Filtrar por status"
        placeholder="Todos os status"
        :opcoes="opcoesStatus"
        @update:modelValue="carregar"
      />
    </div>

    <EstadoCarregando v-if="carregando" texto="Carregando fila..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="solicitacoes.length === 0"
      titulo="Fila vazia"
      :descricao="
        statusSelecionado
          ? 'Nenhuma solicitação com este status.'
          : 'Não há solicitações neste setor.'
      "
    />

    <ul v-else class="lista">
      <li v-for="sol in solicitacoes" :key="sol.id_solicitacao">
        <BaseCard>
          <button class="item" @click="abrir(sol)">
            <div class="item__topo">
              <span class="item__titulo">{{ rotuloTipo(sol.tipo) }}</span>
              <BadgeStatus :status="sol.status" />
            </div>
            <div class="item__meta">
              <span v-if="sol.comum_congregacao">{{ sol.comum_congregacao }}</span>
              <span>Atualizada em {{ formatarData(sol.data_atualizacao) }}</span>
              <span v-if="sol.id_responsavel">Responsável definido</span>
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
import BaseSelect from '@/componentes/BaseSelect.vue'
import BadgeStatus from '@/componentes/BadgeStatus.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import { usarSessao } from '@/composables/usarSessao'
import { STATUS_OPCOES, rotuloTipo } from '@/servicos/casos_de_uso/solicitacoes'
import { listarFila } from '@/servicos/casos_de_uso/solicitacoesAdmin'
import { formatarData } from '@/servicos/casos_de_uso/formato'

const router = useRouter()
const { estado, nomeSetorAtivo } = usarSessao()

const solicitacoes = ref([])
const carregando = ref(false)
const erro = ref('')
const statusSelecionado = ref('')
const opcoesStatus = STATUS_OPCOES

async function carregar() {
  if (!estado.setorAtivo) {
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    solicitacoes.value = await listarFila(estado.setorAtivo, statusSelecionado.value || null)
  } catch {
    erro.value = 'Não foi possível carregar a fila.'
  } finally {
    carregando.value = false
  }
}

function abrir(sol) {
  router.push({ name: 'fila-detalhe', params: { id: sol.id_solicitacao } })
}

function irParaInicio() {
  router.push({ name: 'inicio' })
}

onMounted(carregar)
</script>

<style scoped>
.filtro {
  margin-bottom: var(--espaco-md);
}
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
  display: flex;
  gap: var(--espaco-md);
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
</style>
