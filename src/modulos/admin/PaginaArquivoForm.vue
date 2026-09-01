<template>
  <ContainerPagina>
    <CabecalhoPagina
      :titulo="ehEdicao ? 'Editar arquivo' : 'Novo arquivo'"
      :subtitulo="`Setor ativo: ${nomeSetorAtivo}`"
    />

    <EstadoCarregando v-if="carregandoInicial" texto="Carregando arquivo..." />

    <BaseCard v-else>
      <form class="form" @submit.prevent="salvar">
        <BaseInput
          v-model="form.titulo"
          rotulo="Título"
          placeholder="Título do documento"
          :erro="erros.titulo"
        />

        <BaseSelect
          v-model="form.tipo"
          rotulo="Tipo"
          placeholder="Selecione o tipo"
          :opcoes="opcoesTipo"
          :erro="erros.tipo"
        />

        <BaseSelect
          v-model="form.nivel_acesso"
          rotulo="Nível de acesso"
          :opcoes="opcoesNivel"
          :erro="erros.nivel_acesso"
        />

        <UploaderArquivo
          :rotulo="ehEdicao ? 'Substituir arquivo (opcional)' : 'Arquivo (PDF)'"
          :texto-padrao="ehEdicao ? 'Manter arquivo atual' : 'Selecionar arquivo'"
          :erro="erros.arquivo"
          @selecionar="aoSelecionarArquivo"
        />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">{{ mensagemErro }}</MensagemFeedback>
        <MensagemFeedback v-if="mensagemSucesso" tipo="sucesso">{{
          mensagemSucesso
        }}</MensagemFeedback>

        <div class="form__acoes">
          <BaseBotao variante="secundario" @click="voltar">Cancelar</BaseBotao>
          <BaseBotao type="submit" :carregando="salvando">
            {{ ehEdicao ? 'Salvar alterações' : 'Cadastrar' }}
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
import BaseInput from '@/componentes/BaseInput.vue'
import BaseSelect from '@/componentes/BaseSelect.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import UploaderArquivo from '@/componentes/UploaderArquivo.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import { usarSessao } from '@/composables/usarSessao'
import {
  TIPOS_ARQUIVO,
  NIVEL_ARQUIVO,
  NIVEL_ARQUIVO_OPCOES,
} from '@/servicos/casos_de_uso/biblioteca'
import {
  cadastrarArquivo,
  atualizarArquivoExistente,
} from '@/servicos/casos_de_uso/bibliotecaAdmin'
import { obterArquivo } from '@/servicos/repositorios/repositorioArquivos'

const route = useRoute()
const router = useRouter()
const { estado, nomeSetorAtivo } = usarSessao()

const opcoesTipo = TIPOS_ARQUIVO
const opcoesNivel = NIVEL_ARQUIVO_OPCOES

const ehEdicao = computed(() => !!route.params.id)
const carregandoInicial = ref(false)
const salvando = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('')

const arquivoAtual = ref(null)
const arquivoSelecionado = ref(null)

const form = reactive({
  titulo: '',
  tipo: '',
  nivel_acesso: NIVEL_ARQUIVO.PUBLICO,
})
const erros = reactive({})

function aoSelecionarArquivo(file) {
  arquivoSelecionado.value = file
}

const NIVEIS_VALIDOS = [NIVEL_ARQUIVO.PUBLICO, NIVEL_ARQUIVO.RESTRITO]

function validar() {
  Object.keys(erros).forEach((k) => delete erros[k])
  if (!form.titulo.trim()) {
    erros.titulo = 'Informe o título.'
  }
  if (!form.tipo) {
    erros.tipo = 'Selecione o tipo.'
  }
  if (!NIVEIS_VALIDOS.includes(Number(form.nivel_acesso))) {
    erros.nivel_acesso = 'Selecione o nível.'
  }
  if (!ehEdicao.value && !arquivoSelecionado.value) {
    erros.arquivo = 'Selecione um arquivo.'
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
    const dados = {
      id_setor: estado.setorAtivo,
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      nivel_acesso: Number(form.nivel_acesso),
      id_usuario: estado.contexto.id_usuario,
    }

    mensagemSucesso.value = await persistirArquivo(dados)
    setTimeout(() => router.push({ name: 'biblioteca' }), 600)
  } catch (e) {
    mensagemErro.value = e?.message || 'Não foi possível salvar o arquivo.'
  } finally {
    salvando.value = false
  }
}

// Persiste (cria ou atualiza) e devolve a mensagem de sucesso correspondente.
async function persistirArquivo(dados) {
  if (ehEdicao.value) {
    await atualizarArquivoExistente(arquivoAtual.value, dados, arquivoSelecionado.value)
    return 'Arquivo atualizado.'
  }

  await cadastrarArquivo(dados, arquivoSelecionado.value)
  return 'Arquivo cadastrado.'
}

function voltar() {
  router.push({ name: 'biblioteca' })
}

onMounted(async () => {
  if (!ehEdicao.value) {
    return
  }
  carregandoInicial.value = true
  try {
    const doc = await obterArquivo(route.params.id)
    if (!doc) {
      mensagemErro.value = 'Arquivo não encontrado.'
      return
    }
    arquivoAtual.value = doc
    form.titulo = doc.titulo || ''
    form.tipo = doc.tipo || ''
    form.nivel_acesso = doc.nivel_acesso || NIVEL_ARQUIVO.PUBLICO
  } catch {
    mensagemErro.value = 'Não foi possível carregar o arquivo.'
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
