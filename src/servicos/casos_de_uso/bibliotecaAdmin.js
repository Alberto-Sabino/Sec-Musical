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
import { escopoDoArquivo, ehGlobal } from '@/enums/escopoArquivos'

// Cadastra um novo arquivo.
// dados: { escopo, id_setor?, tipo, titulo, nivel_acesso, id_usuario }
// (escopo 'global' ignora id_setor).
export async function cadastrarArquivo(dados, arquivo) {
  if (!arquivo) {
    throw new Error('Selecione um arquivo para cadastrar.')
  }

  const escopo = dados.escopo
  const idSetor = ehGlobal(escopo) ? null : dados.id_setor
  const idArquivo = novaReferenciaArquivo().id
  const extensao = extensaoDoNome(arquivo.name)
  const idNuvem = montarIdNuvem({
    escopo,
    idSetor,
    nivelAcesso: dados.nivel_acesso,
    idArquivo,
    extensao,
  })

  await enviarArquivo(idNuvem, arquivo)

  await criarArquivo(idArquivo, {
    escopo,
    id_setor: idSetor,
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: idNuvem,
    id_usuario: dados.id_usuario,
    extensao_arquivo: extensao,
    tamanho_bytes: arquivo.size,
  })

  await registrarAuditoria(idArquivo, ACAO_AUDITORIA_ARQUIVO.CRIADO, dados.id_usuario)

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Atualiza um arquivo existente. Mudança de escopo/nível/setor pode alterar o
// caminho (Spec 18): o id_nuvem é recalculado e o binário movido quando preciso.
// novoArquivo: File opcional para substituir o conteúdo.
export async function atualizarArquivoExistente(arquivoAtual, dados, novoArquivo) {
  const idArquivo = arquivoAtual.id_arquivo
  const idUsuario = dados.id_usuario
  const escopo = dados.escopo || escopoDoArquivo(arquivoAtual)
  const idSetor = ehGlobal(escopo) ? null : dados.id_setor || arquivoAtual.id_setor
  const extensao = novoArquivo ? extensaoDoNome(novoArquivo.name) : inferirExtensao(arquivoAtual)
  const idNuvem = montarIdNuvem({
    escopo,
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

  const metadados = {
    escopo,
    id_setor: ehGlobal(escopo) ? null : idSetor,
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

  if (houveMudancaDeCaminho && arquivoAtual.id_nuvem) {
    await removerDoStorage(arquivoAtual.id_nuvem).catch(() => {})
  }

  return { id_arquivo: idArquivo, id_nuvem: idNuvem }
}

// Garante o binário no destino antes de atualizar a referência:
// novo binário → envia; sem binário mas caminho mudou → move; senão → nada.
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
