<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
    <div class="text-orange-600 dark:text-orange-500 text-9xl font-bold">404</div>

    <h1 class="mt-4 text-3xl font-bold tracking-tight text-zinc-800 dark:text-white sm:text-5xl">
      Page not found
    </h1>

    <p class="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400 text-center max-w-md">
      Sorry, we couldn't find the page you're looking for. It might have been removed or the link
      may be broken.
    </p>

    <div class="mt-10 flex items-center justify-center gap-x-6">
      <router-link
        to="/"
        class="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        Go back home
      </router-link>

      <router-link
        to="/listings"
        class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-500"
      >
        Browse listings <span aria-hidden="true">&rarr;</span>
      </router-link>
    </div>
  </div>
</template>
