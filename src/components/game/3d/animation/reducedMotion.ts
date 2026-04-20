/**
 * Module-level cache of the user's reduced-motion preference. Synced with
 * `prefers-reduced-motion: reduce` media query. Read directly from the
 * animation store to collapse any flight to an instant snap — score-popup
 * sequencing and engine commits are unaffected because `setTarget` still
 * resolves its Promise synchronously when duration is 0.
 */

let reduced = false

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced = mql.matches
  const listener = (e: MediaQueryListEvent) => {
    reduced = e.matches
  }
  // Modern browsers: addEventListener; older Safari: addListener.
  if (mql.addEventListener) mql.addEventListener('change', listener)
  else mql.addListener(listener)
}

export function prefersReducedMotion(): boolean {
  return reduced
}
