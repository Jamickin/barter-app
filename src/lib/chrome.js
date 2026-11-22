// Fixed bars at the bottom of the screen (tab bar, a page's sticky action bar) publish their height
// as --bottom-chrome so page padding and the lifted Netlify badge can sit clear of them.
import { onMounted, onUnmounted } from 'vue'

export const TABBAR_PX = 60

export function setBottomChrome(px) {
  document.documentElement.style.setProperty('--bottom-chrome', `${px}px`)
}

// A page with its own sticky bar: tell App to hide the tab bar while it's open.
export function useStickyBar(px = 76) {
  onMounted(() => {
    document.documentElement.classList.add('has-sticky-bar')
    setBottomChrome(px)
  })
  onUnmounted(() => {
    document.documentElement.classList.remove('has-sticky-bar')
    setBottomChrome(window.innerWidth < 768 ? TABBAR_PX : 0)
  })
}
