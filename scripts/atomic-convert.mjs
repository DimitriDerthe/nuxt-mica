// Moves scoped SFC styles to `mi:` utility classes without changing what any element computes.
//
//   node scripts/atomic-convert.mjs [--dry] <file.vue|dir>...
//
// Every declaration of a `<style scoped>` block becomes utilities on the elements its selector can reach,
// unless that could change a cascade outcome: the tool models, for each pair of declarations that can
// reach the same element and set overlapping properties, which one wins before (specificity, then source
// order) and after (utilities are single-class rules in one sheet with a fixed order; what stays scoped
// keeps its selector). Any declaration whose outcome could flip stays in the scoped block, as do keyframes,
// `v-bind()`, `:deep()` and selectors the template cannot resolve. Semantic class names stay in the markup:
// they are the hooks of the selectors that remain, of tests and of consumers.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { parse as parseSfc } from 'vue/compiler-sfc'
import { COLORS, compare, extract, parse as parseToken, utility } from '../modules/mi-atomic/engine.ts'

const require = createRequire(createRequire(import.meta.url).resolve('vue/compiler-sfc'))
const postcss = require(createRequire(require.resolve('@vue/compiler-sfc')).resolve('postcss'))

// ---------------------------------------------------------------------------------------------
// Selectors

const IDENT = /[\w\-\u0080-\uffff]/
const LEGACY_PE = new Set(['before', 'after', 'first-line', 'first-letter'])

function readIdent(s, i) {
  let j = i
  while (j < s.length) {
    if (s[j] === '\\') j += 2
    else if (IDENT.test(s[j])) j++
    else break
  }
  return j
}
function readBalanced(s, i, open, close) {
  let depth = 0, quote = ''
  for (let j = i; j < s.length; j++) {
    const c = s[j]
    if (quote) { if (c === '\\') j++; else if (c === quote) quote = ''; continue }
    if (c === '"' || c === '\'') quote = c
    else if (c === open) depth++
    else if (c === close && --depth === 0) return j + 1
  }
  return -1
}
export function splitList(s) {
  const out = []
  let depth = 0, quote = '', start = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue }
    if (c === '"' || c === '\'') quote = c
    else if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === ',' && !depth) { out.push(s.slice(start, i).trim()); start = i + 1 }
  }
  out.push(s.slice(start).trim())
  return out
}

/** Compounds with the combinator before each: [{ comb, parts: [{ kind, name, raw, args }] }], or null. */
export function parseSelector(sel) {
  const compounds = []
  let i = 0
  let comb = ''
  while (i < sel.length) {
    let ws = false
    while (/\s/.test(sel[i] ?? '')) { i++; ws = true }
    if (i >= sel.length) break
    if ('>+~'.includes(sel[i])) { comb = sel[i++]; continue }
    if (compounds.length && !comb) comb = ws ? ' ' : ''
    if (compounds.length && !comb) return null
    const parts = []
    while (i < sel.length && !/\s/.test(sel[i]) && !'>+~,'.includes(sel[i])) {
      const c = sel[i]
      let j
      if (c === '.') { j = readIdent(sel, i + 1); parts.push({ kind: 'class', name: sel.slice(i + 1, j).replace(/\\(.)/g, '$1'), raw: sel.slice(i, j) }) }
      else if (c === '#') { j = readIdent(sel, i + 1); parts.push({ kind: 'id', raw: sel.slice(i, j) }) }
      else if (c === '[') { j = readBalanced(sel, i, '[', ']'); if (j < 0) return null; parts.push({ kind: 'attr', raw: sel.slice(i, j) }) }
      else if (c === ':') {
        const pe = sel[i + 1] === ':'
        const s0 = i + (pe ? 2 : 1)
        j = readIdent(sel, s0)
        const name = sel.slice(s0, j)
        let args = null
        if (sel[j] === '(') { const k = readBalanced(sel, j, '(', ')'); if (k < 0) return null; args = sel.slice(j + 1, k - 1); j = k }
        const isPe = pe || LEGACY_PE.has(name)
        parts.push({ kind: isPe ? 'pe' : 'pc', name, args, raw: isPe ? '::' + name + (args === null ? '' : `(${args})`) : sel.slice(i, j) })
      }
      else if (c === '*') { j = i + 1; parts.push({ kind: 'universal', raw: '*' }) }
      else if (IDENT.test(c)) { j = readIdent(sel, i); parts.push({ kind: 'tag', name: sel.slice(i, j).toLowerCase(), raw: sel.slice(i, j) }) }
      else return null
      if (j === i) return null
      i = j
    }
    if (!parts.length) return null
    compounds.push({ comb, parts })
    comb = ''
  }
  return compounds.length ? compounds : null
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const cmp3 = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
const max3 = list => list.reduce((m, x) => (cmp3(x, m) > 0 ? x : m), [0, 0, 0])
export function specificity(sel) {
  const c = parseSelector(sel)
  if (!c) return [0, 1, 0]
  let s = [0, 0, 0]
  for (const { parts } of c) {
    for (const p of parts) {
      if (p.kind === 'id') s = add(s, [1, 0, 0])
      else if (p.kind === 'class' || p.kind === 'attr') s = add(s, [0, 1, 0])
      else if (p.kind === 'tag' || p.kind === 'pe') s = add(s, [0, 0, 1])
      else if (p.kind === 'pc') {
        if (p.name === 'where') continue
        if (['is', 'not', 'has', 'matches'].includes(p.name) && p.args !== null) s = add(s, max3(splitList(p.args).map(specificity)))
        else s = add(s, [0, 1, 0])
      }
    }
  }
  return s
}

// ---------------------------------------------------------------------------------------------
// Template

const TRANSPARENT = new Set(['template', 'Transition', 'transition', 'KeepAlive', 'keep-alive', 'Teleport', 'teleport', 'ClientOnly', 'client-only', 'Suspense', 'LazyClientOnly'])

/** String literals of a `:class` expression that sit where a class name goes, and whether other classes may come in. */
function scanClassExpr(code) {
  const lits = []
  let unknown = false
  const prefixes = []
  const maybe = []
  const stack = [{ t: 'top', classy: true, inValue: false }]
  let prev = 'start'
  const top = () => stack[stack.length - 1]
  const nextSig = (j) => { while (/\s/.test(code[j] ?? '')) j++; return code.slice(j, j + 3) }
  const classPosBefore = () => ['start', ',', '?', ':', '&&', '||'].includes(prev)
  const classPosAfter = n => n === '' || /^(,|\]|\)|\}|:|\|\||&&)/.test(n)
  let i = 0
  while (i < code.length) {
    const c = code[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '\'' || c === '"' || c === '`') {
      let j = i + 1, dyn = false
      while (j < code.length && code[j] !== c) {
        if (code[j] === '\\') j += 2
        else if (c === '`' && code[j] === '$' && code[j + 1] === '{') { dyn = true; const k = readBalanced(code, j + 1, '{', '}'); j = k < 0 ? code.length : k }
        else j++
      }
      const end = j + 1
      const value = code.slice(i + 1, j)
      const ctx = top()
      const next = nextSig(end)
      let pos = false, isKey = false
      if (ctx.t === 'obj') { if (ctx.classy && !ctx.inValue && next.startsWith(':')) { pos = true; isKey = true } }
      else if (ctx.classy && classPosBefore() && classPosAfter(next)) pos = true
      if (pos) {
        if (dyn) { unknown = true; prefixes.push(value.split('${')[0].split(/\s+/).pop()) }
        else lits.push({ start: i, end, quote: c, value, isKey })
      }
      // Glued to other strings with `+`: its words may be classes, but nothing can be inserted there.
      else if (ctx.classy && (prev === '+' || next.startsWith('+'))) {
        unknown = true
        for (const w of value.split(/\s+/).filter(Boolean)) maybe.push(w)
        prefixes.push(value.split(/\s+/).pop())
      }
      prev = 'lit'; i = end; continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      for (;;) {
        while (/[\w$.]/.test(code[j] ?? '') || (code[j] === '?' && code[j + 1] === '.')) j += code[j] === '?' ? 2 : 1
        if (code[j] === '(' || code[j] === '[') { const k = readBalanced(code, j, code[j], code[j] === '(' ? ')' : ']'); if (k < 0) break; j = k; continue }
        break
      }
      const ident = code.slice(i, j)
      const ctx = top()
      const next = nextSig(j)
      if (ctx.t === 'obj' && ctx.classy && !ctx.inValue && /^[\w-]+$/.test(ident) && (next.startsWith(':') || next.startsWith(',') || next.startsWith('}'))) {
        lits.push({ start: i, end: j, quote: null, value: ident, isKey: true, shorthand: !next.startsWith(':') })
      }
      else if (ctx.t !== 'obj' && ctx.classy && classPosBefore() && !/^(\?|&&|\|\||=|!|<|>|\+|-|\*|\/)/.test(next) && !['true', 'false', 'null', 'undefined'].includes(ident)) unknown = true
      else if (ctx.t === 'obj' && ctx.classy && !ctx.inValue) unknown = true
      prev = 'id'; i = j; continue
    }
    if (/\d/.test(c)) { while (/[\d.]/.test(code[i] ?? '')) i++; prev = 'id'; continue }
    if (c === '{' || c === '[' || c === '(') {
      const ctx = top()
      const inherit = ctx.classy && !(ctx.t === 'obj' && ctx.inValue)
      const call = c !== '{' && (prev === 'id' || prev === ')')
      stack.push({ t: c === '{' ? 'obj' : c === '[' ? 'arr' : 'paren', classy: inherit && !call, inValue: false })
      prev = 'start'; i++; continue
    }
    if (c === '}' || c === ']' || c === ')') { if (stack.length > 1) stack.pop(); prev = ')'; i++; continue }
    if (c === ':') { if (top().t === 'obj') top().inValue = true; prev = ':'; i++; continue }
    if (c === ',') { if (top().t === 'obj') top().inValue = false; prev = ','; i++; continue }
    if (c === '?' && code[i + 1] !== '?') { prev = '?'; i++; continue }
    if ((c === '&' && code[i + 1] === '&') || (c === '|' && code[i + 1] === '|') || (c === '?' && code[i + 1] === '?')) { prev = '&&'; i += 2; continue }
    if (c === '.' && code[i + 1] === '.' && code[i + 2] === '.') { unknown = true; i += 3; prev = 'start'; continue }
    prev = c === '+' && code[i + 1] !== '+' ? '+' : 'op'; i++
  }
  return { lits, unknown, prefixes, maybe }
}

