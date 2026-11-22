<template>
  <div class="min-h-dvh flex flex-col">
    <DemoBanner v-if="DemoBanner" />

    <header class="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur">
      <div class="container flex h-14 items-center gap-2">
        <router-link to="/" class="mr-auto text-xl font-extrabold tracking-wide text-[var(--color-text-main)]" aria-label="Barter">
          BARTER
        </router-link>

        <nav class="hidden md:flex items-center gap-1 mr-2">
          <router-link to="/listings" class="btn-ghost btn-sm" active-class="!text-[var(--color-text-main)]">{{ $t('nav.browse') }}</router-link>
          <router-link v-if="user" to="/messages" class="btn-ghost btn-sm" active-class="!text-[var(--color-text-main)]">
            {{ $t('nav.messages') }}
            <span v-if="unread" class="rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">{{ unread > 9 ? '9+' : unread }}</span>
          </router-link>
        </nav>

        <button type="button" class="btn-ghost btn-sm !px-2.5 !gap-1.5" :aria-label="$t('prefs.title')" @click="showPrefs = true">
          <FlagIcon :code="$prefs.country" />
          <span class="text-xs font-semibold uppercase">{{ $prefs.locale }}</span>
        </button>

        <template v-if="user">
          <router-link to="/create-listing" class="btn btn-sm hidden md:inline-flex">{{ $t('nav.list') }}</router-link>
          <router-link
            :to="`/profile/${user.uid}`"
            class="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700"
            :aria-label="$t('nav.me')"
          >
            {{ initials }}
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-secondary btn-sm">{{ $t('nav.signIn') }}</router-link>
          <router-link to="/register" class="btn btn-sm hidden sm:inline-flex">{{ $t('nav.join') }}</router-link>
        </template>
      </div>
    </header>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="flash" class="fixed inset-x-0 top-16 z-40 flex justify-center px-4 pointer-events-none" role="status">
        <div class="pointer-events-auto flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900">
          <span class="text-emerald-400 dark:text-emerald-600">✓</span>{{ flash }}
        </div>
      </div>
    </transition>

    <main class="app-main flex-1 pt-4 md:pt-8">
      <div class="container">
        <!-- No route transition: an animating wrapper would trap fixed sheets/bars under the header, and costs time on low-end phones -->
        <router-view v-slot="{ Component, route: r }">
          <component :is="Component" :key="r.path" />
        </router-view>
      </div>
    </main>

    <footer class="app-footer border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div class="container py-6 text-sm text-[var(--color-text-light)] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span>© {{ year }} Barter · {{ $t('footer.tagline') }}</span>
        <nav class="flex flex-wrap gap-x-4 gap-y-2">
          <router-link to="/about" class="hover:text-[var(--color-text-main)]">{{ $t('footer.how') }}</router-link>
          <router-link to="/guidelines" class="hover:text-[var(--color-text-main)]">{{ $t('footer.guidelines') }}</router-link>
          <router-link to="/terms" class="hover:text-[var(--color-text-main)]">{{ $t('footer.terms') }}</router-link>
          <router-link to="/privacy" class="hover:text-[var(--color-text-main)]">{{ $t('footer.privacy') }}</router-link>
          <router-link to="/boost-terms" class="hover:text-[var(--color-text-main)]">{{ $t('footer.boosts') }}</router-link>
        </nav>
      </div>
    </footer>

    <!-- Phone tab bar -->
    <nav class="tabbar md:hidden" :aria-label="$t('nav.main')">
      <router-link to="/" class="tab" exact-active-class="tab-on"><TabIcon name="home" />{{ $t('nav.home') }}</router-link>
      <router-link to="/listings" class="tab" active-class="tab-on"><TabIcon name="search" />{{ $t('nav.browse') }}</router-link>
      <router-link to="/create-listing" class="tab" active-class="tab-on">
        <span class="tab-add"><TabIcon name="plus" /></span>{{ $t('nav.listShort') }}
      </router-link>
      <router-link to="/messages" class="tab" active-class="tab-on">
        <span class="relative"><TabIcon name="chat" /><i v-if="unread" class="tab-badge">{{ unread > 9 ? '9+' : unread }}</i></span>{{ $t('nav.messages') }}
      </router-link>
      <router-link :to="user ? `/profile/${user.uid}` : '/login'" class="tab" active-class="tab-on"><TabIcon name="user" />{{ $t('nav.me') }}</router-link>
    </nav>

    <PrefsSheet v-if="showPrefs" @close="showPrefs = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { setBottomChrome, TABBAR_PX } from './lib/chrome.js'
