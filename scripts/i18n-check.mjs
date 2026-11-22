// Lists translation keys used in src/ and reports any missing from each dictionary.
// Usage: node scripts/i18n-check.mjs [--list]
import fs from 'node:fs'
import path from 'node:path'

const used = new Set()
const dynamic = new Set()
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return walk(p)
    if (!/\.(vue|js)$/.test(p) || p.includes('i18n')) return
    const s = fs.readFileSync(p, 'utf8')
    for (const m of s.matchAll(/(?<![A-Za-z0-9_.])\$?t\(\s*(['`])([^'`]+)\1/g)) (m[2].includes('${') ? dynamic : used).add(m[2])
  })
walk('src')

if (process.argv.includes('--list')) {
  console.log([...used].sort().join('\n'))
  console.log('\n# dynamic:\n' + [...dynamic].sort().join('\n'))
  process.exit(0)
}

const get = (o, k) => k.split('.').reduce((x, p) => (x == null ? x : x[p]), o)
let bad = 0
for (const lang of ['en', 'sn', 'nd', 'pt']) {
  const dict = (await import(`../src/i18n/${lang}.js`)).default
  const missing = [...used].filter((k) => get(dict, k) === undefined)
  if (missing.length) {
    bad += missing.length
    console.log(`${lang}: ${missing.length} missing\n  ${missing.join('\n  ')}`)
  } else console.log(`${lang}: ok`)
}
process.exit(bad ? 1 : 0)
