// Guards for props that reach URLs, element names and inline styles, so apps can forward user data without opening an XSS path.

/** Schemes that execute script or embed documents when used as a link target. */
const UNSAFE_SCHEME = /^(?:javascript|vbscript|data):/

/**
 * Returns the href unchanged, or undefined when it uses a script-capable scheme (javascript:, vbscript:, data:).
 * Browsers ignore whitespace and control characters inside a scheme, so they are stripped before the check.
 */
export function miSafeHref(href: string | null | undefined): string | undefined {
  if (href == null) return undefined
  // eslint-disable-next-line no-control-regex
  const scheme = String(href).replace(/[\u0000- \u007F]/g, '').toLowerCase()
  return UNSAFE_SCHEME.test(scheme) ? undefined : href
}

/** Elements that run script, load documents or change how the page is parsed; never valid as a component root. */
const UNSAFE_TAGS = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'base', 'link', 'meta', 'template', 'noscript', 'title', 'svg', 'math'])

/** Returns the element name when it is a plain, safe HTML tag, otherwise the fallback. */
export function miSafeTag(tag: string | null | undefined, fallback: string): string {
  const t = String(tag ?? '').trim().toLowerCase()
  return /^[a-z][a-z0-9-]*$/.test(t) && !UNSAFE_TAGS.has(t) ? t : fallback
}

/**
 * Returns the color when it is a single CSS value (hex, named, rgb(), var(), light-dark(), color-mix()...),
 * otherwise the fallback. Rejects declaration breakouts (; { }), url() requests and quoted strings.
 */
export function miSafeColor<T extends string | undefined>(color: string | null | undefined, fallback: T): string | T {
  if (color == null) return fallback
  const c = String(color)
  return /^[#a-z0-9(),.%\s+\-/]+$/i.test(c) && !/url\s*\(|expression\s*\(/i.test(c) ? c : fallback
}
