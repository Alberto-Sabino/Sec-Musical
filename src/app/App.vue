<template>
  <div class="app" :class="{ 'app--com-barra': mostrarBarra }">
    <router-view />
    <BarraInferior v-if="mostrarBarra" />

    <!-- Confirmação de saída de formulário com alterações não salvas (dirty-guard). -->
    <div
      v-if="confirmacaoSaida.aberta"
      class="saida"
      role="dialog"
      aria-modal="true"
      @click.self="responder(false)"
    >
      <div
        ref="caixaSaida"
        class="saida__caixa"
        tabindex="-1"
        aria-label="Deseja mesmo sair dessa tela?"
      >
        <h2 class="saida__titulo">Deseja sair dessa tela?</h2>
        <p class="saida__mensagem">
          Existem alterações não salvas nesse formulário. Se você sair agora, elas serão
          descartadas.
        </p>
        <div class="saida__acoes acoes-responsivas">
          <BaseBotao variante="secundario" @click="responder(false)">Continuar aqui</BaseBotao>
          <BaseBotao variante="destrutivo" @click="responder(true)">Sair mesmo assim</BaseBotao>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import BarraInferior from '@/componentes/BarraInferior.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import { usarSessao } from '@/composables/usarSessao'
import { confirmacaoSaida, responderConfirmacaoSaida } from '@/composables/usarGuardaFormulario'
import { usarModalAcessivel } from '@/composables/usarModalAcessivel'

const route = useRoute()
const { estado } = usarSessao()

// A barra aparece em toda a área autenticada; nunca na tela de login.
const mostrarBarra = computed(
  () => estado.autenticado && route.name !== 'login' && route.meta?.requerAuth === true,
)

function responder(sair) {
  responderConfirmacaoSaida(sair)
}

// Acessibilidade da modal de saída: Esc equivale a "Continuar aqui" (ação segura).
const caixaSaida = ref(null)
usarModalAcessivel(
  computed(() => confirmacaoSaida.aberta),
  caixaSaida,
  () => responder(false),
)
</script>

<style scoped>
.app {
  min-height: 100vh;
}
/* Espaço para o conteúdo não ficar sob a barra fixa. */
.app--com-barra {
  padding-bottom: 84px;
}
/* Modal centralizada de confirmação de saída. */
.saida {
  position: fixed;
  inset: 0;
  background: rgba(28, 36, 48, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-md);
  z-index: 200;
}
.saida__caixa {
  background: var(--cor-superficie);
  border-radius: var(--raio-lg);
  padding: var(--espaco-lg);
  width: 100%;
  max-width: 420px;
}
.saida__titulo {
  margin: 0 0 var(--espaco-sm);
  font-size: var(--fonte-tamanho-lg);
}
.saida__mensagem {
  margin: 0 0 var(--espaco-lg);
  color: var(--cor-texto-suave);
  font-size: var(--fonte-tamanho-md);
}
/* Ordem: dispensar (secundária) à esquerda; destrutiva à direita. Layout responsivo via .acoes-responsivas. */
</style>
