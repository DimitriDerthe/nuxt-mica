import { afterEach, describe, expect, it } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import MiInput from '../app/components/Inputs/MiInput.vue'
import MiField from '../app/components/Inputs/MiField.vue'
import MiSearch from '../app/components/Inputs/MiSearch.vue'
import MiSelect from '../app/components/Inputs/MiSelect.vue'
import MiTextarea from '../app/components/Inputs/MiTextarea.vue'
import MiCalendar from '../app/components/Inputs/MiCalendar.vue'
import MiDatePicker from '../app/components/Inputs/MiDatePicker.vue'
import MiTagInput from '../app/components/Inputs/MiTagInput.vue'
import MiCodeInput from '../app/components/Inputs/MiCodeInput.vue'
import MiForm from '../app/components/Inputs/MiForm.vue'
import MiFormRow from '../app/components/Inputs/MiFormRow.vue'
import { miAddMonths, miFirstWeekday, miSameDay } from '../app/utils/miInputs'

enableAutoUnmount(afterEach)

const key = (w: { trigger: (e: string, o?: object) => Promise<void> }, k: string, o: object = {}) => w.trigger('keydown', { key: k, ...o })

describe('miInputs utils', () => {
  it('clamps day when adding months', () => {
    expect(miAddMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28)
    expect(miSameDay(new Date(2026, 1, 3), new Date(2026, 1, 3, 20))).toBe(true)
  })
  it('resolves first weekday', () => {
    expect(miFirstWeekday('en-US')).toBe(0)
    expect(miFirstWeekday('fr-FR')).toBe(1)
  })
})

