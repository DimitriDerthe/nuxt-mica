import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiList from '~/components/Content/MiList.vue'
import MiListItem from '~/components/Content/MiListItem.vue'
import MiSwipeRow from '~/components/Content/MiSwipeRow.vue'
import MiCard from '~/components/Content/MiCard.vue'
import MiAvatar from '~/components/Content/MiAvatar.vue'
import MiAvatarGroup from '~/components/Content/MiAvatarGroup.vue'
import MiDetails from '~/components/Content/MiDetails.vue'
import MiTable from '~/components/Content/MiTable.vue'
import MiAccordion from '~/components/Content/MiAccordion.vue'
import MiAccordionItem from '~/components/Content/MiAccordionItem.vue'

describe('MiList / MiListItem', () => {
  it('renders header, footer, role list and items', () => {
    const w = mount(MiList, {
      props: { header: 'General', footer: 'Help text' },
      slots: { default: '<div class="x" role="listitem">a</div>' }
    })
    expect(w.find('[role=list]').exists()).toBe(true)
    expect(w.text()).toContain('General')
    expect(w.text()).toContain('Help text')
  })
  it('renders an anchor with chevron, value and listitem role', async () => {
    const w = mount(MiListItem, { props: { href: '#x', title: 'Language', value: 'English', chevron: true } })
    expect(w.attributes('role')).toBe('listitem')
    expect(w.find('a').attributes('href')).toBe('#x')
    expect(w.find('.mi-li__value').text()).toBe('English')
    expect(w.find('svg.mi-li__chev').exists()).toBe(true)
  })
  it('renders a button and emits click, ignores when disabled', async () => {
    const w = mount(MiListItem, { props: { button: true, title: 'Sign out', destructive: true } })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    const d = mount(MiListItem, { props: { button: true, title: 'x', disabled: true } })
    expect(d.find('button').attributes('disabled')).toBeDefined()
  })
  it('rich variant shows dot, time and clamped description', () => {
    const w = mount(MiListItem, { props: { variant: 'rich', dot: true, title: 'Sam', value: '09:41', subtitle: 'Subj', description: 'Body' } })
    expect(w.find('.mi-li__dot--on').exists()).toBe(true)
    expect(w.find('.mi-li__time').text()).toBe('09:41')
    expect(w.find('.mi-li__desc').text()).toBe('Body')
  })
  it('renders leading tile', () => {
    const w = mount(MiListItem, { props: { title: 'A', tile: 'indigo' }, slots: { leading: '<i class="ic" />' } })
    expect(w.find('.mi-li__tile--indigo .ic').exists()).toBe(true)
  })
})

describe('MiSwipeRow', () => {
  const actions = [{ id: 'a', label: 'Archive', tone: 'primary' as const }, { id: 'd', label: 'Delete', tone: 'danger' as const }]
  it('hides actions from assistive tech when closed and exposes them when open', async () => {
    const w = mount(MiSwipeRow, { props: { actions, open: false }, slots: { default: '<span>row</span>' } })
    expect(w.find('.mi-sw__acts').attributes('aria-hidden')).toBe('true')
    await w.setProps({ open: true })
    expect(w.find('.mi-sw__acts').attributes('aria-hidden')).toBeUndefined()
    expect(w.attributes('style')).toContain('150px')
  })
  it('opens with ArrowLeft and closes with Escape, updating v-model', async () => {
    const w = mount(MiSwipeRow, { props: { actions, 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) }, slots: { default: '<span>row</span>' }, attachTo: document.body })
    await w.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:open')?.[0]).toEqual([true])
    await nextTick()
    await w.trigger('keydown', { key: 'Escape' })
    expect(w.emitted('update:open')?.[1]).toEqual([false])
    w.unmount()
  })
  it('emits action and closes', async () => {
    const w = mount(MiSwipeRow, { props: { actions, open: true }, slots: { default: '<span>row</span>' } })
    await w.findAll('.mi-sw__act')[1]!.trigger('click')
    expect(w.emitted('action')?.[0]).toEqual(['d'])
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
  })
  it('opens by dragging past half the reveal width', async () => {
    const raf = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 1 })
    const w = mount(MiSwipeRow, { props: { actions }, slots: { default: '<span>row</span>' } })
    const c = w.find('.mi-sw__c')
    const ev = (type: string, x: number, t: number) => { const e = new Event(type, { bubbles: true }); Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: 'touch' }, clientX: { value: x }, clientY: { value: 0 }, button: { value: 0 }, timeStamp: { value: t } }); c.element.dispatchEvent(e) }
    ev('pointerdown', 200, 0)
    ev('pointermove', 150, 100)
    ev('pointermove', 60, 200)
    expect((c.element as HTMLElement).style.getPropertyValue('--mi-sw-x')).not.toBe('')
    ev('pointerup', 60, 300)
    await nextTick()
    expect(w.emitted('update:open')?.[0]).toEqual([true])
    raf.mockRestore()
  })
})

