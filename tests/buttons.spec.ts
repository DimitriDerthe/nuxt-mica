import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import MiButton from '~/components/Buttons/MiButton.vue'
import MiIconButton from '~/components/Buttons/MiIconButton.vue'
import MiButtonGroup from '~/components/Buttons/MiButtonGroup.vue'
import MiMenu from '~/components/Buttons/MiMenu.vue'
import MiTextLink from '~/components/Buttons/MiTextLink.vue'
import type { MiMenuItem } from '~/utils/miMenu'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(w: T): T { wrappers.push(w); return w }
afterEach(() => { wrappers.splice(0).forEach(w => w.unmount()); document.body.innerHTML = '' })

describe('MiButton', () => {
  it('renders a typed button with the default variant and size', () => {
    const w = mount(MiButton, { slots: { default: 'Continue' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('type')).toBe('button')
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-btn--filled', 'mi-btn--regular', 'mi-btn--primary']))
    expect(w.text()).toBe('Continue')
  })

  it.each(['filled', 'tinted', 'gray', 'plain', 'bordered', 'destructive'] as const)('supports variant %s', (variant) => {
    expect(mount(MiButton, { props: { variant } }).classes()).toContain(`mi-btn--${variant}`)
  })

  it.each(['mini', 'small', 'regular', 'large', 'capsule', 'xlarge'] as const)('supports size %s', (size) => {
    expect(mount(MiButton, { props: { size } }).classes()).toContain(`mi-btn--${size}`)
  })

  it('switches to the secondary brand and block layout', () => {
    const w = mount(MiButton, { props: { brand: 'secondary', block: true } })
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-btn--secondary', 'is-block']))
  })

  it('renders leading and trailing slots', () => {
    const w = mount(MiButton, { slots: { leading: '<i class="l"/>', default: 'Go', trailing: '<i class="t"/>' } })
    expect(w.find('.l').exists()).toBe(true)
    expect(w.find('.t').exists()).toBe(true)
    expect(w.classes()).toEqual(expect.arrayContaining(['has-lead', 'has-trail']))
  })

  it('disables natively and never emits click', async () => {
    const w = mount(MiButton, { props: { disabled: true } })
    expect(w.attributes('disabled')).toBeDefined()
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('loading sets aria-busy, shows a spinner and swallows clicks', async () => {
    const w = mount(MiButton, { props: { loading: true }, slots: { default: 'Saving' } })
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.find('.mi-btn__spin').exists()).toBe(true)
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('emits click when active', async () => {
    const w = mount(MiButton)
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('renders an anchor with href and handles disabled links accessibly', () => {
    const a = mount(MiButton, { props: { href: '/x' } })
    expect(a.element.tagName).toBe('A')
    expect(a.attributes('href')).toBe('/x')
    const d = mount(MiButton, { props: { href: '/x', disabled: true } })
    expect(d.attributes('href')).toBeUndefined()
    expect(d.attributes('aria-disabled')).toBe('true')
    expect(d.attributes('tabindex')).toBe('-1')
  })

  it('exposes aria-pressed for toggles and forwards attrs', () => {
    const w = mount(MiButton, { props: { pressed: true }, attrs: { 'data-x': '1' } })
    expect(w.attributes('aria-pressed')).toBe('true')
    expect(w.attributes('data-x')).toBe('1')
  })
})

describe('MiIconButton', () => {
  it('is always labelled', () => {
    const w = mount(MiIconButton, { props: { label: 'Add' } })
    expect(w.attributes('aria-label')).toBe('Add')
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-icon-btn--filled', 'mi-icon-btn--large', 'mi-icon-btn--circle']))
  })

  it('toolbar size is rounded and supports pressed state', () => {
    const w = mount(MiIconButton, { props: { label: 'Bold', size: 'toolbar', variant: 'plain', pressed: true } })
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-icon-btn--rounded', 'is-pressed']))
    expect(w.attributes('aria-pressed')).toBe('true')
  })

  it('does not emit click when disabled', async () => {
    const w = mount(MiIconButton, { props: { label: 'x', disabled: true } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('supports the secondary brand and variants', () => {
    const w = mount(MiIconButton, { props: { label: 'x', variant: 'tinted', brand: 'secondary' } })
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-icon-btn--tinted', 'mi-icon-btn--secondary']))
  })
})

describe('MiButtonGroup', () => {
  const options = [
    { value: 'l', ariaLabel: 'Align left' },
    { value: 'c', ariaLabel: 'Align center' },
    { value: 'r', ariaLabel: 'Align right', disabled: true }
  ]

  it('renders a labelled group with slotted children', () => {
    const w = mount(MiButtonGroup, { props: { label: 'History', variant: 'attached' }, slots: { default: () => [h(MiIconButton, { label: 'Back' })] } })
    expect(w.attributes('role')).toBe('group')
    expect(w.attributes('aria-label')).toBe('History')
    expect(w.find('[aria-label="Back"]').exists()).toBe(true)
  })

  it('segmented binds v-model and aria-pressed', async () => {
    const w = mount(MiButtonGroup, { props: { label: 'Alignment', variant: 'segmented', options, modelValue: 'l', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } })
    const btns = w.findAll('button')
    expect(btns).toHaveLength(3)
    expect(btns[0]!.attributes('aria-pressed')).toBe('true')
    await btns[1]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['c'])
    expect(w.emitted('change')![0]).toEqual(['c'])
    expect(w.findAll('button')[1]!.attributes('aria-pressed')).toBe('true')
    await btns[2]!.trigger('click')
    expect(w.emitted('update:modelValue')).toHaveLength(1)
  })

  it('segmented moves focus with arrow keys and skips disabled options', async () => {
    const w = track(mount(MiButtonGroup, { attachTo: document.body, props: { label: 'A', variant: 'segmented', options, modelValue: 'l' } }))
    const btns = w.findAll('button')
    ;(btns[0]!.element as HTMLElement).focus()
    await btns[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(btns[1]!.element)
    await btns[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(btns[0]!.element)
    await btns[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(btns[1]!.element)
  })
})

describe('MiTextLink', () => {
  it('renders an anchor with a chevron', () => {
    const w = mount(MiTextLink, { props: { href: '/docs' }, slots: { default: 'Text link' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('/docs')
    expect(w.find('svg').exists()).toBe(true)
    expect(mount(MiTextLink, { props: { chevron: false } }).find('svg').exists()).toBe(false)
  })
})

describe('MiMenu', () => {
  const items: MiMenuItem[] = [
    { heading: 'Sort' },
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { separator: true },
    { value: 'off', label: 'Archive', disabled: true },
    { value: 'del', label: 'Delete', destructive: true }
  ]
  const panel = () => document.body.querySelector<HTMLElement>('[role="menu"],[role="listbox"]')
  const entries = () => Array.from(document.body.querySelectorAll<HTMLElement>('.mi-menu__item'))
  const open = async (w: VueWrapper) => { await w.find('[data-mi-menu-trigger]').trigger('click', { detail: 0 }); await nextTick(); await nextTick() }

  it('exposes menu semantics on the trigger and teleports the panel when opened', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Sort by' } }))
    const t = w.find('[data-mi-menu-trigger]')
    expect(t.attributes('aria-haspopup')).toBe('menu')
    expect(t.attributes('aria-expanded')).toBe('false')
    expect(panel()).toBeNull()
    await open(w)
    expect(t.attributes('aria-expanded')).toBe('true')
    expect(panel()).not.toBeNull()
    expect(entries().map(e => e.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem'])
    expect(document.body.querySelector('[role="separator"]')).not.toBeNull()
  })

  it('focuses the first item on keyboard open and navigates with arrows, skipping disabled', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Sort by' } }))
    await open(w)
    const els = entries()
    expect(document.activeElement).toBe(els[0])
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(els[1])
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(els[3])
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(els[0])
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(els[3])
  })

  it('ArrowUp on the trigger opens on the last item', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items } }))
    await w.find('[data-mi-menu-trigger]').trigger('keydown', { key: 'ArrowUp' })
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(entries()[3])
  })

  it('typeahead focuses the matching item', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items } }))
    await open(w)
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }))
    expect(document.activeElement).toBe(entries()[1])
  })

  it('Escape closes and returns focus to the trigger', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items } }))
    await open(w)
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick(); await nextTick()
    expect(panel()).toBeNull()
    expect(document.activeElement).toBe(w.find('[data-mi-menu-trigger]').element)
  })

  it('emits select, skips disabled items, then closes', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items } }))
    await open(w)
    entries()[2]!.click()
    expect(w.emitted('select')).toBeUndefined()
    expect(panel()).not.toBeNull()
    entries()[3]!.click()
    await nextTick(); await nextTick()
    expect((w.emitted('select')![0]![0] as MiMenuItem).value).toBe('del')
    expect(panel()).toBeNull()
  })

  it('closes on outside pointerdown', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items } }))
    await open(w)
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick(); await nextTick()
    expect(panel()).toBeNull()
  })

  it('popup variant is a listbox bound to v-model and shows the selected label', async () => {
    const list: MiMenuItem[] = [{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }]
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items: list, variant: 'popup', label: 'Range', modelValue: '30', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as string }) } }))
    const t = w.find('[data-mi-menu-trigger]')
    expect(t.attributes('aria-haspopup')).toBe('listbox')
    expect(t.text()).toContain('Last 30 days')
    await open(w)
    expect(panel()!.getAttribute('role')).toBe('listbox')
    const opts = entries()
    expect(opts.map(o => o.getAttribute('aria-selected'))).toEqual(['false', 'true'])
    expect(document.activeElement).toBe(opts[1])
    opts[0]!.click()
    await nextTick(); await nextTick()
    expect(w.emitted('update:modelValue')![0]).toEqual(['7'])
    expect(w.find('[data-mi-menu-trigger]').text()).toContain('Last 7 days')
  })

  it('supports a custom trigger slot with trigger props', async () => {
    const w = track(mount(MiMenu, {
      attachTo: document.body,
      props: { items },
      slots: { trigger: ({ props }: { props: Record<string, unknown> }) => h('button', { ...props, class: 'mine' }, 'More') }
    }))
    expect(w.find('.mine').attributes('aria-haspopup')).toBe('menu')
    await w.find('.mine').trigger('click', { detail: 0 })
    await nextTick(); await nextTick()
    expect(panel()).not.toBeNull()
  })

  it('does not open when disabled', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items, disabled: true } }))
    await w.find('[data-mi-menu-trigger]').trigger('click', { detail: 0 })
    expect(panel()).toBeNull()
  })
})
