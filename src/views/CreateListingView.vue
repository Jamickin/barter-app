<template>
  <div>
    <header class="mx-auto mb-6 max-w-xl">
      <h1 class="text-2xl font-extrabold tracking-tight md:text-3xl">{{ $t('form.createTitle') }}</h1>
      <p class="mt-1 text-[var(--color-text-secondary)]">{{ $t('form.createSub') }}</p>
    </header>
    <ListingForm v-if="ready" :initial="initial" :categories="categories" :submit-label="$t('form.publish')" :busy="busy" :submit-error="error" @submit="save" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../firebase'
import { collection, addDoc, getDocs, setDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import ListingForm from '../components/ListingForm.vue'
import { compressImage } from '../lib/image.js'
import { DEFAULT_CATEGORIES } from '../lib/regions.js'
import { prefs, t } from '../i18n/index.js'
import { track } from '../lib/track.js'

const router = useRouter()
const categories = ref([])
const initial = ref({})
const ready = ref(false)
const busy = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'categories'))
    categories.value = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 99) - (b.order || 99))
    if (!categories.value.length) {
      await Promise.all(DEFAULT_CATEGORIES.map(({ id, ...c }) => setDoc(doc(db, 'categories', id), c)))
      categories.value = DEFAULT_CATEGORIES.map((c) => ({ ...c }))
    }
    // Start from the trader's own country, town and area
    const me = await getDoc(doc(db, 'users', auth.currentUser.uid))
    const p = me.data() || {}
    initial.value = { country: p.country || prefs.country, location: p.town || '', area: p.area || '' }
  } catch (e) {
    console.error('Error preparing form:', e)
    initial.value = { country: prefs.country }
  }
  ready.value = true
  track('begin_listing')
})

async function save(data, imageFile) {
  busy.value = true
  error.value = ''
  try {
    const uid = auth.currentUser.uid
    const listing = {
      ...data,
      status: 'available',
      tradeWhat_lower: data.tradeWhat.toLowerCase(),
      forWhat_lower: data.forWhat.toLowerCase(),
      by_user_id: uid,
      owner: { name: auth.currentUser.displayName || t('common.trader') },
      boosted_until: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }
    if (imageFile) {
      const fileRef = storageRef(storage, `listings/${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`)
      await uploadBytes(fileRef, await compressImage(imageFile), { contentType: 'image/jpeg' })
      listing.image_url = await getDownloadURL(fileRef)
    }
    const ref = await addDoc(collection(db, 'listings'), listing)
    track('publish_listing', { category: data.category_id, with_photo: !!imageFile })
    router.push({ path: `/listing/${ref.id}`, query: { message: t('form.published') } })
  } catch (e) {
    console.error('Error creating listing:', e)
    error.value = t('form.errSave')
  } finally {
    busy.value = false
  }
}
</script>
