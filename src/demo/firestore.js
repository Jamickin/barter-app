// Stand-in for 'firebase/firestore', covering the calls this app makes.
import { getState, persist, subscribe, revive, freeze, newId, Timestamp, SERVER_TS } from './db.js'
import { afterWrite } from './bots.js'

export { Timestamp }

export function getFirestore() {
  return { __demo: true }
}

export function collection(_db, name) {
  return { kind: 'collection', name, constraints: [] }
}

export function doc(dbOrCol, name, id) {
  if (dbOrCol?.kind === 'collection') return { kind: 'doc', name: dbOrCol.name, id: name ?? newId() }
  return { kind: 'doc', name, id }
}

export function query(ref, ...constraints) {
  return { ...ref, constraints: [...(ref.constraints || []), ...constraints] }
}
export const where = (field, op, value) => ({ type: 'where', field, op, value })
export const orderBy = (field, dir = 'asc') => ({ type: 'orderBy', field, dir })
export const limit = (n) => ({ type: 'limit', n })
export const startAfter = (snap) => ({ type: 'startAfter', id: snap?.id })
export const serverTimestamp = () => SERVER_TS

function table(name) {
  const s = getState()
  return (s.collections[name] ||= {})
}

function docSnap(name, id) {
  const raw = table(name)[id]
  return {
    id,
    ref: { kind: 'doc', name, id },
    exists: () => raw !== undefined,
    data: () => (raw === undefined ? undefined : revive(raw)),
    get: (f) => (raw === undefined ? undefined : revive(raw)[f]),
  }
}

const cmp = (v) => (v && typeof v === 'object' && '__ts' in v ? v.__ts : v)
const getField = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

function matches(raw, { field, op, value }) {
  const a = cmp(getField(raw, field))
  const b = value instanceof Timestamp ? value.toMillis() : value instanceof Date ? value.getTime() : value
  switch (op) {
    case '==': return a === b
    case '!=': return a !== b
    case '<': return a < b
    case '<=': return a <= b
    case '>': return a > b
    case '>=': return a >= b
    case 'in': return b.includes(a)
    case 'not-in': return !b.includes(a)
    case 'array-contains': return Array.isArray(a) && a.includes(b)
    case 'array-contains-any': return Array.isArray(a) && a.some((x) => b.includes(x))
    default: throw new Error(`Demo backend: unsupported operator ${op}`)
  }
}

function runQuery(q) {
  const rows = Object.entries(table(q.name))
  let ids = rows.filter(([, raw]) => q.constraints.filter((c) => c.type === 'where').every((c) => matches(raw, c)))
  const orders = q.constraints.filter((c) => c.type === 'orderBy')
  if (orders.length) {
    ids.sort(([, x], [, y]) => {
      for (const o of orders) {
        const a = cmp(getField(x, o.field))
        const b = cmp(getField(y, o.field))
        if (a === b) continue
        const r = a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1
        return o.dir === 'desc' ? -r : r
      }
      return 0
    })
  }
  const after = q.constraints.find((c) => c.type === 'startAfter')
  if (after) {
    const i = ids.findIndex(([id]) => id === after.id)
    ids = ids.slice(i + 1)
  }
  const lim = q.constraints.find((c) => c.type === 'limit')
  if (lim) ids = ids.slice(0, lim.n)
  const docs = ids.map(([id]) => docSnap(q.name, id))
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn) => docs.forEach(fn) }
}

// A short wait makes loading states visible and keeps behaviour async like the real thing.
const tick = () => new Promise((r) => setTimeout(r, 60))

export async function getDocs(q) {
  await tick()
  return runQuery(q)
}

export async function getDoc(ref) {
  await tick()
  return docSnap(ref.name, ref.id)
}

export async function addDoc(col, data) {
  const id = newId()
  table(col.name)[id] = freeze(data)
  persist()
  afterWrite(col.name, id, 'add')
  return { kind: 'doc', name: col.name, id }
}

export async function setDoc(ref, data, opts = {}) {
  const t = table(ref.name)
  t[ref.id] = opts.merge ? { ...(t[ref.id] || {}), ...freeze(data) } : freeze(data)
  persist()
  afterWrite(ref.name, ref.id, 'set')
}

export async function updateDoc(ref, data) {
  const t = table(ref.name)
  if (!t[ref.id]) {
    const e = new Error(`No document to update: ${ref.name}/${ref.id}`)
    e.code = 'not-found'
    throw e
  }
  t[ref.id] = { ...t[ref.id], ...freeze(data) }
  persist()
  afterWrite(ref.name, ref.id, 'update')
}

export async function deleteDoc(ref) {
  delete table(ref.name)[ref.id]
  persist()
}

export function writeBatch() {
  const ops = []
  return {
    set: (ref, data, o) => ops.push(() => setDoc(ref, data, o)),
    update: (ref, data) => ops.push(() => updateDoc(ref, data)),
    delete: (ref) => ops.push(() => deleteDoc(ref)),
    commit: async () => {
      for (const op of ops) await op()
    },
  }
}

// Live updates: re-run the query whenever the demo data changes (this tab, another tab, or a bot reply).
export function onSnapshot(ref, next) {
  const emit = () => next(ref.kind === 'doc' ? docSnap(ref.name, ref.id) : runQuery(ref))
  setTimeout(emit, 0)
  return subscribe(emit)
}
