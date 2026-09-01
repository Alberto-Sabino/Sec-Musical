import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'

// Globais de ambiente browser (aplicação Vue/Vite).
const globaisBrowser = {
  window: 'readonly',
  document: 'readonly',
  localStorage: 'readonly',
  URL: 'readonly',
  Blob: 'readonly',
  setTimeout: 'readonly',
  console: 'readonly',
}

// Globais de ambiente Node (scripts e testes).
const globaisNode = {
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  setTimeout: 'readonly',
}

// Regras de estilo compartilhadas por todo o projeto.
const regrasProjeto = {
  // Chaves obrigatórias em todos os blocos de controle (if/else/for/while).
  curly: ['error', 'all'],
  // 'update:modelValue' é o evento canônico do v-model; hifenizar quebraria o binding.
  'vue/v-on-event-hyphenation': 'off',
  // Props opcionais sem default são aceitáveis neste MVP.
  'vue/require-default-prop': 'off',
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  // Aplicação (browser).
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globaisBrowser,
    },
  },
  // Scripts e testes (Node).
  {
    files: ['scripts/**/*.{js,mjs}', 'tests/**/*.{js,mjs}', '*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globaisNode,
    },
  },
  // Desativa regras de estilo que conflitam com o Prettier.
  configPrettier,
  // Regras do projeto POR ÚLTIMO: o eslint-config-prettier desativa `curly`,
  // então precisamos reativá-la depois dele para garantir chaves em todo if.
  {
    files: ['src/**/*.{js,vue}', 'scripts/**/*.{js,mjs}', 'tests/**/*.{js,mjs}', '*.js'],
    rules: regrasProjeto,
  },
]