describe('MiCard', () => {
  it('renders eyebrow, title, description, media and footer', () => {
    const w = mount(MiCard, { props: { eyebrow: 'Guide', title: 'T', description: 'D', image: '/a.png', imageAlt: 'alt' }, slots: { footer: '<a>Read</a>' } })
    expect(w.find('h3').text()).toBe('T')
    expect(w.find('img').attributes('alt')).toBe('alt')
    expect(w.find('.mi-card__foot').text()).toBe('Read')
    expect(w.classes()).toContain('mi-card--pad-media')
  })
  it('renders as a link and supports variants', () => {
    const w = mount(MiCard, { props: { href: '/x', variant: 'outlined' } })
    expect(w.element.tagName).toBe('A')
    expect(w.classes()).toContain('mi-card--outlined')
  })
})

describe('MiAvatar / MiAvatarGroup', () => {
  it('derives initials and role img', () => {
    const w = mount(MiAvatar, { props: { name: 'Alex Martin' } })
    expect(w.text()).toBe('AM')
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Alex Martin')
  })
  it('sizes and shapes', () => {
    const w = mount(MiAvatar, { props: { name: 'A', size: 'lg', shape: 'square' } })
    expect(w.attributes('style')).toContain('64px')
    expect(w.classes()).toContain('mi-av--square')
  })
  it('falls back to the placeholder glyph and to initials on image error', async () => {
    expect(mount(MiAvatar).find('svg').exists()).toBe(true)
    const w = mount(MiAvatar, { props: { name: 'Sam Rivera', src: '/x.png' } })
    await w.find('img').trigger('error')
    expect(w.find('img').exists()).toBe(false)
    expect(w.text()).toBe('SR')
  })
  it('group collapses overflow and labels itself', () => {
    const items = ['Alex Martin', 'Sam Rivera', 'Jordan Lee', 'A B', 'C D', 'E F'].map(name => ({ name }))
    const w = mount(MiAvatarGroup, { props: { items, max: 3 } })
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Alex, Sam, Jordan and 3 others')
    expect(w.text()).toContain('+3')
    expect(w.findAll('.mi-av')).toHaveLength(4)
  })
})

describe('MiDetails', () => {
  it('renders a dl with key/value pairs, links and slots', () => {
    const w = mount(MiDetails, {
      props: { items: [{ key: 'a', label: 'Owner', value: 'Alex' }, { key: 'l', label: 'Link', value: 'Copy', href: '#c' }, { key: 's', label: 'Status', value: 'x' }] },
      slots: { 'value-s': '<b class="pill">In review</b>' }
    })
    expect(w.element.tagName).toBe('DL')
    expect(w.findAll('dt').map(e => e.text())).toEqual(['Owner', 'Link', 'Status'])
    expect(w.find('a').attributes('href')).toBe('#c')
    expect(w.find('.pill').exists()).toBe(true)
  })
})

describe('MiAvatarGroup overlap', () => {
  it('overlaps by 20% of the size so two-letter initials stay whole', () => {
    const w = mount(MiAvatarGroup, { props: { items: [{ name: 'Ines Duarte' }, { name: 'Kenji Mori' }], size: 'sm' } })
    expect(w.find('.mi-avg').attributes('style')).toContain('--mi-avg-o: 6px')
  })
})

