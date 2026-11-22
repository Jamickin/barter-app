<template>
  <div class="mx-auto max-w-5xl">
    <div v-if="isLoading" class="card p-6"><div class="skeleton h-16 w-16 !rounded-full"></div><div class="skeleton mt-4 h-6 w-1/3"></div><div class="skeleton mt-2 h-4 w-1/2"></div></div>

    <p v-else-if="error" class="card p-8 text-center text-[var(--color-text-secondary)]">{{ error }}</p>

    <template v-else>
      <!-- Header -->
      <section class="card p-5 md:p-8">
        <div class="flex items-start gap-4">
          <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-zinc-200 text-xl font-bold text-zinc-700 md:h-20 md:w-20 md:text-2xl">{{ initials }}</span>
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-xl font-extrabold md:text-2xl">{{ profile.name }}</h1>
            <p v-if="profile.town" class="mt-0.5 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
              <TabIcon name="pin" class="h-4 w-4" />{{ profile.town }}<template v-if="profile.area">, {{ profile.area }}</template>
              <FlagIcon v-if="profile.country" :code="profile.country" :size="16" class="ml-1" />
            </p>
            <p v-if="profile.bio" class="mt-2 text-[15px] text-[var(--color-text-secondary)]">{{ profile.bio }}</p>
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-3 divide-x divide-[var(--color-border)] rounded-xl bg-[var(--color-page)] py-3 text-center">
          <div><dt class="text-xs text-[var(--color-text-light)]">{{ $t('profile.trades') }}</dt><dd class="text-lg font-bold">{{ tradesDone }}</dd></div>
          <div><dt class="text-xs text-[var(--color-text-light)]">{{ $t('profile.active') }}</dt><dd class="text-lg font-bold">{{ active.length }}</dd></div>
          <div><dt class="text-xs text-[var(--color-text-light)]">{{ $t('profile.since') }}</dt><dd class="text-lg font-bold">{{ memberYear }}</dd></div>
        </dl>

        <div class="mt-4 flex gap-2">
          <template v-if="isMe">
            <button type="button" class="btn-secondary flex-1" @click="openEdit">{{ $t('profile.edit') }}</button>
            <button type="button" class="btn-ghost" @click="logout">{{ $t('profile.logout') }}</button>
          </template>
          <router-link v-else :to="{ path: '/messages', query: { to: id } }" class="btn btn-block">{{ $t('detail.message') }}</router-link>
        </div>
      </section>

      <!-- Tabs -->
      <div class="sticky top-14 z-10 -mx-4 mt-6 flex gap-6 border-b border-[var(--color-border)] bg-[var(--color-page)] px-4 md:mx-0 md:px-0" role="tablist">
        <button v-for="tb in tabs" :key="tb.k" type="button" role="tab" :aria-selected="tab === tb.k" class="tab-btn" :class="{ 'tab-btn-on': tab === tb.k }" @click="tab = tb.k">
          {{ tb.label }} <span class="text-[var(--color-text-light)]">{{ tb.n }}</span>
        </button>
      </div>

      <section class="pt-5">
        <template v-if="tab === 'listings'">
          <div v-if="listings.length" class="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
            <ListingCard v-for="l in sortedListings" :key="l.id" :listing="l" :categories="categories" list-name="profile" />
          </div>
          <div v-else class="py-10 text-center text-[var(--color-text-secondary)]">
            <p>{{ isMe ? $t('profile.noListingsMe') : $t('profile.noListings', { name: firstName }) }}</p>
            <router-link v-if="isMe" to="/create-listing" class="btn mt-4">{{ $t('home.sellCta') }}</router-link>
          </div>
        </template>

        <template v-else-if="tab === 'saved'">
          <div v-if="savedListings.length" class="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
            <ListingCard v-for="l in savedListings" :key="l.id" :listing="l" :categories="categories" list-name="saved" />
          </div>
          <div v-else class="py-10 text-center text-[var(--color-text-secondary)]">
            <p>{{ $t('profile.noSaved') }}</p>
            <router-link to="/listings" class="btn-secondary mt-4">{{ $t('msg.browse') }}</router-link>
          </div>
        </template>

        <template v-else-if="tab === 'receipts'">
          <ul v-if="payments.length" class="card divide-y divide-[var(--color-border)]">
            <li v-for="p in payments" :key="p.id" class="flex items-center gap-3 p-4 text-sm">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"><TabIcon name="bolt" class="h-5 w-5" /></span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold">{{ $t('profile.boostReceipt', { n: p.days }) }}</span>
                <span class="block truncate text-xs text-[var(--color-text-light)]">{{ listingName(p.listing_id) }} · {{ $t(`pay.${p.method}`) }} · {{ p.reference }}</span>
              </span>
              <span class="text-right">
                <span class="block font-bold">{{ money(p.amount, p.currency) }}</span>
                <span class="block text-xs text-[var(--color-text-light)]">{{ fmt(p.created_at) }}</span>
              </span>
            </li>
          </ul>
          <p v-else class="py-10 text-center text-[var(--color-text-secondary)]">{{ $t('profile.noReceipts') }}</p>
        </template>
      </section>
    </template>

    <!-- Edit sheet -->
    <div v-if="showEdit" class="sheet-backdrop" @click.self="showEdit = false">
      <form class="sheet grid gap-4" @submit.prevent="saveProfile">
        <h2 class="text-xl font-bold">{{ $t('profile.edit') }}</h2>
        <label><span class="label">{{ $t('auth.name') }}</span><input v-model="form.name" type="text" required /></label>
        <div class="grid grid-cols-2 gap-3">
          <label>
            <span class="label">{{ $t('prefs.country') }}</span>
            <select v-model="form.country" @change="form.town = ''">
              <option v-for="c in COUNTRY_CODES" :key="c" :value="c">{{ $t(`country.${c}`) }}</option>
            </select>
          </label>
          <label>
            <span class="label">{{ $t('form.town') }}</span>
            <select v-model="form.town">
              <option value="" disabled>{{ $t('form.chooseTown') }}</option>
              <option v-for="tn in country(form.country).towns" :key="tn" :value="tn">{{ tn }}</option>
            </select>
          </label>
        </div>
        <label><span class="label">{{ $t('form.area') }}</span><input v-model="form.area" type="text" :placeholder="$t('form.areaPlaceholder')" /></label>
        <label>
          <span class="label">{{ $t('auth.whatsapp') }}</span>
          <input v-model="form.whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="077 123 4567" />
          <span class="hint block">{{ $t('auth.whatsappHint') }}</span>
        </label>
        <label><span class="label">{{ $t('profile.bio') }}</span><textarea v-model="form.bio" rows="2" maxlength="200" :placeholder="$t('profile.bioPlaceholder')"></textarea></label>
        <p v-if="saveError" class="field-error !mt-0">{{ saveError }}</p>
        <button type="submit" class="btn btn-block" :disabled="saving">{{ saving ? $t('common.saving') : $t('form.saveChanges') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut, updateProfile as updateAuthProfile } from 'firebase/auth'
import { doc, getDoc, getDocs, updateDoc, collection, query, where, serverTimestamp } from 'firebase/firestore'
import ListingCard from '../components/ListingCard.vue'
import TabIcon from '../components/TabIcon.vue'
import FlagIcon from '../components/FlagIcon.vue'
import { COUNTRY_CODES, country, money, normalizePhone } from '../lib/regions.js'
import { saved } from '../lib/saved.js'
import { t } from '../i18n/index.js'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

const profile = ref({})
const listings = ref([])
const savedListings = ref([])
const payments = ref([])
const categories = ref([])
const isLoading = ref(true)
const error = ref('')
const tab = ref('listings')
const showEdit = ref(false)
const form = ref({})
const saving = ref(false)
const saveError = ref('')

const isMe = computed(() => auth.currentUser?.uid === props.id)
const firstName = computed(() => (profile.value.name || '').split(' ')[0])
const initials = computed(() => (profile.value.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase())
const active = computed(() => listings.value.filter((l) => l.status !== 'completed'))
const tradesDone = computed(() => Math.max(profile.value.trades_completed || 0, listings.value.filter((l) => l.status === 'completed').length))
const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : new Date())
const memberYear = computed(() => toDate(profile.value.created_at).getFullYear())
const sortedListings = computed(() => [...listings.value].sort((a, b) => (a.status === 'completed') - (b.status === 'completed')))
const fmt = (v) => toDate(v).toLocaleDateString([], { day: 'numeric', month: 'short' })
const listingName = (id) => listings.value.find((l) => l.id === id)?.tradeWhat || ''

const tabs = computed(() => [
  { k: 'listings', label: t('profile.tabListings'), n: listings.value.length },
  ...(isMe.value ? [{ k: 'saved', label: t('profile.tabSaved'), n: saved.size }, { k: 'receipts', label: t('profile.tabReceipts'), n: payments.value.length }] : []),
])

async function load() {
  isLoading.value = true
  try {
    const [u, ls, cats] = await Promise.all([
      getDoc(doc(db, 'users', props.id)),
      getDocs(query(collection(db, 'listings'), where('by_user_id', '==', props.id))),
      getDocs(collection(db, 'categories')),
    ])
    if (!u.exists()) return (error.value = t('profile.notFound'))
    profile.value = u.data()
    document.title = `${profile.value.name} · Barter`
    listings.value = ls.docs.map((d) => ({ id: d.id, ...d.data() }))
    categories.value = cats.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (isMe.value) {
      const pay = await getDocs(query(collection(db, 'payments'), where('user_id', '==', props.id)))
      payments.value = pay.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => toDate(b.created_at) - toDate(a.created_at))
    }
  } catch (e) {
    console.error('Error loading profile:', e)
    error.value = t('detail.loadError')
  } finally {
    isLoading.value = false
  }
}

