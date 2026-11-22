<template>
  <div class="mx-auto max-w-sm py-2 md:py-8">
    <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t('auth.joinTitle') }}</h1>
    <p class="mt-1 text-[var(--color-text-secondary)]">{{ $t('auth.joinSub') }}</p>

    <form class="mt-6 grid gap-4" novalidate @submit.prevent="handleRegister">
      <label>
        <span class="label">{{ $t('auth.name') }}</span>
        <input v-model="name" type="text" autocomplete="name" :placeholder="$t('auth.namePlaceholder')" required />
        <span v-if="errors.name" class="field-error block">{{ errors.name }}</span>
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label>
          <span class="label">{{ $t('prefs.country') }}</span>
          <select v-model="countryCode" @change="town = ''">
            <option v-for="c in COUNTRY_CODES" :key="c" :value="c">{{ $t(`country.${c}`) }}</option>
          </select>
        </label>
        <label>
          <span class="label">{{ $t('form.town') }}</span>
          <select v-model="town" required>
            <option value="" disabled>{{ $t('form.chooseTown') }}</option>
            <option v-for="tn in country(countryCode).towns" :key="tn" :value="tn">{{ tn }}</option>
          </select>
        </label>
      </div>
      <span v-if="errors.town" class="field-error -mt-2">{{ errors.town }}</span>
      <label>
        <span class="label">{{ $t('auth.whatsapp') }} <span class="font-normal text-[var(--color-text-light)]">({{ $t('common.optional') }})</span></span>
        <input v-model="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="077 123 4567" />
        <span class="hint block">{{ $t('auth.whatsappHint') }}</span>
      </label>
      <label>
        <span class="label">{{ $t('auth.email') }}</span>
        <input v-model.trim="email" type="email" autocomplete="email" inputmode="email" required />
        <span v-if="errors.email" class="field-error block">{{ errors.email }}</span>
      </label>
      <label>
        <span class="label">{{ $t('auth.password') }}</span>
        <span class="relative block">
          <input v-model="password" :type="show ? 'text' : 'password'" autocomplete="new-password" class="!pr-16" required />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-sm font-semibold text-[var(--color-text-secondary)]" @click="show = !show">{{ show ? $t('auth.hide') : $t('auth.show') }}</button>
        </span>
        <span class="hint block">{{ $t('auth.passwordHint') }}</span>
        <span v-if="errors.password" class="field-error block">{{ errors.password }}</span>
      </label>
      <p v-if="isDemo" class="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{{ $t('auth.demoPasswordNote') }}</p>
      <label class="flex items-start gap-3 text-sm">
        <input v-model="agree" type="checkbox" class="mt-0.5" />
        <span>
          {{ $t('auth.agreePrefix') }}
          <router-link to="/terms" target="_blank" class="font-medium underline">{{ $t('footer.terms') }}</router-link>,
          <router-link to="/privacy" target="_blank" class="font-medium underline">{{ $t('footer.privacy') }}</router-link>
          {{ $t('auth.and') }}
          <router-link to="/guidelines" target="_blank" class="font-medium underline">{{ $t('footer.guidelines') }}</router-link>.
        </span>
      </label>
      <span v-if="errors.agree" class="field-error -mt-2">{{ errors.agree }}</span>
      <p v-if="authError" class="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ authError }}</p>
      <button type="submit" class="btn btn-block" :disabled="isLoading">{{ isLoading ? $t('auth.creating') : $t('auth.create') }}</button>
    </form>

    <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
      {{ $t('auth.haveAccount') }} <router-link :to="{ path: '/login', query: $route.query }" class="font-semibold text-[var(--color-primary)]">{{ $t('auth.signIn') }}</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { COUNTRY_CODES, country, normalizePhone } from '../lib/regions.js'
import { prefs, t } from '../i18n/index.js'
import { track } from '../lib/track.js'

const router = useRouter()
const route = useRoute()
const isDemo = __DEMO__
const name = ref('')
const countryCode = ref(prefs.country)
const town = ref('')
const whatsapp = ref('')
const email = ref('')
const password = ref('')
const show = ref(false)
const agree = ref(false)
const errors = ref({})
const authError = ref('')
const isLoading = ref(false)

function validate() {
  const e = {}
  if (!name.value.trim()) e.name = t('auth.errName')
  if (!town.value) e.town = t('auth.errTown')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) e.email = t('auth.errEmail')
  if (password.value.length < 6) e.password = t('auth.errPassword')
  if (!agree.value) e.agree = t('auth.errAgree')
  errors.value = e
  return !Object.keys(e).length
}

async function handleRegister() {
  if (!validate()) return
  isLoading.value = true
  authError.value = ''
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await updateProfile(user, { displayName: name.value.trim() })
    await setDoc(doc(db, 'users', user.uid), {
      name: name.value.trim(),
      email: email.value,
      country: countryCode.value,
      town: town.value,
      area: '',
      bio: '',
      whatsapp: normalizePhone(whatsapp.value, countryCode.value),
      trades_completed: 0,
      is_admin: false,
      accepted_terms_at: serverTimestamp(),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    prefs.country = countryCode.value
    track('sign_up', { country: countryCode.value })
    router.push({ path: route.query.redirect || '/create-listing', query: { message: t('auth.welcome') } })
  } catch (error) {
    authError.value =
      {
        'auth/email-already-in-use': t('auth.errInUse'),
        'auth/invalid-email': t('auth.errEmail'),
        'auth/weak-password': t('auth.errPassword'),
      }[error.code] || t('auth.errGeneric')
  } finally {
    isLoading.value = false
  }
}
</script>
