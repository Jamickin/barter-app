<template>
  <div class="bg-zinc-900 text-zinc-200 text-[13px]">
    <div class="container flex h-10 items-center gap-3">
      <span class="inline-flex items-center gap-1.5 font-semibold text-zinc-400 shrink-0">
        <span class="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse"></span>{{ $t('demo.label') }}
      </span>
      <span class="truncate text-zinc-400 hidden sm:block">{{ $t('demo.explain') }}</span>
      <span class="ml-auto flex items-center gap-1.5 shrink-0">
        <button v-if="!uid" type="button" class="demo-btn demo-btn-primary" @click="signIn">{{ $t('demo.tryAs', { name: 'Tendai' }) }}</button>
        <label v-else class="relative">
          <span class="sr-only">{{ $t('demo.switch') }}</span>
          <select class="demo-select" :value="uid" @change="switchTo($event.target.value)">
            <option v-for="p in people" :key="p.id" :value="p.id">{{ $t('demo.playingAs', { name: p.name.split(' ')[0] }) }}</option>
            <option v-if="!people.some((p) => p.id === uid)" :value="uid">{{ $t('demo.playingAs', { name: $t('demo.you') }) }}</option>
          </select>
        </label>
        <button type="button" class="demo-btn" :title="$t('demo.reset')" @click="reset">↺<span class="hidden sm:inline">&nbsp;{{ $t('demo.reset') }}</span></button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, onAuthStateChanged, demoSignInAs } from '../demo/auth.js'
import { resetDemo } from '../demo/db.js'
import { PEOPLE, DEMO_USER_ID } from '../demo/seed.js'
import { t } from '../i18n/index.js'

const router = useRouter()
const people = PEOPLE
const uid = ref(auth.currentUser?.uid || null)
const stop = onAuthStateChanged(auth, (u) => (uid.value = u?.uid || null))
onUnmounted(stop)

function signIn() {
  demoSignInAs(DEMO_USER_ID)
  router.push({ path: '/listings', query: { message: t('demo.welcome', { name: 'Tendai' }) } })
}

function switchTo(id) {
  demoSignInAs(id)
  const name = PEOPLE.find((p) => p.id === id)?.name.split(' ')[0] || t('demo.you')
  router.push({ path: '/messages', query: { message: t('demo.nowPlaying', { name }) } })
}

function reset() {
  if (!confirm(t('demo.resetConfirm'))) return
  resetDemo()
  location.href = '/'
}
</script>

<style scoped>
.demo-btn {
  height: 28px;
  border: 1px solid #3f3f46;
  color: #e4e4e7;
  border-radius: 8px;
  padding: 0 10px;
  white-space: nowrap;
}
.demo-btn:hover {
  background: #27272a;
}
.demo-btn-primary {
  background: #fafafa;
  border-color: #fafafa;
  color: #18181b;
  font-weight: 600;
}
.demo-select {
  min-height: 28px;
  height: 28px;
  width: auto;
  max-width: 11rem;
  padding: 0 26px 0 10px;
  font-size: 13px;
  border-radius: 8px;
  background-color: #27272a;
  color: #e4e4e7;
  border: 1px solid #3f3f46;
}
</style>
