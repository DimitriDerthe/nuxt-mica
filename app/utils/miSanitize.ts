/**
 * Allow-list HTML sanitizer for the rich-text editor. Pure string processing (no DOM), so it runs the same
 * on the server, in the browser and in tests. Anything not explicitly allowed is removed; text is always kept escaped.
 */

/** Tags that survive sanitizing. */
export const MI_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'code', 'pre'] as const

/** Protocols an `a[href]` may use. */
export const MI_ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const

const ALLOWED = new Set<string>(MI_ALLOWED_TAGS)
/* Equivalent tags rewritten to the allowed ones. */
const ALIAS: Record<string, string> = { b: 'strong', i: 'em', strike: 's', del: 's', div: 'p', h1: 'h2', h4: 'h3', h5: 'h3', h6: 'h3' }
/* Elements whose whole content is dropped, not only the tag. */
const DROP_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'textarea', 'title', 'svg', 'math', 'head', 'frame', 'frameset', 'applet', 'select', 'option'])
const MAX_DEPTH = 40

const NAMED: Record<string, string> = { colon: ':', tab: '\t', newline: '\n', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', sol: '/', lpar: '(', rpar: ')' }

/** Escapes text for use inside an HTML text node or a double-quoted attribute. */
export function miEscapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function decodeEntities(s: string): string {
  return s.replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));?/gi, (m, hex, dec, name) => {
    if (hex || dec) {
      const code = hex ? parseInt(hex, 16) : parseInt(dec, 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    }
    return NAMED[String(name).toLowerCase()] ?? m
  })
}

/** Returns the cleaned URL when it is http(s) or mailto, otherwise `null`. Handles entity and whitespace obfuscation. */
export function miSafeUrl(raw: string): string | null {
  const cleaned = Array.from(decodeEntities(raw)).filter((ch) => {
    const c = ch.codePointAt(0)!
    return !(c <= 0x20 || (c >= 0x7f && c <= 0x9f) || (c >= 0x200b && c <= 0x200f) || c === 0x2028 || c === 0x2029 || c === 0xfeff)
  }).join('')
  const m = /^([a-z][a-z0-9+.-]*:)/i.exec(cleaned)
  if (!m) return null
  if (!(MI_ALLOWED_PROTOCOLS as readonly string[]).includes(m[1]!.toLowerCase())) return null
  return cleaned
}

const ATTR_RE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

function readHref(attrs: string): string | null {
  let href: string | null = null
  for (const m of attrs.matchAll(ATTR_RE)) {
    if (m[1]!.toLowerCase() !== 'href') continue
    href = m[2] ?? m[3] ?? m[4] ?? ''
    break
  }
  return href === null ? null : miSafeUrl(href)
}

/** Finds the end of a tag starting at `start` (the `<`), honouring quoted attribute values. Returns -1 when unterminated. */
function tagEnd(html: string, start: number): number {
  let quote = ''
  for (let i = start + 1; i < html.length; i++) {
    const c = html[i]!
    if (quote) { if (c === quote) quote = '' } else if (c === '"' || c === "'") quote = c
    else if (c === '>') return i
  }
  return -1
}

/** Sanitizes an HTML string to the editor's allow-list. Idempotent. */
export function miSanitizeHtml(input: string | null | undefined): string {
  const html = typeof input === 'string' ? input : ''
  let out = ''
  const stack: string[] = []
  let i = 0
  while (i < html.length) {
    const lt = html.indexOf('<', i)
    if (lt === -1) { out += html.slice(i).replace(/>/g, '&gt;'); break }
    out += html.slice(i, lt).replace(/>/g, '&gt;')
    const rest = html.slice(lt, lt + 4)
    if (rest === '<!--') {
      const end = html.indexOf('-->', lt + 4)
      i = end === -1 ? html.length : end + 3
      continue
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end = html.indexOf('>', lt)
      i = end === -1 ? html.length : end + 1
      continue
    }
    const m = /^<(\/?)([a-z][a-z0-9-]*)/i.exec(html.slice(lt, lt + 40))
    if (!m) { out += '&lt;'; i = lt + 1; continue }
    const end = tagEnd(html, lt)
    if (end === -1) { out += '&lt;'; i = lt + 1; continue }
    const closing = m[1] === '/'
    const raw = m[2]!.toLowerCase()
    const name = ALIAS[raw] ?? raw
    const attrs = html.slice(lt + m[0].length, end)
    i = end + 1

    if (DROP_CONTENT.has(raw)) {
      if (!closing && !/\/\s*$/.test(attrs)) {
        const close = new RegExp(`</${raw}[\\s/>]`, 'i').exec(html.slice(i))
        if (!close) { i = html.length } else {
          const e = html.indexOf('>', i + close.index)
          i = e === -1 ? html.length : e + 1
        }
      }
      continue
    }
    if (!ALLOWED.has(name)) continue
    if (name === 'br') { if (!closing) out += '<br>'; continue }
    if (closing) {
      const at = stack.lastIndexOf(name)
      if (at === -1) continue
      while (stack.length > at) out += `</${stack.pop()}>`
      continue
    }
    if (stack.length >= MAX_DEPTH) continue
    if (name === 'a') {
      const href = readHref(attrs)
      stack.push('a')
      out += href ? `<a href="${miEscapeHtml(href)}" target="_blank" rel="noopener noreferrer">` : '<a>'
      continue
    }
    stack.push(name)
    out += `<${name}>`
  }
  while (stack.length) out += `</${stack.pop()}>`
  return out
}

/** Plain text to editor HTML: blank lines split paragraphs, single newlines become `<br>`. */
export function miTextToHtml(text: string): string {
  const paras = text.replace(/\r\n?/g, '\n').split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  return paras.map(p => `<p>${miEscapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')
}

/** Visible text of an HTML string (tags removed, common entities decoded). */
export function miHtmlToText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|h2|h3|blockquote|pre)>/gi, '\n').replace(/<[^>]*>/g, '')).trim()
}

/** True when the HTML holds no visible text (empty, only tags or only `<br>`). */
export function miIsEmptyHtml(html: string | null | undefined): boolean {
  return !html || miHtmlToText(html).replace(/\s/g, '') === ''
}
