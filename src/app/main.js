import { createApp } from 'vue'
import App from './App.vue'
import { router } from '@/router'
import '@/componentes/tokens.css'

createApp(App).use(router).mount('#app')
