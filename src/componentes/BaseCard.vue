<template>
  <div class="card">
    <slot />
  </div>
</template>

<script setup></script>

<style scoped>
.card {
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-lg);
  box-shadow: var(--sombra-card);
  padding: var(--espaco-md);
  margin-bottom: var(--espaco-md);
}
.card:last-child {
  margin-bottom: 0;
}
</style>
