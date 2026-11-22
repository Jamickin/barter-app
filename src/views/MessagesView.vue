<template>
  <div>
    <h1 class="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t('msg.title') }}</h1>

    <div v-if="isLoading" class="card divide-y divide-[var(--color-border)]">
      <div v-for="i in 4" :key="i" class="flex gap-3 p-4"><div class="skeleton h-12 w-12 !rounded-full"></div><div class="flex-1"><div class="skeleton h-4 w-1/3"></div><div class="skeleton mt-2 h-3 w-2/3"></div></div></div>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-[22rem_1fr]">
      <!-- Conversation list -->
      <div class="card overflow-hidden self-start">
        <div class="border-b border-[var(--color-border)] p-3">
          <input v-model="searchQuery" type="search" class="!min-h-10 !text-[15px]" :placeholder="$t('msg.search')" :aria-label="$t('msg.search')" />
        </div>
        <div class="md:max-h-[calc(100vh-15rem)] md:overflow-y-auto">
          <div v-if="!filtered.length" class="px-6 py-10 text-center">
            
            <p class="mt-2 font-semibold">{{ $t('msg.emptyTitle') }}</p>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ $t('msg.emptyText') }}</p>
            <router-link to="/listings" class="btn btn-sm mt-4">{{ $t('msg.browse') }}</router-link>
          </div>
          <button
            v-for="c in filtered"
            :key="c.key"
            type="button"
            class="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-3.5 text-left last:border-0 hover:bg-[var(--color-page)]"
            :class="{ 'md:bg-zinc-100 md:dark:bg-zinc-800': selected?.key === c.key }"
            @click="openConversation(c)"
          >
            <span class="relative shrink-0">
              <img v-if="c.listing?.image_url" :src="c.listing.image_url" alt="" class="h-12 w-12 rounded-xl object-cover" />
              <span v-else class="grid h-12 w-12 place-items-center rounded-xl bg-zinc-200 text-sm font-bold text-zinc-700">{{ initials(c.otherUser?.name) }}</span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-baseline justify-between gap-2">
                <span class="truncate" :class="c.unread ? 'font-bold' : 'font-semibold'">{{ c.otherUser?.name || $t('common.trader') }}</span>
                <span class="shrink-0 text-xs text-[var(--color-text-light)]">{{ ago(c.last?.created_at) }}</span>
              </span>
              <span v-if="c.listing" class="block truncate text-xs text-[var(--color-text-light)]">{{ c.listing.tradeWhat }}</span>
              <span class="mt-0.5 flex items-center gap-2">
                <span class="flex-1 truncate text-sm" :class="c.unread ? 'font-semibold text-[var(--color-text-main)]' : 'text-[var(--color-text-secondary)]'">
                  <template v-if="c.last?.type === 'offer'">{{ $t('msg.offerPreview') }}</template><template v-else>{{ c.last?.text || $t('msg.newConversation') }}</template>
                </span>
                <span v-if="c.unread" class="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-bold text-white">{{ c.unread }}</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <!-- Thread: full screen on phones, panel on desktop -->
      <div v-if="!selected" class="card hidden place-items-center p-10 text-center md:grid">
        <div>
          
          <p class="mt-3 font-semibold">{{ $t('msg.pick') }}</p>
        </div>
      </div>

      <section v-else class="thread card flex flex-col overflow-hidden">
        <header class="flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-2.5">
          <button type="button" class="grid h-10 w-10 place-items-center rounded-full md:hidden" :aria-label="$t('common.back')" @click="closeConversation">
            <TabIcon name="back" class="h-6 w-6" />
          </button>
          <router-link :to="`/profile/${selected.otherId}`" class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700">{{ initials(selected.otherUser?.name) }}</router-link>
          <div class="min-w-0 flex-1">
            <router-link :to="`/profile/${selected.otherId}`" class="block truncate font-semibold">{{ selected.otherUser?.name || $t('common.trader') }}</router-link>
            <p class="truncate text-xs text-[var(--color-text-light)]">{{ selected.otherUser?.town }}</p>
          </div>
          <button type="button" class="btn-whatsapp btn-sm !px-3" @click="openWhatsApp">WhatsApp</button>
        </header>

        <!-- Listing context strip -->
        <router-link v-if="selected.listing" :to="`/listing/${selected.listing.id}`" class="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-page)] px-4 py-2">
          <img :src="selected.listing.image_url" alt="" class="h-9 w-9 rounded-lg object-cover" />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium">{{ selected.listing.tradeWhat }}</span>
            <span class="block truncate text-xs text-[var(--color-text-light)]">{{ $t('card.wants') }} {{ selected.listing.forWhat }}</span>
          </span>
          <span class="text-xs font-semibold text-[var(--color-text-secondary)]">{{ $t(`status.${selected.listing.status || 'available'}`) }}</span>
        </router-link>

        <p v-if="whatsAppNote" class="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{{ whatsAppNote }}</p>

        <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto bg-[var(--color-page)] px-4 pt-4 pb-[calc(1rem+var(--badge-h))]">
          <p v-if="!thread.length" class="py-8 text-center text-sm text-[var(--color-text-light)]">{{ $t('msg.sayHello') }}</p>

          <template v-for="(m, i) in thread" :key="m.id">
            <div v-if="newDay(m, thread[i - 1])" class="py-1 text-center">
              <span class="rounded-full bg-[var(--color-background)] px-3 py-1 text-[11px] font-medium text-[var(--color-text-light)] ring-1 ring-[var(--color-border)]">{{ dayLabel(m.created_at) }}</span>
            </div>

            <!-- Offer card -->
            <div v-if="m.type === 'offer'" class="flex" :class="{ 'justify-end': mine(m) }">
              <div class="w-full max-w-sm rounded-2xl border-2 bg-[var(--color-background)] p-3.5" :class="offerBorder(m.offer?.status)">
                <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span class="text-[var(--color-text-light)]">{{ mine(m) ? $t('msg.yourOffer') : $t('msg.offerForYou') }}</span>
                  <span :class="offerTone(m.offer?.status)">{{ $t(`offerStatus.${m.offer?.status}`) }}</span>
                </div>
                <div class="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                  <div class="rounded-xl bg-[var(--color-page)] p-2.5">
                    <div class="text-[11px] text-[var(--color-text-light)]">{{ mine(m) ? $t('msg.youGive') : $t('msg.theyGive') }}</div>
                    <div class="font-semibold leading-snug">{{ offerGive(m) }}</div>
                  </div>
                  <TabIcon name="swap" class="h-5 w-5 text-[var(--color-text-light)]" />
                  <div class="rounded-xl bg-[var(--color-page)] p-2.5">
                    <div class="text-[11px] text-[var(--color-text-light)]">{{ mine(m) ? $t('msg.youGet') : $t('msg.youGive') }}</div>
                    <div class="font-semibold leading-snug">{{ listingTitle(m.offer?.want_listing_id) }}</div>
                  </div>
                </div>
                <p v-if="m.offer?.topup" class="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{{ offerTopup(m) }}</p>
                <p v-if="m.offer?.note" class="mt-1 text-sm text-[var(--color-text-secondary)]">“{{ m.offer.note }}”</p>
                <div v-if="!mine(m) && m.offer?.status === 'open'" class="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" class="btn-secondary btn-sm" :disabled="isSending" @click="respondToOffer(m, 'declined')">{{ $t('msg.decline') }}</button>
                  <button type="button" class="btn btn-sm" :disabled="isSending" @click="respondToOffer(m, 'accepted')">{{ $t('msg.accept') }}</button>
                </div>
                <div v-else-if="mine(m) && m.offer?.status === 'open'" class="mt-2.5 flex items-center justify-between text-xs text-[var(--color-text-light)]">
                  <span>{{ $t('msg.waiting', { name: firstName(selected.otherUser?.name) }) }}</span>
                  <button type="button" class="font-medium underline" @click="respondToOffer(m, 'withdrawn')">{{ $t('msg.withdraw') }}</button>
                </div>
                <p v-else-if="m.offer?.status === 'accepted'" class="mt-2.5 text-xs text-[var(--color-text-secondary)]">{{ $t('msg.acceptedHelp') }}</p>
                <div class="mt-1.5 text-right text-[11px] text-[var(--color-text-light)]">{{ clock(m.created_at) }}</div>
              </div>
            </div>

            <!-- Text bubble -->
            <div v-else class="flex" :class="{ 'justify-end': mine(m) }">
              <div class="max-w-[80%] rounded-2xl px-3.5 py-2" :class="mine(m) ? 'rounded-br-md bg-[var(--color-primary)] text-white' : 'rounded-bl-md bg-[var(--color-background)] ring-1 ring-[var(--color-border)]'">
                <p class="whitespace-pre-wrap break-words text-[15px]">{{ m.text }}</p>
                <p class="mt-0.5 text-right text-[11px]" :class="mine(m) ? 'text-zinc-400' : 'text-[var(--color-text-light)]'">
                  {{ clock(m.created_at) }}<template v-if="mine(m)"> · {{ m.read ? $t('msg.read') : $t('msg.sent') }}</template>
                </p>
              </div>
            </div>
          </template>

          <div v-if="typing" class="flex">
            <div class="rounded-2xl rounded-bl-md bg-[var(--color-background)] px-3.5 py-2 text-sm text-[var(--color-text-light)] ring-1 ring-[var(--color-border)]">{{ $t('msg.typing', { name: firstName(selected.otherUser?.name) }) }}</div>
          </div>
        </div>

        <!-- Quick replies lower the effort of a first message -->
        <div v-if="thread.length < 2" class="flex gap-2 overflow-x-auto border-t border-[var(--color-border)] px-3 pt-2.5 no-scrollbar">
          <button v-for="q in quickReplies" :key="q" type="button" class="chip shrink-0" @click="sendText(q)">{{ q }}</button>
        </div>
        <form class="composer flex items-end gap-2 border-t border-[var(--color-border)] p-3" @submit.prevent="sendMessage">
          <textarea
            ref="input"
            v-model="newMessage"
            rows="1"
            class="!min-h-11 max-h-32 !rounded-3xl !py-2.5"
            :placeholder="$t('msg.placeholder')"
            :aria-label="$t('msg.placeholder')"
            @keydown.enter.exact.prevent="sendMessage"
          ></textarea>
          <button type="submit" class="btn !min-h-11 !rounded-full !px-5" :disabled="!newMessage.trim() || isSending">{{ $t('msg.send') }}</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import TabIcon from '../components/TabIcon.vue'
