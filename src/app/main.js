import { createApp } from 'vue'
import App from './App.vue'
import { router } from '@/router'
import { dispararEvento } from '@/servicos/firebase/analytics'
import { ERROS } from '@/enums/eventosAnalytics'
import '@/componentes/tokens.css'

const app = createApp(App)

app.config.errorHandler = (erro, instancia, info) => {
  dispararEvento(ERROS.ERRO_GENERICO, { origem: info || 'desconhecida' })
  console.error(erro)
}

app.use(router).mount('#app')
