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
          :rotulo="ehEdicao ? 'Substituir arquivo (opcional)' : 'Arquivo'"
          :texto-padrao="ehEdicao ? 'Manter arquivo atual' : 'Selecionar arquivo'"
          :accept="accept"
          :hint="hint"
          :erro="erros.arquivo"
          @selecionar="aoSelecionarArquivo"
        />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">{{ mensagemErro }}</MensagemFeedback>
        <MensagemFeedback v-if="mensagemSucesso" tipo="sucesso">{{
          mensagemSucesso
        }}</MensagemFeedback>

        <div class="form__acoes acoes-responsivas">
          <BaseBotao type="submit" :carregando="salvando" :disabled="!!erros.arquivo">
            {{ ehEdicao ? 'Salvar alterações' : 'Cadastrar arquivo' }}
          </BaseBotao>
        </div>
      </form>
    </BaseCard>
  </ContainerPagina>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
import { registrarGuardaFormulario } from '@/composables/usarGuardaFormulario'
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
import {
  acceptBiblioteca,
  hintBiblioteca,
  validarArquivoBiblioteca,
} from '@/servicos/casos_de_uso/regrasUpload'

const route = useRoute()
const router = useRouter()
const { estado, nomeSetorAtivo } = usarSessao()

const opcoesTipo = TIPOS_ARQUIVO
const opcoesNivel = NIVEL_ARQUIVO_OPCOES

const accept = acceptBiblioteca()
// Hint dinâmica conforme o tipo selecionado (limite muda para `metodos`).
const hint = computed(() => hintBiblioteca(form.tipo))

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

// Snapshot dos valores iniciais para detectar alteração pendente (dirty-guard).
const formInicial = ref({ titulo: '', tipo: '', nivel_acesso: NIVEL_ARQUIVO.PUBLICO })

function estaSujo() {
  if (salvando.value || mensagemSucesso.value) {
    return false
  }

  if (arquivoSelecionado.value) {
    return true
  }

  return (
    form.titulo !== formInicial.value.titulo ||
    form.tipo !== formInicial.value.tipo ||
    Number(form.nivel_acesso) !== Number(formInicial.value.nivel_acesso)
  )
}

registrarGuardaFormulario(estaSujo)

function aoSelecionarArquivo(file) {
  arquivoSelecionado.value = file
  validarArquivoSelecionado()
}

function validarArquivoSelecionado() {
  if (!arquivoSelecionado.value) {
    delete erros.arquivo
    return
  }

  const { ok, erro } = validarArquivoBiblioteca(arquivoSelecionado.value, form.tipo)

  if (ok) {
    delete erros.arquivo
  } else {
    erros.arquivo = erro
  }
}

// O limite depende do tipo (metodos vai a 50 MB), então revalida ao trocar o tipo.
watch(
  () => form.tipo,
  () => validarArquivoSelecionado(),
)

const NIVEIS_VALIDOS = [NIVEL_ARQUIVO.PUBLICO, NIVEL_ARQUIVO.RESTRITO]

function validar() {
  Object.keys(erros).forEach((campo) => delete erros[campo])

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

  if (arquivoSelecionado.value) {
    const { ok, erro } = validarArquivoBiblioteca(arquivoSelecionado.value, form.tipo)

    if (!ok) {
      erros.arquivo = erro
    }
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

async function persistirArquivo(dados) {
  if (ehEdicao.value) {
    await atualizarArquivoExistente(arquivoAtual.value, dados, arquivoSelecionado.value)
    return 'Arquivo atualizado.'
  }

  await cadastrarArquivo(dados, arquivoSelecionado.value)
  return 'Arquivo cadastrado.'
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
    formInicial.value = {
      titulo: form.titulo,
      tipo: form.tipo,
      nivel_acesso: form.nivel_acesso,
    }
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
  margin-top: var(--espaco-sm);
}
</style>
