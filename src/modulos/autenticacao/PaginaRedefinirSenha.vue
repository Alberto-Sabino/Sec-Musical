<template>
  <ContainerPagina>
    <CabecalhoPagina :voltar="true" titulo="Alteração de senha" subtitulo="Defina sua nova senha" />

    <BaseCard>
      <!-- Verificando o link -->
      <EstadoCarregando v-if="verificando" texto="Validando o link..." />

      <!-- Link inválido/expirado -->
      <div v-else-if="!codigoValido" class="redefinir">
        <MensagemFeedback tipo="erro">
          {{ mensagemErro }}
        </MensagemFeedback>
        <BaseBotao variante="secundario" bloco @click="irEsqueciSenha">
          Solicitar novo e-mail
        </BaseBotao>
      </div>

      <!-- Formulário de nova senha -->
      <form v-else-if="!concluido" class="redefinir" @submit.prevent="enviar">
        <p v-if="emailAlvo" class="redefinir__email">
          Redefinindo a senha de <strong>{{ emailAlvo }}</strong>
        </p>

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

      <!-- Concluído -->
      <div v-else class="redefinir">
        <MensagemFeedback tipo="sucesso">
          Senha redefinida com sucesso. Use a nova senha para entrar.
        </MensagemFeedback>
        <BaseBotao variante="secundario" bloco @click="irLogin"> Ir para o login </BaseBotao>
      </div>
    </BaseCard>
  </ContainerPagina>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseInput from '@/componentes/BaseInput.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import MensagemFeedback from '@/componentes/MensagemFeedback.vue'
import EstadoCarregando from '@/componentes/EstadoCarregando.vue'
import {
  verificarLinkRedefinicao,
  redefinirSenhaComCodigo,
} from '@/servicos/casos_de_uso/autenticacao'

const route = useRoute()
const router = useRouter()

// O Firebase Auth envia o código na query como `oobCode`.
const oobCode = ref(typeof route.query.oobCode === 'string' ? route.query.oobCode : '')

const verificando = ref(true)
const codigoValido = ref(false)
const emailAlvo = ref('')

const novaSenha = ref('')
const confirmacao = ref('')
const enviando = ref(false)
const concluido = ref(false)
const mensagemErro = ref('')

onMounted(async () => {
  const resultado = await verificarLinkRedefinicao(oobCode.value)
  verificando.value = false

  if (resultado.ok) {
    codigoValido.value = true
    emailAlvo.value = resultado.email || ''
    return
  }
  codigoValido.value = false
  mensagemErro.value = resultado.erro
})

async function enviar() {
  mensagemErro.value = ''
  enviando.value = true

  const resultado = await redefinirSenhaComCodigo({
    oobCode: oobCode.value,
    novaSenha: novaSenha.value,
    confirmacao: confirmacao.value,
  })

  enviando.value = false

  if (resultado.ok) {
    concluido.value = true
    novaSenha.value = ''
    confirmacao.value = ''
    return
  }
  mensagemErro.value = resultado.erro
}

function irLogin() {
  router.push({ name: 'login' })
}

function irEsqueciSenha() {
  router.push({ name: 'esqueci-senha' })
}
</script>

<style scoped>
.redefinir {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.redefinir__email {
  margin: 0;
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
</style>
