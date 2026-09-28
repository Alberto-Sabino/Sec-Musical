// Espelha a massa da Biblioteca de um setor de ORIGEM para outros setores no
// EMULADOR local (ensaio). Útil quando você já subiu arquivos reais por um setor
// (ex.: cachoeira) e quer replicar a mesma massa nos demais sem refazer o upload
// manual pela aplicação. NÃO usar em produção (cada secretário gerencia o seu).
//
// Espelhamento (idempotente): a cada execução, os setores de DESTINO são
// LIMPOS (documentos + auditoria + binários) e recebem uma cópia fiel da origem.
// Rodar 1x ou N vezes produz o mesmo resultado; não acumula duplicatas. O setor
// de origem nunca é alterado (há proteção explícita contra limpá-lo).
//
// O que faz, para cada setor de destino:
//   0) limpa os arquivos existentes do setor de destino;
//   e, para cada arquivo da origem:
//   1) gera um novo id_arquivo;
//   2) copia o binário no Storage para o novo id_nuvem (setor de destino);
//   3) grava o documento em `arquivos` com id_setor trocado (demais campos iguais);
//   4) registra auditoria mínima ('criado').
//
// Mantém o contrato oficial de `id_nuvem`:
//   biblioteca/{id_setor}/nivel_1|nivel_2/{id_arquivo}.{extensao}
//
// Uso:
//   1) subir emuladores:  docker compose up emuladores
//   2) popular usuários/setores, se ainda não: npm run seed:emulador
//   3) subir os arquivos do setor de origem pela aplicação (uso real);
//   4) rodar: node scripts/clonar-arquivos-setores.mjs
//
// Variáveis opcionais:
//   SETOR_ORIGEM (default: cachoeira)
//   SETORES_DESTINO (lista separada por vírgula; default: os demais do piloto)
//   SEED_EMAIL / SEED_SENHA (usuário do seed para autenticar no Storage emulator;
//     as storage.rules exigem request.auth != null. Default: admin do seed.)
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import {
  getStorage,
  connectStorageEmulator,
  ref as storageRef,
  getBytes,
  uploadBytes,
  deleteObject,
} from 'firebase/storage'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

const PROJETO = 'sec-musical-mvp'
const BUCKET = 'sec-musical-mvp.firebasestorage.app'
const EMU_HOST = process.env.EMULATOR_HOST || '127.0.0.1'

const TODOS_SETORES = ['cachoeira', 'cruzeiro', 'queluz', 'sjbarreiro']

