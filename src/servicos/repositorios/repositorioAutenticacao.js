// Repositório de autenticação e contexto do usuário.
// Encapsula Firebase Auth e a leitura do próprio documento em `usuarios`.
// A UI e os casos de uso não falam diretamente com o SDK.
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/servicos/firebase'

export function autenticar(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha)
}

export function encerrarSessao() {
  return signOut(auth)
}

// URL para a qual o link do e-mail de redefinição deve voltar: a própria
// aplicação, na tela de redefinição. Derivada em runtime (funciona em dev por
// localhost/IP e em produção), evitando hardcode de host.
function urlRedefinicaoSenha() {
  return `${window.location.origin}/redefinir-senha`
}

// Dispara o e-mail de redefinição de senha do Firebase Authentication.
// `actionCodeSettings.url` faz o link do e-mail retornar para a aplicação
// (tela /redefinir-senha), em vez do handler genérico do Firebase.
export function enviarEmailRedefinicaoSenha(email) {
  return sendPasswordResetEmail(auth, email, {
    url: urlRedefinicaoSenha(),
    handleCodeInApp: true,
  })
}

// Valida o código (oobCode) recebido pelo link do e-mail.
// Em caso de sucesso, retorna o e-mail associado ao código.
export function verificarCodigoRedefinicao(oobCode) {
  return verifyPasswordResetCode(auth, oobCode)
}

// Efetiva a nova senha usando o código do e-mail. Não exige sessão ativa.
export function confirmarRedefinicaoSenha(oobCode, novaSenha) {
  return confirmPasswordReset(auth, oobCode, novaSenha)
}

// Reautentica o usuário atual com a senha informada e atualiza para a nova senha.
// Requer sessão ativa; lança se não houver usuário logado.
export async function atualizarSenhaUsuario(senhaAtual, novaSenha) {
  const usuario = auth.currentUser
  if (!usuario || !usuario.email) {
    throw new Error('sessao-invalida')
  }
  const credencial = EmailAuthProvider.credential(usuario.email, senhaAtual)
  await reauthenticateWithCredential(usuario, credencial)
  await updatePassword(usuario, novaSenha)
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
