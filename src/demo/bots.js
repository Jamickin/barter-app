// The seeded traders answer messages and offers, so a demo on one phone still feels like a live market.
import { getState, persist, newId } from './db.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const lastSaid = {}

function replyFor(text, listing, bot) {
  const t = text.toLowerCase()
  const item = listing?.tradeWhat?.toLowerCase() || 'it'
  if (/where|meet|collect|deliver|location|place/.test(t))
    return pick([
      `I am in ${bot.area || bot.town}. We can meet at the shops there, Saturday morning?`,
      `Let us meet in ${bot.town} town centre, near the bus terminus. Tomorrow at 10?`,
      `If you come to ${bot.area || bot.town} I will wait for you at the main road.`,
    ])
  if (/when|today|tomorrow|time/.test(t)) return pick(['Tomorrow after 10 is fine.', 'Today after 4pm I am free.'])
  if (/still|available|have/.test(t)) return `Yes, the ${item} is still available.`
  if (/photo|picture|pic/.test(t)) return 'I will send more photos on WhatsApp tonight.'
  if (/cash|usd|\$|zig|money/.test(t)) return 'A little cash on top would help, but I prefer a swap.'
  if (/^(hi|hello|hey|mangwanani|masikati|manheru|salibonani|sawubona|good)/.test(t))
    return pick(['Hello! How can I help?', 'Hesi! Are you interested in the swap?', 'Salibonani! What do you have in mind?'])
  return pick([
    'Sounds good. Send me an offer with what you have.',
    'Okay, let me think about it and get back to you.',
    `Thanks. For the ${item} I would really like ${listing?.forWhat?.toLowerCase() || 'a fair swap'}.`,
  ])
}

function post(from, to, listingId, text, extra = {}) {
  getState().collections.messages[`m-${newId()}`] = {
    from_user_id: from,
    to_user_id: to,
    participants: [from, to].sort(),
    listing_id: listingId || null,
    text,
    type: 'text',
    read: false,
    created_at: { __ts: Date.now() },
    ...extra,
  }
}

export function afterWrite(collection, id, kind) {
  if (collection !== 'messages' || kind !== 'add') return
  const s = getState()
  const m = s.collections.messages[id]
  const bot = s.collections.users[m?.to_user_id]
  if (!bot?.demo_bot) return
  const listing = s.collections.listings[m.listing_id]

  setTimeout(
    () => {
      const st = getState()
      const msg = st.collections.messages[id]
      if (!msg) return
      msg.read = true

      if (msg.type === 'offer' && msg.offer?.status === 'open') {
        const want = st.collections.listings[msg.offer.want_listing_id]
        const accept = want?.status === 'available' && (msg.offer.topup?.dir === 'add' || Math.random() < 0.75)
        if (accept) {
          msg.offer.status = 'accepted'
          for (const lid of [msg.offer.give_listing_id, msg.offer.want_listing_id]) {
            const l = st.collections.listings[lid]
            if (l) l.status = 'pending'
          }
          post(msg.to_user_id, msg.from_user_id, msg.listing_id, 'Deal! 🤝 Let us arrange where to meet.')
        } else {
          msg.offer.status = 'declined'
          post(msg.to_user_id, msg.from_user_id, msg.listing_id, pick([
            'Sorry, not this time. Can you add a little cash?',
            'Thank you, but I really need what I listed. Anything else?',
          ]))
        }
      } else {
        let text = replyFor(msg.text || '', listing, bot)
        for (let i = 0; i < 4 && text === lastSaid[msg.to_user_id]; i++) text = replyFor(msg.text || '', listing, bot)
        lastSaid[msg.to_user_id] = text
        post(msg.to_user_id, msg.from_user_id, msg.listing_id, text)
      }
      persist()
    },
    1400 + Math.random() * 1600,
  )
}
