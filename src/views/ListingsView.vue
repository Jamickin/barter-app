<template>
  <div class="listings-page">
    <h1 class="page-title">Listings</h1>

    <!-- Search and filter -->
    <div class="search-card">
      <form @submit.prevent="applyFilters">
        <div class="search-form">
          <!-- Search input -->
          <div class="search-input-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for items to trade..."
              class="search-input"
            />
          </div>

          <!-- Category filter -->
          <div class="category-filter">
            <select v-model="selectedCategory" class="category-select">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Search buttons -->
          <div class="search-buttons">
            <button type="submit" class="btn search-btn">Search</button>
            <button
              v-if="hasFilters"
              @click="resetFilters"
              type="button"
              class="btn btn-secondary clear-btn"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Active filters info -->
    <div v-if="hasFilters" class="active-filters">
      <span v-if="searchQuery">
        Search results for:
        <strong>{{ searchQuery }}</strong>
      </span>
      <span v-if="searchQuery && selectedCategory"> | </span>
      <span v-if="selectedCategory">
        Category:
        <strong>{{ getCategoryName(selectedCategory) }}</strong>
      </span>
      <span v-if="listings.length === 0"> - No results found</span>
      <span v-else> - {{ listings.length }} results found</span>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Listings grid -->
    <div v-else-if="listings.length > 0" class="listings-grid">
      <div v-for="listing in listings" :key="listing.id" class="listing-card">
        <!-- Listing card content -->
        <router-link :to="`/listing/${listing.id}`" class="listing-link">
          <!-- Image if available -->
          <img
            v-if="listing.image_url"
            :src="listing.image_url"
            :alt="listing.tradeWhat"
            class="listing-image"
          />
          <div v-else class="listing-image-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div class="listing-content">
            <!-- Status badge -->
            <div v-if="listing.status" class="status-badge" :class="listing.status">
              {{ getStatusText(listing.status) }}
            </div>

            <!-- Owner info -->
            <div class="listing-owner">
              <div class="owner-avatar">
                {{ getInitials(listing.owner?.name || '') }}
              </div>
              <span class="owner-name">{{ listing.owner?.name }}</span>

              <!-- Category -->
              <span v-if="listing.category_id" class="category-tag">
                {{ getCategoryName(listing.category_id) }}
              </span>
            </div>

            <!-- Listing details -->
            <h3 class="listing-title">
              {{ listing.tradeWhat }}
            </h3>
            <div class="listing-subtext">
              for <span class="for-what">{{ listing.forWhat }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
      <h3>No listings found</h3>
      <p>Try different search terms or clear your filters</p>
    </div>

    <!-- Load more button -->
    <div v-if="hasMoreListings" class="load-more">
      <button
        @click="loadMoreListings"
        class="btn btn-secondary load-more-btn"
        :disabled="isLoadingMore"
      >
        <span v-if="isLoadingMore" class="loading-spinner">
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
          Loading...
        </span>
        <span v-else>Load more listings</span>
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
</script>

<style scoped>
.listings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 1.5rem;
  color: var(--color-text-main);
}

.search-card {
  background-color: var(--color-background);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--color-shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-input-container {
  flex: 3 1 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.category-filter {
  flex: 1 1 200px;
}

.category-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.search-buttons {
  display: flex;
  gap: 0.5rem;
}

.search-btn {
  background-color: var(--color-primary);
  color: white;
  white-space: nowrap;
}

.clear-btn {
  background-color: #52525b;
  white-space: nowrap;
}

.active-filters {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  background-color: #f4f4f5;
  color: var(--color-text-secondary);
}

.dark-theme .active-filters {
  background-color: #27272a;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 0.25rem solid rgba(234, 88, 12, 0.1);
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.listing-card {
  background-color: var(--color-background);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--color-shadow);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.listing-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 6px 12px var(--color-shadow);
}

.listing-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.listing-image,
.listing-image-placeholder {
  width: 100%;
  height: 12rem;
  object-fit: cover;
}

.listing-image-placeholder {
  background-color: #e4e4e7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.dark-theme .listing-image-placeholder {
  background-color: #3f3f46;
  color: #71717a;
}

.listing-content {
  padding: 1rem;
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.available {
  background-color: #d1fae5;
  color: #065f46;
}

.pending {
  background-color: #ffedd5;
  color: #9a3412;
}

.completed {
  background-color: #dbeafe;
  color: #1e40af;
}

.dark-theme .available {
  background-color: rgba(6, 95, 70, 0.2);
  color: #34d399;
}

.dark-theme .pending {
  background-color: rgba(154, 52, 18, 0.2);
  color: #fb923c;
}

.dark-theme .completed {
  background-color: rgba(30, 64, 175, 0.2);
  color: #60a5fa;
}

.listing-owner {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.owner-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #ffedd5;
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.dark-theme .owner-avatar {
  background-color: rgba(194, 65, 12, 0.2);
  color: #fb923c;
}

.owner-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-tag {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #f4f4f5;
  color: var(--color-text-secondary);
  border-radius: 0.25rem;
}

.dark-theme .category-tag {
  background-color: #27272a;
  color: #d4d4d8;
}

.listing-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-main);
}

.listing-subtext {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.for-what {
  font-weight: 600;
  color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-background);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.empty-state svg {
  margin: 0 auto 1rem;
  color: #a1a1aa;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.empty-state p {
  color: var(--color-text-secondary);
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 0.75rem 1.5rem;
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

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }

  .search-buttons {
    justify-content: flex-end;
  }

  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
