// Ponto único de decisão sobre a navegação por módulos da área logada.
// Tanto os cards da home quanto a barra inferior perguntam aqui "para onde vai
// cada módulo" e "qual módulo está ativo agora". Mantendo isso num lugar só, não
// corremos o risco de a home e a barra apontarem para destinos diferentes.
// O destino de Solicitações depende do perfil (secretário cai na fila,
// encarregado nas próprias solicitações).

// Identificadores estáveis dos módulos.
export const MODULO = {
  INICIO: 'inicio',
  BIBLIOTECA: 'biblioteca',
  SOLICITACOES: 'solicitacoes',
}

// Mapa obrigatório de rota -> módulo ativo (Specs 13 e 14).
// Rotas de Solicitações e Biblioteca destacam seus respectivos módulos mesmo em subfluxos.
const ROTA_PARA_MODULO = {
  inicio: MODULO.INICIO,
  biblioteca: MODULO.BIBLIOTECA,
  'biblioteca-tipo': MODULO.BIBLIOTECA,
  'biblioteca-busca': MODULO.BIBLIOTECA,
  'arquivo-novo': MODULO.BIBLIOTECA,
  'arquivo-editar': MODULO.BIBLIOTECA,
  'minhas-solicitacoes': MODULO.SOLICITACOES,
  'solicitacao-nova': MODULO.SOLICITACOES,
  'solicitacao-detalhe': MODULO.SOLICITACOES,
  'solicitacao-editar': MODULO.SOLICITACOES,
  'fila-solicitacoes': MODULO.SOLICITACOES,
  'fila-detalhe': MODULO.SOLICITACOES,
}

// Rotas que são a tela inicial de um módulo (onde "← Voltar" não aparece).
const ROTAS_INICIAIS_DE_MODULO = new Set([
  'inicio',
  'biblioteca',
  'minhas-solicitacoes',
  'fila-solicitacoes',
])

export function moduloDaRota(nomeRota) {
  return ROTA_PARA_MODULO[nomeRota] || null
}

export function ehRotaInicialDeModulo(nomeRota) {
  return ROTAS_INICIAIS_DE_MODULO.has(nomeRota)
}

// Solicitações depende do perfil: admin cai na fila; encarregado, nas próprias.
export function destinoDoModulo(modulo, ehAdmin) {
  if (modulo === MODULO.BIBLIOTECA) {
    return { name: 'biblioteca' }
  }

  if (modulo === MODULO.SOLICITACOES) {
    return { name: ehAdmin ? 'fila-solicitacoes' : 'minhas-solicitacoes' }
  }

  return { name: 'inicio' }
}
