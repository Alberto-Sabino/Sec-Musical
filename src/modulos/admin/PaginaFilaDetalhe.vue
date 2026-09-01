<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Detalhe administrativo">
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
            <dt>Responsável</dt>
            <dd>{{ solicitacao.nome_responsavel || '—' }}</dd>
          </div>
          <div>
            <dt>Aberta em</dt>
            <dd>{{ formatarData(solicitacao.data_solicitacao) }}</dd>
          </div>
          <div>
            <dt>Última atualização</dt>
            <dd>{{ formatarData(solicitacao.data_atualizacao) }}</dd>
          </div>
        </dl>

        <div v-if="solicitacao.descricao" class="mensagem">
          <span class="mensagem__autor">Solicitante</span>
          <p class="mensagem__texto">{{ solicitacao.descricao }}</p>
        </div>

        <MensagemFeedback v-if="mensagemAcao" :tipo="tipoMensagem">{{
          mensagemAcao
        }}</MensagemFeedback>

        <div class="acoes">
          <BaseBotao v-if="emAberto" :carregando="assumindo" @click="assumir">Assumir</BaseBotao>
          <BaseBotao v-if="emAndamento" :carregando="concluindo" @click="concluir">
            Concluir
          </BaseBotao>
          <BaseBotao
            v-if="emAberto || emAndamento"
            variante="destrutivo"
            @click="pedirCancelamento"
          >
            Cancelar
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- Conclusão (resposta do responsável) -->
      <BaseCard>
        <h3 class="secao__titulo">Conclusão (Secretário)</h3>
        <BaseTextarea
          v-model="conclusao"
          placeholder="Resposta visível ao solicitante quando a solicitação for concluída"
          :rows="4"
          :disabled="!podeTratar"
        />
        <div class="secao__acoes">
          <BaseBotao
            :disabled="!podeTratar"
            :carregando="salvandoConclusao"
            @click="salvarConclusao"
          >
            Salvar conclusão
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- Anexo final -->
      <BaseCard>
        <h3 class="secao__titulo">Anexo final</h3>
        <p v-if="solicitacao.id_nuvem" class="anexo__atual">Anexo já vinculado.</p>
        <UploaderArquivo
          rotulo="Arquivo de resposta (PDF)"
          :texto-padrao="solicitacao.id_nuvem ? 'Substituir anexo' : 'Selecionar arquivo'"
          :disabled="!podeTratar"
          @selecionar="aoSelecionarArquivo"
        />
        <div class="secao__acoes">
          <BaseBotao
            :disabled="!podeTratar || !arquivoSelecionado"
            :carregando="anexando"
            @click="anexar"
          >
            Anexar
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- Histórico -->
      <BaseCard>
        <h3 class="secao__titulo">Histórico</h3>
        <EstadoVazio v-if="historico.length === 0" titulo="Sem histórico" />
        <ul v-else class="historico">
          <li v-for="h in historico" :key="h.id" class="historico__item">
            <span>{{ rotuloAcao(h) }}</span>
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
      @confirmar="confirmarCancelar"
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
import BaseTextarea from '@/componentes/BaseTextarea.vue'
import BadgeStatus from '@/componentes/BadgeStatus.vue'
import UploaderArquivo from '@/componentes/UploaderArquivo.vue'
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
} from '@/servicos/casos_de_uso/solicitacoes'
import {
  assumirSolicitacao,
  responder,
  anexarFinal,
  concluirSolicitacao,
  cancelarSolicitacaoAdmin,
} from '@/servicos/casos_de_uso/solicitacoesAdmin'
import { formatarData } from '@/servicos/casos_de_uso/formato'

const route = useRoute()
const router = useRouter()
const { estado } = usarSessao()

const solicitacao = ref(null)
const historico = ref([])
const carregando = ref(false)
const erro = ref('')

const conclusao = ref('')
const arquivoSelecionado = ref(null)

const assumindo = ref(false)
const salvandoConclusao = ref(false)
const anexando = ref(false)
const concluindo = ref(false)
const cancelando = ref(false)
const confirmarCancelamento = ref(false)

const mensagemAcao = ref('')
const tipoMensagem = ref('sucesso')

const emAberto = computed(() => solicitacao.value?.status === STATUS.EM_ABERTO)
const emAndamento = computed(() => solicitacao.value?.status === STATUS.EM_ANDAMENTO)
// Tratamento (conclusão/anexo) só faz sentido enquanto em andamento.
const podeTratar = computed(() => emAndamento.value)

