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

// Valores conforme contrato oficial (src/servicos/casos_de_uso/biblioteca.js).
const TIPOS = ['circulares', 'topicos', 'metodos', 'planos_aula', 'provas', 'modelos', 'outros']
const NIVEL_PUBLICO = 1
const NIVEL_RESTRITO = 2
const SETORES = ['cachoeira', 'queluz']

// id_usuario de referência para os metadados (autor do cadastro no ambiente local).
const ID_USUARIO_SEED = 'seed-admin'

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

// Monta o id_nuvem no formato oficial: biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.pdf
function montarIdNuvem(idSetor, nivelAcesso, idArquivo) {
  const segmentoNivel = nivelAcesso === NIVEL_RESTRITO ? 'nivel_2' : 'nivel_1'
  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.pdf`
}

// Gera a lista de 20 arquivos distribuídos entre setores, tipos e níveis.
function gerarArquivos(total = 20) {
  const lista = []
  for (let i = 0; i < total; i += 1) {
    const idSetor = SETORES[i % SETORES.length]
    const tipo = TIPOS[i % TIPOS.length]
    // Aproximadamente 1/3 restrito, 2/3 público.
    const nivelAcesso = i % 3 === 0 ? NIVEL_RESTRITO : NIVEL_PUBLICO
    const numero = String(i + 1).padStart(2, '0')
    lista.push({
      idArquivo: `seed-arquivo-${numero}`,
      id_setor: idSetor,
      tipo,
      titulo: `Documento ${numero} — ${tipo}`,
      nivel_acesso: nivelAcesso,
      id_usuario: ID_USUARIO_SEED,
    })
  }
  return lista
}

// Envia o PDF ao Storage emulator via REST (upload simples), sob o caminho id_nuvem.
async function enviarPdf(idNuvem) {
  const objeto = encodeURIComponent(idNuvem)
  const url = `http://${EMU_HOST}:${STORAGE_PORT}/v0/b/${PROJETO}.appspot.com/o?name=${objeto}`
  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
      Authorization: 'Bearer owner',
    },
    body: PDF_MINIMO,
  })
  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '')
    throw new Error(`Falha ao enviar ${idNuvem} ao Storage (${resposta.status}): ${detalhe}`)
  }
}

async function main() {
  const arquivos = gerarArquivos(20)

  // 1) Envia os binários ao Storage emulator.
  for (const a of arquivos) {
    const idNuvem = montarIdNuvem(a.id_setor, a.nivel_acesso, a.idArquivo)
    await enviarPdf(idNuvem)
  }

  // 2) Persiste os metadados (regras desativadas apenas para seed).
  const testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: EMU_HOST, port: FIRESTORE_PORT },
  })

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const a of arquivos) {
      const idNuvem = montarIdNuvem(a.id_setor, a.nivel_acesso, a.idArquivo)
      // Campos conforme repositorioArquivos.criarArquivo (não inventar campos).
      await setDoc(doc(db, 'arquivos', a.idArquivo), {
        id_setor: a.id_setor,
        tipo: a.tipo,
        titulo: a.titulo,
        nivel_acesso: a.nivel_acesso,
        id_nuvem: idNuvem,
        id_usuario: a.id_usuario,
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
