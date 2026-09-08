<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Solicitação">
      <template #acoes>
        <BaseBotao variante="secundario" @click="voltar">Voltar</BaseBotao>
      </template>
    </CabecalhoPagina>

    <EstadoCarregando v-if="carregando" texto="Carregando solicitação..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <template v-else-if="solicitacao">
      <BaseCard>
        <div class="topo">
          <h2 class="topo__tipo">{{ rotuloTipo(solicitacao.tipo) }}</h2>
          <BadgeStatus :status="solicitacao.status" />
        </div>

        <dl class="dados">
          <div>
            <dt>Pessoa afetada</dt>
            <dd>{{ solicitacao.nome_beneficiario || '—' }}</dd>
          </div>
          <div>
            <dt>Solicitante</dt>
            <dd>{{ solicitacao.nome_solicitante || '—' }}</dd>
          </div>
          <div>
            <dt>Comum Congregação</dt>
            <dd>{{ solicitacao.comum_congregacao || '—' }}</dd>
          </div>
          <div>
            <dt>Aberta em</dt>
            <dd>{{ formatarData(solicitacao.data_solicitacao) }}</dd>
          </div>
          <div>
            <dt>Última atualização</dt>
            <dd>{{ formatarData(solicitacao.data_atualizacao) }}</dd>
          </div>
          <div v-if="solicitacao.nome_responsavel">
            <dt>Responsável</dt>
            <dd>{{ solicitacao.nome_responsavel }}</dd>
          </div>
        </dl>

        <div class="conversa">
          <div v-if="solicitacao.descricao" class="mensagem">
            <span class="mensagem__autor">Solicitante</span>
            <p class="mensagem__texto">{{ solicitacao.descricao }}</p>
          </div>
          <div v-if="mostrarConclusao" class="mensagem mensagem--responsavel">
            <span class="mensagem__autor">Secretário</span>
            <p class="mensagem__texto">{{ solicitacao.conclusao }}</p>
          </div>
        </div>

        <MensagemFeedback v-if="mensagemErroAcao" tipo="erro">{{
          mensagemErroAcao
        }}</MensagemFeedback>

        <div class="acoes">
          <BaseBotao v-if="podeBaixar" :carregando="baixando" @click="baixar">
            Baixar anexo final
          </BaseBotao>
          <BaseBotao v-if="emAberto" variante="secundario" @click="editar"> Editar </BaseBotao>
          <BaseBotao v-if="emAberto" variante="destrutivo" @click="pedirCancelamento">
            Cancelar solicitação
          </BaseBotao>
        </div>
      </BaseCard>

      <BaseCard>
        <h3 class="historico__titulo">Histórico</h3>
        <EstadoVazio
          v-if="historico.length === 0"
          titulo="Sem histórico"
          descricao="Ainda não há registros de status."
        />
        <ul v-else class="historico">
          <li v-for="h in historico" :key="h.id" class="historico__item">
            <span class="historico__acao">{{ rotuloAcao(h) }}</span>
            <span class="historico__data">{{ formatarData(h.data) }}</span>
          </li>
        </ul>
      </BaseCard>
    </template>

    <ModalConfirmacao
      :aberto="confirmarCancelamento"
      titulo="Cancelar solicitação"
      mensagem="Deseja cancelar esta solicitação? Esta ação não pode ser desfeita."
      rotulo-confirmar="Cancelar solicitação"
      rotulo-cancelar="Voltar"
      destrutivo
      :carregando="cancelando"
      @confirmar="confirmar"
      @cancelar="confirmarCancelamento = false"
    />
  </ContainerPagina>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import BadgeStatus from '@/componentes/BadgeStatus.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import ModalConfirmacao from '@/componentes/ModalConfirmacao.vue'
import { usarSessao } from '@/composables/usarSessao'
import {
  STATUS,
  ACAO_AUDITORIA,
  rotuloTipo,
  obterSolicitacao,
  listarHistorico,
  cancelarSolicitacao,
  baixarAnexoFinal,
} from '@/servicos/casos_de_uso/solicitacoes'
import { formatarData } from '@/servicos/casos_de_uso/formato'
import { baixarBlob } from '@/servicos/casos_de_uso/download'

const route = useRoute()
const router = useRouter()
const { estado } = usarSessao()

