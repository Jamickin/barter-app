// The starting world every demo visitor gets. All people here are fictional.
import { DEFAULT_CATEGORIES, placeholderArt } from '../lib/regions.js'

export const DEMO_USER_ID = 'u-tendai'
export const DEMO_PASSWORD = 'demo1234'

const HOUR = 3600e3

export const PEOPLE = [
  { id: 'u-tendai', name: 'Tendai Moyo', c: 'ZW', town: 'Harare', area: 'Mabvuku', bio: 'Fixing things, growing a few things, always up for a fair swap.', trades: 3 },
  { id: 'u-rudo', name: 'Rudo Chikwanha', c: 'ZW', town: 'Harare', area: 'Mbare', bio: 'Vegetables from my plot and the market. Fresh every week.', trades: 14 },
  { id: 'u-farai', name: 'Farai Ncube', c: 'ZW', town: 'Bulawayo', area: 'Nkulumane', bio: 'Welder and bicycle mechanic.', trades: 9 },
  { id: 'u-chipo', name: 'Chipo Mutasa', c: 'ZW', town: 'Mutare', area: 'Sakubva', bio: 'Dressmaker. School uniforms, church wear, alterations.', trades: 21 },
  { id: 'u-blessing', name: 'Blessing Dube', c: 'ZW', town: 'Gweru', area: 'Mkoba', bio: 'Small farm: goats, maize, oxen for ploughing.', trades: 6 },
  { id: 'u-tatenda', name: 'Tatenda Mapfumo', c: 'ZW', town: 'Masvingo', area: 'Mucheke', bio: 'Phone repairs and solar kits.', trades: 11 },
  { id: 'u-nyasha', name: 'Nyasha Sibanda', c: 'ZW', town: 'Chitungwiza', area: 'Zengeza', bio: 'Teacher. Extra lessons for Grade 7 and O Level.', trades: 5 },
  { id: 'u-tsitsi', name: 'Tsitsi Marufu', c: 'ZW', town: 'Marondera', area: 'Dombotombo', bio: 'Road-runner chickens and eggs.', trades: 17 },
  { id: 'u-kudzai', name: 'Kudzai Gumbo', c: 'ZA', town: 'Johannesburg', area: 'Yeoville', bio: 'Electrician. I send goods home to Zim every month.', trades: 12 },
  { id: 'u-thandeka', name: 'Thandeka Nkosi', c: 'ZA', town: 'Soweto', area: 'Orlando East', bio: 'Hair braiding and home baking.', trades: 30 },
  { id: 'u-sipho', name: 'Sipho Mahlangu', c: 'ZA', town: 'Pretoria', area: 'Mamelodi', bio: 'Furniture repairs and woodwork.', trades: 8 },
  { id: 'u-lerato', name: 'Lerato Molefe', c: 'ZA', town: 'Cape Town', area: 'Khayelitsha', bio: 'Grow vegetables in a community garden.', trades: 4 },
]

const L = (id, by, hoursAgo, f) => ({ id, by, hoursAgo, ...f })

