// Tiny translation layer: t('key.path', { name }) looks up the current language, falls back to English.
// prefs is reactive, so any template calling t() re-renders when the language or country changes.
import { reactive, watch } from 'vue'
import en from './en.js'
import sn from './sn.js'
import nd from './nd.js'
import pt from './pt.js'

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sn', name: 'chiShona' },
  { code: 'nd', name: 'isiNdebele' },
  { code: 'pt', name: 'Português' },
]
const DICTS = { en, sn, nd, pt }
const KEY = 'barter-prefs'

function initial() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved?.locale && saved?.country) return saved
  } catch {
    /* storage blocked: use defaults */
  }
  const nav = (navigator.language || 'en').slice(0, 2)
  return { locale: DICTS[nav] ? nav : 'en', country: 'ZW' }
}

export const prefs = reactive(initial())

watch(
  prefs,
  (p) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* ignore */
    }
    document.documentElement.lang = p.locale
  },
  { immediate: true },
)

const lookup = (dict, key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict)

export function t(key, params = {}, fallback) {
  let s = lookup(DICTS[prefs.locale], key) ?? lookup(en, key) ?? fallback ?? key
  if (typeof s === 'object' && 'one' in s) s = params.n === 1 ? s.one : s.other
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`))
}

export const i18nPlugin = {
  install(app) {
    app.config.globalProperties.$t = t
    app.config.globalProperties.$prefs = prefs
  },
}
