// Seleção central da infraestrutura de arquivos.
// O desenvolvimento e o login dependem dos emuladores (sempre ligados em dev),
// então a infra de arquivos é sempre a implementação real (SDK). O destino
// (Storage emulator vs produção) é decidido por VITE_APP_MODE — ver
// src/servicos/firebase/config.js e src/servicos/firebase/index.js.
import * as firebase from './firebase'

// Reexporta o contrato estável.
export const baixarArquivo = firebase.baixarArquivo
export const enviarArquivo = firebase.enviarArquivo
export const removerArquivo = firebase.removerArquivo
