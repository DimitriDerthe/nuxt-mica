// Helpers for the component explorer: slugs, prop control inference and usage snippets.

export interface ApiProp { name: string, type: string, required: boolean, default?: string, doc?: string }

/** MiIconButton -> icon-button */
export const toSlug = (name: string) => name.replace(/^Mi/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
/** MiIconButton -> Icon Button */
export const toTitle = (name: string) => name.replace(/^Mi/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
/** icon-button -> MiIconButton */
export const fromSlug = (slug: string) => 'Mi' + slug.split('-').map(s => s[0]!.toUpperCase() + s.slice(1)).join('')

export type Control =
  /** `bools`: the union also takes true and false, offered as the options "true" and "false". */
  | { kind: 'enum', name: string, options: (string | number)[], bools?: boolean }
  | { kind: 'boolean', name: string }
  | { kind: 'number', name: string }
  | { kind: 'string', name: string, numeric?: boolean }

/** Literal options of a union such as `"a" | "b" | 3`, or null when the type is not a pure literal union. */
export function literalOptions(type: string): (string | number)[] | null {
  const parts = type.split('|').map(s => s.trim()).filter(s => s && s !== 'undefined' && s !== 'null')
  const out: (string | number)[] = []
  for (const p of parts) {
    const m = p.match(/^"(.*)"$/) ?? p.match(/^'(.*)'$/)
    if (m) out.push(m[1]!)
    else if (/^-?\d+(\.\d+)?$/.test(p)) out.push(Number(p))
    else return null
  }
  return out.length ? out : null
}

/** Infer a playground control from a prop's type; null when the prop needs data (arrays, objects, functions). */
export function controlFor(p: ApiProp): Control | null {
  if (p.name === 'modelValue' || p.name.startsWith('aria') || p.name === 'state') return null
  const t = p.type.replace(/\s*\|\s*(undefined|null)\b/g, '').replace(/^(undefined|null)\s*\|\s*/, '').trim()
  if (t === 'boolean') return { kind: 'boolean', name: p.name }
  if (t === 'number') return { kind: 'number', name: p.name }
  if (t === 'string') return { kind: 'string', name: p.name }
  if (/^(string \| number|number \| string)$/.test(t)) return { kind: 'string', name: p.name, numeric: true }
  const opts = literalOptions(t)
  if (opts) return { kind: 'enum', name: p.name, options: opts }
  // A boolean plus presets (`boolean | "auto"`).
  const withBool = literalOptions(t.split('|').map(x => x.trim()).filter(x => x !== 'boolean').join(' | '))
  if (withBool && /\bboolean\b/.test(t)) return { kind: 'enum', name: p.name, options: [...withBool, 'true', 'false'], bools: true }
  // Presets plus a free number (`number | "sm" | "md"`): offer the presets.
  const presets = literalOptions(t.split('|').map(x => x.trim()).filter(x => x !== 'number').join(' | '))
  if (presets && /\bnumber\b/.test(t)) return { kind: 'enum', name: p.name, options: presets }
  return null
}

/** Parse a manifest default such as `"filled"`, `24` or `true` into a value. */
export function parseDefault(d?: string): unknown {
  if (d === undefined) return undefined
  if (/^".*"$/.test(d) || /^'.*'$/.test(d)) return d.slice(1, -1)
  if (d === 'true' || d === 'false') return d === 'true'
  if (/^-?\d+(\.\d+)?$/.test(d)) return Number(d)
  return undefined
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/** `<MiButton variant="tinted" loading>` from the values that differ from the defaults. */
export function usageSnippet(name: string, values: Record<string, unknown>, props: ApiProp[], vmodel: boolean, inner?: string) {
  const attrs: string[] = []
  if (vmodel) attrs.push('v-model="value"')
  for (const [k, v] of Object.entries(values)) {
    const p = props.find(x => x.name === k)
    if (!p || v === undefined || v === '' || v === parseDefault(p.default)) continue
    if (v === false && p.default === undefined) continue
    if (v === true) attrs.push(kebab(k))
    else if (typeof v === 'string') attrs.push(`${kebab(k)}="${v}"`)
    else if (typeof v === 'number' || typeof v === 'boolean') attrs.push(`:${kebab(k)}="${v}"`)
    else attrs.push(`:${kebab(k)}="${k}"`)
  }
  const open = attrs.length > 2 || attrs.join(' ').length > 50
    ? `<${name}\n  ${attrs.join('\n  ')}\n`
    : `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`
  return inner ? `${open}>\n  ${inner}\n</${name}>` : `${open}${open.endsWith('\n') ? '' : ' '}/>`
}
