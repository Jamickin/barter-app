<template>
  <div>
    <!-- Hero Section -->
    <div
      class="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-orange-400 text-white"
    >
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl font-bold mb-4">Trade What You Have For What You Need</h1>
        <p class="text-xl mb-8">No money needed. Just good old-fashioned bartering.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link
            to="/listings"
            class="inline-block px-6 py-3 bg-white text-orange-600 font-semibold rounded-md shadow hover:bg-orange-50 transition-colors"
          >
            Browse Listings
          </router-link>
          <router-link
            v-if="isAuthenticated"
            to="/create-listing"
            class="inline-block px-6 py-3 bg-orange-700 text-white font-semibold rounded-md shadow hover:bg-orange-800 transition-colors"
          >
            Create Listing
          </router-link>
          <router-link
            v-else
            to="/register"
            class="inline-block px-6 py-3 bg-orange-700 text-white font-semibold rounded-md shadow hover:bg-orange-800 transition-colors"
          >
            Sign Up Free
          </router-link>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12 text-zinc-800 dark:text-white">
          How Bartering Works
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div
              class="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-zinc-800 dark:text-white">List Your Item</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Create a listing for what you have and what you want in exchange.
            </p>
          </div>
          <!-- Step 2 -->
          <div class="text-center">
            <div
              class="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-zinc-800 dark:text-white">Connect & Chat</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Message potential traders and negotiate your exchange.
            </p>
          </div>
          <!-- Step 3 -->
          <div class="text-center">
            <div
              class="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-zinc-800 dark:text-white">Make the Trade</h3>
            <p class="text-zinc-600 dark:text-zinc-400">
              Meet up safely and exchange your items person-to-person.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Listings -->
    <div class="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-800">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold text-zinc-800 dark:text-white">Featured Listings</h2>
          <router-link to="/listings" class="text-orange-600 hover:text-orange-500">
            View All →
          </router-link>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
          ></div>
        </div>

        <!-- Listings grid -->
        <div v-else-if="featuredListings.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="listing in featuredListings"
            :key="listing.id"
            class="bg-white dark:bg-zinc-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <router-link :to="`/listing/${listing.id}`" class="block">
              <!-- Image if available -->
              <img
                v-if="listing.image_url"
                :src="listing.image_url"
                :alt="listing.tradeWhat"
                class="w-full h-48 object-cover"
              />
              <div
                v-else
                class="w-full h-48 bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div class="p-4">
                <!-- Status badge -->
                <div v-if="listing.status" class="mb-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClasses(listing.status)"
                  >
                    {{ getStatusText(listing.status) }}
                  </span>
                </div>

                <!-- Owner info -->
                <div class="flex items-center mb-3">
                  <div
                    class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs"
                  >
                    {{ getInitials(listing.owner?.name || '') }}
                  </div>
                  <span class="ml-2 text-sm text-zinc-600 dark:text-zinc-400">{{
                    listing.owner?.name
                  }}</span>
                </div>

                <!-- Listing details -->
                <h3 class="text-lg font-semibold mb-1 text-zinc-800 dark:text-white">
                  {{ listing.tradeWhat }}
                </h3>
                <div class="text-sm text-zinc-600 dark:text-zinc-400">
                  for <span class="font-medium text-orange-600">{{ listing.forWhat }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12 bg-white dark:bg-zinc-700 rounded-xl shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-zinc-800 dark:text-white">No listings yet</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Be the first to create a listing!</p>
          <div class="mt-6">
            <router-link
              to="/create-listing"
              class="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md"
            >
              Create Listing
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-800 dark:bg-zinc-900 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Start Bartering?</h2>
        <p class="text-lg mb-8 text-zinc-300">
          Join thousands of people trading goods and services without spending a dime.
        </p>
        <router-link
          to="/register"
          class="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-md shadow hover:bg-orange-500 transition-colors"
        >
          Create Your Account
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '../firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

// State
const isLoading = ref(true)
const featuredListings = ref([])
const isAuthenticated = computed(() => !!auth.currentUser)

// Get featured listings
onMounted(async () => {
  try {
    // Query for available listings, with images first, limited to 6
    const listingsQuery = query(
      collection(db, 'listings'),
      where('status', '==', 'available'),
      orderBy('created_at', 'desc'),
      limit(6),
    )

    const listingsSnapshot = await getDocs(listingsQuery)

    // Process listings
    const listingsData = []
    for (const doc of listingsSnapshot.docs) {
      const listingData = doc.data()

      // Add to listings list
      listingsData.push({
        id: doc.id,
        ...listingData,
        created_at: listingData.created_at?.toDate() || new Date(),
        updated_at: listingData.updated_at?.toDate() || new Date(),
      })
    }

    // Sort to prioritize listings with images
    featuredListings.value = listingsData.sort((a, b) => {
      if (a.image_url && !b.image_url) return -1
      if (!a.image_url && b.image_url) return 1
      return 0
    })
  } catch (error) {
    console.error('Error fetching featured listings:', error)
  } finally {
    isLoading.value = false
  }
})

// Helper functions
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

const getStatusText = (status) => {
  const statusMap = {
    available: 'Available',
    pending: 'Pending',
    completed: 'Completed',
  }
  return statusMap[status] || 'Unknown'
}

const getStatusClasses = (status) => {
  const classMap = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  }
  return classMap[status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300'
}
</script>
