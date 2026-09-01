<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Portal Musical" subtitulo="Acesse com suas credenciais" />

    <BaseCard>
      <form class="login" @submit.prevent="enviar">
        <BaseInput v-model="email" rotulo="E-mail" type="email" placeholder="seu@email.com" />
        <BaseInput v-model="senha" rotulo="Senha" type="password" placeholder="Sua senha" />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">
          {{ mensagemErro }}
        </MensagemFeedback>

        <BaseBotao type="submit" bloco :carregando="enviando"> Entrar </BaseBotao>
      </form>
    </BaseCard>
  </ContainerPagina>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseInput from '@/componentes/BaseInput.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import { usarSessao } from '@/composables/usarSessao'

const router = useRouter()
const { estado, login } = usarSessao()

const email = ref('')
const senha = ref('')
const enviando = ref(false)
const mensagemErro = ref('')

const motivos = {
  sem_documento: 'Sua conta não possui contexto operacional válido.',
  inativo: 'Sua conta está inativa. Procure o administrador.',
  sem_setor: 'Sua conta não possui setor associado.',
}

async function enviar() {
  mensagemErro.value = ''
  enviando.value = true
  try {
    await login(email.value.trim(), senha.value)
    // O redirecionamento efetivo depende do resultado do contexto (watch abaixo).
  } catch {
    mensagemErro.value = 'E-mail ou senha inválidos.'
    enviando.value = false
  }
}

// Reage ao resultado do carregamento de contexto disparado pelo observador.
watch(
  () => [estado.autenticado, estado.erroContexto, estado.carregandoContexto],
  ([autenticado, erro, carregando]) => {
    if (autenticado) {
      enviando.value = false
      router.replace({ name: 'inicio' })
      return
    }
    if (!carregando && erro) {
      enviando.value = false
      mensagemErro.value = motivos[erro] || 'Não foi possível iniciar a sessão.'
    }
  },
)
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
</style>
