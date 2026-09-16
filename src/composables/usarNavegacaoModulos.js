// Navegação por módulos da área autenticada (Spec 13).
// Fonte única do destino de cada módulo e do mapeamento rota -> módulo ativo.
// Reutilizado pela home (cards de módulos) e pela barra inferior persistente.

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

// Retorna o módulo ativo a partir do nome da rota atual.
export function moduloDaRota(nomeRota) {
  return ROTA_PARA_MODULO[nomeRota] || null
}

// Indica se a rota é tela inicial de módulo (sem "← Voltar").
export function ehRotaInicialDeModulo(nomeRota) {
  return ROTAS_INICIAIS_DE_MODULO.has(nomeRota)
}

// Destino (route location) da página inicial de cada módulo.
// Solicitações depende do perfil: admin -> fila; encarregado -> minhas-solicitacoes.
export function destinoDoModulo(modulo, ehAdmin) {
  if (modulo === MODULO.BIBLIOTECA) {
    return { name: 'biblioteca' }
  }
  if (modulo === MODULO.SOLICITACOES) {
    return { name: ehAdmin ? 'fila-solicitacoes' : 'minhas-solicitacoes' }
  }
  return { name: 'inicio' }
}
