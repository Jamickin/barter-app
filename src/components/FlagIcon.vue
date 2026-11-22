<template>
  <!-- Simplified flags as SVG: Windows doesn't render flag emoji, so these look the same everywhere. -->
  <svg viewBox="0 0 30 20" class="inline-block rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.08)]" :style="{ width: size + 'px', height: (size * 2) / 3 + 'px' }" role="img" :aria-label="code">
    <template v-if="code === 'ZW'">
      <rect width="30" height="20" fill="#319208" />
      <rect y="2.857" width="30" height="2.857" fill="#ffd200" />
      <rect y="5.714" width="30" height="2.857" fill="#de2010" />
      <rect y="8.571" width="30" height="2.857" fill="#000" />
      <rect y="11.43" width="30" height="2.857" fill="#de2010" />
      <rect y="14.29" width="30" height="2.857" fill="#ffd200" />
      <path d="M0 0 L11.5 10 L0 20 Z" fill="#000" />
      <path d="M0 0.8 L10.6 10 L0 19.2 Z" fill="#fff" />
      <path d="M4.5 7.2 l0.75 2.2 h2.3 l-1.85 1.35 l0.7 2.2 l-1.9 -1.35 l-1.9 1.35 l0.7 -2.2 l-1.85 -1.35 h2.3 Z" fill="#de2010" />
    </template>
    <template v-else-if="code === 'ZA'">
      <rect width="30" height="10" fill="#e03c31" />
      <rect y="10" width="30" height="10" fill="#001489" />
      <path d="M0 0 L12 10 L0 20 Z M0 0 h5 L17 8.3 H30 V11.7 H17 L5 20 H0 Z" fill="#fff" />
      <path d="M0 1.6 L10.4 10 L0 18.4 Z M0 0 h3 L15.5 8.9 H30 V11.1 H15.5 L3 20 H0 Z" fill="#007749" />
      <path d="M0 3.4 L8.2 10 L0 16.6 Z" fill="#ffb81c" />
      <path d="M0 4.8 L6.6 10 L0 15.2 Z" fill="#000" />
    </template>
  </svg>
</template>

<script setup>
defineProps({ code: { type: String, required: true }, size: { type: Number, default: 20 } })
</script>
