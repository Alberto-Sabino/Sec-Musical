<template>
  <header class="cabecalho">
    <div class="cabecalho__esquerda">
      <button
        v-if="mostrarVoltar"
        type="button"
        class="cabecalho__voltar"
        aria-label="Voltar"
        @click="aoClicarVoltar"
      >
        <IconeVoltar class="cabecalho__voltar-icone" />
      </button>
      <div class="cabecalho__texto">
        <h1 class="cabecalho__titulo">{{ titulo }}</h1>
        <p v-if="subtitulo" class="cabecalho__subtitulo">{{ subtitulo }}</p>
      </div>
    </div>
    <div v-if="$slots.acoes" class="cabecalho__acoes">
      <slot name="acoes" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconeVoltar from '@/componentes/icones/IconeVoltar.vue'
import { ehRotaInicialDeModulo, moduloDaRota } from '@/composables/usarNavegacaoModulos'

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: String,
  // Controle explícito do "← Voltar":
  //   null (default) — decide pelo módulo (telas internas de módulo mostram);
  //   true/false — força a exibição, para telas fora do conceito de módulo
  //   (ex.: autenticação), que não têm barra inferior nem entram no mapa.
  voltar: { type: Boolean, default: null },
})

const route = useRoute()
const router = useRouter()

// "← Voltar" aparece em telas internas de módulo (não nas iniciais) e usa o
// histórico real da navegação. Telas fora de módulo podem forçar via prop `voltar`.
const mostrarVoltar = computed(() => {
  if (props.voltar !== null) {
    return props.voltar
  }
  const modulo = moduloDaRota(route.name)
  return modulo !== null && !ehRotaInicialDeModulo(route.name)
})

function aoClicarVoltar() {
  router.back()
}
</script>

<style scoped>
.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-md);
  margin-bottom: var(--espaco-lg);
}
.cabecalho__esquerda {
  display: flex;
  align-items: flex-start;
  gap: var(--espaco-sm);
  min-width: 0;
}
.cabecalho__voltar {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: var(--espaco-xs);
  margin: 0;
  cursor: pointer;
  color: var(--cor-texto);
  display: inline-flex;
  align-items: center;
}
.cabecalho__voltar-icone {
  width: 22px;
  height: 22px;
}
.cabecalho__titulo {
  margin: 0;
  font-size: var(--fonte-tamanho-xl);
}
.cabecalho__subtitulo {
  margin: var(--espaco-xs) 0 0;
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.cabecalho__acoes {
  flex-shrink: 0;
  display: flex;
  gap: var(--espaco-md);
}
</style>
