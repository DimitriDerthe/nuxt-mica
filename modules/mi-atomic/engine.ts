// Mica atomic CSS engine: turns `mi:`-prefixed utility classes into CSS. Pure functions, no dependencies,
// no runtime: the Nuxt module next to this file scans the sources and writes only the rules in use.
//
// Class grammar: `<prefix>:<variant>:…:<utility>[!]`, e.g. `mi:@[560px]:hover:bg-p/20`.
// Values are resolved at build time to literals (`gap-4.5` → `gap:18px`), so the browser never
// evaluates a calc() or a var() it does not need.

export type Decl = [prop: string, value: string]

/** One generated rule, kept with the key that fixes its place in the stylesheet. */
export interface Rule {
  token: string
  /** At-rule preludes, outermost first (`@container (min-width:560px)`). */
  at: string[]
  selector: string
  decls: Decl[]
  important: boolean
  key: SortKey
  /** `@property` and `@keyframes` blocks this rule depends on, emitted once ahead of the rules. */
  extras: string[]
}

interface SortKey { at: number[], variants: number[], depth: number, count: number, prop: string }

// ---------------------------------------------------------------------------------------------
// Theme: Mica tokens. Everything maps to the `--mi-*` custom properties of `app/assets/css/mi.css`.

const COLORS = new Set([
  'page', 'card', 'elev', 'seg', 'label', 'label2', 'label3', 'sep', 'sep2', 'fill', 'fill2', 'fill3', 'fill4',
  'field', 'field-b', 'off', 'scrim', 'mat', 'mat-b', 'side', 'ctl',
  'red', 'red-t', 'orange', 'orange-t', 'yellow', 'green', 'green-t', 'mint', 'teal', 'blue', 'indigo', 'purple', 'pink',
  'p', 'p-on', 'p-hover', 'p-tint', 'p-tint2', 'p-text', 's', 's-on', 's-hover', 's-tint', 's-tint2', 's-text'
])
const KEYWORD_COLORS: Record<string, string> = { current: 'currentColor', transparent: 'transparent', inherit: 'inherit', white: '#fff', black: '#000' }
const RADII: Record<string, string> = { '': '4px', none: '0', s: 'var(--mi-radius-s)', m: 'var(--mi-radius-m)', l: 'var(--mi-radius-l)', xl: 'var(--mi-radius-xl)', full: '9999px' }
const SHADOWS: Record<string, string> = { 1: 'var(--mi-sh1)', 2: 'var(--mi-sh2)', 3: 'var(--mi-sh3)', none: 'none' }
const EASES: Record<string, string> = {
  linear: 'linear', in: 'cubic-bezier(.4,0,1,1)', out: 'cubic-bezier(0,0,.2,1)', 'in-out': 'cubic-bezier(.4,0,.2,1)',
  mi: 'var(--mi-ease)', 'mi-in-out': 'var(--mi-ease-in-out)', spring: 'var(--mi-spring)'
}
const TEXT_SIZES: Record<string, [string, string]> = {
  xs: ['12px', '16px'], sm: ['14px', '20px'], base: ['16px', '24px'], lg: ['18px', '28px'], xl: ['20px', '28px'],
  '2xl': ['24px', '32px'], '3xl': ['30px', '36px'], '4xl': ['36px', '40px'], '5xl': ['48px', '1'], '6xl': ['60px', '1'],
  '7xl': ['72px', '1'], '8xl': ['96px', '1'], '9xl': ['128px', '1']
}
const BREAKPOINTS: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
const CONTAINERS: Record<string, number> = {
  '3xs': 256, '2xs': 288, xs: 320, sm: 384, md: 448, lg: 512, xl: 576, '2xl': 672, '3xl': 768, '4xl': 896, '5xl': 1024, '6xl': 1152, '7xl': 1280
}

// ---------------------------------------------------------------------------------------------
// Values

const NUM = /^\d+(\.\d+)?$/
const num = (n: number) => String(Math.round(n * 1e4) / 1e4)

/** Reads `[…]` (arbitrary, with an optional `type:` hint) and `(--var)` values. */
function arbitrary(v: string): { hint: string, value: string } | null {
  let inner: string
  let isVar = false
  if (v.startsWith('[') && v.endsWith(']')) inner = v.slice(1, -1)
  else if (v.startsWith('(') && v.endsWith(')')) { inner = v.slice(1, -1); isVar = true }
  else return null
  if (!inner || !balanced(inner)) return null
  let hint = ''
  const m = /^([a-z-]+):(?!:)/.exec(inner)
  if (m && !inner.startsWith('--')) { hint = m[1]!; inner = inner.slice(m[0].length) }
  if (isVar) return inner.startsWith('--') && /^--[\w-]+$/.test(inner) ? { hint, value: `var(${inner})` } : null
  return { hint, value: decode(inner) }
}

/** `_` stands for a space in arbitrary values; `\_` is a literal underscore, and custom property names keep theirs. */
export function decode(s: string): string {
  let out = ''
  let inName = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!
    if (c === '\\' && s[i + 1] === '_') { out += '_'; i++; continue }
    if (c === '-' && s[i + 1] === '-' && !/[\w-]/.test(s[i - 1] ?? '')) inName = true
    else if (inName && !/[\w-]/.test(c)) inName = false
    out += c === '_' && !inName ? ' ' : c
  }
  return out
}

function balanced(s: string): boolean {
  const stack: string[] = []
  let quote = ''
  for (const c of s) {
    if (quote) { if (c === quote) quote = ''; continue }
    if (c === '"' || c === '\'') quote = c
    else if (c === '[' || c === '(' || c === '{') stack.push(c)
    else if (c === ']' || c === ')' || c === '}') {
      const o = stack.pop()
      if ((c === ']' && o !== '[') || (c === ')' && o !== '(') || (c === '}' && o !== '{')) return false
    }
  }
  return !quote && !stack.length
}

const negate = (v: string) => /^\d/.test(v) ? '-' + v : v === '0' ? '0' : `calc(${v} * -1)`

/** Spacing scale: `n` is n × 4px, `px` is 1px. */
function spacing(v: string): string | null {
  if (NUM.test(v)) return +v === 0 ? '0' : num(+v * 4) + 'px'
  if (v === 'px') return '1px'
  return arbitrary(v)?.value ?? null
}

function fraction(v: string): string | null {
  const m = /^(\d+)\/(\d+)$/.exec(v)
  return m && +m[2]! ? num(+m[1]! / +m[2]! * 100) + '%' : null
}

