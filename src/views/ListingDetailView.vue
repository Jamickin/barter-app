<template>
  <div class="mx-auto max-w-6xl">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="grid gap-6 md:grid-cols-2 md:gap-10">
      <div class="skeleton -mx-4 -mt-4 aspect-square !rounded-none md:mx-0 md:mt-0 md:!rounded-3xl"></div>
      <div class="flex flex-col gap-3"><div class="skeleton h-5 w-1/3"></div><div class="skeleton h-8 w-4/5"></div><div class="skeleton h-24 w-full"></div></div>
    </div>

    <div v-else-if="error" class="card mx-auto max-w-md p-8 text-center">
      
      <h1 class="mt-3 text-lg font-bold">{{ $t('detail.goneTitle') }}</h1>
      <p class="mt-1 text-[var(--color-text-secondary)]">{{ error }}</p>
      <router-link to="/listings" class="btn mt-5">{{ $t('detail.browseOthers') }}</router-link>
    </div>

    <template v-else-if="listing">
      <div class="grid gap-6 md:grid-cols-2 md:gap-10">
        <!-- Image -->
        <div class="relative -mx-4 -mt-4 md:mx-0 md:mt-0">
          <div class="aspect-square overflow-hidden bg-[var(--color-border)] md:sticky md:top-20 md:rounded-3xl">
            <img :src="listing.image_url || placeholderArt(listing.category_id)" :alt="listing.tradeWhat" class="h-full w-full object-cover" />
          </div>
          <div class="absolute inset-x-0 top-0 flex items-center justify-between p-3 md:hidden">
            <button type="button" class="icon-btn" :aria-label="$t('common.back')" @click="goBack"><TabIcon name="back" /></button>
            <div class="flex gap-2">
              <button type="button" class="icon-btn" :aria-label="$t('detail.share')" @click="share"><TabIcon name="share" /></button>
              <button type="button" class="icon-btn" :class="{ '!text-red-500': isSaved }" :aria-label="isSaved ? $t('card.unsave') : $t('card.save')" @click="toggleSaved(listing.id)">
                <TabIcon name="heart" :fill="isSaved ? 'currentColor' : 'none'" />
              </button>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="flex flex-col gap-5">
          <div>
            <div class="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span v-if="boosted" class="pill bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><TabIcon name="bolt" class="h-3 w-3" />{{ $t('card.boosted') }}</span>
              <span class="pill" :class="statusClass">{{ $t(`status.${listing.status || 'available'}`) }}</span>
              <router-link :to="{ path: '/listings', query: { category: listing.category_id } }" class="pill bg-[var(--color-background)] ring-1 ring-[var(--color-border)]">
                <CategoryIcon :id="listing.category_id" class="h-3.5 w-3.5" />{{ categoryName(category) }}
              </router-link>
            </div>
            <h1 class="mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{{ listing.tradeWhat }}</h1>
            <p class="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
              <TabIcon name="pin" class="h-4 w-4" />{{ listing.location }}<template v-if="listing.area">, {{ listing.area }}</template>
              <span aria-hidden="true">·</span>{{ listedAgo }}
            </p>
          </div>

          <!-- What they want: the "price" of a swap -->
          <div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-light)]"><TabIcon name="swap" class="h-4 w-4" />{{ $t('detail.wants') }}</div>
            <p class="mt-1.5 text-lg font-semibold leading-snug">{{ listing.forWhat }}</p>
            <p v-if="topupText(listing.topup)" class="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">{{ topupText(listing.topup) }}</p>
          </div>

          <!-- Desktop actions (phones get the sticky bar) -->
          <div class="hidden md:flex md:flex-col md:gap-2">
            <template v-if="isOwner">
              <button type="button" class="btn btn-block" @click="openBoost"><TabIcon name="bolt" class="h-4 w-4" />{{ boosted ? $t('detail.extendBoost') : $t('detail.boost') }}</button>
              <router-link :to="`/edit-listing/${listing.id}`" class="btn-secondary btn-block">{{ $t('detail.edit') }}</router-link>
            </template>
            <template v-else-if="listing.status !== 'completed'">
              <button type="button" class="btn btn-block" @click="startOffer">{{ $t('detail.makeOffer') }}</button>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-secondary" @click="contactSeller">{{ $t('detail.message') }}</button>
                <button type="button" class="btn-whatsapp" @click="openWhatsApp">WhatsApp</button>
              </div>
              <div class="flex justify-center gap-6 pt-1 text-sm text-[var(--color-text-secondary)]">
                <button type="button" class="inline-flex items-center gap-1.5" @click="toggleSaved(listing.id)"><TabIcon name="heart" class="h-4 w-4" :fill="isSaved ? 'currentColor' : 'none'" />{{ isSaved ? $t('detail.saved') : $t('card.save') }}</button>
                <button type="button" class="inline-flex items-center gap-1.5" @click="share"><TabIcon name="share" class="h-4 w-4" />{{ $t('detail.share') }}</button>
              </div>
            </template>
          </div>
          <p v-if="whatsAppNote" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{{ whatsAppNote }}</p>

          <!-- Owner tools -->
          <div v-if="isOwner" class="card p-4">
            <div class="mb-2 text-sm font-semibold">{{ $t('detail.status') }}</div>
            <div class="grid grid-cols-3 gap-1 rounded-xl bg-[var(--color-page)] p-1 text-sm">
              <button
                v-for="s in ['available', 'pending', 'completed']"
                :key="s"
                type="button"
                class="min-h-10 rounded-lg font-medium transition"
                :class="listing.status === s ? 'bg-[var(--color-background)] shadow-sm' : 'text-[var(--color-text-light)]'"
                @click="updateStatus(s)"
              >
                {{ $t(`status.${s}`) }}
              </button>
            </div>
            <div v-if="!boosted && listing.status === 'available'" class="mt-4 flex items-center gap-3 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
              <TabIcon name="bolt" class="h-6 w-6 shrink-0 text-[var(--color-text-main)]" />
              <p class="flex-1 text-sm">{{ $t('detail.boostNudge', { m: cheapestBoost }) }}</p>
              <button type="button" class="btn btn-sm" @click="openBoost">{{ $t('detail.boostShort') }}</button>
            </div>
            <p v-else-if="boosted" class="mt-3 text-sm text-[var(--color-text-secondary)]">{{ $t('detail.boostedUntil', { date: boostedUntilText }) }}</p>
            <button type="button" class="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-red-600" @click="showDelete = true">{{ $t('detail.delete') }}</button>
          </div>

          <!-- Description -->
          <section v-if="listing.description">
            <h2 class="mb-1.5 text-sm font-semibold text-[var(--color-text-light)]">{{ $t('detail.about') }}</h2>
            <p class="whitespace-pre-line leading-relaxed">{{ listing.description }}</p>
          </section>

          <!-- Trader -->
          <router-link :to="`/profile/${listing.by_user_id}`" class="card flex items-center gap-3 p-4 transition hover:border-[var(--color-text-light)]">
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-200 font-bold text-zinc-700">{{ initials(owner?.name) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">{{ owner?.name || $t('common.trader') }}</span>
              <span class="block text-xs text-[var(--color-text-light)]">
                {{ $t('detail.trades', { n: owner?.trades_completed || 0 }) }} · {{ $t('detail.memberSince', { year: memberYear }) }}
              </span>
              <span v-if="owner?.demo_bot || owner?.trades_completed > 5" class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <TabIcon name="check" class="h-3.5 w-3.5" />{{ $t('detail.repliesFast') }}
              </span>
            </span>
            <span class="text-[var(--color-text-light)]">›</span>
          </router-link>

          <!-- Safety -->
          <details class="card p-4 text-sm">
            <summary class="flex cursor-pointer list-none items-center gap-2 font-semibold"><TabIcon name="shield" class="h-5 w-5 text-emerald-600" />{{ $t('detail.safetyTitle') }}</summary>
            <ul class="mt-3 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li v-for="i in 4" :key="i">{{ $t(`detail.safety${i}`) }}</li>
            </ul>
            <router-link to="/guidelines" class="mt-1 inline-flex min-h-10 items-center font-medium text-[var(--color-primary)]">{{ $t('detail.readGuidelines') }}</router-link>
          </details>

          <button v-if="!isOwner" type="button" class="inline-flex min-h-10 items-center gap-1.5 self-start text-sm text-[var(--color-text-light)] hover:text-red-600" @click="showReport = true">
            <TabIcon name="flag" class="h-4 w-4" />{{ $t('detail.report') }}
          </button>
        </div>
      </div>

      <!-- Cross-sell -->
      <section v-if="moreFromTrader.length" class="mt-12">
        <h2 class="mb-3 text-lg font-bold">{{ $t('detail.moreFrom', { name: firstName(owner?.name) }) }}</h2>
        <div class="-mx-4 flex gap-3 overflow-x-auto px-4 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0">
          <div v-for="l in moreFromTrader" :key="l.id" class="w-[44%] shrink-0 md:w-auto"><ListingCard :listing="l" :categories="categories" list-name="more_from_trader" /></div>
        </div>
      </section>
      <section v-if="similar.length" class="mt-10">
        <h2 class="mb-3 text-lg font-bold">{{ $t('detail.similar') }}</h2>
        <div class="-mx-4 flex gap-3 overflow-x-auto px-4 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0">
          <div v-for="l in similar" :key="l.id" class="w-[44%] shrink-0 md:w-auto"><ListingCard :listing="l" :categories="categories" list-name="similar" /></div>
        </div>
      </section>

      <!-- Sticky action bar on phones (like a sticky add-to-cart) -->
      <div class="sticky-bar md:hidden">
        <template v-if="isOwner">
          <router-link :to="`/edit-listing/${listing.id}`" class="btn-secondary">{{ $t('detail.edit') }}</router-link>
          <button type="button" class="btn flex-1" @click="openBoost"><TabIcon name="bolt" class="h-4 w-4" />{{ boosted ? $t('detail.extendBoost') : $t('detail.boost') }}</button>
        </template>
        <template v-else-if="listing.status !== 'completed'">
          <button type="button" class="btn-whatsapp !px-3.5" aria-label="WhatsApp" @click="openWhatsApp">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" /></svg>
          </button>
          <button type="button" class="btn-secondary" @click="contactSeller">{{ $t('detail.message') }}</button>
          <button type="button" class="btn flex-1" @click="startOffer">{{ $t('detail.makeOffer') }}</button>
        </template>
        <p v-else class="flex-1 text-center text-sm font-medium text-[var(--color-text-secondary)]">{{ $t('detail.tradeDone') }}</p>
      </div>
    </template>

    <!-- Offer sheet -->
    <div v-if="showOffer" class="sheet-backdrop" @click.self="showOffer = false">
      <form class="sheet grid gap-5" @submit.prevent="sendOffer">
        <div>
          <h2 class="text-xl font-bold">{{ $t('offer.title') }}</h2>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ $t('offer.for', { item: listing.tradeWhat }) }}</p>
        </div>
        <fieldset class="grid gap-2">
          <legend class="label">{{ $t('offer.give') }}</legend>
          <label v-for="l in myListings" :key="l.id" class="option" :class="{ 'option-on': offer.give === l.id }">
            <input v-model="offer.give" type="radio" :value="l.id" />
            <img :src="l.image_url || placeholderArt(l.category_id)" alt="" class="h-11 w-11 rounded-lg object-cover" />
            <span class="text-sm font-medium">{{ l.tradeWhat }}</span>
          </label>
          <label class="option" :class="{ 'option-on': offer.give === 'other' }">
            <input v-model="offer.give" type="radio" value="other" />
            <span class="text-sm font-medium">{{ $t('offer.other') }}</span>
          </label>
          <input v-if="offer.give === 'other'" v-model="offer.giveText" type="text" required :placeholder="$t('offer.otherPlaceholder')" />
        </fieldset>
        <div>
          <span class="label">{{ $t('offer.cash') }}</span>
          <TopupInput v-model="offer.topup" :country="listing.country" />
        </div>
        <label class="block">
          <span class="label">{{ $t('offer.note') }}</span>
          <textarea v-model="offer.note" rows="2" :placeholder="$t('offer.notePlaceholder')"></textarea>
        </label>
        <p v-if="offerError" class="field-error !mt-0">{{ offerError }}</p>
        <button type="submit" class="btn btn-block" :disabled="isSendingOffer || !offer.give">{{ isSendingOffer ? $t('common.sending') : $t('offer.send') }}</button>
      </form>
    </div>

    <!-- Report sheet -->
    <div v-if="showReport" class="sheet-backdrop" @click.self="showReport = false">
      <form class="sheet grid gap-4" @submit.prevent="sendReport">
        <h2 class="text-xl font-bold">{{ $t('report.title') }}</h2>
        <label v-for="r in ['scam', 'prohibited', 'wrong', 'offensive', 'other']" :key="r" class="option" :class="{ 'option-on': reportReason === r }">
          <input v-model="reportReason" type="radio" :value="r" required />
          <span class="text-sm font-medium">{{ $t(`report.${r}`) }}</span>
        </label>
        <textarea v-model="reportNote" rows="2" :placeholder="$t('report.notePlaceholder')"></textarea>
        <button type="submit" class="btn btn-block" :disabled="!reportReason">{{ $t('report.send') }}</button>
      </form>
    </div>

    <!-- Delete confirmation -->
    <div v-if="showDelete" class="sheet-backdrop" @click.self="showDelete = false">
      <div class="sheet">
        <h2 class="text-xl font-bold">{{ $t('detail.deleteTitle') }}</h2>
        <p class="mt-1 text-[var(--color-text-secondary)]">{{ $t('detail.deleteText') }}</p>
        <div class="mt-5 flex gap-2">
          <button type="button" class="btn-secondary flex-1" @click="showDelete = false">{{ $t('common.cancel') }}</button>
          <button type="button" class="btn flex-1 !bg-red-600 !shadow-none" :disabled="isDeleting" @click="deleteListing">{{ $t('detail.delete') }}</button>
        </div>
      </div>
    </div>

    <BoostSheet v-if="showBoost" :listing="listing" @close="showBoost = false" @boosted="(d) => (listing.boosted_until = d)" />
  </div>
