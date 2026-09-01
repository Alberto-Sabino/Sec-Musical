<template>
  <div class="uploader">
    <span v-if="rotulo" class="uploader__rotulo">{{ rotulo }}</span>
    <label class="uploader__area" :class="{ 'uploader__area--erro': erro }">
      <input
        class="uploader__input"
        type="file"
        :accept="accept"
        :disabled="disabled"
        @change="aoSelecionar"
      />
      <span class="uploader__texto">
        {{ nomeArquivo || textoPadrao }}
      </span>
    </label>
    <span v-if="erro" class="uploader__erro">{{ erro }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  rotulo: String,
  accept: { type: String, default: '.pdf' },
  textoPadrao: { type: String, default: 'Selecionar arquivo' },
  erro: String,
  disabled: Boolean,
})
const emit = defineEmits(['selecionar'])

const nomeArquivo = ref('')

function aoSelecionar(evento) {
  const arquivo = evento.target.files?.[0] || null
  nomeArquivo.value = arquivo ? arquivo.name : ''
  emit('selecionar', arquivo)
}
</script>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xs);
}
.uploader__rotulo {
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
  color: var(--cor-texto-suave);
}
.uploader__area {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--espaco-md);
  border: 1px dashed var(--cor-borda);
  border-radius: var(--raio-md);
  background: var(--cor-superficie);
  cursor: pointer;
}
.uploader__area--erro {
  border-color: var(--cor-erro);
}
.uploader__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}
.uploader__texto {
  font-size: var(--fonte-tamanho-md);
  color: var(--cor-texto-suave);
}
.uploader__erro {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-erro);
}
</style>