import TabIcon from './components/TabIcon.vue'
import FlagIcon from './components/FlagIcon.vue'
import PrefsSheet from './components/PrefsSheet.vue'

// Only the demo build carries the banner (and the demo backend it talks to).
const DemoBanner = __DEMO__ ? defineAsyncComponent(() => import('./components/DemoBanner.vue')) : null

const route = useRoute()
const router = useRouter()
const user = ref(auth.currentUser)
const unread = ref(0)
const flash = ref('')
const showPrefs = ref(false)
const year = new Date().getFullYear()

const initials = computed(() =>
  (user.value?.displayName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
)

let stopUnread = null
onAuthStateChanged(auth, (u) => {
  user.value = u
  stopUnread?.()
  stopUnread = null
  unread.value = 0
  if (!u) return
  const q = query(collection(db, 'messages'), where('to_user_id', '==', u.uid), where('read', '==', false))
  stopUnread = onSnapshot(q, (snap) => (unread.value = snap.size))
})

// Flash messages arrive as ?message=... on any route and show as a toast.
let flashTimer
watch(
  () => route.query.message,
  (msg) => {
    if (!msg) return
    flash.value = msg
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => (flash.value = ''), 3500)
    // eslint-disable-next-line no-unused-vars
    const { message, ...rest } = route.query
    router.replace({ query: rest })
  },
  { immediate: true },
)

// Netlify adds a fixed badge frame on deployed sites; lift it above our bottom bars instead of letting it cover them.
let badgeTimer
function watchBadge() {
  let tries = 0
  badgeTimer = setInterval(() => {
    if (document.getElementById('nl-badge-frame')) {
      document.documentElement.classList.add('has-nl-badge')
      clearInterval(badgeTimer)
    } else if (++tries > 20) clearInterval(badgeTimer)
  }, 500)
}

const syncChrome = () => {
  if (!document.documentElement.classList.contains('has-sticky-bar')) setBottomChrome(window.innerWidth < 768 ? TABBAR_PX : 0)
}
onMounted(() => {
  watchBadge()
  syncChrome()
  window.addEventListener('resize', syncChrome)
})
onUnmounted(() => {
  stopUnread?.()
  clearInterval(badgeTimer)
  window.removeEventListener('resize', syncChrome)
})
</script>

<style>
@layer components {
  .app-main {
    padding-bottom: 2rem;
  }
  /* Everything at the bottom of the page clears the fixed bars (tab bar / sticky action bar + Netlify badge) */
  .app-footer {
    padding-bottom: calc(var(--bottom-chrome, 0px) + var(--badge-h));
  }

  .tabbar {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 30;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: color-mix(in srgb, var(--color-background) 94%, transparent);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--color-border);
  }
  html.has-sticky-bar .tabbar {
    display: none;
  }
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-light);
  }
  .tab svg {
    width: 24px;
    height: 24px;
  }
  .tab-on {
    color: var(--color-primary);
  }
  .tab-add {
    display: grid;
    place-items: center;
    width: 40px;
    height: 28px;
    border-radius: 10px;
    background: var(--color-primary);
    color: var(--color-on-primary);
  }
  .tab-add svg {
    width: 20px;
    height: 20px;
  }
  .tab-badge {
    position: absolute;
    top: -4px;
    right: -9px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 9999px;
    background: #dc2626;
    color: #fff;
    font-size: 10px;
    font-style: normal;
    font-weight: 700;
    display: grid;
    place-items: center;
    border: 2px solid var(--color-background);
  }
}
</style>
