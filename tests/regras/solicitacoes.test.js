// Testes das regras do Firestore para `solicitacoes` (Sprint 2 / Lote 8).
// Executar com o emulador: `npm run test:rules`.
import { test, before, after, beforeEach } from 'node:test'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const PROJETO = 'sec-musical-mvp'

const UID_USUARIO = 'user_comum'
const UID_OUTRO = 'user_outro'
const UID_ADMIN = 'admin_1'
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

function solEmAberto(idSolicitante = UID_USUARIO, idSetor = SETOR_A) {
  return {
    id_setor: idSetor,
    id_solicitante: idSolicitante,
    nome_solicitante: 'Nome Solicitante',
    nome_beneficiario: 'Beneficiario X',
    id_responsavel: '',
    nome_responsavel: '',
    tipo: 'avaliacao',
    status: 'em_aberto',
    descricao: 'Descricao inicial',
    conclusao: '',
    id_nuvem: '',
    data_solicitacao: new Date(),
    data_atualizacao: new Date(),
  }
}

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'usuarios', UID_USUARIO), {
      nivel_acesso: 1,
      ativo: true,
      ids_setor: [SETOR_A],
      nome_completo: 'Encarregado Um',
    })
    await setDoc(doc(db, 'usuarios', UID_OUTRO), {
      nivel_acesso: 1,
      ativo: true,
      ids_setor: [SETOR_A],
      nome_completo: 'Encarregado Dois',
    })
    await setDoc(doc(db, 'usuarios', UID_ADMIN), {
      nivel_acesso: 2,
      ativo: true,
      ids_setor: [SETOR_A],
      nome_completo: 'Secretário Um',
    })
    // Solicitação em aberto do usuário comum no setor A.
    await setDoc(doc(db, 'solicitacoes', 'sol1'), solEmAberto())
    // Solicitação em andamento no setor A (para transições admin).
    await setDoc(doc(db, 'solicitacoes', 'sol_andamento'), {
      ...solEmAberto(),
      status: 'em_andamento',
      id_responsavel: UID_ADMIN,
    })
  })
})

function cUsuario() {
  return testEnv.authenticatedContext(UID_USUARIO).firestore()
}
function cOutro() {
  return testEnv.authenticatedContext(UID_OUTRO).firestore()
}
function cAdmin() {
  return testEnv.authenticatedContext(UID_ADMIN).firestore()
}

// ---- leitura ----
test('solicitacoes: solicitante lê a própria (permitido)', async () => {
  await assertSucceeds(getDoc(doc(cUsuario(), 'solicitacoes', 'sol1')))
})

test('solicitacoes: outro usuário NÃO lê solicitação alheia (bloqueado)', async () => {
  await assertFails(getDoc(doc(cOutro(), 'solicitacoes', 'sol1')))
})

test('solicitacoes: admin do setor lê (permitido)', async () => {
  await assertSucceeds(getDoc(doc(cAdmin(), 'solicitacoes', 'sol1')))
})

// ---- criação ----
test('solicitacoes: usuário cria no próprio setor com estado inicial correto (permitido)', async () => {
  await assertSucceeds(setDoc(doc(cUsuario(), 'solicitacoes', 'nova1'), solEmAberto()))
})

test('solicitacoes: usuário NÃO cria já em_andamento (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(cUsuario(), 'solicitacoes', 'nova2'), {
      ...solEmAberto(),
      status: 'em_andamento',
    }),
  )
})

test('solicitacoes: usuário NÃO cria com id_responsavel preenchido (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(cUsuario(), 'solicitacoes', 'nova3'), {
      ...solEmAberto(),
      id_responsavel: UID_ADMIN,
    }),
  )
})

test('solicitacoes: usuário NÃO cria em setor que não é o seu (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(cUsuario(), 'solicitacoes', 'nova4'), {
      ...solEmAberto(UID_USUARIO, SETOR_B),
    }),
  )
})

test('solicitacoes: usuário NÃO cria como solicitante diferente de si (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(cUsuario(), 'solicitacoes', 'nova5'), {
      ...solEmAberto(UID_OUTRO, SETOR_A),
    }),
  )
})

test('solicitacoes: usuário NÃO cria sem nome_beneficiario (bloqueado)', async () => {
  const dados = solEmAberto()
  dados.nome_beneficiario = ''
  await assertFails(setDoc(doc(cUsuario(), 'solicitacoes', 'nova6'), dados))
})

test('solicitacoes: usuário NÃO cria sem descricao (bloqueado)', async () => {
  const dados = solEmAberto()
  dados.descricao = ''
  await assertFails(setDoc(doc(cUsuario(), 'solicitacoes', 'nova7'), dados))
})

test('solicitacoes: usuário NÃO cria com conclusao preenchida (bloqueado)', async () => {
  const dados = solEmAberto()
  dados.conclusao = 'algo'
  await assertFails(setDoc(doc(cUsuario(), 'solicitacoes', 'nova8'), dados))
})

