import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import MiTree from '~/components/Content/MiTree.vue'
import MiTimeline from '~/components/Content/MiTimeline.vue'
import MiTimelineItem from '~/components/Content/MiTimelineItem.vue'
import MiSortable from '~/components/Content/MiSortable.vue'
import MiMarquee from '~/components/Content/MiMarquee.vue'
import MiBlockquote from '~/components/Base/MiBlockquote.vue'
import MiSiteHeader from '~/components/Navigation/MiSiteHeader.vue'
import MiScrollspy from '~/components/Navigation/MiScrollspy.vue'
import { useMiScrollspy } from '~/composables/useMiScrollspy'

const key = (key: string, init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })

/* ---------------------------------------------------------------- MiTree */
const tree = [
  { id: 'a', label: 'Alpha', children: [{ id: 'a1', label: 'Apple' }, { id: 'a2', label: 'Avocado', disabled: true }, { id: 'a3', label: 'Apricot' }] },
  { id: 'b', label: 'Beta', children: [{ id: 'b1', label: 'Banana' }] },
  { id: 'c', label: 'Gamma' }
]
const items = (w: ReturnType<typeof mount>) => w.findAll('[role=treeitem]')
const byId = (w: ReturnType<typeof mount>, id: string) => w.find(`[data-mi-id="${id}"]`)

