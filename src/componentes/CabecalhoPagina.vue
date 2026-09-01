<template>
  <header class="cabecalho">
    <div class="cabecalho__texto">
      <h1 class="cabecalho__titulo">{{ titulo }}</h1>
      <p v-if="subtitulo" class="cabecalho__subtitulo">{{ subtitulo }}</p>
    </div>
    <div v-if="$slots.acoes" class="cabecalho__acoes">
      <slot name="acoes" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: String,
})
</script>

<style scoped>
.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-md);
  margin-bottom: var(--espaco-lg);
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
