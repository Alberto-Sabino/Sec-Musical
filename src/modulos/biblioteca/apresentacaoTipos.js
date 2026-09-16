// Apresentação por tipo de arquivo da Biblioteca (Spec 14).
// Camada de apresentação apenas: ícone local + descrição curta. Não persiste no banco
// e não altera o contrato de `tipo` (TIPOS_ARQUIVO é a fonte oficial).
import IconeTipoCirculares from '@/componentes/icones/IconeTipoCirculares.vue'
import IconeTipoTopicos from '@/componentes/icones/IconeTipoTopicos.vue'
import IconeTipoMetodos from '@/componentes/icones/IconeTipoMetodos.vue'
import IconeTipoPlanosAula from '@/componentes/icones/IconeTipoPlanosAula.vue'
import IconeTipoProvas from '@/componentes/icones/IconeTipoProvas.vue'
import IconeTipoModelos from '@/componentes/icones/IconeTipoModelos.vue'
import IconeTipoOutros from '@/componentes/icones/IconeTipoOutros.vue'

// Descrições provisórias, funcionais e revisáveis.
const APRESENTACAO = {
  // TODO: revisar mensagem
  circulares: { icone: IconeTipoCirculares, descricao: 'Comunicados e avisos oficiais.' },
  // TODO: revisar mensagem
  topicos: { icone: IconeTipoTopicos, descricao: 'Tópicos e orientações de estudo.' },
  // TODO: revisar mensagem
  metodos: { icone: IconeTipoMetodos, descricao: 'Métodos e materiais de ensino.' },
  // TODO: revisar mensagem
  planos_aula: { icone: IconeTipoPlanosAula, descricao: 'Planos e roteiros de aula.' },
  // TODO: revisar mensagem
  provas: { icone: IconeTipoProvas, descricao: 'Provas e avaliações.' },
  // TODO: revisar mensagem
  modelos: { icone: IconeTipoModelos, descricao: 'Modelos e formulários.' },
  // TODO: revisar mensagem
  outros: { icone: IconeTipoOutros, descricao: 'Outros documentos do setor.' },
}

export function iconeTipoArquivo(tipo) {
  return APRESENTACAO[tipo]?.icone || IconeTipoOutros
}

export function descricaoTipoArquivo(tipo) {
  return APRESENTACAO[tipo]?.descricao || ''
}
