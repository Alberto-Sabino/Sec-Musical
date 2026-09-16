// Seed opcional para o EMULADOR local: popula 20 arquivos na Biblioteca.
// NÃO usar em produção.
//
// Grava documentos em `arquivos` contornando as regras via
// @firebase/rules-unit-testing (as regras reais bloqueiam escrita direta),
// e envia um PDF real ao Storage emulator sob o `id_nuvem` oficial, para que
// o download da Biblioteca funcione no ambiente local.
//
// Depende dos setores criados pelo seed de usuários (cachoeira, queluz).
// Rode o seed de usuários antes, se ainda não rodou.
//
// Uso:
//   1) subir emuladores:  docker compose up emuladores   (ou npm run emulators)
//   2) (se necessário)    npm run seed:emulador
//   3) em outro terminal: npm run seed:arquivos
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

const PROJETO = 'sec-musical-mvp'
const EMU_HOST = process.env.EMULATOR_HOST || '127.0.0.1'
const STORAGE_PORT = Number(process.env.STORAGE_PORT || 9199)
const FIRESTORE_PORT = Number(process.env.FIRESTORE_PORT || 8080)

// Bucket do Storage. DEVE bater com VITE_FIREBASE_STORAGE_BUCKET usado pela app,
// senão os objetos são gravados em um bucket diferente do que a app consulta.
// Default alinhado ao .env atual (padrão novo do Firebase: .firebasestorage.app).
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'sec-musical-mvp.firebasestorage.app'

// Valores conforme contrato oficial (src/servicos/casos_de_uso/biblioteca.js).
const TIPOS = ['circulares', 'topicos', 'metodos', 'planos_aula', 'provas', 'modelos', 'outros']
const NIVEL_PUBLICO = 1
const NIVEL_RESTRITO = 2
const SETORES = ['cachoeira', 'queluz']

// id_usuario de referência para os metadados (autor do cadastro no ambiente local).
const ID_USUARIO_SEED = 'seed-admin'

// MIME por extensão (Biblioteca aceita pdf e xlsx a partir da Spec 14).
const MIME_POR_EXTENSAO = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

// PDF mínimo válido (1 página em branco). Serve para exercitar o download real.
const PDF_MINIMO = Buffer.from(
  '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n' +
    'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
    '0000000052 00000 n \n0000000101 00000 n \n' +
    'trailer<</Size 4/Root 1 0 R>>\nstartxref\n174\n%%EOF\n',
  'latin1',
)

// XLSX mínimo (um .zip vazio válido). Suficiente para exercitar upload/download local.
// Cabeçalho de arquivo ZIP vazio (End Of Central Directory record).
const XLSX_MINIMO = Buffer.from([
  0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
])

// Conteúdo binário e extensão conforme o formato do arquivo.
function binarioDe(extensao) {
  return extensao === 'xlsx' ? XLSX_MINIMO : PDF_MINIMO
}

// Monta o id_nuvem no formato oficial (Spec 14): extensão real no caminho.
// biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}
function montarIdNuvem(idSetor, nivelAcesso, idArquivo, extensao) {
  const segmentoNivel = nivelAcesso === NIVEL_RESTRITO ? 'nivel_2' : 'nivel_1'
  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.${extensao}`
}

// Gera a lista de 20 arquivos distribuídos entre setores, tipos, níveis e formatos.
function gerarArquivos(total = 20) {
  const lista = []
  for (let i = 0; i < total; i += 1) {
    const idSetor = SETORES[i % SETORES.length]
    const tipo = TIPOS[i % TIPOS.length]
    // Aproximadamente 1/3 restrito, 2/3 público.
    const nivelAcesso = i % 3 === 0 ? NIVEL_RESTRITO : NIVEL_PUBLICO
    // Alguns arquivos em XLSX (ex.: modelos e provas) para exercitar o novo formato.
    const extensao = tipo === 'modelos' || tipo === 'provas' ? 'xlsx' : 'pdf'
    const numero = String(i + 1).padStart(2, '0')
    lista.push({
      idArquivo: `seed-arquivo-${numero}`,
      id_setor: idSetor,
      tipo,
      titulo: `Documento ${numero} — ${tipo}`,
      nivel_acesso: nivelAcesso,
      id_usuario: ID_USUARIO_SEED,
      extensao_arquivo: extensao,
    })
  }
  return lista
}

// Envia o binário ao Storage emulator via REST (upload simples), sob o caminho id_nuvem.
async function enviarBinario(idNuvem, extensao) {
  const objeto = encodeURIComponent(idNuvem)
  const url = `http://${EMU_HOST}:${STORAGE_PORT}/v0/b/${STORAGE_BUCKET}/o?name=${objeto}`
  const corpo = binarioDe(extensao)
  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': MIME_POR_EXTENSAO[extensao],
      Authorization: 'Bearer owner',
    },
    body: corpo,
  })
  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '')
    throw new Error(`Falha ao enviar ${idNuvem} ao Storage (${resposta.status}): ${detalhe}`)
  }
  return corpo.length
}

async function main() {
  const arquivos = gerarArquivos(20)

  // 1) Envia os binários ao Storage emulator e captura o tamanho real.
  for (const a of arquivos) {
    const idNuvem = montarIdNuvem(a.id_setor, a.nivel_acesso, a.idArquivo, a.extensao_arquivo)
    a.tamanho_bytes = await enviarBinario(idNuvem, a.extensao_arquivo)
  }

  // 2) Persiste os metadados (regras desativadas apenas para seed).
  const testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: EMU_HOST, port: FIRESTORE_PORT },
  })

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const a of arquivos) {
      const idNuvem = montarIdNuvem(a.id_setor, a.nivel_acesso, a.idArquivo, a.extensao_arquivo)
      // Campos conforme repositorioArquivos.criarArquivo (Spec 14: extensao_arquivo, tamanho_bytes).
      await setDoc(doc(db, 'arquivos', a.idArquivo), {
        id_setor: a.id_setor,
        tipo: a.tipo,
        titulo: a.titulo,
        nivel_acesso: a.nivel_acesso,
        id_nuvem: idNuvem,
        id_usuario: a.id_usuario,
        extensao_arquivo: a.extensao_arquivo,
        tamanho_bytes: a.tamanho_bytes,
        data_inclusao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }
  })

  await testEnv.cleanup()

  console.log(`Seed de arquivos concluído: ${arquivos.length} arquivos.`)
  const porSetor = {}
  for (const a of arquivos) {
    porSetor[a.id_setor] = (porSetor[a.id_setor] || 0) + 1
  }
  for (const [setor, qtd] of Object.entries(porSetor)) {
    console.log(`  - ${setor}: ${qtd} arquivos`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('Falha no seed de arquivos:', e)
  process.exit(1)
})
