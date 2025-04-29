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

    <!-- Profile information -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User Info Card -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
        <div class="p-6">
          <!-- User Avatar -->
          <div class="flex flex-col items-center justify-center mb-6">
            <div v-if="userProfile.image_url" class="mb-3">
              <img
                :src="userProfile.image_url"
                :alt="userProfile.name"
                class="h-24 w-24 rounded-full object-cover border-2 border-orange-200 dark:border-orange-900"
              />
            </div>
            <div
              v-else
              class="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-orange-700 dark:text-orange-300 text-3xl font-bold"
            >
              {{ getInitials(userProfile.name) }}
            </div>
          </div>

          <!-- User Name -->
          <h1 class="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-2">
            {{ userProfile.name }}
          </h1>

          <!-- Member Since -->
          <div class="text-sm text-center text-zinc-500 dark:text-zinc-400 mb-6">
            Member since {{ formatDate(userProfile.created_at) }}
          </div>

          <!-- User Stats -->
          <div class="border-t border-b border-zinc-200 dark:border-zinc-700 py-4 mb-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-xl font-semibold text-zinc-800 dark:text-white">
                  {{ userListings.length }}
                </div>
                <div class="text-sm text-zinc-500 dark:text-zinc-400">Listings</div>
              </div>
              <div>
                <div class="text-xl font-semibold text-zinc-800 dark:text-white">
                  {{ completedTrades }}
                </div>
                <div class="text-sm text-zinc-500 dark:text-zinc-400">Completed</div>
              </div>
              <div>
                <div class="text-xl font-semibold text-zinc-800 dark:text-white">
                  {{ activeTrades }}
                </div>
                <div class="text-sm text-zinc-500 dark:text-zinc-400">Active</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="userId === currentUserId">
            <!-- Edit Profile Button -->
            <button
              @click="showEditProfile = true"
              class="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md mb-3"
            >
              Edit Profile
            </button>
          </div>
          <div v-else>
            <!-- Message Button -->
            <button
              @click="startConversation"
              class="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md"
            >
              Message
            </button>
          </div>
        </div>
      </div>

      <!-- Listings Section -->
      <div class="md:col-span-2">
        <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
          <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">
              {{ isCurrentUser ? 'My Listings' : `${userProfile.name}'s Listings` }}
            </h2>
          </div>

          <!-- Listings Tabs -->
          <div class="border-b border-zinc-200 dark:border-zinc-700">
            <div class="flex">
              <button
                @click="activeTab = 'all'"
                class="flex-1 py-3 px-4 text-center"
                :class="
                  activeTab === 'all'
                    ? 'border-b-2 border-orange-500 text-orange-600 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                "
              >
                All ({{ userListings.length }})
              </button>
              <button
                @click="activeTab = 'available'"
                class="flex-1 py-3 px-4 text-center"
                :class="
                  activeTab === 'available'
                    ? 'border-b-2 border-orange-500 text-orange-600 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                "
              >
                Available ({{ availableListings.length }})
              </button>
              <button
                @click="activeTab = 'completed'"
                class="flex-1 py-3 px-4 text-center"
                :class="
                  activeTab === 'completed'
                    ? 'border-b-2 border-orange-500 text-orange-600 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                "
              >
                Completed ({{ completedListings.length }})
              </button>
            </div>
          </div>

          <!-- Listings Grid -->
          <div class="p-4">
            <div v-if="filteredListings.length === 0" class="py-8 text-center">
              <p class="text-zinc-500 dark:text-zinc-400">
                {{
                  isCurrentUser
                    ? "You don't have any listings in this category yet"
                    : `${userProfile.name} doesn't have any listings in this category yet`
                }}
              </p>
              <div v-if="isCurrentUser" class="mt-4">
                <router-link
                  to="/create-listing"
                  class="inline-block bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md"
                >
                  Create Listing
                </router-link>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="listing in filteredListings"
                :key="listing.id"
                class="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <router-link :to="`/listing/${listing.id}`" class="block">
                  <!-- Image if available -->
                  <img
                    v-if="listing.image_url"
                    :src="listing.image_url"
                    :alt="listing.tradeWhat"
                    class="w-full h-36 object-cover"
                  />

                  <div class="p-3">
                    <!-- Status badge -->
                    <div v-if="listing.status" class="mb-2">
                      <span
                        class="px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="getStatusClasses(listing.status)"
                      >
                        {{ getStatusText(listing.status) }}
                      </span>
                    </div>

                    <!-- Listing details -->
                    <h3 class="text-md font-semibold mb-1 text-zinc-800 dark:text-white truncate">
                      {{ listing.tradeWhat }}
                    </h3>
                    <div class="text-sm text-zinc-600 dark:text-zinc-400">
                      for <span class="font-medium text-orange-600">{{ listing.forWhat }}</span>
                    </div>

                    <!-- Date -->
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {{ formatDateShort(listing.created_at) }}
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div
      v-if="showEditProfile"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4 text-zinc-800 dark:text-white">Edit Profile</h3>

        <form @submit.prevent="updateProfile">
          <!-- Name Field -->
          <div class="mb-4">
            <label
              for="name"
              class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              v-model="editForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            />
          </div>

          <!-- Profile Image Upload -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Profile Image
            </label>

            <!-- Current image preview -->
            <div v-if="userProfile.image_url && !imagePreview" class="mb-3 flex justify-center">
              <img
                :src="userProfile.image_url"
                alt="Current profile"
                class="h-32 w-32 object-cover rounded-full"
              />
            </div>

            <div v-if="imagePreview" class="mb-3 flex justify-center">
              <img :src="imagePreview" alt="Preview" class="h-32 w-32 object-cover rounded-full" />
            </div>

            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 dark:border-zinc-600 border-dashed rounded-md"
            >
              <div class="space-y-1 text-center">
                <div class="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label
                    for="file-upload"
                    class="relative cursor-pointer bg-white dark:bg-zinc-700 rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="handleImageChange"
                    />
                  </label>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>

            <div v-if="userProfile.image_url || imagePreview" class="mt-2 text-center">
              <button
                type="button"
                @click="removeImage"
                class="text-sm text-red-600 hover:text-red-500"
              >
                Remove image
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="updateError"
            class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md"
          >
            {{ updateError }}
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md"
              :disabled="isUpdating"
            >
              <span v-if="isUpdating">Updating...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db, storage } from '../firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// State
