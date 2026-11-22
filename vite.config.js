import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const src = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

// VITE_BACKEND=firebase uses the real Firebase project from .env.
// Anything else (the default) swaps Firebase for the in-browser demo backend in src/demo:
// same API, data kept in the visitor's own browser, no server and no cost.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const demo = (env.VITE_BACKEND || 'demo') !== 'firebase'

  return {
    plugins: [vue(), tailwindcss(), vueDevTools()],
    define: { __DEMO__: JSON.stringify(demo) },
    resolve: {
      alias: [
        { find: '@', replacement: src('') },
        ...(demo
          ? [
              { find: /^firebase\/app$/, replacement: src('demo/app.js') },
              { find: /^firebase\/auth$/, replacement: src('demo/auth.js') },
              { find: /^firebase\/firestore$/, replacement: src('demo/firestore.js') },
              { find: /^firebase\/storage$/, replacement: src('demo/storage.js') },
            ]
          : []),
      ],
    },
  }
})
