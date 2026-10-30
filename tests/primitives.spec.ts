import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, inject } from 'vue'
import MiSeparator from '../app/components/Base/MiSeparator.vue'
import MiKbdGroup from '../app/components/Base/MiKbdGroup.vue'
import MiKbd from '../app/components/Base/MiKbd.vue'
import MiLabel from '../app/components/Base/MiLabel.vue'
import MiAspectRatio from '../app/components/Base/MiAspectRatio.vue'
import MiTypography from '../app/components/Base/MiTypography.vue'
import MiDirection, { MI_DIRECTION_KEY, useMiDirection } from '../app/components/Base/MiDirection.vue'

describe('MiSeparator', () => {
  it('is decorative by default', () => {
    expect(mount(MiSeparator).attributes('role')).toBe('none')
  })
  it('exposes separator semantics when not decorative', () => {
    const w = mount(MiSeparator, { props: { decorative: false, orientation: 'vertical' } })
    expect(w.attributes('role')).toBe('separator')
    expect(w.attributes('aria-orientation')).toBe('vertical')
    expect(w.classes()).toContain('mi-separator--vertical')
  })
})

describe('MiKbd', () => {
  it('renders a kbd and a group', () => {
    expect(mount(MiKbd, { slots: { default: 'K' } }).element.tagName).toBe('KBD')
    expect(mount(MiKbdGroup).classes()).toContain('mi-kbd-group')
  })
})

describe('MiLabel', () => {
  it('binds for and shows required marker', () => {
    const w = mount(MiLabel, { props: { for: 'a', required: true }, slots: { default: 'Name' } })
    expect(w.attributes('for')).toBe('a')
    expect(w.find('[aria-hidden="true"]').text()).toBe('*')
  })
})

describe('MiAspectRatio', () => {
  it('sets aspect-ratio', () => {
    const w = mount(MiAspectRatio, { props: { ratio: 16 / 9 } })
    expect((w.element as HTMLElement).style.aspectRatio).toContain(String(16 / 9))
  })
})

describe('MiTypography', () => {
  it('maps variants to elements', () => {
    expect(mount(MiTypography, { props: { variant: 'h2' } }).element.tagName).toBe('H2')
    expect(mount(MiTypography, { props: { variant: 'blockquote' } }).element.tagName).toBe('BLOCKQUOTE')
    expect(mount(MiTypography, { props: { variant: 'lead' } }).element.tagName).toBe('P')
  })
  it('honours as', () => {
    expect(mount(MiTypography, { props: { variant: 'h1', as: 'div' } }).element.tagName).toBe('DIV')
  })
})

describe('MiTypography table', () => {
  it('renders a table', () => {
    expect(mount(MiTypography, { props: { variant: 'table' } }).element.tagName).toBe('TABLE')
  })
})

describe('MiDirection', () => {
  it('sets dir and provides it', () => {
    const Child = defineComponent({ setup() { const d = useMiDirection(); expect(inject(MI_DIRECTION_KEY)).toBe(d); return () => h('i', d.value) } })
    const w = mount(MiDirection, { props: { direction: 'rtl' }, slots: { default: () => h(Child) } })
    expect(w.attributes('dir')).toBe('rtl')
    expect(w.find('i').text()).toBe('rtl')
  })
})
