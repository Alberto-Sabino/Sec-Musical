<template>
  <div class="carregando" role="status">
    <span class="carregando__spinner" aria-hidden="true"></span>
    <span class="carregando__texto">{{ texto }}</span>
  </div>
</template>

<script setup>
defineProps({
  texto: { type: String, default: 'Carregando...' },
})
</script>

<style scoped>
.carregando {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--espaco-sm);
  padding: var(--espaco-xl) var(--espaco-md);
  color: var(--cor-texto-suave);
}
.carregando__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--cor-borda);
  border-top-color: var(--cor-primaria);
  border-radius: 50%;
  animation: carregando-girar 0.7s linear infinite;
}
@keyframes carregando-girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
