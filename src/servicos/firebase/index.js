// Inicialização central do app Firebase e exposição de Auth, Firestore e Storage.
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { firebaseConfig, usarEmuladores, MODO_APP } from './config'

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

if (usarEmuladores) {
  // Usa o mesmo host pelo qual a página foi aberta (localhost no PC,
  // IP da máquina quando acessado de outros dispositivos na rede).
  // Só se aplica em desenvolvimento; em produção usarEmuladores é false.
  const hostEmulador = window.location.hostname

  connectAuthEmulator(auth, `http://${hostEmulador}:9099`, { disableWarnings: true })
  connectFirestoreEmulator(db, hostEmulador, 8080)
  connectStorageEmulator(storage, hostEmulador, 9199)
}

// Aviso claro do modo ativo na inicialização, tornando explícito o destino
// da infraestrutura de arquivos (sempre SDK real).
{
  const destinoArquivos = usarEmuladores
    ? 'Storage emulator local (sem Billing)'
    : 'Storage de PRODUÇÃO (requer Cloud Billing)'

  console.info(
    `[Portal Musical] Modo=${MODO_APP} | emuladores=${usarEmuladores ? 'ligados' : 'desligados'} | arquivos → ${destinoArquivos}`,
  )

  // Alerta de risco: sem emuladores a infra aponta para o Storage de produção,
  // que depende de Cloud Billing e não é considerado concluído.
  if (!usarEmuladores) {
    console.warn(
      '[Portal Musical] ATENÇÃO: modo "producao" aponta para o Storage de PRODUÇÃO, que depende de Cloud Billing e não é considerado concluído.',
    )
  }
}

export { app }
