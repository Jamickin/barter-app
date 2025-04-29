<template>
  <div
    class="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden p-6 mt-8"
  >
    <h1 class="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-white">Sign Up</h1>

    <form @submit.prevent="handleRegister">
      <!-- Name Field -->
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Full Name
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          placeholder="John Doe"
        />
        <p v-if="nameError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ nameError }}
        </p>
      </div>

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
      <div class="mb-4">
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

      <!-- Confirm Password Field -->
      <div class="mb-6">
        <label
          for="confirmPassword"
          class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          placeholder="********"
        />
        <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ confirmPasswordError }}
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
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </div>
    </form>

    <!-- Login Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?
        <router-link to="/login" class="text-orange-600 hover:text-orange-500 font-medium">
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const router = useRouter()

// Form data
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Form validation
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const authError = ref('')
const isLoading = ref(false)

// Validate form
const validateForm = () => {
  let isValid = true
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validate name
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    isValid = false
  }

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
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    isValid = false
  }

  // Validate confirm password
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

// Handle registration
const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  authError.value = ''

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Update user profile with name
    await updateProfile(user, {
      displayName: name.value,
    })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name.value,
      email: email.value,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      is_admin: false,
      // Add other user fields as needed
    })

    // Redirect to home page with success message
    router.push({
      path: '/listings',
      query: { message: 'Account created successfully! Welcome to Barter.' },
    })
  } catch (error) {
    console.error('Registration error:', error)

    // Handle Firebase auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        authError.value = 'This email is already in use'
        break
      case 'auth/invalid-email':
        authError.value = 'Invalid email address'
        break
      case 'auth/weak-password':
        authError.value = 'Password is too weak'
        break
      default:
        authError.value = 'An error occurred during registration. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
