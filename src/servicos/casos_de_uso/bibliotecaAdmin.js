// Casos de uso administrativos da Biblioteca.
// Ordem obrigatória (Spec 05 / Steering 03): gerar id_arquivo -> montar id_nuvem
// -> enviar ao Storage -> persistir no Firestore -> registrar auditoria.
import {
  novaReferenciaArquivo,
  criarArquivo,
  atualizarArquivo,
  removerArquivo as removerMetadados,
  registrarAuditoria,
} from '@/servicos/repositorios/repositorioArquivos'
import {
  enviarArquivo,
  moverArquivo,
  removerArquivo as removerDoStorage,
} from '@/servicos/infraestrutura_arquivos'
import { ACAO_AUDITORIA_ARQUIVO } from '@/servicos/casos_de_uso/biblioteca'
import { extensaoDoNome } from '@/servicos/casos_de_uso/regrasUpload'
import { montarIdNuvem, inferirExtensao } from '@/servicos/casos_de_uso/bibliotecaCaminhos'

// Cadastra um novo arquivo.
// dados: { id_setor, tipo, titulo, nivel_acesso, id_usuario }
// arquivo: File selecionado no uploader (já validado na camada de UI).
export async function cadastrarArquivo(dados, arquivo) {
  if (!arquivo) {
    throw new Error('Selecione um arquivo para cadastrar.')
  }

  const referencia = novaReferenciaArquivo()
  const idArquivo = referencia.id
  const extensao = extensaoDoNome(arquivo.name)
  const idNuvem = montarIdNuvem({
    idSetor: dados.id_setor,
    nivelAcesso: dados.nivel_acesso,
    idArquivo,
    extensao,
  })

  // 1) Storage primeiro.
  await enviarArquivo(idNuvem, arquivo)

  // 2) Persistência dos metadados (inclui extensao_arquivo e tamanho_bytes).
  await criarArquivo(idArquivo, {
    id_setor: dados.id_setor,
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: idNuvem,
    id_usuario: dados.id_usuario,
    extensao_arquivo: extensao,
    tamanho_bytes: arquivo.size,
  })

  // 3) Auditoria mínima.
  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.CRIADO, dados.id_usuario)

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Atualiza um arquivo existente.
// arquivoAtual: documento persistido (para conhecer id_nuvem/nivel/extensão atuais).
// dados: metadados editáveis { tipo, titulo, nivel_acesso, id_usuario }.
// novoArquivo: File opcional para substituição de conteúdo.
export async function atualizarArquivoExistente(arquivoAtual, dados, novoArquivo) {
  const idArquivo = arquivoAtual.id_arquivo
  const idSetor = arquivoAtual.id_setor
  const idUsuario = dados.id_usuario

  // Extensão de destino: se há novo binário, vem dele; senão, preserva a atual (inferida).
  const extensao = novoArquivo ? extensaoDoNome(novoArquivo.name) : inferirExtensao(arquivoAtual)

  const idNuvem = montarIdNuvem({
    idSetor,
    nivelAcesso: dados.nivel_acesso,
    idArquivo,
    extensao,
  })

  const houveMudancaDeCaminho = idNuvem !== arquivoAtual.id_nuvem

  await sincronizarBinario({
    idNuvemOrigem: arquivoAtual.id_nuvem,
    idNuvemDestino: idNuvem,
    novoArquivo,
    houveMudancaDeCaminho,
  })

  // Metadados: sempre atualiza id_nuvem/extensão; tamanho só muda com novo binário.
  const metadados = {
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: idNuvem,
    extensao_arquivo: extensao,
  }
  if (novoArquivo) {
    metadados.tamanho_bytes = novoArquivo.size
  }
  await atualizarArquivo(idArquivo, metadados)

  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.ATUALIZADO, idUsuario)

  // Remove o arquivo antigo do Storage se o caminho mudou.
  if (houveMudancaDeCaminho && arquivoAtual.id_nuvem) {
    await removerDoStorage(arquivoAtual.id_nuvem).catch(() => {})
  }

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Garante que o binário esteja no caminho de destino antes de atualizar a referência.
// - com novo binário: envia o arquivo selecionado;
// - sem novo binário, mas caminho mudou: MOVE o binário real da origem para o destino
//   (lê os bytes existentes e regrava); falha explicitamente se a origem não puder ser lida;
// - sem novo binário e mesmo caminho: nada a fazer.
async function sincronizarBinario({
  idNuvemOrigem,
  idNuvemDestino,
  novoArquivo,
  houveMudancaDeCaminho,
}) {
  if (novoArquivo) {
    await enviarArquivo(idNuvemDestino, novoArquivo)
    return
  }
  if (houveMudancaDeCaminho) {
    await moverArquivo(idNuvemOrigem, idNuvemDestino)
  }
}

// Remove um arquivo (metadados + Storage).
export async function excluirArquivo(arquivo, idUsuario) {
  const idArquivo = arquivo.id_arquivo

  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.REMOVIDO, idUsuario)
  await removerMetadados(idArquivo)

  if (arquivo.id_nuvem) {
    await removerDoStorage(arquivo.id_nuvem).catch(() => {})
  }

  return { removido: true }
}
