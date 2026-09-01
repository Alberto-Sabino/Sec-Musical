<template>
  <label class="campo">
    <span v-if="rotulo" class="campo__rotulo">{{ rotulo }}</span>
    <select
      class="campo__controle"
      :class="{ 'campo__controle--erro': erro }"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opcao in opcoes" :key="opcao.valor" :value="opcao.valor">
        {{ opcao.rotulo }}
      </option>
    </select>
    <span v-if="erro" class="campo__erro">{{ erro }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  // opcoes: [{ valor, rotulo }]
  opcoes: { type: Array, default: () => [] },
  rotulo: String,
  placeholder: String,
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
  min-height: 44px;
  padding: 0 var(--espaco-md);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-md);
  font-size: var(--fonte-tamanho-md);
  background: var(--cor-superficie);
  color: var(--cor-texto);
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
