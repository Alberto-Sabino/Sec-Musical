// Configuração do Firebase lida de variáveis de ambiente (Vite).
// Ver .env.example para as chaves esperadas.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Liga a conexão com os emuladores locais quando VITE_USE_EMULATORS = "true".
export const usarEmuladores = import.meta.env.VITE_USE_EMULATORS === 'true'
