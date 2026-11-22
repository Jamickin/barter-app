# Barter

A marketplace for swapping goods, food, livestock and skills, built for places where cash is short. Starting in Zimbabwe and South Africa, in English, Shona, Ndebele and Portuguese.

**Live demo:** https://barter-zw.netlify.app. Tap "Try as Tendai" to sign in as a trader with listings and chats already set up.

## What it does

- **List anything, free.** Photo first, three required fields, category by tap. Photos are shrunk on the phone before upload to save mobile data.
- **Offer a swap.** Offer one of your listings, or something unlisted, with optional cash in USD, ZiG or Rand to balance it. The other side accepts or declines in chat.
- **Chat or WhatsApp.** In-app messages with live read receipts and quick replies, plus one tap to WhatsApp.
- **Boosts (revenue).** Pay to show a listing first. Checkout supports EcoCash, OneMoney, InnBucks and card (ZW), and card and instant EFT (ZA). In the demo it's a pretend checkout.
- **Trust and safety.** Trader profiles, safety tips, report listing, community guidelines.
- **Built for phones.** Bottom tab bar, sticky action bars, bottom sheets, 48px tap targets, about 75 KB of JavaScript (gzipped).

## Stack

Vue 3, Vite, Tailwind CSS 4, Firebase (Auth, Firestore, Storage). Hosted on Netlify.

## Demo mode vs Firebase

The default build swaps `firebase/*` imports for an in-browser backend in `src/demo/` (a Vite alias in `vite.config.js`). It has the same API, keeps data in the visitor's own browser, and needs no server and costs nothing. Seed data is in `src/demo/seed.js`, and pretend traders reply to messages and offers (`src/demo/bots.js`).

To run on real Firebase, copy `.env.example` to `.env`, fill in the keys and build with `VITE_BACKEND=firebase`. Deploy `firestore.rules` and `storage.rules`. Boost payments must then be confirmed by a server function (for example a Paynow webhook); the rules already block the browser from writing payments or `boosted_until`.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run lint
node scripts/i18n-check.mjs   # missing translations per language
```

## Where things are

| Path | What |
|---|---|
| `src/views/` | Pages: home, browse, listing, messages, create/edit, profile, auth, policies |
| `src/components/` | Listing card, listing form, boost checkout, preferences sheet, icons |
| `src/lib/regions.js` | Countries: towns, currencies, boost prices, payment methods |
| `src/i18n/` | Translations and the `t()` helper. Shona and Ndebele are drafts, see `TRANSLATION_REVIEW.md` |
| `src/content/policies.js` | Draft Terms, Privacy, Guidelines, Boost terms (need legal review) |
| `src/lib/track.js` | Funnel events pushed to `dataLayer` (GA4 / GTM ready) |

## Deploy

```sh
npx vite build
npx netlify-cli deploy --prod --dir dist --no-build
```
