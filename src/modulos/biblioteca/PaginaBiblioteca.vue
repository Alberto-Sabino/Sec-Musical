<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Biblioteca" :subtitulo="`Setor ativo: ${nomeSetorAtivo}`">
      <template #acoes>
        <BaseBotao v-if="ehAdmin" @click="irParaNovo">Novo arquivo</BaseBotao>
        <BaseBotao variante="secundario" @click="irParaInicio">Início</BaseBotao>
      </template>
    </CabecalhoPagina>

    <div class="filtro">
      <BaseSelect
        v-model="tipoSelecionado"
        rotulo="Filtrar por tipo"
        placeholder="Todos os tipos"
        :opcoes="opcoesTipo"
        @update:modelValue="carregar"
      />
    </div>

    <EstadoCarregando v-if="carregando" texto="Carregando biblioteca..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">
      {{ erro }}
    </MensagemFeedback>

    <EstadoVazio
      v-else-if="arquivos.length === 0"
      titulo="Nenhum arquivo encontrado"
      :descricao="
        tipoSelecionado ? 'Tente remover o filtro de tipo.' : 'Ainda não há documentos neste setor.'
      "
    />

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id_arquivo">
        <BaseCard>
          <button class="item" @click="abrir(arquivo)">
            <div class="item__topo">
              <span class="item__titulo">{{ arquivo.titulo }}</span>
              <span
                v-if="ehAdmin"
                class="item__nivel"
                :class="ehRestrito(arquivo) ? 'item__nivel--restrito' : 'item__nivel--publico'"
              >
                {{ rotuloNivelArquivo(arquivo.nivel_acesso) }}
              </span>
            </div>
            <div class="item__meta">
              <span>{{ rotuloTipoArquivo(arquivo.tipo) }}</span>
              <span>{{ formatarData(arquivo.data_atualizacao) }}</span>
            </div>
          </button>

          <div v-if="ehAdmin" class="item__acoes">
            <BaseBotao variante="secundario" @click="irParaEdicao(arquivo)">Editar</BaseBotao>
            <BaseBotao variante="destrutivo" @click="pedirRemocao(arquivo)">Remover</BaseBotao>
          </div>
        </BaseCard>
      </li>
    </ul>

    <DetalheArquivo
      :arquivo="arquivoSelecionado"
      :mostrar-nivel="ehAdmin"
      @fechar="arquivoSelecionado = null"
    />

    <ModalConfirmacao
      :aberto="!!arquivoParaRemover"
      titulo="Remover arquivo"
      :mensagem="`Remover \u201c${arquivoParaRemover?.titulo}\u201d? Esta ação não pode ser desfeita.`"
      rotulo-confirmar="Remover"
      destrutivo
      :carregando="removendo"
      @confirmar="confirmarRemocao"
      @cancelar="arquivoParaRemover = null"
    />
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
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import ModalConfirmacao from '@/componentes/ModalConfirmacao.vue'
import DetalheArquivo from './DetalheArquivo.vue'
import { usarSessao } from '@/composables/usarSessao'
import {
  TIPOS_ARQUIVO,
  NIVEL_ARQUIVO,
  rotuloNivelArquivo,
  rotuloTipoArquivo,
  listarBiblioteca,
} from '@/servicos/casos_de_uso/biblioteca'
import { excluirArquivo } from '@/servicos/casos_de_uso/bibliotecaAdmin'
import { formatarData } from '@/servicos/casos_de_uso/formato'

const router = useRouter()
const { estado, ehAdmin, nomeSetorAtivo } = usarSessao()

const arquivos = ref([])
const carregando = ref(false)
const erro = ref('')
const tipoSelecionado = ref('')
const arquivoSelecionado = ref(null)
const arquivoParaRemover = ref(null)
const removendo = ref(false)

const opcoesTipo = TIPOS_ARQUIVO

function ehRestrito(arquivo) {
  return arquivo.nivel_acesso === NIVEL_ARQUIVO.RESTRITO
}

async function carregar() {
  if (!estado.contexto || !estado.setorAtivo) {
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    arquivos.value = await listarBiblioteca({
      nivelAcesso: estado.contexto.nivel_acesso,
      idSetor: estado.setorAtivo,
      tipo: tipoSelecionado.value || null,
    })
  } catch {
    erro.value = 'Não foi possível carregar a biblioteca. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

function abrir(arquivo) {
  arquivoSelecionado.value = arquivo
}

function irParaInicio() {
  router.push({ name: 'inicio' })
}

function irParaNovo() {
  router.push({ name: 'arquivo-novo' })
}

function irParaEdicao(arquivo) {
  router.push({ name: 'arquivo-editar', params: { id: arquivo.id_arquivo } })
}

function pedirRemocao(arquivo) {
  arquivoParaRemover.value = arquivo
}

async function confirmarRemocao() {
  if (!arquivoParaRemover.value) {
    return
  }
  removendo.value = true
  try {
    await excluirArquivo(arquivoParaRemover.value, estado.contexto.id_usuario)
    arquivoParaRemover.value = null
    await carregar()
  } catch {
    erro.value = 'Não foi possível remover o arquivo.'
  } finally {
    removendo.value = false
  }
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
.item__nivel {
  flex-shrink: 0;
  padding: 2px var(--espaco-sm);
  border-radius: 999px;
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
}
.item__nivel--publico {
  color: var(--cor-sucesso);
  background: var(--cor-sucesso-fundo);
}
.item__nivel--restrito {
  color: var(--cor-alerta);
  background: var(--cor-alerta-fundo);
}
.item__meta {
  display: flex;
  gap: var(--espaco-md);
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.item__acoes {
  display: flex;
  gap: var(--espaco-md);
  justify-content: flex-end;
  margin-top: var(--espaco-md);
  padding-top: var(--espaco-md);
  border-top: 1px solid var(--cor-borda);
}
</style>