function analyzeTemplate(ast, src) {
  const els = []
  const walk = (node, parent) => {
    if (node.type !== 1) return
    if (node.tag === 'slot') { if (parent) parent.hasSlot = true; for (const ch of node.children) walk(ch, parent); return }
    const tagAttr = node.props.find(p => p.type === 6 && p.name === 'tag')
    if (node.tagType === 3 || TRANSPARENT.has(node.tag) || (/^(TransitionGroup|transition-group)$/.test(node.tag) && !tagAttr)) {
      for (const ch of node.children) walk(ch, parent)
      return
    }
    const isComponent = node.tagType === 1 && !/^(TransitionGroup|transition-group)$/.test(node.tag)
    const el = {
      id: els.length, node, parent, children: [],
      tag: isComponent ? null : (tagAttr ? tagAttr.value.content : node.tag).toLowerCase(),
      isComponent: isComponent || node.tag === 'component',
      staticClasses: new Set(), staticAttr: null, lits: [], unknown: false, prefixes: [], exp: null,
      add: new Set(), litAdd: new Map(), hasSlot: false
    }
    if (el.isComponent) el.tag = null
    for (const p of node.props) {
      if (p.type === 6 && p.name === 'class' && p.value) {
        for (const c of p.value.content.split(/\s+/).filter(Boolean)) el.staticClasses.add(c)
        el.staticAttr = { end: p.loc.end.offset, quote: src[p.loc.end.offset - 1] }
      }
      else if (p.type === 7 && p.name === 'bind') {
        if (p.arg?.type === 4 && p.arg.isStatic && p.arg.content === 'class' && p.exp) {
          const { lits, unknown, prefixes, maybe } = scanClassExpr(p.exp.content)
          el.maybe = new Set(maybe)
          el.exp = p.exp
          el.lits = lits.map(l => ({ ...l, start: l.start + p.exp.loc.start.offset, end: l.end + p.exp.loc.start.offset, classes: l.value.split(/\s+/).filter(Boolean) }))
          el.unknown ||= unknown
          el.prefixes.push(...prefixes)
        }
        // `v-bind="obj"` spreads props and attrs (fallthrough attrs land there); objects passed this way do not carry classes here.
        else if (!p.arg) el.rootish = true
      }
    }
    el.possible = new Set([...el.staticClasses, ...el.lits.flatMap(l => l.classes)])
    if (!parent) el.rootish = true
    els.push(el)
    if (parent) parent.children.push(el)
    for (const ch of node.children) walk(ch, el)
  }
  for (const ch of ast.children) walk(ch, null)
  return els
}