</template>

<script setup>
import CategoryIcon from '../components/CategoryIcon.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, where, limit, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import ListingCard from '../components/ListingCard.vue'
import BoostSheet from '../components/BoostSheet.vue'
import TopupInput from '../components/TopupInput.vue'
import TabIcon from '../components/TabIcon.vue'
import { topupText, whatsappLink, placeholderArt, categoryName, isBoosted, country, money } from '../lib/regions.js'
import { saved, toggleSaved } from '../lib/saved.js'
import { useStickyBar } from '../lib/chrome.js'
import { track } from '../lib/track.js'
import { t } from '../i18n/index.js'

useStickyBar(76)

const route = useRoute()
const router = useRouter()
const listingId = route.params.id

const listing = ref(null)
const owner = ref(null)
const categories = ref([])
const others = ref([])
const isLoading = ref(true)
const error = ref(null)
const currentUser = ref(auth.currentUser)
const isAdmin = ref(false)
const whatsAppNote = ref('')
const showDelete = ref(false)
const isDeleting = ref(false)
const showBoost = ref(false)
const showReport = ref(false)
const reportReason = ref('')
const reportNote = ref('')

const showOffer = ref(false)
const myListings = ref([])
const offer = ref({ give: '', giveText: '', topup: null, note: '' })
const offerError = ref('')
const isSendingOffer = ref(false)

