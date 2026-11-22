<template>
  <div class="mx-auto max-w-sm py-2 md:py-8">
    <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t('auth.signInTitle') }}</h1>
    <p class="mt-1 text-[var(--color-text-secondary)]">{{ $t('auth.signInSub') }}</p>

    <div v-if="isDemo" class="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/60 dark:bg-orange-950/30">
      <p class="text-sm"><strong>{{ $t('auth.demoTitle') }}</strong> {{ $t('auth.demoText') }}</p>
      <button type="button" class="btn btn-block mt-3" @click="demoSignIn">{{ $t('demo.tryAs', { name: 'Tendai' }) }}</button>
    </div>

    <div v-if="isDemo" class="my-6 flex items-center gap-3 text-xs text-[var(--color-text-light)]"><span class="h-px flex-1 bg-[var(--color-border)]"></span>{{ $t('auth.or') }}<span class="h-px flex-1 bg-[var(--color-border)]"></span></div>

    <form class="grid gap-4" :class="{ 'mt-6': !isDemo }" novalidate @submit.prevent="handleLogin">
      <label>
        <span class="label">{{ $t('auth.email') }}</span>
        <input v-model.trim="email" type="email" autocomplete="email" inputmode="email" required />
      </label>
      <label>
        <span class="label">{{ $t('auth.password') }}</span>
        <span class="relative block">
          <input v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" class="!pr-16" required />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-sm font-semibold text-[var(--color-text-secondary)]" @click="show = !show">{{ show ? $t('auth.hide') : $t('auth.show') }}</button>
        </span>
      </label>
      <p v-if="authError" class="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ authError }}</p>
      <button type="submit" class="btn btn-block" :disabled="isLoading">{{ isLoading ? $t('auth.signingIn') : $t('auth.signIn') }}</button>
    </form>

    <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
      {{ $t('auth.noAccount') }} <router-link :to="{ path: '/register', query: $route.query }" class="font-semibold text-[var(--color-primary)]">{{ $t('auth.createOne') }}</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { t } from '../i18n/index.js'

const router = useRouter()
const route = useRoute()
const isDemo = __DEMO__
const email = ref('')
const password = ref('')
const show = ref(false)
const authError = ref('')
const isLoading = ref(false)
const next = () => route.query.redirect || '/listings'

async function demoSignIn() {
  const { demoSignInAs } = await import('../demo/auth.js')
  const { DEMO_USER_ID } = await import('../demo/seed.js')
  demoSignInAs(DEMO_USER_ID)
  router.push({ path: next(), query: { message: t('demo.welcome', { name: 'Tendai' }) } })
}

async function handleLogin() {
  if (!email.value || !password.value) return (authError.value = t('auth.errMissing'))
  isLoading.value = true
  authError.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push({ path: next(), query: { message: t('auth.welcomeBack') } })
  } catch (error) {
    authError.value =
      {
        'auth/invalid-credential': t('auth.errCredentials'),
        'auth/user-not-found': t('auth.errCredentials'),
        'auth/wrong-password': t('auth.errCredentials'),
        'auth/too-many-requests': t('auth.errTooMany'),
      }[error.code] || t('auth.errGeneric')
  } finally {
    isLoading.value = false
  }
}
</script>
