<template>
  <div class="mx-auto max-w-sm py-12 text-center">
    
    <h1 class="mt-4 text-2xl font-extrabold">{{ $t('notFound.title') }}</h1>
    <p class="mt-2 text-[var(--color-text-secondary)]">{{ $t('notFound.text') }}</p>
    <div class="mt-6 flex flex-col gap-2">
      <router-link to="/listings" class="btn">{{ $t('home.browseCta') }}</router-link>
      <router-link to="/" class="btn-secondary">{{ $t('nav.home') }}</router-link>
    </div>
  </div>
</template>