const solicitacao = ref(null)
const historico = ref([])
const carregando = ref(false)
const erro = ref('')
const mensagemErroAcao = ref('')
const baixando = ref(false)
const cancelando = ref(false)
const confirmarCancelamento = ref(false)

const emAberto = computed(() => solicitacao.value?.status === STATUS.EM_ABERTO)
const mostrarConclusao = computed(
  () => solicitacao.value?.status === STATUS.CONCLUIDA && !!solicitacao.value?.conclusao,
)
const podeBaixar = computed(
  () => solicitacao.value?.status === STATUS.CONCLUIDA && !!solicitacao.value?.id_nuvem,
)

const rotulosAcao = {
  [ACAO_AUDITORIA.CRIADA]: 'Solicitação criada',
  [ACAO_AUDITORIA.EDITADA]: 'Solicitação editada',
  [ACAO_AUDITORIA.CANCELADA]: 'Cancelada',
  [ACAO_AUDITORIA.ASSUMIDA]: 'Assumida pelo responsável',
  [ACAO_AUDITORIA.RESPONDIDA]: 'Respondida',
  [ACAO_AUDITORIA.ANEXO_FINAL]: 'Anexo final adicionado',
  [ACAO_AUDITORIA.CONCLUIDA]: 'Concluída',
}
function rotuloAcao(h) {
  return rotulosAcao[h.acao] || h.acao
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const sol = await obterSolicitacao(route.params.id)
    if (!sol) {
      erro.value = 'Solicitação não encontrada.'
      return
    }
    if (sol.id_solicitante !== estado.contexto.id_usuario) {
      erro.value = 'Você não tem acesso a esta solicitação.'
      return
    }
    solicitacao.value = sol
    historico.value = await listarHistorico(sol.id_solicitacao)
  } catch {
    erro.value = 'Não foi possível carregar a solicitação.'
  } finally {
    carregando.value = false
  }
}

function editar() {
  router.push({ name: 'solicitacao-editar', params: { id: solicitacao.value.id_solicitacao } })
}

function pedirCancelamento() {
  confirmarCancelamento.value = true
}

async function confirmar() {
  mensagemErroAcao.value = ''
  cancelando.value = true
  try {
    await cancelarSolicitacao(solicitacao.value, estado.contexto.id_usuario)
    confirmarCancelamento.value = false
    await carregar()
  } catch (e) {
    mensagemErroAcao.value = e?.message || 'Não foi possível cancelar.'
  } finally {
    cancelando.value = false
  }
}

async function baixar() {
  mensagemErroAcao.value = ''
  baixando.value = true
  try {
    const { nome, blob } = await baixarAnexoFinal(solicitacao.value)
    baixarBlob(nome, blob)
  } catch (e) {
    mensagemErroAcao.value = e?.message || 'Não foi possível baixar o anexo.'
  } finally {
    baixando.value = false
  }
}

function voltar() {
  router.push({ name: 'minhas-solicitacoes' })
}

onMounted(carregar)
</script>

<style scoped>
.topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
  flex-wrap: wrap;
}
.topo__tipo {
  margin: 0;
  font-size: var(--fonte-tamanho-lg);
  word-break: break-word;
  overflow-wrap: anywhere;
}
.dados {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--espaco-md);
  margin: 0 0 var(--espaco-md);
}
.dados dt {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.dados dd {
  margin: var(--espaco-xs) 0 0;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.conversa {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
}
.mensagem {
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-md);
  background: var(--cor-primaria-clara);
}
.mensagem--responsavel {
  background: var(--cor-sucesso-fundo);
}
.mensagem__autor {
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto-suave);
}
.mensagem__texto {
  margin: var(--espaco-xs) 0 0;
  white-space: pre-wrap;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-sm);
  justify-content: flex-end;
}
.historico__titulo {
  margin: 0 0 var(--espaco-md);
  font-size: var(--fonte-tamanho-md);
}
.historico {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}
.historico__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
  font-size: var(--fonte-tamanho-sm);
}
.historico__data {
  color: var(--cor-texto-suave);
}
@media (min-width: 600px) {
  .dados {
    grid-template-columns: 1fr 1fr;
    gap: var(--espaco-md) var(--espaco-lg);
  }
  .topo {
    align-items: center;
    flex-wrap: nowrap;
  }
}
</style>
