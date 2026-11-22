<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(d, i) in categoryPaths(id)" :key="i" :d="d" />
  </svg>
</template>

<script setup>
import { categoryPaths } from '../lib/icons.js'
defineProps({ id: { type: String, default: 'other' } })
</script>
