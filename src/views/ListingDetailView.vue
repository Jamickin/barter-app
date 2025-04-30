<template>
  <div class="listing-detail">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="error-message"
    >
      <div class="error-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="error-icon"
        >
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="error-title">Error</h3>
          <p>{{ error }}</p>
          <div class="error-action">
            <router-link
              to="/listings"
              class="error-link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Available
            </button>
            <button
              @click="updateStatus('pending')"
              class="status-btn pending-btn"
              :class="{ 'disabled': listing.status === 'pending' }"
              :disabled="listing.status === 'pending'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Trade Pending
            </button>
            <button
              @click="updateStatus('completed')"
              class="status-btn completed-btn"
              :class="{ 'disabled': listing.status === 'completed' }"
              :disabled="listing.status === 'completed'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon"
              >
                <path
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
    >
      <div class="modal-container">
        <h3 class="modal-title">Confirm Delete</h3>
        <p class="modal-message">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button
            @click="showDeleteModal = false"
            class="btn cancel-btn"
          >
            Cancel
          </button>
          <button
            @click="deleteListing"
            class="btn confirm-delete-btn"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="loading-spinner">
              <svg class="spinner-icon" viewBox="0 0 24 24">
                <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4"></circle>
              </svg>
              Deleting...
            </span>
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
</script>

<style scoped>
.listing-detail {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
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

.error-message {
  background-color: #fee2e2;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #b91c1c;
}

.dark-theme .error-message {
  background-color: rgba(185, 28, 28, 0.2);
  color: #f87171;
}

.error-content {
  display: flex;
  align-items: flex-start;
}

.error-icon {
  margin-right: 1rem;
  flex-shrink: 0;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-action {
  margin-top: 1rem;
}

.error-link {
  display: inline-flex;
  align-items: center;
  color: #b91c1c;
  text-decoration: underline;
}

.dark-theme .error-link {
  color: #f87171;
}

.back-icon {
  margin-right: 0.5rem;
}

.listing-card {
  background-color: var(--color-background);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--color-shadow);
  overflow: hidden;
}

.back-link-mobile {
  padding: 1rem;
  display: block;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-secondary);
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-primary);
}

.listing-image,
.listing-image-placeholder {
  width: 100%;
  height: 20rem;
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
  padding: 1.5rem;
}

.status-badge-container {
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
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

.listing-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.for {
  color: var(--color-text-secondary);
}

.category-info {
  margin-bottom: 1rem;
}

.label {
  font-weight: 500;
  color: var(--color-text-main);
}

.category-value {
  color: var(--color-primary);
  font-weight: 500;
}

.owner-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.owner-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
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
  margin: 0 0.5rem;
}

.dark-theme .owner-avatar {
  background-color: rgba(194, 65, 12, 0.2);
  color: #fb923c;
}

.owner-name {
  color: var(--color-primary);
  font-weight: 500;
  transition: color 0.2s;
}

.owner-link:hover .owner-name {
  color: var(--color-primary-hover);
}

.date-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.description {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.description-text {
  background-color: var(--color-background-alt);
  padding: 1rem;
  border-radius: 0.5rem;
  color: var(--color-text-main);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.contact-btn {
  background-color: var(--color-primary);
  color: white;
}

.contact-btn:hover {
  background-color: var(--color-primary-hover);
}

.edit-btn {
  background-color: #52525b;
  color: white;
}

.edit-btn:hover {
  background-color: #3f3f46;
}

.delete-btn {
  background-color: #dc2626;
  color: white;
}

.delete-btn:hover {
  background-color: #b91c1c;
}

.button-icon {
  margin-right: 0.5rem;
}

.status-management {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.status-icon {
  margin-right: 0.25rem;
}

.available-btn {
  background-color: #d1fae5;
  color: #065f46;
}

.available-btn:hover:not(.disabled) {
  background-color: #a7f3d0;
}

.pending-btn {
  background-color: #ffedd5;
  color: #9a3412;
}

.pending-btn:hover:not(.disabled) {
  background-color: #fed7aa;
}

.completed-btn {
  background-color: #dbeafe;
  color: #1e40af;
}

.completed-btn:hover:not(.disabled) {
  background-color: #bfdbfe;
}

.dark-theme .available-btn {
  background-color: rgba(6, 95, 70, 0.2);
  color: #34d399;
}

.dark-theme .available-btn:hover:not(.disabled) {
  background-color: rgba(6, 95, 70, 0.3);
}

.dark-theme .pending-btn {
  background-color: rgba(154, 52, 18, 0.2);
  color: #fb923c;
}

.dark-theme .pending-btn:hover:not(.disabled) {
  background-color: rgba(154, 52, 18, 0.3);
}

.dark-theme .completed-btn {
  background-color: rgba(30, 64, 175, 0.2);
  color: #60a5fa;
}

.dark-theme .completed-btn:hover:not(.disabled) {
  background-color: rgba(30, 64, 175, 0.3);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-container {
  background-color: var(--color-background);
  border-radius: 0.5rem;
  max-width: 28rem;
  width: 100%;
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--color-shadow);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-main);
}

.modal-message {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn {
  background-color: #e4e4e7;
  color: var(--color-text-main);
}

.cancel-btn:hover {
  background-color: #d4d4d8;
}

.dark-theme .cancel-btn {
  background-color: #3f3f46;
  color: #e4e4e7;
}

.dark-theme .cancel-btn:hover {
  background-color: #52525b;
}

.confirm-delete-btn {
  background-color: #dc2626;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #b91c1c;
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

@media (min-width: 768px) {
  .back-link-mobile {
    display: none;
  }
}

@media (max-width: 768px) {
  .listing-title {
    font-size: 1.5rem;
  }

  .action-buttons,
  .status-buttons {
    flex-direction: column;
  }

  .action-buttons .btn,
  .status-buttons .status-btn {
    width: 100%;
  }
}
</style>