const isOwner = computed(() => !!currentUser.value && currentUser.value.uid === listing.value?.by_user_id)
const isSaved = computed(() => saved.has(listingId))
const boosted = computed(() => isBoosted(listing.value))
const category = computed(() => categories.value.find((c) => c.id === listing.value?.category_id))
const statusClass = computed(
  () =>
    ({
      available: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900',
      pending: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
      completed: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    })[listing.value?.status || 'available'],
)
const cheapestBoost = computed(() => {
  const b = country(listing.value?.country).boosts[0]
  return money(b.amount, b.currency)
})
const toDate = (v) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : null)
const boostedUntilText = computed(() => toDate(listing.value?.boosted_until)?.toLocaleDateString([], { day: 'numeric', month: 'short' }))
const memberYear = computed(() => toDate(owner.value?.created_at)?.getFullYear() || new Date().getFullYear())
const listedAgo = computed(() => {
  const d = toDate(listing.value?.created_at)
  if (!d) return ''
  const h = (Date.now() - d.getTime()) / 3600e3
  if (h < 1) return t('time.justNow')
  if (h < 24) return t('time.hoursAgo', { n: Math.floor(h) })
  return t('time.daysAgo', { n: Math.floor(h / 24) })
})
const moreFromTrader = computed(() => others.value.filter((l) => l.by_user_id === listing.value?.by_user_id).slice(0, 4))
const similar = computed(() =>
  others.value.filter((l) => l.by_user_id !== listing.value?.by_user_id && l.category_id === listing.value?.category_id).slice(0, 4),
)

