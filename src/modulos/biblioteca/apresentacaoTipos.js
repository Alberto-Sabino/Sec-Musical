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

const APRESENTACAO = {
  circulares: {
    icone: IconeTipoCirculares,
    descricao: 'Circulares relevantes sobre a parte musical.',
  },
  topicos: { icone: IconeTipoTopicos, descricao: 'Tópicos de ensinamento das reuniões musicais.' },
  metodos: { icone: IconeTipoMetodos, descricao: 'Métodos e materiais de ensino em geral.' },
  planos_aula: { icone: IconeTipoPlanosAula, descricao: 'Planos de aula oficiais do MSA.' },
  provas: { icone: IconeTipoProvas, descricao: 'Provas e avaliações teóricas de oficialização.' },
  modelos: { icone: IconeTipoModelos, descricao: 'Modelos e formulários em geral.' },
  outros: { icone: IconeTipoOutros, descricao: 'Outros documentos do setor.' },
}

export function iconeTipoArquivo(tipo) {
  return APRESENTACAO[tipo]?.icone || IconeTipoOutros
}

export function descricaoTipoArquivo(tipo) {
  return APRESENTACAO[tipo]?.descricao || ''
}
