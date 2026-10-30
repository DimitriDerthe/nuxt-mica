import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MiToolbar from '~/components/Navigation/MiToolbar.vue'
import MiSidebar from '~/components/Navigation/MiSidebar.vue'
import MiNavBar from '~/components/Navigation/MiNavBar.vue'
import MiTabBar from '~/components/Navigation/MiTabBar.vue'
import MiSteps from '~/components/Navigation/MiSteps.vue'
import MiLocalNav from '~/components/Navigation/MiLocalNav.vue'
import MiBreadcrumb from '~/components/Navigation/MiBreadcrumb.vue'
import MiPagination from '~/components/Navigation/MiPagination.vue'
import MiPageControl from '~/components/Navigation/MiPageControl.vue'
import { miPageRange, miPagerWidth, miNavIcons } from '~/utils/miNav'
import { miIcons } from '~/utils/miIcons'

const key = (k: string) => new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })

describe('MiToolbar', () => {
  const views = [{ id: 'grid', label: 'Grid view', icon: 'grid' as const }, { id: 'list', label: 'List view', icon: 'list' as const }]
  it('renders title, labelled controls and disabled forward', () => {
    const w = mount(MiToolbar, { props: { title: 'Projects', subtitle: '12 items', views, view: 'grid', searchable: true, primaryLabel: 'New', avatar: 'AM' } })
    expect(w.find('nav').attributes('aria-label')).toBe('Window toolbar')
    expect(w.text()).toContain('12 items')
    expect(w.find('[aria-label=Forward]').attributes('disabled')).toBeDefined()
    expect(w.find('[role=radiogroup]').exists()).toBe(true)
    expect(w.find('input[type=search]').exists()).toBe(true)
  })
  it('updates view via click and emits events', async () => {
    const w = mount(MiToolbar, { props: { views, view: 'grid', 'onUpdate:view': (v: string) => w.setProps({ view: v }) } })
    await w.find('[aria-label="List view"]').trigger('click')
    expect(w.find('[aria-label="List view"]').attributes('aria-checked')).toBe('true')
    await w.find('[aria-label="Toggle sidebar"]').trigger('click')
    expect(w.emitted('toggle-sidebar')).toHaveLength(1)
  })
})

describe('MiSidebar', () => {
  const groups = [
    { label: 'Workspace', items: [{ id: 'a', label: 'Home', icon: 'home' as const }, { id: 'b', label: 'Inbox', icon: 'inbox' as const, badge: 4 }] },
    { label: 'Tags', collapsible: true, items: [{ id: 't', label: 'Design', color: 'purple' as const }] }
  ]
  it('marks the current item and shows badges', () => {
    const w = mount(MiSidebar, { props: { groups, modelValue: 'b' } })
    expect(w.find('[aria-current=page]').text()).toContain('Inbox')
    expect(w.text()).toContain('4')
  })
  it('selects on click', async () => {
    const w = mount(MiSidebar, { props: { groups, modelValue: 'a' } })
    await w.findAll('.mi-sb__row')[1]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['b'])
  })
  it('collapses via class and inert, and toggles groups', async () => {
    const w = mount(MiSidebar, { props: { groups, collapsed: true } })
    expect(w.classes()).toContain('is-collapsed')
    expect(w.attributes('aria-hidden')).toBe('true')
    await w.setProps({ collapsed: false })
    const head = w.find('button.mi-sb__head')
    expect(head.attributes('aria-expanded')).toBe('true')
    await head.trigger('click')
    expect(head.attributes('aria-expanded')).toBe('false')
  })
})

describe('MiNavBar', () => {
  it('renders back, action and large title', async () => {
    const w = mount(MiNavBar, { props: { title: 'Library', backLabel: 'Home', actionLabel: 'Edit' } })
    expect(w.find('h1').text()).toBe('Library')
    await w.find('.mi-nb__back').trigger('click')
    await w.find('.mi-nb__action').trigger('click')
    expect(w.emitted('back')).toHaveLength(1)
    expect(w.emitted('action')).toHaveLength(1)
  })
  it('writes scroll progress through requestAnimationFrame', async () => {
    const scroller = document.createElement('div')
    scroller.style.overflowY = 'auto'
    document.body.appendChild(scroller)
    const w = mount(MiNavBar, { props: { title: 'Library', target: scroller }, attachTo: scroller })
    scroller.scrollTop = 100
    scroller.dispatchEvent(new Event('scroll'))
    await new Promise(r => setTimeout(r, 50))
    expect(w.element.style.getPropertyValue('--p')).toBe('1.000')
    expect(w.emitted('update:collapsed')?.at(-1)).toEqual([true])
    w.unmount()
  })
})

