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
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/servicos/firebase'

function mapear(snap) {
  return snap.docs.map((d) => ({ id_arquivo: d.id, ...d.data() }))
}

// Lista arquivos de um setor filtrando pelos níveis de acesso permitidos.
// niveis: array de números (ex.: [1] para usuário, [1, 2] para admin).
// tipo: opcional; se informado, filtra por tipo.
// Índices: id_setor + nivel_acesso + data_atualizacao
//          id_setor + nivel_acesso + tipo + data_atualizacao
export async function listarArquivos({ idSetor, niveis, tipo }) {
  const colecao = collection(db, 'arquivos')
  const clausulas = [where('id_setor', '==', idSetor), where('nivel_acesso', 'in', niveis)]

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

// Cria o documento de metadados com o id já conhecido (id_arquivo).
// Campos conforme contrato: id_setor, tipo, titulo, nivel_acesso, id_nuvem, id_usuario,
// data_inclusao, data_atualizacao. Não inventar campos.
export async function criarArquivo(idArquivo, dados) {
  const referencia = doc(db, 'arquivos', idArquivo)
  await setDoc(referencia, {
    id_setor: dados.id_setor,
    tipo: dados.tipo,
    titulo: dados.titulo,
    nivel_acesso: dados.nivel_acesso,
    id_nuvem: dados.id_nuvem,
    id_usuario: dados.id_usuario,
    data_inclusao: serverTimestamp(),
    data_atualizacao: serverTimestamp(),
  })
}

// Atualiza metadados de um arquivo existente. Sempre atualiza data_atualizacao.
export async function atualizarArquivo(idArquivo, dados) {
  const referencia = doc(db, 'arquivos', idArquivo)
  await updateDoc(referencia, {
    ...dados,
    data_atualizacao: serverTimestamp(),
  })
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
