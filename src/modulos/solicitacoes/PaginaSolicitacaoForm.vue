<template>
  <ContainerPagina>
    <CabecalhoPagina
      :titulo="ehEdicao ? 'Editar solicitação' : 'Nova solicitação'"
      :subtitulo="`Setor: ${nomeSetorAtivo} · Comum Congregação: ${comumCongregacao}`"
    />

    <EstadoCarregando v-if="carregandoInicial" texto="Carregando solicitação..." />

    <BaseCard v-else>
      <form class="form" @submit.prevent="salvar">
        <BaseSelect
          v-model="form.tipo"
          rotulo="Tipo"
          placeholder="Selecione o tipo"
          :opcoes="opcoesTipo"
          :erro="erros.tipo"
        />

        <BaseInput
          v-model="form.nomeBeneficiario"
          rotulo="Pessoa afetada"
          placeholder="Nome do músico ou organista"
          :erro="erros.nomeBeneficiario"
          :disabled="ehEdicao"
        />

        <BaseTextarea
          v-model="form.descricao"
          rotulo="Descrição"
          placeholder="Mais informações relevantes"
          :rows="5"
          :erro="erros.descricao"
        />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">{{ mensagemErro }}</MensagemFeedback>
        <MensagemFeedback v-if="mensagemSucesso" tipo="sucesso">{{
          mensagemSucesso
        }}</MensagemFeedback>

        <div class="form__acoes">
          <BaseBotao variante="secundario" @click="voltar">Cancelar</BaseBotao>
          <BaseBotao type="submit" :carregando="salvando">
            {{ ehEdicao ? 'Salvar' : 'Abrir solicitação' }}
          </BaseBotao>
        </div>
      </form>
    </BaseCard>
  </ContainerPagina>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseSelect from '@/componentes/BaseSelect.vue'
import BaseInput from '@/componentes/BaseInput.vue'
import BaseTextarea from '@/componentes/BaseTextarea.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import { usarSessao } from '@/composables/usarSessao'
import {
  TIPOS_SOLICITACAO,
  STATUS,
  criarSolicitacao,
  editarSolicitacao,
  obterSolicitacao,
} from '@/servicos/casos_de_uso/solicitacoes'

const route = useRoute()
const router = useRouter()
const { estado, nomeSetorAtivo } = usarSessao()

const opcoesTipo = TIPOS_SOLICITACAO
const ehEdicao = computed(() => !!route.params.id)
const comumCongregacao = computed(() => estado.contexto?.comum_congregacao || '—')

const carregandoInicial = ref(false)
const salvando = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('')
const solicitacaoAtual = ref(null)

const form = reactive({ tipo: '', nomeBeneficiario: '', descricao: '' })
const erros = reactive({})

function validar() {
  Object.keys(erros).forEach((k) => delete erros[k])
  if (!form.tipo) {
    erros.tipo = 'Selecione o tipo.'
  }
  // nome_beneficiario é imutável na edição; só validamos na criação.
  if (!ehEdicao.value && !form.nomeBeneficiario.trim()) {
    erros.nomeBeneficiario = 'Informe a pessoa afetada.'
  }
  if (!form.descricao.trim()) {
    erros.descricao = 'Informe a descrição.'
  }
  return Object.keys(erros).length === 0
}

async function salvar() {
  mensagemErro.value = ''
  mensagemSucesso.value = ''
  if (!validar()) {
    return
  }

  salvando.value = true
  try {
    mensagemSucesso.value = await persistirSolicitacao()
    setTimeout(() => router.push({ name: 'minhas-solicitacoes' }), 600)
  } catch (e) {
    mensagemErro.value = e?.message || 'Não foi possível salvar a solicitação.'
  } finally {
    salvando.value = false
  }
}

// Persiste (cria ou edita) e devolve a mensagem de sucesso correspondente.
async function persistirSolicitacao() {
  if (ehEdicao.value) {
    await editarSolicitacao(
      solicitacaoAtual.value,
      { tipo: form.tipo, descricao: form.descricao },
      estado.contexto.id_usuario,
    )
    return 'Solicitação atualizada.'
  }

  await criarSolicitacao({
    idUsuario: estado.contexto.id_usuario,
    nomeUsuario: estado.contexto.nome_completo,
    comumCongregacao: estado.contexto.comum_congregacao,
    idSetor: estado.setorAtivo,
    tipo: form.tipo,
    nomeBeneficiario: form.nomeBeneficiario,
    descricao: form.descricao,
  })
  return 'Solicitação aberta.'
}

function voltar() {
  router.push({ name: 'minhas-solicitacoes' })
}

onMounted(async () => {
  if (!ehEdicao.value) {
    return
  }
  carregandoInicial.value = true
  try {
    const sol = await obterSolicitacao(route.params.id)
    if (!sol) {
      mensagemErro.value = 'Solicitação não encontrada.'
      return
    }
    if (sol.id_solicitante !== estado.contexto.id_usuario) {
      mensagemErro.value = 'Você não tem acesso a esta solicitação.'
      return
    }
    if (sol.status !== STATUS.EM_ABERTO) {
      mensagemErro.value = 'Só é possível editar enquanto estiver em aberto.'
      return
    }
    solicitacaoAtual.value = sol
    form.tipo = sol.tipo
    form.nomeBeneficiario = sol.nome_beneficiario || ''
    form.descricao = sol.descricao || ''
  } catch {
    mensagemErro.value = 'Não foi possível carregar a solicitação.'
  } finally {
    carregandoInicial.value = false
  }
})
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.form__acoes {
  display: flex;
  gap: var(--espaco-sm);
  justify-content: flex-end;
}
</style>
