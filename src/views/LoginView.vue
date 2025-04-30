<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="card-title">Sign In</h1>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="your@email.com" />
          <p v-if="emailError" class="form-error">
            {{ emailError }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <div class="password-header">
            <label for="password">Password</label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          <input id="password" v-model="password" type="password" required placeholder="********" />
          <p v-if="passwordError" class="form-error">
            {{ passwordError }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="authError" class="auth-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="error-icon"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {{ authError }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner">
            <svg class="spinner-icon" viewBox="0 0 24 24">
              <circle
                class="spinner-circle"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                fill="none"
                stroke-width="4"
              ></circle>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Register Link -->
      <div class="register-link">
        <p>
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>
      </div>
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

<style scoped>
.login-container {
  max-width: 28rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.login-card {
  background-color: var(--color-background);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px var(--color-shadow);
  padding: 2rem;
  overflow: hidden;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text-main);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--color-text-main);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 0.875rem;
  color: var(--color-primary);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background-color: var(--color-background);
  color: var(--color-text-main);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.auth-error {
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #fee2e2;
  color: #b91c1c;
  display: flex;
  align-items: flex-start;
}

.error-icon {
  margin-right: 0.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-weight: 600;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
}

.spinner-circle {
  opacity: 0.25;
}

.spinner-circle:nth-child(1) {
  opacity: 0.75;
  stroke-dasharray: 62.83;
  stroke-dashoffset: 62.83;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 62.83;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -62.83;
  }
}

.register-link {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.register-link a {
  font-weight: 600;
  color: var(--color-primary);
}

.register-link a:hover {
  color: var(--color-primary-hover);
}
</style>
