<template>
  <main class="container">
    <slot />
  </main>
</template>

<script setup></script>

<style scoped>
.container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--espaco-lg) var(--espaco-md);
}
</style>