describe('MiTabBar', () => {
  const items = [{ id: 'h', label: 'Home', icon: 'home' as const }, { id: 's', label: 'Search', icon: 'search' as const }, { id: 'l', label: 'Library', icon: 'photo' as const }]
  it('sets aria-current and v-model for both variants', async () => {
    for (const variant of ['bar', 'capsule'] as const) {
      const w = mount(MiTabBar, { props: { items, modelValue: 's', variant } })
      expect(w.find('[aria-current=page]').text()).toContain('Search')
      await w.findAll('button')[2]!.trigger('click')
      expect(w.emitted('update:modelValue')![0]).toEqual(['l'])
    }
  })
  it('exposes the indicator index for capsule', () => {
    const w = mount(MiTabBar, { props: { items, modelValue: 'l', variant: 'capsule' } })
    expect(w.attributes('style')).toContain('--i: 2')
  })
})

describe('MiSteps', () => {
  const steps = [{ label: 'Details', description: 'd' }, { label: 'Billing' }, { label: 'Confirm' }]
  it('derives done/current/todo states', () => {
    const w = mount(MiSteps, { props: { steps, modelValue: 1 } })
    const li = w.findAll('li')
    expect(li[0]!.classes()).toContain('is-done')
    expect(li[1]!.classes()).toContain('is-current')
    expect(li[2]!.classes()).toContain('is-todo')
    expect(w.find('[aria-current=step]').attributes('aria-label')).toBe('Go to step 2')
  })
  it('horizontal steps carry a step count for the narrow caption', () => {
    const w = mount(MiSteps, { props: { steps, modelValue: 1, orientation: 'horizontal' } })
    expect(w.find('ol').attributes('style')).toContain('--mi-st-n: 3')
    expect(w.findAll('.mi-st__count')[1]!.text()).toBe('Step 2 of 3')
    expect(mount(MiSteps, { props: { steps } }).find('.mi-st__count').exists()).toBe(false)
  })
  it('navigates on click unless not clickable', async () => {
    const w = mount(MiSteps, { props: { steps, modelValue: 1 } })
    await w.findAll('button')[2]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([2])
    const s = mount(MiSteps, { props: { steps, modelValue: 0, clickable: false } })
    expect(s.findAll('button')).toHaveLength(0)
  })
})

describe('MiLocalNav', () => {
  const items = [{ id: 'o', label: 'Overview' }, { id: 'a', label: 'Activity' }, { id: 'f', label: 'Files' }]
  it('renders and selects', async () => {
    const w = mount(MiLocalNav, { props: { title: 'Projects', items, modelValue: 'o', actionLabel: 'Invite' } })
    expect(w.find('[aria-current=page]').text()).toBe('Overview')
    await w.findAll('.mi-ln__item')[1]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['a'])
    await w.find('.mi-ln__cta').trigger('click')
    expect(w.emitted('action')).toHaveLength(1)
  })
  it('moves focus with arrow keys', async () => {
    const w = mount(MiLocalNav, { props: { items, modelValue: 'o' }, attachTo: document.body })
    const btns = w.findAll('.mi-ln__item')
    ;(btns[0]!.element as HTMLElement).focus()
    btns[0]!.element.dispatchEvent(key('ArrowRight'))
    expect(document.activeElement).toBe(btns[1]!.element)
    w.unmount()
  })
})

describe('MiBreadcrumb', () => {
  it('links all but the last item', () => {
    const w = mount(MiBreadcrumb, { props: { items: [{ label: 'Home' }, { label: 'Projects' }, { label: 'Spring' }] } })
    expect(w.findAll('a')).toHaveLength(2)
    expect(w.find('[aria-current=page]').text()).toBe('Spring')
  })
  it('renders the path variant and emits navigate', async () => {
    const w = mount(MiBreadcrumb, { props: { variant: 'path', items: [{ label: 'Documents' }, { label: 'Brief.pdf' }] } })
    expect(w.find('.mi-path__current').text()).toBe('Brief.pdf')
    await w.find('a').trigger('click')
    expect(w.emitted('navigate')![0]![1]).toBe(0)
  })
})