const SETOR_ORIGEM = process.env.SETOR_ORIGEM || 'cachoeira'
const SETORES_DESTINO = (process.env.SETORES_DESTINO || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// Destinos: os informados ou todos os demais setores do piloto.
const destinos = SETORES_DESTINO.length
  ? SETORES_DESTINO
  : TODOS_SETORES.filter((s) => s !== SETOR_ORIGEM)

const NIVEL_RESTRITO = 2

// Credenciais do seed para autenticar no emulador (storage.rules exigem auth).
const SEED_EMAIL = process.env.SEED_EMAIL || 'alberto@exemplo.com'
const SEED_SENHA = process.env.SEED_SENHA || 'senha123'

// MIME por extensão — as storage.rules aceitam apenas PDF/XLSX no create.
const MIME_POR_EXTENSAO = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function mimeDeExtensao(ext) {
  return MIME_POR_EXTENSAO[ext] || 'application/octet-stream'
}

// Recalcula o id_nuvem para o setor/arquivo de destino (contrato oficial).
function montarIdNuvem({ idSetor, nivelAcesso, idArquivo, extensao }) {
  const segmentoNivel = nivelAcesso === NIVEL_RESTRITO ? 'nivel_2' : 'nivel_1'
  return `biblioteca/${idSetor}/${segmentoNivel}/${idArquivo}.${extensao}`
}

// Extensão a partir do documento (campo persistido) ou do próprio id_nuvem.
function extensaoDoArquivo(dados) {
  if (dados.extensao_arquivo) {
    return String(dados.extensao_arquivo).toLowerCase()
  }
  const nome = String(dados.id_nuvem || '').split('/').pop() || ''
  const ponto = nome.lastIndexOf('.')
  return ponto >= 0 ? nome.slice(ponto + 1).toLowerCase() : 'pdf'
}

// App client para Auth + Storage (apontando ao emulador).
const app = initializeApp({ projectId: PROJETO, apiKey: 'demo', storageBucket: BUCKET })
const auth = getAuth(app)
connectAuthEmulator(auth, `http://${EMU_HOST}:9099`, { disableWarnings: true })
const storage = getStorage(app)
connectStorageEmulator(storage, EMU_HOST, 9199)

async function copiarBinario(idNuvemOrigem, idNuvemDestino, extensao) {
  const bytes = await getBytes(storageRef(storage, idNuvemOrigem))
  // Reenvia com o contentType correto (regras aceitam apenas PDF/XLSX no create).
  await uploadBytes(storageRef(storage, idNuvemDestino), new Uint8Array(bytes), {
    contentType: mimeDeExtensao(extensao),
  })
}

// Remove todos os arquivos de um setor: subcoleção de auditoria, binário no
// Storage e o documento. Protegido para nunca operar sobre o setor de origem.
async function limparSetor(db, idSetor) {
  if (idSetor === SETOR_ORIGEM) {
    throw new Error(`Recusado: limpar o setor de origem "${idSetor}" não é permitido.`)
  }

  const snap = await getDocs(query(collection(db, 'arquivos'), where('id_setor', '==', idSetor)))
  let removidos = 0

  for (const d of snap.docs) {
    const dados = d.data()

    // Auditoria (subcoleção) antes do documento pai.
    const auditoria = await getDocs(collection(db, 'arquivos', d.id, 'auditoria'))
    for (const a of auditoria.docs) {
      await deleteDoc(a.ref)
    }

    // Binário no Storage (ignora ausência).
    if (dados.id_nuvem) {
      await deleteObject(storageRef(storage, dados.id_nuvem)).catch(() => {})
    }

    await deleteDoc(d.ref)
    removidos += 1
  }

  return removidos
}

async function main() {
  if (!destinos.length) {
    console.error('Nenhum setor de destino. Verifique SETORES_DESTINO/SETOR_ORIGEM.')
    process.exit(1)
  }

  // Autentica no emulador: as storage.rules exigem request.auth != null.
  await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_SENHA)

  const testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: EMU_HOST, port: 8080 },
  })

  let totalClonados = 0

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()

    // Lê os arquivos do setor de origem.
    const snap = await getDocs(
      query(collection(db, 'arquivos'), where('id_setor', '==', SETOR_ORIGEM)),
    )
    const origem = snap.docs.map((d) => ({ id_arquivo: d.id, ...d.data() }))

    if (!origem.length) {
      console.warn(`Nenhum arquivo encontrado no setor de origem "${SETOR_ORIGEM}".`)
      return
    }

    console.log(`Origem "${SETOR_ORIGEM}": ${origem.length} arquivo(s).`)

    for (const idSetorDestino of destinos) {
      // Espelhamento: limpa o destino antes de recopiar, para o resultado ser
      // sempre idêntico à origem (idempotente), sem acumular em reexecuções.
      const removidos = await limparSetor(db, idSetorDestino)
      let clonadosSetor = 0

      for (const arq of origem) {
        // Novo documento e novo caminho no setor de destino.
        const novaRef = doc(collection(db, 'arquivos'))
        const idArquivoNovo = novaRef.id
        const extensao = extensaoDoArquivo(arq)
        const idNuvemDestino = montarIdNuvem({
          idSetor: idSetorDestino,
          nivelAcesso: arq.nivel_acesso,
          idArquivo: idArquivoNovo,
          extensao,
        })

        // 1) Copia o binário real no Storage.
        await copiarBinario(arq.id_nuvem, idNuvemDestino, extensao)

        // 2) Grava o documento com id_setor/id_nuvem de destino (demais campos iguais).
        await setDoc(novaRef, {
          id_setor: idSetorDestino,
          tipo: arq.tipo,
          titulo: arq.titulo,
          nivel_acesso: arq.nivel_acesso,
          id_nuvem: idNuvemDestino,
          id_usuario: arq.id_usuario,
          extensao_arquivo: extensao,
          tamanho_bytes: arq.tamanho_bytes ?? null,
          data_inclusao: serverTimestamp(),
          data_atualizacao: serverTimestamp(),
        })

        // 3) Auditoria mínima.
        await addDoc(collection(db, 'arquivos', idArquivoNovo, 'auditoria'), {
          acao: 'criado',
          id_usuario: arq.id_usuario,
          data: serverTimestamp(),
        })

        clonadosSetor += 1
        totalClonados += 1
      }

      console.log(
        `  -> "${idSetorDestino}": ${removidos} removido(s), ${clonadosSetor} clonado(s).`,
      )
    }
  })

  await testEnv.cleanup()

  console.log(`Concluído. Total clonado: ${totalClonados} arquivo(s) em ${destinos.length} setor(es).`)
  process.exit(0)
}

main().catch((e) => {
  console.error('Falha ao clonar arquivos:', e)
  process.exit(1)
})
