// Eventos, ações e erros do GA4.
// Limites GA4: nomes <= 40 chars (snake_case), valor de parâmetro <= 100 chars.
// Estratégia: poucos nomes + parâmetros — preserva os mesmos filtros no console
// (via custom dimension) e evita truncamento. Valores de parâmetro em PARAMS_*.

export const EVENTO_ACESSO_TELA = 'acesso_tela'

// Valor de `meta.tela` das rotas (router/index.js). Vira o parâmetro `tela`.
export const TELAS = {
  LOGIN: 'login',
  ESQUECI_SENHA: 'esqueci_senha',
  REDEFINIR_SENHA: 'redefinir_senha',
  ALTERAR_SENHA: 'alterar_senha',
  PERFIL: 'perfil',
  INICIO: 'inicio',

  BIBLIOTECA: 'biblioteca',
  BIBLIOTECA_TIPO: 'biblioteca_lista_tipo',
  BIBLIOTECA_BUSCA: 'biblioteca_busca',
  ARQUIVO_NOVO: 'biblioteca_novo_arquivo',
  ARQUIVO_EDITAR: 'biblioteca_editar_arquivo',

  MINHAS_SOLICITACOES: 'minhas_solicitacoes',
  SOLICITACAO_NOVA: 'nova_solicitacao',
  SOLICITACAO_DETALHE: 'detalhe_solicitacao',
  SOLICITACAO_EDITAR: 'editar_solicitacao',

  FILA_SOLICITACOES: 'fila_solicitacoes',
  FILA_DETALHE: 'fila_detalhe',
}

export const ACOES = {
  NAVEGACAO_MENU: 'navegacao_menu', // param: alvo (PARAMS_NAVEGACAO_ALVO)
  NAVEGACAO_VOLTAR: 'navegacao_voltar',

  INICIO_ABRIR_PERFIL: 'inicio_abrir_perfil',
  INICIO_ABRIR_BIBLIOTECA: 'inicio_abrir_biblioteca',
  INICIO_ABRIR_SOLICITACOES: 'inicio_abrir_solicitacoes',

  PERFIL_ACAO: 'perfil_acao', // param: acao (PARAMS_PERFIL_ACAO)

  BIBLIOTECA_ABRIR_ARQUIVO: 'biblioteca_abrir_arquivo',
  BIBLIOTECA_DOWNLOAD: 'biblioteca_download',
  BIBLIOTECA_CADASTRAR_ARQUIVO: 'biblioteca_cadastrar_arquivo',
  BIBLIOTECA_BUSCAR: 'biblioteca_buscar',
  BIBLIOTECA_ABRIR_RESULTADO_BUSCA: 'biblioteca_abrir_resultado_busca',

  SOLICITACOES_FILTRAR: 'solicitacoes_filtrar', // param: filtro (PARAMS_SOLICITACOES_FILTRO)
  SOLICITACOES_NOVA: 'solicitacoes_nova',
  SOLICITACOES_ABRIR: 'solicitacoes_abrir',
  SOLICITACOES_ABRIR_DETALHE: 'solicitacoes_abrir_detalhe',
  SOLICITACOES_EDITAR: 'solicitacoes_editar',
  SOLICITACOES_SALVAR_EDICAO: 'solicitacoes_salvar_edicao',
  SOLICITACOES_CANCELAR: 'solicitacoes_cancelar',
  SOLICITACOES_CONFIRMAR_CANCELAR: 'solicitacoes_confirmar_cancelar',
  SOLICITACOES_ASSUMIR: 'solicitacoes_assumir',
  SOLICITACOES_SELECIONAR_ANEXO: 'solicitacoes_selecionar_anexo',
  SOLICITACOES_ANEXAR_ARQUIVO: 'solicitacoes_anexar_arquivo',
  SOLICITACOES_SALVAR_COMENTARIO: 'solicitacoes_salvar_comentario',
  SOLICITACOES_CONCLUIR: 'solicitacoes_concluir',
  SOLICITACOES_BAIXAR_ANEXO: 'solicitacoes_baixar_anexo',
}

export const ERROS = {
  ERRO_FORMULARIO: 'erro_formulario', // param: formulario (PARAMS_ERRO_FORMULARIO)
  ERRO_GENERICO: 'erro_generico',
  ERRO_INTEGRACAO_FIREBASE: 'erro_integracao_firebase',
}

export const PARAMS_NAVEGACAO_ALVO = {
  INICIO: 'inicio',
  BIBLIOTECA: 'biblioteca',
  SOLICITACOES: 'solicitacoes',
}

export const PARAMS_PERFIL_ACAO = {
  ALTERAR_SENHA: 'alterar_senha',
  SAIR: 'sair',
}

export const PARAMS_SOLICITACOES_FILTRO = {
  STATUS: 'status',
  TIPO: 'tipo',
}

export const PARAMS_ERRO_FORMULARIO = {
  BIBLIOTECA_NOVO_ARQUIVO: 'biblioteca_novo_arquivo',
  BIBLIOTECA_EDITAR_ARQUIVO: 'biblioteca_editar_arquivo',
  SOLICITACAO_NOVA: 'solicitacao_nova',
  SOLICITACAO_EDITAR: 'solicitacao_editar',
  SOLICITACAO_CONCLUIR: 'solicitacao_concluir',
  ALTERAR_SENHA: 'alterar_senha',
  LOGIN: 'login',
}