// ---- edição/cancelamento pelo usuário ----
test('solicitacoes: dono edita descrição enquanto em_aberto (permitido)', async () => {
  await assertSucceeds(updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { descricao: 'texto' }))
})

test('solicitacoes: dono NÃO esvazia a descrição (bloqueado)', async () => {
  await assertFails(updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { descricao: '' }))
})

test('solicitacoes: dono NÃO altera nome_beneficiario (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { nome_beneficiario: 'Outro' }),
  )
})

test('solicitacoes: dono NÃO grava conclusao (bloqueado)', async () => {
  await assertFails(updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { conclusao: 'resposta' }))
})

test('solicitacoes: dono cancela enquanto em_aberto (permitido)', async () => {
  await assertSucceeds(updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { status: 'cancelada' }))
})

test('solicitacoes: dono NÃO muda para em_andamento (bloqueado)', async () => {
  await assertFails(updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { status: 'em_andamento' }))
})

test('solicitacoes: dono NÃO define id_responsavel (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { id_responsavel: UID_USUARIO }),
  )
})

test('solicitacoes: dono NÃO grava id_nuvem (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cUsuario(), 'solicitacoes', 'sol1'), { id_nuvem: 'x/y/z/resposta.pdf' }),
  )
})

// ---- transições admin ----
test('solicitacoes: admin assume em_aberto -> em_andamento (permitido)', async () => {
  await assertSucceeds(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol1'), {
      status: 'em_andamento',
      id_responsavel: UID_ADMIN,
      nome_responsavel: 'Secretário Um',
    }),
  )
})

test('solicitacoes: admin assume com nome_responsavel divergente (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol1'), {
      status: 'em_andamento',
      id_responsavel: UID_ADMIN,
      nome_responsavel: 'Outro Nome',
    }),
  )
})

test('solicitacoes: admin NÃO conclui direto de em_aberto (bloqueado)', async () => {
  await assertFails(updateDoc(doc(cAdmin(), 'solicitacoes', 'sol1'), { status: 'concluida' }))
})

test('solicitacoes: admin conclui em_andamento -> concluida (permitido)', async () => {
  await assertSucceeds(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), { status: 'concluida' }),
  )
})

test('solicitacoes: admin anexa (em_andamento, grava id_nuvem) (permitido)', async () => {
  await assertSucceeds(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), {
      id_nuvem: `solicitacoes/${SETOR_A}/${UID_USUARIO}/sol_andamento/resposta.pdf`,
    }),
  )
})

test('solicitacoes: admin cancela em_andamento -> cancelada (permitido)', async () => {
  await assertSucceeds(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), { status: 'cancelada' }),
  )
})

test('solicitacoes: admin grava conclusao em_andamento (permitido)', async () => {
  await assertSucceeds(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), {
      conclusao: 'Resposta do secretário',
    }),
  )
})

test('solicitacoes: admin NÃO grava conclusao em em_aberto (bloqueado)', async () => {
  await assertFails(updateDoc(doc(cAdmin(), 'solicitacoes', 'sol1'), { conclusao: 'Resposta' }))
})

test('solicitacoes: admin NÃO altera descricao (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), { descricao: 'alterada' }),
  )
})

test('solicitacoes: admin NÃO altera nome_beneficiario (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), { nome_beneficiario: 'Outro' }),
  )
})

test('solicitacoes: admin NÃO altera conclusao ao concluir (bloqueado)', async () => {
  await assertFails(
    updateDoc(doc(cAdmin(), 'solicitacoes', 'sol_andamento'), {
      status: 'concluida',
      conclusao: 'muda ao concluir',
    }),
  )
})

test('solicitacoes: exclusão sempre bloqueada', async () => {
  await assertFails(deleteDoc(doc(cAdmin(), 'solicitacoes', 'sol1')))
})

// ---- auditoria ----
test('auditoria solicitacoes: admin registra (permitido)', async () => {
  await assertSucceeds(
    setDoc(doc(cAdmin(), 'solicitacoes', 'sol1', 'auditoria', 'a1'), {
      acao: 'assumida',
      id_usuario: UID_ADMIN,
      status_anterior: 'em_aberto',
      status_novo: 'em_andamento',
      data: new Date(),
    }),
  )
})

test('auditoria solicitacoes: dono registra a própria (permitido)', async () => {
  await assertSucceeds(
    setDoc(doc(cUsuario(), 'solicitacoes', 'sol1', 'auditoria', 'a2'), {
      acao: 'criada',
      id_usuario: UID_USUARIO,
      status_anterior: '',
      status_novo: 'em_aberto',
      data: new Date(),
    }),
  )
})

test('auditoria solicitacoes: registro com autor falso (bloqueado)', async () => {
  await assertFails(
    setDoc(doc(cUsuario(), 'solicitacoes', 'sol1', 'auditoria', 'a3'), {
      acao: 'criada',
      id_usuario: UID_ADMIN,
      data: new Date(),
    }),
  )
})