const userProfile = ref({})
const userListings = ref([])
const isLoading = ref(true)
const error = ref(null)
const activeTab = ref('all')
const currentUserId = ref(null)
const showEditProfile = ref(false)
const editForm = ref({ name: '' })
const imageFile = ref(null)
const imagePreview = ref(null)
const shouldRemoveImage = ref(false)
const isUpdating = ref(false)
const updateError = ref('')

// Check if logged in user
onMounted(async () => {
  currentUserId.value = auth.currentUser?.uid || null
  await loadUserData()
})

// Load user data and listings
const loadUserData = async () => {
  try {
    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId))

    if (!userDoc.exists()) {
      error.value = 'User not found'
      isLoading.value = false
      return
    }

    // Set user data
    userProfile.value = {
      id: userId,
      ...userDoc.data(),
      created_at: userDoc.data().created_at?.toDate() || new Date(),
      updated_at: userDoc.data().updated_at?.toDate() || new Date(),
    }

    // Initialize edit form if this is the current user
    if (isCurrentUser.value) {
      editForm.value.name = userProfile.value.name
    }

    // Get user listings
    const listingsQuery = query(collection(db, 'listings'), where('by_user_id', '==', userId))

    const listingsSnapshot = await getDocs(listingsQuery)
    userListings.value = listingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
      updated_at: doc.data().updated_at?.toDate() || new Date(),
    }))

    isLoading.value = false
  } catch (err) {
    console.error('Error loading user data:', err)
    error.value = 'Error loading user data'
    isLoading.value = false
  }
}

// Check if viewing own profile
const isCurrentUser = computed(() => {
  return currentUserId.value === userId
})

// Filter listings based on active tab
const filteredListings = computed(() => {
  if (activeTab.value === 'all') {
    return userListings.value
  } else if (activeTab.value === 'available') {
    return availableListings.value
  } else if (activeTab.value === 'completed') {
    return completedListings.value
  }
  return userListings.value
})

