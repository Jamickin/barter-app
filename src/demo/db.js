// The demo "server": one JSON blob in the visitor's localStorage.
// Every visitor gets their own copy of the seeded world, so testers can't see or break each other's data.
import { seedState } from './seed.js'

const KEY = 'barter-demo-v2'
const listeners = new Set()

export class Timestamp {
  constructor(ms) {
    this._ms = ms
  }
  static now() {
    return new Timestamp(Date.now())
  }
  static fromDate(d) {
    return new Timestamp(d.getTime())
  }
  static fromMillis(ms) {
    return new Timestamp(ms)
  }
  get seconds() {
    return Math.floor(this._ms / 1000)
  }
  get nanoseconds() {
    return (this._ms % 1000) * 1e6
  }
  toDate() {
    return new Date(this._ms)
  }
  toMillis() {
    return this._ms
  }
  toJSON() {
    return { __ts: this._ms }
  }
}

export const SERVER_TS = { __serverTimestamp: true }

let state = load()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* private mode or corrupted: fall through to a fresh seed */
  }
  return seedState()
}

export function getState() {
  return state
}

export function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Demo storage is full or blocked', e)
    if (e?.name === 'QuotaExceededError') {
      alert('This demo has run out of space on this device. Use "Reset demo" in the banner to start fresh.')
    }
  }
  listeners.forEach((fn) => fn())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetDemo() {
  state = seedState()
  persist()
}

// Another tab changed the demo: pick it up so two tabs can play buyer and seller.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((fn) => fn())
  })
}

// Stored values -> what Firestore would hand back (Timestamps as objects with toDate()).
export function revive(value) {
  if (Array.isArray(value)) return value.map(revive)
  if (value && typeof value === 'object') {
    if ('__ts' in value) return new Timestamp(value.__ts)
    const out = {}
    for (const k in value) out[k] = revive(value[k])
    return out
  }
  return value
}

// Incoming write -> storable JSON (serverTimestamp() becomes "now").
export function freeze(value) {
  if (value === SERVER_TS || value?.__serverTimestamp) return { __ts: Date.now() }
  if (value instanceof Timestamp) return { __ts: value.toMillis() }
  if (value instanceof Date) return { __ts: value.getTime() }
  if (Array.isArray(value)) return value.map(freeze)
  if (value && typeof value === 'object') {
    const out = {}
    for (const k in value) if (value[k] !== undefined) out[k] = freeze(value[k])
    return out
  }
  return value
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