import { money, whatsappLink } from '../lib/regions.js'
import { track } from '../lib/track.js'
import { setBottomChrome, TABBAR_PX } from '../lib/chrome.js'
import { t } from '../i18n/index.js'

const route = useRoute()
const router = useRouter()

const currentUser = ref(auth.currentUser)
const all = ref([])
const users = ref({})
const listings = ref({})
const isLoading = ref(true)
const searchQuery = ref('')
const selectedKey = ref(null)
const draft = ref(null)
const newMessage = ref('')
const isSending = ref(false)
const typing = ref(false)
const whatsAppNote = ref('')
const scroller = ref(null)
const input = ref(null)

const keyOf = (otherId, listingId) => `${otherId}|${listingId || ''}`
const ms = (v) => (v?.toMillis ? v.toMillis() : v?.toDate ? v.toDate().getTime() : v ? new Date(v).getTime() : 0)
const mine = (m) => m.from_user_id === currentUser.value?.uid
const quickReplies = computed(() => t('msg.quick').split('|'))

let stopMessages = null
function listen(uid) {
  stopMessages?.()
  const q = query(collection(db, 'messages'), where('participants', 'array-contains', uid))
  stopMessages = onSnapshot(q, async (snap) => {
    const before = all.value.length
    all.value = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => ms(a.created_at) - ms(b.created_at))
    await loadRefs()
    isLoading.value = false
    if (all.value.length !== before) {
      typing.value = false
      scrollDown()
    }
    markRead()
  })
}

