<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Create New Listing</h1>

    <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden p-6">
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
            Item Image (optional)
          </label>
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
              <div v-else class="flex text-sm text-gray-600 dark:text-gray-400">
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
            to="/listings"
            class="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Listing</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../firebase'
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const router = useRouter()
const categories = ref([])
const isSubmitting = ref(false)
const submitError = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)

// Form data
const listing = ref({
  tradeWhat: '',
  forWhat: '',
  description: '',
  category_id: '',
  status: 'available',
})

// Form errors
const errors = ref({
  tradeWhat: '',
  forWhat: '',
  category_id: '',
  image: '',
})

// Fetch categories on component mount
onMounted(async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'))
    categories.value = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // If no categories exist, create some default ones
    if (categories.value.length === 0) {
      await createDefaultCategories()
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    submitError.value = 'Error loading categories. Please refresh the page.'
  }
})

// Create default categories if none exist
async function createDefaultCategories() {
  try {
    const defaultCategories = [
      { name: 'Electronics', order: 1 },
      { name: 'Furniture', order: 2 },
      { name: 'Clothing', order: 3 },
      { name: 'Books', order: 4 },
      { name: 'Tools', order: 5 },
      { name: 'Sports & Outdoors', order: 6 },
      { name: 'Video Games', order: 7 },
      { name: 'Home & Garden', order: 8 },
      { name: 'Vehicles', order: 9 },
      { name: 'Other', order: 10 },
    ]

    // Add categories to Firestore
    const batch = []
    for (const category of defaultCategories) {
      batch.push(addDoc(collection(db, 'categories'), category))
    }

    const results = await Promise.all(batch)

    // Update categories ref with new data
    categories.value = results.map((docRef, index) => ({
      id: docRef.id,
      ...defaultCategories[index],
    }))
  } catch (error) {
    console.error('Error creating default categories:', error)
  }
}

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

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
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

  // Check if user is authenticated
  if (!auth.currentUser) {
    submitError.value = 'You must be logged in to create a listing'
    router.push('/login?redirect=/create-listing')
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    // Get current user data
    const userId = auth.currentUser.uid
    const userDoc = await getDoc(doc(db, 'users', userId))

    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    // Prepare listing data
    const listingData = {
      ...listing.value,
      // Add lowercase version of title for search
      tradeWhat_lower: listing.value.tradeWhat.toLowerCase(),
      forWhat_lower: listing.value.forWhat.toLowerCase(),
      by_user_id: userId,
      owner: {
        name: auth.currentUser.displayName || 'Anonymous',
        email: auth.currentUser.email,
      },
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }

    // Upload image if provided
    if (imageFile.value) {
      // Create unique filename
      const fileExt = imageFile.value.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `listings/${userId}/${fileName}`

      // Upload image to Firebase Storage
      const fileRef = storageRef(storage, filePath)
      await uploadBytes(fileRef, imageFile.value)

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef)
      listingData.image_url = downloadURL
    }

    // Add listing to Firestore
    const docRef = await addDoc(collection(db, 'listings'), listingData)

    // Redirect to the new listing
    router.push({
      path: `/listing/${docRef.id}`,
      query: { message: 'Listing created successfully!' },
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    submitError.value = 'An error occurred while creating your listing. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
