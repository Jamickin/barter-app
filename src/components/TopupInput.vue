<template>
  <div class="grid grid-cols-[1fr_5.5rem_6rem] gap-2">
    <select v-model="dir" :aria-label="$t('topup.direction')">
      <option value="">{{ $t('topup.none') }}</option>
      <option value="add">{{ $t('topup.iAdd') }}</option>
      <option value="want">{{ $t('topup.iWant') }}</option>
    </select>
    <select v-model="currency" :disabled="!dir" :aria-label="$t('topup.currency')">
      <option v-for="c in currencies" :key="c">{{ c }}</option>
    </select>
    <input v-model.number="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="0" :disabled="!dir" :required="!!dir" :aria-label="$t('topup.amount')" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { country as region } from '../lib/regions.js'

const props = defineProps({ country: { type: String, default: 'ZW' } })
const topup = defineModel({ default: null })
const currencies = computed(() => region(props.country).currencies)

// Expose the topup object ({ dir, amount, currency } or null) as three simple fields.
const field = (k, empty) =>
  computed({
    get: () => topup.value?.[k] ?? empty,
    set: (v) => {
      const next = { dir: '', amount: null, currency: currencies.value[0], ...(topup.value || {}), [k]: v }
      topup.value = next.dir ? next : null
    },
  })
const dir = field('dir', '')
const amount = field('amount', null)
const currency = field('currency', currencies.value[0])
</script>