function sizing(v: string, axis: 'w' | 'h' | ''): string | null {
  switch (v) {
    case 'auto': return 'auto'
    case 'full': return '100%'
    case 'min': return 'min-content'
    case 'max': return 'max-content'
    case 'fit': return 'fit-content'
    case 'none': return 'none'
    case 'screen': return axis === 'h' ? '100vh' : '100vw'
    case 'svh': case 'lvh': case 'dvh': case 'svw': case 'lvw': case 'dvw': return '100' + v
  }
  return fraction(v) ?? spacing(v)
}

function color(v: string, mod: string | null): string | null {
  let c: string | null = null
  if (COLORS.has(v)) c = `var(--mi-${v})`
  else if (v in KEYWORD_COLORS) c = KEYWORD_COLORS[v]!
  else {
    const a = arbitrary(v)
    if (a && (!a.hint || a.hint === 'color')) c = a.value
  }
  if (!c || mod === null) return c
  const pct = NUM.test(mod) ? mod + '%' : arbitrary(mod)?.value
  return pct ? `color-mix(in srgb, ${c} ${pct}, transparent)` : null
}

const looksLikeLength = (v: string) => /^-?[\d.]+(px|r?em|%|vw|vh|svh|dvh|lvh|vmin|vmax|cq[iwhb]|cqmin|cqmax|ch|ex|lh|pt)$/.test(v)
  || /^(clamp|min|max|calc)\(/.test(v)

// ---------------------------------------------------------------------------------------------
// Utilities

type Fn = (v: string, mod: string | null, neg: boolean) => Decl[] | null
const statics = new Map<string, Decl[]>()
const fns = new Map<string, Fn>()
/** Extra blocks (`@property`, `@keyframes`) a utility needs, keyed by utility root or static name. */
const needs = new Map<string, string[]>()

const S = (name: string, ...decls: Decl[]) => statics.set(name, decls)
const each = (prop: string, prefix: string, values: string[], map: (v: string) => string = v => v) => {
  for (const v of values) S(prefix + v, [prop, map(v)])
}
const F = (roots: string | string[], fn: Fn) => { for (const r of [roots].flat()) fns.set(r, fn) }
const prop = (p: string | string[], v: string): Decl[] => [p].flat().map(x => [x, v] as Decl)

// Layout
for (const d of ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'flow-root', 'list-item', 'table', 'table-row', 'table-cell', 'table-caption', 'table-column', 'table-row-group', 'table-header-group', 'table-footer-group']) S(d, ['display', d])
S('hidden', ['display', 'none'])
each('position', '', ['static', 'fixed', 'absolute', 'relative', 'sticky'])
S('visible', ['visibility', 'visible']); S('invisible', ['visibility', 'hidden']); S('collapse', ['visibility', 'collapse'])
S('isolate', ['isolation', 'isolate']); S('isolation-auto', ['isolation', 'auto'])
S('box-border', ['box-sizing', 'border-box']); S('box-content', ['box-sizing', 'content-box'])
for (const ax of ['', '-x', '-y']) each('overflow' + ax, `overflow${ax}-`, ['auto', 'hidden', 'clip', 'visible', 'scroll'])
for (const ax of ['', '-x', '-y']) each('overscroll-behavior' + ax, `overscroll${ax}-`, ['auto', 'contain', 'none'])
each('float', 'float-', ['left', 'right', 'none', 'start', 'end'], v => v === 'start' ? 'inline-start' : v === 'end' ? 'inline-end' : v)
each('clear', 'clear-', ['left', 'right', 'both', 'none'])
each('object-fit', 'object-', ['contain', 'cover', 'fill', 'none', 'scale-down'])
each('object-position', 'object-', ['bottom', 'center', 'left', 'right', 'top'])
each('vertical-align', 'align-', ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'])
F('z', (v, _, n) => { const x = v === 'auto' ? 'auto' : NUM.test(v) ? v : arbitrary(v)?.value; return x ? [['z-index', n ? negate(x) : x]] : null })
F('order', (v, _, n) => { const x = v === 'first' ? '-9999' : v === 'last' ? '9999' : v === 'none' ? '0' : NUM.test(v) ? v : arbitrary(v)?.value; return x ? [['order', n ? negate(x) : x]] : null })
F('aspect', (v, mod) => {
  const x = v === 'square' ? '1 / 1' : v === 'video' ? '16 / 9' : v === 'auto' ? 'auto' : mod && NUM.test(v) && NUM.test(mod) ? `${v} / ${mod}` : arbitrary(v)?.value
  return x ? [['aspect-ratio', x]] : null
})
F('object', v => { const a = arbitrary(v); return a ? [['object-position', a.value]] : null })
F('columns', v => { const x = NUM.test(v) || v === 'auto' ? v : arbitrary(v)?.value; return x ? [['columns', x]] : null })

const insets: Record<string, string[]> = {
  inset: ['inset'], 'inset-x': ['inset-inline'], 'inset-y': ['inset-block'], start: ['inset-inline-start'], end: ['inset-inline-end'],
  top: ['top'], right: ['right'], bottom: ['bottom'], left: ['left']
}
for (const [r, ps] of Object.entries(insets)) F(r, (v, mod, n) => { const x = sizing(mod ? `${v}/${mod}` : v, ''); return x && x !== 'none' ? prop(ps, n ? negate(x) : x) : null })

// Flexbox and grid
each('flex-direction', 'flex-', ['row', 'row-reverse', 'col', 'col-reverse'], v => v.replace('col', 'column'))
each('flex-wrap', 'flex-', ['wrap', 'wrap-reverse', 'nowrap'])
F('flex', (v, mod) => {
  const x = v === 'auto' ? '1 1 auto' : v === 'initial' ? '0 1 auto' : v === 'none' ? 'none' : NUM.test(v) && !mod ? v : arbitrary(v)?.value
  return x ? [['flex', x]] : null
})
F('grow', v => { const x = v === '' ? '1' : NUM.test(v) ? v : arbitrary(v)?.value; return x ? [['flex-grow', x]] : null })
F('shrink', v => { const x = v === '' ? '1' : NUM.test(v) ? v : arbitrary(v)?.value; return x ? [['flex-shrink', x]] : null })
F('basis', (v, mod) => { const x = sizing(mod ? `${v}/${mod}` : v, 'w'); return x && x !== 'none' ? [['flex-basis', x]] : null })
for (const [r, p] of [['grid-cols', 'grid-template-columns'], ['grid-rows', 'grid-template-rows']] as const) {
  F(r, (v) => {
    const x = NUM.test(v) ? `repeat(${v}, minmax(0, 1fr))` : v === 'none' || v === 'subgrid' ? v : arbitrary(v)?.value
    return x ? [[p, x]] : null
  })
}
for (const [r, p] of [['col', 'grid-column'], ['row', 'grid-row']] as const) {
  F(r, v => { const x = v === 'auto' ? 'auto' : arbitrary(v)?.value; return x ? [[p, x]] : null })
  F(`${r}-span`, v => { const x = v === 'full' ? '1 / -1' : NUM.test(v) ? `span ${v} / span ${v}` : arbitrary(v)?.value; return x ? [[p, x]] : null })
  F(`${r}-start`, (v, _, n) => { const x = NUM.test(v) || v === 'auto' ? v : arbitrary(v)?.value; return x ? [[`${p}-start`, n ? negate(x) : x]] : null })
  F(`${r}-end`, (v, _, n) => { const x = NUM.test(v) || v === 'auto' ? v : arbitrary(v)?.value; return x ? [[`${p}-end`, n ? negate(x) : x]] : null })
}
for (const [r, p] of [['auto-cols', 'grid-auto-columns'], ['auto-rows', 'grid-auto-rows']] as const) {
  F(r, v => { const x = ({ auto: 'auto', min: 'min-content', max: 'max-content', fr: 'minmax(0, 1fr)' } as Record<string, string>)[v] ?? arbitrary(v)?.value; return x ? [[p, x]] : null })
}
each('grid-auto-flow', 'grid-flow-', ['row', 'col', 'dense', 'row-dense', 'col-dense'], v => v.replace('col', 'column').replace('-', ' '))
F('gap', v => { const x = spacing(v); return x ? [['gap', x]] : null })
F('gap-x', v => { const x = spacing(v); return x ? [['column-gap', x]] : null })
F('gap-y', v => { const x = spacing(v); return x ? [['row-gap', x]] : null })
const ALIGN = ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'normal']
const alignVal = (v: string) => v === 'between' || v === 'around' || v === 'evenly' ? 'space-' + v : v === 'start' || v === 'end' ? 'flex-' + v : v
each('justify-content', 'justify-', ALIGN, alignVal)
each('justify-items', 'justify-items-', ['start', 'end', 'center', 'stretch', 'normal'])
each('justify-self', 'justify-self-', ['auto', 'start', 'end', 'center', 'stretch'])
each('align-content', 'content-', ALIGN, alignVal)
each('align-items', 'items-', ['start', 'end', 'center', 'baseline', 'stretch'], alignVal)
each('align-self', 'self-', ['auto', 'start', 'end', 'center', 'stretch', 'baseline'], alignVal)
each('place-content', 'place-content-', ['center', 'start', 'end', 'between', 'around', 'evenly', 'baseline', 'stretch'], v => ['between', 'around', 'evenly'].includes(v) ? 'space-' + v : v)
each('place-items', 'place-items-', ['start', 'end', 'center', 'baseline', 'stretch'])
each('place-self', 'place-self-', ['auto', 'start', 'end', 'center', 'stretch'])

