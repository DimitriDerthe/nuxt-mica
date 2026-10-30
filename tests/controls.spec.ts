import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiSwitch from '~/components/Controls/MiSwitch.vue'
import MiStepper from '~/components/Controls/MiStepper.vue'
import MiCheckbox from '~/components/Controls/MiCheckbox.vue'
import MiCheckboxGroup from '~/components/Controls/MiCheckboxGroup.vue'
import MiRadio from '~/components/Controls/MiRadio.vue'
import MiRadioGroup from '~/components/Controls/MiRadioGroup.vue'
import MiSegmented from '~/components/Controls/MiSegmented.vue'
import MiSlider from '~/components/Controls/MiSlider.vue'
import MiChip from '~/components/Controls/MiChip.vue'
import MiSwatch from '~/components/Controls/MiSwatch.vue'
import { miSnap } from '~/utils/miControls'

const key = (k: string) => ({ key: k })

describe('miSnap', () => {
  it('snaps to the step grid and clamps without float noise', () => {
    expect(miSnap(0.30000000004, 0, 1, 0.1)).toBe(0.3)
    expect(miSnap(47, 0, 100, 5)).toBe(45)
    expect(miSnap(500, 0, 100, 5)).toBe(100)
    expect(miSnap(-3, 0, 100, 1)).toBe(0)
  })
})

