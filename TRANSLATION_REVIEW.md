# Translation review (before launch)

Shona (`src/i18n/sn.js`) and Ndebele (`src/i18n/nd.js`) are first drafts. Portuguese (`pt.js`, Mozambican usage) is ready for a light proofread. Ask a native speaker to read each file on screen, in the app (Country & language button, top right), especially:

## chiShona
- Loanwords kept on purpose: listing / ma listing, offer / maoffer, cash, Boost, profile, chat. Should "listing" and "offer" be Shona words?
- Time: "maawa {n} apfuura" / "mazuva {n} apfuura" are long; "maawa 1" reads oddly.
- Buttons: cancel "Rega", withdraw "Dzosa", share "Govera", me "Ini".
- "Ndinobvumirana ne" + link (should "ne" join the next word?).
- "peji" agreement (class 5 vs class 9).
- status.pending "Kuchinjana kwakamirira", status.completed "Zvachinjaniswa", boost.popular "Inonyanya kutorwa".

## isiNdebele
- Coined "umtshintshi" for trader; "Nikela" for make an offer (maybe use "Offer").
- "akubophi" for optional (maybe "uma ufuna").
- "le/la/lo" before links in agreement lines; "u{name}" prefix in msg.waiting.
- "Inqubomgomo yemfihlo" / "Imigomo" may sound too formal or Zulu.
- "Boost" kept as a loanword.

## All languages
- Policy pages are English only for now; legal translations should be professional.
- Run `node scripts/i18n-check.mjs` after any change: it lists missing keys per language.
