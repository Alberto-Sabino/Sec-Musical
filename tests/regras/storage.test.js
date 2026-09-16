// Testes das regras de Storage (Specs 14/15).
// Biblioteca: PDF/XLSX até 50 MB (teto); Solicitações: PDF até 2 MB.
// Executar com o emulador de Storage: npm run test:rules
// (o script de emulators:exec sobe firestore; ver observação no final se precisar de --only storage).
import { test, before, after } from 'node:test'
import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import { ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage'

const PROJETO = 'sec-musical-mvp'
const UID = 'user_1'
const SETOR = 'setorA'
const MB = 1024 * 1024

const MIME_PDF = 'application/pdf'
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

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

function autenticado() {
  return testEnv.authenticatedContext(UID).storage()
}
function anonimo() {
  return testEnv.unauthenticatedContext().storage()
}

function enviar(ctx, caminho, tamanho, mime) {
  return uploadBytes(storageRef(ctx, caminho), bytes(tamanho), { contentType: mime })
}

// ---- Biblioteca ----
test('biblioteca: autenticado envia PDF dentro do limite (permitido)', async () => {
  await assertSucceeds(
    enviar(autenticado(), `biblioteca/${SETOR}/nivel_1/a1.pdf`, 1 * MB, MIME_PDF),
  )
})

test('biblioteca: autenticado envia XLSX dentro do limite (permitido)', async () => {
  await assertSucceeds(
    enviar(autenticado(), `biblioteca/${SETOR}/nivel_1/a2.xlsx`, 1 * MB, MIME_XLSX),
  )
})

test('biblioteca: formato não aceito (imagem) é bloqueado', async () => {
  await assertFails(enviar(autenticado(), `biblioteca/${SETOR}/nivel_1/a3.png`, 1000, 'image/png'))
})

test('biblioteca: acima do teto de 50 MB é bloqueado', async () => {
  await assertFails(enviar(autenticado(), `biblioteca/${SETOR}/nivel_1/a4.pdf`, 51 * MB, MIME_PDF))
})

test('biblioteca: não autenticado é bloqueado', async () => {
  await assertFails(enviar(anonimo(), `biblioteca/${SETOR}/nivel_1/a5.pdf`, 1000, MIME_PDF))
})

// ---- Solicitações ----
test('solicitacoes: autenticado envia PDF até 2 MB (permitido)', async () => {
  await assertSucceeds(
    enviar(autenticado(), `solicitacoes/${SETOR}/${UID}/sol1/resposta.pdf`, 1 * MB, MIME_PDF),
  )
})

test('solicitacoes: XLSX é bloqueado (só PDF)', async () => {
  await assertFails(
    enviar(autenticado(), `solicitacoes/${SETOR}/${UID}/sol1/resposta.xlsx`, 1000, MIME_XLSX),
  )
})

test('solicitacoes: PDF acima de 2 MB é bloqueado', async () => {
  await assertFails(
    enviar(autenticado(), `solicitacoes/${SETOR}/${UID}/sol1/resposta.pdf`, 3 * MB, MIME_PDF),
  )
})

test('solicitacoes: não autenticado é bloqueado', async () => {
  await assertFails(
    enviar(anonimo(), `solicitacoes/${SETOR}/${UID}/sol1/resposta.pdf`, 1000, MIME_PDF),
  )
})

// ---- Caminho fora do contrato ----
test('caminho não previsto é bloqueado por padrão', async () => {
  await assertFails(enviar(autenticado(), `outro/caminho/arq.pdf`, 1000, MIME_PDF))
})

// ---- Deleção ----
// Delete não possui request.resource (sem contentType/size). A regra deve exigir
// apenas autenticação; caso contrário a remoção falha com 403 (bug corrigido).
async function semeadoNoStorage(caminho, mime) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(storageRef(ctx.storage(), caminho), bytes(1000), { contentType: mime })
  })
}

test('biblioteca: autenticado remove arquivo existente (permitido)', async () => {
  const caminho = `biblioteca/${SETOR}/nivel_1/del1.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(deleteObject(storageRef(autenticado(), caminho)))
})

test('biblioteca: não autenticado NÃO remove (bloqueado)', async () => {
  const caminho = `biblioteca/${SETOR}/nivel_1/del2.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(deleteObject(storageRef(anonimo(), caminho)))
})

test('solicitacoes: autenticado remove anexo existente (permitido)', async () => {
  const caminho = `solicitacoes/${SETOR}/${UID}/soldel/resposta.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(deleteObject(storageRef(autenticado(), caminho)))
})