const LISTINGS = [
  L('l-phone', 'u-tendai', 30, { cat: 'phones', tradeWhat: 'Itel A70 smartphone', forWhat: 'A bicycle, or a 50kg bag of maize', description: 'Works well, charger included. The back cover is cracked but the screen is perfect. 64GB.', hue: 210 }),
  L('l-barrow', 'u-tendai', 80, { cat: 'building', tradeWhat: 'Wheelbarrow, good tyre', forWhat: '2 bags of cement', description: 'Strong steel tray, tyre replaced last month. Collection in Mabvuku.', hue: 30 }),
  L('l-tomatoes', 'u-rudo', 5, { cat: 'food', tradeWhat: 'Tomatoes, 2 full crates', forWhat: 'Cooking oil (5L) or sugar', description: 'Picked this morning. Firm and red. Can deliver around Mbare.', hue: 2, boostH: 40 }),
  L('l-seedlings', 'u-rudo', 50, { cat: 'farming', tradeWhat: 'Covo & rape seedlings, 200', forWhat: 'School shoes, size 4', description: 'Healthy seedlings ready to transplant this week.', hue: 110 }),
  L('l-bike', 'u-farai', 12, { cat: 'transport', tradeWhat: 'Black Mamba bicycle', forWhat: 'A smartphone or a solar lamp', description: 'Solid frame, new tyres. Needs a new chain — I can fit it if you bring one.', hue: 0, topup: { dir: 'want', amount: 5, currency: 'USD' } }),
  L('l-welding', 'u-farai', 70, { cat: 'services', tradeWhat: 'Welding: gates, burglar bars, frames', forWhat: 'Cement, roofing sheets or a bicycle', description: 'Bring your material or we agree on it. Bulawayo and surrounds.', hue: 40 }),
  L('l-uniforms', 'u-chipo', 20, { cat: 'services', tradeWhat: 'School uniforms sewn to measure', forWhat: 'Fabric, or groceries for the month', description: 'Primary and secondary. One week turnaround. I can also do alterations.', hue: 220 }),
  L('l-zambia', 'u-chipo', 100, { cat: 'clothing', tradeWhat: 'Zambia cloth wraps, 6 pieces', forWhat: 'Cooking oil 5L', description: 'Bright prints, new. Good for gifts.', hue: 320 }),
  L('l-goat', 'u-blessing', 8, { cat: 'livestock', tradeWhat: 'Young Boer goat (buck)', forWhat: 'Solar panel, 100W or bigger', description: 'Healthy, 8 months, dipped and dosed. Gweru, Mkoba.', hue: 35, topup: { dir: 'want', amount: 20, currency: 'USD' }, boostH: 100 }),
  L('l-seedmaize', 'u-blessing', 60, { cat: 'farming', tradeWhat: 'Seed maize, 10kg', forWhat: 'Plough parts or a wheelbarrow', description: 'Certified short-season seed, sealed bag.', hue: 50 }),
  L('l-plough', 'u-blessing', 140, { cat: 'services', tradeWhat: 'Ploughing with oxen, 1 acre', forWhat: 'A share of the harvest or diesel', description: 'Before the rains. Within 10km of Gweru.', hue: 90 }),
  L('l-repair', 'u-tatenda', 16, { cat: 'services', tradeWhat: 'Phone screen repair', forWhat: 'Chickens, maize, or school stationery', description: 'Most Samsung, Tecno and Itel models. Same-day in Mucheke.', hue: 260 }),
  L('l-lantern', 'u-tatenda', 40, { cat: 'solar', tradeWhat: 'Solar lantern + phone charger kit', forWhat: 'A goat, or 2 chickens', description: 'Lights a room for 8 hours, charges a phone. New in box.', hue: 48, topup: { dir: 'want', amount: 10, currency: 'USD' } }),
  L('l-chickens', 'u-tsitsi', 3, { cat: 'livestock', tradeWhat: '10 road-runner chickens', forWhat: 'A bag of Compound D fertiliser', description: 'Free range, about 5 months old.', hue: 25 }),
  L('l-eggs', 'u-tsitsi', 90, { cat: 'food', tradeWhat: 'Fresh eggs, 3 trays a week', forWhat: 'Layers mash (chicken feed)', description: 'Ongoing swap. I can bring them to Marondera town on Saturdays.', hue: 45 }),
  L('l-lessons', 'u-nyasha', 26, { cat: 'services', tradeWhat: 'Maths & English lessons, 4 sessions', forWhat: 'Groceries or data bundles', description: 'Grade 7 and O Level. In Zengeza or by WhatsApp video.', hue: 200 }),
  L('l-books', 'u-nyasha', 200, { cat: 'school', tradeWhat: 'Grade 7 textbook set', forWhat: 'School uniform or shoes', description: 'Maths, English, Shona, Science. Good condition.', hue: 170, status: 'completed' }),
  L('l-sheets', 'u-farai', 160, { cat: 'building', tradeWhat: '4 used roofing sheets', forWhat: 'Bricks or a day of labour', description: 'Some rust but no holes. 3m long.', hue: 15, status: 'pending' }),
  // South Africa
  L('l-wiring', 'u-kudzai', 6, { cat: 'services', tradeWhat: 'House wiring & DB board repairs', forWhat: 'A fridge or a gas stove', description: 'Qualified electrician, Joburg and East Rand. Weekends.', hue: 55, boostH: 60 }),
  L('l-groceries', 'u-kudzai', 36, { cat: 'food', tradeWhat: 'Grocery hamper (rice, oil, sugar)', forWhat: 'Solar panel to send home', description: 'Big hamper, about R900 worth. Collection in Yeoville.', hue: 20, topup: { dir: 'add', amount: 200, currency: 'ZAR' } }),
  L('l-braids', 'u-thandeka', 14, { cat: 'services', tradeWhat: 'Knotless braids, any length', forWhat: 'Baking trays and a mixer', description: 'At my place in Orlando East. Book a Saturday.', hue: 300 }),
  L('l-cakes', 'u-thandeka', 72, { cat: 'food', tradeWhat: 'Birthday cake, made to order', forWhat: 'Kids clothes, ages 4–6', description: 'Vanilla or chocolate, feeds 20.', hue: 340 }),
  L('l-table', 'u-sipho', 22, { cat: 'household', tradeWhat: 'Solid wood dining table, 6 seats', forWhat: 'Laptop for school', description: 'Restored and varnished. Chairs not included.', hue: 28, topup: { dir: 'want', amount: 500, currency: 'ZAR' } }),
  L('l-veg', 'u-lerato', 10, { cat: 'food', tradeWhat: 'Spinach, carrots & beetroot box', forWhat: 'Garden tools or seeds', description: 'Weekly box from our community garden.', hue: 120 }),
]

