<template>
  <ContainerPagina>
    <CabecalhoPagina titulo="Início" :subtitulo="saudacao">
      <template #acoes>
        <button
          type="button"
          class="conta"
          aria-label="Abrir minhas informações"
          @click="irPerfil"
        >
          <IconeConta class="conta__icone" />
        </button>
      </template>
    </CabecalhoPagina>

    <div class="home">
      <!-- 1. Card de contexto do usuário logado -->
      <BaseCard>
        <dl class="contexto">
          <div class="contexto__item">
            <dt>Nome</dt>
            <dd>{{ estado.contexto?.nome_completo || '—' }}</dd>
          </div>
          <div class="contexto__item">
            <dt>Perfil</dt>
            <dd>{{ rotuloPerfil }}</dd>
          </div>
          <div class="contexto__item">
            <dt>Setor atual</dt>
            <dd>{{ nomeSetorAtivo }}</dd>
          </div>
          <div class="contexto__item">
            <dt>Comum congregação</dt>
            <dd>{{ estado.contexto?.comum_congregacao || '—' }}</dd>
          </div>
        </dl>
      </BaseCard>

      <!-- 2. Seletor de setor (admin com mais de um setor) -->
      <BaseCard v-if="ehAdmin">
        <BaseSelect
          v-model="setorSelecionado"
          rotulo="Setor ativo"
          :opcoes="opcoesSetor"
          @update:modelValue="trocarSetor"
        />
      </BaseCard>

      <!-- 3. Cards dos módulos acessíveis -->
      <BaseCard v-for="mod in modulos" :key="mod.modulo">
        <button
          class="modulo__botao"
          :aria-label="`Abrir ${mod.titulo}`"
          @click="abrirModulo(mod.modulo)"
        >
          <component :is="mod.icone" class="modulo__icone" />
          <span class="modulo__texto">
            <span class="modulo__titulo">{{ mod.titulo }}</span>
            <span class="modulo__descricao">{{ mod.descricao }}</span>
          </span>
        </button>
      </BaseCard>

      <!-- 4. Área inferior livre reservada para atalhos futuros (sem placeholder). -->
    </div>
  </ContainerPagina>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContainerPagina from '@/componentes/ContainerPagina.vue'
import CabecalhoPagina from '@/componentes/CabecalhoPagina.vue'
import BaseCard from '@/componentes/BaseCard.vue'
import BaseSelect from '@/componentes/BaseSelect.vue'
import IconeConta from '@/componentes/icones/IconeConta.vue'
import IconeBiblioteca from '@/componentes/icones/IconeBiblioteca.vue'
import IconeSolicitacoes from '@/componentes/icones/IconeSolicitacoes.vue'
import { usarSessao } from '@/composables/usarSessao'
import { MODULO, destinoDoModulo } from '@/composables/usarNavegacaoModulos'

const router = useRouter()
const { estado, ehAdmin, opcoesSetor, nomeSetorAtivo, definirSetorAtivo } = usarSessao()

const setorSelecionado = ref(estado.setorAtivo)

const saudacao = computed(() => {
  const nome = estado.contexto?.nome_completo
  return nome ? `A paz de Deus, ${nome}.` : 'Sessão ativa'
})

const rotuloPerfil = computed(() => (ehAdmin.value ? 'Secretário Musical' : 'Encarregado Local'))

// Cards de módulos da home. Descrições curtas e funcionais.
const modulos = computed(() => [
  {
    modulo: MODULO.BIBLIOTECA,
    titulo: 'Biblioteca',
    descricao: 'Consulte documentos e materiais do setor por tipo.',
    icone: IconeBiblioteca,
  },
  {
    modulo: MODULO.SOLICITACOES,
    titulo: 'Solicitações',
    descricao: ehAdmin.value
      ? 'Acompanhe e trate solicitações do setor.'
      : 'Abra e acompanhe solicitações do seu setor.',
    icone: IconeSolicitacoes,
  },
])

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

// Home e barra compartilham o mesmo destino por módulo (respeitando o perfil).
function abrirModulo(modulo) {
  router.push(destinoDoModulo(modulo, ehAdmin.value))
}

function irPerfil() {
  router.push({ name: 'perfil' })
}
</script>

<style scoped>
/* Espaçamento único e consistente entre os blocos da home. */
.home {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
/* Neutraliza a margem própria do BaseCard: o gap do wrapper controla o espaçamento. */
.home > * {
  margin-bottom: 0;
}
.contexto {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--espaco-md);
  margin: 0;
}
.contexto__item dt {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.contexto__item dd {
  margin: var(--espaco-xs) 0 0;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.modulo__botao {
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
.modulo__icone {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: var(--cor-primaria);
}
.modulo__texto {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-xs);
}
.modulo__titulo {
  font-weight: 600;
  font-size: var(--fonte-tamanho-lg);
}
.modulo__descricao {
  font-size: var(--fonte-tamanho-sm);
  color: var(--cor-texto-suave);
}
.conta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-xs);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cor-texto);
}
.conta__icone {
  width: 26px;
  height: 26px;
}
@media (min-width: 600px) {
  .contexto {
    grid-template-columns: 1fr 1fr;
    gap: var(--espaco-md) var(--espaco-lg);
  }
}
</style>
