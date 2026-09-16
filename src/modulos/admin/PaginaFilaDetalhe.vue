<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Detalhe administrativo" />

    <EstadoCarregando v-if="carregando" texto="Carregando solicitação..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <template v-else-if="solicitacao">
      <!-- 1. Identificação da solicitação -->
      <BaseCard>
        <div class="topo">
          <component :is="iconeTipoSolicitacao(solicitacao.tipo)" class="topo__icone" />
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
      </BaseCard>

      <!-- 2. Assumir solicitação pendente -->
      <BaseCard>
        <h3 class="secao__titulo">Assumir solicitação</h3>
        <!-- TODO: revisar mensagem -->
        <p class="secao__ajuda">Assuma a solicitação para tratá-la.</p>
        <MensagemFeedback v-if="msgAssumir" :tipo="msgAssumir.tipo">{{
          msgAssumir.texto
        }}</MensagemFeedback>
        <div class="secao__acoes">
          <BaseBotao :disabled="!emAberto" :carregando="assumindo" @click="assumir">
            Assumir solicitação
          </BaseBotao>
          <BaseBotao
            v-if="emAberto || emAndamento"
            variante="destrutivo"
            @click="pedirCancelamento"
          >
            Cancelar solicitação
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- 3. Anexar um arquivo -->
      <BaseCard>
        <h3 class="secao__titulo">Anexar um arquivo</h3>
        <p v-if="solicitacao.id_nuvem" class="anexo__atual">Anexo já vinculado.</p>
        <UploaderArquivo
          rotulo="Arquivo de resposta"
          :texto-padrao="solicitacao.id_nuvem ? 'Substituir anexo' : 'Selecionar arquivo'"
          :accept="acceptAnexo"
          :hint="hintAnexo"
          :erro="erroAnexo"
          :disabled="!podeTratar"
          @selecionar="aoSelecionarArquivo"
        />
        <MensagemFeedback v-if="msgAnexo" :tipo="msgAnexo.tipo">{{
          msgAnexo.texto
        }}</MensagemFeedback>
        <div class="secao__acoes">
          <BaseBotao
            :disabled="!podeTratar || !arquivoSelecionado || !!erroAnexo"
            :carregando="anexando"
            @click="anexar"
          >
            Anexar arquivo
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- 4. Adicionar uma conclusão -->
      <BaseCard>
        <h3 class="secao__titulo">Adicionar uma conclusão</h3>
        <BaseTextarea
          v-model="conclusao"
          placeholder="Resposta visível ao solicitante quando a solicitação for concluída"
          :rows="4"
          :disabled="!podeTratar"
        />
        <MensagemFeedback v-if="msgConclusao" :tipo="msgConclusao.tipo">{{
          msgConclusao.texto
        }}</MensagemFeedback>
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

      <!-- 5. Concluir -->
      <BaseCard>
        <h3 class="secao__titulo">Concluir</h3>
        <!-- TODO: revisar mensagem -->
        <p class="secao__ajuda">Conclua a solicitação após tratá-la.</p>
        <MensagemFeedback v-if="msgConcluir" :tipo="msgConcluir.tipo">{{
          msgConcluir.texto
        }}</MensagemFeedback>
        <div class="secao__acoes">
          <BaseBotao :disabled="!emAndamento" :carregando="concluindo" @click="concluir">
            Concluir solicitação
          </BaseBotao>
        </div>
      </BaseCard>

      <!-- 6. Histórico -->
      <BaseCard>
        <h3 class="secao__titulo">Histórico</h3>
        <EstadoVazio v-if="historico.length === 0" titulo="Sem histórico" />
        <ul v-else class="historico">
          <li v-for="h in historico" :key="h.id" class="historico__item">
            <span>{{ rotuloAcao(h) }}</span>
            <span class="historico__data">{{ formatarDataHora(h.data) }}</span>
          </li>
        </ul>
      </BaseCard>
    </template>

    <ModalConfirmacao
      :aberto="confirmarCancelamento"
      titulo="Cancelar solicitação"
      :mensagem="mensagemCancelamento"
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
import { useRoute } from 'vue-router'
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
import { formatarData, formatarDataHora } from '@/servicos/casos_de_uso/formato'
import {
  acceptSolicitacoes,
  hintSolicitacoes,
  validarAnexoSolicitacao,
} from '@/servicos/casos_de_uso/regrasUpload'
import { iconeTipoSolicitacao } from '@/modulos/solicitacoes/apresentacaoTipos'

const route = useRoute()
const { estado } = usarSessao()

const solicitacao = ref(null)
const historico = ref([])
const carregando = ref(false)
const erro = ref('')

const conclusao = ref('')
const arquivoSelecionado = ref(null)
const erroAnexo = ref('')

