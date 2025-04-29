<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Edit Listing</h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="loadError"
      class="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300"
    >
      {{ loadError }}
      <div class="mt-2">
        <router-link to="/listings" class="text-red-700 dark:text-red-300 underline">
          Return to listings
        </router-link>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden p-6">
      <form @submit.prevent="handleSubmit">
        <!-- What are you trading -->
        <div class="mb-4">
          <label
            for="tradeWhat"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            What are you trading?
          </label>
          <input
            id="tradeWhat"
            v-model="listing.tradeWhat"
            type="text"
            required
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            placeholder="e.g. iPhone 13 Pro"
          />
          <p v-if="errors.tradeWhat" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.tradeWhat }}
          </p>
        </div>

        <!-- What are you looking for -->
        <div class="mb-4">
          <label
            for="forWhat"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            What do you want in return?
          </label>
          <input
            id="forWhat"
            v-model="listing.forWhat"
            type="text"
            required
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            placeholder="e.g. iPad Pro or MacBook"
          />
          <p v-if="errors.forWhat" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.forWhat }}
          </p>
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label
            for="category"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            v-model="listing.category_id"
            required
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          >
            <option value="" disabled>Select a category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <p v-if="errors.category_id" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.category_id }}
          </p>
        </div>

        <!-- Status -->
        <div class="mb-4">
          <label
            for="status"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            v-model="listing.status"
            required
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
          >
            <option value="available">Available</option>
            <option value="pending">Trade Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            v-model="listing.description"
            rows="4"
            class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white"
            placeholder="Describe your item and what you're looking for..."
          ></textarea>
        </div>

        <!-- Image Upload -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Item Image
          </label>

          <!-- Current image preview -->
          <div v-if="listing.image_url && !imagePreview" class="mb-3">
            <img
              :src="listing.image_url"
              alt="Current image"
              class="h-32 w-auto object-cover rounded"
            />
            <button
              type="button"
              @click="removeImage"
              class="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Remove image
            </button>
          </div>

          <div
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 dark:border-zinc-600 border-dashed rounded-md"
          >
            <div class="space-y-1 text-center">
              <div v-if="imagePreview" class="mb-3">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="mx-auto h-32 w-auto object-cover rounded"
                />
              </div>
              <div
                v-else-if="!listing.image_url"
                class="flex text-sm text-gray-600 dark:text-gray-400"
              >
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
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
          <p v-if="errors.image" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.image }}
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="submitError"
          class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md"
        >
          {{ submitError }}
        </div>

        <!-- Submit Buttons -->
        <div class="flex items-center justify-between space-x-3">
          <router-link
            :to="`/listing/${id}`"
            class="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Updating...</span>
            <span v-else>Update Listing</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db, storage } from '../firebase'
import { doc, getDoc, updateDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// State variables
const listing = ref({
  tradeWhat: '',
  forWhat: '',
  description: '',
  category_id: '',
  status: 'available',
  image_url: '',
})
const categories = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const submitError = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)
const shouldRemoveImage = ref(false)

// Form errors
const errors = ref({
  tradeWhat: '',
  forWhat: '',
  category_id: '',
  image: '',
})

// Fetch listing and categories
onMounted(async () => {
  try {
    // Fetch the listing
    const listingDoc = await getDoc(doc(db, 'listings', id))

    if (!listingDoc.exists()) {
      loadError.value = 'Listing not found'
      return
    }

    const listingData = listingDoc.data()

    // Check permissions - only owner or admin can edit
    if (auth.currentUser?.uid !== listingData.by_user_id) {
      // TODO: Check if user is admin
      loadError.value = 'You do not have permission to edit this listing'
      return
    }

    // Set listing data
    listing.value = {
      tradeWhat: listingData.tradeWhat || '',
      forWhat: listingData.forWhat || '',
      description: listingData.description || '',
      category_id: listingData.category_id || '',
      status: listingData.status || 'available',
      image_url: listingData.image_url || '',
    }

    // Fetch categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'))
    categories.value = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching listing:', error)
    loadError.value = 'Error loading listing. Please try again.'
  } finally {
    isLoading.value = false
  }
})

// Handle image upload
const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = 'Image must be less than 5MB'
    return
  }

  // Validate file type
  if (!file.type.match('image.*')) {
    errors.value.image = 'Please upload an image file'
    return
  }

  // Clear previous error
  errors.value.image = ''

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
  listing.value.image_url = ''
}

// Validate form
const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.value = {
    tradeWhat: '',
    forWhat: '',
    category_id: '',
    image: '',
  }

  // Validate required fields
  if (!listing.value.tradeWhat.trim()) {
    errors.value.tradeWhat = 'Please specify what you are trading'
    isValid = false
  }

  if (!listing.value.forWhat.trim()) {
    errors.value.forWhat = 'Please specify what you want in return'
    isValid = false
  }

  if (!listing.value.category_id) {
    errors.value.category_id = 'Please select a category'
    isValid = false
  }

  return isValid
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  // Check if user is authenticated and authorized
  if (!auth.currentUser) {
    submitError.value = 'You must be logged in to update a listing'
    router.push(`/login?redirect=/edit-listing/${id}`)
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    const listingRef = doc(db, 'listings', id)
    const listingDoc = await getDoc(listingRef)

    if (!listingDoc.exists()) {
      throw new Error('Listing not found')
    }

    const listingData = listingDoc.data()

    // Verify ownership
    if (auth.currentUser.uid !== listingData.by_user_id) {
      // TODO: Check if user is admin
      throw new Error('You do not have permission to edit this listing')
    }

    // Prepare update data
    const updateData = {
      tradeWhat: listing.value.tradeWhat,
      tradeWhat_lower: listing.value.tradeWhat.toLowerCase(),
      forWhat: listing.value.forWhat,
      forWhat_lower: listing.value.forWhat.toLowerCase(),
      description: listing.value.description,
      category_id: listing.value.category_id,
      status: listing.value.status,
      updated_at: serverTimestamp(),
    }

    // Handle image upload or removal
    if (imageFile.value) {
      // Remove old image if exists
      if (listingData.image_url) {
        try {
          // Extract path from URL (this depends on your storage structure)
          const oldImagePath = listingData.image_url
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
      const filePath = `listings/${auth.currentUser.uid}/${fileName}`

      const fileRef = storageRef(storage, filePath)
      await uploadBytes(fileRef, imageFile.value)

      const downloadURL = await getDownloadURL(fileRef)
      updateData.image_url = downloadURL
    } else if (shouldRemoveImage.value && listingData.image_url) {
      // Remove image from storage
      try {
        const oldImagePath = listingData.image_url
          .split('?')[0]
          .split('/o/')[1]
          .replace(/%2F/g, '/')
        const decodedPath = decodeURIComponent(oldImagePath)
        await deleteObject(storageRef(storage, decodedPath))
      } catch (error) {
        console.error('Error deleting image:', error)
      }

      // Remove image URL from listing
      updateData.image_url = null
    }

    // Update document
    await updateDoc(listingRef, updateData)

    // Redirect back to listing with success message
    router.push({
      path: `/listing/${id}`,
      query: { message: 'Listing updated successfully!' },
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    submitError.value = 'An error occurred while updating your listing. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