const stopAuth = onAuthStateChanged(auth, async (user) => {
  currentUser.value = user
  isAdmin.value = false
  if (user) {
    const u = await getDoc(doc(db, 'users', user.uid)).catch(() => null)
    isAdmin.value = u?.exists() && u.data().is_admin === true
  }
})
onUnmounted(stopAuth)

onMounted(async () => {
  try {
    const [cats, snap] = await Promise.all([getDocs(collection(db, 'categories')), getDoc(doc(db, 'listings', listingId))])
    categories.value = cats.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (!snap.exists()) {
      error.value = t('detail.goneText')
      return
    }
    listing.value = { id: snap.id, ...snap.data() }
    document.title = `${listing.value.tradeWhat} · ${listing.value.location} · Barter`
    track('view_item', { listing_id: listingId, category: listing.value.category_id })

    const [o, rest] = await Promise.all([
      getDoc(doc(db, 'users', listing.value.by_user_id)),
      getDocs(query(collection(db, 'listings'), where('country', '==', listing.value.country || 'ZW'), where('status', '==', 'available'), limit(60))),
    ])
    owner.value = o.exists() ? { id: o.id, ...o.data() } : listing.value.owner || null
    others.value = rest.docs.filter((d) => d.id !== listingId).map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Error fetching listing:', err)
    error.value = t('detail.loadError')
  } finally {
    isLoading.value = false
  }
})

