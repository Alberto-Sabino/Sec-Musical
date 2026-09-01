<template>
  <div v-if="arquivo" class="detalhe" role="dialog" aria-modal="true" @click.self="$emit('fechar')">
    <div class="detalhe__caixa">
      <div class="detalhe__cabecalho">
        <h2 class="detalhe__titulo">{{ arquivo.titulo }}</h2>
        <span
          v-if="mostrarNivel"
          class="detalhe__nivel"
          :class="ehRestrito ? 'detalhe__nivel--restrito' : 'detalhe__nivel--publico'"
        >
          {{ rotuloNivel }}
        </span>
      </div>

      <dl class="detalhe__dados">
        <div>
          <dt>Tipo</dt>
          <dd>{{ rotuloTipo }}</dd>
        </div>
        <div>
          <dt>Atualização</dt>
          <dd>{{ dataFormatada }}</dd>
        </div>
      </dl>

      <MensagemFeedback v-if="erroDownload" tipo="erro">
        {{ erroDownload }}
      </MensagemFeedback>

      <div class="detalhe__acoes">
        <BaseBotao variante="secundario" @click="$emit('fechar')">Fechar</BaseBotao>
        <BaseBotao :carregando="baixando" @click="baixar">Baixar</BaseBotao>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import {
  NIVEL_ARQUIVO,
  rotuloNivelArquivo,
  rotuloTipoArquivo,
  baixarArquivoBiblioteca,
} from '@/servicos/casos_de_uso/biblioteca'
import { formatarData } from '@/servicos/casos_de_uso/formato'
import { baixarBlob } from '@/servicos/casos_de_uso/download'

const props = defineProps({
  arquivo: { type: Object, default: null },
  // mostrarNivel: exibe sinalização público/restrito (uso admin).
  mostrarNivel: Boolean,
})
defineEmits(['fechar'])

const baixando = ref(false)
const erroDownload = ref('')

const ehRestrito = computed(() => props.arquivo?.nivel_acesso === NIVEL_ARQUIVO.RESTRITO)
const rotuloNivel = computed(() => rotuloNivelArquivo(props.arquivo?.nivel_acesso))
const rotuloTipo = computed(() => rotuloTipoArquivo(props.arquivo?.tipo) || '—')
const dataFormatada = computed(() => formatarData(props.arquivo?.data_atualizacao))

async function baixar() {
  erroDownload.value = ''
  baixando.value = true
  try {
    const { nome, blob } = await baixarArquivoBiblioteca(props.arquivo.id_nuvem)
    baixarBlob(nome, blob)
  } catch (e) {
    erroDownload.value = e?.message || 'Não foi possível baixar o arquivo.'
  } finally {
    baixando.value = false
  }
}
</script>

<style scoped>
.detalhe {
  position: fixed;
  inset: 0;
  background: rgba(28, 36, 48, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--espaco-md);
  z-index: 100;
}
.detalhe__caixa {
  background: var(--cor-superficie);
  border-radius: var(--raio-lg);
  padding: var(--espaco-lg);
  width: 100%;
  max-width: 480px;
}
.detalhe__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-md);
}
.detalhe__titulo {
  margin: 0;
  font-size: var(--fonte-tamanho-lg);
}
.detalhe__nivel {
  flex-shrink: 0;
  padding: 2px var(--espaco-sm);
  border-radius: 999px;
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
}
.detalhe__nivel--publico {
  color: var(--cor-sucesso);
  background: var(--cor-sucesso-fundo);
}
.detalhe__nivel--restrito {
  color: var(--cor-alerta);
  background: var(--cor-alerta-fundo);
}
.detalhe__dados {
  display: flex;
  gap: var(--espaco-lg);
  margin: 0 0 var(--espaco-lg);
}
.detalhe__dados dt {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.detalhe__dados dd {
  margin: var(--espaco-xs) 0 0;
  font-weight: 600;
}
.detalhe__acoes {
  display: flex;
  gap: var(--espaco-sm);
  justify-content: flex-end;
}
@media (min-width: 600px) {
  .detalhe {
    align-items: center;
  }
}
</style>
