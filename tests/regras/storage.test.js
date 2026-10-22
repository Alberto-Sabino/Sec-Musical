// Testes das regras de Storage (Specs 14/15 + capabilities da Spec 22).
// Autorização por custom claims (request.auth.token): ativo, ids_setor, caps[].
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

// Caps por perfil (Spec 22 §2.2). Mantidos aqui explícitos para clareza do teste.
const CAPS_ENCARREGADO = ['biblioteca_ler_publicos', 'solicitacoes_criar', 'solicitacoes_ver_proprias']
const CAPS_ADMIN_SETOR = [
  'biblioteca_ler_publicos',
  'biblioteca_ler_privados',
  'biblioteca_gerenciar_setor',
  'solicitacoes_ver_proprias',
  'solicitacoes_ver_setor',
  'solicitacoes_agir_setor',
]
const CAPS_ADMIN_GLOBAL = [...CAPS_ADMIN_SETOR, 'biblioteca_gerenciar_global']

// UIDs de teste
const UID_COMUM = 'user_comum' // encarregado, setorA
const UID_ADMIN = 'admin_a' // admin setorial, setorA
const UID_ADMIN_GLOBAL = 'admin_global_a' // admin global, setorA
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
    .authenticatedContext(UID_COMUM, { ativo: true, ids_setor: [SETOR_A], caps: CAPS_ENCARREGADO })
    .storage()
}
function ctxAdmin() {
  return testEnv
    .authenticatedContext(UID_ADMIN, { ativo: true, ids_setor: [SETOR_A], caps: CAPS_ADMIN_SETOR })
    .storage()
}
function ctxAdminGlobal() {
  return testEnv
    .authenticatedContext(UID_ADMIN_GLOBAL, {
      ativo: true,
      ids_setor: [SETOR_A],
      caps: CAPS_ADMIN_GLOBAL,
    })
    .storage()
}
function ctxSolicitante() {
  return testEnv
    .authenticatedContext(UID_SOLICITANTE, {
      ativo: true,
      ids_setor: [SETOR_A],
      caps: CAPS_ENCARREGADO,
    })
    .storage()
}
function ctxInativo() {
  return testEnv
    .authenticatedContext(UID_INATIVO, { ativo: false, ids_setor: [SETOR_A], caps: CAPS_ADMIN_SETOR })
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

// ================= Biblioteca GLOBAL (Spec 18) =================

// ---- leitura ----
test('global: usuário comum lê nivel_1 global (permitido)', async () => {
  const caminho = `biblioteca_global/nivel_1/g1.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(getBytes(storageRef(ctxComum(), caminho)))
})

test('global: usuário comum NÃO lê nivel_2 global (bloqueado)', async () => {
  const caminho = `biblioteca_global/nivel_2/g2.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxComum(), caminho)))
})

test('global: admin lê nivel_2 global (permitido)', async () => {
  const caminho = `biblioteca_global/nivel_2/g3.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(getBytes(storageRef(ctxAdmin(), caminho)))
})

test('global: não autenticado NÃO lê global (bloqueado)', async () => {
  const caminho = `biblioteca_global/nivel_1/g4.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(anonimo(), caminho)))
})

test('global: usuário inativo NÃO lê global (bloqueado)', async () => {
  const caminho = `biblioteca_global/nivel_1/g5.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxInativo(), caminho)))
})

// ---- escrita ----
test('global: admin_global envia PDF global dentro do limite (permitido)', async () => {
  await assertSucceeds(enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/gw1.pdf`, 1 * MB, MIME_PDF))
})

test('global: admin_global envia XLSX global (permitido)', async () => {
  await assertSucceeds(
    enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/gw2.xlsx`, 1 * MB, MIME_XLSX),
  )
})

test('global: admin comum (sem admin_global) NÃO escreve global (bloqueado)', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca_global/nivel_1/gw3.pdf`, 1 * MB, MIME_PDF))
})

test('global: usuário comum NÃO escreve global (bloqueado)', async () => {
  await assertFails(enviar(ctxComum(), `biblioteca_global/nivel_1/gw4.pdf`, 1 * MB, MIME_PDF))
})

// Consistência de capabilities (Spec 22): sem a cap biblioteca_gerenciar_global,
// mesmo um admin setorial não escreve na biblioteca global.
test('global: usuário sem cap gerenciar_global NÃO escreve global (bloqueado)', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca_global/nivel_1/gwcap.pdf`, 1 * MB, MIME_PDF))
})

test('global: formato não aceito (imagem) é bloqueado', async () => {
  await assertFails(enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/gw5.png`, 1000, 'image/png'))
})