// Regras do anexo final (PDF, 2 MB) — fonte única em regrasUpload.js.
const acceptAnexo = acceptSolicitacoes()
const hintAnexo = hintSolicitacoes()

const assumindo = ref(false)
const salvandoConclusao = ref(false)
const anexando = ref(false)
const concluindo = ref(false)
const cancelando = ref(false)
const confirmarCancelamento = ref(false)

// Mensagens por seção (cada card exibe o próprio feedback).
const msgAssumir = ref(null) // { texto, tipo }
const msgAnexo = ref(null)
const msgConclusao = ref(null)
const msgConcluir = ref(null)

function fb(texto, tipo) {
  return { texto, tipo }
}

const emAberto = computed(() => solicitacao.value?.status === STATUS.EM_ABERTO)
const emAndamento = computed(() => solicitacao.value?.status === STATUS.EM_ANDAMENTO)
// Tratamento (conclusão/anexo) só faz sentido enquanto em andamento.
const podeTratar = computed(() => emAndamento.value)

// Mensagem de confirmação citando o item (tipo + pessoa afetada).
const mensagemCancelamento = computed(() => {
  const s = solicitacao.value
  if (!s) {
    return 'Esta ação não pode ser desfeita.'
  }
  const pessoa = s.nome_beneficiario ? ` de ${s.nome_beneficiario}` : ''
  return `Cancelar a solicitação de ${rotuloTipo(s.tipo)}${pessoa}? Esta ação não pode ser desfeita.`
})

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
  // Valida formato/limite do anexo (PDF, 2 MB). Anexo continua opcional:
  // um erro só bloqueia a ação de anexar, sem afetar o resto da tela.
  if (!file) {
    erroAnexo.value = ''
    return
  }
  const { ok, erro } = validarAnexoSolicitacao(file)
  erroAnexo.value = ok ? '' : erro
}

async function assumir() {
  msgAssumir.value = null
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
    msgAssumir.value = fb('Não foi possível assumir.', 'erro')
  } finally {
    assumindo.value = false
  }
}

// Traduz o resultado da transação de "assumir" em mensagem para o usuário.
function aplicarResultadoAssumir(resultado) {
  if (resultado.ok) {
    msgAssumir.value = fb('Solicitação assumida.', 'sucesso')
    return
  }

  const jaAssumida = resultado.motivo === 'nao_em_aberto'
  const texto = jaAssumida
    ? 'Esta solicitação já foi assumida ou não está mais em aberto.'
    : 'Solicitação indisponível.'
  msgAssumir.value = fb(texto, 'erro')
}

async function salvarConclusao() {
  msgConclusao.value = null
  salvandoConclusao.value = true
  try {
    await responder(solicitacao.value, conclusao.value, estado.contexto.id_usuario)
    msgConclusao.value = fb('Conclusão salva.', 'sucesso')
    await carregar()
  } catch (e) {
    msgConclusao.value = fb(e?.message || 'Não foi possível salvar a conclusão.', 'erro')
  } finally {
    salvandoConclusao.value = false
  }
}

async function anexar() {
  msgAnexo.value = null
  // Revalida antes de enviar; bloqueia com erro sem afetar o resto da tela.
  const { ok, erro } = validarAnexoSolicitacao(arquivoSelecionado.value)
  if (!ok) {
    erroAnexo.value = erro
    return
  }
  erroAnexo.value = ''
  anexando.value = true
  try {
    await anexarFinal(solicitacao.value, arquivoSelecionado.value, estado.contexto.id_usuario)
    arquivoSelecionado.value = null
    msgAnexo.value = fb('Anexo vinculado.', 'sucesso')
    await carregar()
  } catch (e) {
    msgAnexo.value = fb(e?.message || 'Não foi possível anexar.', 'erro')
  } finally {
    anexando.value = false
  }
}

async function concluir() {
  msgConcluir.value = null
  concluindo.value = true
  try {
    await concluirSolicitacao(solicitacao.value, estado.contexto.id_usuario)
    msgConcluir.value = fb('Solicitação concluída.', 'sucesso')
    await carregar()
  } catch (e) {
    msgConcluir.value = fb(e?.message || 'Não foi possível concluir.', 'erro')
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
    msgAssumir.value = fb('Solicitação cancelada.', 'sucesso')
    await carregar()
  } catch (e) {
    confirmarCancelamento.value = false
    msgAssumir.value = fb(e?.message || 'Não foi possível cancelar.', 'erro')
  } finally {
    cancelando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
  flex-wrap: wrap;
}
.topo__icone {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--cor-primaria);
}
.secao__ajuda {
  margin: 0 0 var(--espaco-md);
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.topo__tipo {
  margin: 0;
  flex: 1;
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
  flex-wrap: wrap;
  gap: var(--espaco-sm);
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
