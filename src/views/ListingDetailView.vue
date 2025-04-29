<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300"
    >
      {{ error }}
      <div class="mt-2">
        <router-link to="/listings" class="text-red-700 dark:text-red-300 underline">
          Return to listings
        </router-link>
      </div>
    </div>

    <!-- Listing details -->
    <div v-else-if="listing" class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
      <!-- Image if available -->
      <img
        v-if="listing.image_url"
        :src="listing.image_url"
        :alt="listing.tradeWhat"
        class="w-full h-64 object-cover"
      />

      <div class="p-6">
        <!-- Status Badge -->
        <div v-if="listing.status" class="mb-3">
          <span
            class="px-2.5 py-1 text-xs font-medium rounded-full"
            :class="getStatusClasses(listing.status)"
          >
            {{ getStatusText(listing.status) }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold mb-2 text-zinc-800 dark:text-white">
          {{ listing.tradeWhat }} <span class="text-zinc-500 dark:text-zinc-400">for</span>
          {{ listing.forWhat }}
        </h1>

        <!-- Category info -->
        <div v-if="listing.category_id" class="mb-4">
          <span class="font-medium text-zinc-700 dark:text-zinc-300">Category: </span>
          <span class="text-orange-600">{{ getCategoryName(listing.category_id) }}</span>
        </div>

        <!-- Owner info -->
        <div class="mb-6 flex items-center">
          <span class="font-medium text-zinc-700 dark:text-zinc-300 mr-2">Listed by: </span>
          <router-link :to="`/profile/${listing.by_user_id}`" class="flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs"
            >
              {{ getInitials(listing.owner?.name || '') }}
            </div>
            <span class="ml-2 text-orange-600">{{ listing.owner?.name }}</span>
          </router-link>
        </div>

        <!-- Date info -->
        <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Listed on {{ formatDate(listing.created_at) }}
          <span
            v-if="
              listing.updated_at && listing.updated_at.getTime() !== listing.created_at.getTime()
            "
          >
            · Updated on {{ formatDate(listing.updated_at) }}
          </span>
        </div>

        <!-- Description if available -->
        <div v-if="listing.description" class="mb-6">
          <h2 class="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Description</h2>
          <p class="text-zinc-700 dark:text-zinc-300">{{ listing.description }}</p>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-3 mt-6">
          <!-- Contact seller button - only if user is not the owner -->
          <button
            v-if="isAuthenticated && currentUserId !== listing.by_user_id"
            @click="contactSeller"
            class="bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md"
          >
            Contact Seller
          </button>

          <!-- Edit button - only if user is the owner -->
          <router-link
            v-if="isAuthenticated && (currentUserId === listing.by_user_id || isAdmin)"
            :to="`/edit-listing/${listing.id}`"
            class="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md"
          >
            Edit Listing
          </router-link>

          <!-- Delete button - only if user is the owner -->
          <button
            v-if="isAuthenticated && (currentUserId === listing.by_user_id || isAdmin)"
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md"
          >
            Delete
          </button>
        </div>

        <!-- Status management (for owner) -->
        <div
          v-if="isAuthenticated && currentUserId === listing.by_user_id"
          class="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700"
        >
          <h2 class="text-lg font-semibold mb-3 text-zinc-800 dark:text-white">Update Status</h2>
          <div class="flex flex-wrap gap-2">
            <button
              @click="updateStatus('available')"
              class="px-3 py-1 rounded-md text-sm"
              :class="[
                listing.status === 'available' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
              ]"
              :disabled="listing.status === 'available'"
            >
              Available
            </button>
            <button
              @click="updateStatus('pending')"
              class="px-3 py-1 rounded-md text-sm"
              :class="[
                listing.status === 'pending' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
              ]"
              :disabled="listing.status === 'pending'"
            >
              Trade Pending
            </button>
            <button
              @click="updateStatus('completed')"
              class="px-3 py-1 rounded-md text-sm"
              :class="[
                listing.status === 'completed' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
              ]"
              :disabled="listing.status === 'completed'"
            >
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-3 text-zinc-800 dark:text-white">Confirm Delete</h3>
        <p class="text-zinc-700 dark:text-zinc-300 mb-6">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md"
          >
            Cancel
          </button>
          <button
            @click="deleteListing"
            class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const route = useRoute()
const router = useRouter()
const listingId = route.params.id

// State
const listing = ref(null)
const categories = ref([])
const isLoading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const currentUserId = ref(null)
const isAdmin = ref(false)

// Computed properties
const isAuthenticated = computed(() => !!currentUserId.value)

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUserId.value = user?.uid || null

  // Check if user is admin
  if (user) {
    checkAdminStatus(user.uid)
  } else {
    isAdmin.value = false
  }
})

// Check if user is admin
async function checkAdminStatus(userId) {
  try {
    // In a real app, you'd query your users collection to check admin status
    // This is a simplified example
    const userDoc = await getDoc(doc(db, 'users', userId))
    isAdmin.value = userDoc.exists() && userDoc.data().is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    isAdmin.value = false
  }
}

// Fetch listing and categories
onMounted(async () => {
  try {
    // Fetch categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'))
    categories.value = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch listing
    const listingDoc = await getDoc(doc(db, 'listings', listingId))

    if (listingDoc.exists()) {
      const listingData = listingDoc.data()

      // Fetch owner information
      let ownerData = null
      if (listingData.by_user_id) {
        // In a real app, you'd query your users collection
        // For simplicity, we'll use the cached owner data if available
        if (listingData.owner) {
          ownerData = listingData.owner
        } else {
          const ownerDoc = await getDoc(doc(db, 'users', listingData.by_user_id))
          if (ownerDoc.exists()) {
            ownerData = ownerDoc.data()
          }
        }
      }

      // Format dates
      const created_at = listingData.created_at?.toDate() || new Date()
      const updated_at = listingData.updated_at?.toDate() || created_at

      listing.value = {
        id: listingDoc.id,
        ...listingData,
        created_at,
        updated_at,
        owner: ownerData,
      }
    } else {
      error.value = 'Listing not found'
    }
  } catch (err) {
    console.error('Error fetching listing:', err)
    error.value = 'Error loading listing'
  } finally {
    isLoading.value = false
  }
})

// Contact seller
function contactSeller() {
  router.push({
    path: '/messages',
    query: {
      to: listing.value.by_user_id,
      listing: listing.value.id,
    },
  })
}

// Update listing status
async function updateStatus(status) {
  if (!isAuthenticated.value || currentUserId.value !== listing.value.by_user_id) {
    return
  }

  try {
    await updateDoc(doc(db, 'listings', listingId), {
      status,
      updated_at: serverTimestamp(),
    })

    // Update local state
    listing.value.status = status
    listing.value.updated_at = new Date()

    // Show success message
    alert(`Listing status updated to ${getStatusText(status)}`)
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Failed to update status')
  }
}

// Delete listing confirmation
function confirmDelete() {
  showDeleteModal.value = true
}

// Delete listing
async function deleteListing() {
  if (
    !isAuthenticated.value ||
    (currentUserId.value !== listing.value.by_user_id && !isAdmin.value)
  ) {
    showDeleteModal.value = false
    return
  }

  isDeleting.value = true

  try {
    await deleteDoc(doc(db, 'listings', listingId))
    showDeleteModal.value = false

    // Redirect to listings page with success message
    router.push({
      path: '/listings',
      query: { message: 'Listing successfully deleted' },
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    alert('Failed to delete listing')
    isDeleting.value = false
  }
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

function formatDate(date) {
  if (!date) return 'Unknown date'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
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
