// Line icons for categories (24×24, stroke). Used in the UI and drawn into placeholder images.
export const CATEGORY_PATHS = {
  food: ['M12 21c-4 0-7-3-7-8 0-3 2-5 4.5-5 1.2 0 2 .5 2.5.5s1.3-.5 2.5-.5C17 8 19 10 19 13c0 5-3 8-7 8Z', 'M12 8c0-2 1-4 3-5'],
  livestock: ['M7 8h10v5a5 5 0 0 1-10 0V8Z', 'M7 9 3.5 6', 'M17 9l3.5-3', 'M10 12h.01', 'M14 12h.01', 'M10.5 15.5h3'],
  farming: ['M12 21v-9', 'M12 12C12 8 9 6 5 6c0 4 3 6 7 6Z', 'M12 10c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5Z'],
  services: ['M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z'],
  phones: ['M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z', 'M11 18h2'],
  solar: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  clothing: ['M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z'],
  household: ['M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4', 'M3 11h18v5H3z', 'M5 16v3', 'M19 16v3'],
  building: ['M3 6h18v12H3z', 'M3 10h18', 'M3 14h18', 'M9 6v4', 'M15 10v4', 'M9 14v4'],
  school: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z', 'M4 19a2 2 0 0 1 2-2h13'],
  transport: ['M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M6 15l4-7h5l3 7', 'M10 8 8.5 5H6', 'M12 15l3-7'],
  other: ['M3 7l9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10'],
}

export const categoryPaths = (id) => CATEGORY_PATHS[id] || CATEGORY_PATHS.other

// Neutral placeholder for listings without a photo: soft grey tile with the category's line icon. ~1 KB, no network.
export function placeholderArt(categoryId = 'other') {
  const paths = categoryPaths(categoryId).map((d) => `<path d="${d}"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f1f1f3"/><g transform="translate(140 140) scale(5)" fill="none" stroke="#a1a1aa" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