test('global: acima do teto de 50 MB é bloqueado', async () => {
  await assertFails(enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/gw6.pdf`, 51 * MB, MIME_PDF))
})

// ---- deleção ----
test('global: admin_global remove arquivo global (permitido)', async () => {
  const caminho = `biblioteca_global/nivel_1/gdel1.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertSucceeds(deleteObject(storageRef(ctxAdminGlobal(), caminho)))
})

test('global: admin comum NÃO remove arquivo global (bloqueado)', async () => {
  const caminho = `biblioteca_global/nivel_1/gdel2.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(deleteObject(storageRef(ctxAdmin(), caminho)))
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

// ================= Anti-bypass (Spec 24) =================
// Reforço de malha: MIME divergente, {allPaths=**} negado e paths estruturalmente
// inválidos. Cobrem brechas independentemente do hardening de extensão (opcional).

// C) MIME divergente com "extensão certa" no path: PDF de nome, imagem de conteúdo.
test('anti-bypass: biblioteca path .pdf com contentType de imagem é bloqueado', async () => {
  await assertFails(
    enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/fake.pdf`, 1000, 'image/png'),
  )
})

test('anti-bypass: global path .pdf com contentType de imagem é bloqueado', async () => {
  await assertFails(
    enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/fake.pdf`, 1000, 'image/png'),
  )
})

test('anti-bypass: solicitacoes path .pdf com contentType de imagem é bloqueado', async () => {
  await assertFails(
    enviar(
      ctxAdmin(),
      `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/solbp/resposta.pdf`,
      1000,
      'image/png',
    ),
  )
})

// D) {allPaths=**} negado: paths fora de todos os contratos, inclusive para admin_global.
test('anti-bypass: escrita na raiz do bucket é bloqueada (allPaths=**)', async () => {
  await assertFails(enviar(ctxAdminGlobal(), `raiz.pdf`, 1000, MIME_PDF))
})

test('anti-bypass: leitura de path arbitrário fora do contrato é bloqueada (allPaths=**)', async () => {
  const caminho = `qualquer/coisa/x.pdf`
  await semeadoNoStorage(caminho, MIME_PDF)
  await assertFails(getBytes(storageRef(ctxAdminGlobal(), caminho)))
})

test('anti-bypass: escrita em prefixo semelhante mas fora do contrato é bloqueada', async () => {
  // "bibliotecas" (plural) não casa com o match "biblioteca".
  await assertFails(enviar(ctxAdminGlobal(), `bibliotecas/${SETOR_A}/nivel_1/x.pdf`, 1000, MIME_PDF))
})

// E) Path estruturalmente inválido: nível desconhecido na biblioteca.
test('anti-bypass: biblioteca com nível desconhecido (nivel_3) é bloqueada', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_3/x.pdf`, 1000, MIME_PDF))
})

test('anti-bypass: biblioteca global com nível desconhecido (nivel_3) é bloqueada', async () => {
  await assertFails(enviar(ctxAdminGlobal(), `biblioteca_global/nivel_3/x.pdf`, 1000, MIME_PDF))
})

// A/B) Extensão no path divergente do MIME válido (hardening de extensão, Spec 24 §2).
// MIME é PDF/XLSX válido, mas o nome do objeto tem extensão incoerente → bloqueado.
test('anti-bypass: biblioteca MIME pdf com path .exe é bloqueado (extensão)', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/doc.exe`, 1000, MIME_PDF))
})

test('anti-bypass: biblioteca MIME pdf sem extensão no path é bloqueado', async () => {
  await assertFails(enviar(ctxAdmin(), `biblioteca/${SETOR_A}/nivel_1/semext`, 1000, MIME_PDF))
})

test('anti-bypass: global MIME xlsx com path .pdf.exe é bloqueado (extensão final)', async () => {
  await assertFails(
    enviar(ctxAdminGlobal(), `biblioteca_global/nivel_1/doc.pdf.exe`, 1000, MIME_XLSX),
  )
})

test('anti-bypass: solicitacoes MIME pdf com path .docx é bloqueado (extensão)', async () => {
  await assertFails(
    enviar(
      ctxAdmin(),
      `solicitacoes/${SETOR_A}/${UID_SOLICITANTE}/solext/resposta.docx`,
      1000,
      MIME_PDF,
    ),
  )
})
