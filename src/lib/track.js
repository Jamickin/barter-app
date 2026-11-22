// Funnel events (view_listing, start_offer, offer_sent, boost_checkout, boost_paid, sign_up...).
// Pushed to window.dataLayer so Google Tag Manager / GA4 or Plausible can be dropped in later with no code changes.
export function track(event, params = {}) {
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...params })
    if (import.meta.env.DEV) console.debug('[track]', event, params)
  } catch {
    /* never let analytics break the app */
  }
}