async function loadSaved() {
  const rows = await Promise.all([...saved].map((id) => getDoc(doc(db, 'listings', id))))
  savedListings.value = rows.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() }))
}

onMounted(load)
watch(tab, (tb) => tb === 'saved' && loadSaved())

function openEdit() {
  const p = profile.value
  const dial = country(p.country).dial
  form.value = {
    name: p.name || '',
    country: p.country || 'ZW',
    town: p.town || '',
    area: p.area || '',
    whatsapp: p.whatsapp ? '0' + p.whatsapp.slice(dial.length) : '',
    bio: p.bio || '',
  }
  saveError.value = ''
  showEdit.value = true
}

async function saveProfile() {
  saving.value = true
  try {
    const f = form.value
    await updateDoc(doc(db, 'users', props.id), {
      name: f.name.trim(),
      country: f.country,
      town: f.town,
      area: f.area.trim(),
      whatsapp: normalizePhone(f.whatsapp, f.country),
      bio: f.bio.trim(),
      updated_at: serverTimestamp(),
    })
    if (auth.currentUser.displayName !== f.name.trim()) await updateAuthProfile(auth.currentUser, { displayName: f.name.trim() })
    showEdit.value = false
    await load()
    router.replace({ query: { message: t('profile.saved') } })
  } catch (e) {
    console.error('Error saving profile:', e)
    saveError.value = t('form.errSave')
  } finally {
    saving.value = false
  }
}

async function logout() {
  await signOut(auth)
  router.push({ path: '/', query: { message: t('profile.loggedOut') } })
}
</script>

<style scoped>
.tab-btn {
  min-height: 48px;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-text-light);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-btn-on {
  color: var(--color-text-main);
  border-color: var(--color-text-main);
}
</style>
