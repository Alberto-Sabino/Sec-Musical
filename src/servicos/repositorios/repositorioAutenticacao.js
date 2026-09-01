// Repositório de autenticação e contexto do usuário.
// Encapsula Firebase Auth e a leitura do próprio documento em `usuarios`.
// A UI e os casos de uso não falam diretamente com o SDK.
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/servicos/firebase'

export function autenticar(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha)
}

export function encerrarSessao() {
  return signOut(auth)
}

// Observa mudanças de sessão (login/logout/restauração).
// Retorna a função de unsubscribe.
export function observarSessao(callback) {
  return onAuthStateChanged(auth, callback)
}

// Lê apenas o próprio documento em `usuarios` (regra de segurança oficial).
// Retorna null se não existir documento operacional.
export async function obterDocumentoUsuario(idUsuario) {
  const referencia = doc(db, 'usuarios', idUsuario)
  const snap = await getDoc(referencia)
  if (!snap.exists()) {
    return null
  }
  return { id_usuario: snap.id, ...snap.data() }
}