export function seedState() {
  const now = Date.now()
  const ts = (hoursAgo) => ({ __ts: now - hoursAgo * HOUR })
  const cats = Object.fromEntries(DEFAULT_CATEGORIES.map(({ id, ...c }) => [id, c]))
  const iconOf = (id) => cats[id]?.icon

  const users = {}
  const accounts = {}
  for (const p of PEOPLE) {
    const email = `${p.id.slice(2)}@demo.barter`
    users[p.id] = {
      name: p.name,
      email,
      country: p.c,
      town: p.town,
      area: p.area,
      bio: p.bio,
      whatsapp: '',
      trades_completed: p.trades,
      is_admin: false,
      demo_bot: p.id !== DEMO_USER_ID,
      created_at: ts(24 * (30 + p.trades * 4)),
      updated_at: ts(24),
    }
    accounts[email] = { uid: p.id, email, password: DEMO_PASSWORD, displayName: p.name }
  }

  const listings = {}
  for (const l of LISTINGS) {
    const owner = users[l.by]
    listings[l.id] = {
      tradeWhat: l.tradeWhat,
      forWhat: l.forWhat,
      tradeWhat_lower: l.tradeWhat.toLowerCase(),
      forWhat_lower: l.forWhat.toLowerCase(),
      description: l.description,
      category_id: l.cat,
      status: l.status || 'available',
      country: owner.country,
      location: owner.town,
      area: owner.area,
      topup: l.topup || null,
      boosted_until: l.boostH ? { __ts: now + l.boostH * HOUR } : null,
      image_url: placeholderArt(iconOf(l.cat), l.hue),
      by_user_id: l.by,
      owner: { name: owner.name, email: owner.email },
      created_at: ts(l.hoursAgo),
      updated_at: ts(l.hoursAgo),
    }
  }

  // Conversations already in Tendai's inbox when the demo opens.
  const messages = {}
  let n = 0
  const msg = (from, to, listing, hoursAgo, text, extra = {}) => {
    messages[`m-seed-${++n}`] = {
      from_user_id: from,
      to_user_id: to,
      participants: [from, to].sort(),
      listing_id: listing,
      text,
      type: 'text',
      read: from === DEMO_USER_ID || hoursAgo > 6,
      created_at: ts(hoursAgo),
      ...extra,
    }
  }
  msg('u-tendai', 'u-rudo', 'l-tomatoes', 4.5, 'Mangwanani! Are the tomatoes still available? I have 2L of cooking oil.')
  msg('u-rudo', 'u-tendai', 'l-tomatoes', 4.2, 'Ehe, still here. For 2L I can do one crate. Come before 2pm.')
  msg('u-farai', 'u-tendai', 'l-phone', 2, 'I saw your Itel. My bicycle for your phone? Sending you an offer.')
  msg('u-farai', 'u-tendai', 'l-phone', 1.9, 'Offer: Black Mamba bicycle for your Itel A70', {
    type: 'offer',
    offer: { give_listing_id: 'l-bike', want_listing_id: 'l-phone', topup: null, note: 'No cash needed from either side.', status: 'open' },
  })
  msg('u-tendai', 'u-nyasha', 'l-lessons', 30, 'Hi Nyasha, do you do Saturday lessons? My niece is in Grade 7.')
  msg('u-nyasha', 'u-tendai', 'l-lessons', 29, 'Yes, Saturdays 9–11. What groceries were you thinking?')

  return {
    version: 2,
    seededAt: now,
    session: { uid: null },
    accounts,
    files: {},
    collections: { categories: cats, users, listings, messages, payments: {} },
  }
}
