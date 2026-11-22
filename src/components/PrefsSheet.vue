<template>
  <div class="sheet-backdrop" @click.self="$emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" :aria-label="$t('prefs.title')">
      <h2 class="text-lg font-bold">{{ $t('prefs.title') }}</h2>

      <h3 class="mt-5 mb-2 text-sm font-semibold text-[var(--color-text-light)]">{{ $t('prefs.country') }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="c in COUNTRY_CODES"
          :key="c"
          type="button"
          class="flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left"
          :class="prefs.country === c ? 'border-[var(--color-primary)] bg-zinc-100 dark:bg-zinc-800' : 'border-[var(--color-border)]'"
          @click="prefs.country = c"
        >
          <FlagIcon :code="c" :size="28" />
          <span class="font-semibold">{{ $t(`country.${c}`) }}</span>
        </button>
      </div>

      <h3 class="mt-5 mb-2 text-sm font-semibold text-[var(--color-text-light)]">{{ $t('prefs.language') }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="l in LANGUAGES"
          :key="l.code"
          type="button"
          class="flex min-h-12 items-center justify-between rounded-xl border px-3 font-medium"
          :class="prefs.locale === l.code ? 'border-[var(--color-primary)] bg-zinc-100 dark:bg-zinc-800' : 'border-[var(--color-border)]'"
          @click="prefs.locale = l.code"
        >
          {{ l.name }}
          <span v-if="prefs.locale === l.code" class="text-[var(--color-primary)]">✓</span>
        </button>
      </div>
      <p v-if="prefs.locale === 'sn' || prefs.locale === 'nd'" class="hint">{{ $t('prefs.draftNote') }}</p>

      <h3 class="mt-5 mb-2 text-sm font-semibold text-[var(--color-text-light)]">{{ $t('prefs.theme') }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="m in ['light', 'dark']"
          :key="m"
          type="button"
          class="min-h-12 rounded-xl border px-3 font-medium"
          :class="theme === m ? 'border-[var(--color-primary)] bg-zinc-100 dark:bg-zinc-800' : 'border-[var(--color-border)]'"
          @click="setTheme(m)"
        >
          {{ m === 'light' ? $t('prefs.light') : $t('prefs.dark') }}
        </button>
      </div>

      <button type="button" class="btn btn-block mt-6" @click="$emit('close')">{{ $t('common.done') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { prefs, LANGUAGES } from '../i18n/index.js'
import { COUNTRY_CODES } from '../lib/regions.js'
import FlagIcon from './FlagIcon.vue'

defineEmits(['close'])

const theme = ref(document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light')
function setTheme(m) {
  theme.value = m
  document.documentElement.classList.toggle('dark-theme', m === 'dark')
  try {
    localStorage.setItem('theme', m)
  } catch {
    /* ignore */
  }
}
</script>
