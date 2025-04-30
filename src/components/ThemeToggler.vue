<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun icon (shown in dark mode) -->
    <svg
      v-if="isDarkTheme"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>

    <!-- Moon icon (shown in light mode) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDarkTheme = ref(false)

// Initialize theme based on user preference or stored value
onMounted(() => {
  // Check if there's a stored preference
  const storedTheme = localStorage.getItem('theme')

  // If a preference is stored, use that
  if (storedTheme === 'dark') {
    isDarkTheme.value = true
    document.documentElement.classList.add('dark-theme')
  } else if (storedTheme === 'light') {
    isDarkTheme.value = false
    document.documentElement.classList.remove('dark-theme')
  } else {
    // Otherwise, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkTheme.value = prefersDark

    if (prefersDark) {
      document.documentElement.classList.add('dark-theme')
    }
  }
})

// Toggle between light and dark theme
function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value

  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background-color: #f4f4f5;
  color: #18181b;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    transform 0.1s;
}

.dark-theme .theme-toggle {
  background-color: #3f3f46;
  color: #f9fafb;
}

.theme-toggle:hover {
  background-color: #e4e4e7;
}

.dark-theme .theme-toggle:hover {
  background-color: #52525b;
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>
