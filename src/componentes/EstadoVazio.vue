<template>
  <div class="vazio">
    <p class="vazio__titulo">{{ titulo }}</p>
    <p v-if="descricao" class="vazio__descricao">{{ descricao }}</p>
    <div v-if="$slots.acao" class="vazio__acao">
      <slot name="acao" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: 'Nada por aqui' },
  descricao: String,
})
</script>

<style scoped>
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--espaco-sm);
  padding: var(--espaco-xl) var(--espaco-md);
  text-align: center;
  color: var(--cor-texto-suave);
}
.vazio__titulo {
  margin: 0;
  font-weight: 600;
  color: var(--cor-texto);
}
.vazio__descricao {
  margin: 0;
  font-size: var(--fonte-tamanho-sm);
}
.vazio__acao {
  margin-top: var(--espaco-sm);
}
</style>
