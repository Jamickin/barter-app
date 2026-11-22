<template>
  <article class="mx-auto max-w-2xl">
    <nav class="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
      <router-link v-for="d in docs" :key="d" :to="`/${d}`" class="chip" :class="{ 'chip-on': d === doc }">{{ $t(`policy.${d}.title`) }}</router-link>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t(`policy.${doc}.title`) }}</h1>
    <p class="mt-1 text-sm text-[var(--color-text-light)]">{{ $t('policy.updated', { date: UPDATED }) }}</p>
    <p class="mt-4 rounded-xl bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{{ $t('policy.draft') }}</p>
    <p v-if="$prefs.locale !== 'en'" class="mt-2 text-sm text-[var(--color-text-light)]">{{ $t('policy.englishOnly') }}</p>
    <div class="prose-policy mt-2">
      <section v-for="s in POLICIES[doc]" :key="s.h">
        <h2>{{ s.h }}</h2>
        <p v-for="(para, i) in s.p || []" :key="i">{{ para }}</p>
        <ul v-if="s.list"><li v-for="li in s.list" :key="li">{{ li }}</li></ul>
      </section>
    </div>
  </article>
</template>

<script setup>
import { POLICIES, UPDATED } from '../content/policies.js'
defineProps({ doc: { type: String, required: true } })
const docs = ['terms', 'privacy', 'guidelines', 'boost-terms']
</script>
