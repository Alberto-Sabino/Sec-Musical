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
  removerArquivo as removerDoStorage,
} from '@/servicos/infraestrutura_arquivos'
import { NIVEL_ARQUIVO, ACAO_AUDITORIA_ARQUIVO } from '@/servicos/casos_de_uso/biblioteca'

// Monta o id_nuvem no formato oficial da Biblioteca.
// biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf
function montarIdNuvem({ idSetor, nivelAcesso, idArquivo }) {
  const segmentoNivel = nivelAcesso === NIVEL_ARQUIVO.RESTRITO ? 'nivel_2' : 'nivel_1'
  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.pdf`
}

// Cadastra um novo arquivo.
// dados: { id_setor, tipo, titulo, nivel_acesso, id_usuario }
// arquivo: File selecionado no uploader.
export async function cadastrarArquivo(dados, arquivo) {
  if (!arquivo) {
    throw new Error('Selecione um arquivo para cadastrar.')
  }

  const referencia = novaReferenciaArquivo()
  const idArquivo = referencia.id
  const idNuvem = montarIdNuvem({
    idSetor: dados.id_setor,
    nivelAcesso: dados.nivel_acesso,
    idArquivo,
  })

  // 1) Storage primeiro.
  await enviarArquivo(idNuvem, arquivo)

  // 2) Persistência dos metadados.
  await criarArquivo(idArquivo, {
    id_setor: dados.id_setor,
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: idNuvem,
    id_usuario: dados.id_usuario,
  })

  // 3) Auditoria mínima.
  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.CRIADO, dados.id_usuario)

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Atualiza um arquivo existente.
// arquivoAtual: documento persistido (para conhecer id_nuvem/nivel atuais).
// dados: metadados editáveis { tipo, titulo, nivel_acesso }.
// novoArquivo: File opcional para substituição de conteúdo.
export async function atualizarArquivoExistente(arquivoAtual, dados, novoArquivo) {
  const idArquivo = arquivoAtual.id_arquivo
  const idSetor = arquivoAtual.id_setor
  const idUsuario = dados.id_usuario

  // Se o nível mudou, o caminho oficial muda; senão mantém o atual.
  const idNuvem = montarIdNuvem({
    idSetor,
    nivelAcesso: dados.nivel_acesso,
    idArquivo,
  })

  const houveMudancaDeCaminho = idNuvem !== arquivoAtual.id_nuvem

  await sincronizarBinario({ idArquivo, idNuvem, novoArquivo, houveMudancaDeCaminho })

  await atualizarArquivo(idArquivo, {
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: idNuvem,
  })

  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.ATUALIZADO, idUsuario)

  // Remove o arquivo antigo do Storage se o caminho mudou.
  if (houveMudancaDeCaminho && arquivoAtual.id_nuvem) {
    await removerDoStorage(arquivoAtual.id_nuvem).catch(() => {})
  }

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Garante que o binário esteja no caminho oficial de destino antes de atualizar a referência.
// - com novo binário: envia o arquivo selecionado;
// - sem novo binário, mas caminho mudou por nível: reenvia referência simbólica (mantém o contrato de id_nuvem);
// - sem novo binário e mesmo caminho: nada a fazer.
async function sincronizarBinario({ idArquivo, idNuvem, novoArquivo, houveMudancaDeCaminho }) {
  if (novoArquivo) {
    await enviarArquivo(idNuvem, novoArquivo)
    return
  }

  if (houveMudancaDeCaminho) {
    await enviarArquivo(idNuvem, { nome: `${idArquivo}.pdf` })
  }
}

// Remove um arquivo (metadados + Storage).
// Auditoria 'removido' é gravada antes do delete do documento (a subcoleção
// de auditoria persiste, pois o Firestore não apaga subcoleções em cascata).
export async function excluirArquivo(arquivo, idUsuario) {
  const idArquivo = arquivo.id_arquivo

  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.REMOVIDO, idUsuario)
  await removerMetadados(idArquivo)

  if (arquivo.id_nuvem) {
    await removerDoStorage(arquivo.id_nuvem).catch(() => {})
  }

  return { removido: true }
}
