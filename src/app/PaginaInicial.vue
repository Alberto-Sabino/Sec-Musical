<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Início" :subtitulo="saudacao">
      <template #acoes>
        <BaseBotao variante="secundario" :carregando="saindo" @click="sair"> Sair </BaseBotao>
      </template>
    </CabecalhoPagina>

    <BaseCard>
      <p class="perfil">
        Perfil:
        <strong>{{ ehAdmin ? 'Secretário Musical' : 'Encarregado Local' }}</strong>
      </p>

      <div v-if="ehAdmin" class="setor">
        <BaseSelect
          v-model="setorSelecionado"
          rotulo="Setor ativo"
          :opcoes="opcoesSetor"
          @update:modelValue="trocarSetor"
        />
      </div>
      <p v-else class="setor__unico">
        Setor: <strong>{{ nomeSetorAtivo }}</strong>
      </p>
    </BaseCard>

    <div class="navegacao">
      <BaseBotao bloco @click="irParaBiblioteca">Abrir Biblioteca</BaseBotao>
      <BaseBotao v-if="ehAdmin" bloco variante="secundario" @click="irParaFila"
        >Fila de solicitações</BaseBotao
      >
      <BaseBotao v-else bloco variante="secundario" @click="irParaSolicitacoes"
        >Minhas solicitações</BaseBotao
      >
    </div>
  </ContainerPagina>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import BaseSelect from '@/componentes/BaseSelect.vue'
import { usarSessao } from '@/composables/usarSessao'

const router = useRouter()
const { estado, ehAdmin, opcoesSetor, nomeSetorAtivo, logout, definirSetorAtivo } = usarSessao()

const saindo = ref(false)
const setorSelecionado = ref(estado.setorAtivo)

const saudacao = computed(() => {
  const nome = estado.contexto?.nome_completo
  return nome ? `Bem-vindo, ${nome}` : 'Sessão ativa'
})

// Mantém o select em sincronia com o setor ativo resolvido na sessão.
watch(
  () => estado.setorAtivo,
  (novo) => {
    setorSelecionado.value = novo
  },
)

function trocarSetor(idSetor) {
  definirSetorAtivo(idSetor)
}

async function sair() {
  saindo.value = true
  await logout()
  router.replace({ name: 'login' })
}

function irParaBiblioteca() {
  router.push({ name: 'biblioteca' })
}

function irParaSolicitacoes() {
  router.push({ name: 'minhas-solicitacoes' })
}

function irParaFila() {
  router.push({ name: 'fila-solicitacoes' })
}
</script>

<style scoped>
.perfil {
  margin: 0 0 var(--espaco-md);
}
.setor__unico {
  margin: 0;
}
.navegacao {
  margin-top: var(--espaco-md);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
</style>
