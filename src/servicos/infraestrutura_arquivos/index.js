// Seleção central da infraestrutura de arquivos por configuração.
// A troca mock <-> firebase ocorre aqui, sem bifurcação na UI ou nos casos de uso.
import * as mock from './mock'
import * as firebase from './firebase'

const implementacao = import.meta.env.VITE_FILE_INFRA === 'firebase' ? firebase : mock

// Reexporta o contrato estável.
export const baixarArquivo = implementacao.baixarArquivo
export const enviarArquivo = implementacao.enviarArquivo
export const removerArquivo = implementacao.removerArquivo
