<template>
  <ContainerPagina>
    <CabecalhoPagina
      :voltar="true"
      titulo="Recuperar senha"
      subtitulo="Enviaremos um e-mail para redefinir sua senha"
    />

    <BaseCard>
      <form v-if="!enviado" class="recuperar" @submit.prevent="enviar">
        <BaseInput
          v-model="email"
          rotulo="E-mail"
          type="email"
          placeholder="seu@email.com"
          :erro="erroCampo"
          :disabled="enviando"
        />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">
          {{ mensagemErro }}
        </MensagemFeedback>

        <BaseBotao type="submit" bloco :carregando="enviando"> Enviar e-mail </BaseBotao>
      </form>

      <div v-else class="recuperar">
        <MensagemFeedback tipo="sucesso">
          Se o e-mail informado estiver cadastrado, enviamos um link para redefinir a senha.
          Verifique sua caixa de entrada e o spam.
        </MensagemFeedback>

        <BaseBotao variante="secundario" bloco @click="voltarLogin"> Voltar ao login </BaseBotao>
      </div>
    </BaseCard>
  </ContainerPagina>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseInput from '@/componentes/BaseInput.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import { solicitarRedefinicaoSenha } from '@/servicos/casos_de_uso/autenticacao'
import { validarEmailRecuperacao } from '@/servicos/casos_de_uso/senha'

const router = useRouter()

const email = ref('')
const enviando = ref(false)
const enviado = ref(false)
const erroCampo = ref('')
const mensagemErro = ref('')

async function enviar() {
  erroCampo.value = ''
  mensagemErro.value = ''

  const validacao = validarEmailRecuperacao(email.value)
  if (!validacao.ok) {
    erroCampo.value = validacao.erro
    return
  }

  enviando.value = true
  const resultado = await solicitarRedefinicaoSenha(email.value)
  enviando.value = false

  if (resultado.ok) {
    enviado.value = true
    return
  }
  mensagemErro.value = resultado.erro
}

function voltarLogin() {
  router.push({ name: 'login' })
}
</script>

<style scoped>
.recuperar {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
</style>
