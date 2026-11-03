// Production composition: the static `mi:` classes of each element of an SFC template become one class whose
// rules ship with the component's own CSS chunk. Fewer classes per element means fewer rules for the browser to
// match, and a page loads only the rules of the components it renders. Dynamic classes stay atomic.
import { composeCss, decode, extract, generate, parse } from './engine.ts'

/** Property group: two properties of one group may override each other (`inset` and `top`, `gap` and `row-gap`). */
function group(prop: string): string {
  if (prop.startsWith('--')) return prop
  const p = prop.replace(/^-(webkit|moz|ms)-/, '')
  if (/^(inset|top|right|bottom|left)\b/.test(p)) return 'inset'
  if (/^(place|align|justify)-/.test(p)) return 'align'
  if (/^(gap|row-gap|column-gap|grid-gap)$/.test(p)) return 'gap'
  if (/^(font|line-height)/.test(p)) return 'font'
  if (/^(width|inline-size|min-width|max-width|min-inline-size|max-inline-size)$/.test(p)) return p.replace('inline-size', 'width')
  if (/^(height|block-size|min-height|max-height|min-block-size|max-block-size)$/.test(p)) return p.replace('block-size', 'height')
  if (/^(white-space|text-wrap)/.test(p)) return 'white-space'
  return p.split('-')[0]!
}
const groupsOf = (t: string, prefix: string) => new Set((parse(t, prefix)?.decls ?? []).map(([p]) => group(p)))

interface Composed {
  /** Where the static class attribute value sits in the source, and the classes it keeps besides the composed one. */
  start: number
  end: number
  keep: string[]
  tokens: string[]
  name: string
}

export interface Composition {
  elements: Composed[]
  /** Classes this file still uses one by one. */
  atomic: Set<string>
  /** The one-by-one classes of each element, and those whose element is unknown (script, text). */
  groups: string[][]
  loose: Set<string>
}

function hash(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
  return (h >>> 0).toString(36)
}

/**
 * Plans the composition of one SFC. A static class joins its element's composed class unless a dynamic class of
 * the same element (from `:class`, or from script code) shares a property group with it: their outcome depends on
 * the fixed order of the global sheet, so both stay atomic there.
 */
export function plan(src: string, prefix = 'mi', names?: Map<string, string>): Composition {
  const atomic = new Set<string>()
  const elements: Composed[] = []
  const groups: string[][] = []
  const loose = new Set<string>()
  const blank = src.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, m => ' '.repeat(m.length))
  const scriptTokens = new Set<string>()
  for (const m of src.matchAll(/<script\b[\s\S]*?<\/script>/g)) extract(m[0], prefix, scriptTokens)
  for (const t of scriptTokens) { atomic.add(t); loose.add(t) }
  let last = 0
  let text = ''
  for (let i = blank.indexOf('<'); i !== -1; i = blank.indexOf('<', i + 1)) {
    if (!/[A-Za-z]/.test(blank[i + 1] ?? '')) continue
    let quote = ''
    let j = i + 1
    for (; j < blank.length; j++) {
      const c = blank[j]
      if (quote) { if (c === quote) quote = '' }
      else if (c === '"' || c === '\'') quote = c
      else if (c === '>') break
    }
    text += blank.slice(last, i)
    last = j + 1
    const at = i
    const tag = blank.slice(at, j)
    i = j
    const m = /\sclass="([^"]*)"/.exec(tag)
    const all = extract(tag, prefix)
    if (!m) { for (const t of all) atomic.add(t); groups.push([...all]); continue }
    const valueStart = at + m.index + m[0].indexOf('"') + 1
    const staticTokens = m[1]!.split(/\s+/).filter(t => all.has(t))
    const dynamic = new Set([...all].filter(t => !staticTokens.includes(t)))
    // A `:class` bound to code can bring any class the script mentions.
    if (/\s(:|v-bind:)class="/.test(tag)) for (const t of scriptTokens) dynamic.add(t)
    for (const t of dynamic) atomic.add(t)
    const held = new Set<string>()
    for (const t of dynamic) for (const g of groupsOf(t, prefix)) held.add(g)
    const tokens = staticTokens.filter(t => parse(t, prefix)?.decls.length && ![...groupsOf(t, prefix)].some(g => held.has(g)))
    for (const t of staticTokens) if (!tokens.includes(t)) atomic.add(t)
    const single = tokens.length < 2
    if (single) for (const t of tokens) atomic.add(t)
    groups.push([...dynamic, ...staticTokens.filter(t => single || !tokens.includes(t))])
    if (single) continue
    const keep = m[1]!.split(/\s+/).filter(c => c && !tokens.includes(c))
    const key = [...tokens].sort().join(' ')
    elements.push({ start: valueStart, end: valueStart + m[1]!.length, keep, tokens, name: names?.get(key) ?? '__' + hash(key) })
  }
  text += blank.slice(last)
  for (const t of extract(text, prefix)) { atomic.add(t); loose.add(t) }
  return { elements, atomic, groups, loose }
}

