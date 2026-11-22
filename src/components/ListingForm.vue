<template>
  <form class="mx-auto flex max-w-xl flex-col gap-6" novalidate @submit.prevent="submit">
    <!-- Photo first: listings with a photo get far more replies -->
    <div>
      <label for="photo" class="group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] transition hover:border-[var(--color-primary)]" :class="preview ? 'aspect-[4/3]' : 'py-10'">
        <img v-if="preview" :src="preview" alt="" class="h-full w-full object-cover" />
        <span v-if="preview" class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white">{{ $t('form.changePhoto') }}</span>
        <span v-else class="flex flex-col items-center gap-2 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"><svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/><path d="M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg></span>
          <span class="font-semibold">{{ $t('form.addPhoto') }}</span>
          <span class="text-sm text-[var(--color-text-light)]">{{ $t('form.photoHint') }}</span>
        </span>
        <input id="photo" type="file" accept="image/*" class="sr-only" @change="onPhoto" />
      </label>
      <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
    </div>

    <div>
      <label class="label" for="tradeWhat">{{ $t('form.what') }}</label>
      <input id="tradeWhat" v-model="f.tradeWhat" type="text" maxlength="80" :placeholder="$t('form.whatPlaceholder')" :aria-invalid="!!errors.tradeWhat" />
      <p v-if="errors.tradeWhat" class="field-error">{{ errors.tradeWhat }}</p>
    </div>

    <div>
      <label class="label" for="forWhat">{{ $t('form.wants') }}</label>
      <input id="forWhat" v-model="f.forWhat" type="text" maxlength="100" :placeholder="$t('form.wantsPlaceholder')" :aria-invalid="!!errors.forWhat" />
      <p class="hint">{{ $t('form.wantsHint') }}</p>
      <p v-if="errors.forWhat" class="field-error">{{ errors.forWhat }}</p>
    </div>

    <fieldset>
      <legend class="label">{{ $t('form.category') }}</legend>
      <div class="flex flex-wrap gap-2">
        <button v-for="c in categories" :key="c.id" type="button" class="chip" :class="{ 'chip-on': f.category_id === c.id }" :aria-pressed="f.category_id === c.id" @click="f.category_id = c.id">
          <CategoryIcon :id="c.id" class="h-4 w-4" />{{ categoryName(c) }}
        </button>
      </div>
      <p v-if="errors.category_id" class="field-error">{{ errors.category_id }}</p>
    </fieldset>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label" for="town">{{ $t('form.town') }}</label>
        <select id="town" v-model="f.location">
          <option value="" disabled>{{ $t('form.chooseTown') }}</option>
          <option v-for="tn in towns" :key="tn" :value="tn">{{ tn }}</option>
        </select>
        <p v-if="errors.location" class="field-error">{{ errors.location }}</p>
      </div>
      <div>
        <label class="label" for="area">{{ $t('form.area') }}</label>
        <input id="area" v-model="f.area" type="text" :placeholder="$t('form.areaPlaceholder')" />
      </div>
    </div>

    <details :open="!!(f.description || f.topup)" class="card p-4">
      <summary class="cursor-pointer list-none font-semibold">＋ {{ $t('form.moreDetails') }}</summary>
      <div class="mt-4 flex flex-col gap-5">
        <div>
          <span class="label">{{ $t('form.cash') }}</span>
          <TopupInput v-model="f.topup" :country="f.country" />
          <p class="hint">{{ $t('form.cashHint') }}</p>
        </div>
        <div>
          <label class="label" for="description">{{ $t('form.description') }}</label>
          <textarea id="description" v-model="f.description" rows="4" maxlength="1000" :placeholder="$t('form.descriptionPlaceholder')"></textarea>
        </div>
        <div v-if="mode === 'edit'">
          <span class="label">{{ $t('detail.status') }}</span>
          <select v-model="f.status">
            <option v-for="s in ['available', 'pending', 'completed']" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
          </select>
        </div>
      </div>
    </details>

    <p class="text-xs text-[var(--color-text-light)]">
      {{ $t('form.agree') }} <router-link to="/guidelines" class="underline">{{ $t('footer.guidelines') }}</router-link>.
    </p>
    <p v-if="submitError" class="field-error !mt-0">{{ submitError }}</p>

    <div class="form-bar">
      <button type="submit" class="btn btn-block" :disabled="busy">{{ busy ? $t('common.saving') : submitLabel }}</button>
    </div>
  </form>
</template>

<script setup>
import CategoryIcon from './CategoryIcon.vue'
import { ref, computed, reactive, watch } from 'vue'
import TopupInput from './TopupInput.vue'
import { country, categoryName } from '../lib/regions.js'
import { useStickyBar } from '../lib/chrome.js'
import { t } from '../i18n/index.js'

const props = defineProps({
  initial: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  mode: { type: String, default: 'create' },
  submitLabel: { type: String, required: true },
  busy: { type: Boolean, default: false },
  submitError: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

useStickyBar(76)

const f = reactive({ tradeWhat: '', forWhat: '', description: '', category_id: '', location: '', area: '', topup: null, status: 'available', country: 'ZW', ...props.initial })
watch(
  () => props.initial,
  (v) => Object.assign(f, v),
)
const towns = computed(() => country(f.country).towns)
const errors = ref({})
const imageFile = ref(null)
const preview = ref(props.initial.image_url || '')

function onPhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return (errors.value.image = t('form.errImageType'))
  if (file.size > 20 * 1024 * 1024) return (errors.value.image = t('form.errImageSize'))
  errors.value.image = ''
  imageFile.value = file
  preview.value = URL.createObjectURL(file)
}

function submit() {
  const e = {}
  if (!f.tradeWhat.trim()) e.tradeWhat = t('form.errWhat')
  if (!f.forWhat.trim()) e.forWhat = t('form.errWants')
  if (!f.category_id) e.category_id = t('form.errCategory')
  if (!f.location) e.location = t('form.errTown')
  if (f.topup && !(f.topup.amount > 0)) e.topup = t('offer.errCash')
  errors.value = e
  if (Object.keys(e).length) {
    document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  emit('submit', { ...f, tradeWhat: f.tradeWhat.trim(), forWhat: f.forWhat.trim(), area: f.area.trim(), description: f.description.trim() }, imageFile.value)
}
</script>

<style scoped>
.form-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  margin: 0 -1rem;
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--color-page) 94%, transparent);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--color-border);
}
@media (min-width: 768px) {
  .form-bar {
    position: static;
    margin: 0;
    padding: 0;
    background: none;
    border: 0;
  }
}
</style>