// Spacing and sizing
const box: Record<string, string[]> = { '': [''], x: ['-inline'], y: ['-block'], t: ['-top'], r: ['-right'], b: ['-bottom'], l: ['-left'], s: ['-inline-start'], e: ['-inline-end'] }
for (const [k, sfx] of Object.entries(box)) {
  F('p' + k, v => { const x = spacing(v); return x ? prop(sfx.map(s => 'padding' + s), x) : null })
  F('m' + k, (v, _, n) => { const x = v === 'auto' ? 'auto' : spacing(v); return x ? prop(sfx.map(s => 'margin' + s), n ? negate(x) : x) : null })
  F('scroll-p' + k, v => { const x = spacing(v); return x ? prop(sfx.map(s => 'scroll-padding' + s), x) : null })
  F('scroll-m' + k, (v, _, n) => { const x = spacing(v); return x ? prop(sfx.map(s => 'scroll-margin' + s), n ? negate(x) : x) : null })
}
for (const [r, p, ax] of [['w', 'width', 'w'], ['h', 'height', 'h'], ['min-w', 'min-width', 'w'], ['min-h', 'min-height', 'h'], ['max-w', 'max-width', 'w'], ['max-h', 'max-height', 'h']] as const) {
  F(r, (v, mod) => { const x = sizing(mod ? `${v}/${mod}` : v, ax); return x && (x !== 'none' || r.startsWith('max')) ? [[p, x]] : null })
}
F('size', (v, mod) => { const x = sizing(mod ? `${v}/${mod}` : v, ''); return x && x !== 'none' ? [['width', x], ['height', x]] : null })

