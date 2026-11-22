// Stand-in for 'firebase/auth'. Accounts live in the visitor's browser only.
import { getState, persist, subscribe, newId } from './db.js'

export const auth = { currentUser: null }
const watchers = new Set()

function makeUser(uid) {
  const s = getState()
  const acct = Object.values(s.accounts).find((a) => a.uid === uid)
  if (!acct) return null
  const user = {
    uid,
    email: acct.email,
    displayName: acct.displayName || null,
    photoURL: acct.photoURL || null,
    // ProfileView calls the older user.updateProfile() form; support both.
    updateProfile: (p) => updateProfile(user, p),
  }
  return user
}

function sync() {
  const uid = getState().session?.uid || null
  if ((auth.currentUser?.uid || null) === uid) return false
  auth.currentUser = uid ? makeUser(uid) : null
  return true
}
sync()

// Sign-in or sign-out in another tab (or a demo reset) reaches this tab too.
subscribe(() => {
  if (sync()) watchers.forEach((fn) => fn(auth.currentUser))
})

function setSession(uid) {
  getState().session = { uid }
  auth.currentUser = uid ? makeUser(uid) : null
  persist()
  watchers.forEach((fn) => fn(auth.currentUser))
}

const fail = (code, message) => Object.assign(new Error(message), { code })

export function getAuth() {
  return auth
}

export function onAuthStateChanged(_auth, fn) {
  watchers.add(fn)
  setTimeout(() => fn(auth.currentUser), 0)
  return () => watchers.delete(fn)
}

export async function createUserWithEmailAndPassword(_auth, email, password) {
  const key = String(email).trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(key)) throw fail('auth/invalid-email', 'Invalid email')
  if (String(password).length < 6) throw fail('auth/weak-password', 'Password should be at least 6 characters')
  const s = getState()
  if (s.accounts[key]) throw fail('auth/email-already-in-use', 'Email already in use')
  const uid = 'u-' + newId()
  s.accounts[key] = { uid, email: key, password }
  setSession(uid)
  return { user: auth.currentUser }
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const acct = getState().accounts[String(email).trim().toLowerCase()]
  if (!acct) throw fail('auth/user-not-found', 'No account with that email')
  if (acct.password !== password) throw fail('auth/wrong-password', 'Wrong password')
  setSession(acct.uid)
  return { user: auth.currentUser }
}

export async function signOut() {
  setSession(null)
}

export async function updateProfile(user, { displayName, photoURL } = {}) {
  const acct = Object.values(getState().accounts).find((a) => a.uid === user.uid)
  if (!acct) return
  if (displayName !== undefined) acct.displayName = displayName
  if (photoURL !== undefined) acct.photoURL = photoURL
  persist()
  if (auth.currentUser?.uid === user.uid) {
    auth.currentUser = makeUser(user.uid)
    watchers.forEach((fn) => fn(auth.currentUser))
  }
}

// Demo-only: one-tap sign-in as a seeded trader (no password typing on stage).
export function demoSignInAs(uid) {
  setSession(uid)
  return auth.currentUser
}
