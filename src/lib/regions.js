// Everything that changes by country lives here. Adding a country = adding one entry.
import { t } from '../i18n/index.js'

export const COUNTRIES = {
  ZW: {
    code: 'ZW',
    flag: '🇿🇼',
    dial: '263',
    towns: [
      'Harare', 'Chitungwiza', 'Epworth', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma',
      'Marondera', 'Chinhoyi', 'Bindura', 'Victoria Falls', 'Hwange', 'Beitbridge', 'Kariba', 'Rusape',
      'Chegutu', 'Zvishavane', 'Gwanda',
    ],
    currencies: ['USD', 'ZiG'],
    boosts: [
      { id: 'b3', days: 3, amount: 0.5, currency: 'USD' },
      { id: 'b7', days: 7, amount: 1, currency: 'USD' },
      { id: 'b30', days: 30, amount: 3, currency: 'USD' },
    ],
    payMethods: ['ecocash', 'onemoney', 'innbucks', 'card'],
  },
  ZA: {
    code: 'ZA',
    flag: '🇿🇦',
    dial: '27',
    towns: [
      'Johannesburg', 'Soweto', 'Pretoria', 'Cape Town', 'Durban', 'Gqeberha', 'Bloemfontein', 'Polokwane',
      'Mbombela', 'Musina', 'Rustenburg', 'East London', 'Kimberley', 'Pietermaritzburg', 'Midrand', 'Germiston',
    ],
    currencies: ['ZAR', 'USD'],
    boosts: [
      { id: 'b3', days: 3, amount: 10, currency: 'ZAR' },
      { id: 'b7', days: 7, amount: 20, currency: 'ZAR' },
      { id: 'b30', days: 30, amount: 50, currency: 'ZAR' },
    ],
    payMethods: ['card', 'eft'],
  },
}

export const COUNTRY_CODES = Object.keys(COUNTRIES)
export const country = (code) => COUNTRIES[code] || COUNTRIES.ZW

// Mobile-money methods ask for a phone number and push a PIN prompt to it.
export const PHONE_METHODS = ['ecocash', 'onemoney', 'innbucks']

export function money(amount, currency) {
  const n = Number(amount)
  const v = Number.isInteger(n) ? n : n.toFixed(2)
  if (currency === 'ZiG') return `ZiG ${v}`
  if (currency === 'ZAR') return `R${v}`
  return `US$${v}`
}

// "Will add US$5 cash" / "Wants R50 cash on top"
export function topupText(topup, { short = false } = {}) {
  if (!topup?.amount || !topup?.dir) return ''
  const m = money(topup.amount, topup.currency)
  if (short) return topup.dir === 'add' ? t('topup.addShort', { m }) : t('topup.wantShort', { m })
  return topup.dir === 'add' ? t('topup.add', { m }) : t('topup.want', { m })
}

// Local numbers -> international digits for wa.me links: 077 123 4567 (ZW) -> 263771234567
export function normalizePhone(raw, code = 'ZW') {
  const dial = country(code).dial
  let d = String(raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = dial + d.slice(1)
  if (d.length === 9 && !d.startsWith(dial)) d = dial + d
  return d
}

export function whatsappLink(phone, text) {
  const n = String(phone || '').replace(/\D/g, '')
  if (!n) return ''
  return `https://wa.me/${n}?text=${encodeURIComponent(text || '')}`
}

export const DEFAULT_CATEGORIES = [
  { id: 'food', icon: '🌽', order: 1 },
  { id: 'livestock', icon: '🐐', order: 2 },
  { id: 'farming', icon: '🌱', order: 3 },
  { id: 'services', icon: '🛠️', order: 4 },
  { id: 'phones', icon: '📱', order: 5 },
  { id: 'solar', icon: '☀️', order: 6 },
  { id: 'clothing', icon: '👗', order: 7 },
  { id: 'household', icon: '🪑', order: 8 },
  { id: 'building', icon: '🧱', order: 9 },
  { id: 'school', icon: '📚', order: 10 },
  { id: 'transport', icon: '🚲', order: 11 },
  { id: 'other', icon: '📦', order: 12 },
]

// Category names are translated by id; a stored name is only a fallback for custom categories.
export const categoryName = (c) => (c ? t(`cat.${c.id}`, {}, c.name || c.id) : t('cat.other'))
export { placeholderArt } from './icons.js'


export const isBoosted = (l) => {
  const u = l?.boosted_until
  const ms = u?.toMillis ? u.toMillis() : u?.toDate ? u.toDate().getTime() : u ? new Date(u).getTime() : 0
  return ms > Date.now()
}
