<template>
  <div v-if="aberto" class="modal" role="dialog" aria-modal="true" @click.self="$emit('cancelar')">
    <div class="modal__caixa">
      <h2 class="modal__titulo">{{ titulo }}</h2>
      <p v-if="mensagem" class="modal__mensagem">{{ mensagem }}</p>
      <div class="modal__acoes">
        <BaseBotao variante="secundario" @click="$emit('cancelar')">
          {{ rotuloCancelar }}
        </BaseBotao>
        <BaseBotao
          :variante="destrutivo ? 'destrutivo' : 'primario'"
          :carregando="carregando"
          @click="$emit('confirmar')"
        >
          {{ rotuloConfirmar }}
        </BaseBotao>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseBotao from './BaseBotao.vue'

defineProps({
  aberto: Boolean,
  titulo: { type: String, default: 'Confirmar ação' },
  mensagem: String,
  rotuloConfirmar: { type: String, default: 'Confirmar' },
  rotuloCancelar: { type: String, default: 'Cancelar' },
  destrutivo: Boolean,
  carregando: Boolean,
})
defineEmits(['confirmar', 'cancelar'])
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(28, 36, 48, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--espaco-md);
  z-index: 100;
}
.modal__caixa {
  background: var(--cor-superficie);
  border-radius: var(--raio-lg);
  padding: var(--espaco-lg);
  width: 100%;
  max-width: 420px;
}
.modal__titulo {
  margin: 0 0 var(--espaco-sm);
  font-size: var(--fonte-tamanho-lg);
}
.modal__mensagem {
  margin: 0 0 var(--espaco-lg);
  color: var(--cor-texto-suave);
  font-size: var(--fonte-tamanho-md);
}
.modal__acoes {
  display: flex;
  gap: var(--espaco-sm);
  justify-content: flex-end;
}
@media (min-width: 600px) {
  .modal {
    align-items: center;
  }
}
</style>