async function loadRefs() {
  const uid = currentUser.value?.uid
  const needUsers = new Set()
  const needListings = new Set()
  for (const m of all.value) {
    needUsers.add(m.from_user_id === uid ? m.to_user_id : m.from_user_id)
    if (m.listing_id) needListings.add(m.listing_id)
    if (m.offer) [m.offer.give_listing_id, m.offer.want_listing_id].forEach((x) => x && needListings.add(x))
  }
  if (draft.value) {
    needUsers.add(draft.value.otherId)
    if (draft.value.listingId) needListings.add(draft.value.listingId)
  }
  await Promise.all([
    ...[...needUsers].filter((id) => !users.value[id]).map(async (id) => {
      const s = await getDoc(doc(db, 'users', id))
      users.value = { ...users.value, [id]: s.exists() ? { id, ...s.data() } : { id, name: t('common.trader') } }
    }),
    ...[...needListings].map(async (id) => {
      const s = await getDoc(doc(db, 'listings', id))
      if (s.exists()) listings.value = { ...listings.value, [id]: { id, ...s.data() } }
    }),
  ])
}

const conversations = computed(() => {
  const uid = currentUser.value?.uid
  const map = new Map()
  for (const m of all.value) {
    const otherId = m.from_user_id === uid ? m.to_user_id : m.from_user_id
    const key = keyOf(otherId, m.listing_id)
    const c = map.get(key) || { key, otherId, listingId: m.listing_id, messages: [], unread: 0 }
    c.messages.push(m)
    c.last = m
    if (m.to_user_id === uid && !m.read) c.unread++
    map.set(key, c)
  }
  if (draft.value && !map.has(draft.value.key)) map.set(draft.value.key, { ...draft.value, messages: [], unread: 0 })
  return [...map.values()]
    .map((c) => ({ ...c, otherUser: users.value[c.otherId], listing: listings.value[c.listingId] }))
    .sort((a, b) => (ms(b.last?.created_at) || Date.now()) - (ms(a.last?.created_at) || Date.now()))
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter((c) => [c.otherUser?.name, c.listing?.tradeWhat, c.last?.text].some((s) => s?.toLowerCase().includes(q)))
})

