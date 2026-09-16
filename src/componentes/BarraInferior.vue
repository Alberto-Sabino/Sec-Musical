<template>
  <nav class="barra" aria-label="Navegação principal">
    <!-- Indicador do módulo ativo: desliza suavemente ao trocar de módulo. -->
    <span
      v-if="indiceAtivo >= 0"
      class="barra__indicador"
      :style="{
        width: `${100 / itens.length}%`,
        transform: `translateX(${indiceAtivo * 100}%)`,
      }"
      aria-hidden="true"
    ></span>
    <button
      v-for="item in itens"
      :key="item.modulo"
      class="barra__item"
      :class="{ 'barra__item--ativo': item.modulo === moduloAtivo }"
      :aria-current="item.modulo === moduloAtivo ? 'page' : undefined"
      @click="navegar(item.modulo)"
    >
      <component :is="item.icone" class="barra__icone" />
      <span class="barra__rotulo">{{ item.rotulo }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconeInicio from '@/componentes/icones/IconeInicio.vue'
import IconeBiblioteca from '@/componentes/icones/IconeBiblioteca.vue'
import IconeSolicitacoes from '@/componentes/icones/IconeSolicitacoes.vue'
import { usarSessao } from '@/composables/usarSessao'
import { MODULO, moduloDaRota, destinoDoModulo } from '@/composables/usarNavegacaoModulos'

const route = useRoute()
const router = useRouter()
const { ehAdmin } = usarSessao()

const itens = [
  { modulo: MODULO.INICIO, rotulo: 'Início', icone: IconeInicio },
  { modulo: MODULO.BIBLIOTECA, rotulo: 'Biblioteca', icone: IconeBiblioteca },
  { modulo: MODULO.SOLICITACOES, rotulo: 'Solicitações', icone: IconeSolicitacoes },
]

const moduloAtivo = computed(() => moduloDaRota(route.name))
const indiceAtivo = computed(() => itens.findIndex((i) => i.modulo === moduloAtivo.value))

function navegar(modulo) {
  const destino = destinoDoModulo(modulo, ehAdmin.value)
  // Evita navegação redundante para a própria rota inicial do módulo.
  if (destino.name !== route.name) {
    router.push(destino)
  }
}
</script>

<style scoped>
.barra {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  background: var(--cor-superficie);
  border-top: 1px solid var(--cor-borda);
  padding: var(--espaco-xs) 0 env(safe-area-inset-bottom, 0);
}
/* Indicador do módulo ativo: barra superior em cor primária que desliza. */
.barra__indicador {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  border-radius: 0 0 var(--raio-sm) var(--raio-sm);
  background: var(--cor-primaria);
  /* O deslize acontece via translateX (transform) para animação suave e leve. */
  transition: transform 0.25s ease;
  /* Recuo lateral para o traço não ocupar a largura inteira do item. */
  padding: 0 4%;
  background-clip: content-box;
}
.barra__item {
  position: relative;
  flex: 1;
  min-height: 56px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--espaco-sm) var(--espaco-xs);
  color: var(--cor-texto-suave);
  transition: color 0.2s ease;
}
.barra__item--ativo {
  color: var(--cor-primaria);
}
/* Respeita usuários que preferem menos movimento. */
@media (prefers-reduced-motion: reduce) {
  .barra__indicador {
    transition: none;
  }
}
.barra__icone {
  width: 22px;
  height: 22px;
}
.barra__rotulo {
  font-size: var(--fonte-tamanho-sm);
  font-weight: 600;
}
</style>
