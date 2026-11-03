import { describe, expect, it } from 'vitest'
import { decode, extract, generate, parse } from '../modules/mi-atomic/engine'

const css = (...t: string[]) => generate(t)
const decls = (t: string) => parse(t)?.decls

describe('mi-atomic utilities', () => {
  it('resolves the spacing scale to literal pixels', () => {
    expect(css('mi:gap-4.5')).toBe('.mi\\:gap-4\\.5{gap:18px}')
    expect(decls('mi:p-0')).toEqual([['padding', '0']])
    expect(decls('mi:px-px')).toEqual([['padding-inline', '1px']])
    expect(decls('mi:-mt-2')).toEqual([['margin-top', '-8px']])
    expect(decls('mi:mx-auto')).toEqual([['margin-inline', 'auto']])
  })

  it('maps colors, radii and shadows to Mica tokens', () => {
    expect(decls('mi:bg-card')).toEqual([['background-color', 'var(--mi-card)']])
    expect(decls('mi:text-label2')).toEqual([['color', 'var(--mi-label2)']])
    expect(decls('mi:bg-p/20')).toEqual([['background-color', 'color-mix(in srgb, var(--mi-p) 20%, transparent)']])
    expect(decls('mi:rounded-xl')).toEqual([['border-radius', 'var(--mi-radius-xl)']])
    expect(decls('mi:shadow-1')).toEqual([['box-shadow', 'var(--mi-sh1)']])
    expect(parse('mi:bg-nope')).toBeNull()
  })

  it('reads arbitrary values, arbitrary properties and variable shorthands', () => {
    expect(decls('mi:w-[calc(100%_-_2px)]')).toEqual([['width', 'calc(100% - 2px)']])
    expect(decls('mi:[font-variant-numeric:tabular-nums]')).toEqual([['font-variant-numeric', 'tabular-nums']])
    expect(decls('mi:[--_i:1]')).toEqual([['--_i', '1']])
    expect(decls('mi:bg-(--mi-fill3)')).toEqual([['background-color', 'var(--mi-fill3)']])
    expect(decls('mi:text-[13px]')).toEqual([['font-size', '13px']])
    expect(decls('mi:text-[clamp(40px,9cqi,64px)]')).toEqual([['font-size', 'clamp(40px,9cqi,64px)']])
    expect(decls('mi:bg-[linear-gradient(90deg,var(--mi-p),var(--mi-s))]')).toEqual([['background-image', 'linear-gradient(90deg,var(--mi-p),var(--mi-s))']])
    expect(parse('mi:w-[calc(1px]')).toBeNull()
  })

  it('keeps underscores in custom property names and escaped ones', () => {
    expect(decode('var(--_i)_*_2')).toBe('var(--_i) * 2')
    expect(decode('a\\_b')).toBe('a_b')
  })

  it('handles fractions, sizes and the grid', () => {
    expect(decls('mi:w-1/3')).toEqual([['width', '33.3333%']])
    expect(decls('mi:size-6')).toEqual([['width', '24px'], ['height', '24px']])
    expect(decls('mi:grid-cols-3')).toEqual([['grid-template-columns', 'repeat(3, minmax(0, 1fr))']])
    expect(decls('mi:col-span-2')).toEqual([['grid-column', 'span 2 / span 2']])
    expect(decls('mi:-translate-x-1/2')).toEqual([['--mia-tx', '-50%'], ['translate', 'var(--mia-tx) var(--mia-ty)']])
  })

  it('builds selectors from variants, left to right', () => {
    expect(css('mi:hover:bg-fill')).toBe('.mi\\:hover\\:bg-fill:hover{background-color:var(--mi-fill)}')
    expect(parse('mi:hover:before:opacity-0')!.selector).toBe('.mi\\:hover\\:before\\:opacity-0:hover::before')
    expect(parse('mi:[&_span]:hover:underline')!.selector).toBe('.mi\\:\\[\\&_span\\]\\:hover\\:underline span:hover')
    expect(parse('mi:group-hover:opacity-50')!.selector).toBe('.mi\\:group:hover .mi\\:group-hover\\:opacity-50')
    expect(parse('mi:aria-selected:font-bold')!.selector).toMatch(/\[aria-selected="true"\]$/)
    expect(parse('mi:data-[state=open]:block')!.selector).toMatch(/\[data-state="open"\]$/)
    expect(parse('mi:not-first:border-l')!.selector).toMatch(/:not\(:first-child\)$/)
    expect(parse('mi:*:min-w-0')!.selector).toMatch(/ > \*$/)
    expect(parse('mi:before:after:block')).toBeNull()
  })

  it('wraps container and media queries, sorted by width', () => {
    const out = css('mi:@[900px]:grid-cols-3', 'mi:@[560px]:grid-cols-2', 'mi:grid-cols-1', 'mi:motion-reduce:transition-none')
    expect(out).toBe('.mi\\:grid-cols-1{grid-template-columns:repeat(1, minmax(0, 1fr))}'
      + '@media (prefers-reduced-motion:reduce){.mi\\:motion-reduce\\:transition-none{transition-property:none}}'
      + '@container (min-width:560px){.mi\\:\\@\\[560px\\]\\:grid-cols-2{grid-template-columns:repeat(2, minmax(0, 1fr))}}'
      + '@container (min-width:900px){.mi\\:\\@\\[900px\\]\\:grid-cols-3{grid-template-columns:repeat(3, minmax(0, 1fr))}}')
    expect(parse('mi:@max-[400px]/main:hidden')!.at).toEqual(['@container main (max-width:400px)'])
    expect(parse('mi:md:hidden')!.at).toEqual(['@media (min-width:768px)'])
  })

  it('puts shorthands before longhands whatever the class order', () => {
    const out = css('mi:pt-2', 'mi:p-4', 'mi:rounded-t-none', 'mi:rounded-xl', 'mi:w-2', 'mi:size-6')
    expect(out.indexOf('{padding:')).toBeLessThan(out.indexOf('padding-top'))
    expect(out.indexOf('border-radius:')).toBeLessThan(out.indexOf('border-top-left-radius'))
    expect(out.indexOf('.mi\\:size-6')).toBeLessThan(out.indexOf('.mi\\:w-2'))
  })

  it('emits helper at-rules only when a class needs them', () => {
    expect(css('mi:flex')).not.toContain('@property')
    expect(css('mi:translate-y-2')).toContain('@property --mia-ty')
    expect(css('mi:animate-spin')).toContain('@keyframes spin')
  })

  it('supports the important modifier and merges identical rules', () => {
    expect(css('mi:flex!')).toBe('.mi\\:flex\\!{display:flex!important}')
    expect(css('mi:flex', 'mi:[display:flex]')).toBe('.mi\\:\\[display\\:flex\\],.mi\\:flex{display:flex}')
  })

  it('ignores unknown classes and other prefixes', () => {
    expect(css('mi:bogus', 'flex', 'tw:flex', 'mi:hover:', 'mi:wat:flex')).toBe('')
    expect(generate(['ui:flex'], 'ui')).toBe('.ui\\:flex{display:flex}')
  })
})

describe('mi-atomic extraction', () => {
  it('finds classes in templates, bindings and scripts', () => {
    const src = `<div class="mi:flex mi:gap-[18px] mi:[content:'a_b']" :class="{ 'mi:hover:bg-p': on, [\`mi:p-2\`]: x }">
      const c = ['mi:bg-(--mi-card)', "mi:w-1/2"]; ami:no x-mi:no :mi:no</div>`
    expect([...extract(src)]).toEqual(['mi:flex', 'mi:gap-[18px]', 'mi:[content:\'a_b\']', 'mi:hover:bg-p', 'mi:p-2', 'mi:bg-(--mi-card)', 'mi:w-1/2'])
  })

  it('drops prose punctuation', () => {
    expect([...extract('Use mi:flex. Or mi:grid:')]).toEqual(['mi:flex', 'mi:grid'])
  })
})
