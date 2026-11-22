<template>
  <div class="flex flex-col gap-10 md:gap-14">
    <!-- Hero: one job, get people searching -->
    <section class="pt-4 md:pt-10">
      <div class="max-w-2xl">
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-light)]">{{ $t(`country.${prefs.country}`) }}</p>
        <h1 class="mt-3 text-[32px] leading-[1.1] font-bold tracking-tight md:text-6xl">{{ $t('home.title') }}</h1>
        <p class="mt-4 text-base text-[var(--color-text-secondary)] md:text-lg">{{ $t('home.subtitle') }}</p>

        <form class="mt-7 flex gap-2" role="search" @submit.prevent="search()">
          <div class="relative flex-1">
            <TabIcon name="search" class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-light)]" />
            <input v-model.trim="q" type="search" class="!pl-11" :placeholder="$t('home.searchPlaceholder')" :aria-label="$t('home.searchPlaceholder')" />
          </div>
          <button type="submit" class="btn shrink-0">{{ $t('common.search') }}</button>
        </form>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-[var(--color-text-light)]">{{ $t('home.popular') }}</span>
          <button v-for="s in popular" :key="s" type="button" class="chip !min-h-8" @click="search(s)">{{ s }}</button>
        </div>

        <button v-if="isDemo && !isAuthenticated" type="button" class="mt-6 text-sm font-medium text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-text-main)]" @click="tryDemo">
          {{ $t('home.tryDemo') }} →
        </button>
      </div>
    </section>

    <!-- Trust strip -->
    <section class="grid grid-cols-3 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] py-4 text-center">
      <div v-for="p in trust" :key="p.k" class="flex flex-col items-center gap-1.5 px-2">
        <TabIcon :name="p.icon" class="h-5 w-5 text-[var(--color-text-secondary)]" />
        <span class="text-[13px] font-medium leading-tight">{{ $t(`home.trust.${p.k}`) }}</span>
        <span class="hidden text-xs text-[var(--color-text-light)] md:block">{{ $t(`home.trust.${p.k}Sub`) }}</span>
      </div>
    </section>

    <!-- Categories -->
    <section>
      <h2 class="section-title">{{ $t('home.categories') }}</h2>
      <div class="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:grid md:grid-cols-6 md:px-0">
        <router-link
          v-for="c in categories"
          :key="c.id"
          :to="{ path: '/listings', query: { category: c.id } }"
          class="flex w-[76px] shrink-0 flex-col items-center gap-2 md:w-auto"
        >
          <span class="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-background)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-text-light)]"><CategoryIcon :id="c.id" class="h-7 w-7" /></span>
          <span class="text-center text-xs font-medium leading-tight text-[var(--color-text-secondary)]">{{ categoryName(c) }}</span>
        </router-link>
      </div>
    </section>

    <!-- Boosted -->
    <section v-if="boosted.length">
      <div class="mb-3 flex items-end justify-between">
        <h2 class="section-title !mb-0 flex items-center gap-1.5"><TabIcon name="bolt" class="h-5 w-5 text-[var(--color-text-main)]" />{{ $t('home.featured') }}</h2>
        <router-link to="/listings" class="text-sm font-semibold text-[var(--color-primary)]">{{ $t('common.seeAll') }}</router-link>
      </div>
      <div class="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0">
        <div v-for="l in boosted" :key="l.id" class="w-[44%] shrink-0 snap-start md:w-auto">
          <ListingCard :listing="l" :categories="categories" list-name="home_featured" />
        </div>
      </div>
    </section>

    <!-- Latest -->
    <section>
      <div class="mb-3 flex items-end justify-between">
        <h2 class="section-title !mb-0">{{ $t('home.latest') }}</h2>
        <router-link to="/listings" class="text-sm font-semibold text-[var(--color-primary)]">{{ $t('common.seeAll') }}</router-link>
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
        <template v-if="isLoading">
          <div v-for="i in 4" :key="i"><div class="skeleton aspect-square !rounded-2xl"></div><div class="skeleton mt-3 h-4 w-4/5"></div><div class="skeleton mt-2 h-3 w-1/2"></div></div>
        </template>
        <ListingCard v-for="l in latest" v-else :key="l.id" :listing="l" :categories="categories" list-name="home_latest" />
      </div>
      <p v-if="!isLoading && !latest.length" class="card p-8 text-center text-[var(--color-text-light)]">{{ $t('home.empty') }}</p>
    </section>

    <!-- How it works -->
    <section>
      <h2 class="section-title">{{ $t('home.howTitle') }}</h2>
      <ol class="grid gap-3 md:grid-cols-3 md:gap-5">
        <li v-for="(s, i) in steps" :key="s" class="card flex gap-4 p-4 md:flex-col md:p-6">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-text-main)] text-sm font-bold text-[var(--color-background)]">{{ i + 1 }}</span>
          <div>
            <h3 class="font-semibold">{{ $t(`home.steps.${s}.title`) }}</h3>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ $t(`home.steps.${s}.text`) }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Seller CTA -->
    <section class="rounded-3xl bg-zinc-900 px-6 py-8 text-white md:flex md:items-center md:justify-between md:px-10 dark:bg-zinc-800">
      <div>
        <h2 class="text-xl font-bold md:text-2xl">{{ $t('home.sellTitle') }}</h2>
        <p class="mt-1 text-zinc-300">{{ $t('home.sellText') }}</p>
      </div>
      <router-link to="/create-listing" class="btn mt-5 w-full md:mt-0 md:w-auto">{{ $t('home.sellCta') }}</router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import ListingCard from '../components/ListingCard.vue'
import TabIcon from '../components/TabIcon.vue'
import CategoryIcon from '../components/CategoryIcon.vue'
import { prefs, t } from '../i18n/index.js'
import { categoryName, isBoosted } from '../lib/regions.js'

const router = useRouter()
const isDemo = __DEMO__
const isLoading = ref(true)
const listings = ref([])
const categories = ref([])
const q = ref('')
const isAuthenticated = ref(!!auth.currentUser)
const stop = onAuthStateChanged(auth, (u) => (isAuthenticated.value = !!u))
onUnmounted(stop)

const trust = [
  { k: 'free', icon: 'check' },
  { k: 'local', icon: 'pin' },
  { k: 'safe', icon: 'shield' },
]
const steps = ['list', 'offer', 'meet']
const popular = computed(() => t('home.popularTerms').split(',').map((s) => s.trim()))

const boosted = computed(() => listings.value.filter((l) => isBoosted(l)).slice(0, 4))
const latest = computed(() => listings.value.filter((l) => !isBoosted(l)).slice(0, 8))

function search(term = q.value) {
  router.push({ path: '/listings', query: term ? { search: term } : {} })
}

async function tryDemo() {
  const { demoSignInAs } = await import('../demo/auth.js')
  const { DEMO_USER_ID } = await import('../demo/seed.js')
  demoSignInAs(DEMO_USER_ID)
  router.push({ path: '/listings', query: { message: t('demo.welcome', { name: 'Tendai' }) } })
}

async function load() {
  isLoading.value = true
  try {
    const [cats, list] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(query(collection(db, 'listings'), where('country', '==', prefs.country), where('status', '==', 'available'), orderBy('created_at', 'desc'), limit(24))),
    ])
    categories.value = cats.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 99) - (b.order || 99))
    listings.value = list.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error loading home page:', e)
  } finally {
    isLoading.value = false
  }
}
onMounted(load)
watch(() => prefs.country, load)
</script>

<style scoped>
.section-title {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
@media (min-width: 768px) {
  .section-title {
    font-size: 1.375rem;
    margin-bottom: 1rem;
  }
}
</style>
