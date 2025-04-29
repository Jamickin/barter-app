<template>
  <div
    class="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden p-6 mt-8"
  >
    <h1 class="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-white">Sign In</h1>

    <form @submit.prevent="handleLogin">
      <!-- Email Field -->
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          placeholder="your@email.com"
        />
        <p v-if="emailError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ emailError }}
        </p>
      </div>

      <!-- Password Field -->
      <div class="mb-6">
        <label
          for="password"
          class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          placeholder="********"
        />
        <p v-if="passwordError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ passwordError }}
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="authError"
        class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md"
      >
        {{ authError }}
      </div>

      <!-- Submit Button -->
      <div class="flex items-center justify-between">
        <button
          type="submit"
          class="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </div>
    </form>

    <!-- Register Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        Don't have an account?
        <router-link to="/register" class="text-orange-600 hover:text-orange-500 font-medium">
          Sign up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const router = useRouter()
const route = useRoute()

// Form data
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const authError = ref('')
const isLoading = ref(false)

// Validate form
const validateForm = () => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''

  // Validate email
  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }

  // Validate password
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  }

  return isValid
}

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  authError.value = ''

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)

    // Redirect to intended page or listings
    const redirectPath = route.query.redirect || '/listings'
    router.push({
      path: redirectPath,
      query: { message: 'Successfully signed in!' },
    })
  } catch (error) {
    console.error('Login error:', error)

    // Handle Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        authError.value = 'Invalid email or password'
        break
      case 'auth/too-many-requests':
        authError.value = 'Too many failed login attempts. Please try again later.'
        break
      case 'auth/user-disabled':
        authError.value = 'This account has been disabled'
        break
      default:
        authError.value = 'An error occurred during sign in. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
