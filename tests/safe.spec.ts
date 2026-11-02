import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { miSafeColor, miSafeHref, miSafeTag } from '../app/utils/miSafe'
import MiTextLink from '../app/components/Buttons/MiTextLink.vue'
import MiItem from '../app/components/Content/MiItem.vue'
import MiText from '../app/components/Base/MiText.vue'
import MiSurface from '../app/components/Base/MiSurface.vue'

describe('miSafeHref', () => {
  it('keeps ordinary links', () => {
    for (const h of ['https://mica.dev', '/docs', '#top', 'mailto:a@b.c', 'tel:+33123', '?q=1', 'docs/api.md'])
      expect(miSafeHref(h)).toBe(h)
  })
  it('drops script-capable schemes, whatever the case, spacing or control characters', () => {
    for (const h of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', 'java\nscript:x', '\u0001javascript:x', 'vbscript:msgbox', 'data:text/html,<script>x</script>'])
      expect(miSafeHref(h)).toBeUndefined()
  })
  it('passes empty values through as undefined', () => {
    expect(miSafeHref(undefined)).toBeUndefined()
    expect(miSafeHref(null)).toBeUndefined()
  })
})

describe('miSafeTag', () => {
  it('keeps plain tags and custom elements', () => {
    for (const t of ['div', 'h2', 'section', 'span', 'my-element']) expect(miSafeTag(t, 'div')).toBe(t)
    expect(miSafeTag('H3', 'div')).toBe('h3')
  })
  it('falls back for executable or malformed names', () => {
    for (const t of ['script', 'IFRAME', 'object', 'embed', 'style', 'base', 'svg', 'img onerror=x', '<b>', '', '1a'])
      expect(miSafeTag(t, 'div')).toBe('div')
    expect(miSafeTag(undefined, 'span')).toBe('span')
  })
})

describe('miSafeColor', () => {
  it('keeps single CSS color values', () => {
    for (const c of ['#0071E3', 'red', 'rgb(0, 113, 227)', 'hsl(210 100% 45% / .5)', 'var(--mi-p)', 'light-dark(#8E8E93, #7C7C80)', 'color-mix(in srgb, var(--mi-p) 16%, transparent)'])
      expect(miSafeColor(c, 'gray')).toBe(c)
  })
  it('falls back on declaration breakouts, urls and strings', () => {
    for (const c of ['red; background: url(https://x)', 'url(https://x)', 'red}body{x:y', "'x'", 'expression(alert(1))', 'red !important'])
      expect(miSafeColor(c, 'gray')).toBe('gray')
    expect(miSafeColor(undefined, undefined)).toBeUndefined()
  })
})

describe('components apply the guards', () => {
  it('drops a javascript: href on links', () => {
    expect(mount(MiTextLink, { props: { href: 'javascript:alert(1)' } }).find('a').attributes('href')).toBeUndefined()
    expect(mount(MiTextLink, { props: { href: '/docs' } }).find('a').attributes('href')).toBe('/docs')
    expect(mount(MiItem, { props: { href: ' JAVASCRIPT:x' } }).find('a').attributes('href')).toBeUndefined()
  })
  it('never renders an executable element from `as`', () => {
    expect(mount(MiText, { props: { as: 'script' } }).element.tagName).toBe('P')
    expect(mount(MiSurface, { props: { as: 'iframe' } }).element.tagName).toBe('DIV')
    expect(mount(MiSurface, { props: { as: 'section' } }).element.tagName).toBe('SECTION')
  })
})
