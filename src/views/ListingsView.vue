<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Listings</h1>

    <!-- Search and filter -->
    <div class="mb-8 w-full">
      <form @submit.prevent="applyFilters">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search input -->
          <div class="flex-grow">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for items to trade..."
              class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            />
          </div>

          <!-- Category filter -->
          <div class="w-full md:w-1/3">
            <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Search buttons -->
          <div class="flex gap-2">
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md whitespace-nowrap"
            >
              Search
            </button>
            <button
              v-if="hasFilters"
              @click="resetFilters"
              type="button"
              class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Active filters info -->
    <div v-if="hasFilters" class="mb-4 text-zinc-600 dark:text-zinc-400">
      <span v-if="searchQuery">
        Search results for:
        <span class="font-bold">{{ searchQuery }}</span>
      </span>
      <span v-if="searchQuery && selectedCategory"> | </span>
      <span v-if="selectedCategory">
        Category:
        <span class="font-bold">{{ getCategoryName(selectedCategory) }}</span>
      </span>
      <span v-if="listings.length === 0"> - No results found</span>
      <span v-else> - {{ listings.length }} results found</span>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
      ></div>
    </div>

    <!-- Listings grid -->
    <div
      v-else-if="listings.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <div
        v-for="listing in listings"
        :key="listing.id"
        class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <!-- Listing card content -->
        <router-link :to="`/listing/${listing.id}`" class="block">
          <!-- Image if available -->
          <img
            v-if="listing.image_url"
            :src="listing.image_url"
            :alt="listing.tradeWhat"
            class="w-full h-48 object-cover"
          />

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

              <!-- Category -->
              <span
                v-if="listing.category_id"
                class="ml-auto text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md"
              >
                {{ getCategoryName(listing.category_id) }}
              </span>
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
    <div v-else class="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-zinc-800 dark:text-white">No listings found</h3>
      <p class="mt-2 text-zinc-600 dark:text-zinc-400">
        Try different search terms or clear your filters
      </p>
    </div>

    <!-- Load more button -->
    <div v-if="hasMoreListings" class="mt-8 text-center">
      <button
        @click="loadMoreListings"
        class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md"
        :disabled="isLoadingMore"
      >
        <span v-if="isLoadingMore">Loading...</span>
        <span v-else>Load more</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

// State
const listings = ref([])
const categories = ref([])
const lastDoc = ref(null)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMoreListings = ref(false)
const searchQuery = ref(route.query.search || '')
const selectedCategory = ref(route.query.category || '')

// Computed properties
const hasFilters = computed(() => {
  return searchQuery.value || selectedCategory.value
})

// Fetch categories
onMounted(async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'))
    categories.value = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Initial listings fetch
    fetchListings()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

// Fetch listings with filters
async function fetchListings(loadMore = false) {
  try {
    if (!loadMore) {
      isLoading.value = true
      listings.value = []
      lastDoc.value = null
    } else {
      isLoadingMore.value = true
    }

    // Build query
    let q = collection(db, 'listings')
    const constraints = []

    // Apply filters
    if (searchQuery.value) {
      // Simple search implementation - Firebase doesn't support complex text search
      // For a better search, consider using Algolia or another search service
      const searchTerm = searchQuery.value.toLowerCase()
      constraints.push(where('tradeWhat_lower', '>=', searchTerm))
      constraints.push(where('tradeWhat_lower', '<=', searchTerm + '\uf8ff'))
    }

    if (selectedCategory.value) {
      constraints.push(where('category_id', '==', selectedCategory.value))
    }

    // Add sorting
    constraints.push(orderBy('created_at', 'desc'))

    // Add pagination
    constraints.push(limit(9))

    if (loadMore && lastDoc.value) {
      constraints.push(startAfter(lastDoc.value))
    }

    // Execute query
    q = query(q, ...constraints)
    const querySnapshot = await getDocs(q)

    // Update last document for pagination
    const docs = querySnapshot.docs
    if (docs.length > 0) {
      lastDoc.value = docs[docs.length - 1]
      hasMoreListings.value = docs.length === 9 // If we got a full page, there might be more
    } else {
      hasMoreListings.value = false
    }

    // Process results
    const fetchedListings = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    }))

    if (loadMore) {
      listings.value = [...listings.value, ...fetchedListings]
    } else {
      listings.value = fetchedListings
    }
  } catch (error) {
    console.error('Error fetching listings:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load more listings
function loadMoreListings() {
  if (!isLoadingMore.value && hasMoreListings.value) {
    fetchListings(true)
  }
}

// Apply filters
function applyFilters() {
  // Update URL with filters
  router.push({
    query: {
      ...(searchQuery.value ? { search: searchQuery.value } : {}),
      ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
    },
  })

  // Reset pagination and fetch with new filters
  fetchListings()
}

// Reset filters
function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  router.push({ query: {} })
  fetchListings()
}

// Helper functions
function getCategoryName(categoryId) {
  const category = categories.value.find((c) => c.id === categoryId)
  return category ? category.name : 'Unknown'
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

function getStatusText(status) {
  const statusMap = {
    available: 'Available',
    pending: 'Pending',
    completed: 'Completed',
  }
  return statusMap[status] || 'Unknown'
}

function getStatusClasses(status) {
  const classMap = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  }
  return classMap[status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300'
}
</script>
