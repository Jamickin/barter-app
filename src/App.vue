<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
    <!-- Header -->
    <header
      class="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 shadow-sm"
    >
      <div class="container mx-auto px-4">
        <nav class="py-4 flex items-center justify-between">
          <!-- Logo/Brand -->
          <div>
            <h1 class="text-2xl font-bold">
              <router-link to="/" class="text-orange-600 hover:text-orange-500">
                BARTER
              </router-link>
            </h1>
          </div>

          <!-- Authenticated Nav -->
          <div v-if="user" class="flex items-center gap-4">
            <!-- User Profile Link -->
            <router-link :to="`/profile/${user.uid}`" class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs uppercase"
              >
                {{ userInitials }}
              </div>
              <span class="text-sm text-zinc-600 dark:text-zinc-400">{{ user.displayName }}</span>
            </router-link>

            <!-- Messages Link -->
            <router-link
              to="/messages"
              class="relative bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-3 rounded-lg"
            >
              <span>Messages</span>
              <span
                v-if="unreadMessages > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
              >
                {{ unreadMessages > 9 ? '9+' : unreadMessages }}
              </span>
            </router-link>

            <!-- New Listing Button -->
            <router-link
              to="/create-listing"
              class="bg-orange-600 hover:bg-orange-500 text-white py-2 px-3 rounded-lg"
            >
              + New Listing
            </router-link>

            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Logout
            </button>
          </div>

          <!-- Guest Nav -->
          <div v-else class="flex gap-4 items-center">
            <router-link
              to="/login"
              class="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-3 rounded-lg"
            >
              Sign In
            </router-link>
            <router-link
              to="/register"
              class="bg-orange-600 hover:bg-orange-500 text-white py-2 px-3 rounded-lg"
            >
              Register
            </router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto p-4 flex-grow">
      <!-- Flash Message -->
      <div
        v-if="flashMessage"
        class="mb-6 border rounded-md shadow-sm border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900 p-4 fade-in flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-green-500 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        {{ flashMessage }}
      </div>

      <!-- Router View with Transition -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12"
    >
      <div class="container mx-auto px-4">
        <div class="text-center text-zinc-500 dark:text-zinc-400 text-sm">
          © {{ new Date().getFullYear() }} Barter. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const flashMessage = ref('')
const unreadMessages = ref(0)

// Get user initials for avatar
const userInitials = computed(() => {
  if (!user.value?.displayName) return '?'

  const nameParts = user.value.displayName.split(' ')
  return (nameParts[0]?.[0] || '') + (nameParts[1]?.[0] || '')
})

// Listen for auth state changes
onAuthStateChanged(auth, async (userData) => {
  user.value = userData

  if (userData) {
    // Fetch unread messages count
    await fetchUnreadMessages()
  }
})

// Watch for route changes to display flash messages
watch(
  () => route.query,
  (query) => {
    if (query.message) {
      flashMessage.value = query.message

      // Clear flash message after 5 seconds
      setTimeout(() => {
        flashMessage.value = ''
      }, 5000)

      // Remove message from URL
      const { message, ...rest } = route.query
      router.replace({ query: { ...rest } })
    }
  },
  { immediate: true },
)

// Fetch unread messages count
async function fetchUnreadMessages() {
  if (!user.value) return

  try {
    const q = query(
      collection(db, 'messages'),
      where('to_user_id', '==', user.value.uid),
      where('read', '==', false),
    )

    const querySnapshot = await getDocs(q)
    unreadMessages.value = querySnapshot.size
  } catch (error) {
    console.error('Error fetching unread messages:', error)
  }
}

// Handle logout
async function handleLogout() {
  try {
    await signOut(auth)
    router.push('/login?message=Successfully logged out')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Set up polling for unread messages
let messageInterval

onMounted(() => {
  messageInterval = setInterval(() => {
    if (user.value) {
      fetchUnreadMessages()
    }
  }, 60000) // Check every minute
})

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
})
</script>

<style>
/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
