import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MiTabs from '~/components/Navigation/MiTabs.vue'
import MiTabsList from '~/components/Navigation/MiTabsList.vue'
import MiTabsTrigger from '~/components/Navigation/MiTabsTrigger.vue'
import MiTabsContent from '~/components/Navigation/MiTabsContent.vue'
import MiMenubar from '~/components/Navigation/MiMenubar.vue'
import MiNavigationMenu from '~/components/Navigation/MiNavigationMenu.vue'

describe('MiTabs', () => {
  const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]
  it('renders roles, panel slot and v-model', async () => {
    const w = mount(MiTabs, { props: { items, modelValue: 'a' }, slots: { a: 'PanelA', b: 'PanelB' }, attachTo: document.body })
    expect(w.find('[role=tablist]').exists()).toBe(true)
    expect(w.find('[role=tabpanel]').text()).toBe('PanelA')
    await w.findAll('[role=tab]')[1]!.trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['b'])
    w.unmount()
  })
  it('arrow key moves selection', async () => {
    const w = mount(MiTabs, { props: { items, modelValue: 'a' }, attachTo: document.body })
    const tabs = w.findAll('[role=tab]')
    ;(tabs[0]!.element as HTMLElement).focus()
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')![0]).toEqual(['b'])
    w.unmount()
  })
})

describe('MiTabs compound', () => {
  it('selects and shows content through parts', async () => {
    const w = mount({
      components: { MiTabs, MiTabsList, MiTabsTrigger, MiTabsContent },
      data: () => ({ v: 'a' }),
      template: '<MiTabs v-model="v"><MiTabsList><MiTabsTrigger value="a">A</MiTabsTrigger><MiTabsTrigger value="b">B</MiTabsTrigger></MiTabsList><MiTabsContent value="a">PA</MiTabsContent><MiTabsContent value="b">PB</MiTabsContent></MiTabs>'
    }, { attachTo: document.body })
    expect(w.find('[role=tabpanel]').text()).toBe('PA')
    await w.findAll('[role=tab]')[1]!.trigger('click')
    expect(w.find('[role=tabpanel]').text()).toBe('PB')
    w.unmount()
  })
})

describe('MiMenubar', () => {
  it('renders a menubar with a trigger per menu', () => {
    const w = mount(MiMenubar, { props: { menus: [{ id: 'f', label: 'File', items: [{ value: 'n', label: 'New' }] }, { id: 'e', label: 'Edit', items: [] }] }, global: { stubs: { Teleport: true } } })
    expect(w.find('[role=menubar]').exists()).toBe(true)
    const t = w.findAll('[role=menuitem]')
    expect(t.map(x => x.text())).toEqual(['File', 'Edit'])
    expect(t[0]!.attributes('aria-haspopup')).toBe('menu')
    expect(t[0]!.attributes('aria-expanded')).toBe('false')
  })
})

describe('MiNavigationMenu hover and viewport', () => {
  const items = [{ id: 'p', label: 'Products', links: [{ title: 'Alpha', href: '/a' }] }]
  it('opens on pointerenter and renders a shared viewport', async () => {
    const w = mount(MiNavigationMenu, { props: { items, modelValue: undefined, 'onUpdate:modelValue': (v: string | undefined) => w.setProps({ modelValue: v }) }, attachTo: document.body })
    await w.find('li').trigger('pointerenter')
    expect(w.find('.mi-nm__viewport.is-open').exists()).toBe(true)
    w.unmount()
  })
})

describe('MiNavigationMenu', () => {
  const items = [{ id: 'p', label: 'Products', links: [{ title: 'Alpha', href: '/a' }] }, { id: 'd', label: 'Docs', href: '/docs' }]
  it('toggles the flyout and closes on Escape', async () => {
    const w = mount(MiNavigationMenu, { props: { items, modelValue: undefined, 'onUpdate:modelValue': (v: string | undefined) => w.setProps({ modelValue: v }) }, attachTo: document.body })
    const btn = w.find('button')
    await w.setProps({ viewport: false })
    expect(btn.attributes('aria-expanded')).toBe('false')
    await btn.trigger('click')
    expect(btn.attributes('aria-expanded')).toBe('true')
    await btn.trigger('keydown', { key: 'Escape' })
    expect(btn.attributes('aria-expanded')).toBe('false')
    expect(w.find('a.mi-nm__top').attributes('href')).toBe('/docs')
    w.unmount()
  })
})
