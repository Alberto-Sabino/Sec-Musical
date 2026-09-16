<template>
  <nav v-if="totalPaginas > 1" class="paginacao" aria-label="Paginação">
    <div class="paginacao__info">
      {{ totalItens }} itens · página {{ pagina }} de {{ totalPaginas }}
    </div>
    <div class="paginacao__controles">
      <button
        type="button"
        class="paginacao__botao"
        :disabled="pagina <= 1"
        @click="ir(pagina - 1)"
      >
        Anterior
      </button>
      <button
        v-for="p in paginas"
        :key="p"
        type="button"
        class="paginacao__botao"
        :class="{ 'paginacao__botao--ativo': p === pagina }"
        @click="ir(p)"
      >
        {{ p }}
      </button>
      <button
        type="button"
        class="paginacao__botao"
        :disabled="pagina >= totalPaginas"
        @click="ir(pagina + 1)"
      >
        Próxima
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

// Paginação controlada. Nunca aponta para página inexistente.
const props = defineProps({
  pagina: { type: Number, required: true },
  totalItens: { type: Number, required: true },
  porPagina: { type: Number, default: 15 },
})
const emit = defineEmits(['update:pagina'])

const totalPaginas = computed(() => Math.max(1, Math.ceil(props.totalItens / props.porPagina)))
const paginas = computed(() => Array.from({ length: totalPaginas.value }, (_, i) => i + 1))

function ir(p) {
  const destino = Math.min(Math.max(1, p), totalPaginas.value)
  if (destino !== props.pagina) {
    emit('update:pagina', destino)
  }
}
</script>

<style scoped>
.paginacao {
  margin-top: var(--espaco-lg);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  align-items: center;
}
.paginacao__info {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.paginacao__controles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-xs);
  justify-content: center;
}
.paginacao__botao {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-sm);
  padding: var(--espaco-xs) var(--espaco-sm);
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto);
  cursor: pointer;
  min-width: 36px;
}
.paginacao__botao:disabled {
  opacity: 0.5;
  cursor: default;
}
.paginacao__botao--ativo {
  color: var(--cor-primaria);
  border-color: var(--cor-primaria);
  background: var(--cor-primaria-clara);
}
</style>
