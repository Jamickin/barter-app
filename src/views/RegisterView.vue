<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="card-title">Create Account</h1>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="name" type="text" required placeholder="John Doe" />
          <p v-if="nameError" class="form-error">
            {{ nameError }}
          </p>
        </div>

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
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required placeholder="********" />
          <p v-if="passwordError" class="form-error">
            {{ passwordError }}
          </p>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="********"
          />
          <p v-if="confirmPasswordError" class="form-error">
            {{ confirmPasswordError }}
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
            Creating account...
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Agreement Text -->
      <div class="agreement-text">
        By creating an account, you agree to our
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>

      <!-- Login Link -->
      <div class="login-link">
        <p>
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </p>
      </div>
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

<style scoped>
.register-container {
  max-width: 28rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.register-card {
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

.register-form {
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

.dark-theme .auth-error {
  background-color: rgba(185, 28, 28, 0.2);
  color: #f87171;
}

.error-icon {
  margin-right: 0.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.agreement-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.agreement-text a {
  color: var(--color-primary);
  text-decoration: none;
}

.agreement-text a:hover {
  text-decoration: underline;
}

.login-link {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.login-link a {
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.login-link a:hover {
  color: var(--color-primary-hover);
}
</style>
= 'This email is already in use' break case 'auth/invalid-email': authError.value = 'Invalid email
address' break case 'auth/weak-password': authError.value