/** Classes code could hand to a `:class` binding: words of the string literals in the SFC, and template literal heads. */
function runtimeClasses(src) {
  const words = new Set()
  const prefixes = []
  for (const m of src.matchAll(/(['"])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) for (const w of m[2].split(/\s+/)) if (/^[\w-]+$/.test(w)) words.add(w)
  for (const m of src.matchAll(/`([^`]*)`/g)) {
    for (const part of m[1].split(/\$\{[^}]*\}/)) for (const w of part.split(/\s+/)) if (/^[\w-]+$/.test(w)) words.add(w)
    for (const h of m[1].matchAll(/([\w-]+)\$\{/g)) prefixes.push(h[1])
  }
  return { words, prefixes }
}
let RUNTIME = { words: new Set(), prefixes: [] }
const mayHave = (el, cls) => el.possible.has(cls) || el.maybe?.has(cls) || el.prefixes.some(p => p && cls.startsWith(p))
  || (el.unknown && (RUNTIME.words.has(cls) || RUNTIME.prefixes.some(p => cls.startsWith(p))))
const ancestors = function* (el) { for (let p = el.parent; p; p = p.parent) yield p }

/** Liberal: could this compound match this element (ignoring states and attributes)? */
function compoundMay(el, compound) {
  for (const p of compound.parts) {
    if (p.kind === 'class' && !mayHave(el, p.name)) return false
    if (p.kind === 'tag' && el.tag !== null && el.tag !== p.name) return false
  }
  return true
}

// ---------------------------------------------------------------------------------------------
// Declarations to utilities

const norm = v => v.replace(/"/g, '\'').trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').replace(/(^|[\s(,])\.(\d)/g, '$10.$2').replace(/\s*\/\s*/g, ' / ')
const sameDecls = (a, b) => a.length === b.length && a.every(([p, v], i) => p === b[i][0] && norm(v) === norm(b[i][1]))

/** Encodes an arbitrary value: spaces become `_`, lone underscores are escaped. */
function encodeValue(v) {
  v = v.trim().replace(/\s+/g, ' ')
  if (v.includes('\\')) return null
  if (v.includes('"')) { if (v.includes('\'')) return null; v = v.replace(/"/g, '\'') }
  return v.replace(/(^|[^_])_(?!_)/g, '$1\\_').replace(/ /g, '_')
}

const SPACING = {
  padding: 'p', 'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl', 'padding-inline': 'px', 'padding-block': 'py', 'padding-inline-start': 'ps', 'padding-inline-end': 'pe',
  margin: 'm', 'margin-top': 'mt', 'margin-right': 'mr', 'margin-bottom': 'mb', 'margin-left': 'ml', 'margin-inline': 'mx', 'margin-block': 'my', 'margin-inline-start': 'ms', 'margin-inline-end': 'me',
  gap: 'gap', 'row-gap': 'gap-y', 'column-gap': 'gap-x',
  inset: 'inset', 'inset-inline': 'inset-x', 'inset-block': 'inset-y', top: 'top', right: 'right', bottom: 'bottom', left: 'left', 'inset-inline-start': 'start', 'inset-inline-end': 'end',
  width: 'w', height: 'h', 'min-width': 'min-w', 'min-height': 'min-h', 'max-width': 'max-w', 'max-height': 'max-h', 'flex-basis': 'basis', 'text-indent': 'indent'
}
const COLOR_ROOTS = {
  color: 'text', 'background-color': 'bg', 'border-color': 'border', 'border-top-color': 'border-t', 'border-right-color': 'border-r', 'border-bottom-color': 'border-b', 'border-left-color': 'border-l',
  'border-inline-color': 'border-x', 'border-block-color': 'border-y', 'border-inline-start-color': 'border-s', 'border-inline-end-color': 'border-e',
  'outline-color': 'outline', 'text-decoration-color': 'decoration', fill: 'fill', stroke: 'stroke', 'caret-color': 'caret', 'accent-color': 'accent'
}
const RADIUS_ROOTS = { 'border-radius': 'rounded', 'border-top-left-radius': 'rounded-tl', 'border-top-right-radius': 'rounded-tr', 'border-bottom-right-radius': 'rounded-br', 'border-bottom-left-radius': 'rounded-bl' }
const SIMPLE_ROOTS = {
  'z-index': 'z', order: 'order', opacity: 'opacity', 'font-size': 'text', 'line-height': 'leading', 'letter-spacing': 'tracking', 'font-weight': 'font', 'font-family': 'font',
  'box-shadow': 'shadow', 'aspect-ratio': 'aspect', 'grid-template-columns': 'grid-cols', 'grid-template-rows': 'grid-rows', 'grid-column': 'col', 'grid-row': 'row',
  'grid-column-start': 'col-start', 'grid-column-end': 'col-end', 'grid-row-start': 'row-start', 'grid-row-end': 'row-end', 'grid-auto-columns': 'auto-cols', 'grid-auto-rows': 'auto-rows',
  flex: 'flex', 'flex-grow': 'grow', 'flex-shrink': 'shrink', 'transform-origin': 'origin', transform: 'transform', cursor: 'cursor', 'transition-delay': 'delay',
  'outline-offset': 'outline-offset', 'text-underline-offset': 'underline-offset', 'object-position': 'object', columns: 'columns', 'will-change': 'will-change', animation: 'animate', content: 'content'
}

// Statics indexed by their declarations, built from the engine itself.
const STATIC_BY_DECL = new Map()
{
  const names = readFileSync(new URL('../modules/mi-atomic/engine.ts', import.meta.url), 'utf8')
  // Probe every name the engine could know as a static: candidates come from a dictionary of common values.
  const probes = ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'flow-root', 'list-item', 'table', 'table-row', 'table-cell', 'hidden',
    'static', 'fixed', 'absolute', 'relative', 'sticky', 'visible', 'invisible', 'isolate', 'isolation-auto', 'box-border', 'box-content',
    ...['auto', 'hidden', 'clip', 'visible', 'scroll'].flatMap(v => [`overflow-${v}`, `overflow-x-${v}`, `overflow-y-${v}`]),
    ...['auto', 'contain', 'none'].flatMap(v => [`overscroll-${v}`, `overscroll-x-${v}`, `overscroll-y-${v}`]),
    'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse', 'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
    ...['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'normal'].flatMap(v => [`justify-${v}`, `content-${v}`, `items-${v}`, `self-${v}`, `justify-items-${v}`, `justify-self-${v}`, `place-content-${v}`, `place-items-${v}`, `place-self-${v}`]),
    'self-auto', 'justify-self-auto', 'place-self-auto',
    'grid-flow-row', 'grid-flow-col', 'grid-flow-dense', 'grid-flow-row-dense', 'grid-flow-col-dense',
    'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black', 'font-mi', 'font-mono',
    'text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end', 'italic', 'not-italic', 'underline', 'overline', 'line-through', 'no-underline',
    'uppercase', 'lowercase', 'capitalize', 'normal-case', 'text-ellipsis', 'text-clip', 'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap', 'whitespace-break-spaces',
    'text-wrap', 'text-nowrap', 'text-balance', 'text-pretty', 'break-words', 'wrap-anywhere', 'break-all', 'break-keep', 'hyphens-none', 'hyphens-manual', 'hyphens-auto',
    'normal-nums', 'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums', 'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions',
    'list-none', 'list-disc', 'list-decimal', 'list-inside', 'list-outside', 'decoration-solid', 'decoration-double', 'decoration-dotted', 'decoration-dashed', 'decoration-wavy',
    'bg-cover', 'bg-contain', 'bg-auto', 'bg-center', 'bg-top', 'bg-bottom', 'bg-left', 'bg-right', 'bg-no-repeat', 'bg-repeat', 'bg-repeat-x', 'bg-repeat-y', 'bg-fixed', 'bg-local', 'bg-scroll',
    'bg-clip-border', 'bg-clip-padding', 'bg-clip-content', 'bg-clip-text', 'bg-none', 'border-collapse', 'border-separate',
    ...['contain', 'cover', 'fill', 'none', 'scale-down'].map(v => `object-${v}`), 'object-center', 'object-top', 'object-bottom', 'object-left', 'object-right',
    ...['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'].map(v => `align-${v}`),
    'pointer-events-none', 'pointer-events-auto', 'select-none', 'select-text', 'select-all', 'select-auto', 'resize', 'resize-none', 'resize-x', 'resize-y',
    ...['auto', 'none', 'pan-x', 'pan-y', 'manipulation', 'pinch-zoom'].map(v => `touch-${v}`), 'scroll-auto', 'scroll-smooth', 'appearance-none', 'appearance-auto',
    'will-change-auto', 'will-change-transform', 'will-change-contents', 'table-auto', 'table-fixed', 'transform-none', 'transform-gpu',
    ...['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left'].map(v => `origin-${v}`),
    'backface-visible', 'backface-hidden', 'transition-none', 'filter-none', 'backdrop-filter-none', 'shadow-none', 'animate-none', 'content-none',
    ...['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'grab', 'grabbing', 'crosshair', 'zoom-in', 'zoom-out', 'col-resize', 'row-resize', 'ew-resize', 'ns-resize', 'copy', 'progress', 'cell'].map(v => `cursor-${v}`),
    'snap-start', 'snap-end', 'snap-center', 'snap-align-none', 'snap-always', 'snap-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay', 'mix-blend-normal', 'mix-blend-plus-lighter',
    'sr-only', 'truncate', '@container', '@container-size', '@container-normal', 'float-left', 'float-right', 'float-none', 'clear-both', 'clear-none']
  void names
  for (const n of probes) {
    const u = utility(n)
    if (u && u.decls.length === 1 && !u.decls[0][0].startsWith('--')) STATIC_BY_DECL.set(`${u.decls[0][0]}:${norm(u.decls[0][1])}`, n)
  }
}

function colorName(v) {
  const m = /^var\(--mi-([\w-]+)\)$/.exec(v.trim())
  if (m && COLORS.has(m[1])) return m[1]
  const k = { currentcolor: 'current', transparent: 'transparent', inherit: 'inherit' }[v.trim().toLowerCase()]
  if (k) return k
  const mix = /^color-mix\(in srgb,\s*var\(--mi-([\w-]+)\)\s+(\d+)%,\s*transparent\)$/.exec(v.trim())
  if (mix && COLORS.has(mix[1])) return `${mix[1]}/${mix[2]}`
  return null
}

/** Candidate utilities for one declaration, checked against the engine: the first that reproduces it wins. */
function exactUtility(prop, value) {
  const want = [[prop, value]]
  const ok = u => { const r = utility(u); return r && sameDecls(r.decls, want) ? u : null }
  const st = STATIC_BY_DECL.get(`${prop}:${norm(value)}`)
  if (st && ok(st)) return st
  const cands = []
  const enc = encodeValue(value)
  if (SPACING[prop]) {
    const r = SPACING[prop]
    const m = /^(-?)(\d+(?:\.\d+)?)px$/.exec(value.trim())
    if (value.trim() === '0') cands.push(`${r}-0`)
    if (m) {
      const n = +m[2] / 4
      if (+m[2] === 1) cands.push(`${m[1]}${r}-px`)
      if (Number.isInteger(n * 2)) cands.push(`${m[1]}${r}-${n}`)
    }
    const kw = { '100%': 'full', auto: 'auto', 'min-content': 'min', 'max-content': 'max', 'fit-content': 'fit', none: 'none', '50%': '1/2', '100vh': 'screen', '100vw': 'screen', '100dvh': 'dvh', '100svh': 'svh' }[value.trim()]
    if (kw) cands.push(`${r}-${kw}`)
    if (/^var\(--[\w-]+\)$/.test(value.trim())) cands.push(`${r}-(${value.trim().slice(4, -1)})`)
    if (enc) cands.push(`${r}-[${enc}]`)
  }
  if (COLOR_ROOTS[prop]) {
    const c = colorName(value)
    if (c) cands.push(`${COLOR_ROOTS[prop]}-${c}`)
    if (/^var\(--[\w-]+\)$/.test(value.trim())) cands.push(`${COLOR_ROOTS[prop]}-(${value.trim().slice(4, -1)})`)
    if (enc) cands.push(`${COLOR_ROOTS[prop]}-[color:${enc}]`)
  }
  if (RADIUS_ROOTS[prop]) {
    const r = RADIUS_ROOTS[prop]
    const t = { 'var(--mi-radius-s)': 'sm', 'var(--mi-radius-m)': 'md', 'var(--mi-radius-l)': 'lg', 'var(--mi-radius-xl)': 'xl', 0: 'none', '9999px': 'full' }[value.trim()]
    if (t) cands.push(`${r}-${t}`)
    if (enc) cands.push(`${r}-[${enc}]`)
  }
  if (SIMPLE_ROOTS[prop]) {
    const r = SIMPLE_ROOTS[prop]
    const v = value.trim()
    if (prop === 'box-shadow') { const t = { 'var(--mi-sh1)': '1', 'var(--mi-sh2)': '2', 'var(--mi-sh3)': '3' }[v]; if (t) cands.push(`shadow-${t}`) }
    if (prop === 'font-family' && v === 'var(--mi-font)') cands.push('font-mi')
    if (prop === 'font-weight' && /^\d+$/.test(v)) cands.push(`font-${v}`)
    if (prop === 'line-height') { const t = { 1: 'none', 1.25: 'tight', 1.375: 'snug', 1.5: 'normal', 1.625: 'relaxed', 2: 'loose' }[v]; if (t) cands.push(`leading-${t}`); const m = /^(\d+)px$/.exec(v); if (m && +m[1] % 4 === 0) cands.push(`leading-${+m[1] / 4}`) }
    if (prop === 'opacity' && /^(0?\.\d+|0|1)$/.test(v)) cands.push(`opacity-${Math.round(parseFloat(v) * 100)}`)
    if (['z-index', 'order', 'flex-grow', 'flex-shrink', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end'].includes(prop) && /^-?\d+$/.test(v)) cands.push(v.startsWith('-') ? `-${r}-${v.slice(1)}` : `${r}-${v}`)
    if (prop === 'flex' && /^\d+$/.test(v)) cands.push(`flex-${v}`)
    if (prop === 'grid-template-columns' || prop === 'grid-template-rows') { const m = /^repeat\((\d+),\s*minmax\(0,\s*1fr\)\)$/.exec(v); if (m) cands.push(`${r}-${m[1]}`) }
    if (prop === 'grid-column' || prop === 'grid-row') { const m = /^span (\d+)(?: \/ span \1)?$/.exec(v); if (m) cands.push(`${r}-span-${m[1]}`); if (v === '1 / -1') cands.push(`${r}-span-full`) }
    if (/^var\(--[\w-]+\)$/.test(v)) cands.push(`${r}-(${v.slice(4, -1)})`)
    if (enc) cands.push(`${r}-[${enc}]`)
  }
  if (prop === 'container-type' && value.trim() === 'inline-size') cands.push('@container')
  if (prop === 'container') { const m = /^([\w-]+)\s*\/\s*inline-size$/.exec(value.trim()); if (m) cands.push(`@container/${m[1]}`) }
  if (prop === 'background-image' && enc) cands.push(`bg-[${enc}]`)
  for (const c of cands) if (ok(c)) return c
  // Exact fallback: an arbitrary property.
  if (enc !== null && /^(--[\w-]+|-?[a-z][a-z-]*)$/.test(prop)) { const a = `[${prop}:${enc}]`; if (ok(a)) return a }
  return null
}

let BG_IMAGES = false
const splitTopSpace = v => { const out = []; let d = 0, cur = ''; for (const c of v.trim()) { if (c === '(') d++; if (c === ')') d--; if (/\s/.test(c) && !d) { if (cur) out.push(cur); cur = '' } else cur += c } if (cur) out.push(cur); return out }
const isColorish = v => colorName(v) !== null || /^(color-mix|rgba?|hsla?|oklch|oklab|light-dark)\(/.test(v.trim())

/** Rewrites shorthands into the longhands utilities express; each rewrite keeps what the element computes. */
function expand(prop, value) {
  const v = value.trim()
  const parts = splitTopSpace(v)
  const box = (base, logical) => {
    const [t, r = t, b = t, l = r] = parts
    if (parts.length === 1) return [[base, v]]
    if (parts.length === 2 && logical) return [[`${logical[0]}`, t], [`${logical[1]}`, r]]
    if (parts.length === 3 && logical) return [[`${base}-top`, t], [`${logical[1]}`, r], [`${base}-bottom`, b]]
    return [[`${base}-top`, t], [`${base}-right`, r], [`${base}-bottom`, b], [`${base}-left`, l]]
  }
  if ((prop === 'padding' || prop === 'margin') && parts.length <= 4) return box(prop, [`${prop}-block`, `${prop}-inline`])
  if (prop === 'inset' && parts.length <= 4) {
    if (parts.length === 1) return [[prop, v]]
    const [t, r = t, b = t, l = r] = parts
    if (parts.length === 2) return [['inset-block', t], ['inset-inline', r]]
    return [['top', t], ['right', r], ['bottom', b], ['left', l]]
  }
  if (prop === 'gap' && parts.length === 2) return [['row-gap', parts[0]], ['column-gap', parts[1]]]
  // `background: <color>` is `background-color` only where nothing else paints a background image.
  if (prop === 'background' && !BG_IMAGES && !v.includes(',') && parts.length === 1 && isColorish(v)) return [['background-color', v]]
  const side = /^border(-top|-right|-bottom|-left)?$/.exec(prop)
  if (side && parts.length >= 2 && parts.length <= 3 && parts.includes('solid')) {
    const w = parts.find(p => /^\d+(\.\d+)?px$/.test(p))
    const c = parts.find(p => p !== 'solid' && p !== w)
    if (w && (parts.length === 2 || (c && isColorish(c)))) {
      const s = side[1] ?? ''
      return [[`border${s}-style`, 'var(--mia-bs, solid)'], [`border${s}-width`, w], ...(c ? [[`border${s}-color`, c]] : [])]
    }
  }
  return [[prop, v]]
}
const splitTopComma = v => { const out = []; let d = 0, cur = ''; for (const c of v) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { out.push(cur); cur = '' } else cur += c } out.push(cur); return out }

/** Utilities (without variants) for one declaration, or null. Border shorthands map to `border-N` + color. */
function declUtilities(prop, value) {
  const longhands = expand(prop, value)
  // `border[-side]` sets the style through --mia-bs and the width: emit it as one utility.
  const s = /^border(-top|-right|-bottom|-left)?-style$/.exec(longhands[0][0])
  if (s && longhands[0][1] === 'var(--mia-bs, solid)') {
    const side = { '-top': 't', '-right': 'r', '-bottom': 'b', '-left': 'l' }[s[1] ?? ''] ?? ''
    const root = side ? `border-${side}` : 'border'
    const w = /^(\d+)px$/.exec(longhands[1][1])
    const width = w ? (w[1] === '1' ? root : `${root}-${w[1]}`) : `${root}-[${longhands[1][1]}]`
    const color = longhands[2] ? exactUtility(longhands[2][0], longhands[2][1]) : null
    if (!utility(width) || (longhands[2] && !color)) return null
    return [width, ...(color ? [color] : [])]
  }
  const out = []
  for (const [p, v] of longhands) {
    const u = exactUtility(p, v)
    if (!u) return null
    out.push(u)
  }
  return out
}

// ---------------------------------------------------------------------------------------------
// Variants

const NAMED_PSEUDO = {
  ':hover': 'hover', ':focus': 'focus', ':focus-visible': 'focus-visible', ':focus-within': 'focus-within', ':active': 'active', ':disabled': 'disabled', ':enabled': 'enabled',
  ':checked': 'checked', ':first-child': 'first', ':last-child': 'last', ':only-child': 'only', ':nth-child(odd)': 'odd', ':nth-child(even)': 'even', ':nth-child(2n)': 'even', ':nth-child(2n+1)': 'odd',
  ':first-of-type': 'first-of-type', ':last-of-type': 'last-of-type', ':empty': 'empty', ':placeholder-shown': 'placeholder-shown', ':invalid': 'invalid', ':visited': 'visited', '[open]': 'open',
  ':not(:last-child)': 'not-last', ':not(:first-child)': 'not-first', ':not(:disabled)': 'not-disabled', '[aria-selected="true"]': 'aria-selected', '[aria-pressed="true"]': 'aria-pressed',
  '[aria-expanded="true"]': 'aria-expanded', '[aria-current="true"]': 'aria-current', '[aria-checked="true"]': 'aria-checked', '[aria-disabled="true"]': 'aria-disabled', '[aria-busy="true"]': 'aria-busy'
}
const NAMED_PE = { '::before': 'before', '::after': 'after', '::placeholder': 'placeholder', '::selection': 'selection', '::marker': 'marker', '::backdrop': 'backdrop', '::first-letter': 'first-letter', '::first-line': 'first-line', '::file-selector-button': 'file' }
const MEDIA_NAMED = {
  '(prefers-reduced-motion:reduce)': 'motion-reduce', '(prefers-reduced-motion:no-preference)': 'motion-safe', '(hover:hover)': 'can-hover', '(pointer:coarse)': 'pointer-coarse',
  '(pointer:fine)': 'pointer-fine', '(forced-colors:active)': 'forced-colors', print: 'print', '(prefers-contrast:more)': 'contrast-more'
}

function atVariant({ name, params }) {
  const p = params.trim().replace(/\s+/g, ' ')
  const tight = p.replace(/\s*:\s*/g, ':').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
  if (name === 'container') {
    const m = /^(?:([\w-]+) )?\((min|max)-width:(\d+(?:\.\d+)?(?:px|rem|em))\)$/.exec(tight)
    if (m) return `@${m[2] === 'max' ? 'max-' : ''}[${m[3]}]${m[1] ? '/' + m[1] : ''}`
    const e = encodeValue(p)
    return e && !/[[\]]/.test(e) ? `[@container_${e}]` : null
  }
  if (name === 'media') {
    if (MEDIA_NAMED[tight]) return MEDIA_NAMED[tight]
    const m = /^\((min|max)-width:(\d+(?:\.\d+)?(?:px|rem|em))\)$/.exec(tight)
    if (m) return `${m[1]}-[${m[2]}]`
    const e = encodeValue(p)
    return e && !/[[\]]/.test(e) ? `[@media_${e}]` : null
  }
  if (name === 'supports') {
    const m = /^\((.*)\)$/.exec(p)
    const e = m && encodeValue(m[1])
    return e && !/[[\]]/.test(e) ? `supports-[${e}]` : null
  }
  return null
}

const compoundRaw = parts => parts.map(p => p.raw).join('')
function selectorRaw(compounds) {
  return compounds.map((c, i) => (i === 0 ? '' : c.comb === ' ' ? ' ' : c.comb) + compoundRaw(c.parts)).join('')
}

/** Selector variant for the element that will carry the utility, `&` standing for it. */
function selectorVariant(prefixRaw, restParts) {
  const pe = restParts.filter(p => p.kind === 'pe')
  if (pe.length > 1) return null
  // A type selector leads the compound: `a&`, never `&a`.
  const lead = restParts.filter(p => p.kind === 'tag').map(p => p.raw).join('')
  const rest = compoundRaw(restParts.filter(p => p.kind !== 'pe' && p.kind !== 'tag')).replace(/"/g, '\'')
  const peRaw = pe[0]?.raw ?? ''
  const vs = []
  if (!prefixRaw && !rest && !lead) { /* plain */ }
  else if (!prefixRaw && !lead && NAMED_PSEUDO[rest.replace(/'/g, '"')]) vs.push(NAMED_PSEUDO[rest.replace(/'/g, '"')])
  else {
    const body = (prefixRaw + lead + '&' + rest).replace(/"/g, '\'')
    const enc = body.replace(/\s*([>+~])\s*/g, '$1').replace(/(^|[^_])_(?!_)/g, '$1\\_').replace(/\s+/g, '_')
    if (/[[\]]/.test(enc.replace(/\[[^\]]*\]/g, ''))) return null
    vs.push(`[${enc}]`)
  }
  if (peRaw) {
    if (NAMED_PE[peRaw]) vs.push(NAMED_PE[peRaw])
    else if (vs.length && vs[0].startsWith('[')) vs[0] = vs[0].slice(0, -1) + peRaw + ']'
    else vs.push(`[&${peRaw}]`)
  }
  return vs
}

// ---------------------------------------------------------------------------------------------
// Components: the properties each one styles anywhere, so a class passed to it can be judged safe.

const COMPONENT_PROPS = new Map()
const STYLE_FREE = new Set(['NuxtLink', 'RouterLink', 'NuxtPage', 'NuxtLayout'])
const NO_FALLTHROUGH = new Set()
export function indexComponents(dirs) {
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (p.endsWith('.vue')) {
        const src = readFileSync(p, 'utf8')
        const props = new Set()
        for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
          postcss.parse(m[1]).walkDecls(d => { for (const a of atoms(d.prop)) props.add(a) })
        }
        for (const t of extract(src)) for (const [pr] of parseToken(t)?.decls ?? []) for (const a of atoms(pr)) props.add(a)
        COMPONENT_PROPS.set(f.replace(/\.vue$/, ''), props)
        // A class reaches the root (with the parent's scope attribute) only when attrs fall through to a single root element.
        const tpl = parseSfc(src).descriptor.template?.ast
        const roots = tpl?.children.filter(n => n.type === 1) ?? []
        const single = roots.length === 1 && roots[0].tag !== 'slot' && !/^(Teleport|teleport|template)$/.test(roots[0].tag)
        if (/inheritAttrs\s*:\s*false/.test(src) || !single) NO_FALLTHROUGH.add(f.replace(/\.vue$/, ''))
      }
    }
  }
  for (const d of dirs) walk(d)
}
/** Per component, the properties parents set on it through a class, or through a tag selector that may reach it. */
const PARENT_PROPS = new Map()
const pascal = tag => tag.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
export function indexParents(files) {
  for (const f of files) {
    const src = readFileSync(f, 'utf8')
    const { descriptor, errors } = parseSfc(src, { ignoreEmpty: false })
    if (errors.length || !descriptor.template?.ast) continue
    const els = analyzeTemplate(descriptor.template.ast, src)
    const comps = els.filter(e => e.isComponent && e.node.tag !== 'component')
    if (!comps.length) continue
    for (const style of descriptor.styles) {
      postcss.parse(style.content).walkRules((rule) => {
        for (const sel of splitList(rule.selector)) {
          const c = parseSelector(sel.replace(/:deep\((.*)\)/, '$1'))
          if (!c) continue
          const subject = c[c.length - 1]
          const classes = subject.parts.filter(p => p.kind === 'class').map(p => p.name)
          const hit = classes.length ? comps.filter(e => classes.some(k => e.possible.has(k))) : c.length > 1 ? comps : []
          for (const e of hit) {
            const key = pascal(e.node.tag)
            if (!PARENT_PROPS.has(key)) PARENT_PROPS.set(key, new Set())
            rule.walkDecls(d => { for (const a of atoms(d.prop)) PARENT_PROPS.get(key).add(a) })
          }
        }
      })
    }
  }
}

function componentTouches(tag, prop) {
  const name = pascal(tag)
  if (STYLE_FREE.has(name)) return false
  if (NO_FALLTHROUGH.has(name)) return true
  const props = COMPONENT_PROPS.get(name)
  // Unknown component, or one that can take classes it does not own: assume the worst.
  return !props || atoms(prop).some(a => props.has(a))
}

// ---------------------------------------------------------------------------------------------
// Conversion of one SFC

// Longhands a property sets, logical ones mapped to physical (left-to-right, horizontal writing).
const SIDES = ['top', 'right', 'bottom', 'left']
const LOGICAL = { 'inline-start': 'left', 'inline-end': 'right', 'block-start': 'top', 'block-end': 'bottom', inline: ['left', 'right'], block: ['top', 'bottom'] }
const CORNERS = { 'start-start': 'top-left', 'start-end': 'top-right', 'end-start': 'bottom-left', 'end-end': 'bottom-right' }
const SHORT = {
  background: ['background-color', 'background-image', 'background-position-x', 'background-position-y', 'background-size', 'background-repeat', 'background-attachment', 'background-origin', 'background-clip'],
  'background-position': ['background-position-x', 'background-position-y'],
  font: ['font-style', 'font-variant', 'font-variant-numeric', 'font-variant-caps', 'font-variant-ligatures', 'font-variant-east-asian', 'font-variant-alternates', 'font-variant-position', 'font-weight', 'font-stretch', 'font-size', 'line-height', 'font-family', 'font-size-adjust', 'font-kerning', 'font-feature-settings', 'font-variation-settings'],
  'font-variant': ['font-variant', 'font-variant-numeric', 'font-variant-caps', 'font-variant-ligatures', 'font-variant-east-asian', 'font-variant-alternates', 'font-variant-position'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'], 'flex-flow': ['flex-direction', 'flex-wrap'],
  'grid-area': ['grid-row-start', 'grid-row-end', 'grid-column-start', 'grid-column-end'], 'grid-row': ['grid-row-start', 'grid-row-end'], 'grid-column': ['grid-column-start', 'grid-column-end'],
  'grid-template': ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
  grid: ['grid-template-rows', 'grid-template-columns', 'grid-template-areas', 'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow'],
  gap: ['row-gap', 'column-gap'], 'grid-gap': ['row-gap', 'column-gap'], 'grid-row-gap': ['row-gap'], 'grid-column-gap': ['column-gap'],
  'place-content': ['align-content', 'justify-content'], 'place-items': ['align-items', 'justify-items'], 'place-self': ['align-self', 'justify-self'],
  overflow: ['overflow-x', 'overflow-y'], transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'transition-behavior'],
  animation: ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state', 'animation-timeline'],
  outline: ['outline-color', 'outline-style', 'outline-width'], 'text-decoration': ['text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness'],
  'list-style': ['list-style-type', 'list-style-position', 'list-style-image'], columns: ['column-width', 'column-count'], container: ['container-name', 'container-type'],
  'white-space': ['white-space-collapse', 'text-wrap-mode'], 'text-wrap': ['text-wrap-mode', 'text-wrap-style'],
  'border-image': ['border-image-source', 'border-image-slice', 'border-image-width', 'border-image-outset', 'border-image-repeat'],
  mask: ['mask-image', 'mask-mode', 'mask-repeat', 'mask-position', 'mask-clip', 'mask-origin', 'mask-size', 'mask-composite'],
  'inline-size': ['width'], 'block-size': ['height'], 'min-inline-size': ['min-width'], 'min-block-size': ['min-height'], 'max-inline-size': ['max-width'], 'max-block-size': ['max-height'],
  'word-wrap': ['overflow-wrap'], 'grid-template-areas': ['grid-template-areas']
}
const sideList = s => (Array.isArray(LOGICAL[s]) ? LOGICAL[s] : LOGICAL[s] ? [LOGICAL[s]] : SIDES.includes(s) ? [s] : null)
function atoms(prop) {
  const p = prop.replace(/^-(webkit|moz|ms)-/, '')
  if (p.startsWith('--')) return [p]
  if (SHORT[p]) return SHORT[p]
  let m = /^(padding|margin|scroll-margin|scroll-padding)(?:-(.+))?$/.exec(p)
  if (m) { const sides = m[2] ? sideList(m[2]) : SIDES; return sides ? sides.map(x => `${m[1]}-${x}`) : [p] }
  m = /^inset(?:-(.+))?$/.exec(p)
  if (m) return (m[1] ? sideList(m[1]) : SIDES) ?? [p]
  if (SIDES.includes(p)) return [p]
  if (p === 'border') return [...SIDES.flatMap(x => ['width', 'style', 'color'].map(k => `border-${x}-${k}`)), ...SHORT['border-image']]
  m = /^border-(width|style|color)$/.exec(p)
  if (m) return SIDES.map(x => `border-${x}-${m[1]}`)
  if (p === 'border-radius') return ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(c => `border-${c}-radius`)
  m = /^border-(start-start|start-end|end-start|end-end)-radius$/.exec(p)
  if (m) return [`border-${CORNERS[m[1]]}-radius`]
  m = /^border-(top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end)(?:-(width|style|color))?$/.exec(p)
  if (m) return sideList(m[1]).flatMap(x => (m[2] ? [m[2]] : ['width', 'style', 'color']).map(k => `border-${x}-${k}`))
  return [p]
}
const overlap = (a, b) => { const s = new Set(atoms(a)); return atoms(b).some(x => s.has(x)) }

const FORBIDDEN = /:deep\(|:global\(|:slotted\(|::v-|>>>|\/deep\/|^:root|^html\b|^body\b|&/

function convert(src, name) {
  const { descriptor, errors } = parseSfc(src, { ignoreEmpty: false })
  if (errors.length || !descriptor.template?.ast) return null
  // Unscoped blocks take part in the cascade analysis but are never rewritten.
  const styles = descriptor.styles.filter(s => !s.lang && !s.src && !s.module)
  if (!styles.some(s => s.scoped)) return null
  // Selectors on the class attribute itself would see the utilities: leave such files alone.
  if (styles.some(s => /\[class[~|^$*]?=/.test(s.content))) return null
  const els = analyzeTemplate(descriptor.template.ast, src)
  // Classes that reach an unresolved `:class` binding come from script code.
  RUNTIME = runtimeClasses((descriptor.script?.content ?? '') + (descriptor.scriptSetup?.content ?? ''))

  const units = [] // one per (rule, selector, declaration)
  const styleRoots = []
  for (const [n, style] of styles.entries()) {
    const root = postcss.parse(style.content)
    if (style.scoped) styleRoots.push({ style, root })
    const keyframes = new Set()
    root.walkAtRules(/keyframes$/, a => { keyframes.add(a.params.trim()) })
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return
      const at = []
      let nested = false
      for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
        if (p.type === 'atrule') at.unshift({ name: p.name, params: p.params })
        else nested = true
      }
      const selectors = splitList(rule.selector)
      const decls = rule.nodes.filter(n => n.type === 'decl')
      selectors.forEach((sel, si) => {
        const compounds = FORBIDDEN.test(sel) || nested ? null : parseSelector(sel)
        const spec = style.scoped ? add(specificity(sel), [0, 1, 0]) : specificity(sel)
        decls.forEach((d, di) => {
          // Shorthand and longhand in one rule: the minifier may reorder them, so they keep their rule.
          const pinned = !style.scoped || decls.some((o, oi) => oi !== di && overlap(o.prop, d.prop))
          units.push({
            rule, si, sel, compounds, at, decl: d, di, spec, important: !!d.important, order: n * 1e9 + rule.source.start.offset * 1000 + di, pinned,
            keyframeRef: (/^animation(-name)?$/.test(d.prop) && [...keyframes].some(k => new RegExp(`(^|[\\s,])${k}([\\s,]|$)`).test(d.value))) || /v-bind\(/.test(d.value)
          })
        })
      })
    })
  }

  BG_IMAGES = units.some(u => u.decl.prop === 'background-image' || (u.decl.prop === 'background' && !isColorish(u.decl.value)))
  // Where each unit can land (liberal) and how it would be converted (precise), per unit.
  const plans = new Map()
  for (const u of units) {
    u.pe = ''
    if (!u.compounds) { u.reach = new Set(els.map(e => e.id)); note(FORBIDDEN.test(u.sel) ? 'deep/global/nesting' : 'unparsed selector'); continue }
    const subject = u.compounds[u.compounds.length - 1]
    u.pe = subject.parts.find(p => p.kind === 'pe')?.raw ?? ''
    u.reach = new Set(els.filter(e => compoundMay(e, subject)).map(e => e.id))
    if (u.keyframeRef) { note('keyframes or v-bind'); continue }
    if (u.pinned) { note('shorthand with longhand, or unscoped'); continue }
    const key = `${u.rule.source.start.offset}|${u.si}`
    let plan = plans.get(key)
    if (plan === undefined) { plan = planSelector(u, els); plans.set(key, plan) }
    if (plan.fail) { note(plan.fail); continue }
    // On a component the utility meets the component's own styles on its root: only where they never touch the property.
    if (plan.targets.some(t => els[t.el].isComponent && componentTouches(els[t.el].node.tag, u.decl.prop))) { note('class on a component'); continue }
    // The root can also be styled by the classes parents give this component: those properties keep their rule.
    if (PARENT_PROPS.has(name) && plan.targets.some(t => els[t.el].rootish) && atoms(u.decl.prop).some(a => PARENT_PROPS.get(name).has(a))) { note('parent styles the root'); continue }
    const atv = u.at.map(atVariant)
    if (atv.some(v => !v)) { note('at-rule'); continue }
    const utils = declUtilities(u.decl.prop, u.decl.value)
    if (!utils) { note('value'); continue }
    const variants = [...atv, ...plan.variants]
    const tokens = utils.map(x => `mi:${[...variants, x].join(':')}${u.important ? '!' : ''}`)
    const rules = tokens.map(t => parseToken(t))
    if (rules.some(r => !r)) { note('engine rejected ' + tokens.join(' ')); continue }
    // Literal anchors live in JS strings: no quotes or backslashes there.
    if (plan.targets.some(t => t.lit) && tokens.some(t => /['"`\\]/.test(t))) { note('quote in literal'); continue }
    if (plan.targets.some(t => !t.lit && els[t.el].staticAttr && tokens.some(x => x.includes(els[t.el].staticAttr.quote)))) { note('quote in attribute'); continue }
    u.conv = { tokens, rules, plan, specs: rules.map(r => specificity(r.selector)) }
  }

  // Fixpoint: a converted unit stays converted only if every cascade it takes part in keeps its winner.
  const byEl = new Map()
  for (const u of units) for (const id of u.reach) { const k = id + u.pe; if (!byEl.has(k)) byEl.set(k, []); byEl.get(k).push(u) }
  const origBefore = (a, b) => (a.important !== b.important ? !a.important : cmp3(a.spec, b.spec) !== 0 ? cmp3(a.spec, b.spec) < 0 : a.order < b.order)
  /** Does a lose to b after conversion? null when the order is not fixed (different sheets, same specificity). */
  const newBefore = (a, ra, sa, b, rb, sb) => {
    if (a.important !== b.important) return !a.important
    const sA = ra ? sa : a.spec, sB = rb ? sb : b.spec
    const c = cmp3(sA, sB)
    if (c) return c < 0
    if (!!ra !== !!rb) return null
    if (ra) { const k = compare(ra, rb); return k === 0 ? null : k < 0 }
    return a.order < b.order
  }
  const touches = (a, b) => a.some(p => b.some(q => overlap(p, q)))
  const propsOf = r => r.decls.map(([p]) => p)
  const settle = () => { let changed = true
  while (changed) {
    changed = false
    for (const list of byEl.values()) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j]
          if (!a.conv && !b.conv) continue
          if (a.rule === b.rule && a.si !== b.si) { /* same rule, other selector: distinct units, still compared */ }
          const pa = a.conv ? a.conv.rules.flatMap(propsOf) : [a.decl.prop]
          const pb = b.conv ? b.conv.rules.flatMap(propsOf) : [b.decl.prop]
          if (!touches(pa, pb) && !overlap(a.decl.prop, b.decl.prop)) continue
          const want = origBefore(a, b)
          const ra = a.conv?.rules ?? [null], rb = b.conv?.rules ?? [null]
          let bad = false
          for (let x = 0; x < ra.length && !bad; x++) {
            for (let y = 0; y < rb.length && !bad; y++) {
              if (!touches(ra[x] ? propsOf(ra[x]) : [a.decl.prop], rb[y] ? propsOf(rb[y]) : [b.decl.prop])) continue
              const got = newBefore(a, ra[x], a.conv?.specs[x], b, rb[y], b.conv?.specs[y])
              if (got !== want) bad = true
            }
          }
          if (bad) {
            if (a.conv) { a.conv = null; changed = true; note('cascade') }
            if (b.conv) { b.conv = null; changed = true; note('cascade') }
          }
        }
      }
    }
  } }
  settle()

  // Optionally a rule converts whole or not at all: an element then never pays for both a composed class and a
  // scoped rule. Undoing a conversion can break another one's cascade, hence the outer loop.
  if (WHOLE) {
    for (let again = true; again;) {
      again = false
      const partial = new Set(units.filter(u => !u.conv).map(u => `${u.rule.source.start.offset}|${u.si}`))
      for (const u of units) if (u.conv && partial.has(`${u.rule.source.start.offset}|${u.si}`)) { u.conv = null; again = true; note('rule kept whole') }
      if (again) settle()
    }
  }

  // Template edits.
  const edits = []
  for (const u of units) {
    if (!u.conv) continue
    for (const t of u.conv.plan.targets) {
      const el = els[t.el]
      if (t.lit) { const k = t.lit; if (!el.litAdd.has(k)) el.litAdd.set(k, new Set()); for (const x of u.conv.tokens) el.litAdd.get(k).add(x) }
      else for (const x of u.conv.tokens) el.add.add(x)
    }
  }
  for (const el of els) {
    if (el.add.size) {
      const list = [...el.add].join(' ')
      if (el.staticAttr) edits.push({ at: el.staticAttr.end - 1, text: ' ' + list })
      else edits.push({ at: el.node.loc.start.offset + 1 + el.node.tag.length, text: ` class="${list}"` })
    }
    for (const [lit, set] of el.litAdd) {
      const list = [...set].join(' ')
      if (lit.quote) edits.push({ at: lit.end - 1, text: ' ' + list })
      else edits.push({ at: lit.start, del: lit.end - lit.start, text: lit.shorthand ? `'${lit.value} ${list}': ${lit.value}` : `'${lit.value} ${list}'` })
    }
  }

  // Style edits: keep, per rule, the declarations still needed for each selector.
  const converted = units.filter(u => u.conv).length
  for (const { style, root } of styleRoots) {
    root.walkRules((rule) => {
      const mine = units.filter(u => u.rule === rule)
      if (!mine.some(u => u.conv)) return
      const selectors = splitList(rule.selector)
      const groups = []
      selectors.forEach((sel, si) => {
        const keep = mine.filter(u => u.si === si && !u.conv).map(u => u.di)
        const sig = keep.join(',')
        const g = groups.find(x => x.sig === sig)
        if (g) g.sels.push(sel)
        else groups.push({ sig, keep, sels: [sel] })
      })
      const decls = rule.nodes.filter(n => n.type === 'decl')
      const replacement = groups.filter(g => g.keep.length).map((g) => {
        const r = rule.clone({ selector: g.sels.join(', ') })
        r.removeAll()
        for (const di of g.keep) r.append(decls[di].clone())
        return r
      })
      if (replacement.length) rule.replaceWith(...replacement)
      else {
        const prev = rule.prev()
        if (prev?.type === 'comment') prev.remove()
        rule.remove()
      }
    })
    let pruned = true
    while (pruned) {
      pruned = false
      root.walkAtRules((a) => { if (!/keyframes$/.test(a.name) && a.nodes && !a.nodes.some(n => n.type !== 'comment')) { a.remove(); pruned = true } })
    }
    const out = root.toString()
    const empty = !root.nodes.some(n => n.type !== 'comment')
    const block = style.loc
    // The whole <style> element when nothing is left in it.
    if (empty) {
      const start = src.lastIndexOf('<style', block.start.offset)
      let end = src.indexOf('</style>', block.end.offset) + '</style>'.length
      let s0 = start
      while (s0 > 0 && /[ \t]/.test(src[s0 - 1])) s0--
      if (src[s0 - 1] === '\n' && src[s0 - 2] === '\n') s0--
      if (src[end] === '\n') end++
      edits.push({ at: s0, del: end - s0, text: '' })
    }
    else edits.push({ at: block.start.offset, del: block.end.offset - block.start.offset, text: out.replace(/^\n?/, '\n').replace(/\s*$/, '\n') })
  }

  edits.sort((a, b) => b.at - a.at)
  let out = src
  for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.at + (e.del ?? 0))
  return { out, total: units.length, converted }
}