const selected = computed(() => conversations.value.find((c) => c.key === selectedKey.value) || null)
const thread = computed(() => selected.value?.messages || [])

// An open thread on a phone is full screen with its own composer, so the tab bar steps aside.
watch(selected, (s) => {
  document.documentElement.classList.toggle('thread-open', !!s)
  const phone = window.innerWidth < 768
  document.documentElement.classList.toggle('has-sticky-bar', !!s && phone)
  if (phone) setBottomChrome(s ? 68 : TABBAR_PX)
})

function openConversation(c) {
  selectedKey.value = c.key
  whatsAppNote.value = ''
  router.replace({ query: { to: c.otherId, ...(c.listingId ? { listing: c.listingId } : {}) } })
  markRead()
  scrollDown()
}

function closeConversation() {
  selectedKey.value = null
  router.replace({ query: {} })
}

function markRead() {
  const c = selected.value
  if (!c) return
  const uid = currentUser.value?.uid
  for (const m of c.messages) {
    if (m.to_user_id === uid && !m.read) {
      m.read = true
      updateDoc(doc(db, 'messages', m.id), { read: true }).catch((e) => console.error(e))
    }
  }
}

function scrollDown() {
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

async function post(fields) {
  const uid = currentUser.value.uid
  const c = selected.value
  await addDoc(collection(db, 'messages'), {
    from_user_id: uid,
    to_user_id: c.otherId,
    participants: [uid, c.otherId].sort(),
    listing_id: c.listingId || null,
    read: false,
    type: 'text',
    created_at: serverTimestamp(),
    ...fields,
  })
  if (c.otherUser?.demo_bot) typing.value = true
}

async function sendText(text) {
  if (!text || !selected.value || isSending.value) return
  isSending.value = true
  try {
    await post({ text })
    if (!thread.value.length) track('first_message', { listing_id: selected.value.listingId })
    newMessage.value = ''
    draft.value = null
    scrollDown()
  } catch (e) {
    console.error('Error sending message:', e)
  } finally {
    isSending.value = false
  }
}
const sendMessage = () => sendText(newMessage.value.trim())

async function respondToOffer(m, status) {
  isSending.value = true
  try {
    await updateDoc(doc(db, 'messages', m.id), { offer: { ...m.offer, status }, read: true })
    if (status === 'accepted') {
      for (const id of [m.offer.give_listing_id, m.offer.want_listing_id]) {
        if (id) await updateDoc(doc(db, 'listings', id), { status: 'pending', updated_at: serverTimestamp() })
      }
      await post({ text: t('msg.acceptedText') })
      track('offer_accepted', { listing_id: m.offer.want_listing_id })
    } else if (status === 'declined') {
      await post({ text: t('msg.declinedText') })
    }
    typing.value = false
    await loadRefs()
  } catch (e) {
    console.error('Error updating offer:', e)
  } finally {
    isSending.value = false
  }
}

function openWhatsApp() {
  const c = selected.value
  const text = t('msg.waText', { name: firstName(c.otherUser?.name), me: firstName(currentUser.value?.displayName), item: c.listing?.tradeWhat || '' })
  const link = whatsappLink(c.otherUser?.whatsapp, text)
  track('contact_seller', { channel: 'whatsapp', from: 'thread' })
  if (link && !c.otherUser?.demo_bot) return window.open(link, '_blank', 'noopener')
  whatsAppNote.value = c.otherUser?.demo_bot ? t('msg.waDemo', { name: c.otherUser.name }) : t('detail.waMissing', { name: c.otherUser?.name || t('common.trader') })
}

const listingTitle = (id) => listings.value[id]?.tradeWhat || '—'
const offerGive = (m) => (m.offer?.give_listing_id ? listingTitle(m.offer.give_listing_id) : m.offer?.give_text || '—')
const offerTopup = (m) => {
  const tp = m.offer.topup
  const mm = money(tp.amount, tp.currency)
  if (mine(m)) return tp.dir === 'add' ? t('msg.youAddCash', { m: mm }) : t('msg.youWantCash', { m: mm })
  return tp.dir === 'add' ? t('msg.theyAddCash', { m: mm }) : t('msg.theyWantCash', { m: mm })
}
const offerTone = (s) => ({ open: 'text-[var(--color-text-secondary)]', accepted: 'text-emerald-600', declined: 'text-red-600', withdrawn: 'text-zinc-400' })[s]
const offerBorder = (s) => ({ open: 'border-zinc-300 dark:border-zinc-600', accepted: 'border-emerald-400', declined: 'border-red-200', withdrawn: 'border-[var(--color-border)] opacity-70' })[s]

const firstName = (n) => (n || '').split(' ')[0]
const initials = (n) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
const toDate = (v) => new Date(ms(v) || Date.now())
const clock = (v) => toDate(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const newDay = (m, prev) => !prev || toDate(m.created_at).toDateString() !== toDate(prev.created_at).toDateString()
function dayLabel(v) {
  const d = toDate(v)
  if (d.toDateString() === new Date().toDateString()) return t('time.today')
  if (d.toDateString() === new Date(Date.now() - 864e5).toDateString()) return t('time.yesterday')
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}
function ago(v) {
  if (!v) return ''
  const s = (Date.now() - ms(v)) / 1000
  if (s < 60) return t('time.now')
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return toDate(v).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

async function openFromRoute() {
  const to = route.query.to
  if (!to || to === currentUser.value?.uid) return
  const key = keyOf(to, route.query.listing)
  if (!all.value.some((m) => keyOf(mine(m) ? m.to_user_id : m.from_user_id, m.listing_id) === key)) {
    draft.value = { key, otherId: to, listingId: route.query.listing || null }
    await loadRefs()
  }
  selectedKey.value = key
  markRead()
  scrollDown()
}

let stopAuth
onMounted(() => {
  stopAuth = onAuthStateChanged(auth, (u) => {
    currentUser.value = u
    selectedKey.value = null
    draft.value = null
    if (!u) return router.push({ path: '/login', query: { redirect: '/messages' } })
    listen(u.uid)
  })
})
watch(isLoading, (loading) => !loading && openFromRoute())
watch(() => thread.value.length, scrollDown)
onUnmounted(() => {
  stopMessages?.()
  stopAuth?.()
  document.documentElement.classList.remove('thread-open', 'has-sticky-bar')
  if (window.innerWidth < 768) setBottomChrome(TABBAR_PX)
})
</script>

<style scoped>
.thread {
  height: calc(100vh - 12rem);
  min-height: 28rem;
}
@media (max-width: 767px) {
  /* Full-screen chat under the header; the composer sits at the very bottom */
  .thread {
    position: fixed;
    inset: 0;
    z-index: 40;
    height: auto;
    min-height: 0;
    border-radius: 0;
    border: 0;
  }
  .composer {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}
</style>
