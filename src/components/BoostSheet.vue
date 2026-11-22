<template>
  <div class="sheet-backdrop" @click.self="step !== 'paying' && $emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" :aria-label="$t('boost.title')">
      <!-- Step indicator -->
      <div v-if="['plan', 'method', 'review'].includes(step)" class="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-light)]">
        <span v-for="(s, i) in ['plan', 'method', 'review']" :key="s" class="flex items-center gap-2">
          <span class="grid h-6 w-6 place-items-center rounded-full" :class="stepIndex >= i ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)]'">{{ i + 1 }}</span>
          <span :class="{ 'text-[var(--color-text-main)]': stepIndex === i }">{{ $t(`boost.steps.${s}`) }}</span>
          <span v-if="i < 2" class="h-px w-4 bg-[var(--color-border)]"></span>
        </span>
      </div>

      <!-- 1. Plan -->
      <template v-if="step === 'plan'">
        <h2 class="text-xl font-bold">{{ $t('boost.title') }}</h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ $t('boost.pitch') }}</p>
        <ul class="mt-3 grid gap-1.5 text-sm">
          <li v-for="b in ['top', 'badge', 'home']" :key="b" class="flex items-center gap-2"><TabIcon name="check" class="h-4 w-4 text-emerald-600" />{{ $t(`boost.benefits.${b}`) }}</li>
        </ul>
        <div class="mt-5 grid gap-2">
          <label
            v-for="p in plans"
            :key="p.id"
            class="relative flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border-2 px-4"
            :class="plan === p.id ? 'border-[var(--color-primary)] bg-zinc-100 dark:bg-zinc-800' : 'border-[var(--color-border)]'"
          >
            <input v-model="plan" type="radio" :value="p.id" class="sr-only" />
            <span class="flex-1">
              <span class="block font-semibold">{{ $t('boost.days', { n: p.days }) }}</span>
              <span class="block text-xs text-[var(--color-text-light)]">{{ $t('boost.perDay', { m: money(p.amount / p.days, p.currency) }) }}</span>
            </span>
            <span class="text-lg font-bold">{{ money(p.amount, p.currency) }}</span>
            <span v-if="p.id === 'b7'" class="absolute -top-2.5 right-3 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{{ $t('boost.popular') }}</span>
          </label>
        </div>
        <button type="button" class="btn btn-block mt-5" @click="go('method')">{{ $t('common.continue') }}</button>
      </template>

      <!-- 2. Method -->
      <template v-else-if="step === 'method'">
        <h2 class="text-xl font-bold">{{ $t('boost.howPay') }}</h2>
        <div class="mt-4 grid gap-2">
          <label
            v-for="m in methods"
            :key="m"
            class="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4"
            :class="method === m ? 'border-[var(--color-primary)] bg-zinc-100 dark:bg-zinc-800' : 'border-[var(--color-border)]'"
          >
            <input v-model="method" type="radio" :value="m" class="sr-only" />
            <span class="grid h-9 w-9 place-items-center rounded-lg text-xs font-extrabold text-white" :style="{ background: METHOD_STYLE[m].bg }">{{ METHOD_STYLE[m].mark }}</span>
            <span class="flex-1">
              <span class="block font-semibold">{{ $t(`pay.${m}`) }}</span>
              <span class="block text-xs text-[var(--color-text-light)]">{{ $t(`pay.${m}Sub`) }}</span>
            </span>
            <span v-if="method === m" class="text-[var(--color-primary)]"><TabIcon name="check" class="h-5 w-5" /></span>
          </label>
        </div>
        <div v-if="isPhoneMethod" class="mt-4">
          <label class="label" for="pay-phone">{{ $t('boost.phone', { method: $t(`pay.${method}`) }) }}</label>
          <input id="pay-phone" v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="077 123 4567" />
          <p class="hint">{{ $t('boost.phoneHint') }}</p>
        </div>
        <p v-if="error" class="field-error">{{ error }}</p>
        <div class="mt-5 flex gap-2">
          <button type="button" class="btn-secondary" @click="go('plan')">{{ $t('common.back') }}</button>
          <button type="button" class="btn flex-1" @click="toReview">{{ $t('common.continue') }}</button>
        </div>
      </template>

      <!-- 3. Review -->
      <template v-else-if="step === 'review'">
        <h2 class="text-xl font-bold">{{ $t('boost.review') }}</h2>
        <dl class="mt-4 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] text-sm">
          <div class="flex justify-between gap-4 p-3"><dt class="text-[var(--color-text-light)]">{{ $t('boost.listing') }}</dt><dd class="text-right font-medium line-clamp-1">{{ listing.tradeWhat }}</dd></div>
          <div class="flex justify-between gap-4 p-3"><dt class="text-[var(--color-text-light)]">{{ $t('boost.plan') }}</dt><dd class="font-medium">{{ $t('boost.days', { n: chosen.days }) }}</dd></div>
          <div class="flex justify-between gap-4 p-3"><dt class="text-[var(--color-text-light)]">{{ $t('boost.until') }}</dt><dd class="font-medium">{{ fmtDate(newUntil) }}</dd></div>
          <div class="flex justify-between gap-4 p-3"><dt class="text-[var(--color-text-light)]">{{ $t('boost.method') }}</dt><dd class="font-medium">{{ $t(`pay.${method}`) }}<template v-if="isPhoneMethod"> · {{ phone }}</template></dd></div>
          <div class="flex justify-between gap-4 p-3 text-base"><dt class="font-semibold">{{ $t('boost.total') }}</dt><dd class="font-bold">{{ money(chosen.amount, chosen.currency) }}</dd></div>
        </dl>
        <p v-if="isDemo" class="mt-3 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{{ $t('boost.demoNote') }}</p>
        <p class="mt-3 text-xs text-[var(--color-text-light)]">
          {{ $t('boost.agree') }} <router-link to="/boost-terms" class="underline" target="_blank">{{ $t('footer.boosts') }}</router-link>.
        </p>
        <div class="mt-5 flex gap-2">
          <button type="button" class="btn-secondary" @click="go('method')">{{ $t('common.back') }}</button>
          <button type="button" class="btn flex-1" @click="pay">
            <TabIcon name="shield" class="h-4 w-4" />{{ $t('boost.pay', { m: money(chosen.amount, chosen.currency) }) }}
          </button>
        </div>
      </template>

      <!-- 4. Paying -->
      <div v-else-if="step === 'paying'" class="py-6 text-center">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]"></div>
        <h2 class="mt-5 text-lg font-bold">{{ isPhoneMethod ? $t('boost.checkPhone') : $t('boost.redirecting') }}</h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          {{ isPhoneMethod ? $t('boost.approve', { m: money(chosen.amount, chosen.currency), phone }) : $t('boost.secure') }}
        </p>
      </div>

      <!-- 5. Done -->
      <div v-else-if="step === 'done'" class="text-center">
        <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><TabIcon name="check" class="h-7 w-7" /></div>
        <h2 class="mt-4 text-xl font-bold">{{ $t('boost.doneTitle') }}</h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ $t('boost.doneText', { date: fmtDate(paidUntil || newUntil) }) }}</p>
        <dl class="mt-4 rounded-xl bg-[var(--color-page)] p-3 text-left text-sm">
          <div class="flex justify-between py-1"><dt class="text-[var(--color-text-light)]">{{ $t('boost.reference') }}</dt><dd class="font-mono">{{ reference }}</dd></div>
          <div class="flex justify-between py-1"><dt class="text-[var(--color-text-light)]">{{ $t('boost.paid') }}</dt><dd class="font-medium">{{ money(chosen.amount, chosen.currency) }} · {{ $t(`pay.${method}`) }}</dd></div>
        </dl>
        <button type="button" class="btn btn-block mt-5" @click="$emit('close')">{{ $t('common.done') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import TabIcon from './TabIcon.vue'
import { country, money, PHONE_METHODS, isBoosted, normalizePhone } from '../lib/regions.js'
import { track } from '../lib/track.js'
import { t } from '../i18n/index.js'

const props = defineProps({ listing: { type: Object, required: true } })
const emit = defineEmits(['close', 'boosted'])

const isDemo = __DEMO__
const METHOD_STYLE = {
  ecocash: { bg: '#0a5cad', mark: 'Eco' },
  onemoney: { bg: '#e2231a', mark: '1M' },
  innbucks: { bg: '#f59e0b', mark: 'Inn' },
  card: { bg: '#18181b', mark: '💳' },
  eft: { bg: '#0f766e', mark: 'EFT' },
}

const region = computed(() => country(props.listing.country))
const plans = computed(() => region.value.boosts)
const methods = computed(() => region.value.payMethods)
const step = ref('plan')
const plan = ref('b7')
const method = ref(methods.value[0])
const phone = ref('')
const error = ref('')
const reference = ref('')
const paidUntil = ref(null) // locked at payment time so the receipt can't drift when the listing updates

const stepIndex = computed(() => ['plan', 'method', 'review'].indexOf(step.value))
const chosen = computed(() => plans.value.find((p) => p.id === plan.value))
const isPhoneMethod = computed(() => PHONE_METHODS.includes(method.value))

// Buying more time on an active boost extends it rather than restarting it.
const newUntil = computed(() => {
  const u = props.listing.boosted_until
  const cur = isBoosted(props.listing) ? (u.toMillis ? u.toMillis() : new Date(u).getTime()) : Date.now()
  return new Date(cur + chosen.value.days * 864e5)
})

const fmtDate = (d) => d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

onMounted(async () => {
  track('begin_checkout', { item: 'boost', listing_id: props.listing.id })
  try {
    const me = await getDoc(doc(db, 'users', auth.currentUser.uid))
    phone.value = me.data()?.whatsapp ? '0' + me.data().whatsapp.slice(region.value.dial.length) : ''
  } catch {
    /* prefill is optional */
  }
})

function go(s) {
  error.value = ''
  step.value = s
}

function toReview() {
  if (isPhoneMethod.value && normalizePhone(phone.value, props.listing.country).length < 11) {
    error.value = t('boost.phoneError')
    return
  }
  track('add_payment_info', { method: method.value, value: chosen.value.amount, currency: chosen.value.currency })
  go('review')
}

async function pay() {
  step.value = 'paying'
  paidUntil.value = newUntil.value
  // Demo: pretend the provider confirms after a few seconds. Real version: a server function starts a
  // Paynow (EcoCash / OneMoney / card) transaction and a webhook marks it paid before the boost applies.
  await new Promise((r) => setTimeout(r, isPhoneMethod.value ? 3200 : 2200))
  reference.value = 'BRT-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  try {
    await addDoc(collection(db, 'payments'), {
      user_id: auth.currentUser.uid,
      listing_id: props.listing.id,
      item: 'boost',
      plan: chosen.value.id,
      days: chosen.value.days,
      amount: chosen.value.amount,
      currency: chosen.value.currency,
      method: method.value,
      reference: reference.value,
      status: isDemo ? 'demo_paid' : 'pending',
      created_at: serverTimestamp(),
    })
    await updateDoc(doc(db, 'listings', props.listing.id), { boosted_until: Timestamp.fromDate(paidUntil.value) })
    track('purchase', { item: 'boost', value: chosen.value.amount, currency: chosen.value.currency, transaction_id: reference.value })
    emit('boosted', paidUntil.value)
    step.value = 'done'
  } catch (e) {
    console.error('Boost failed', e)
    error.value = t('boost.failed')
    step.value = 'review'
  }
}
</script>