// Typography
each('font-weight', 'font-', ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'], v => String(['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'].indexOf(v) * 100 + 100))
S('font-sans', ['font-family', 'var(--mi-font)']); S('font-mi', ['font-family', 'var(--mi-font)'])
S('font-mono', ['font-family', 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'])
F('font', (v) => {
  if (NUM.test(v)) return [['font-weight', v]]
  const a = arbitrary(v)
  if (!a) return null
  return [[a.hint === 'weight' || (!a.hint && /^\d+$/.test(a.value)) ? 'font-weight' : 'font-family', a.value]]
})
each('text-align', 'text-', ['left', 'center', 'right', 'justify', 'start', 'end'])
F('text', (v, mod) => {
  const size = TEXT_SIZES[v]
  if (size) {
    const lh = mod === null ? size[1] : NUM.test(mod) ? num(+mod * 4) + 'px' : arbitrary(mod)?.value
    return lh ? [['font-size', size[0]], ['line-height', lh]] : null
  }
  const a = arbitrary(v)
  if (a && (a.hint === 'length' || (!a.hint && looksLikeLength(a.value)))) {
    if (mod === null) return [['font-size', a.value]]
    const lh = NUM.test(mod) ? num(+mod * 4) + 'px' : arbitrary(mod)?.value
    return lh ? [['font-size', a.value], ['line-height', lh]] : null
  }
  const c = color(v, mod)
  return c ? [['color', c]] : null
})
S('italic', ['font-style', 'italic']); S('not-italic', ['font-style', 'normal'])
S('underline', ['text-decoration-line', 'underline']); S('overline', ['text-decoration-line', 'overline'])
S('line-through', ['text-decoration-line', 'line-through']); S('no-underline', ['text-decoration-line', 'none'])
each('text-transform', '', ['uppercase', 'lowercase', 'capitalize'])
S('normal-case', ['text-transform', 'none'])
S('truncate', ['overflow', 'hidden'], ['text-overflow', 'ellipsis'], ['white-space', 'nowrap'])
S('text-ellipsis', ['text-overflow', 'ellipsis']); S('text-clip', ['text-overflow', 'clip'])
each('white-space', 'whitespace-', ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'])
each('text-wrap', 'text-', ['wrap', 'nowrap', 'balance', 'pretty'])
S('break-normal', ['overflow-wrap', 'normal'], ['word-break', 'normal'])
S('break-words', ['overflow-wrap', 'break-word']); S('wrap-anywhere', ['overflow-wrap', 'anywhere'])
S('break-all', ['word-break', 'break-all']); S('break-keep', ['word-break', 'keep-all'])
each('hyphens', 'hyphens-', ['none', 'manual', 'auto'])
for (const v of ['normal-nums', 'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums', 'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions']) {
  S(v, ['font-variant-numeric', v === 'normal-nums' ? 'normal' : v])
}
const LEADING: Record<string, string> = { none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' }
F('leading', (v) => { const x = LEADING[v] ?? spacing(v); return x ? [['line-height', x]] : null })
const TRACKING: Record<string, string> = { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
F('tracking', (v, _, n) => { const x = TRACKING[v] ?? arbitrary(v)?.value; return x ? [['letter-spacing', n ? negate(x) : x]] : null })
F('indent', (v, _, n) => { const x = spacing(v); return x ? [['text-indent', n ? negate(x) : x]] : null })
F('line-clamp', (v) => {
  if (v === 'none') return [['overflow', 'visible'], ['display', 'block'], ['-webkit-box-orient', 'horizontal'], ['-webkit-line-clamp', 'unset']]
  const x = NUM.test(v) ? v : arbitrary(v)?.value
  return x ? [['overflow', 'hidden'], ['display', '-webkit-box'], ['-webkit-box-orient', 'vertical'], ['-webkit-line-clamp', x]] : null
})
each('list-style-type', 'list-', ['none', 'disc', 'decimal'])
each('list-style-position', 'list-', ['inside', 'outside'])
each('text-decoration-style', 'decoration-', ['solid', 'double', 'dotted', 'dashed', 'wavy'])
F('decoration', (v, mod) => {
  if (NUM.test(v)) return [['text-decoration-thickness', v + 'px']]
  if (v === 'auto' || v === 'from-font') return [['text-decoration-thickness', v]]
  const a = arbitrary(v)
  if (a && (a.hint === 'length' || (!a.hint && looksLikeLength(a.value)))) return [['text-decoration-thickness', a.value]]
  const c = color(v, mod)
  return c ? [['text-decoration-color', c]] : null
})
F('underline-offset', (v, _, n) => { const x = v === 'auto' ? 'auto' : NUM.test(v) ? v + 'px' : arbitrary(v)?.value; return x ? [['text-underline-offset', n ? negate(x) : x]] : null })
F('content', (v) => { const a = arbitrary(v); return v === 'none' ? [['content', 'none']] : a ? [['content', a.value]] : null })

// Backgrounds
F('bg', (v, mod) => {
  if (v === 'none') return [['background-image', 'none']]
  const a = arbitrary(v)
  if (a) {
    if (a.hint === 'image' || a.hint === 'url' || (!a.hint && /^(url|(repeating-)?(linear|radial|conic)-gradient|image-set)\(/.test(a.value))) return [['background-image', a.value]]
    if (a.hint === 'position') return [['background-position', a.value]]
    if (a.hint === 'size') return [['background-size', a.value]]
  }
  const c = color(v, mod)
  return c ? [['background-color', c]] : null
})
each('background-size', 'bg-', ['auto', 'cover', 'contain'])
each('background-position', 'bg-', ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'], v => v.replace('-', ' '))
each('background-repeat', 'bg-', ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'repeat-round', 'repeat-space'], v => v.replace('repeat-round', 'round').replace('repeat-space', 'space'))
each('background-attachment', 'bg-', ['fixed', 'local', 'scroll'])
each('background-clip', 'bg-clip-', ['border', 'padding', 'content', 'text'], v => v === 'text' ? 'text' : v + '-box')
each('background-origin', 'bg-origin-', ['border', 'padding', 'content'], v => v + '-box')

// Borders, outlines, radius
const borderSides: Record<string, string> = { '': '', x: '-inline', y: '-block', t: '-top', r: '-right', b: '-bottom', l: '-left', s: '-inline-start', e: '-inline-end' }
for (const [k, s] of Object.entries(borderSides)) {
  const r = k ? `border-${k}` : 'border'
  F(r, (v, mod) => {
    if (v === '') return [[`border${s}-style`, 'var(--mia-bs, solid)'], [`border${s}-width`, '1px']]
    if (NUM.test(v)) return [[`border${s}-style`, 'var(--mia-bs, solid)'], [`border${s}-width`, v + 'px']]
    const a = arbitrary(v)
    if (a && (a.hint === 'length' || (!a.hint && looksLikeLength(a.value)))) return [[`border${s}-style`, 'var(--mia-bs, solid)'], [`border${s}-width`, a.value]]
    const c = color(v, mod)
    return c ? [[`border${s}-color`, c]] : null
  })
}
for (const st of ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none']) S('border-' + st, ['--mia-bs', st], ['border-style', st])
for (const k of Object.keys(borderSides)) needs.set(k ? `border-${k}` : 'border', ['@property --mia-bs{syntax:"*";inherits:false}'])
const corners: Record<string, string[]> = {
  '': ['border-radius'], t: ['border-top-left-radius', 'border-top-right-radius'], r: ['border-top-right-radius', 'border-bottom-right-radius'],
  b: ['border-bottom-right-radius', 'border-bottom-left-radius'], l: ['border-top-left-radius', 'border-bottom-left-radius'],
  s: ['border-start-start-radius', 'border-end-start-radius'], e: ['border-start-end-radius', 'border-end-end-radius'],
  tl: ['border-top-left-radius'], tr: ['border-top-right-radius'], br: ['border-bottom-right-radius'], bl: ['border-bottom-left-radius'],
  ss: ['border-start-start-radius'], se: ['border-start-end-radius'], ee: ['border-end-end-radius'], es: ['border-end-start-radius']
}
for (const [k, ps] of Object.entries(corners)) F(k ? `rounded-${k}` : 'rounded', (v) => { const x = RADII[v] ?? arbitrary(v)?.value; return x ? prop(ps, x) : null })
F('outline', (v, mod) => {
  if (v === '') return [['outline-style', 'var(--mia-os, solid)'], ['outline-width', '1px']]
  if (NUM.test(v)) return [['outline-style', 'var(--mia-os, solid)'], ['outline-width', v + 'px']]
  const a = arbitrary(v)
  if (a && (a.hint === 'length' || (!a.hint && looksLikeLength(a.value)))) return [['outline-style', 'var(--mia-os, solid)'], ['outline-width', a.value]]
  const c = color(v, mod)
  return c ? [['outline-color', c]] : null
})
for (const st of ['solid', 'dashed', 'dotted', 'double', 'none']) S('outline-' + st, ['--mia-os', st], ['outline-style', st])
needs.set('outline', ['@property --mia-os{syntax:"*";inherits:false}'])
S('outline-hidden', ['outline', '2px solid transparent'], ['outline-offset', '2px'])
F('outline-offset', (v, _, n) => { const x = NUM.test(v) ? v + 'px' : arbitrary(v)?.value; return x ? [['outline-offset', n ? negate(x) : x]] : null })

// Effects
F('shadow', (v) => { const x = SHADOWS[v] ?? arbitrary(v)?.value; return x ? [['box-shadow', x]] : null })
F('opacity', (v) => { const x = NUM.test(v) ? num(+v / 100) : arbitrary(v)?.value; return x ? [['opacity', x]] : null })
each('mix-blend-mode', 'mix-blend-', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-darker', 'plus-lighter'])

const FILTERS = ['blur', 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia', 'drop-shadow']
const filterChain = (p: string) => FILTERS.map(f => `var(--${p}-${f},)`).join(' ')
for (const [root, p, css] of [['', 'mia-f', 'filter'], ['backdrop-', 'mia-bf', 'backdrop-filter']] as const) {
  for (const f of FILTERS) {
    if (root && f === 'drop-shadow') continue
    F(root + f, (v) => {
      let x: string | null | undefined
      if (f === 'blur') x = v === 'none' ? '0' : arbitrary(v)?.value ?? (NUM.test(v) ? v + 'px' : null)
      else if (f === 'hue-rotate') x = NUM.test(v) ? v + 'deg' : arbitrary(v)?.value
      else if (f === 'grayscale' || f === 'invert' || f === 'sepia') x = v === '' ? '100%' : NUM.test(v) ? v + '%' : arbitrary(v)?.value
      else if (f === 'drop-shadow') x = arbitrary(v)?.value
      else x = NUM.test(v) ? v + '%' : arbitrary(v)?.value
      if (!x) return null
      return [[`--${p}-${f}`, `${f}(${x})`], [css, filterChain(p)]]
    })
    needs.set(root + f, [`@property --${p}-${f}{syntax:"*";inherits:false}`])
  }
  S(`${root}filter-none`, [css, 'none'])
  F(`${root}filter`, (v) => { const a = arbitrary(v); return a ? [[css, a.value]] : null })
}

// Transforms: individual `translate`/`scale`/`rotate` properties, composed through non-inherited custom properties.
const T0 = '@property --mia-tx{syntax:"*";inherits:false;initial-value:0}'
const T1 = '@property --mia-ty{syntax:"*";inherits:false;initial-value:0}'
const S0 = '@property --mia-sx{syntax:"*";inherits:false;initial-value:1}'
const S1 = '@property --mia-sy{syntax:"*";inherits:false;initial-value:1}'
const tval = (v: string, mod: string | null, n: boolean) => { const x = sizing(mod ? `${v}/${mod}` : v, ''); return x && x !== 'none' && x !== 'auto' ? (n ? negate(x) : x) : null }
F('translate-x', (v, mod, n) => { const x = tval(v, mod, n); return x ? [['--mia-tx', x], ['translate', 'var(--mia-tx) var(--mia-ty)']] : null })
F('translate-y', (v, mod, n) => { const x = tval(v, mod, n); return x ? [['--mia-ty', x], ['translate', 'var(--mia-tx) var(--mia-ty)']] : null })
F('translate', (v, mod, n) => {
  if (v === 'none') return [['translate', 'none']]
  const a = arbitrary(v)
  if (a) return [['translate', a.value]]
  const x = tval(v, mod, n)
  return x ? [['--mia-tx', x], ['--mia-ty', x], ['translate', 'var(--mia-tx) var(--mia-ty)']] : null
})
needs.set('translate-x', [T0, T1]); needs.set('translate-y', [T0, T1]); needs.set('translate', [T0, T1])
const sval = (v: string, n: boolean) => { const x = NUM.test(v) ? v + '%' : arbitrary(v)?.value; return x ? (n ? negate(x) : x) : null }
F('scale-x', (v, _, n) => { const x = sval(v, n); return x ? [['--mia-sx', x], ['scale', 'var(--mia-sx) var(--mia-sy)']] : null })
F('scale-y', (v, _, n) => { const x = sval(v, n); return x ? [['--mia-sy', x], ['scale', 'var(--mia-sx) var(--mia-sy)']] : null })
F('scale', (v, _, n) => {
  if (v === 'none') return [['scale', 'none']]
  const x = sval(v, n)
  return x ? [['--mia-sx', x], ['--mia-sy', x], ['scale', 'var(--mia-sx) var(--mia-sy)']] : null
})
needs.set('scale-x', [S0, S1]); needs.set('scale-y', [S0, S1]); needs.set('scale', [S0, S1])
F('rotate', (v, _, n) => { const x = v === 'none' ? 'none' : NUM.test(v) ? v + 'deg' : arbitrary(v)?.value; return x ? [['rotate', n && x !== 'none' ? negate(x) : x]] : null })
F('transform', (v) => { const a = arbitrary(v); return v === 'none' ? [['transform', 'none']] : a ? [['transform', a.value]] : null })
S('transform-gpu', ['transform', 'translateZ(0)'])
const ORIGINS = ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left']
each('transform-origin', 'origin-', ORIGINS, v => v.replace('-', ' '))
F('origin', (v) => { const a = arbitrary(v); return a ? [['transform-origin', a.value]] : null })
each('backface-visibility', 'backface-', ['visible', 'hidden'])
each('perspective-origin', 'perspective-origin-', ORIGINS, v => v.replace('-', ' '))
F('perspective', (v) => { const x = v === 'none' ? 'none' : arbitrary(v)?.value; return x ? [['perspective', x]] : null })

// Transitions and animation. Duration and easing go through non-inherited variables so `duration-*`
// overrides the defaults of `transition-*` whatever the order of the two rules.
const TR = '@property --mia-dur{syntax:"*";inherits:false}'
const TE = '@property --mia-ease{syntax:"*";inherits:false}'
const TRANSITIONS: Record<string, string> = {
  '': 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter',
  colors: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
  opacity: 'opacity', shadow: 'box-shadow', transform: 'transform, translate, scale, rotate'
}
const timing: Decl[] = [['transition-timing-function', 'var(--mia-ease, var(--mi-ease))'], ['transition-duration', 'var(--mia-dur, var(--mi-dur-2))']]
S('transition-none', ['transition-property', 'none'])
F('transition', (v) => {
  const p = TRANSITIONS[v] ?? arbitrary(v)?.value
  return p ? [['transition-property', p], ...timing] : null
})
needs.set('transition', [TR, TE])
F('duration', (v) => { const x = NUM.test(v) ? v + 'ms' : arbitrary(v)?.value; return x ? [['--mia-dur', x], ['transition-duration', x]] : null })
needs.set('duration', [TR])
F('ease', (v) => { const x = EASES[v] ?? arbitrary(v)?.value; return x ? [['--mia-ease', x], ['transition-timing-function', x]] : null })
needs.set('ease', [TE])
F('delay', (v) => { const x = NUM.test(v) ? v + 'ms' : arbitrary(v)?.value; return x ? [['transition-delay', x]] : null })
const KEYFRAMES: Record<string, [string, string]> = {
  spin: ['spin 1s linear infinite', '@keyframes spin{to{transform:rotate(360deg)}}'],
  pulse: ['pulse 2s cubic-bezier(.4,0,.6,1) infinite', '@keyframes pulse{50%{opacity:.5}}']
}
F('animate', (v) => {
  if (v === 'none') return [['animation', 'none']]
  const k = KEYFRAMES[v]
  if (k) return [['animation', k[0]]]
  const a = arbitrary(v)
  return a ? [['animation', a.value]] : null
})

// Interactivity, SVG, misc
const CURSORS = ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out']
each('cursor', 'cursor-', CURSORS)
F('cursor', (v) => { const a = arbitrary(v); return a ? [['cursor', a.value]] : null })
each('pointer-events', 'pointer-events-', ['none', 'auto'])
each('user-select', 'select-', ['none', 'text', 'all', 'auto'])
S('resize', ['resize', 'both']); each('resize', 'resize-', ['none', 'x', 'y'], v => v === 'x' ? 'horizontal' : v === 'y' ? 'vertical' : v)
each('touch-action', 'touch-', ['auto', 'none', 'pan-x', 'pan-y', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'pinch-zoom', 'manipulation'])
each('scroll-behavior', 'scroll-', ['auto', 'smooth'])
each('scroll-snap-type', 'snap-', ['none', 'x', 'y', 'both'], v => v === 'none' ? 'none' : v + ' var(--mia-snap, proximity)')
S('snap-mandatory', ['--mia-snap', 'mandatory']); S('snap-proximity', ['--mia-snap', 'proximity'])
for (const v of ['x', 'y', 'both']) needs.set('snap-' + v, ['@property --mia-snap{syntax:"*";inherits:false}'])
each('scroll-snap-align', 'snap-', ['start', 'end', 'center', 'align-none'], v => v === 'align-none' ? 'none' : v)
S('snap-normal', ['scroll-snap-stop', 'normal']); S('snap-always', ['scroll-snap-stop', 'always'])
each('appearance', 'appearance-', ['none', 'auto'])
each('will-change', 'will-change-', ['auto', 'scroll', 'contents', 'transform'], v => v === 'scroll' ? 'scroll-position' : v)
F('will-change', (v) => { const a = arbitrary(v); return a ? [['will-change', a.value]] : null })
each('table-layout', 'table-', ['auto', 'fixed'])
each('border-collapse', 'border-', ['collapse', 'separate'])
F('fill', (v, mod) => { const c = v === 'none' ? 'none' : color(v, mod); return c ? [['fill', c]] : null })
F('stroke', (v, mod) => {
  if (NUM.test(v)) return [['stroke-width', v]]
  const c = v === 'none' ? 'none' : color(v, mod)
  return c ? [['stroke', c]] : null
})
F('accent', (v, mod) => { const c = v === 'auto' ? 'auto' : color(v, mod); return c ? [['accent-color', c]] : null })
F('caret', (v, mod) => { const c = color(v, mod); return c ? [['caret-color', c]] : null })
S('sr-only', ['position', 'absolute'], ['width', '1px'], ['height', '1px'], ['padding', '0'], ['margin', '-1px'], ['overflow', 'hidden'], ['clip', 'rect(0, 0, 0, 0)'], ['white-space', 'nowrap'], ['border-width', '0'])
S('not-sr-only', ['position', 'static'], ['width', 'auto'], ['height', 'auto'], ['padding', '0'], ['margin', '0'], ['overflow', 'visible'], ['clip', 'auto'], ['white-space', 'normal'])
S('@container', ['container-type', 'inline-size'])
S('@container-size', ['container-type', 'size'])
S('@container-normal', ['container-type', 'normal'])
// Marker classes: `group`, `peer` and named containers produce no CSS of their own.
S('group'); S('peer')

// ---------------------------------------------------------------------------------------------
// Variants

type Variant =
  | { kind: 'sel', tpl: string, order: number }
  | { kind: 'el', el: string, order: number }
  | { kind: 'at', at: string, key: [number, number] }

const PSEUDO = [
  'first', 'last', 'only', 'odd', 'even', 'first-of-type', 'last-of-type', 'only-of-type', 'empty', 'placeholder-shown', 'autofill',
  'read-only', 'required', 'valid', 'invalid', 'in-range', 'out-of-range', 'indeterminate', 'checked', 'default', 'open', 'visited',
  'target', 'focus-within', 'hover', 'focus', 'focus-visible', 'active', 'enabled', 'disabled'
]
const pseudoSel = (v: string): string | null => {
  switch (v) {
    case 'first': return ':first-child'
    case 'last': return ':last-child'
    case 'only': return ':only-child'
    case 'odd': return ':nth-child(odd)'
    case 'even': return ':nth-child(even)'
    case 'open': return '[open]'
    case 'read-only': return ':read-only'
  }
  return PSEUDO.includes(v) ? ':' + v : null
}
const ELEMENTS: Record<string, string> = {
  before: '::before', after: '::after', placeholder: '::placeholder', selection: '::selection', marker: '::marker',
  file: '::file-selector-button', backdrop: '::backdrop', 'first-line': '::first-line', 'first-letter': '::first-letter'
}
const MEDIA: Record<string, string> = {
  'motion-safe': '(prefers-reduced-motion:no-preference)', 'motion-reduce': '(prefers-reduced-motion:reduce)',
  'contrast-more': '(prefers-contrast:more)', 'contrast-less': '(prefers-contrast:less)', 'forced-colors': '(forced-colors:active)',
  portrait: '(orientation:portrait)', landscape: '(orientation:landscape)', print: 'print',
  'pointer-fine': '(pointer:fine)', 'pointer-coarse': '(pointer:coarse)', 'can-hover': '(hover:hover)'
}
const ARIA = ['busy', 'checked', 'disabled', 'expanded', 'hidden', 'pressed', 'readonly', 'required', 'selected', 'current', 'invalid']
const px = (v: string): number | null => {
  const m = /^(\d+(?:\.\d+)?)(px|rem|em)$/.exec(v)
  return m ? +m[1]! * (m[2] === 'px' ? 1 : 16) : null
}

function attrSel(prefix: 'aria' | 'data', v: string): string | null {
  const a = /^\[(.+)\]$/.exec(v)
  if (a) {
    const m = /^([\w-]+)(?:([~|^$*]?=)(.+))?$/.exec(a[1]!)
    if (!m) return null
    const val = m[3] === undefined ? '' : `${m[2]}"${decode(m[3]).replace(/^['"]|['"]$/g, '')}"`
    return `[${prefix}-${m[1]}${val}]`
  }
  if (prefix === 'aria') return ARIA.includes(v) ? `[aria-${v}="true"]` : null
  return /^[\w-]+$/.test(v) ? `[data-${v}]` : null
}

function variant(v: string, prefix: string): Variant | null {
  const sel = pseudoSel(v)
  if (sel) return { kind: 'sel', tpl: '&' + sel, order: 10 + PSEUDO.indexOf(v) }
  if (v in ELEMENTS) return { kind: 'el', el: ELEMENTS[v]!, order: 0 }
  if (v in MEDIA) return { kind: 'at', at: `@media ${MEDIA[v]}`, key: [1, Object.keys(MEDIA).indexOf(v)] }
  if (v === 'dark') return { kind: 'sel', tpl: ':where(.mi-dark, [data-theme=dark]) &', order: 1 }
  if (v === 'ltr' || v === 'rtl') return { kind: 'sel', tpl: `&:where([dir=${v}], [dir=${v}] *)`, order: 2 }
  if (v === '*') return { kind: 'sel', tpl: '& > *', order: 3 }
  if (v === '**') return { kind: 'sel', tpl: '& *', order: 3 }

  // Viewport breakpoints (media) and container queries.
  if (v in BREAKPOINTS) return { kind: 'at', at: `@media (min-width:${BREAKPOINTS[v]}px)`, key: [2, BREAKPOINTS[v]!] }
  let m = /^(min|max)-(.+)$/.exec(v)
  if (m) {
    const w = BREAKPOINTS[m[2]!] !== undefined ? BREAKPOINTS[m[2]!] + 'px' : arbitrary(m[2]!)?.value
    const n = w ? px(w) : null
    if (!w || n === null) return null
    return m[1] === 'min' ? { kind: 'at', at: `@media (min-width:${w})`, key: [2, n] } : { kind: 'at', at: `@media (max-width:${w})`, key: [3, -n] }
  }
  m = /^@(min-|max-)?([^/]+)(?:\/([\w-]+))?$/.exec(v)
  if (m) {
    const w = CONTAINERS[m[2]!] !== undefined ? CONTAINERS[m[2]!] + 'px' : arbitrary(m[2]!)?.value
    const n = w ? px(w) : null
    if (!w || n === null) return null
    const name = m[3] ? m[3] + ' ' : ''
    return m[1] === 'max-'
      ? { kind: 'at', at: `@container ${name}(max-width:${w})`, key: [5, -n] }
      : { kind: 'at', at: `@container ${name}(min-width:${w})`, key: [4, n] }
  }
  m = /^supports-\[(.+)\]$/.exec(v)
  if (m) return { kind: 'at', at: `@supports (${decode(m[1]!)})`, key: [0, 0] }

  // Attribute, structural and relational variants.
  m = /^(aria|data)-(.+)$/.exec(v)
  if (m) { const a = attrSel(m[1] as 'aria' | 'data', m[2]!); return a ? { kind: 'sel', tpl: '&' + a, order: 6 } : null }
  m = /^not-(.+)$/.exec(v)
  if (m) {
    const inner = pseudoSel(m[1]!) ?? (/^\[(.+)\]$/.test(m[1]!) ? decode(m[1]!.slice(1, -1)) : null)
    return inner ? { kind: 'sel', tpl: `&:not(${inner})`, order: 7 } : null
  }
  m = /^has-\[(.+)\]$/.exec(v)
  if (m) return { kind: 'sel', tpl: `&:has(${decode(m[1]!)})`, order: 7 }
  m = /^(group|peer)-(.+?)(?:\/([\w-]+))?$/.exec(v)
  if (m) {
    const marker = '.' + escape(`${prefix}:${m[1]}${m[3] ? '/' + m[3] : ''}`)
    const s = pseudoSel(m[2]!) ?? (/^\[(.+)\]$/.test(m[2]!) ? decode(m[2]!.slice(1, -1)) : null)
      ?? (/^(aria|data)-/.test(m[2]!) ? attrSel(m[2]!.slice(0, 4) as 'aria' | 'data', m[2]!.slice(5)) : null)
    if (!s) return null
    return { kind: 'sel', tpl: m[1] === 'group' ? `${marker}${s} &` : `${marker}${s} ~ &`, order: 8 + (m[1] === 'peer' ? 0.5 : 0) }
  }
  m = /^\[(.+)\]$/.exec(v)
  if (m) {
    const body = decode(m[1]!)
    if (body.startsWith('@')) return { kind: 'at', at: body.replace(/^(@[\w-]+)\s*(?=\()/, '$1 '), key: [6, 0] }
    return body.includes('&') ? { kind: 'sel', tpl: body, order: 9 } : null
  }
  return null
}

// ---------------------------------------------------------------------------------------------
// Parsing and generation

/** Splits on `sep` outside brackets, parentheses and quotes. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!
    if (quote) { if (c === quote) quote = ''; continue }
    if (c === '"' || c === '\'') quote = c
    else if (c === '[' || c === '(') depth++
    else if (c === ']' || c === ')') depth--
    else if (c === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1 }
  }
  out.push(s.slice(start))
  return out
}

export function escape(cls: string): string {
  return cls.replace(/[^\w-]/g, c => '\\' + c)
}

/** Resolves a utility (no variants) to its declarations, or null when it is not one. */
export function utility(u: string): { decls: Decl[], extras: string[] } | null {
  const s = statics.get(u)
  if (s) return { decls: s, extras: needs.get(u) ?? [] }
  // Arbitrary property: [prop:value]
  if (u.startsWith('[') && u.endsWith(']')) {
    const m = /^\[(--[\w-]+|-?[a-z][a-z-]*):(.+)\]$/.exec(u)
    if (!m || !balanced(m[2]!)) return null
    return { decls: [[m[1]!, decode(m[2]!)]], extras: [] }
  }
  let neg = false
  if (u.startsWith('-') && !u.startsWith('--')) { neg = true; u = u.slice(1) }
  const parts = splitTop(u, '/')
  if (parts.length > 2) return null
  const base = parts[0]!
  const mod = parts.length === 2 ? parts[1]! : null
  if (base === 'group' || base === 'peer' || base === '@container') {
    if (neg || !mod || !/^[\w-]+$/.test(mod)) return null
    return base === '@container' ? { decls: [['container', `${mod} / inline-size`]], extras: [] } : { decls: [], extras: [] }
  }
  const bracket = base.search(/-[[(]/)
  const limit = bracket === -1 ? base.length : bracket
  for (let i = limit; i > 0; i--) {
    if (i < base.length && base[i] !== '-') continue
    const root = base.slice(0, i)
    const fn = fns.get(root)
    if (!fn) continue
    const decls = fn(i < base.length ? base.slice(i + 1) : '', mod, neg)
    if (decls) {
      const keyframes = root === 'animate' ? KEYFRAMES[base.slice(i + 1)]?.[1] : undefined
      return { decls, extras: [...(needs.get(root) ?? []), ...(keyframes ? [keyframes] : [])] }
    }
  }
  return null
}

const SHORTHAND_ONE = new Set(['place-content', 'place-items', 'place-self'])
/** Shorthands sort before their longhands so `p-4 pt-2` keeps the top padding whatever the source order. */
function depth(p: string): number {
  if (p.startsWith('--')) return 0
  const bare = p.replace(/^-(webkit|moz|ms)-/, '')
  if (SHORTHAND_ONE.has(bare)) return 1
  if (bare === 'top' || bare === 'right' || bare === 'bottom' || bare === 'left') return 2
  return bare.split('-').length
}

const cache = new Map<string, Rule | null>()

/** Parses one class (with its prefix) into a rule, or null when it is not a valid utility. Results are cached. */
export function parse(token: string, prefix = 'mi'): Rule | null {
  const id = prefix + '\0' + token
  const hit = cache.get(id)
  if (hit !== undefined) return hit
  const rule = build(token, prefix)
  cache.set(id, rule)
  return rule
}

function build(token: string, prefix: string): Rule | null {
  if (!token.startsWith(prefix + ':')) return null
  const parts = splitTop(token.slice(prefix.length + 1), ':')
  let u = parts.pop()!
  if (!u || parts.some(p => !p)) return null
  let important = false
  if (u.endsWith('!')) { important = true; u = u.slice(0, -1) }
  else if (u.startsWith('!')) { important = true; u = u.slice(1) }
  const res = utility(u)
  if (!res) return null

  let sel = '&'
  let el = ''
  const at: string[] = []
  const atKey: number[] = []
  const variants: number[] = []
  for (const p of parts) {
    const v = variant(p, prefix)
    if (!v) return null
    if (v.kind === 'el') { if (el) return null; el = v.el; variants.push(100) }
    else if (v.kind === 'at') { at.push(v.at); atKey.push(...v.key) }
    else { sel = v.tpl.replaceAll('&', sel); variants.push(v.order) }
  }
  const decls = res.decls
  // Custom properties never conflict with real ones; rank a rule by the properties it actually sets.
  const real = decls.filter(([p]) => !p.startsWith('--'))
  const depths = (real.length ? real : decls).map(([p]) => depth(p))
  return {
    token,
    at,
    selector: sel.replaceAll('&', '.' + escape(token)) + el,
    decls,
    important,
    extras: res.extras,
    key: { at: atKey, variants, depth: depths.length ? Math.min(...depths) : 0, count: real.length, prop: real[0]?.[0] ?? '' }
  }
}

function cmpNums(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!
  return a.length - b.length
}

/** Total, deterministic order: at-rules, then variants, then shorthands before longhands. */
export function compare(a: Rule, b: Rule): number {
  return cmpNums(a.key.at, b.key.at)
    || cmpNums(a.key.variants, b.key.variants)
    || a.key.depth - b.key.depth
    || b.key.count - a.key.count
    || (a.key.prop < b.key.prop ? -1 : a.key.prop > b.key.prop ? 1 : 0)
    || (a.token < b.token ? -1 : a.token > b.token ? 1 : 0)
}

const body = (r: Rule) => r.decls.map(([p, v]) => `${p}:${v}${r.important ? '!important' : ''}`).join(';')

/** Generates the stylesheet for a set of classes. Unknown classes are ignored. */
export function generate(tokens: Iterable<string>, prefix = 'mi'): string {
  const rules: Rule[] = []
  for (const t of new Set(tokens)) {
    const r = parse(t, prefix)
    if (r && r.decls.length) rules.push(r)
  }
  rules.sort(compare)
  const extras = new Set<string>()
  let out = ''
  let open: string[] = []
  let prev: Rule | null = null
  for (const r of rules) {
    for (const e of r.extras) extras.add(e)
    // Close and open at-rule blocks only where the chain changes.
    let same = 0
    while (same < open.length && same < r.at.length && open[same] === r.at[same]) same++
    if (same < open.length || r.at.length > same) {
      out += '}'.repeat(open.length - same)
      for (const a of r.at.slice(same)) out += a + '{'
      open = r.at
      prev = null
    }
    // Merge consecutive rules that declare the same thing.
    const b = body(r)
    if (prev && body(prev) === b) out = out.slice(0, out.lastIndexOf('{')) + ',' + r.selector + '{' + b + '}'
    else out += `${r.selector}{${b}}`
    prev = r
  }
  out += '}'.repeat(open.length)
  return [...extras].join('') + out
}

/** Pulls every `<prefix>:` class candidate out of source text (templates, scripts, any string). */
export function extract(src: string, prefix = 'mi', into = new Set<string>()): Set<string> {
  const head = prefix + ':'
  let i = src.indexOf(head)
  while (i !== -1) {
    const before = src.charCodeAt(i - 1)
    // Skip matches glued to a word (`ami:`) and Vue/CSS syntax (`:mi:`, `-mi:`).
    if (i === 0 || !(isWord(before) || before === 58 || before === 45 || before === 46)) {
      let depth = 0
      let quote = 0
      let j = i + head.length
      for (; j < src.length; j++) {
        const c = src.charCodeAt(j)
        if (quote) { if (c === quote) quote = 0; continue }
        if (c === 91 || c === 40) depth++
        else if (c === 93 || c === 41) { if (!depth) break; depth-- }
        else if (depth && (c === 39 || c === 34)) quote = c
        else if (!depth && (c <= 32 || c === 34 || c === 39 || c === 96 || c === 60 || c === 62 || c === 44 || c === 59 || c === 123 || c === 125 || c === 92)) break
      }
      let t = src.slice(i, j)
      // Trailing punctuation from prose or code (`mi:flex.`) is not part of the class.
      while (t.length > head.length && /[.:]$/.test(t)) t = t.slice(0, -1)
      if (t.length > head.length) into.add(t)
      i = src.indexOf(head, j)
    }
    else i = src.indexOf(head, i + head.length)
  }
  return into
}

function isWord(c: number): boolean {
  return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95
}
