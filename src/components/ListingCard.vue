<template>
  <article class="group relative flex flex-col" :class="{ 'opacity-60': listing.status === 'completed' }">
    <router-link :to="`/listing/${listing.id}`" class="block" @click="track('select_listing', { listing_id: listing.id, list: listName })">
      <div class="relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-border)]">
        <img
          :src="listing.image_url || placeholderArt(categoryIcon(categories, listing.category_id))"
          :alt="listing.tradeWhat"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <span v-if="boosted" class="badge absolute left-2 top-2 bg-amber-400 text-amber-950">
          <TabIcon name="bolt" class="h-3 w-3" />{{ $t('card.boosted') }}
        </span>
        <span v-else-if="listing.status === 'pending'" class="badge absolute left-2 top-2 bg-white/95 text-zinc-900">{{ $t('status.pending') }}</span>
        <span v-else-if="listing.status === 'completed'" class="badge absolute left-2 top-2 bg-zinc-900 text-white">{{ $t('status.completed') }}</span>
      </div>

      <div class="pt-2.5 px-0.5">
        <h3 class="text-[15px] font-semibold leading-snug line-clamp-2 text-[var(--color-text-main)]">{{ listing.tradeWhat }}</h3>
        <p class="mt-0.5 text-[13px] leading-snug line-clamp-1 text-[var(--color-text-secondary)]">
          <span class="font-medium text-[var(--color-primary)]">{{ $t('card.wants') }}</span> {{ listing.forWhat }}
        </p>
        <p class="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-light)]">
          <TabIcon name="pin" class="h-3.5 w-3.5 shrink-0" />
          <span class="shrink-0">{{ listing.location }}</span>
          <template v-if="topup"><span aria-hidden="true">·</span><span class="truncate text-emerald-700 dark:text-emerald-400">{{ topup }}</span></template>
          <template v-else-if="when"><span aria-hidden="true">·</span><span class="truncate">{{ when }}</span></template>
        </p>
      </div>
    </router-link>

    <button
      type="button"
      class="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition active:scale-90"
      :class="isSaved ? 'text-red-500' : 'text-zinc-700'"
      :aria-label="isSaved ? $t('card.unsave') : $t('card.save')"
      :aria-pressed="isSaved"
      @click="toggleSaved(listing.id)"
    >
      <TabIcon name="heart" class="h-5 w-5" :fill="isSaved ? 'currentColor' : 'none'" />
    </button>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import TabIcon from './TabIcon.vue'
import { topupText, placeholderArt, categoryIcon, isBoosted } from '../lib/regions.js'
import { saved, toggleSaved } from '../lib/saved.js'
import { track } from '../lib/track.js'
import { t } from '../i18n/index.js'

const props = defineProps({
  listing: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  listName: { type: String, default: 'grid' },
})

const isSaved = computed(() => saved.has(props.listing.id))
const boosted = computed(() => isBoosted(props.listing) && props.listing.status === 'available')
const topup = computed(() => topupText(props.listing.topup, { short: true }))

const when = computed(() => {
  const c = props.listing.created_at
  const d = c?.toDate ? c.toDate() : c instanceof Date ? c : null
  if (!d) return ''
  const h = (Date.now() - d.getTime()) / 3600e3
  if (h < 1) return t('time.justNow')
  if (h < 24) return t('time.hoursAgo', { n: Math.floor(h) })
  if (h < 24 * 7) return t('time.daysAgo', { n: Math.floor(h / 24) })
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
}
</style>
