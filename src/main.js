// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

import './assets/main.css'

// Create app instance
const app = createApp(App)

// Add plugins
app.use(createPinia())
app.use(router)

// Wait for Firebase auth to initialize before mounting
let appMounted = false

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid)
  } else {
    console.log('User is signed out')
  }

  // Only mount the app once
  if (!appMounted) {
    app.mount('#app')
    appMounted = true

    // Mark auth as initialized
    localStorage.setItem('authInitialized', 'true')
  }
})
