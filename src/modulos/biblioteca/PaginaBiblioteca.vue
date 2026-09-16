<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Biblioteca" :subtitulo="`Setor ativo: ${nomeSetorAtivo}`">
      <template v-if="ehAdmin" #acoes>
        <BaseBotao variante="secundario" @click="irParaNovo">Novo arquivo</BaseBotao>
      </template>
    </CabecalhoPagina>

    <!-- Busca por nome (só na tela inicial) -->
    <form class="busca" @submit.prevent="buscar">
      <BaseInput v-model="termo" rotulo="Buscar" placeholder="Buscar..." />
      <BaseBotao type="submit" :disabled="!termo.trim()">Buscar</BaseBotao>
    </form>

    <!-- Cards de tipo -->
    <ul class="tipos">
      <li v-for="t in tipos" :key="t.valor">
        <BaseCard class="tipo">
          <button class="tipo__botao" :aria-label="`Abrir ${t.rotulo}`" @click="abrirTipo(t.valor)">
            <component :is="t.icone" class="tipo__icone" />
            <span class="tipo__texto">
              <span class="tipo__titulo">{{ t.rotulo }}</span>
              <span class="tipo__descricao">{{ t.descricao }}</span>
            </span>
          </button>
        </BaseCard>
      </li>
    </ul>
  </ContainerPagina>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import BaseInput from '@/componentes/BaseInput.vue'
import { usarSessao } from '@/composables/usarSessao'
import { TIPOS_ARQUIVO } from '@/servicos/casos_de_uso/biblioteca'
import { iconeTipoArquivo, descricaoTipoArquivo } from './apresentacaoTipos'

const router = useRouter()
const { ehAdmin, nomeSetorAtivo } = usarSessao()

const termo = ref('')

// Cards montados a partir dos tipos oficiais + camada de apresentação.
const tipos = TIPOS_ARQUIVO.map((t) => ({
  valor: t.valor,
  rotulo: t.rotulo,
  icone: iconeTipoArquivo(t.valor),
  descricao: descricaoTipoArquivo(t.valor),
}))

function buscar() {
  const q = termo.value.trim()
  if (!q) {
    return
  }
  router.push({ name: 'biblioteca-busca', query: { q } })
}

function abrirTipo(tipo) {
  router.push({ name: 'biblioteca-tipo', params: { tipo } })
}

function irParaNovo() {
  router.push({ name: 'arquivo-novo' })
}
</script>

<style scoped>
.busca {
  display: flex;
  align-items: flex-end;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-lg);
}
.busca :deep(.campo) {
  flex: 1;
}
.tipos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.tipo__botao {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
  color: var(--cor-texto);
}
.tipo__icone {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: var(--cor-primaria);
}
.tipo__texto {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xs);
}
.tipo__titulo {
  font-weight: 600;
  font-size: var(--fonte-tamanho-lg);
}
.tipo__descricao {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
</style>
