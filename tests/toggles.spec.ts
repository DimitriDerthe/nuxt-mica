import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MiToggle from '~/components/Controls/MiToggle.vue'
import MiToggleGroup from '~/components/Controls/MiToggleGroup.vue'
import MiCollapsible from '~/components/Controls/MiCollapsible.vue'

describe('MiToggle', () => {
  it('toggles pressed via v-model and exposes aria-pressed', async () => {
    const w = mount(MiToggle, { props: { pressed: false, label: 'Bold', 'onUpdate:pressed': (v: boolean) => w.setProps({ pressed: v }) } })
    const b = w.get('button')
    expect(b.attributes('aria-pressed')).toBe('false')
    await b.trigger('click')
    expect(b.attributes('aria-pressed')).toBe('true')
    expect(b.classes()).toContain('is-on')
  })
  it('ignores clicks when disabled and applies variant/size', async () => {
    const w = mount(MiToggle, { props: { pressed: false, disabled: true, variant: 'outline', size: 'lg' } })
    expect(w.classes()).toEqual(expect.arrayContaining(['is-outline', 'is-lg']))
    await w.get('button').trigger('click')
    expect(w.emitted('update:pressed')).toBeUndefined()
  })
})

const opts = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C', disabled: true }]

describe('MiToggleGroup', () => {
  it('single mode selects one and deselects on second click', async () => {
    const w = mount(MiToggleGroup, { props: { options: opts, modelValue: null, 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } })
    const [a, b] = w.findAll('button')
    await a!.trigger('click')
    expect(a!.attributes('aria-pressed')).toBe('true')
    await b!.trigger('click')
    expect(a!.attributes('aria-pressed')).toBe('false')
    await b!.trigger('click')
    expect(w.props('modelValue')).toBeNull()
  })
  it('multiple mode keeps an array and skips disabled items', async () => {
    const w = mount(MiToggleGroup, { props: { options: opts, type: 'multiple', modelValue: [], 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string[] }) } })
    const btns = w.findAll('button')
    await btns[0]!.trigger('click')
    await btns[1]!.trigger('click')
    await btns[2]!.trigger('click')
    expect(w.props('modelValue')).toEqual(['a', 'b'])
    await btns[0]!.trigger('click')
    expect(w.props('modelValue')).toEqual(['b'])
  })
  it('has group role and joined class at spacing 0', () => {
    const w = mount(MiToggleGroup, { props: { options: opts, spacing: 0, label: 'Align' } })
    expect(w.attributes('role')).toBe('group')
    expect(w.classes()).toContain('is-joined')
  })
})

describe('MiCollapsible', () => {
  it('opens and closes with aria-expanded and hidden content', async () => {
    const w = mount(MiCollapsible, { props: { title: 'More', open: false, 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) }, slots: { default: 'Body' } })
    const b = w.get('button')
    expect(b.attributes('aria-expanded')).toBe('false')
    expect(w.get('[role="region"]').attributes('hidden')).toBeDefined()
    await b.trigger('click')
    expect(b.attributes('aria-expanded')).toBe('true')
    expect(w.get('[role="region"]').attributes('hidden')).toBeUndefined()
    expect(b.attributes('aria-controls')).toBe(w.get('[role="region"]').attributes('id'))
  })
  it('does not toggle when disabled', async () => {
    const w = mount(MiCollapsible, { props: { title: 'x', disabled: true } })
    await w.get('button').trigger('click')
    expect(w.emitted('update:open')).toBeUndefined()
  })
})
