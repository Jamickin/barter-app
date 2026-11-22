// Stylesheet first: it fixes the CSS layer order (theme, base, components, utilities) before any component CSS.
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { i18nPlugin } from './i18n/index.js'

const app = createApp(App)
app.use(createPinia())
app.use(i18nPlugin)
app.use(router)

// Wait for the first auth state so guarded routes know who is signed in.
let mounted = false
onAuthStateChanged(auth, () => {
  if (mounted) return
  app.mount('#app')
  mounted = true
})
