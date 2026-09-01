<template>
  <span class="badge" :class="`badge--${status}`">{{ rotulo }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_ROTULOS } from '@/servicos/casos_de_uso/solicitacoes'

// Status oficiais: em_aberto | em_andamento | concluida | cancelada
const props = defineProps({
  status: { type: String, required: true },
})

const rotulo = computed(() => STATUS_ROTULOS[props.status] || props.status)
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px var(--espaco-sm);
  border-radius: 999px;
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  line-height: 1.6;
}
.badge--em_aberto {
  color: var(--status-em-aberto);
  background: var(--status-em-aberto-fundo);
}
.badge--em_andamento {
  color: var(--status-em-andamento);
  background: var(--status-em-andamento-fundo);
}
.badge--concluida {
  color: var(--status-concluida);
  background: var(--status-concluida-fundo);
}
.badge--cancelada {
  color: var(--status-cancelada);
  background: var(--status-cancelada-fundo);
}
</style>
