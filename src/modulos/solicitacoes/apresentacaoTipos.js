// Apresentação por tipo de solicitação (Spec 15): mapa estável tipo -> ícone.
// Camada de apresentação; não altera o contrato de `tipo` (TIPOS_SOLICITACAO é a fonte).
import IconeTipoAvaliacaoExame from '@/componentes/icones/IconeTipoAvaliacaoExame.vue'
import IconeTipoIngressoGem from '@/componentes/icones/IconeTipoIngressoGem.vue'
import IconeTipoTrocaInstrumento from '@/componentes/icones/IconeTipoTrocaInstrumento.vue'
import IconeTipoCompraManutencao from '@/componentes/icones/IconeTipoCompraManutencao.vue'
import IconeTipoTransferencia from '@/componentes/icones/IconeTipoTransferencia.vue'
import IconeTipoNovoColaborador from '@/componentes/icones/IconeTipoNovoColaborador.vue'
import IconeTipoOutros from '@/componentes/icones/IconeTipoOutros.vue'

const ICONE_POR_TIPO = {
  avaliacao_exame: IconeTipoAvaliacaoExame,
  ingresso_gem: IconeTipoIngressoGem,
  troca_instrumento: IconeTipoTrocaInstrumento,
  compra_manutencao: IconeTipoCompraManutencao,
  transferencia: IconeTipoTransferencia,
  novo_colaborador: IconeTipoNovoColaborador,
}

export function iconeTipoSolicitacao(tipo) {
  return ICONE_POR_TIPO[tipo] || IconeTipoOutros
}
