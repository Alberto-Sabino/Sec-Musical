<template>
  <ContainerPagina>
    <CabecalhoPagina :voltar="true" titulo="Minhas informações" />

    <div class="perfil">
      <BaseCard>
        <dl class="dados">
          <div class="dados__item">
            <dt>Nome</dt>
            <dd>{{ estado.contexto?.nome_completo || '—' }}</dd>
          </div>
          <div class="dados__item">
            <dt>Comum congregação</dt>
            <dd>{{ estado.contexto?.comum_congregacao || '—' }}</dd>
          </div>
          <div class="dados__item">
            <dt>E-mail</dt>
            <dd>{{ estado.contexto?.email || '—' }}</dd>
          </div>
          <div class="dados__item">
            <dt>Celular</dt>
            <dd>{{ estado.contexto?.celular || '—' }}</dd>
          </div>
          <div class="dados__item">
            <dt>Nível de acesso</dt>
            <dd>{{ rotuloPerfil }}</dd>
          </div>
        </dl>
      </BaseCard>

      <BaseCard>
        <div class="acoes">
          <BaseBotao variante="secundario" bloco @click="irAlterarSenha">
            <IconeSenha class="acoes__icone" />
            Alterar senha
          </BaseBotao>
          <BaseBotao variante="secundario" bloco :carregando="saindo" @click="sair">
            <IconeSair class="acoes__icone" />
            Sair
          </BaseBotao>
        </div>
      </BaseCard>
    </div>
  </ContainerPagina>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseBotao from '@/componentes/BaseBotao.vue'
import IconeSenha from '@/componentes/icones/IconeSenha.vue'
import IconeSair from '@/componentes/icones/IconeSair.vue'
import { usarSessao } from '@/composables/usarSessao'

const router = useRouter()
const { estado, ehAdmin, logout } = usarSessao()

const saindo = ref(false)

const rotuloPerfil = computed(() => (ehAdmin.value ? 'Secretário Musical' : 'Encarregado Local'))

function irAlterarSenha() {
  router.push({ name: 'alterar-senha' })
}

async function sair() {
  saindo.value = true
  await logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.perfil {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.perfil > * {
  margin-bottom: 0;
}
.dados {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--espaco-md);
  margin: 0;
}
.dados__item dt {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.dados__item dd {
  margin: var(--espaco-xs) 0 0;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.acoes {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
.acoes__icone {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: var(--espaco-xs);
}
@media (min-width: 600px) {
  .dados {
    grid-template-columns: 1fr 1fr;
    gap: var(--espaco-md) var(--espaco-lg);
  }
}
</style>
