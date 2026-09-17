<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Resultados da busca" :subtitulo="subtitulo" />

    <EstadoCarregando v-if="carregando" texto="Buscando..." />

    <MensagemFeedback v-else-if="erro" tipo="erro">{{ erro }}</MensagemFeedback>

    <EstadoVazio
      v-else-if="arquivos.length === 0"
      titulo="Nenhum arquivo encontrado"
      descricao="Tente buscar por outro nome ou termo semelhante."
    />

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id_arquivo">
        <BaseCard>
          <button
            class="item"
            :aria-label="`Abrir arquivo ${arquivo.titulo} - ${rotuloTipoArquivo(arquivo.tipo)}`"
            @click="abrir(arquivo)"
          >
            <span class="item__topo">
              <component :is="iconeTipoArquivo(arquivo.tipo)" class="item__icone" />
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
              <span>{{ rotuloTipoArquivo(arquivo.tipo) }}</span>
              <span>{{ formatarData(arquivo.data_atualizacao) }}</span>
              <span>{{ formatarTamanho(arquivo.tamanho_bytes) }}</span>
            </span>
          </button>
        </BaseCard>
      </li>
    </ul>

    <DetalheArquivo
      :arquivo="arquivoSelecionado"
      :mostrar-nivel="ehAdmin"
      @fechar="arquivoSelecionado = null"
    />
  </ContainerPagina>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import EstadoVazio from '@/componentes/EstadoVazio.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import DetalheArquivo from './DetalheArquivo.vue'
import { usarSessao } from '@/composables/usarSessao'
import {
  NIVEL_ARQUIVO,
  rotuloNivelArquivo,
  rotuloTipoArquivo,
  buscarBibliotecaPorNome,
} from '@/servicos/casos_de_uso/biblioteca'
import { formatarData, formatarTamanho } from '@/servicos/casos_de_uso/formato'
import { iconeTipoArquivo } from './apresentacaoTipos'

const route = useRoute()
const { estado, ehAdmin } = usarSessao()

const arquivos = ref([])
const carregando = ref(false)
const erro = ref('')
const arquivoSelecionado = ref(null)

const termo = computed(() => String(route.query.q || '').trim())
const subtitulo = computed(() => (termo.value ? `Resultados para “${termo.value}”` : ''))

function ehRestrito(arquivo) {
  return arquivo.nivel_acesso === NIVEL_ARQUIVO.RESTRITO
}

async function carregar() {
  if (!estado.contexto || !estado.setorAtivo || !termo.value) {
    arquivos.value = []
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    arquivos.value = await buscarBibliotecaPorNome({
      nivelAcesso: estado.contexto.nivel_acesso,
      idSetor: estado.setorAtivo,
      termo: termo.value,
    })
  } catch {
    erro.value = 'Não foi possível realizar a busca.'
  } finally {
    carregando.value = false
  }
}

function abrir(arquivo) {
  arquivoSelecionado.value = arquivo
}

watch(() => [termo.value, estado.setorAtivo], carregar)

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
</style>
