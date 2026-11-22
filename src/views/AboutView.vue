<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{{ $t('about.title') }}</h1>
    <p class="mt-3 text-lg text-[var(--color-text-secondary)]">{{ $t('about.intro') }}</p>

    <div class="mt-8 grid gap-3 md:grid-cols-2">
      <div v-for="k in ['list', 'offer', 'cash', 'meet']" :key="k" class="card p-5">
        <h2 class="font-bold">{{ $t(`about.${k}Title`) }}</h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{{ $t(`about.${k}Text`) }}</p>
      </div>
    </div>

    <h2 class="mt-10 text-xl font-bold">{{ $t('about.costTitle') }}</h2>
    <p class="mt-2 text-[var(--color-text-secondary)]">{{ $t('about.costText', { zw: zwPrice, za: zaPrice }) }}</p>

    <h2 class="mt-10 text-xl font-bold">{{ $t('about.whereTitle') }}</h2>
    <p class="mt-2 text-[var(--color-text-secondary)]">{{ $t('about.whereText') }}</p>

    <div class="mt-10 flex flex-col gap-2 sm:flex-row">
      <router-link to="/listings" class="btn">{{ $t('home.browseCta') }}</router-link>
      <router-link to="/guidelines" class="btn-secondary">{{ $t('footer.guidelines') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { COUNTRIES, money } from '../lib/regions.js'
const zwPrice = money(COUNTRIES.ZW.boosts[0].amount, COUNTRIES.ZW.boosts[0].currency)
const zaPrice = money(COUNTRIES.ZA.boosts[0].amount, COUNTRIES.ZA.boosts[0].currency)
</script>