describe('MiPagination', () => {
  it('computes ranges with ellipses', () => {
    expect(miPageRange(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(miPageRange(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20])
    expect(miPageRange(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20])
    expect(miPageRange(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20])
  })
  it('navigates and disables edges', async () => {
    const w = mount(MiPagination, { props: { total: 5, modelValue: 1 } })
    expect(w.find('[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Page 1 of 5')
    await w.find('[aria-label="Next page"]').trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([2])
    expect(w.find('[aria-current=page]').attributes('aria-label')).toBe('Page 2')
  })
  it('estimates the widest row for a sibling count', () => {
    expect(miPagerWidth(24, 1)).toBe(72 + 7 * 36 + 8 * 4)
    expect(miPagerWidth(24, 0)).toBe(72 + 5 * 36 + 6 * 4)
    expect(miPagerWidth(3, 1)).toBe(72 + 3 * 36 + 4 * 4)
    expect(miPagerWidth(1200, 0)).toBe(72 + 5 * 48 + 6 * 4)
  })
  it('drops siblings, then goes compact, as its container narrows', async () => {
    let cb: ResizeObserverCallback = () => {}
    vi.stubGlobal('ResizeObserver', class { constructor(f: ResizeObserverCallback) { cb = f } observe() {} disconnect() {} })
    const w = mount({ components: { MiPagination }, template: '<div><MiPagination :total="24" :model-value="10" /></div>' }, { attachTo: document.body })
    const resize = async (width: number) => { cb([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver); await w.vm.$nextTick() }
    expect(w.findAll('.mi-pg__page')).toHaveLength(5)
    await resize(300)
    expect(w.findAll('.mi-pg__page').map(b => b.text())).toEqual(['1', '10', '24'])
    await resize(200)
    expect(w.findAll('.mi-pg__page')).toHaveLength(0)
    expect(w.find('.mi-pg__compact').text()).toBe('10 / 24')
    expect(w.find('.mi-pg').classes()).toContain('is-compact')
    expect(w.find('.mi-pg__sum').text()).toBe('Page 10 of 24')
    await resize(800)
    expect(w.findAll('.mi-pg__page')).toHaveLength(5)
    w.unmount()
    vi.unstubAllGlobals()
  })
  it('compact true always uses the short form, false never adapts', () => {
    expect(mount(MiPagination, { props: { total: 24, modelValue: 3, compact: true } }).find('.mi-pg__compact').text()).toBe('3 / 24')
    expect(mount(MiPagination, { props: { total: 24, modelValue: 3, compact: false } }).findAll('.mi-pg__page')).toHaveLength(6)
  })
})

describe('MiPageControl', () => {
  it('renders tabs with selection and roving tabindex', async () => {
    const w = mount(MiPageControl, { props: { count: 5, modelValue: 1 } })
    const tabs = w.findAll('[role=tab]')
    expect(tabs).toHaveLength(5)
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
    expect(tabs[0]!.attributes('tabindex')).toBe('-1')
    await tabs[3]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual([3])
  })
  it('supports arrow keys', async () => {
    const w = mount(MiPageControl, { props: { count: 3, modelValue: 0 }, attachTo: document.body })
    const tabs = w.findAll('[role=tab]')
    ;(tabs[0]!.element as HTMLElement).focus()
    tabs[0]!.element.dispatchEvent(key('ArrowRight'))
    expect(w.emitted('update:modelValue')![0]).toEqual([1])
    w.unmount()
  })
})

describe('icon sets', () => {
  it('navigation and MiIcon share settings, people and billing glyphs', () => {
    for (const n of ['settings', 'people', 'billing'] as const) expect(miNavIcons[n]).toMatch(/^<(path|circle|rect)/)
    expect(miIcons.settings).toBe(miNavIcons.settings)
    expect(miIcons.billing).toBe(miNavIcons.billing)
  })
  it('MiSidebar renders the new glyphs', () => {
    const w = mount(MiSidebar, { props: { modelValue: 's', groups: [{ items: [{ id: 's', label: 'Settings', icon: 'settings' as const }, { id: 'b', label: 'Billing', icon: 'billing' as const }] }] } })
    expect(w.html()).toContain('M18.5 9.6')
    expect(w.html()).toContain('M3 10h18')
  })
})
