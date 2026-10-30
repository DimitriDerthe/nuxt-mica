import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MiCarousel from '~/components/Content/MiCarousel.vue'
import MiScrollArea from '~/components/Content/MiScrollArea.vue'
import MiResizable from '~/components/Content/MiResizable.vue'
import MiItem from '~/components/Content/MiItem.vue'
import MiDataTable from '~/components/Content/MiDataTable.vue'

describe('MiCarousel', () => {
  it('renders region, dots and updates v-model on dot click', async () => {
    const w = mount(MiCarousel, { slots: { default: '<div>a</div><div>b</div><div>c</div>' }, attachTo: document.body })
    expect(w.attributes('aria-roledescription')).toBe('carousel')
    await w.vm.$nextTick()
    const dots = w.findAll('.mi-car__dot')
    expect(dots.length).toBe(3)
    await dots[2]!.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([2])
    w.unmount()
  })
  it('disables prev on first slide unless loop', () => {
    const w = mount(MiCarousel, { slots: { default: '<div>a</div><div>b</div>' } })
    expect(w.find('.mi-car__btn--prev').attributes('disabled')).toBeDefined()
    const l = mount(MiCarousel, { props: { loop: true }, slots: { default: '<div>a</div><div>b</div>' } })
    expect(l.find('.mi-car__btn--prev').attributes('disabled')).toBeUndefined()
  })
})

describe('MiScrollArea', () => {
  it('renders a focusable labelled region with slot content', () => {
    const w = mount(MiScrollArea, { props: { label: 'Tags' }, slots: { default: '<p>x</p>' } })
    const r = w.find('[role=region]')
    expect(r.attributes('aria-label')).toBe('Tags')
    expect(r.attributes('tabindex')).toBe('0')
    expect(w.text()).toContain('x')
  })
})

describe('MiResizable', () => {
  it('renders panels and handles with separator semantics', () => {
    const w = mount(MiResizable, { props: { modelValue: [30, 70] }, slots: { 'panel-0': 'A', 'panel-1': 'B' } })
    expect(w.findAll('.mi-rs__panel').length).toBe(2)
    const h = w.find('[role=separator]')
    expect(h.attributes('aria-valuenow')).toBe('30')
    expect(h.attributes('aria-orientation')).toBe('vertical')
  })
  it('resizes with keyboard and respects min size', async () => {
    const w = mount(MiResizable, { props: { modelValue: [30, 70], minSize: 25, orientation: 'horizontal', withHandle: true } })
    const h = w.find('[role=separator]')
    await h.trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')?.[0]).toEqual([[35, 65]])
    await h.trigger('keydown', { key: 'Home' })
    expect(w.emitted('update:modelValue')?.[1]).toEqual([[25, 75]])
    expect(w.find('.mi-rs__grip').exists()).toBe(true)
  })
})

describe('MiItem', () => {
  it('supports xs size and header/footer slots', () => {
    const w = mount(MiItem, { props: { size: 'xs' }, slots: { header: 'H', footer: 'F' } })
    expect(w.classes()).toContain('mi-item--xs')
    expect(w.text()).toContain('H')
    expect(w.text()).toContain('F')
  })
  it('renders title, description and slots', () => {
    const w = mount(MiItem, { props: { title: 'T', description: 'D', variant: 'outline' }, slots: { media: 'M', actions: '<button>Go</button>' } })
    expect(w.attributes('role')).toBe('listitem')
    expect(w.classes()).toContain('mi-item--outline')
    expect(w.text()).toContain('T')
    expect(w.text()).toContain('D')
    expect(w.find('.mi-item__media').exists()).toBe(true)
    expect(w.find('button').exists()).toBe(true)
  })
  it('renders an anchor with href', () => {
    expect(mount(MiItem, { props: { href: '#x', title: 'L' } }).element.tagName).toBe('A')
  })
})

describe('MiDataTable', () => {
  const columns = [{ key: 'name', label: 'Name', sortable: true }, { key: 'n', label: 'N', sortable: true }]
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `User ${i}`, n: i }))
  it('paginates, filters and sorts', async () => {
    const w = mount(MiDataTable, { props: { columns, rows, pageSize: 10 } })
    expect(w.findAll('tr[data-row]').length).toBe(10)
    await w.find('input[type=search]').setValue('User 2')
    expect(w.findAll('tr[data-row]').length).toBe(6)
    await w.find('input[type=search]').setValue('')
    await w.findAll('.mi-tbl__sort')[1]!.trigger('click')
    await w.findAll('.mi-tbl__sort')[1]!.trigger('click')
    expect(w.find('tr[data-row] td').text()).toBe('User 24')
  })
  it('hides columns via the Columns menu and filters one column', async () => {
    const w = mount(MiDataTable, { props: { columns, rows, columnToggle: true, filterKey: 'name' } })
    await w.find('.mi-dt__colopt input').setValue(false)
    expect(w.findAll('th').length).toBe(1)
  })
  it('selects rows with checkboxes', async () => {
    const w = mount(MiDataTable, { props: { columns, rows, selectable: 'multiple', pageSize: 5 } })
    await w.find('tbody input[type=checkbox]').setValue(true)
    expect(w.emitted('update:selected')?.[0]).toEqual([['0']])
    expect(w.text()).toContain('row(s) selected')
  })
})
