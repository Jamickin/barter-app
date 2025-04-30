<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <!-- Logo/Brand -->
          <div class="logo">
            <h1>
              <router-link to="/">BARTER</router-link>
            </h1>
          </div>

          <!-- Authenticated Nav -->
          <div v-if="user" class="nav-links">
            <!-- Theme Toggler -->
            <ThemeToggler />

            <!-- User Profile Link -->
            <router-link :to="`/profile/${user.uid}`" class="user-profile">
              <div class="avatar">
                {{ userInitials }}
              </div>
              <span>{{ user.displayName }}</span>
            </router-link>

            <!-- Messages Link -->
            <router-link to="/messages" class="nav-link messages-link">
              <span>Messages</span>
              <span v-if="unreadMessages > 0" class="badge">
                {{ unreadMessages > 9 ? '9+' : unreadMessages }}
              </span>
            </router-link>

            <!-- New Listing Button -->
            <router-link to="/create-listing" class="btn"> + New Listing </router-link>

            <!-- Logout Button -->
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>

          <!-- Guest Nav -->
          <div v-else class="nav-links">
            <!-- Theme Toggler -->
            <ThemeToggler />

            <router-link to="/login" class="btn btn-secondary"> Sign In </router-link>
            <router-link to="/register" class="btn"> Register </router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Flash Message -->
        <div v-if="flashMessage" class="flash-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="message-icon"
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
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="copyright">© {{ new Date().getFullYear() }} Barter. All rights reserved.</div>
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
import ThemeToggler from './components/ThemeToggler.vue'

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
/* App Layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px var(--color-shadow);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
}

.logo a {
  color: var(--color-primary);
  font-weight: bold;
  transition: color 0.2s;
}

.logo a:hover {
  color: var(--color-primary-hover);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #ffedd5;
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.messages-link {
  position: relative;
  padding: 0.5rem 0.75rem;
  background-color: #52525b;
  color: white;
  border-radius: 0.375rem;
}

.badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.logout-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.logout-btn:hover {
  color: var(--color-text-main);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1rem 0;
}

/* Flash Message */
.flash-message {
  margin-bottom: 1.5rem;
  border-radius: 0.375rem;
  background-color: #ecfdf5;
  padding: 1rem;
  display: flex;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
  border: 1px solid #d1fae5;
}

.message-icon {
  color: #059669;
  margin-right: 0.5rem;
}

/* Footer */
.footer {
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 0;
  margin-top: 3rem;
}

.copyright {
  font-size: 0.875rem;
  color: var(--color-text-light);
  text-align: center;
}

/* Responsive styles */
@media (max-width: 768px) {
  .nav-links {
    gap: 0.5rem;
  }

  .user-profile span {
    display: none;
  }
}
</style>
