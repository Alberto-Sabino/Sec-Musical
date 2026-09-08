// Testes das regras do Firestore para o escopo da Sprint 1 (`usuarios`, `arquivos`).
// Executar com o emulador: `npm run test:rules` (via firebase emulators:exec).
import { test, before, after, beforeEach } from 'node:test'
import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const PROJETO = 'sec-musical-mvp'

// IDs de teste
const UID_USUARIO = 'user_comum'
const UID_ADMIN = 'admin_1'
const UID_INATIVO = 'user_inativo'
const SETOR_A = 'setorA'
const SETOR_B = 'setorB'

let testEnv

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

after(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  // Semeia documentos de usuários e arquivos ignorando as regras.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'usuarios', UID_USUARIO), {
      nivel_acesso: 1,
      ativo: true,
      ids_setor: [SETOR_A],
    })
    await setDoc(doc(db, 'usuarios', UID_ADMIN), {
      nivel_acesso: 2,
      ativo: true,
      ids_setor: [SETOR_A],
    })
    await setDoc(doc(db, 'usuarios', UID_INATIVO), {
      nivel_acesso: 1,
      ativo: false,
      ids_setor: [SETOR_A],
    })
    // Setores (para leitura de nome).
    await setDoc(doc(db, 'setores', SETOR_A), { id_setor: SETOR_A, nome: 'Setor A', ativo: true })
    await setDoc(doc(db, 'setores', SETOR_B), { id_setor: SETOR_B, nome: 'Setor B', ativo: true })
    // Arquivo público (nível 1) e restrito (nível 2) no setor A.
    await setDoc(doc(db, 'arquivos', 'arq_pub_A'), {
      id_setor: SETOR_A,
      tipo: 'circulares',
      titulo: 'Público A',
      nivel_acesso: 1,
      id_nuvem: `biblioteca/${SETOR_A}/nivel_1/arq_pub_A.pdf`,
      id_usuario: UID_ADMIN,
    })
    await setDoc(doc(db, 'arquivos', 'arq_rest_A'), {
      id_setor: SETOR_A,
      tipo: 'circulares',
      titulo: 'Restrito A',
      nivel_acesso: 2,
      id_nuvem: `biblioteca/${SETOR_A}/nivel_2/arq_rest_A.pdf`,
      id_usuario: UID_ADMIN,
    })
    // Arquivo público em outro setor (B).
    await setDoc(doc(db, 'arquivos', 'arq_pub_B'), {
      id_setor: SETOR_B,
      tipo: 'circulares',
      titulo: 'Público B',
      nivel_acesso: 1,
      id_nuvem: `biblioteca/${SETOR_B}/nivel_1/arq_pub_B.pdf`,
      id_usuario: UID_ADMIN,
    })
  })
})

function ctxUsuario() {
  return testEnv.authenticatedContext(UID_USUARIO).firestore()
}
function ctxAdmin() {
  return testEnv.authenticatedContext(UID_ADMIN).firestore()
}
function ctxInativo() {
  return testEnv.authenticatedContext(UID_INATIVO).firestore()
}
function ctxAnonimo() {
  return testEnv.unauthenticatedContext().firestore()
}

// ---- usuarios ----
test('usuarios: lê o próprio documento (permitido)', async () => {
  await assertSucceeds(getDoc(doc(ctxUsuario(), 'usuarios', UID_USUARIO)))
})

test('usuarios: não lê documento de outro usuário (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxUsuario(), 'usuarios', UID_ADMIN)))
})

test('usuarios: não autenticado não lê (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxAnonimo(), 'usuarios', UID_USUARIO)))
})

test('usuarios: cliente não altera o próprio documento (bloqueado)', async () => {
  await assertFails(updateDoc(doc(ctxUsuario(), 'usuarios', UID_USUARIO), { nivel_acesso: 2 }))
})

// ---- arquivos: leitura ----
test('arquivos: usuário lê público do próprio setor (permitido)', async () => {
  await assertSucceeds(getDoc(doc(ctxUsuario(), 'arquivos', 'arq_pub_A')))
})

