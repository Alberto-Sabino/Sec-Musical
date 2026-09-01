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
  { id: 'queluz', nome: 'Queluz - SP' },
]

// Usuários: senha padrão para todos no ambiente local.
const SENHA = 'senha123'

const USUARIOS = [
  // Admins (nivel_acesso 2)
  {
    email: 'admin.cachoeira@exemplo.com',
    nome: 'Secretário Cachoeira',
    nivel: 2,
    setores: ['cachoeira'],
  },
  {
    email: 'admin.geral@exemplo.com',
    nome: 'Secretário Geral',
    nivel: 2,
    setores: ['cachoeira', 'queluz'],
  },
  // Comuns (nivel_acesso 1)
  { email: 'alberto@exemplo.com', nome: 'Alberto', nivel: 1, setores: ['cachoeira'] },
  { email: 'jamilton@exemplo.com', nome: 'Jamilton', nivel: 1, setores: ['cachoeira'] },
  { email: 'rubens@exemplo.com', nome: 'Rubens', nivel: 1, setores: ['queluz'] },
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
        celular: '',
        nivel_acesso: u.nivel,
        ativo: true,
        ids_setor: u.setores,
        data_criacao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }

    // Arquivos de exemplo na Biblioteca, por setor.
    // Cachoeira: 4 (um no nível 2 / restrito). Queluz: 3.
    const ARQUIVOS = [
      { setor: 'cachoeira', tipo: 'circular', titulo: 'Circular inicial', nivel: 1 },
      { setor: 'cachoeira', tipo: 'topico', titulo: 'Tópicos do mês', nivel: 1 },
      { setor: 'cachoeira', tipo: 'plano_aula', titulo: 'Plano de aula - iniciantes', nivel: 1 },
      { setor: 'cachoeira', tipo: 'modelo', titulo: 'Modelo interno (restrito)', nivel: 2 },
      { setor: 'queluz', tipo: 'circular', titulo: 'Circular inicial', nivel: 1 },
      { setor: 'queluz', tipo: 'topico', titulo: 'Tópicos do mês', nivel: 1 },
      { setor: 'queluz', tipo: 'outros', titulo: 'Comunicado geral', nivel: 1 },
    ]

    const contadorPorSetor = {}
    for (const a of ARQUIVOS) {
      contadorPorSetor[a.setor] = (contadorPorSetor[a.setor] || 0) + 1
      const idArquivo = `arq_${a.setor}_${contadorPorSetor[a.setor]}`
      const admin = comUid.find((u) => u.nivel === 2 && u.setores.includes(a.setor))
      const nivelPasta = a.nivel === 2 ? 'nivel_2' : 'nivel_1'
      const setorInfo = SETORES.find((s) => s.id === a.setor)
      await setDoc(doc(db, 'arquivos', idArquivo), {
        id_setor: a.setor,
        tipo: a.tipo,
        titulo: `${a.titulo} - ${setorInfo.nome}`,
        nivel_acesso: a.nivel,
        id_nuvem: `biblioteca/${a.setor}/${nivelPasta}/${idArquivo}.pdf`,
        id_usuario: admin ? admin.uid : comUid[0].uid,
        data_inclusao: serverTimestamp(),
        data_atualizacao: serverTimestamp(),
      })
    }
  })

  await testEnv.cleanup()

  console.log('Seed do emulador concluído.')
  console.log('Setores: Cachoeira Paulista - SP (cachoeira), Queluz - SP (queluz)')
  console.log(`Senha padrão de todos: ${SENHA}`)
  console.log('Admins:')
  console.log('  - admin.cachoeira@exemplo.com  (Cachoeira)')
  console.log('  - admin.geral@exemplo.com      (Cachoeira + Queluz)')
  console.log('Comuns:')
  console.log('  - alberto@exemplo.com          (Cachoeira)')
  console.log('  - jamilton@exemplo.com         (Cachoeira)')
  console.log('  - rubens@exemplo.com           (Queluz)')
  console.log('Biblioteca: Cachoeira 4 arquivos (1 restrito nível 2), Queluz 3 arquivos.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Falha no seed:', e)
  process.exit(1)
})
