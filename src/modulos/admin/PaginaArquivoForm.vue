<template>
  <ContainerPagina>
    <CabecalhoPagina
      :titulo="ehEdicao ? 'Editar arquivo' : 'Novo arquivo'"
      :subtitulo="`Setor ativo: ${nomeSetorAtivo}`"
    />

    <Transition name="form-estado" mode="out-in">
      <EstadoCarregando v-if="carregandoInicial" key="carregando" texto="Carregando arquivo..." />

      <MensagemFeedback v-else-if="bloqueado" key="bloqueado" tipo="erro">
        Você não tem permissão para editar este arquivo global.
      </MensagemFeedback>

      <BaseCard v-else key="form">
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

        <!-- Escopo do arquivo (Spec 18). Governança de UI:
             - admin_global: controla o escopo (checkbox + select de setor);
             - demais admins: sem controles (escopo sempre = setor ativo), apenas um aviso. -->
        <div v-if="podeGlobal" class="escopo">
          <label class="escopo__check">
            <input
              type="checkbox"
              :checked="form.restringir"
              @change="aoAlternarRestringir($event.target.checked)"
            />
            <span>Restringir o arquivo ao setor</span>
          </label>

          <BaseSelect
            v-model="form.id_setor"
            rotulo="Setor"
            placeholder="Selecione o setor"
            :opcoes="opcoesSetor"
            :disabled="!form.restringir"
            :erro="erros.id_setor"
          />

          <Transition name="dica" mode="out-in">
            <p v-if="form.restringir" key="setor" class="escopo__dica-setor">
              <IconeBiblioteca class="escopo__dica-icone" aria-hidden="true" />
              Visível apenas no setor selecionado.
            </p>
            <p v-else key="global" class="escopo__dica-global">
              <IconeGlobal class="escopo__dica-icone" aria-hidden="true" />
              Arquivo global: visível em todos os setores.
            </p>
          </Transition>
        </div>

        <MensagemFeedback v-else tipo="info">
          Este arquivo ficará restrito ao setor ativo: {{ nomeSetorAtivo }}.
        </MensagemFeedback>

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
    </Transition>
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
import IconeGlobal from '@/componentes/icones/IconeGlobal.vue'
import IconeBiblioteca from '@/componentes/icones/IconeBiblioteca.vue'
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
import { ESCOPO_ARQUIVO, escopoDoArquivo } from '@/enums/escopoArquivos'
import {
  acceptBiblioteca,
  hintBiblioteca,
  validarArquivoBiblioteca,
} from '@/servicos/casos_de_uso/regrasUpload'
import { dispararEvento } from '@/servicos/firebase/analytics'
import { ERROS, PARAMS_ERRO_FORMULARIO } from '@/enums/eventosAnalytics'

const route = useRoute()
const router = useRouter()
const { estado, nomeSetorAtivo, opcoesSetor, ehAdminGlobal } = usarSessao()

const opcoesTipo = TIPOS_ARQUIVO
const opcoesNivel = NIVEL_ARQUIVO_OPCOES

// Governança (Spec 18): só admin_global controla o escopo. Para os demais, os
// controles não são renderizados e o escopo é sempre 'setor' (setor ativo).
const podeGlobal = computed(() => ehAdminGlobal.value === true)

const accept = acceptBiblioteca()
const hint = computed(() => hintBiblioteca(form.tipo))

const ehEdicao = computed(() => !!route.params.id)
const carregandoInicial = ref(false)
const bloqueado = ref(false)
const salvando = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('')

const arquivoAtual = ref(null)
const arquivoSelecionado = ref(null)

const form = reactive({
  titulo: '',
  tipo: '',
  nivel_acesso: NIVEL_ARQUIVO.PUBLICO,
  // restringir = true  → escopo 'setor' (id_setor obrigatório)
  // restringir = false → escopo 'global' (só admin_global)
  restringir: true,
  id_setor: estado.setorAtivo || '',
})
const erros = reactive({})

// Snapshot dos valores iniciais para detectar alteração pendente (dirty-guard).
const formInicial = ref({
  titulo: '',
  tipo: '',
  nivel_acesso: NIVEL_ARQUIVO.PUBLICO,
  restringir: true,
  id_setor: estado.setorAtivo || '',
})