test('arquivos: usuário NÃO lê restrito do próprio setor (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxUsuario(), 'arquivos', 'arq_rest_A')))
})

test('arquivos: usuário NÃO lê público de outro setor (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxUsuario(), 'arquivos', 'arq_pub_B')))
})

test('arquivos: admin lê restrito do próprio setor (permitido)', async () => {
  await assertSucceeds(getDoc(doc(ctxAdmin(), 'arquivos', 'arq_rest_A')))
})

test('arquivos: admin NÃO lê arquivo de setor fora dos seus (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxAdmin(), 'arquivos', 'arq_pub_B')))
})

test('arquivos: usuário inativo NÃO lê (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxInativo(), 'arquivos', 'arq_pub_A')))
})

// ---- arquivos: escrita ----
const NOVO = {
  id_setor: SETOR_A,
  tipo: 'circulares',
  titulo: 'Novo',
  nivel_acesso: 1,
  id_nuvem: `biblioteca/${SETOR_A}/nivel_1/arq_novo.pdf`,
  id_usuario: UID_ADMIN,
}

test('arquivos: admin cria no próprio setor (permitido)', async () => {
  await assertSucceeds(setDoc(doc(ctxAdmin(), 'arquivos', 'arq_novo'), NOVO))
})

test('arquivos: usuário comum NÃO cria (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(ctxUsuario(), 'arquivos', 'arq_novo'), {
      ...NOVO,
      id_usuario: UID_USUARIO,
    }),
  )
})

test('arquivos: admin NÃO cria em setor fora dos seus (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(ctxAdmin(), 'arquivos', 'arq_novo_b'), {
      ...NOVO,
      id_setor: SETOR_B,
      id_nuvem: `biblioteca/${SETOR_B}/nivel_1/arq_novo_b.pdf`,
    }),
  )
})

test('arquivos: admin atualiza no próprio setor (permitido)', async () => {
  await assertSucceeds(updateDoc(doc(ctxAdmin(), 'arquivos', 'arq_pub_A'), { titulo: 'Editado' }))
})

test('arquivos: usuário comum NÃO atualiza (bloqueado)', async () => {
  await assertFails(updateDoc(doc(ctxUsuario(), 'arquivos', 'arq_pub_A'), { titulo: 'X' }))
})

test('arquivos: admin remove no próprio setor (permitido)', async () => {
  await assertSucceeds(deleteDoc(doc(ctxAdmin(), 'arquivos', 'arq_pub_A')))
})

test('arquivos: usuário comum NÃO remove (bloqueado)', async () => {
  await assertFails(deleteDoc(doc(ctxUsuario(), 'arquivos', 'arq_pub_A')))
})

// ---- auditoria ----
test('auditoria: admin registra ação (permitido)', async () => {
  await assertSucceeds(
    setDoc(doc(ctxAdmin(), 'arquivos', 'arq_pub_A', 'auditoria', 'aud1'), {
      acao: 'atualizado',
      id_usuario: UID_ADMIN,
      data: new Date(),
    }),
  )
})

test('auditoria: usuário comum NÃO registra (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(ctxUsuario(), 'arquivos', 'arq_pub_A', 'auditoria', 'aud2'), {
      acao: 'atualizado',
      id_usuario: UID_USUARIO,
      data: new Date(),
    }),
  )
})

// ---- solicitacoes (Sprint 2): negado ----
test('solicitacoes: leitura negada nesta fase (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxAdmin(), 'solicitacoes', 'qualquer')))
})

// ---- setores ----
test('setores: usuário lê setor ao qual pertence (permitido)', async () => {
  await assertSucceeds(getDoc(doc(ctxUsuario(), 'setores', SETOR_A)))
})

test('setores: usuário NÃO lê setor ao qual não pertence (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxUsuario(), 'setores', SETOR_B)))
})

test('setores: não autenticado NÃO lê (bloqueado)', async () => {
  await assertFails(getDoc(doc(ctxAnonimo(), 'setores', SETOR_A)))
})

test('setores: cliente NÃO escreve (bloqueado)', async () => {
  await assertFails(setDoc(doc(ctxAdmin(), 'setores', SETOR_A), { nome: 'X' }))
})
