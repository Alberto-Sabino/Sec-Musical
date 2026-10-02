// Testes das regras de Storage (Specs 14/15 + hardening com claims da Spec 17).
// Autorização por custom claims (request.auth.token): ativo, nivel_acesso, ids_setor.
// Biblioteca: PDF/XLSX até 50 MB (teto); Solicitações: PDF até 2 MB.
// Executar com o emulador de Storage: npm run test:rules
import { test, before, after } from 'node:test'
import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import { ref as storageRef, uploadBytes, deleteObject, getBytes } from 'firebase/storage'

const PROJETO = 'sec-musical-mvp'
const MB = 1024 * 1024

const MIME_PDF = 'application/pdf'
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const SETOR_A = 'setorA'
const SETOR_B = 'setorB'

// UIDs de teste
const UID_COMUM = 'user_comum' // nivel_acesso 1, setorA
const UID_ADMIN = 'admin_a' // nivel_acesso 2, setorA
const UID_SOLICITANTE = 'solicitante_1' // dono da resposta final
const UID_INATIVO = 'user_inativo' // ativo=false

// Bytes de tamanho controlado (o conteúdo não precisa ser um arquivo válido para a regra).
const bytes = (tamanho) => new Uint8Array(tamanho)

let testEnv

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    storage: {
      rules: readFileSync('storage.rules', 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  })
})

after(async () => {
  await testEnv.cleanup()
})

// Contextos com custom claims (segundo argumento = tokenOptions).
function ctxComum() {
  return testEnv
    .authenticatedContext(UID_COMUM, { ativo: true, nivel_acesso: 1, ids_setor: [SETOR_A] })
    .storage()
}
function ctxAdmin() {
  return testEnv
    .authenticatedContext(UID_ADMIN, { ativo: true, nivel_acesso: 2, ids_setor: [SETOR_A] })
    .storage()
}
function ctxSolicitante() {
  return testEnv
    .authenticatedContext(UID_SOLICITANTE, { ativo: true, nivel_acesso: 1, ids_setor: [SETOR_A] })
    .storage()
}
function ctxInativo() {
  return testEnv
    .authenticatedContext(UID_INATIVO, { ativo: false, nivel_acesso: 2, ids_setor: [SETOR_A] })
    .storage()
}
function anonimo() {
  return testEnv.unauthenticatedContext().storage()
}

function enviar(ctx, caminho, tamanho, mime) {
  return uploadBytes(storageRef(ctx, caminho), bytes(tamanho), { contentType: mime })
}

async function semeadoNoStorage(caminho, mime) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(storageRef(ctx.storage(), caminho), bytes(1000), { contentType: mime })
  })
}

// ================= Biblioteca =================

// ---- leitura ----
test('biblioteca: usuário comum lê nivel_1 do próprio setor (permitido)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_1/r1.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(getBytes(storageRef(ctxComum(), caminho)))
})

test('biblioteca: usuário comum NÃO lê nivel_2 (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_2/r2.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxComum(), caminho)))
})

test('biblioteca: usuário NÃO lê setor fora da claim (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR_B}/nivel_1/r3.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxComum(), caminho)))
})

test('biblioteca: admin lê nivel_2 do próprio setor (permitido)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_2/r4.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(getBytes(storageRef(ctxAdmin(), caminho)))
})

test('biblioteca: não autenticado NÃO lê (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_1/r5.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(anonimo(), caminho)))
})

test('biblioteca: usuário inativo NÃO lê (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_1/r6.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxInativo(), caminho)))
})

// ---- escrita ----
test('biblioteca: admin envia PDF no próprio setor dentro do limite (permitido)', async () => {
  await assertSucceeds(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/a1.pdf`, 1 * MB, MIME_PDF))
})

test('biblioteca: admin envia XLSX no próprio setor (permitido)', async () => {
  await assertSucceeds(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/a2.xlsx`, 1 * MB, MIME_XLSX))
})