/**
 * The one-by-one classes that must stay in the global sheet: those that may share an element with another class of
 * the same property group (their outcome then rests on the fixed order of that sheet), and those whose element is
 * unknown. Every other one can ship with each component that uses it, even twice: no other rule can compete with it.
 */
export function globalClasses(plans: Iterable<Composition>, prefix = 'mi'): Set<string> {
  const out = new Set<string>()
  for (const p of plans) {
    for (const t of p.loose) out.add(t)
    for (const g of p.groups) {
      const seen = new Map<string, string>()
      for (const t of g) {
        for (const gr of groupsOf(t, prefix)) {
          const o = seen.get(gr)
          if (o !== undefined && o !== t) { out.add(o); out.add(t) }
          seen.set(gr, t)
        }
      }
      // Markers and classes without declarations never compete.
    }
  }
  return out
}

/**
 * Plain class names an SFC still needs: those its styles select, those the selectors of its utilities mention
 * (`mi:[.card__bar_&]:…`, decoded) and every word of its scripts and bindings. The others style nothing any more.
 */
function referenced(src: string, prefix: string): Set<string> {
  const out = new Set<string>()
  const add = (text: string) => { for (const m of text.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.add(m[1]!) }
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) add(m[1]!)
  for (const t of extract(src, prefix)) add(decode(t))
  const code = src.replace(/<style\b[\s\S]*?<\/style>/g, '').replace(/\sclass="[^"]*"/g, '')
  for (const m of code.matchAll(/[\w-]+/g)) out.add(m[0])
  return out
}

/** How many elements of a whole build use each composed class, by key (its sorted classes). */
export function composedCounts(plans: Iterable<Composition>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const p of plans) {
    for (const e of p.elements) {
      const key = [...e.tokens].sort().join(' ')
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * Rewrites the static class attributes of a planned SFC and appends, as its own style block, the composed rules and
 * the one-by-one classes that need not be global.
 */
export function apply(src: string, p: Composition, prefix = 'mi', names?: Map<string, string>, global?: Set<string>, strip = false): string {
  const own = global ? [...p.atomic].filter(t => !global.has(t)) : []
  if (!p.elements.length && !own.length) return src
  const used = strip ? referenced(src, prefix) : null
  let out = src
  for (const e of [...p.elements].sort((a, b) => b.start - a.start)) {
    const keep = used ? e.keep.filter(c => c.startsWith(prefix + ':') || used.has(c)) : e.keep
    out = out.slice(0, e.start) + [...keep, e.name].join(' ') + out.slice(e.end)
  }
  const css = new Map<string, string>()
  for (const e of p.elements) if (!css.has(e.name)) css.set(e.name, composeCss(e.tokens, e.name, prefix, names))
  const rules = [...css.values()].join('') + (own.length ? generate(own, prefix, names) : '')
  // Into the component's scoped block when it has one, as `:global()` rules (no scope attribute, same specificity):
  // one stylesheet per component, as before, instead of two.
  const scoped = /<style\b[^>]*\bscoped\b[^>]*>/.exec(out)
  if (scoped) {
    const close = out.indexOf('</style>', scoped.index)
    return out.slice(0, close) + '\n' + globalize(rules) + '\n' + out.slice(close)
  }
  return `${out}\n<style>${rules}</style>\n`
}

/** Wraps every selector of generated CSS in `:global()`, leaving at-rules and declarations as they are. */
function globalize(css: string): string {
  let out = ''
  let i = 0
  while (i < css.length) {
    const open = css.indexOf('{', i)
    const close = css.indexOf('}', i)
    if (close !== -1 && (open === -1 || close < open)) { out += css.slice(i, close + 1); i = close + 1; continue }
    if (open === -1) { out += css.slice(i); break }
    const prelude = css.slice(i, open)
    if (prelude.startsWith('@')) { out += prelude + '{'; i = open + 1; continue }
    const end = css.indexOf('}', open)
    out += splitSelectors(prelude).map(s => `:global(${s})`).join(',') + css.slice(open, end + 1)
    i = end + 1
  }
  return out
}

function splitSelectors(list: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < list.length; i++) {
    const c = list[i]
    if (c === '\\') { i++; continue }
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === ',' && !depth) { out.push(list.slice(start, i)); start = i + 1 }
  }
  out.push(list.slice(start))
  return out
}