/** How a selector maps onto template elements: the elements that carry the utility and the variants. */
const why = new Map()
const note = r => why.set(r, (why.get(r) ?? 0) + 1)
const fail = r => ({ fail: r })

function planSelector(u, els) {
  const comps = u.compounds
  const subject = comps[comps.length - 1]
  const prefix = comps.slice(0, -1)
  const prefixRaw = prefix.length ? selectorRaw(prefix) + (subject.comb === ' ' ? ' ' : subject.comb) : ''
  const classes = subject.parts.filter(p => p.kind === 'class')
  const tag = subject.parts.find(p => p.kind === 'tag')
  if (subject.parts.some(p => p.kind === 'id')) return fail('id')
  let targets = []
  let restParts
  if (classes.length) {
    // Anchor on a class the template sets statically, else on one set by a literal of a :class binding.
    const anchor = classes.find(c => els.some(e => e.staticClasses.has(c.name))) ?? classes.find(c => els.some(e => e.lits.some(l => l.classes.includes(c.name))))
    if (!anchor) return fail('class not in template')
    // Another element could get the class at runtime: not provable.
    if (els.some(e => !e.staticClasses.has(anchor.name) && !e.lits.some(l => l.classes.includes(anchor.name)) && mayHave(e, anchor.name))) return fail('class set at runtime' + (process.env.WHY ? ' ' + anchor.name : ''))
    for (const e of els) {
      if (e.staticClasses.has(anchor.name)) targets.push({ el: e.id })
      else for (const l of e.lits) if (l.classes.includes(anchor.name)) targets.push({ el: e.id, lit: l })
    }
    if (tag && targets.some(t => els[t.el].tag !== tag.name)) return fail('tag mismatch')
    restParts = subject.parts.filter(p => p !== anchor && p !== tag)
  }
  else if (tag || subject.parts.some(p => p.kind === 'universal')) {
    // `.a b` / `.a > *`: plain elements of that tag under (or right under) a possible ancestor.
    if (!prefix.length || !['>', ' '].includes(subject.comb)) return fail('bare tag')
    const anc = prefix[prefix.length - 1]
    const ok = e => (subject.comb === '>' ? (e.parent ? [e.parent] : []) : [...ancestors(e)]).some(a => compoundMay(a, anc))
    const reach = els.filter(e => (!tag || e.tag === null || e.tag === tag.name) && ok(e))
    // Vue scopes `.a > *` on `.a`: the star then matches slot content and, under a descendant combinator, component internals.
    if (!tag) {
      const holders = els.filter(e => compoundMay(e, anc))
      const deep = e => e.hasSlot || e.children.some(c => (subject.comb === ' ' && (c.isComponent || deep(c))))
      if (holders.some(h => h.hasSlot || deep(h))) return fail('universal selector over a slot or component')
    }
    targets = reach.map(e => ({ el: e.id }))
    // A component's root may be any tag: keep the tag in the selector.
    restParts = subject.parts.filter(p => p.kind !== 'universal' && (p !== tag || reach.some(e => e.isComponent)))
  }
  else return fail('no anchor')
  if (!targets.length) return fail('no target')
  const variants = selectorVariant(prefixRaw, restParts)
  if (!variants) return fail('selector not expressible')
  return { targets, variants }
}

// ---------------------------------------------------------------------------------------------
// CLI

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const WHOLE = args.includes('--whole-rules')
const files = []
const collect = (p) => {
  if (statSync(p).isDirectory()) for (const f of readdirSync(p)) collect(join(p, f))
  else if (p.endsWith('.vue')) files.push(p)
}
for (const a of args.filter(a => !a.startsWith('--'))) collect(a)
indexComponents(['app/components', 'site/app/components'])
indexParents(files)
let total = 0, conv = 0, removed = 0
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  let res
  try { res = convert(src, f.split('/').pop().replace(/\.vue$/, '')) }
  catch (e) { console.log(`${f}: skipped (${e.message})`); continue }
  if (!res) continue
  total += res.total; conv += res.converted
  if (!/<style[^>]*scoped/.test(res.out)) removed++
  if (!dry && res.out !== src) writeFileSync(f, res.out)
  if (args.includes('--verbose')) console.log(`${f}: ${res.converted}/${res.total}`)
}
if (args.includes('--why')) for (const [k, n] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`${String(n).padStart(6)}  ${k}`)
console.log(`${files.length} files, ${conv}/${total} declarations moved to utilities (${total ? Math.round(conv / total * 100) : 0}%), ${removed} files without scoped style left`)
