<template>
  <div class="filtros">
    <div class="filtros__grupo">
      <span class="filtros__rotulo">Status</span>
      <div class="filtros__status">
        <button
          v-for="opcao in opcoesStatus"
          :key="opcao.valor"
          type="button"
          class="chip"
          :class="{ 'chip--ativo': status.includes(opcao.valor) }"
          :aria-pressed="status.includes(opcao.valor)"
          @click="alternarStatus(opcao.valor)"
        >
          {{ opcao.rotulo }}
        </button>
      </div>
    </div>

    <div class="filtros__grupo">
      <BaseSelect
        :model-value="tipo"
        rotulo="Tipo"
        placeholder="Todos os tipos"
        :opcoes="opcoesTipo"
        @update:modelValue="aoMudarTipo"
      />
    </div>
  </div>
</template>

<script setup>
import BaseSelect from '@/componentes/BaseSelect.vue'
import { STATUS_OPCOES, TIPOS_SOLICITACAO } from '@/servicos/casos_de_uso/solicitacoes'

// Filtros controlados: status é array (multiseleção); tipo é string única ('' = todos).
const props = defineProps({
  status: { type: Array, required: true },
  tipo: { type: String, default: '' },
})
const emit = defineEmits(['update:status', 'update:tipo'])

const opcoesStatus = STATUS_OPCOES
const opcoesTipo = TIPOS_SOLICITACAO

function alternarStatus(valor) {
  const atual = props.status
  const novo = atual.includes(valor) ? atual.filter((s) => s !== valor) : [...atual, valor]
  emit('update:status', novo)
}

function aoMudarTipo(valor) {
  emit('update:tipo', valor || '')
}
</script>

<style scoped>
.filtros {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  margin-bottom: var(--espaco-md);
}
.filtros__rotulo {
  display: block;
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto-suave);
  margin-bottom: var(--espaco-xs);
}
.filtros__status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-sm);
}
.chip {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: 999px;
  padding: var(--espaco-xs) var(--espaco-md);
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto-suave);
  cursor: pointer;
}
.chip--ativo {
  color: var(--cor-primaria);
  border-color: var(--cor-primaria);
  background: var(--cor-primaria-clara);
}
</style>
