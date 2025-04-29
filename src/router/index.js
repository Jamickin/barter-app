// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/listings',
      name: 'listings',
      component: () => import('../views/ListingsView.vue'),
    },
    {
      path: '/listing/:id',
      name: 'listing-detail',
      component: () => import('../views/ListingDetailView.vue'),
      props: true,
    },
    {
      path: '/create-listing',
      name: 'create-listing',
      component: () => import('../views/CreateListingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/edit-listing/:id',
      name: 'edit-listing',
      component: () => import('../views/EditListingView.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      props: true,
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/MessagesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
  ],
})

// Navigation guard for auth protection
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !currentUser) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