test('biblioteca: usuário comum NÃO envia (bloqueado)', async () => {
  await assertFails(enviar(ctxComum(), `biblioteca/${SETOR_A}/nivel_1/a3.pdf`, 1 * MB, MIME_PDF))
})

test('biblioteca: admin NÃO escreve fora do seu setor (bloqueado)', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_B}/nivel_1/a4.pdf`, 1 * MB, MIME_PDF))
})

test('biblioteca: formato não aceito (imagem) é bloqueado', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/a5.png`, 1000, 'image/png'))
})

test('biblioteca: acima do teto de 50 MB é bloqueado', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/a6.pdf`, 51 * MB, MIME_PDF))
})

test('biblioteca: não autenticado NÃO envia (bloqueado)', async () => {
  await assertFails(enviar(anonimo(), `biblioteca/${SETOR_A}/nivel_1/a7.pdf`, 1000, MIME_PDF))
})

// ---- deleção ----
test('biblioteca: admin remove arquivo do próprio setor (permitido)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_1/del1.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(deleteObject(storageRef(ctxAdmin(), caminho)))
})

test('biblioteca: usuário comum NÃO remove (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR_A}/nivel_1/del2.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(deleteObject(storageRef(ctxComum(), caminho)))
})

// ================= Solicitações (resposta final) =================

// ---- leitura: somente o solicitante (Spec 17 §2.2) ----
test('solicitacoes: solicitante lê a própria resposta.pdf (permitido)', async () => {
  const caminho = `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol1/resposta.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(getBytes(storageRef(ctxSolicitante(), caminho)))
})

test('solicitacoes: outro usuário autenticado NÃO lê a resposta (bloqueado)', async () => {
  const caminho = `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol2/resposta.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxComum(), caminho)))
})

test('solicitacoes: admin NÃO lê a resposta (decisão: só o solicitante) (bloqueado)', async () => {
  const caminho = `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol3/resposta.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxAdmin(), caminho)))
})

// ---- escrita: somente admin do setor ----
test('solicitacoes: admin do setor envia PDF até 2 MB (permitido)', async () => {
  await assertSucceeds(
    enviar(ctxAdmin(), `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol4/resposta.pdf`, 1 * MB, MIME_PDF),
  )
})

test('solicitacoes: usuário comum NÃO envia resposta (bloqueado)', async () => {
  await assertFails(
    enviar(ctxComum(), `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol5/resposta.pdf`, 1 * MB, MIME_PDF),
  )
})

test('solicitacoes: admin NÃO envia em setor fora da claim (bloqueado)', async () => {
  await assertFails(
    enviar(ctxAdmin(), `solicitacoes/${SETOR_B}/${UID_SOLICITANTE}/sol6/resposta.pdf`, 1 * MB, MIME_PDF),
  )
})

test('solicitacoes: XLSX é bloqueado (só PDF)', async () => {
  await assertFails(
    enviar(ctxAdmin(), `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol7/resposta.xlsx`, 1000, MIME_XLSX),
  )
})

test('solicitacoes: PDF acima de 2 MB é bloqueado', async () => {
  await assertFails(
    enviar(ctxAdmin(), `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol8/resposta.pdf`, 3 * MB, MIME_PDF),
  )
})

test('solicitacoes: não autenticado é bloqueado', async () => {
  await assertFails(
    enviar(anonimo(), `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/sol9/resposta.pdf`, 1000, MIME_PDF),
  )
})

test('solicitacoes: admin do setor remove anexo existente (permitido)', async () => {
  const caminho = `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/soldel/resposta.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(deleteObject(storageRef(ctxAdmin(), caminho)))
})

// ================= Caminho fora do contrato =================
test('caminho não previsto é bloqueado por padrão', async () => {
  await assertFails(enviar(ctxAdmin(), `outro/caminho/arq.pdf`, 1000, MIME_PDF))
})
