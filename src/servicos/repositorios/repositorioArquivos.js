// Repositório da coleção `arquivos`.
// Encapsula as consultas do Firestore para a Biblioteca de consulta.
// Ordenação sempre por `data_atualizacao` desc (índices já versionados).
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/servicos/firebase'
import { ESCOPO_ARQUIVO } from '@/enums/escopoArquivos'

function mapear(snap) {
  return snap.docs.map((d) => ({ id_arquivo: d.id, ...d.data() }))
}

// Deduplica por id_arquivo preservando a ordem de inserção.
function deduplicar(lista) {
  const vistos = new Set()
  const resultado = []
  for (const item of lista) {
    if (vistos.has(item.id_arquivo)) {
      continue
    }
    vistos.add(item.id_arquivo)
    resultado.push(item)
  }
  return resultado
}

// Lista arquivos visíveis no setor ativo, incluindo os GLOBAIS (Spec 18).
// Faz duas consultas (setor + global) porque o Firestore não permite OR entre
// campos distintos (id_setor vs escopo). Índices: (id_setor|escopo) + nivel_acesso
// [+ tipo] + data_atualizacao.
export async function listarArquivos({ idSetor, niveis, tipo }) {
  const [doSetor, globais] = await Promise.all([
    consultarArquivos({ campo: 'id_setor', valor: idSetor, niveis, tipo }),
    consultarArquivos({ campo: 'escopo', valor: ESCOPO_ARQUIVO.GLOBAL, niveis, tipo }),
  ])

  return deduplicar([...doSetor, ...globais])
}

// Consulta por um campo de recorte (id_setor OU escopo) + nível + tipo opcional.
async function consultarArquivos({ campo, valor, niveis, tipo }) {
  const colecao = collection(db, 'arquivos')
  const clausulas = [where(campo, '==', valor), where('nivel_acesso', 'in', niveis)]

  if (tipo) {
    clausulas.push(where('tipo', '==', tipo))
  }

  clausulas.push(orderBy('data_atualizacao', 'desc'))

  const snap = await getDocs(query(colecao, ...clausulas))

  return mapear(snap)
}

// Gera uma referência de documento novo em `arquivos` (para obter o id antes de gravar).
export function novaReferenciaArquivo() {
  return doc(collection(db, 'arquivos'))
}

// Obtém um único arquivo por id.
export async function obterArquivo(idArquivo) {
  const snap = await getDocs(query(collection(db, 'arquivos'), where('__name__', '==', idArquivo)))
  const lista = mapear(snap)
  return lista[0] || null
}

// Cria o documento com o id já conhecido. Escopo 'global' NÃO grava id_setor
// (§3.1 — preferir ausente). Não inventar campos fora do contrato.
export async function criarArquivo(idArquivo, dados) {
  const referencia = doc(db, 'arquivos', idArquivo)
  const base = {
    escopo: dados.escopo,
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: dados.id_nuvem,
    id_usuario: dados.id_usuario,
    extensao_arquivo: dados.extensao_arquivo,
    tamanho_bytes: dados.tamanho_bytes,
    data_inclusao: serverTimestamp(),
    data_atualizacao: serverTimestamp(),
  }

  if (dados.escopo !== ESCOPO_ARQUIVO.GLOBAL) {
    base.id_setor = dados.id_setor
  }

  await setDoc(referencia, base)
}

// Atualiza metadados (sempre renova data_atualizacao). Ao virar 'global', remove
// o campo id_setor em vez de gravar null (§3.1).
export async function atualizarArquivo(idArquivo, dados) {
  const referencia = doc(db, 'arquivos', idArquivo)
  const payload = { ...dados, data_atualizacao: serverTimestamp() }

  if (dados.escopo === ESCOPO_ARQUIVO.GLOBAL && 'id_setor' in payload) {
    payload.id_setor = deleteField()
  }

  await updateDoc(referencia, payload)
}

// Remove o documento de metadados.
export async function removerArquivo(idArquivo) {
  await deleteDoc(doc(db, 'arquivos', idArquivo))
}

// Registra auditoria mínima em `arquivos/{id_arquivo}/auditoria`.
// acao: 'criado' | 'atualizado' | 'removido'.
export async function registrarAuditoria(idArquivo, acao, idUsuario) {
  const colecao = collection(db, 'arquivos', idArquivo, 'auditoria')
  await addDoc(colecao, {
    acao,
    id_usuario: idUsuario,
    data: serverTimestamp(),
  })
}
