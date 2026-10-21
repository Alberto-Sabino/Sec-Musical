<template>
  <ContainerPagina>
    <CabecalhoPagina
      :voltar="!primeiroAcesso"
      titulo="Alterar senha"
      :subtitulo="
        primeiroAcesso
          ? 'Por segurança, defina uma nova senha para continuar'
          : 'Atualize a senha da sua conta'
      "
    />

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
        <MensagemFeedback v-if="primeiroAcesso" tipo="info">
          Encerrando a sessão. Entre novamente com a nova senha.
        </MensagemFeedback>
        <BaseBotao v-else variante="secundario" bloco @click="voltar"> Voltar ao início </BaseBotao>
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
import { alterarSenha, concluirPrimeiroAcesso } from '@/servicos/casos_de_uso/autenticacao'
import { usarSessao } from '@/composables/usarSessao'
import { dispararEvento } from '@/servicos/firebase/analytics'
import { ERROS, PARAMS_ERRO_FORMULARIO } from '@/enums/eventosAnalytics'

const router = useRouter()
const { estado, primeiroAcesso, logout } = usarSessao()

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

  if (!resultado.ok) {
    enviando.value = false
    dispararEvento(ERROS.ERRO_FORMULARIO, {
      formulario: PARAMS_ERRO_FORMULARIO.ALTERAR_SENHA,
    })
    mensagemErro.value = resultado.erro
    return
  }

  alterado.value = true
  senhaAtual.value = ''
  novaSenha.value = ''
  confirmacao.value = ''

  // Primeiro acesso (Spec 20): ao trocar a senha com sucesso, concluir o
  // primeiro acesso (primeiro_acesso=false), encerrar a sessão e voltar ao login.
  if (primeiroAcesso.value) {
    await concluirPrimeiroAcesso(estado.usuarioAuth?.uid)
    await logout()
    router.replace({ name: 'login' })
    return
  }

  enviando.value = false
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
