/**
 * Typed, tree-shakeable icon set. Every icon is the inner markup of a 24x24 SVG that is drawn
 * with `stroke="currentColor"`, round caps and joins (SF-Symbols-like). Import a single constant
 * (for example `miiHome`) and pass it to `<MiIcon :svg="miiHome" />` to keep unused icons out of the
 * bundle, or use `<MiIcon name="home" />` with the full `miIcons` map.
 */

export const miiWidgets = '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><circle cx="16.75" cy="16.75" r="3.25"/>'
export const miiHome = '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>'
export const miiFolder = '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'
export const miiFolderCompact = '<path d="M3.5 7a1.5 1.5 0 011.5-1.5h4l2 2h8A1.5 1.5 0 0120.5 9v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18z"/>'
export const miiFolderPlus = '<path d="M3.5 7a1.5 1.5 0 011.5-1.5h4l2 2h8A1.5 1.5 0 0120.5 9v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18z"/><path d="M12 11v5M9.5 13.5h5"/>'
export const miiTray = '<path d="M3.5 13.5l2.3-7.4A2 2 0 017.7 4.7h8.6a2 2 0 011.9 1.4l2.3 7.4V18a1.5 1.5 0 01-1.5 1.5h-14A1.5 1.5 0 013.5 18z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>'
export const miiCalendar = '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'
export const miiSettings = '<path d="M18.5 9.6L20.8 10.1V13.9L18.5 14.4L18.3 14.9L19.5 16.9L16.9 19.5L14.9 18.3L14.4 18.5L13.9 20.8H10.1L9.6 18.5L9.1 18.3L7.1 19.5L4.5 16.9L5.7 14.9L5.5 14.4L3.2 13.9V10.1L5.5 9.6L5.7 9.1L4.5 7.1L7.1 4.5L9.1 5.7L9.6 5.5L10.1 3.2H13.9L14.4 5.5L14.9 5.7L16.9 4.5L19.5 7.1L18.3 9.1Z"/><circle cx="12" cy="12" r="3"/>'
export const miiBilling = '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>'
export const miiPeople = '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5a6.5 6.5 0 0113 0M16 5.2a3.5 3.5 0 010 6.6M18 13.5a6.5 6.5 0 013.5 6"/>'
export const miiSearch = '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'
export const miiGrid = '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'
export const miiListBullet = '<path d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01"/>'
export const miiListDots = '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>'
export const miiBell = '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>'
export const miiPlus = '<path d="M12 5v14M5 12h14"/>'
export const miiMinus = '<path d="M5 12h14"/>'
export const miiDash = '<path d="M6 12h12"/>'
export const miiStar = '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'
export const miiBookmark = '<path d="M7 4.5h10a1 1 0 011 1V20l-6-4-6 4V5.5a1 1 0 011-1z"/>'
export const miiShare = '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v8a1 1 0 001 1h10a1 1 0 001-1v-8"/>'
export const miiSliders = '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
export const miiChevronRight = '<path d="M9 5l7 7-7 7"/>'
export const miiChevronLeft = '<path d="M15 5l-7 7 7 7"/>'
export const miiChevronDown = '<path d="M6 9l6 6 6-6"/>'
export const miiChevronUp = '<path d="M6 15l6-6 6 6"/>'
export const miiChevronUpDown = '<path d="M7 9l5-5 5 5M7 15l5 5 5-5"/>'
export const miiTrash = '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'
export const miiHeart = '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>'
export const miiClose = '<path d="M6 6l12 12M18 6L6 18"/>'
export const miiMore = '<circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/>'
export const miiSidebar = '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M9.5 5v14"/>'
export const miiColumns = '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M9.2 5v14M14.8 5v14"/>'
export const miiAlignLeft = '<path d="M4 6h16M4 12h10M4 18h13"/>'
export const miiAlignCenter = '<path d="M4 6h16M7 12h10M5.5 18h13"/>'
export const miiAlignRight = '<path d="M4 6h16M10 12h10M7 18h13"/>'
export const miiSpinnerArc = '<path d="M12 3a9 9 0 019 9"/><path d="M21 12a9 9 0 11-9-9" opacity=".3"/>'
export const miiArc = '<path d="M12 3a9 9 0 019 9"/>'
export const miiSpinner = '<g stroke-linecap="round"><path d="M12 3v4"/><path d="M18.4 5.6l-2.8 2.8" opacity=".86"/><path d="M21 12h-4" opacity=".72"/><path d="M18.4 18.4l-2.8-2.8" opacity=".58"/><path d="M12 21v-4" opacity=".44"/><path d="M5.6 18.4l2.8-2.8" opacity=".32"/><path d="M3 12h4" opacity=".22"/><path d="M5.6 5.6l2.8 2.8" opacity=".14"/></g>'
export const miiArrowUp = '<path d="M12 19V5M6 11l6-6 6 6"/>'
export const miiArrowDown = '<path d="M12 5v14M6 13l6 6 6-6"/>'
export const miiArrowLeft = '<path d="M19 12H5M11 6l-6 6 6 6"/>'
export const miiArrowRight = '<path d="M5 12h14M13 6l6 6-6 6"/>'
export const miiMoon = '<path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z"/>'
export const miiSun = '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>'
export const miiDesktop = '<rect x="3.5" y="4.5" width="17" height="11.5" rx="2.5"/><path d="M9 20h6M12 16v4"/>'
export const miiEye = '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'
export const miiGlobe = '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>'
export const miiArchive = '<rect x="3.5" y="4.5" width="17" height="5" rx="1.5"/><path d="M5 9.5V18a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 18V9.5M10 13h4"/>'
export const miiImage = '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="M20.5 16l-5-5-8 8"/>'
export const miiCheck = '<path d="M5 12.5l4.5 4.5L19 7"/>'
export const miiPerson = '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>'
export const miiPersonFill = '<circle cx="12" cy="8.5" r="4"/><path d="M4 20.5a8 8 0 0116 0z"/>'
export const miiDocument = '<path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10.5a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z"/><path d="M14 3.5V8h4"/>'
export const miiWifi = '<path d="M3 9.5a13 13 0 0118 0M6 13a8 8 0 0112 0M9 16.5a3.5 3.5 0 016 0"/><circle cx="12" cy="19.5" r=".8"/>'
export const miiBluetooth = '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>'
export const miiLock = '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>'
export const miiSpeaker = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>'
export const miiSpeakerWave = '<path d="M3 9.5h3.5L11 5.5v13l-4.5-4H3z"/><path d="M15 9a4 4 0 010 6M17.5 6.5a7.5 7.5 0 010 11"/>'
export const miiCopy = '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8"/>'
export const miiPencil = '<path d="M14.5 5.5l4 4L8 20H4v-4z"/>'
export const miiChat = '<path d="M4.5 6.5h15v10h-9l-4 3.5v-3.5h-2z"/>'
export const miiInfoCircle = '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>'
export const miiCheckCircle = '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16 9.5"/>'
export const miiExclamationCircle = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v5M12 16.2v.2"/>'
export const miiWarning = '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.3v.2"/>'
export const miiCheckCircleFill = '<circle cx="12" cy="12" r="9.5" fill="var(--mi-green)" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>'
export const miiXCircleFill = '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M9 9l6 6M15 9l-6 6" stroke="var(--mi-card)" stroke-width="2"/>'

