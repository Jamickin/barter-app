import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import { t } from '../i18n/index.js'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'meta.home' } },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue'), meta: { title: 'meta.about' } },
  { path: '/listings', name: 'listings', component: () => import('../views/ListingsView.vue'), meta: { title: 'meta.listings' } },
  { path: '/listing/:id', name: 'listing-detail', component: () => import('../views/ListingDetailView.vue'), props: true },
  { path: '/create-listing', name: 'create-listing', component: () => import('../views/CreateListingView.vue'), meta: { requiresAuth: true, title: 'meta.create' } },
  { path: '/edit-listing/:id', name: 'edit-listing', component: () => import('../views/EditListingView.vue'), meta: { requiresAuth: true, title: 'meta.edit' }, props: true },
  { path: '/profile/:id', name: 'profile', component: () => import('../views/ProfileView.vue'), props: true },
  { path: '/messages', name: 'messages', component: () => import('../views/MessagesView.vue'), meta: { requiresAuth: true, title: 'meta.messages' } },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'meta.login' } },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { title: 'meta.register' } },
  ...['terms', 'privacy', 'guidelines', 'boost-terms'].map((doc) => ({
    path: `/${doc}`,
    name: doc,
    component: () => import('../views/PolicyView.vue'),
    props: { doc },
    meta: { title: `policy.${doc}.title` },
  })),
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'meta.notFound' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.path === from.path) return false // query-only changes (filters) keep the scroll position
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.currentUser) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

// Page titles for tabs, history and shared links. Listing and profile pages set their own.
router.afterEach((to) => {
  if (to.meta.title) document.title = `${t(to.meta.title)} · Barter`
})

export default router