const firstName = (n) => (n || '').split(' ')[0]
const initials = (n) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/listings')
}

function requireLogin() {
  if (currentUser.value) return false
  router.push({ path: '/login', query: { redirect: route.fullPath } })
  return true
}

async function share() {
  const url = location.origin + `/listing/${listingId}`
  const text = t('detail.shareText', { item: listing.value.tradeWhat, wants: listing.value.forWhat })
  track('share', { listing_id: listingId })
  if (navigator.share) {
    try {
      await navigator.share({ title: listing.value.tradeWhat, text, url })
    } catch {
      /* user cancelled */
    }
    return
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener')
}

function contactSeller() {
  if (requireLogin()) return
  track('contact_seller', { listing_id: listingId, channel: 'chat' })
  router.push({ path: '/messages', query: { to: listing.value.by_user_id, listing: listingId } })
}

function openWhatsApp() {
  track('contact_seller', { listing_id: listingId, channel: 'whatsapp' })
  const text = t('detail.waText', { name: firstName(owner.value?.name), item: listing.value.tradeWhat })
  const link = whatsappLink(owner.value?.whatsapp, text)
  if (link && !owner.value?.demo_bot) return window.open(link, '_blank', 'noopener')
  whatsAppNote.value = owner.value?.demo_bot ? t('detail.waDemo', { name: owner.value.name, text }) : t('detail.waMissing', { name: owner.value?.name || t('common.trader') })
}

async function startOffer() {
  if (requireLogin()) return
  offerError.value = ''
  try {
    const snap = await getDocs(query(collection(db, 'listings'), where('by_user_id', '==', currentUser.value.uid), where('status', '==', 'available')))
    myListings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    myListings.value = []
  }
  offer.value = { give: myListings.value[0]?.id || 'other', giveText: '', topup: null, note: '' }
  showOffer.value = true
  track('begin_offer', { listing_id: listingId })
}

async function sendOffer() {
  const o = offer.value
  if (o.give === 'other' && !o.giveText.trim()) return (offerError.value = t('offer.errGive'))
  if (o.topup && !(o.topup.amount > 0)) return (offerError.value = t('offer.errCash'))
  isSendingOffer.value = true
  try {
    const uid = currentUser.value.uid
    const to = listing.value.by_user_id
    const giveTitle = o.give === 'other' ? o.giveText.trim() : myListings.value.find((l) => l.id === o.give)?.tradeWhat
    await addDoc(collection(db, 'messages'), {
      from_user_id: uid,
      to_user_id: to,
      participants: [uid, to].sort(),
      listing_id: listingId,
      type: 'offer',
      text: `${giveTitle} ⇄ ${listing.value.tradeWhat}`,
      offer: {
        give_listing_id: o.give === 'other' ? null : o.give,
        give_text: o.give === 'other' ? o.giveText.trim() : null,
        want_listing_id: listingId,
        topup: o.topup,
        note: o.note.trim() || null,
        status: 'open',
      },
      read: false,
      created_at: serverTimestamp(),
    })
    track('offer_sent', { listing_id: listingId, with_cash: !!o.topup })
    router.push({ path: '/messages', query: { to, listing: listingId, message: t('offer.sent') } })
  } catch (e) {
    console.error('Error sending offer:', e)
    offerError.value = t('offer.errSend')
  } finally {
    isSendingOffer.value = false
  }
}

function openBoost() {
  showBoost.value = true
}

async function sendReport() {
  try {
    await addDoc(collection(db, 'reports'), {
      listing_id: listingId,
      reason: reportReason.value,
      note: reportNote.value.trim() || null,
      by_user_id: currentUser.value?.uid || null,
      created_at: serverTimestamp(),
    })
  } catch (e) {
    console.error('Report failed', e)
  }
  showReport.value = false
  router.replace({ query: { message: t('report.thanks') } })
}

async function updateStatus(status) {
  if (!isOwner.value || listing.value.status === status) return
  try {
    await updateDoc(doc(db, 'listings', listingId), { status, updated_at: serverTimestamp() })
    listing.value.status = status
  } catch (e) {
    console.error('Error updating status:', e)
  }
}

async function deleteListing() {
  if (!isOwner.value && !isAdmin.value) return (showDelete.value = false)
  isDeleting.value = true
  try {
    await deleteDoc(doc(db, 'listings', listingId))
    router.push({ path: '/listings', query: { message: t('detail.deleted') } })
  } catch (e) {
    console.error('Error deleting listing:', e)
    isDeleting.value = false
  }
}
</script>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 9999px;
}
.icon-btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.92);
  color: #18181b;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
}
.icon-btn :deep(svg) {
  width: 20px;
  height: 20px;
}
.option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 6px 12px;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  cursor: pointer;
}
.option-on {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 7%, transparent);
}
.sticky-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--color-background) 96%, transparent);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border);
}
</style>