describe('MiInput', () => {
  it('renders and updates v-model', async () => {
    const w = mount(MiInput, { props: { modelValue: 'a', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) }, attrs: { placeholder: 'Name' } })
    const input = w.find('input')
    expect(input.element.value).toBe('a')
    expect(input.attributes('placeholder')).toBe('Name')
    await input.setValue('abc')
    expect(w.props('modelValue')).toBe('abc')
  })
  it('renders prefix and suffix add-ons', () => {
    const w = mount(MiInput, { props: { prefix: 'https://', suffix: 'EUR' } })
    expect(w.text()).toContain('https://')
    expect(w.text()).toContain('EUR')
  })
  it('clears and emits', async () => {
    const w = mount(MiInput, { props: { modelValue: 'x', clearable: true, 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    await w.find('[aria-label="Clear"]').trigger('click')
    expect(w.props('modelValue')).toBe('')
    expect(w.emitted('clear')).toBeTruthy()
    expect(w.find('[aria-label="Clear"]').exists()).toBe(false)
  })
  it('toggles password visibility', async () => {
    const w = mount(MiInput, { props: { type: 'password', modelValue: 'secret' } })
    expect(w.find('input').attributes('type')).toBe('password')
    const btn = w.find('button')
    expect(btn.attributes('aria-label')).toBe('Show password')
    await btn.trigger('click')
    expect(w.find('input').attributes('type')).toBe('text')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(btn.attributes('aria-label')).toBe('Hide password')
  })
  it('reflects invalid and disabled state', () => {
    const w = mount(MiInput, { props: { invalid: true, disabled: true } })
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    expect(w.find('input').attributes('disabled')).toBeDefined()
  })
})

describe('MiField', () => {
  it('links label, hint and control', () => {
    const w = mount({ components: { MiField, MiInput }, template: '<MiField label="Email" hint="We never share it"><MiInput /></MiField>' })
    const input = w.find('input')
    expect(w.find('label').attributes('for')).toBe(input.attributes('id'))
    const msgId = input.attributes('aria-describedby')!
    expect(w.find(`#${msgId}`).text()).toBe('We never share it')
  })
  it('error replaces hint, sets invalid and role alert', () => {
    const w = mount({ components: { MiField, MiInput }, template: '<MiField label="User" hint="Hint" error="Too short"><MiInput /></MiField>' })
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    expect(w.find('[role="alert"]').text()).toContain('Too short')
    expect(w.text()).not.toContain('Hint')
  })
  it('shows required marker and success message', () => {
    const w = mount({ components: { MiField, MiInput }, template: '<MiField label="User" required success="Available"><MiInput /></MiField>' })
    expect(w.find('input').attributes('required')).toBeDefined()
    expect(w.text()).toContain('Available')
  })
})

describe('MiSearch', () => {
  it('shows clear and cancel only with text, and clears', async () => {
    const w = mount(MiSearch, { props: { modelValue: '', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    expect(w.find('input').attributes('type')).toBe('search')
    expect(w.find('[aria-label="Clear search"]').exists()).toBe(false)
    await w.find('input').setValue('road')
    expect(w.find('[aria-label="Clear search"]').exists()).toBe(true)
    expect(w.text()).toContain('Cancel')
    await w.find('[aria-label="Clear search"]').trigger('click')
    expect(w.props('modelValue')).toBe('')
  })
  it('emits search on Enter and clears on Escape', async () => {
    const w = mount(MiSearch, { props: { modelValue: 'abc', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    await key(w.find('input'), 'Enter')
    expect(w.emitted('search')![0]).toEqual(['abc'])
    await key(w.find('input'), 'Escape')
    expect(w.props('modelValue')).toBe('')
  })
  it('renders the compact variant with a shortcut hint', () => {
    const w = mount(MiSearch, { props: { size: 'compact', shortcut: '⌘K' } })
    expect(w.text()).toContain('⌘K')
    expect(w.classes()).toContain('is-compact')
  })
})

describe('MiSelect', () => {
  const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }, { value: 'c', label: 'Gamma' }]
  const make = () => mount(MiSelect, { attachTo: document.body, props: { options, modelValue: 'a', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
  let w: ReturnType<typeof make>

  it('exposes combobox semantics and opens a teleported listbox', async () => {
    w = make()
    const trigger = w.find('[role="combobox"]')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.text()).toContain('Alpha')
    await trigger.trigger('click')
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const opts = document.body.querySelectorAll('[role="option"]')
    expect(opts.length).toBe(3)
    expect(opts[0]!.getAttribute('aria-selected')).toBe('true')
  })
  it('navigates with the keyboard, skipping disabled options', async () => {
    w = make()
    const trigger = w.find('[role="combobox"]')
    await key(trigger, 'ArrowDown')
    await nextTick()
    await key(trigger, 'ArrowDown')
    await key(trigger, 'Enter')
    await nextTick()
    expect(w.props('modelValue')).toBe('c')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })
  it('closes on Escape without changing the value', async () => {
    w = make()
    const trigger = w.find('[role="combobox"]')
    await key(trigger, 'ArrowDown')
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(w.props('modelValue')).toBe('a')
  })
  it('selects with a click and supports typeahead', async () => {
    w = make()
    const trigger = w.find('[role="combobox"]')
    await trigger.trigger('click')
    await nextTick()
    ;(document.body.querySelectorAll('[role="option"]')[2] as HTMLElement).click()
    await nextTick()
    expect(w.props('modelValue')).toBe('c')
    await key(trigger, 'a')
    expect(w.props('modelValue')).toBe('a')
  })
  it('does not open when disabled', async () => {
    w = mount(MiSelect, { props: { options, disabled: true } })
    await key(w.find('[role="combobox"]'), 'ArrowDown')
    expect(w.find('[role="combobox"]').attributes('aria-expanded')).toBe('false')
  })
})

describe('MiTextarea', () => {
  it('binds v-model and shows a counter', async () => {
    const w = mount(MiTextarea, { props: { modelValue: 'hey', maxlength: 160, counter: true, 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    expect(w.text()).toContain('3 / 160')
    await w.find('textarea').setValue('hello')
    expect(w.props('modelValue')).toBe('hello')
    expect(w.text()).toContain('5 / 160')
    expect(w.find('textarea').attributes('maxlength')).toBe('160')
  })
})

describe('MiCalendar', () => {
  const today = new Date(2026, 9, 29)
  const make = (extra: object = {}) => mount(MiCalendar, { attachTo: document.body, props: { modelValue: new Date(2026, 9, 30), today, 'onUpdate:modelValue': (v: Date | null) => w.setProps({ modelValue: v }), ...extra } })
  let w: ReturnType<typeof make>

  it('renders a grid with the right month, selection and today', () => {
    w = make()
    expect(w.find('[role="grid"]').exists()).toBe(true)
    expect(w.text()).toContain('October 2026')
    expect(w.findAll('[role="gridcell"] button').length).toBe(31)
    expect(w.find('[data-key="2026-10-30"]').classes()).toContain('is-selected')
    expect(w.find('[data-key="2026-10-29"]').attributes('aria-current')).toBe('date')
    expect(w.findAll('[role="columnheader"]')[0]!.text().toLowerCase()).toBe('sun')
  })
  it('picks a date on click and keeps the time', async () => {
    w = make({ modelValue: new Date(2026, 9, 30, 17, 5) })
    await w.find('[data-key="2026-10-12"]').trigger('click')
    const v = w.props('modelValue') as Date
    expect([v.getDate(), v.getHours(), v.getMinutes()]).toEqual([12, 17, 5])
  })
  it('navigates months with the arrows', async () => {
    w = make()
    await w.find('[aria-label="Next month"]').trigger('click')
    expect(w.text()).toContain('November 2026')
    await w.find('[aria-label="Previous month"]').trigger('click')
    await w.find('[aria-label="Previous month"]').trigger('click')
    expect(w.text()).toContain('September 2026')
  })
  it('moves focus with arrow keys across months and selects with Enter', async () => {
    w = make({ modelValue: new Date(2026, 9, 31) })
    const grid = w.find('[role="grid"]')
    await key(grid, 'ArrowRight')
    await nextTick()
    expect(w.text()).toContain('November 2026')
    expect(w.find('[data-key="2026-11-01"]').attributes('tabindex')).toBe('0')
    await key(grid, 'ArrowDown')
    await nextTick()
    expect(w.find('[data-key="2026-11-08"]').attributes('tabindex')).toBe('0')
    await key(grid, 'PageUp')
    await nextTick()
    expect(w.text()).toContain('October 2026')
  })
  it('blocks dates outside min/max', async () => {
    w = make({ min: new Date(2026, 9, 10), max: new Date(2026, 9, 20), modelValue: new Date(2026, 9, 15) })
    await w.find('[data-key="2026-10-25"]').trigger('click')
    expect((w.props('modelValue') as Date).getDate()).toBe(15)
    expect(w.find('[data-key="2026-10-25"]').attributes('aria-disabled')).toBe('true')
    expect(w.find('[aria-label="Next month"]').attributes('disabled')).toBeDefined()
  })
  it('switches to the month picker', async () => {
    w = make()
    await w.find('.mi-cal__title').trigger('click')
    await nextTick()
    const months = w.findAll('.mi-cal__month')
    expect(months.length).toBe(12)
    await months[1]!.trigger('click')
    await nextTick()
    expect(w.text()).toContain('February 2026'.replace('2026', '2026'))
  })
  it('formats with the given locale and first weekday', () => {
    w = make({ locale: 'fr-FR' })
    expect(w.text().toLowerCase()).toContain('octobre 2026')
    expect(w.findAll('[role="columnheader"]')[0]!.attributes('aria-label')!.toLowerCase()).toBe('lundi')
  })
})

describe('MiDatePicker', () => {
  it('opens a dialog with the calendar and commits the pick', async () => {
    const w = mount(MiDatePicker, { attachTo: document.body, props: { modelValue: new Date(2026, 9, 30), 'onUpdate:modelValue': (v: Date | null) => w.setProps({ modelValue: v }) } })
    const btn = w.find('button')
    expect(btn.text()).toContain('Oct 30, 2026')
    await btn.trigger('click')
    await nextTick()
    expect(btn.attributes('aria-expanded')).toBe('true')
    expect(document.body.querySelector('[role="dialog"] [role="grid"]')).toBeTruthy()
    ;(document.body.querySelector('[data-key="2026-10-05"]') as HTMLElement).click()
    await nextTick()
    expect((w.props('modelValue') as Date).getDate()).toBe(5)
    expect(btn.attributes('aria-expanded')).toBe('false')
  })
  it('shows a time button and sets the time', async () => {
    const w = mount(MiDatePicker, { attachTo: document.body, props: { time: true, modelValue: new Date(2026, 9, 30, 17, 0), 'onUpdate:modelValue': (v: Date | null) => w.setProps({ modelValue: v }) } })
    const btns = w.findAll('button')
    expect(btns.length).toBe(2)
    expect(btns[1]!.text()).toMatch(/5:00\s?PM/)
    await btns[1]!.trigger('click')
    await nextTick()
    const minutes = document.body.querySelector('[aria-label="Minutes"]')!
    ;(minutes.querySelectorAll('[role="option"]')[6] as HTMLElement).click()
    await nextTick()
    expect((w.props('modelValue') as Date).getMinutes()).toBe(30)
  })
})

describe('MiTagInput', () => {
  const make = (tags: string[] = ['Design']) => mount(MiTagInput, { props: { modelValue: tags, 'onUpdate:modelValue': (v: string[]) => w.setProps({ modelValue: v }) } })
  let w: ReturnType<typeof make>

  it('adds on Enter and comma, rejecting duplicates', async () => {
    w = make()
    const input = w.find('input')
    await input.setValue('Launch')
    await key(input, 'Enter')
    expect(w.props('modelValue')).toEqual(['Design', 'Launch'])
    await input.setValue('design')
    await key(input, 'Enter')
    expect(w.props('modelValue')).toEqual(['Design', 'Launch'])
    expect(w.emitted('reject')).toBeTruthy()
    await input.setValue('Q4')
    await key(input, ',')
    expect(w.props('modelValue')).toEqual(['Design', 'Launch', 'Q4'])
  })
  it('removes via button and Backspace', async () => {
    w = make(['A', 'B'])
    expect(w.find('[aria-label="Remove A"]').exists()).toBe(true)
    await w.find('[aria-label="Remove A"]').trigger('click')
    expect(w.props('modelValue')).toEqual(['B'])
    await key(w.find('input'), 'Backspace')
    expect(w.props('modelValue')).toEqual([])
  })
  it('splits pasted lists', async () => {
    w = make([])
    await w.find('input').trigger('paste', { clipboardData: { getData: () => 'one, two\nthree' } })
    expect(w.props('modelValue')).toEqual(['one', 'two', 'three'])
  })
})

describe('MiCodeInput', () => {
  const make = (v = '') => mount(MiCodeInput, { props: { modelValue: v, 'onUpdate:modelValue': (x: string) => w.setProps({ modelValue: x }) } })
  let w: ReturnType<typeof make>

  it('renders one labelled cell per digit inside a group', () => {
    w = make('48')
    const cells = w.findAll('input')
    expect(cells.length).toBe(6)
    expect(w.attributes('role')).toBe('group')
    expect(cells[0]!.attributes('aria-label')).toBe('Digit 1')
    expect(cells[0]!.element.value).toBe('4')
    expect(cells[0]!.attributes('autocomplete')).toBe('one-time-code')
    expect(cells[0]!.attributes('inputmode')).toBe('numeric')
  })
  it('types digits sequentially and filters non-digits', async () => {
    w = make()
    await w.findAll('input')[0]!.setValue('1')
    await w.findAll('input')[1]!.setValue('x')
    expect(w.props('modelValue')).toBe('1')
    await w.findAll('input')[1]!.setValue('2')
    expect(w.props('modelValue')).toBe('12')
  })
  it('distributes pasted codes and emits complete', async () => {
    w = make()
    await w.findAll('input')[0]!.trigger('paste', { clipboardData: { getData: () => '123 456' } })
    expect(w.props('modelValue')).toBe('123456')
    expect(w.emitted('complete')![0]).toEqual(['123456'])
  })
  it('Backspace removes the previous digit from an empty cell', async () => {
    w = make('12')
    await key(w.findAll('input')[2]!, 'Backspace')
    expect(w.props('modelValue')).toBe('1')
  })
})

describe('MiForm', () => {
  it('renders header, rows, actions and emits submit', async () => {
    const w = mount({
      components: { MiForm, MiFormRow, MiInput },
      template: `<MiForm title="New project" description="desc" @submit="n++"><template #header-end><span>Example</span></template><MiFormRow label="Name" hint="Required"><MiInput /></MiFormRow><template #actions><button type="submit">Create</button></template></MiForm>`,
      data: () => ({ n: 0 })
    })
    expect(w.find('h3').text()).toBe('New project')
    expect(w.text()).toContain('Example')
    const input = w.find('input')
    expect(w.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-describedby')).toBeTruthy()
    await w.find('form').trigger('submit')
    expect((w.vm as unknown as { n: number }).n).toBe(1)
  })
  it('row errors mark the control invalid', () => {
    const w = mount({ components: { MiForm, MiFormRow, MiInput }, render() { return h(MiForm, null, { default: () => h(MiFormRow, { label: 'Name', error: 'Required' }, { default: () => h(MiInput) }) }) } })
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    expect(w.find('[role="alert"]').text()).toBe('Required')
  })
  it('marks the control cell when a message follows it, for the stacked spacing', () => {
    const row = (props: Record<string, string>) => mount({ render: () => h(MiForm, null, { default: () => h(MiFormRow, { label: 'Name', ...props }, { default: () => h(MiInput) }) }) })
    expect(row({ hint: 'Shown on your profile' }).find('.mi-fr__ctl').classes()).toContain('has-msg')
    expect(row({}).find('.mi-fr__ctl').classes()).not.toContain('has-msg')
  })
})
