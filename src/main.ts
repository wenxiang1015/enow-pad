import { createPinia, setActivePinia } from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'uno.css'

const pinia = createPinia()
pinia.use(persistPlugin)
setActivePinia(pinia)

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  app.use(router)
  return {
    app,
  }
}