describe('MiTable', () => {
  const columns = [{ key: 'name', label: 'Name', sortable: true }, { key: 'size', label: 'Size', align: 'end' as const }]
  const rows = [{ id: 'b', name: 'Budget', size: 2 }, { id: 'a', name: 'Assets', size: 1 }, { id: 'c', name: 'Notes', size: 3 }]
  const names = (w: ReturnType<typeof mount>) => w.findAll('tbody tr').map(r => r.find('td').text())

  it('renders headers and rows with aria-sort', async () => {
    const w = mount(MiTable, { props: { columns, rows, sort: { key: 'name', dir: 'asc' } } })
    expect(names(w)).toEqual(['Assets', 'Budget', 'Notes'])
    expect(w.find('th').attributes('aria-sort')).toBe('ascending')
  })
  it('toggles sort direction via the header button', async () => {
    const w = mount(MiTable, { props: { columns, rows, sort: { key: 'name', dir: 'asc' }, 'onUpdate:sort': (v: unknown) => w.setProps({ sort: v as never }) } })
    await w.find('th button').trigger('click')
    expect(w.emitted('update:sort')?.[0]).toEqual([{ key: 'name', dir: 'desc' }])
    await nextTick()
    expect(names(w)).toEqual(['Notes', 'Budget', 'Assets'])
    expect(w.find('th').attributes('aria-sort')).toBe('descending')
  })
  it('single selection by click and keyboard with roving tabindex', async () => {
    const w = mount(MiTable, { props: { columns, rows, selectable: 'single', selected: [], 'onUpdate:selected': (v: string[]) => w.setProps({ selected: v }) }, attachTo: document.body })
    const trs = () => w.findAll('tbody tr')
    expect(w.find('table').attributes('role')).toBe('grid')
    expect(trs()[0]!.attributes('tabindex')).toBe('0')
    expect(trs()[1]!.attributes('tabindex')).toBe('-1')
    await trs()[1]!.trigger('click')
    expect(w.emitted('update:selected')?.[0]).toEqual([['a']])
    await nextTick()
    expect(trs()[1]!.attributes('aria-selected')).toBe('true')
    await trs()[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(trs()[1]!.element)
    await trs()[1]!.trigger('keydown', { key: ' ' })
    expect(w.emitted('update:selected')?.at(-1)).toEqual([[]])
    w.unmount()
  })
  it('multiple selection with select-all checkbox', async () => {
    const w = mount(MiTable, { props: { columns, rows, selectable: 'multiple', selected: [], 'onUpdate:selected': (v: string[]) => w.setProps({ selected: v }) } })
    await w.find('thead input').setValue(true)
    expect(w.emitted('update:selected')?.[0]).toEqual([['b', 'a', 'c']])
    await nextTick()
    expect(w.findAll('tbody input').every(i => (i.element as HTMLInputElement).checked)).toBe(true)
  })
  it('a real click on a row checkbox selects the row once', async () => {
    const w = mount(MiTable, { props: { columns, rows, selectable: 'multiple', selected: [], 'onUpdate:selected': (v: string[]) => w.setProps({ selected: v }) }, attachTo: document.body })
    ;(w.find('tbody input').element as HTMLInputElement).click()
    await nextTick()
    expect(w.emitted('update:selected')).toEqual([[['b']]])
    expect(w.findAll('tbody tr')[0]!.attributes('aria-selected')).toBe('true')
    w.unmount()
  })
  it('shows the empty state and enables content-visibility on large sets', () => {
    const e = mount(MiTable, { props: { columns, rows: [], emptyText: 'Nothing' } })
    expect(e.text()).toContain('Nothing')
    const big = mount(MiTable, { props: { columns, rows: Array.from({ length: 60 }, (_, i) => ({ id: i, name: 'n' + i, size: i })) } })
    expect(big.classes()).toContain('mi-tbl--cv')
  })
})

describe('MiAccordion', () => {
  const items = [{ value: 'a', title: 'First', content: 'One' }, { value: 'b', title: 'Second', content: 'Two' }]
  it('single mode opens one at a time and collapses', async () => {
    const w = mount(MiAccordion, { props: { items, modelValue: 'a', 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as never }) } })
    const btns = () => w.findAll('button')
    expect(btns()[0]!.attributes('aria-expanded')).toBe('true')
    expect(btns()[1]!.attributes('aria-expanded')).toBe('false')
    await btns()[1]!.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b'])
    await btns()[1]!.trigger('click')
    expect(w.emitted('update:modelValue')?.[1]).toEqual([null])
    await nextTick()
    expect(btns()[0]!.attributes('aria-expanded')).toBe('false')
  })
  it('multiple mode keeps several open', async () => {
    const w = mount(MiAccordion, { props: { items, type: 'multiple', modelValue: ['a'], 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as never }) } })
    await w.findAll('button')[1]!.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
  })
  it('panels are labelled regions, inert while closed, with heading wrappers', () => {
    const w = mount(MiAccordion, { props: { items, modelValue: 'a' } })
    const regions = w.findAll('[role=region]')
    expect(regions).toHaveLength(2)
    expect(regions[0]!.attributes('aria-labelledby')).toBe(w.findAll('button')[0]!.attributes('id'))
    expect(regions[1]!.attributes('inert')).toBeDefined()
    expect(regions[0]!.attributes('inert')).toBeUndefined()
    expect(w.findAll('h3')).toHaveLength(2)
  })
  it('arrow keys, Home and End move focus between triggers', async () => {
    const w = mount(MiAccordion, { props: { items }, attachTo: document.body })
    const b = w.findAll('button')
    ;(b[0]!.element as HTMLElement).focus()
    await b[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(b[1]!.element)
    await b[1]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(b[0]!.element)
    await b[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(b[1]!.element)
    w.unmount()
  })
  it('works with explicit items and disabled state', async () => {
    const w = mount(MiAccordion, { slots: { default: () => [] } })
    expect(w.exists()).toBe(true)
    const it = mount(MiAccordionItem, { props: { title: 'Solo', disabled: true }, slots: { default: 'x' } })
    expect(it.find('button').attributes('disabled')).toBeDefined()
    const free = mount(MiAccordionItem, { props: { title: 'Free' }, slots: { default: 'x' } })
    await free.find('button').trigger('click')
    expect(free.find('button').attributes('aria-expanded')).toBe('true')
  })
})