function aoAlternarRestringir(marcado) {
  form.restringir = marcado
  if (marcado && !form.id_setor) {
    form.id_setor = estado.setorAtivo || ''
  }
  delete erros.id_setor
}

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
    Number(form.nivel_acesso) !== Number(formInicial.value.nivel_acesso) ||
    form.restringir !== formInicial.value.restringir ||
    form.id_setor !== formInicial.value.id_setor
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

  // Escopo: só validamos o setor quando os controles são exibidos (admin_global)
  // e o arquivo está restrito ao setor. Caso contrário, o escopo é derivado no
  // submit (setor ativo). Exige setor dentre os setores do admin.
  if (podeGlobal.value && form.restringir && !estado.contexto?.ids_setor?.includes(form.id_setor)) {
    erros.id_setor = 'Selecione o setor.'
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

  const formulario = ehEdicao.value
    ? PARAMS_ERRO_FORMULARIO.BIBLIOTECA_EDITAR_ARQUIVO
    : PARAMS_ERRO_FORMULARIO.BIBLIOTECA_NOVO_ARQUIVO

  if (!validar()) {
    dispararEvento(ERROS.ERRO_FORMULARIO, { formulario, motivo: 'validacao' })
    return
  }

  salvando.value = true

  try {
    // Sem admin_global o escopo é sempre 'setor' no setor ativo; com admin_global
    // deriva da checkbox.
    const escopo =
      podeGlobal.value && !form.restringir ? ESCOPO_ARQUIVO.GLOBAL : ESCOPO_ARQUIVO.SETOR
    const idSetor =
      escopo === ESCOPO_ARQUIVO.SETOR ? (podeGlobal.value ? form.id_setor : estado.setorAtivo) : null
    const dados = {
      escopo,
      id_setor: idSetor,
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      nivel_acesso: Number(form.nivel_acesso),
      id_usuario: estado.contexto.id_usuario,
    }

    mensagemSucesso.value = await persistirArquivo(dados)
    setTimeout(() => router.push({ name: 'biblioteca' }), 600)
  } catch (e) {
    dispararEvento(ERROS.ERRO_FORMULARIO, { formulario, motivo: 'integracao' })
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

    // Guard (Spec 18 — continuação): edição de arquivo global exige admin_global.
    // Impede acesso direto por URL de quem não é elegível.
    if (escopoDoArquivo(doc) === ESCOPO_ARQUIVO.GLOBAL && !ehAdminGlobal.value) {
      bloqueado.value = true
      setTimeout(() => router.push({ name: 'biblioteca' }), 1200)
      return
    }

    form.titulo = doc.titulo || ''
    form.tipo = doc.tipo || ''
    form.nivel_acesso = doc.nivel_acesso || NIVEL_ARQUIVO.PUBLICO
    // Legados sem escopo são tratados como 'setor'.
    const escopo = escopoDoArquivo(doc)
    form.restringir = escopo === ESCOPO_ARQUIVO.SETOR
    form.id_setor = doc.id_setor || estado.setorAtivo || ''
    formInicial.value = {
      titulo: form.titulo,
      tipo: form.tipo,
      nivel_acesso: form.nivel_acesso,
      restringir: form.restringir,
      id_setor: form.id_setor,
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
.escopo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}
.escopo__check {
  display: flex;
  align-items: center;
  gap: var(--espaco-xs);
  font-size: var(--fonte-tamanho-md);
  color: var(--cor-texto);
  cursor: pointer;
}
.escopo__check input[disabled] {
  cursor: not-allowed;
}
.escopo__dica-setor {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--espaco-xs);
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-info);
  background: var(--cor-info-fundo);
}
.escopo__dica-global {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--espaco-xs);
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-alerta);
  background: var(--cor-alerta-fundo);
}
.escopo__dica-icone {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

/* Transição entre estados do formulário (carregando / bloqueado / card). */
.form-estado-enter-active,
.form-estado-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.form-estado-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.form-estado-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Transição entre as dicas de escopo (setor ↔ global). */
.dica-enter-active,
.dica-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.dica-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.dica-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Acessibilidade: respeita quem prefere menos movimento. */
@media (prefers-reduced-motion: reduce) {
  .form-estado-enter-active,
  .form-estado-leave-active,
  .dica-enter-active,
  .dica-leave-active {
    transition: opacity 0.12s ease;
  }
  .form-estado-enter-from,
  .form-estado-leave-to,
  .dica-enter-from,
  .dica-leave-to {
    transform: none;
  }
}
</style>
