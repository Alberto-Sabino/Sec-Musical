// Seed opcional para o EMULADOR local (ensaio do piloto).
// NÃO usar em produção.
//
// Cria usuários no Auth (client SDK) e grava documentos no Firestore
// contornando as regras via @firebase/rules-unit-testing (devDependency),
// pois as regras reais bloqueiam escrita direta em `usuarios`/`setores`.
//
// Uso:
//   1) subir emuladores:  docker compose up emuladores   (ou npm run emulators)
//   2) em outro terminal: npm run seed:emulador
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

const PROJETO = 'sec-musical-mvp'
const EMU_HOST = process.env.EMULATOR_HOST || '127.0.0.1'

// Setores do piloto.
const SETORES = [
  { id: 'cachoeira', nome: 'Cachoeira Paulista - SP' },
  { id: 'cruzeiro', nome: 'Cruzeiro - SP' },
  { id: 'queluz', nome: 'Queluz - SP' },
  { id: 'sjbarreiro', nome: 'São José do Barreiro - SP' },
]

// Usuários: senha padrão para todos no ambiente local.
const SENHA = 'senha123'

const USUARIOS = [
  {
    email: 'alberto@exemplo.com',
    nome: 'Alberto Sabino da Silva',
    celular: '12992575921',
    comum: 'Quilombo',
    nivel: 2,
    setores: ['cachoeira', 'cruzeiro', 'queluz', 'sjbarreiro'],
  },
  {
    email: 'alexandre@exemplo.com',
    nome: 'Alexandre dos Santos Freitas',
    celular: '12912345678',
    comum: 'São João',
    nivel: 2,
    setores: ['cachoeira', 'cruzeiro', 'queluz', 'sjbarreiro'],
  },
  {
    email: 'gleizer@exemplo.com',
    nome: 'Gleizer Figueiredo dos Santos',
    celular: '12923456789',
    comum: 'Vl. Canevari',
    nivel: 2,
    setores: ['cruzeiro', 'cachoeira', 'queluz', 'sjbarreiro'],
  },
  {
    email: 'daniel@exemplo.com',
    nome: 'Daniel Gomes de Araújo',
    celular: '12934567890',
    comum: 'Bairro União',
    nivel: 2,
    setores: ['queluz', 'cachoeira', 'cruzeiro', 'sjbarreiro'],
  },
  {
    email: 'ronaldo@exemplo.com',
    nome: 'Ronaldo Paiva Pereira Bueno',
    celular: '12945678901',
    comum: 'Centro - São José do Barreiro',
    nivel: 2,
    setores: ['sjbarreiro', 'cachoeira', 'cruzeiro', 'queluz'],
  },
  // Usuários genéricos (nivel_acesso 1)
  {
    email: 'embauzinho@exemplo.com',
    nome: 'Denis Salvador',
    celular: '12900000001',
    comum: 'Embauzinho',
    nivel: 1,
    setores: ['cachoeira'],
  },
  {
    email: 'cruzeiro@exemplo.com',
    nome: 'José Silvano dos Santos',
    celular: '12900000002',
    comum: 'Washington Beleza',
    nivel: 1,
    setores: ['cruzeiro'],
  },
  {
    email: 'cachoeira@exemplo.com',
    nome: 'Jamílton Luis da Silva',
    celular: '12900000003',
    comum: 'Jd. Trabalhista (Central)',
    nivel: 1,
    setores: ['cachoeira'],
  },
  {
    email: 'queluz@exemplo.com',
    nome: 'Rubens Henrique da Silva',
    celular: '12900000004',
    comum: 'Centro - Queluz',
    nivel: 1,
    setores: ['queluz'],
  },
  {
    email: 'barreiro@exemplo.com',
    nome: 'Alessandro Vaz Brito',
    celular: '12900000005',
    comum: 'Centro - São José do Barreiro', 
    nivel: 1,
    setores: ['sjbarreiro'],
  },
]

const app = initializeApp({ projectId: PROJETO, apiKey: 'demo' })
const auth = getAuth(app)
connectAuthEmulator(auth, `http://${EMU_HOST}:9099`, { disableWarnings: true })

async function criarUsuarioAuth(email) {
  const cred = await createUserWithEmailAndPassword(auth, email, SENHA)
  return cred.user.uid
}

async function main() {
  // Cria as contas no Auth e guarda os UIDs.
  const comUid = []
  for (const u of USUARIOS) {
    const uid = await criarUsuarioAuth(u.email)
    comUid.push({ ...u, uid })
  }

  // Ambiente de escrita com regras desativadas (apenas para seed).
  const testEnv = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: EMU_HOST, port: 8080 },
  })

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()

    // Setores
    for (const s of SETORES) {
      await setDoc(doc(db, 'setores', s.id), {
        id_setor: s.id,
        nome: s.nome,
        ativo: true,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }

    // Usuários
    for (const u of comUid) {
      await setDoc(doc(db, 'usuarios', u.uid), {
        id_usuario: u.uid,
        nome_completo: u.nome,
        email: u.email,
        celular: u.celular || '',
        comum_congregacao: u.comum || '',
        nivel_acesso: u.nivel,
        ativo: true,
        ids_setor: u.setores,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }
  })

  await testEnv.cleanup()

  console.log('Seed do emulador concluído.')
  console.log('Usuários (nome - email - senha - nível):')
  const larguraNome = Math.max(...USUARIOS.map((u) => u.nome.length))
  const larguraEmail = Math.max(...USUARIOS.map((u) => u.email.length))
  for (const u of USUARIOS) {
    const papel = u.nivel === 2 ? 'Secretário' : 'Encarregado'
    const nome = u.nome.padEnd(larguraNome)
    const email = u.email.padEnd(larguraEmail)
    console.log(`  - ${nome}  ${email}  ${SENHA}  ${papel}`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('Falha no seed:', e)
  process.exit(1)
})
