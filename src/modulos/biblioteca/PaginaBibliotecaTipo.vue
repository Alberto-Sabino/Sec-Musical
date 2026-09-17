<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Biblioteca" :subtitulo="subtitulo" />

    <EstadoCarregando v-if="carregandoInicial" texto="Carregando arquivos..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="arquivos.length === 0"
      titulo="Nenhum arquivo disponível"
      descricao="Ainda não há arquivos nesta categoria para o setor ativo."
    />

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id_arquivo">
        <BaseCard>
          <button
            class="item"
            :aria-label="`Abrir arquivo ${arquivo.titulo}`"
            @click="abrir(arquivo)"
          >
            <span class="item__topo">
              <component :is="iconeTipo" class="item__icone" />
              <span class="item__titulo">{{ arquivo.titulo }}</span>
              <span
                v-if="ehAdmin"
                class="item__nivel"
                :class="ehRestrito(arquivo) ? 'item__nivel--restrito' : 'item__nivel--publico'"
              >
                {{ rotuloNivelArquivo(arquivo.nivel_acesso) }}
              </span>
            </span>
            <span class="item__meta">
              <span>{{ formatarData(arquivo.data_atualizacao) }}</span>
              <span>{{ formatarTamanho(arquivo.tamanho_bytes) }}</span>
            </span>
          </button>

          <div v-if="ehAdmin" class="item__acoes">
            <BaseBotao variante="secundario" @click="irParaEdicao(arquivo)">Editar</BaseBotao>
            <BaseBotao variante="destrutivo-sutil" @click="pedirRemocao(arquivo)">
              Remover
            </BaseBotao>
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
      :mensagem="`Remover o arquivo \u201c${arquivoParaRemover?.titulo}\u201d? Esta ação não poderá ser desfeita.`"
      rotulo-confirmar="Remover arquivo"
      destrutivo
      :carregando="removendo"
      @confirmar="confirmarRemocao"
      @cancelar="arquivoParaRemover = null"
    />
  </ContainerPagina>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
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
  listarBibliotecaPorTipo,
} from '@/servicos/casos_de_uso/biblioteca'
import { excluirArquivo } from '@/servicos/casos_de_uso/bibliotecaAdmin'
import { formatarData, formatarTamanho } from '@/servicos/casos_de_uso/formato'
import { iconeTipoArquivo } from './apresentacaoTipos'

const route = useRoute()
const router = useRouter()
const { estado, ehAdmin, nomeSetorAtivo } = usarSessao()

const arquivos = ref([])
const carregandoInicial = ref(true)
const erro = ref('')
const arquivoSelecionado = ref(null)
const arquivoParaRemover = ref(null)
const removendo = ref(false)

const tipo = computed(() => String(route.params.tipo || ''))
const tipoValido = computed(() => TIPOS_ARQUIVO.some((t) => t.valor === tipo.value))
const iconeTipo = computed(() => iconeTipoArquivo(tipo.value))
const subtitulo = computed(() => `${nomeSetorAtivo.value} · Tipo: ${rotuloTipoArquivo(tipo.value)}`)

function ehRestrito(arquivo) {
  return arquivo.nivel_acesso === NIVEL_ARQUIVO.RESTRITO
}

async function carregar() {
  // Tipo inválido não deve renderizar tela inconsistente; volta para a Biblioteca.
  if (!tipoValido.value) {
    router.replace({ name: 'biblioteca' })
    return
  }

  if (!estado.contexto || !estado.setorAtivo) {
    return
  }

  erro.value = ''

  try {
    arquivos.value = await listarBibliotecaPorTipo({
      nivelAcesso: estado.contexto.nivel_acesso,
      idSetor: estado.setorAtivo,
      tipo: tipo.value,
    })
  } catch {
    erro.value = 'Não foi possível carregar os arquivos.'
  } finally {
    carregandoInicial.value = false
  }
}

function abrir(arquivo) {
  arquivoSelecionado.value = arquivo
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

// Recarrega ao trocar de tipo ou de setor.
watch(() => [tipo.value, estado.setorAtivo], carregar)

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
  gap: var(--espaco-sm);
}
.item__icone {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--cor-primaria);
}
.item__titulo {
  font-weight: 600;
  color: var(--cor-texto);
  flex: 1;
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
  padding-left: calc(20px + var(--espaco-sm));
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
