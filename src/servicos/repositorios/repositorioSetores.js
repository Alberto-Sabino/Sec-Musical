// Repositório da coleção `setores`.
// Leitura dos setores do usuário para exibir o nome (em vez do id) na interface.
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/servicos/firebase'

// Obtém um setor por id. Retorna { id_setor, nome, ... } ou null.
export async function obterSetor(idSetor) {
  const snap = await getDoc(doc(db, 'setores', idSetor))
  if (!snap.exists()) {
    return null
  }
  return { id_setor: snap.id, ...snap.data() }
}

// Obtém vários setores por id e retorna um mapa { id_setor: nome }.
export async function obterNomesSetores(ids) {
  const mapa = {}
  await Promise.all(
    (ids || []).map(async (id) => {
      const setor = await obterSetor(id)
      mapa[id] = setor?.nome || id // fallback para o id se não encontrar
    }),
  )
  return mapa
}