// Available listings
const availableListings = computed(() => {
  return userListings.value.filter((listing) => listing.status === 'available')
})

// Completed listings
const completedListings = computed(() => {
  return userListings.value.filter((listing) => listing.status === 'completed')
})

// Count stats
const activeTrades = computed(() => {
  return userListings.value.filter(
    (listing) => listing.status === 'available' || listing.status === 'pending',
  ).length
})

const completedTrades = computed(() => {
  return userListings.value.filter((listing) => listing.status === 'completed').length
})

// Handle image change
const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    updateError.value = 'Image must be less than 5MB'
    return
  }

  // Validate file type
  if (!file.type.match('image.*')) {
    updateError.value = 'Please upload an image file'
    return
  }

  // Clear previous error
  updateError.value = ''

  // Set file for upload
  imageFile.value = file
  shouldRemoveImage.value = false

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove image
const removeImage = () => {
  shouldRemoveImage.value = true
  imageFile.value = null
  imagePreview.value = null
}

// Update profile
const updateProfile = async () => {
  if (!isCurrentUser.value) {
    return
  }

  isUpdating.value = true
  updateError.value = ''

  try {
    const userRef = doc(db, 'users', userId)

    // Prepare update data
    const updateData = {
      name: editForm.value.name,
      updated_at: serverTimestamp(),
    }

    // Handle image upload or removal
    if (imageFile.value) {
      // Remove old image if exists
      if (userProfile.value.image_url) {
        try {
          // Extract path from URL
          const oldImagePath = userProfile.value.image_url
            .split('?')[0]
            .split('/o/')[1]
            .replace(/%2F/g, '/')
          const decodedPath = decodeURIComponent(oldImagePath)
          await deleteObject(storageRef(storage, decodedPath))
        } catch (error) {
          console.error('Error deleting old image:', error)
          // Continue even if there's an error deleting the old image
        }
      }

      // Upload new image
      const fileExt = imageFile.value.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `users/${userId}/${fileName}`

      const fileRef = storageRef(storage, filePath)
      await uploadBytes(fileRef, imageFile.value)

      const downloadURL = await getDownloadURL(fileRef)
      updateData.image_url = downloadURL
    } else if (shouldRemoveImage.value && userProfile.value.image_url) {
      // Remove image from storage
      try {
        const oldImagePath = userProfile.value.image_url
          .split('?')[0]
          .split('/o/')[1]
          .replace(/%2F/g, '/')
        const decodedPath = decodeURIComponent(oldImagePath)
        await deleteObject(storageRef(storage, decodedPath))
      } catch (error) {
        console.error('Error deleting image:', error)
      }

      // Remove image URL from profile
      updateData.image_url = null
    }

    // Update user document
    await updateDoc(userRef, updateData)

    // Update auth profile if name changed
    if (auth.currentUser.displayName !== editForm.value.name) {
      await auth.currentUser.updateProfile({
        displayName: editForm.value.name,
      })
    }

    // Close modal and reload data
    showEditProfile.value = false
    await loadUserData()

    // Show success message
    router.push({
      path: `/profile/${userId}`,
      query: { message: 'Profile updated successfully!' },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    updateError.value = 'An error occurred while updating your profile. Please try again.'
  } finally {
    isUpdating.value = false
  }
}

// Cancel edit
const cancelEdit = () => {
  showEditProfile.value = false
  editForm.value.name = userProfile.value.name
  imageFile.value = null
  imagePreview.value = null
  shouldRemoveImage.value = false
  updateError.value = ''
}

// Start conversation with user
const startConversation = () => {
  router.push(`/messages?to=${userId}`)
}

// Format date
const formatDate = (date) => {
  if (!date) return 'Unknown'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date (short version)
const formatDateShort = (date) => {
  if (!date) return 'Unknown'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?'

  const parts = name.split(' ')
  return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
}

// Get status classes for badges
const getStatusClasses = (status) => {
  const classMap = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  }
  return classMap[status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300'
}

// Get status text
const getStatusText = (status) => {
  const statusMap = {
    available: 'Available',
    pending: 'Pending',
    completed: 'Completed',
  }
  return statusMap[status] || 'Unknown'
}
</script>