describe('MiTree', () => {
  it('renders the tree roles and levels', () => {
    const w = mount(MiTree, { props: { items: tree, expanded: ['a'] }, attachTo: document.body })
    expect(w.attributes('role')).toBe('tree')
    expect(byId(w, 'a').attributes('aria-level')).toBe('1')
    expect(byId(w, 'a').attributes('aria-expanded')).toBe('true')
    expect(byId(w, 'b').attributes('aria-expanded')).toBe('false')
    expect(byId(w, 'c').attributes('aria-expanded')).toBeUndefined()
    expect(byId(w, 'a1').attributes('aria-level')).toBe('2')
    expect(byId(w, 'a1').attributes('aria-posinset')).toBe('1')
    expect(byId(w, 'a1').attributes('aria-setsize')).toBe('3')
    expect(w.find('[role=group]').exists()).toBe(true)
    w.unmount()
  })
  it('mounts children lazily', () => {
    const w = mount(MiTree, { props: { items: tree } })
    expect(byId(w, 'b1').exists()).toBe(false)
  })
  it('uses a roving tabindex with a single tab stop', () => {
    const w = mount(MiTree, { props: { items: tree, selected: 'c' } })
    const stops = items(w).filter(i => i.attributes('tabindex') === '0')
    expect(stops).toHaveLength(1)
    expect(stops[0]!.attributes('data-mi-id')).toBe('c')
  })
  it('selects on click and updates v-model:selected', async () => {
    const w = mount(MiTree, { props: { items: tree, expanded: ['a'], selected: null, 'onUpdate:selected': (v: unknown) => w.setProps({ selected: v as string }) } })
    await byId(w, 'a1').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')![0]).toEqual(['a1'])
    expect(byId(w, 'a1').attributes('aria-selected')).toBe('true')
    expect(byId(w, 'a3').attributes('aria-selected')).toBe('false')
  })
  it('toggles expansion via the chevron and emits expanded', async () => {
    const w = mount(MiTree, { props: { items: tree, expanded: [], 'onUpdate:expanded': (v: string[]) => w.setProps({ expanded: v }) } })
    await byId(w, 'b').find('.mi-tn__tg').trigger('click')
    expect(w.emitted('update:expanded')![0]).toEqual([['b']])
    expect(byId(w, 'b').attributes('aria-expanded')).toBe('true')
    expect(byId(w, 'b1').exists()).toBe(true)
  })
  it('supports multiple selection as an array', async () => {
    const w = mount(MiTree, { props: { items: tree, multiple: true, selected: [], 'onUpdate:selected': (v: string[]) => w.setProps({ selected: v }) } })
    expect(w.attributes('aria-multiselectable')).toBe('true')
    await byId(w, 'c').find('.mi-tn__row').trigger('click')
    await byId(w, 'b').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')!.at(-1)).toEqual([['c', 'b']])
    await byId(w, 'c').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')!.at(-1)).toEqual([['b']])
  })
  it('ignores disabled items', async () => {
    const w = mount(MiTree, { props: { items: tree, expanded: ['a'] } })
    expect(byId(w, 'a2').attributes('aria-disabled')).toBe('true')
    await byId(w, 'a2').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')).toBeUndefined()
  })
  it('navigates with arrows, Home, End and skips disabled', async () => {
    const w = mount(MiTree, { props: { items: tree, expanded: ['a'] }, attachTo: document.body })
    const a = byId(w, 'a').element as HTMLElement
    a.focus()
    a.dispatchEvent(key('ArrowDown'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(byId(w, 'a1').element)
    ;(document.activeElement as HTMLElement).dispatchEvent(key('ArrowDown'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(byId(w, 'a3').element)
    ;(document.activeElement as HTMLElement).dispatchEvent(key('End'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(byId(w, 'c').element)
    ;(document.activeElement as HTMLElement).dispatchEvent(key('Home'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(a)
    w.unmount()
  })
  it('expands with ArrowRight, moves to the child, and collapses/moves to parent with ArrowLeft', async () => {
    const w = mount(MiTree, { props: { items: tree, expanded: [], 'onUpdate:expanded': (v: string[]) => w.setProps({ expanded: v }) }, attachTo: document.body })
    const b = byId(w, 'b').element as HTMLElement
    b.focus()
    b.dispatchEvent(key('ArrowRight'))
    await nextTick()
    expect(byId(w, 'b').attributes('aria-expanded')).toBe('true')
    b.dispatchEvent(key('ArrowRight'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(byId(w, 'b1').element)
    ;(document.activeElement as HTMLElement).dispatchEvent(key('ArrowLeft'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(b)
    b.dispatchEvent(key('ArrowLeft'))
    await nextTick()
    expect(byId(w, 'b').attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
  it('selects with Enter and Space', async () => {
    const w = mount(MiTree, { props: { items: tree, selected: null, 'onUpdate:selected': (v: string) => w.setProps({ selected: v }) }, attachTo: document.body })
    byId(w, 'c').element.dispatchEvent(key('Enter'))
    await nextTick()
    expect(w.emitted('update:selected')![0]).toEqual(['c'])
    byId(w, 'a').element.dispatchEvent(key(' '))
    await nextTick()
    expect(w.emitted('update:selected')![1]).toEqual(['a'])
    w.unmount()
  })
  it('jumps with type-ahead', async () => {
    const w = mount(MiTree, { props: { items: tree }, attachTo: document.body })
    ;(byId(w, 'a').element as HTMLElement).focus()
    byId(w, 'a').element.dispatchEvent(key('g'))
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(byId(w, 'c').element)
    w.unmount()
  })
  it('checkable shows mixed parents and checks all enabled leaves', async () => {
    const w = mount(MiTree, { props: { items: tree, checkable: true, expanded: ['a'], selected: ['a1'], 'onUpdate:selected': (v: string[]) => w.setProps({ selected: v }) } })
    expect(byId(w, 'a').attributes('aria-checked')).toBe('mixed')
    expect(byId(w, 'a1').attributes('aria-checked')).toBe('true')
    expect(byId(w, 'a3').attributes('aria-checked')).toBe('false')
    expect(byId(w, 'a').attributes('aria-selected')).toBeUndefined()
    await byId(w, 'a').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')!.at(-1)).toEqual([['a1', 'a3']])
    expect(byId(w, 'a').attributes('aria-checked')).toBe('true')
    await byId(w, 'a').find('.mi-tn__row').trigger('click')
    expect(w.emitted('update:selected')!.at(-1)).toEqual([[]])
  })
  it('handles an empty list', () => {
    const w = mount(MiTree, { props: { items: [] } })
    expect(w.attributes('role')).toBe('tree')
    expect(items(w)).toHaveLength(0)
  })
})

/* ------------------------------------------------------------ MiTimeline */
describe('MiTimeline', () => {
  it('renders an ordered list from items with time elements', () => {
    const w = mount(MiTimeline, { props: { items: [
      { title: 'Created', time: '2026-01-02', description: 'First' },
      { title: 'Shipped', time: new Date('2026-02-03T00:00:00Z'), status: 'current' },
      { title: 'Later', time: 'Soon', status: 'upcoming' }
    ] } })
    expect(w.element.tagName).toBe('OL')
    expect(w.findAll('li')).toHaveLength(3)
    const times = w.findAll('time')
    expect(times).toHaveLength(2)
    expect(times[0]!.attributes('datetime')).toBe('2026-01-02')
    expect(times[1]!.attributes('datetime')).toBe('2026-02-03T00:00:00.000Z')
    expect(times[1]!.text()).toBe('2026-02-03')
    expect(w.find('li:nth-child(3) span.mi-tli__time').text()).toBe('Soon')
    expect(w.findAll('li')[1]!.attributes('aria-current')).toBe('step')
  })
  it('composes parts, tones, icons and the alternate class', () => {
    const w = mount(MiTimeline, { props: { align: 'alternate' }, slots: { default: () => [h(MiTimelineItem, { title: 'One', icon: 'check', tone: 'success' }), h(MiTimelineItem, { title: 'Two' })] } })
    expect(w.classes()).toContain('is-alternate')
    expect(w.findAll('.mi-tli')).toHaveLength(2)
    expect(w.find('.mi-tli__marker svg').exists()).toBe(true)
    expect(w.findAll('.mi-tli__dot')).toHaveLength(1)
    expect(w.find('.mi-tli').attributes('style')).toContain('--mi-green')
  })
  it('renders no entries for empty items', () => {
    expect(mount(MiTimeline, { props: { items: [] } }).findAll('li')).toHaveLength(0)
  })
})

/* ------------------------------------------------------------ MiSortable */
const mk = () => [{ id: 1, name: 'One' }, { id: 2, name: 'Two' }, { id: 3, name: 'Three' }]
function sortable(extra: Record<string, unknown> = {}) {
  const w = mount(MiSortable, {
    props: { modelValue: mk(), 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as never }), ...extra },
    slots: { default: `<template #default="{ item, index }"><span class="t">{{ index }}:{{ item.name }}</span></template>` },
    attachTo: document.body
  })
  return w
}
const texts = (w: ReturnType<typeof mount>) => w.findAll('.t').map(t => t.text())

describe('MiSortable', () => {
  it('renders rows through the scoped slot', () => {
    const w = sortable()
    expect(texts(w)).toEqual(['0:One', '1:Two', '2:Three'])
    expect(w.find('ul').attributes('role')).toBe('list')
    expect(w.findAll('li.mi-sort__item')[0]!.attributes('tabindex')).toBe('0')
    w.unmount()
  })
  it('keys by a custom itemKey', () => {
    const w = sortable({ itemKey: 'name', modelValue: [{ name: 'x' }, { name: 'y' }] })
    expect(w.findAll('li.mi-sort__item')).toHaveLength(2)
    w.unmount()
  })
  it('reorders with the keyboard: Space grab, arrows move, Space drop', async () => {
    const w = sortable()
    const first = () => w.findAll('li.mi-sort__item')[0]!
    first().element.dispatchEvent(key(' '))
    await nextTick()
    expect(w.find('[role=status]').text()).toContain('picked up')
    ;(w.findAll('li.mi-sort__item')[0]!.element as HTMLElement).dispatchEvent(key('ArrowDown'))
    await nextTick(); await nextTick()
    expect(texts(w).map(t => t.split(':')[1])).toEqual(['Two', 'One', 'Three'])
    expect(w.emitted('reorder')![0]).toEqual([{ from: 0, to: 1 }])
    expect(w.find('[role=status]').text()).toContain('position 2 of 3')
    expect(document.activeElement).toBe(w.findAll('li.mi-sort__item')[1]!.element)
    ;(document.activeElement as HTMLElement).dispatchEvent(key('Enter'))
    await nextTick()
    expect(w.find('[role=status]').text()).toContain('dropped')
    expect(w.emitted('update:modelValue')!.length).toBe(1)
    w.unmount()
  })
  it('does not move past the ends', async () => {
    const w = sortable()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key(' '))
    await nextTick()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key('ArrowUp'))
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeUndefined()
    w.unmount()
  })
  it('restores the original order on Escape', async () => {
    const w = sortable()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key(' '))
    await nextTick()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key('End'))
    await nextTick(); await nextTick()
    expect(texts(w).map(t => t.split(':')[1])).toEqual(['Two', 'Three', 'One'])
    ;(document.activeElement as HTMLElement).dispatchEvent(key('Escape'))
    await nextTick(); await nextTick()
    expect(texts(w).map(t => t.split(':')[1])).toEqual(['One', 'Two', 'Three'])
    expect(w.find('[role=status]').text()).toContain('cancelled')
    w.unmount()
  })
  it('uses arrow left/right in horizontal orientation', async () => {
    const w = sortable({ orientation: 'horizontal' })
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key(' '))
    await nextTick()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key('ArrowDown'))
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeUndefined()
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key('ArrowRight'))
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeTruthy()
    w.unmount()
  })
  it('with handle: only the handle is focusable and labelled, and moves via keyboard', async () => {
    const w = sortable({ handle: true, itemLabel: (i: { name: string }) => i.name })
    expect(w.findAll('li.mi-sort__item')[0]!.attributes('tabindex')).toBeUndefined()
    const handle = w.find('[data-mi-handle]')
    expect(handle.attributes('aria-label')).toBe('Reorder One')
    handle.element.dispatchEvent(key(' '))
    await nextTick()
    expect(handle.attributes('aria-pressed')).toBe('true')
    handle.element.dispatchEvent(key('ArrowDown'))
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeTruthy()
    w.unmount()
  })
  it('does nothing when disabled', async () => {
    const w = sortable({ disabled: true })
    w.findAll('li.mi-sort__item')[0]!.element.dispatchEvent(key(' '))
    await nextTick()
    expect(w.find('[role=status]').text()).toBe('')
    w.unmount()
  })
  it('drags with the pointer and commits the new order', async () => {
    const w = sortable()
    const rows = w.findAll('li.mi-sort__item').map(r => r.element as HTMLElement)
    rows.forEach((r, i) => { r.getBoundingClientRect = () => ({ top: i * 50, bottom: i * 50 + 40, left: 0, right: 100, width: 100, height: 40, x: 0, y: i * 50, toJSON() {} }) as DOMRect })
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { setTimeout(() => cb(0), 0); return 1 })
    const ev = (type: string, y: number) => { const e = new Event(type, { bubbles: true }) as Event & Record<string, unknown>; Object.assign(e, { clientX: 5, clientY: y, button: 0, pointerId: 1, pointerType: 'mouse' }); return e }
    rows[0]!.dispatchEvent(ev('pointerdown', 20))
    window.dispatchEvent(ev('pointermove', 60))
    await new Promise(r => setTimeout(r, 5))
    expect(rows[0]!.classList.contains('is-dragging')).toBe(true)
    expect(w.find('.mi-sort__ph').exists()).toBe(true)
    window.dispatchEvent(ev('pointermove', 140))
    await new Promise(r => setTimeout(r, 5))
    window.dispatchEvent(ev('pointerup', 140))
    await nextTick()
    expect(texts(w).map(t => t.split(':')[1])).toEqual(['Two', 'Three', 'One'])
    expect(w.find('.mi-sort__ph').exists()).toBe(false)
    vi.unstubAllGlobals()
    w.unmount()
  })
  it('renders an empty list', () => {
    const w = sortable({ modelValue: [] })
    expect(w.findAll('li.mi-sort__item')).toHaveLength(0)
    w.unmount()
  })
})

/* ------------------------------------------------------------ MiMarquee */
describe('MiMarquee', () => {
  it('duplicates the track and hides the clone from assistive tech', () => {
    const w = mount(MiMarquee, { slots: { default: '<span class="logo">A</span><span class="logo">B</span>' }, props: { ariaLabel: 'Partners' } })
    expect(w.attributes('role')).toBe('region')
    expect(w.attributes('aria-label')).toBe('Partners')
    expect(w.find('.mi-mq__clone').attributes('aria-hidden')).toBe('true')
    expect(w.findAll('.logo').length).toBe(4)
    expect(w.find('.mi-mq__group:not(.mi-mq__clone)').attributes('aria-hidden')).toBeUndefined()
  })
  it('applies direction, vertical, pause and gap', () => {
    const w = mount(MiMarquee, { props: { direction: 'right', vertical: true, gap: 10, pauseOnHover: false, fade: false, speed: 100 }, slots: { default: 'x' } })
    expect(w.classes()).toEqual(expect.arrayContaining(['is-reverse', 'is-vertical']))
    expect(w.classes()).not.toContain('is-pause')
    expect(w.classes()).not.toContain('is-fade')
    expect(w.attributes('style')).toContain('--mi-mq-gap: 10px')
  })
  it('has no region role without a label', () => {
    expect(mount(MiMarquee, { slots: { default: 'x' } }).attributes('role')).toBeUndefined()
  })
})

/* ---------------------------------------------------------- MiBlockquote */
describe('MiBlockquote', () => {
  it('renders figure, blockquote and figcaption', () => {
    const w = mount(MiBlockquote, { props: { quote: 'Hello', cite: 'Ada', role: 'Engineer', source: 'https://x.test/q' } })
    expect(w.element.tagName).toBe('FIGURE')
    expect(w.find('blockquote').text()).toBe('Hello')
    expect(w.find('blockquote').attributes('cite')).toBe('https://x.test/q')
    expect(w.find('figcaption cite').text()).toBe('Ada')
    expect(w.find('figcaption').text()).toContain('Engineer')
  })
  it('supports slots and variants and omits an empty caption', () => {
    const w = mount(MiBlockquote, { props: { variant: 'card' }, slots: { default: 'Quote', avatar: '<i class="av"/>' } })
    expect(w.classes()).toContain('is-card')
    expect(w.find('.av').exists()).toBe(true)
    expect(mount(MiBlockquote, { slots: { default: 'Q' } }).find('figcaption').exists()).toBe(false)
    expect(mount(MiBlockquote, { props: { variant: 'bordered' }, slots: { default: 'Q' } }).classes()).toContain('is-bordered')
  })
})

/* ---------------------------------------------------------- MiSiteHeader */
const links = [
  { label: 'Product', href: '/product', active: true },
  { label: 'Resources', children: [{ label: 'Docs', href: '/docs' }, { label: 'Guides', href: '/guides' }] },
  { label: 'Pricing', to: '/pricing' }
]
describe('MiSiteHeader', () => {
  it('renders logo, links, actions and the burger', () => {
    const w = mount(MiSiteHeader, { props: { links }, slots: { logo: '<b class="logo">L</b>', actions: '<button class="cta">Go</button>' }, attachTo: document.body })
    expect(w.element.tagName).toBe('HEADER')
    expect(w.find('.logo').exists()).toBe(true)
    expect(w.findAll('.cta').length).toBe(2)
    const product = w.find('.mi-sh__nav a[href="/product"]')
    expect(product.attributes('aria-current')).toBe('page')
    expect(w.find('.mi-sh__nav a[href="/pricing"]').exists()).toBe(true)
    expect(w.find('.mi-sh__drop').text()).toContain('Resources')
    w.unmount()
  })
  it('applies the sticky class', () => {
    expect(mount(MiSiteHeader, { props: { sticky: true } }).classes()).toContain('is-sticky')
  })
  it('burger toggles the panel with aria-expanded, focus and Escape', async () => {
    const w = mount(MiSiteHeader, { props: { links }, attachTo: document.body })
    const burger = w.find('.mi-sh__burger')
    expect(burger.attributes('aria-expanded')).toBe('false')
    expect(burger.attributes('aria-controls')).toBe(w.find('.mi-sh__panel').attributes('id'))
    expect(w.find('.mi-sh__panel').attributes('inert')).toBeDefined()
    await burger.trigger('click')
    await nextTick(); await nextTick()
    expect(burger.attributes('aria-expanded')).toBe('true')
    expect(w.find('.mi-sh__panel').attributes('inert')).toBeUndefined()
    expect(document.activeElement).toBe(w.find('.mi-sh__panel a').element)
    expect(w.emitted('update:open')![0]).toEqual([true])
    w.find('.mi-sh__panel a').element.dispatchEvent(key('Escape'))
    await nextTick()
    expect(burger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(burger.element)
    w.unmount()
  })
  it('closes the panel and emits navigate when a mobile link is chosen', async () => {
    const w = mount(MiSiteHeader, { props: { links, open: true, 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) }, attachTo: document.body })
    await w.find('.mi-sh__mlink[href="/docs"]').trigger('click')
    expect(w.emitted('navigate')![0]![0]).toMatchObject({ label: 'Docs' })
    expect(w.find('.mi-sh__burger').attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
})

/* ---------------------------------------------------------- MiScrollspy */
const sections = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three', level: 2 }]
describe('MiScrollspy', () => {
  beforeEach(() => {
    document.body.innerHTML = sections.map(s => `<section id="${s.id}"></section>`).join('')
    Element.prototype.scrollIntoView = vi.fn()
  })
  afterEach(() => { document.body.innerHTML = '' })

  it('renders anchor links with levels and aria-current', () => {
    const w = mount(MiScrollspy, { props: { items: sections, active: 'two' } })
    expect(w.element.tagName).toBe('NAV')
    const a = w.findAll('a')
    expect(a.map(x => x.attributes('href'))).toEqual(['#one', '#two', '#three'])
    expect(a[1]!.attributes('aria-current')).toBe('location')
    expect(a[0]!.attributes('aria-current')).toBeUndefined()
    expect(a[2]!.attributes('style')).toContain('--mi-ss-l: 1')
    expect(w.find('.mi-ss__ind').attributes('style')).toContain('translate3d(0,32px,0)')
  })
  it('scrolls and updates v-model on click', async () => {
    const w = mount(MiScrollspy, { props: { items: sections, active: 'one', 'onUpdate:active': (v: string) => w.setProps({ active: v }) } })
    await w.findAll('a')[2]!.trigger('click')
    expect(w.emitted('update:active')![0]).toEqual(['three'])
    expect(document.getElementById('three')!.scrollIntoView).toHaveBeenCalled()
    expect(w.findAll('a')[2]!.attributes('aria-current')).toBe('location')
  })
  it('uses instant scrolling under reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const w = mount(MiScrollspy, { props: { items: sections } })
    await w.findAll('a')[1]!.trigger('click')
    expect(document.getElementById('two')!.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    vi.unstubAllGlobals()
  })
  it('hides the indicator without an active item', () => {
    expect(mount(MiScrollspy, { props: { items: sections } }).find('.mi-ss__ind').exists()).toBe(false)
  })
})

describe('useMiScrollspy', () => {
  it('activates the first visible id from IntersectionObserver entries', async () => {
    document.body.innerHTML = '<section id="one"></section><section id="two"></section>'
    let cb!: IntersectionObserverCallback
    const observe = vi.fn()
    vi.stubGlobal('IntersectionObserver', class { constructor(c: IntersectionObserverCallback, public o: IntersectionObserverInit) { cb = c; (globalThis as Record<string, unknown>).__opts = o } observe = observe; disconnect = vi.fn() })
    let spy!: ReturnType<typeof useMiScrollspy>
    const w = mount(defineComponent({ setup() { spy = useMiScrollspy(['one', 'two'], { offset: 70 }); return () => h('div') } }))
    await nextTick()
    expect(observe).toHaveBeenCalledTimes(2)
    expect((globalThis as Record<string, unknown>).__opts).toMatchObject({ rootMargin: '-70px 0px -60% 0px' })
    expect(spy.active.value).toBeNull()
    cb([{ target: document.getElementById('two'), isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(spy.active.value).toBe('two')
    cb([{ target: document.getElementById('one'), isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(spy.active.value).toBe('one')
    w.unmount()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })
  it('stays null when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    let spy!: ReturnType<typeof useMiScrollspy>
    mount(defineComponent({ setup() { spy = useMiScrollspy(ref(['x'])); return () => h('div') } }))
    await nextTick()
    expect(spy.active.value).toBeNull()
    vi.unstubAllGlobals()
  })
})
