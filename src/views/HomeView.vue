<template>
  <div>
    <!-- Hero Section -->
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Trade What You Have For What You Need</h1>
          <p>No money needed. Just good old-fashioned bartering.</p>
          <div class="hero-buttons">
            <router-link to="/listings" class="btn btn-white"> Browse Listings </router-link>
            <router-link v-if="isAuthenticated" to="/create-listing" class="btn btn-dark">
              Create Listing
            </router-link>
            <router-link v-else to="/register" class="btn btn-dark"> Sign Up Free </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="how-it-works">
      <div class="container">
        <h2 class="section-title">How Bartering Works</h2>
        <div class="steps">
          <!-- Step 1 -->
          <div class="step">
            <div class="step-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3>List Your Item</h3>
            <p>Create a listing for what you have and what you want in exchange.</p>
          </div>

          <!-- Step 2 -->
          <div class="step">
            <div class="step-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3>Connect & Chat</h3>
            <p>Message potential traders and negotiate your exchange.</p>
          </div>

          <!-- Step 3 -->
          <div class="step">
            <div class="step-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3>Make the Trade</h3>
            <p>Meet up safely and exchange your items person-to-person.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Listings -->
    <div class="featured-listings">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Listings</h2>
          <router-link to="/listings" class="view-all"> View All → </router-link>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
        </div>

        <!-- Listings grid -->
        <div v-else-if="featuredListings.length > 0" class="listings-grid">
          <div v-for="listing in featuredListings" :key="listing.id" class="listing-card">
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
          <h3>No listings yet</h3>
          <p>Be the first to create a listing!</p>
          <div class="empty-action">
            <router-link to="/create-listing" class="btn"> Create Listing </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Start Bartering?</h2>
          <p>Join thousands of people trading goods and services without spending a dime.</p>
          <router-link to="/register" class="btn"> Create Your Account </router-link>
        </div>
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
</script>

<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(to right, var(--color-primary), #fb923c);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-content {
  max-width: 50rem;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-white {
  background-color: white;
  color: var(--color-primary);
}

.btn-white:hover {
  background-color: #f8fafc;
}

.btn-dark {
  background-color: var(--color-primary-dark);
  color: white;
}

.btn-dark:hover {
  background-color: var(--color-primary);
}

/* How It Works Section */
.how-it-works {
  padding: 4rem 0;
  background-color: var(--color-background);
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.step {
  flex: 1;
  min-width: 250px;
  text-align: center;
  padding: 1rem;
}

.step-icon {
  width: 4rem;
  height: 4rem;
  background-color: #fff7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--color-primary);
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step p {
  color: var(--color-text-secondary);
}

/* Featured Listings Section */
.featured-listings {
  padding: 4rem 0;
  background-color: #f9fafb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-all {
  color: var(--color-primary);
  font-weight: 500;
}

.loading {
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
  box-shadow: 0 4px 6px var(--color-shadow);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.listing-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 10px 15px var(--color-shadow);
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
  font-weight: bold;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.owner-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
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
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

/* CTA Section */
.cta-section {
  padding: 4rem 0;
  background-color: #18181b;
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 50rem;
  margin: 0 auto;
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  color: #d4d4d8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .steps {
    flex-direction: column;
  }

  .step {
    max-width: 100%;
  }

  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 576px) {
  .hero {
    padding: 3rem 0;
  }

  .hero h1 {
    font-size: 1.75rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
