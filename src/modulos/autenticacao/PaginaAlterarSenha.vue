<template>
  <ContainerPagina>
    <CabecalhoPagina :voltar="true" titulo="Alterar senha" subtitulo="Atualize a senha da sua conta" />

    <BaseCard>
      <form v-if="!alterado" class="alterar" @submit.prevent="enviar">
        <BaseInput
          v-model="senhaAtual"
          rotulo="Senha atual"
          type="password"
          placeholder="Sua senha atual"
          :disabled="enviando"
        />
        <BaseInput
          v-model="novaSenha"
          rotulo="Nova senha"
          type="password"
          placeholder="Nova senha"
          :disabled="enviando"
        />
        <BaseInput
          v-model="confirmacao"
          rotulo="Confirmar nova senha"
          type="password"
          placeholder="Repita a nova senha"
          :disabled="enviando"
        />

        <MensagemFeedback v-if="mensagemErro" tipo="erro">
          {{ mensagemErro }}
        </MensagemFeedback>

        <BaseBotao type="submit" bloco :carregando="enviando"> Alterar senha </BaseBotao>
      </form>

      <div v-else class="alterar">
        <MensagemFeedback tipo="sucesso"> Senha alterada com sucesso. </MensagemFeedback>
        <BaseBotao variante="secundario" bloco @click="voltar"> Voltar ao início </BaseBotao>
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
import { alterarSenha } from '@/servicos/casos_de_uso/autenticacao'

const router = useRouter()

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacao = ref('')
const enviando = ref(false)
const alterado = ref(false)
const mensagemErro = ref('')

async function enviar() {
  mensagemErro.value = ''
  enviando.value = true

  const resultado = await alterarSenha({
    senhaAtual: senhaAtual.value,
    novaSenha: novaSenha.value,
    confirmacao: confirmacao.value,
  })

  enviando.value = false

  if (resultado.ok) {
    alterado.value = true
    senhaAtual.value = ''
    novaSenha.value = ''
    confirmacao.value = ''
    return
  }
  mensagemErro.value = resultado.erro
}

function voltar() {
  router.push({ name: 'inicio' })
}
</script>

<style scoped>
.alterar {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
</style>
