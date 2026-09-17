// Configuração do Firebase e o "modo" do app, lidos das variáveis de ambiente.
// As chaves vêm do .env (ver .env.example). O modo (emulador vs produção) é
// derivado de uma única variável, VITE_APP_MODE, para o resto do código não
// precisar checar ambiente em vários lugares.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Modo único da aplicação (fonte única de verdade do ambiente).
// Deriva o comportamento das camadas a partir de UMA variável.
//
// Valores válidos de VITE_APP_MODE:
//   "emulador" — emuladores locais ligados (Auth/Firestore/Storage); infra de
//                arquivos real (SDK) apontando para o Storage emulator (não
//                exige Billing). Modo de desenvolvimento.
//   "producao" — sem emuladores; Storage real de produção (pendente de Cloud
//                Billing/Blaze).
//
// Observação: o desenvolvimento e o login dependem dos emuladores, portanto
// os emuladores estão sempre ligados em desenvolvimento (modo "emulador").
export const MODOS_APP = {
  EMULADOR: 'emulador',
  PRODUCAO: 'producao',
}

const modoBruto = import.meta.env.VITE_APP_MODE
// Default de desenvolvimento: "emulador" (emuladores sempre ligados localmente).
export const MODO_APP = modoBruto === MODOS_APP.PRODUCAO ? MODOS_APP.PRODUCAO : MODOS_APP.EMULADOR

// Comportamentos derivados (fonte única; camadas não leem env diretamente).
export const usarEmuladores = MODO_APP === MODOS_APP.EMULADOR
