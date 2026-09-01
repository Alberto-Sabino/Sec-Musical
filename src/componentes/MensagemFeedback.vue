<template>
  <div class="feedback" :class="`feedback--${tipo}`" role="alert">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  // tipo: sucesso | erro | alerta | info
  tipo: { type: String, default: 'info' },
})
</script>

<style scoped>
.feedback {
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-sm);
}
.feedback--sucesso {
  color: var(--cor-sucesso);
  background: var(--cor-sucesso-fundo);
}
.feedback--erro {
  color: var(--cor-erro);
  background: var(--cor-erro-fundo);
}
.feedback--alerta {
  color: var(--cor-alerta);
  background: var(--cor-alerta-fundo);
}
.feedback--info {
  color: var(--cor-info);
  background: var(--cor-info-fundo);
}
</style>