export const miIcons = {
  'widgets': miiWidgets,
  'home': miiHome,
  'folder': miiFolder,
  'folder-compact': miiFolderCompact,
  'folder-plus': miiFolderPlus,
  'tray': miiTray,
  'calendar': miiCalendar,
  'people': miiPeople,
  'settings': miiSettings,
  'billing': miiBilling,
  'search': miiSearch,
  'grid': miiGrid,
  'list-bullet': miiListBullet,
  'list-dots': miiListDots,
  'bell': miiBell,
  'plus': miiPlus,
  'minus': miiMinus,
  'dash': miiDash,
  'star': miiStar,
  'bookmark': miiBookmark,
  'share': miiShare,
  'sliders': miiSliders,
  'chevron-right': miiChevronRight,
  'chevron-left': miiChevronLeft,
  'chevron-down': miiChevronDown,
  'chevron-up': miiChevronUp,
  'chevron-up-down': miiChevronUpDown,
  'trash': miiTrash,
  'heart': miiHeart,
  'close': miiClose,
  'more': miiMore,
  'sidebar': miiSidebar,
  'columns': miiColumns,
  'align-left': miiAlignLeft,
  'align-center': miiAlignCenter,
  'align-right': miiAlignRight,
  'spinner-arc': miiSpinnerArc,
  'arc': miiArc,
  'spinner': miiSpinner,
  'arrow-up': miiArrowUp,
  'arrow-down': miiArrowDown,
  'arrow-left': miiArrowLeft,
  'arrow-right': miiArrowRight,
  'moon': miiMoon,
  'sun': miiSun,
  'desktop': miiDesktop,
  'eye': miiEye,
  'globe': miiGlobe,
  'archive': miiArchive,
  'image': miiImage,
  'check': miiCheck,
  'person': miiPerson,
  'person-fill': miiPersonFill,
  'document': miiDocument,
  'wifi': miiWifi,
  'bluetooth': miiBluetooth,
  'lock': miiLock,
  'speaker': miiSpeaker,
  'speaker-wave': miiSpeakerWave,
  'copy': miiCopy,
  'pencil': miiPencil,
  'chat': miiChat,
  'info-circle': miiInfoCircle,
  'check-circle': miiCheckCircle,
  'exclamation-circle': miiExclamationCircle,
  'warning': miiWarning,
  'check-circle-fill': miiCheckCircleFill,
  'x-circle-fill': miiXCircleFill
} as const

export type MiIconName = keyof typeof miIcons

export const miIconNames = Object.keys(miIcons) as MiIconName[]

/** Icons that spin one full turn with `steps()` rather than smoothly (activity indicator look). */
export const miSteppedIcons: readonly MiIconName[] = ['spinner']

export function miIconMarkup(name: MiIconName | undefined, svg?: string): string {
  if (svg) return svg
  return name ? (miIcons[name] ?? '') : ''
}
