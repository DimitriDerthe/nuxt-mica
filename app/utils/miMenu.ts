export type MiMenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
export type MiMenuVariant = 'popup' | 'pulldown'

export interface MiMenuItem {
  /** Unique value. Required for actionable items. */
  value?: string | number
  label?: string
  /** Keyboard shortcut such as `⌘D`, `⇧⌘M` or `Cmd N`: shown as a hint and pressing it selects the item while the menu is open (always with `globalShortcuts`). Bare Enter, Space, Tab, Esc and arrows are ignored. */
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  /** Renders the item as a checkbox-like item. */
  checked?: boolean
  /** Renders a divider. */
  separator?: boolean
  /** Renders a non-interactive group heading. */
  heading?: string
}
