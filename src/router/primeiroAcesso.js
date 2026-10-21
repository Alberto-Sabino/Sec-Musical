// Regra pura de navegação do primeiro acesso (Spec 20).
// Enquanto primeiro_acesso == true, o usuário autenticado só pode acessar
// `alterar-senha` e `perfil`. Qualquer outra rota autenticada redireciona para
// `alterar-senha`. Isolada em função pura para ser testada sem o router.

// Rotas liberadas durante o primeiro acesso.
export const ROTAS_PRIMEIRO_ACESSO = ['alterar-senha', 'perfil']

// Decide o gating para uma navegação durante o primeiro acesso.
// Parâmetros:
// - nomeRotaDestino: string|null (route.name do destino)
// - primeiroAcesso: boolean (estado do contexto do usuário)
// Retorna:
// - { permitido: true } quando pode seguir;
// - { permitido: false, redirect: 'alterar-senha' } quando deve redirecionar.
export function avaliarPrimeiroAcesso(nomeRotaDestino, primeiroAcesso) {
  if (primeiroAcesso !== true) {
    return { permitido: true }
  }
  if (ROTAS_PRIMEIRO_ACESSO.includes(nomeRotaDestino)) {
    return { permitido: true }
  }
  return { permitido: false, redirect: 'alterar-senha' }
}
