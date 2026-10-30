import { afterEach, describe, expect, it } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiCombobox from '../app/components/Inputs/MiCombobox.vue'
import MiCommand from '../app/components/Inputs/MiCommand.vue'
import MiNativeSelect from '../app/components/Inputs/MiNativeSelect.vue'
import MiInputGroup from '../app/components/Inputs/MiInputGroup.vue'

enableAutoUnmount(afterEach)
const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]

describe('MiCombobox', () => {
  it('opens, filters and selects', async () => {
    const w = mount(MiCombobox, { props: { options, modelValue: null, 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) }, attachTo: document.body })
    const trigger = w.find('[role=combobox]')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    await nextTick()
    const search = document.body.querySelector('input[role=searchbox]') as HTMLInputElement
    search.value = 'gam'
    search.dispatchEvent(new Event('input'))
    await nextTick()
    expect(document.body.querySelectorAll('[role=option]').length).toBe(1)
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await nextTick()
    expect(w.props('modelValue')).toBe('c')
  })
  it('shows the empty state', async () => {
    const w = mount(MiCombobox, { props: { options, modelValue: null }, attachTo: document.body })
    await w.find('[role=combobox]').trigger('click')
    await nextTick()
    const search = document.body.querySelector('input[role=searchbox]') as HTMLInputElement
    search.value = 'zzz'
    search.dispatchEvent(new Event('input'))
    await nextTick()
    expect(document.body.textContent).toContain('No results found.')
  })
  it('supports multiple', async () => {
    const w = mount(MiCombobox, { props: { options, multiple: true, modelValue: ['a'], 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string[] }) }, attachTo: document.body })
    await w.find('[role=combobox]').trigger('click')
    await nextTick()
    ;(document.body.querySelectorAll('[role=option]')[1] as HTMLElement).click()
    await nextTick()
    expect(w.props('modelValue')).toEqual(['a', 'b'])
  })
})

describe('MiCommand', () => {
  const items = [{ value: 'x', label: 'Open file', group: 'File' }, { value: 'y', label: 'Save file', group: 'File' }, { value: 'z', label: 'Toggle theme', group: 'View' }]
  it('filters, groups and navigates by keyboard', async () => {
    const w = mount(MiCommand, { props: { items } })
    expect(w.findAll('[role=group]').length).toBe(2)
    const input = w.find('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(w.findAll('[role=option]')[1]!.attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'Enter' })
    expect((w.emitted('select')![0]![0] as { value: string }).value).toBe('y')
    await input.setValue('theme')
    expect(w.findAll('[role=option]').length).toBe(1)
    await input.setValue('nope')
    expect(w.find('[role=status]').exists()).toBe(true)
  })
})

describe('MiCommand dialog', () => {
  it('opens, selects and closes', async () => {
    const w = mount(MiCommand, { props: { items: [{ value: 'x', label: 'Open' }], dialog: true, open: true, 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) }, attachTo: document.body })
    await nextTick()
    expect(document.body.querySelector('[role=dialog]')).not.toBeNull()
    ;(document.body.querySelector('[role=option]') as HTMLElement).click()
    await nextTick()
    expect(w.props('open')).toBe(false)
    expect(w.emitted('select')).toHaveLength(1)
  })
})

describe('MiNativeSelect groups', () => {
  it('renders optgroups', () => {
    const w = mount(MiNativeSelect, { props: { options: [{ value: 'a', label: 'A', group: 'G' }, { value: 'b', label: 'B' }], modelValue: null } })
    expect(w.findAll('optgroup').length).toBe(1)
  })
})

describe('MiInputGroup multiline', () => {
  it('renders a textarea with block addons', () => {
    const w = mount(MiInputGroup, { props: { multiline: true, modelValue: '' }, slots: { 'block-end': 'Send' } })
    expect(w.find('textarea').exists()).toBe(true)
    expect(w.text()).toContain('Send')
  })
})

describe('MiNativeSelect', () => {
  it('updates v-model from the native select', async () => {
    const w = mount(MiNativeSelect, { props: { options, modelValue: 'a', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } })
    expect(w.findAll('option').length).toBe(3)
    await w.find('select').setValue('b')
    expect(w.props('modelValue')).toBe('b')
  })
})

describe('MiCombobox clearable', () => {
  it('clears the value', async () => {
    const w = mount(MiCombobox, { props: { options, clearable: true, modelValue: 'a', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } })
    await w.find('.mi-cb__clear').trigger('click')
    expect(w.props('modelValue')).toBeNull()
  })
})

describe('MiInputGroup', () => {
  it('renders addons and v-model', async () => {
    const w = mount(MiInputGroup, { props: { modelValue: '', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) }, slots: { leading: 'https://', trailing: '.com' } })
    expect(w.text()).toContain('https://')
    expect(w.text()).toContain('.com')
    await w.find('input').setValue('site')
    expect(w.props('modelValue')).toBe('site')
  })
})