const rotulosAcao = {
  [ACAO_AUDITORIA.CRIADA]: 'Criada',
  [ACAO_AUDITORIA.EDITADA]: 'Editada',
  [ACAO_AUDITORIA.CANCELADA]: 'Cancelada',
  [ACAO_AUDITORIA.ASSUMIDA]: 'Assumida',
  [ACAO_AUDITORIA.RESPONDIDA]: 'Respondida',
  [ACAO_AUDITORIA.ANEXO_FINAL]: 'Anexo final adicionado',
  [ACAO_AUDITORIA.CONCLUIDA]: 'Concluída',
}
function rotuloAcao(h) {
  return rotulosAcao[h.acao] || h.acao
}

function mostrarMensagem(texto, tipo) {
  mensagemAcao.value = texto
  tipoMensagem.value = tipo
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
    // Isolamento por setor ativo do admin.
    if (sol.id_setor !== estado.setorAtivo) {
      erro.value = 'Esta solicitação não pertence ao seu setor ativo.'
      return
    }
    solicitacao.value = sol
    conclusao.value = sol.conclusao || ''
    historico.value = await listarHistorico(sol.id_solicitacao)
  } catch {
    erro.value = 'Não foi possível carregar a solicitação.'
  } finally {
    carregando.value = false
  }
}

function aoSelecionarArquivo(file) {
  arquivoSelecionado.value = file
}

async function assumir() {
  mensagemAcao.value = ''
  assumindo.value = true
  try {
    const resultado = await assumirSolicitacao(
      solicitacao.value,
      estado.contexto.id_usuario,
      estado.contexto.nome_completo,
    )
    aplicarResultadoAssumir(resultado)
    await carregar()
  } catch {
    mostrarMensagem('Não foi possível assumir.', 'erro')
  } finally {
    assumindo.value = false
  }
}

// Traduz o resultado da transação de "assumir" em mensagem para o usuário.
function aplicarResultadoAssumir(resultado) {
  if (resultado.ok) {
    mostrarMensagem('Solicitação assumida.', 'sucesso')
    return
  }

  const jaAssumida = resultado.motivo === 'nao_em_aberto'
  const texto = jaAssumida
    ? 'Esta solicitação já foi assumida ou não está mais em aberto.'
    : 'Solicitação indisponível.'
  mostrarMensagem(texto, 'erro')
}

async function salvarConclusao() {
  mensagemAcao.value = ''
  salvandoConclusao.value = true
  try {
    await responder(solicitacao.value, conclusao.value, estado.contexto.id_usuario)
    mostrarMensagem('Conclusão salva.', 'sucesso')
    await carregar()
  } catch (e) {
    mostrarMensagem(e?.message || 'Não foi possível salvar a conclusão.', 'erro')
  } finally {
    salvandoConclusao.value = false
  }
}

async function anexar() {
  mensagemAcao.value = ''
  anexando.value = true
  try {
    await anexarFinal(solicitacao.value, arquivoSelecionado.value, estado.contexto.id_usuario)
    arquivoSelecionado.value = null
    mostrarMensagem('Anexo vinculado.', 'sucesso')
    await carregar()
  } catch (e) {
    mostrarMensagem(e?.message || 'Não foi possível anexar.', 'erro')
  } finally {
    anexando.value = false
  }
}

async function concluir() {
  mensagemAcao.value = ''
  concluindo.value = true
  try {
    await concluirSolicitacao(solicitacao.value, estado.contexto.id_usuario)
    mostrarMensagem('Solicitação concluída.', 'sucesso')
    await carregar()
  } catch (e) {
    mostrarMensagem(e?.message || 'Não foi possível concluir.', 'erro')
  } finally {
    concluindo.value = false
  }
}

function pedirCancelamento() {
  confirmarCancelamento.value = true
}

async function confirmarCancelar() {
  cancelando.value = true
  try {
    await cancelarSolicitacaoAdmin(solicitacao.value, estado.contexto.id_usuario)
    confirmarCancelamento.value = false
    mostrarMensagem('Solicitação cancelada.', 'sucesso')
    await carregar()
  } catch (e) {
    confirmarCancelamento.value = false
    mostrarMensagem(e?.message || 'Não foi possível cancelar.', 'erro')
  } finally {
    cancelando.value = false
  }
}

function voltar() {
  router.push({ name: 'fila-solicitacoes' })
}

onMounted(carregar)
</script>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
}
.topo__tipo {
  margin: 0;
  font-size: var(--fonte-tamanho-lg);
}
.dados {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  word-break: break-all;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-sm);
  justify-content: flex-end;
}
.mensagem {
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-md);
  background: var(--cor-primaria-clara);
  margin-bottom: var(--espaco-md);
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
.secao__titulo {
  margin: 0 0 var(--espaco-md);
  font-size: var(--fonte-tamanho-md);
}
.secao__acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--espaco-sm);
}
.anexo__atual {
  margin: 0 0 var(--espaco-sm);
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
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
</style>
