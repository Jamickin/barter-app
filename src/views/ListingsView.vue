<template>
  <div>
    <!-- Sticky search + filters -->
    <div class="sticky top-14 z-20 -mx-4 -mt-4 border-b border-[var(--color-border)] bg-[var(--color-page)]/95 px-4 pb-3 pt-3 backdrop-blur md:static md:mx-0 md:mt-0 md:border-0 md:bg-transparent md:px-0 md:pt-0">
      <h1 class="mb-3 hidden text-3xl font-extrabold tracking-tight md:block">{{ $t('browse.title') }}</h1>
      <form class="flex gap-2" role="search" @submit.prevent="syncUrl">
        <div class="relative flex-1">
          <TabIcon name="search" class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-light)]" />
          <input v-model.trim="searchQuery" type="search" class="!pl-11" :placeholder="$t('browse.searchPlaceholder')" :aria-label="$t('browse.searchPlaceholder')" @search="syncUrl" />
        </div>
        <select v-model="selectedTown" class="!w-auto max-w-[9.5rem] md:max-w-none" :aria-label="$t('browse.town')">
          <option value="">{{ $t('browse.allTowns') }}</option>
          <option v-for="tn in towns" :key="tn" :value="tn">{{ tn }}</option>
        </select>
      </form>
      <div class="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:flex-wrap md:px-0">
        <button type="button" class="chip" :class="{ 'chip-on': !selectedCategory }" @click="selectedCategory = ''">{{ $t('browse.all') }}</button>
        <button v-for="c in categories" :key="c.id" type="button" class="chip" :class="{ 'chip-on': selectedCategory === c.id }" @click="selectedCategory = c.id">
          <CategoryIcon :id="c.id" class="h-4 w-4" />{{ categoryName(c) }}
        </button>
      </div>
    </div>

    <div class="my-4 flex items-center justify-between gap-3 text-sm">
      <span class="text-[var(--color-text-secondary)]">
        <template v-if="!isLoading">{{ $t('browse.count', { n: shown.length }) }}</template>
      </span>
      <div class="flex items-center gap-3">
        <button v-if="hasFilters" type="button" class="font-semibold text-[var(--color-primary)]" @click="resetFilters">{{ $t('browse.clear') }}</button>
        <select v-model="sort" class="!min-h-9 !w-auto !py-1 !pl-3 !pr-8 !text-sm" :aria-label="$t('browse.sort')">
          <option value="recommended">{{ $t('browse.sortRecommended') }}</option>
          <option value="newest">{{ $t('browse.sortNewest') }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">
      <div v-for="i in 8" :key="i"><div class="skeleton aspect-square !rounded-2xl"></div><div class="skeleton mt-3 h-4 w-4/5"></div><div class="skeleton mt-2 h-3 w-1/2"></div></div>
    </div>

    <div v-else-if="shown.length" class="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">
      <ListingCard v-for="l in shown" :key="l.id" :listing="l" :categories="categories" list-name="browse" />
    </div>

    <div v-else class="card mx-auto max-w-md px-6 py-10 text-center">
      
      <h2 class="mt-3 text-lg font-bold">{{ $t('browse.emptyTitle') }}</h2>
      <p class="mt-1 text-[var(--color-text-secondary)]">{{ $t('browse.emptyText') }}</p>
      <div class="mt-5 flex flex-col gap-2">
        <button v-if="hasFilters" type="button" class="btn-secondary" @click="resetFilters">{{ $t('browse.clear') }}</button>
        <router-link to="/create-listing" class="btn">{{ $t('browse.emptyCta') }}</router-link>
      </div>
    </div>

    <label v-if="!isLoading && hasTraded" class="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <input v-model="showTraded" type="checkbox" /> {{ $t('browse.showTraded') }}
    </label>
  </div>
</template>

<script setup>
import CategoryIcon from '../components/CategoryIcon.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import ListingCard from '../components/ListingCard.vue'
import TabIcon from '../components/TabIcon.vue'
import { prefs } from '../i18n/index.js'
import { country, categoryName, isBoosted } from '../lib/regions.js'
import { track } from '../lib/track.js'

const route = useRoute()
const router = useRouter()

const listings = ref([])
const categories = ref([])
const isLoading = ref(true)
const searchQuery = ref(route.query.search || '')
const selectedCategory = ref(route.query.category || '')
const selectedTown = ref(route.query.town || '')
const sort = ref('recommended')
const showTraded = ref(false)

const towns = computed(() => country(prefs.country).towns)
const hasFilters = computed(() => !!(searchQuery.value || selectedCategory.value || selectedTown.value))
const hasTraded = computed(() => listings.value.some((l) => l.status === 'completed'))

// Category and town are exact matches, so the database filters them. Free-text search runs here on the
// loaded results: it matches every word anywhere (title, wanted item, description, area), which Firestore can't.
const shown = computed(() => {
  const words = searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean)
  const rows = listings.value.filter((l) => {
    if (!showTraded.value && l.status === 'completed') return false
    if (!words.length) return true
    const hay = [l.tradeWhat, l.forWhat, l.description, l.area, l.location, l.owner?.name].join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
  if (sort.value === 'recommended') {
    // Boosted first, then available before pending, then newest (the query order)
    const rank = (l) => (isBoosted(l) && l.status === 'available' ? 0 : l.status === 'available' ? 1 : 2)
    return [...rows].sort((a, b) => rank(a) - rank(b))
  }
  return rows
})

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'categories'))
    categories.value = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 99) - (b.order || 99))
  } catch (e) {
    console.error('Error fetching categories:', e)
  }
  fetchListings()
})

async function fetchListings() {
  isLoading.value = true
  try {
    const c = [where('country', '==', prefs.country)]
    if (selectedCategory.value) c.push(where('category_id', '==', selectedCategory.value))
    if (selectedTown.value) c.push(where('location', '==', selectedTown.value))
    c.push(orderBy('created_at', 'desc'), limit(120))
    const snap = await getDocs(query(collection(db, 'listings'), ...c))
    listings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error fetching listings:', e)
  } finally {
    isLoading.value = false
  }
}

function syncUrl() {
  router.replace({
    query: {
      ...(searchQuery.value ? { search: searchQuery.value } : {}),
      ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
      ...(selectedTown.value ? { town: selectedTown.value } : {}),
    },
  })
  if (searchQuery.value) track('search', { search_term: searchQuery.value, results: shown.value.length })
}

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedTown.value = ''
}

watch([selectedCategory, selectedTown], () => {
  syncUrl()
  fetchListings()
})
watch(searchQuery, (v) => !v && syncUrl())
watch(
  () => prefs.country,
  () => {
    selectedTown.value = ''
    fetchListings()
  },
)
</script>
