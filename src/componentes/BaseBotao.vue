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
    default: 'primario', // primario | secundario | destrutivo | destrutivo-sutil
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
  background: var(--cor-erro-fundo);
  color: var(--cor-erro);
  border-color: transparent;
}
.btn--destrutivo:not(:disabled):hover {
  border-color: var(--cor-erro);
}
/* Destrutivo sutil (ghost): menos domínio visual em listas (item por item),
   preservando o significado destrutivo pela cor do texto. */
.btn--destrutivo-sutil {
  background: none;
  color: var(--cor-erro);
  border-color: transparent;
}
.btn--destrutivo-sutil:not(:disabled):hover {
  background: var(--cor-erro-fundo);
}
.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  opacity: 0.7;
  animation: btn-girar 0.6s linear infinite;
}
@keyframes btn-girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