describe('MiSwitch', () => {
  it('renders a switch and toggles via v-model', async () => {
    const w = mount(MiSwitch, { props: { modelValue: false, label: 'Wi-Fi', 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    const b = w.get('button')
    expect(b.attributes('role')).toBe('switch')
    expect(b.attributes('aria-checked')).toBe('false')
    expect(b.attributes('aria-label')).toBe('Wi-Fi')
    await b.trigger('click')
    expect(b.attributes('aria-checked')).toBe('true')
    expect(w.classes()).toContain('is-on')
  })
  it('supports size and tone variants and ignores clicks when disabled', async () => {
    const w = mount(MiSwitch, { props: { modelValue: true, size: 'compact', tone: 'success', disabled: true } })
    expect(w.classes()).toEqual(expect.arrayContaining(['is-compact', 'tone-success']))
    await w.trigger('click')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('MiStepper', () => {
  it('increments, decrements and clamps', async () => {
    const w = mount(MiStepper, { props: { modelValue: 2, min: 1, max: 3, label: 'Seats', showValue: true, 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const [dec, inc] = w.findAll('button')
    await inc!.trigger('click')
    expect(w.get('output').text()).toBe('3')
    expect(inc!.attributes('disabled')).toBeDefined()
    await dec!.trigger('click')
    await dec!.trigger('click')
    expect(w.get('output').text()).toBe('1')
    expect(dec!.attributes('disabled')).toBeDefined()
    expect(w.get('[role=group]').attributes('aria-label')).toBe('Seats')
  })
  it('field variant is a spinbutton with keyboard support and unit', async () => {
    const w = mount(MiStepper, { props: { modelValue: 13, variant: 'field', min: 8, max: 72, unit: 'pt', label: 'Font size', 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const s = w.get('[role=spinbutton]')
    expect(s.text()).toBe('13 pt')
    expect(s.attributes('aria-valuenow')).toBe('13')
    await s.trigger('keydown', key('ArrowUp'))
    expect(s.attributes('aria-valuenow')).toBe('14')
    await s.trigger('keydown', key('End'))
    expect(s.attributes('aria-valuenow')).toBe('72')
    await s.trigger('keydown', key('Home'))
    expect(s.attributes('aria-valuenow')).toBe('8')
  })
})

describe('MiCheckbox', () => {
  it('toggles and reflects aria-checked', async () => {
    const w = mount(MiCheckbox, { props: { modelValue: false, label: 'Email', 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    const b = w.get('[role=checkbox]')
    expect(b.attributes('aria-checked')).toBe('false')
    expect(w.text()).toContain('Email')
    await b.trigger('click')
    expect(b.attributes('aria-checked')).toBe('true')
  })
  it('shows mixed state and a click resolves it to checked', async () => {
    const w = mount(MiCheckbox, { props: { modelValue: false, indeterminate: true, label: 'All' } })
    expect(w.get('button').attributes('aria-checked')).toBe('mixed')
    await w.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([true])
    expect(w.emitted('update:indeterminate')![0]).toEqual([false])
  })
})

describe('MiCheckboxGroup', () => {
  const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }]
  it('manages an array model with a mixed parent', async () => {
    const w = mount(MiCheckboxGroup, { props: { modelValue: ['a'], options, parentLabel: 'All', label: 'Letters', 'onUpdate:modelValue': (v: Array<string | number>) => w.setProps({ modelValue: v }) } })
    const boxes = w.findAll('[role=checkbox]')
    expect(boxes).toHaveLength(4)
    expect(boxes[0]!.attributes('aria-checked')).toBe('mixed')
    await boxes[2]!.trigger('click')
    expect(w.props('modelValue')).toEqual(['a', 'b'])
    await boxes[0]!.trigger('click')
    expect(w.props('modelValue')).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    expect(w.findAll('[role=checkbox]')[0]!.attributes('aria-checked')).toBe('true')
    await w.findAll('[role=checkbox]')[0]!.trigger('click')
    expect(w.props('modelValue')).toEqual([])
    expect(w.get('[role=group]').attributes('aria-label')).toBe('Letters')
  })
})

describe('MiRadio / MiRadioGroup', () => {
  const options = [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }, { value: 'z', label: 'Z', disabled: true }]
  it('selects and keeps a roving tabindex', async () => {
    const w = mount(MiRadioGroup, { attachTo: document.body, props: { modelValue: 'x', options, label: 'Pick', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    const r = () => w.findAll('[role=radio]')
    expect(w.attributes('role')).toBe('radiogroup')
    expect(r().map(e => e.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
    await r()[1]!.trigger('click')
    expect(r().map(e => e.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(r()[1]!.attributes('tabindex')).toBe('0')
    w.unmount()
  })
  it('arrow keys move and select, skipping disabled items', async () => {
    const w = mount(MiRadioGroup, { attachTo: document.body, props: { modelValue: 'x', options, 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    const first = w.findAll('[role=radio]')[0]!
    ;(first.element as HTMLElement).focus()
    await first.trigger('keydown', key('ArrowDown'))
    expect(w.props('modelValue')).toBe('y')
    await w.findAll('[role=radio]')[1]!.trigger('keydown', key('ArrowDown'))
    expect(w.props('modelValue')).toBe('x')
    await w.findAll('[role=radio]')[0]!.trigger('keydown', key('End'))
    expect(w.props('modelValue')).toBe('y')
    w.unmount()
  })
  it('standalone radio compares its value with v-model', async () => {
    const w = mount(MiRadio, { props: { value: 'a', modelValue: null, label: 'A' } })
    expect(w.attributes('aria-checked')).toBe('false')
    await w.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['a'])
  })
})

describe('MiSegmented', () => {
  const options = [{ value: 'd', label: 'Day' }, { value: 'w', label: 'Week' }, { value: 'm', label: 'Month' }]
  it('renders radios, positions the thumb by index and reacts to keys', async () => {
    const w = mount(MiSegmented, { attachTo: document.body, props: { modelValue: 'w', options, label: 'Range', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    expect(w.attributes('role')).toBe('radiogroup')
    expect(w.attributes('style')).toContain('--_i: 1')
    expect(w.attributes('style')).toContain('--_n: 3')
    const segs = () => w.findAll('[role=radio]')
    expect(segs().map(s => s.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])
    await segs()[1]!.trigger('keydown', key('ArrowRight'))
    expect(w.props('modelValue')).toBe('m')
    expect(w.attributes('style')).toContain('--_i: 2')
    await segs()[2]!.trigger('click')
    expect(w.props('modelValue')).toBe('m')
    w.unmount()
  })
  it('supports tinted and icon-only variants', () => {
    const tinted = mount(MiSegmented, { props: { modelValue: 'a', variant: 'tinted', options: [{ value: 'a', label: 'Monthly' }, { value: 'b', label: 'Yearly' }] } })
    expect(tinted.classes()).toContain('is-tinted')
    const icons = mount(MiSegmented, { props: { modelValue: 'list', options: [{ value: 'list', icon: 'list', ariaLabel: 'List' }, { value: 'grid', icon: 'grid', ariaLabel: 'Grid' }] } })
    expect(icons.classes()).toContain('is-icons')
    expect(icons.findAll('svg')).toHaveLength(2)
    expect(icons.findAll('[role=radio]')[0]!.attributes('aria-label')).toBe('List')
  })
})

describe('MiSlider', () => {
  it('exposes slider semantics and handles keyboard', async () => {
    const w = mount(MiSlider, { props: { modelValue: 64, label: 'Volume', unit: '%', 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const t = w.get('[role=slider]')
    expect(t.attributes('aria-valuenow')).toBe('64')
    expect(t.attributes('aria-valuemin')).toBe('0')
    expect(t.attributes('aria-valuemax')).toBe('100')
    expect(w.get('output').text()).toBe('64 %')
    await t.trigger('keydown', key('ArrowRight'))
    expect(t.attributes('aria-valuenow')).toBe('65')
    await t.trigger('keydown', key('PageDown'))
    expect(t.attributes('aria-valuenow')).toBe('55')
    await t.trigger('keydown', key('Home'))
    expect(t.attributes('aria-valuenow')).toBe('0')
    await t.trigger('keydown', key('End'))
    expect(t.attributes('aria-valuenow')).toBe('100')
    expect(w.attributes('style')).toContain('--_hi: 1')
  })
  it('range mode keeps thumbs ordered', async () => {
    const w = mount(MiSlider, { props: { modelValue: [20, 60] as [number, number], label: 'Price', step: 10, 'onUpdate:modelValue': (v: [number, number]) => w.setProps({ modelValue: v }) } })
    const [a, b] = w.findAll('[role=slider]')
    expect(w.get('output').text()).toBe('20 – 60')
    expect(a!.attributes('aria-valuemax')).toBe('60')
    expect(b!.attributes('aria-valuemin')).toBe('20')
    await a!.trigger('keydown', key('End'))
    expect(w.props('modelValue')).toEqual([60, 60])
    await b!.trigger('keydown', key('ArrowLeft'))
    expect(w.props('modelValue')).toEqual([60, 60])
    await b!.trigger('keydown', key('ArrowRight'))
    expect(w.props('modelValue')).toEqual([60, 70])
  })
  it('drags with pointer events, coalescing moves into animation frames', async () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    const w = mount(MiSlider, { props: { modelValue: 0, ariaLabel: 'Level', 'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }) } })
    const rail = w.get('.mi-slider__rail').element
    rail.getBoundingClientRect = () => ({ left: 0, width: 200, right: 200, top: 0, bottom: 44, height: 44, x: 0, y: 0, toJSON: () => ({}) })
    const area = w.get('.mi-slider__area')
    await area.trigger('pointerdown', { clientX: 100, button: 0, pointerType: 'mouse' })
    expect(w.props('modelValue')).toBe(50)
    expect(w.classes()).toContain('is-dragging')
    await area.trigger('pointermove', { clientX: 120 })
    await area.trigger('pointermove', { clientX: 150 })
    expect(frames).toHaveLength(1)
    frames[0]!(0)
    await nextTick()
    expect(w.props('modelValue')).toBe(75)
    await area.trigger('pointerup', {})
    expect(w.classes()).not.toContain('is-dragging')
    vi.unstubAllGlobals()
  })
  it('is inert when disabled', () => {
    const w = mount(MiSlider, { props: { modelValue: 30, disabled: true, ariaLabel: 'x' } })
    expect(w.get('[role=slider]').attributes('tabindex')).toBe('-1')
    expect(w.get('[role=slider]').attributes('aria-disabled')).toBe('true')
  })
})

describe('MiChip', () => {
  it('toggles when selectable', async () => {
    const w = mount(MiChip, { props: { label: 'Design', selectable: true, modelValue: false, 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    const b = w.get('button')
    expect(b.attributes('aria-pressed')).toBe('false')
    expect(w.find('svg').exists()).toBe(false)
    await b.trigger('click')
    expect(b.attributes('aria-pressed')).toBe('true')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.classes()).toContain('is-on')
  })
  it('emits remove from the button and the keyboard', async () => {
    const w = mount(MiChip, { props: { label: 'Nuxt', removable: true } })
    const x = w.get('button')
    expect(x.attributes('aria-label')).toBe('Remove Nuxt')
    await x.trigger('click')
    await w.trigger('keydown', key('Backspace'))
    expect(w.emitted('remove')).toHaveLength(2)
  })
  it('does nothing when disabled', async () => {
    const w = mount(MiChip, { props: { label: 'x', selectable: true, removable: true, disabled: true } })
    await w.findAll('button')[0]!.trigger('click')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('MiSwatch', () => {
  it('lists default swatches, selects and shows the name', async () => {
    const w = mount(MiSwatch, { attachTo: document.body, props: { modelValue: 'primary', label: 'Label color', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    const items = () => w.findAll('[role=radio]')
    expect(items()).toHaveLength(8)
    expect(items()[0]!.attributes('aria-label')).toBe('Primary')
    expect(w.get('.mi-swatch__name').text()).toBe('Primary')
    await items()[2]!.trigger('click')
    expect(w.get('.mi-swatch__name').text()).toBe('Red')
    expect(items()[2]!.attributes('aria-checked')).toBe('true')
    await items()[2]!.trigger('keydown', key('ArrowRight'))
    expect(w.props('modelValue')).toBe('orange')
    w.unmount()
  })
  it('accepts custom options', () => {
    const w = mount(MiSwatch, { props: { modelValue: null, ariaLabel: 'Pick', options: [{ value: 'a', name: 'A', color: '#fff' }] } })
    expect(w.get('[role=radiogroup]').attributes('aria-label')).toBe('Pick')
    expect(w.findAll('[role=radio]')).toHaveLength(1)
  })
})
