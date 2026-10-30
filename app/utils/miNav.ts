/** Shared helpers for the Navigation group. */

export type MiNavIconName =
  | 'home' | 'inbox' | 'folder' | 'calendar' | 'document' | 'search' | 'photo' | 'person'
  | 'back' | 'forward' | 'chevron-right' | 'sidebar' | 'grid' | 'list' | 'share' | 'plus' | 'check'
  | 'settings' | 'people' | 'billing'

/** Inner SVG markup (24x24 viewBox, stroke based) of the built-in navigation glyphs. Static, trusted strings. */
export const miNavIcons: Record<MiNavIconName, string> = {
  'home': '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
  'inbox': '<path d="M3.5 13.5l2.3-7.4A2 2 0 017.7 4.7h8.6a2 2 0 011.9 1.4l2.3 7.4V18a1.5 1.5 0 01-1.5 1.5h-14A1.5 1.5 0 013.5 18z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
  'folder': '<path d="M3.5 7a1.5 1.5 0 011.5-1.5h4l2 2h8A1.5 1.5 0 0120.5 9v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18z"/>',
  'calendar': '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  'document': '<path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10.5a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z"/><path d="M14 3.5V8h4"/>',
  'search': '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  'photo': '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="M20.5 16l-5-5-8 8"/>',
  'person': '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>',
  'back': '<path d="M15 5l-7 7 7 7"/>',
  'forward': '<path d="M9 5l7 7-7 7"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  'sidebar': '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M9.5 5v14"/>',
  'grid': '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  'list': '<path d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01"/>',
  'share': '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v8a1 1 0 001 1h10a1 1 0 001-1v-8"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'settings': '<path d="M18.5 9.6L20.8 10.1V13.9L18.5 14.4L18.3 14.9L19.5 16.9L16.9 19.5L14.9 18.3L14.4 18.5L13.9 20.8H10.1L9.6 18.5L9.1 18.3L7.1 19.5L4.5 16.9L5.7 14.9L5.5 14.4L3.2 13.9V10.1L5.5 9.6L5.7 9.1L4.5 7.1L7.1 4.5L9.1 5.7L9.6 5.5L10.1 3.2H13.9L14.4 5.5L14.9 5.7L16.9 4.5L19.5 7.1L18.3 9.1Z"/><circle cx="12" cy="12" r="3"/>',
  'people': '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5a6.5 6.5 0 0113 0M16 5.2a3.5 3.5 0 010 6.6M18 13.5a6.5 6.5 0 013.5 6"/>',
  'billing': '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>'
}

/** Move focus between sibling controls with the arrow keys, Home and End. Returns true when handled. */
export function miNavRoving(
  e: KeyboardEvent,
  root: HTMLElement | null,
  selector: string,
  orientation: 'horizontal' | 'vertical' | 'both' = 'both'
): boolean {
  if (!root) return false
  const prev = orientation === 'vertical' ? ['ArrowUp'] : orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp', 'ArrowLeft']
  const next = orientation === 'vertical' ? ['ArrowDown'] : orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown', 'ArrowRight']
  const isPrev = prev.includes(e.key)
  const isNext = next.includes(e.key)
  if (!isPrev && !isNext && e.key !== 'Home' && e.key !== 'End') return false
  const list = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
  if (!list.length) return false
  const cur = list.indexOf(document.activeElement as HTMLElement)
  let idx = cur
  if (e.key === 'Home') idx = 0
  else if (e.key === 'End') idx = list.length - 1
  else if (isNext) idx = cur < 0 ? 0 : (cur + 1) % list.length
  else idx = cur < 0 ? list.length - 1 : (cur - 1 + list.length) % list.length
  e.preventDefault()
  list[idx]?.focus()
  return true
}

/** Page numbers (and `'…'` gaps) to render for a pagination of `total` pages. */
export function miPageRange(page: number, total: number, siblings = 1): Array<number | '…'> {
  const count = siblings * 2 + 5
  if (total <= count) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, total)
  const showL = left > 3
  const showR = right < total - 2
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  if (!showL && showR) return [...range(1, 3 + siblings * 2), '…', total]
  if (showL && !showR) return [1, '…', ...range(total - (2 + siblings * 2), total)]
  return [1, '…', ...range(left, right), '…', total]
}

/** Widest MiPagination row in px for `siblings`, whatever the current page: two arrows plus every slot at the width of the last page number. */
export function miPagerWidth(total: number, siblings: number): number {
  const slots = Math.min(total, siblings * 2 + 5)
  const page = Math.max(36, 12 + 9 * String(total).length)
  return 72 + slots * page + (slots + 1) * 4
}
