<template>
  <div>
    <header class="mx-auto mb-6 max-w-xl">
      <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t('form.editTitle') }}</h1>
    </header>
    <p v-if="loadError" class="card mx-auto max-w-xl p-6 text-center text-[var(--color-text-secondary)]">{{ loadError }}</p>
    <ListingForm v-else-if="ready" mode="edit" :initial="initial" :categories="categories" :submit-label="$t('form.saveChanges')" :busy="busy" :submit-error="error" @submit="save" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../firebase'
import { getDoc, getDocs, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import ListingForm from '../components/ListingForm.vue'
import { compressImage } from '../lib/image.js'
import { t } from '../i18n/index.js'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const categories = ref([])
const initial = ref({})
const ready = ref(false)
const busy = ref(false)
const error = ref('')
const loadError = ref('')

onMounted(async () => {
  try {
    const [snap, cats] = await Promise.all([getDoc(doc(db, 'listings', props.id)), getDocs(collection(db, 'categories'))])
    categories.value = cats.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 99) - (b.order || 99))
    if (!snap.exists()) return (loadError.value = t('detail.goneText'))
    const d = snap.data()
    if (d.by_user_id !== auth.currentUser?.uid) return (loadError.value = t('form.errNotYours'))
    initial.value = {
      tradeWhat: d.tradeWhat || '',
      forWhat: d.forWhat || '',
      description: d.description || '',
      category_id: d.category_id || '',
      location: d.location || '',
      area: d.area || '',
      topup: d.topup || null,
      status: d.status || 'available',
      country: d.country || 'ZW',
      image_url: d.image_url || '',
    }
    ready.value = true
  } catch (e) {
    console.error('Error loading listing:', e)
    loadError.value = t('detail.loadError')
  }
})

async function save(data, imageFile) {
  busy.value = true
  error.value = ''
  try {
    // eslint-disable-next-line no-unused-vars
    const { image_url, ...fields } = data
    const update = {
      ...fields,
      tradeWhat_lower: data.tradeWhat.toLowerCase(),
      forWhat_lower: data.forWhat.toLowerCase(),
      updated_at: serverTimestamp(),
    }
    if (imageFile) {
      const uid = auth.currentUser.uid
      const fileRef = storageRef(storage, `listings/${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`)
      await uploadBytes(fileRef, await compressImage(imageFile), { contentType: 'image/jpeg' })
      update.image_url = await getDownloadURL(fileRef)
    }
    await updateDoc(doc(db, 'listings', props.id), update)
    router.push({ path: `/listing/${props.id}`, query: { message: t('form.saved') } })
  } catch (e) {
    console.error('Error saving listing:', e)
    error.value = t('form.errSave')
  } finally {
    busy.value = false
  }
}
</script>
