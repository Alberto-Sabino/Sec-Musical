<template>
  <label class="campo">
    <span v-if="rotulo" class="campo__rotulo">{{ rotulo }}</span>
    <textarea
      class="campo__controle"
      :class="{ 'campo__controle--erro': erro }"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <span v-if="erro" class="campo__erro">{{ erro }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  rotulo: String,
  placeholder: String,
  rows: { type: Number, default: 4 },
  erro: String,
  disabled: Boolean,
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xs);
}
.campo__rotulo {
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto-suave);
}
.campo__controle {
  padding: var(--espaco-sm) var(--espaco-md);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-md);
  font-family: inherit;
  background: var(--cor-superficie);
  color: var(--cor-texto);
  resize: vertical;
}
.campo__controle:focus {
  outline: none;
  border-color: var(--cor-primaria);
}
.campo__controle--erro {
  border-color: var(--cor-erro);
}
.campo__erro {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-erro);
}
</style>
