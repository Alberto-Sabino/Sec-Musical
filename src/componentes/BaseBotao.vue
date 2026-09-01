<template>
  <button
    :type="type"
    :disabled="disabled || carregando"
    :class="['btn', `btn--${variante}`, { 'btn--bloco': bloco }]"
  >
    <span v-if="carregando" class="btn__spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variante: {
    type: String,
    default: 'primario', // primario | secundario | destrutivo
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: Boolean,
  carregando: Boolean,
  bloco: Boolean,
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-sm);
  min-height: 44px;
  padding: 0 var(--espaco-md);
  border: 1px solid transparent;
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-md);
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.btn--bloco {
  width: 100%;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--primario {
  background: var(--cor-primaria);
  color: #fff;
}
.btn--primario:not(:disabled):hover {
  background: var(--cor-primaria-escura);
}
.btn--secundario {
  background: var(--cor-superficie);
  color: var(--cor-primaria);
  border-color: var(--cor-borda);
}
.btn--secundario:not(:disabled):hover {
  border-color: var(--cor-primaria);
}
.btn--destrutivo {
  background: var(--cor-erro);
  color: #fff;
}
.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-girar 0.6s linear infinite;
}
@keyframes btn-girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
