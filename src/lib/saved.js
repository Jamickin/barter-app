// Saved listings (a wishlist). Kept per device for the demo; on the real backend this becomes users/{uid}.saved.
import { reactive } from 'vue'
import { track } from './track.js'

const KEY = 'barter-saved'
let initial = []
try {
  initial = JSON.parse(localStorage.getItem(KEY) || '[]')
} catch {
  /* ignore */
}
export const saved = reactive(new Set(initial))

export function toggleSaved(id) {
  if (saved.has(id)) saved.delete(id)
  else {
    saved.add(id)
    track('save_listing', { listing_id: id })
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...saved]))
  } catch {
    /* ignore */
  }
}
