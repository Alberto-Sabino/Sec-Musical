// Repositório da coleção `solicitacoes`.
// Encapsula as consultas e escritas do Firestore para o domínio de Solicitações.
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/servicos/firebase'

function mapear(snap) {
  return snap.docs.map((d) => ({ id_solicitacao: d.id, ...d.data() }))
}

// Gera uma referência de documento novo (para conhecer o id antes de gravar).
export function novaReferenciaSolicitacao() {
  return doc(collection(db, 'solicitacoes'))
}

// Cria a solicitação com o id conhecido. Campos exatamente conforme contrato.
// status nasce em_aberto; id_responsavel, id_nuvem e conclusao nascem vazios.
export async function criarSolicitacao(idSolicitacao, dados) {
  const referencia = doc(db, 'solicitacoes', idSolicitacao)
  await setDoc(referencia, {
    id_setor: dados.id_setor,
    id_solicitante: dados.id_solicitante,
    nome_solicitante: dados.nome_solicitante || '',
    nome_beneficiario: dados.nome_beneficiario,
    id_responsavel: '',
    nome_responsavel: '',
    tipo: dados.tipo,
    status: 'em_aberto',
    descricao: dados.descricao,
    conclusao: '',
    id_nuvem: '',
    data_solicitacao: serverTimestamp(),
    data_atualizacao: serverTimestamp(),
  })
}

// Lista as solicitações de um solicitante, ordenadas por data_solicitacao desc.
// Índice: id_solicitante + data_solicitacao.
export async function listarPorSolicitante(idSolicitante) {
  const colecao = collection(db, 'solicitacoes')
  const snap = await getDocs(
    query(
      colecao,
      where('id_solicitante', '==', idSolicitante),
      orderBy('data_solicitacao', 'desc'),
    ),
  )
  return mapear(snap)
}

// Obtém uma solicitação por id.
export async function obterSolicitacao(idSolicitacao) {
  const snap = await getDoc(doc(db, 'solicitacoes', idSolicitacao))
  if (!snap.exists()) {
    return null
  }
  return { id_solicitacao: snap.id, ...snap.data() }
}

// Atualiza campos permitidos da solicitação. Sempre atualiza data_atualizacao.
export async function atualizarSolicitacao(idSolicitacao, dados) {
  await updateDoc(doc(db, 'solicitacoes', idSolicitacao), {
    ...dados,
    data_atualizacao: serverTimestamp(),
  })
}

// Registra auditoria mínima de status em `solicitacoes/{id}/auditoria`.
// acao, id_usuario, status_anterior, status_novo, data.
export async function registrarAuditoria(idSolicitacao, dados) {
  const colecao = collection(db, 'solicitacoes', idSolicitacao, 'auditoria')
  await addDoc(colecao, {
    acao: dados.acao,
    id_usuario: dados.id_usuario,
    status_anterior: dados.status_anterior || '',
    status_novo: dados.status_novo || '',
    data: serverTimestamp(),
  })
}

// Lê o histórico de auditoria, ordenado por data.
export async function listarAuditoria(idSolicitacao) {
  const colecao = collection(db, 'solicitacoes', idSolicitacao, 'auditoria')
  const snap = await getDocs(query(colecao, orderBy('data', 'asc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Lista a fila de um setor, com filtro opcional por status.
// Índices: id_setor + data_atualizacao / id_setor + status + data_atualizacao.
export async function listarPorSetor(idSetor, status) {
  const colecao = collection(db, 'solicitacoes')
  const clausulas = [where('id_setor', '==', idSetor)]
  if (status) {
    clausulas.push(where('status', '==', status))
  }
  clausulas.push(orderBy('data_atualizacao', 'desc'))
  const snap = await getDocs(query(colecao, ...clausulas))
  return mapear(snap)
}

// Assume a solicitação com transação: valida em_aberto e grava em_andamento
// + id_responsavel + nome_responsavel. Retorna { ok, motivo }.
export async function assumirComTransacao(idSolicitacao, idResponsavel, nomeResponsavel) {
  const referencia = doc(db, 'solicitacoes', idSolicitacao)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(referencia)
    if (!snap.exists()) {
      return { ok: false, motivo: 'inexistente' }
    }
    const dados = snap.data()
    if (dados.status !== 'em_aberto') {
      return { ok: false, motivo: 'nao_em_aberto' }
    }
    tx.update(referencia, {
      status: 'em_andamento',
      id_responsavel: idResponsavel,
      nome_responsavel: nomeResponsavel || '',
      data_atualizacao: serverTimestamp(),
    })
    return { ok: true, motivo: null }
  })
}
