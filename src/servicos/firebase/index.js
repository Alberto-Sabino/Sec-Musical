// Inicialização central do app Firebase e exposição de Auth, Firestore e Storage.
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { firebaseConfig, usarEmuladores, MODO_APP } from './config'

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

if (usarEmuladores) {
  // Usa o mesmo host pelo qual a página foi aberta (localhost no PC,
  // IP da máquina quando acessado de outros dispositivos na rede).
  // Só se aplica em desenvolvimento; em produção usarEmuladores é false.
  const hostEmulador = window.location.hostname

  connectAuthEmulator(auth, `http://${hostEmulador}:9099`, { disableWarnings: true })
  connectFirestoreEmulator(db, hostEmulador, 8080)
  connectStorageEmulator(storage, hostEmulador, 9199)
  connectFunctionsEmulator(functions, hostEmulador, 5001)
}

// Log do modo ativo na inicialização, tornando explícito o destino da
// infraestrutura de arquivos (sempre SDK real).
{
  const destinoArquivos = usarEmuladores
    ? 'Storage emulator local'
    : 'Storage de produção'

  console.info(
    `[Portal Musical] Modo=${MODO_APP} | emuladores=${usarEmuladores ? 'ligados' : 'desligados'} | arquivos → ${destinoArquivos}`,
  )
}

export { app }
