import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MiSparkline from '~/components/Charts/MiSparkline.vue'
import MiStatTile from '~/components/Charts/MiStatTile.vue'
import MiLineChart from '~/components/Charts/MiLineChart.vue'
import MiBarChart from '~/components/Charts/MiBarChart.vue'
import MiStackedBar from '~/components/Charts/MiStackedBar.vue'
import MiMeter from '~/components/Charts/MiMeter.vue'
import MiRings from '~/components/Charts/MiRings.vue'
import MiHeatmap from '~/components/Charts/MiHeatmap.vue'
import MiChartLegend from '~/components/Charts/MiChartLegend.vue'
import MiChartTable from '~/components/Charts/MiChartTable.vue'
import { miChartCategorical, miChartColor, miChartDiverging, miChartHeat, miChartSequential } from '~/utils/miChartPalette'
import { miBarPath, miDodge, miLevel, miNiceScale, miSparkPoints } from '~/utils/miChartMath'

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { queueMicrotask(() => cb(0)); return 1 })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})
afterEach(() => vi.unstubAllGlobals())

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const series = [
  { name: 'Web', data: [42, 48, 51, 55, 53, 60, 66, 71, 69, 76, 82, 88] },
  { name: 'Mobile', data: [30, 32, 35, 34, 38, 41, 40, 45, 49, 52, 55, 58] }
]

describe('palette and math', () => {
  it('orders series 1 and 2 on the brand variables', () => {
    expect(miChartCategorical).toHaveLength(5)
    expect(miChartColor(0)).toContain('--mi-p')
    expect(miChartColor(1)).toContain('--mi-s')
    expect(miChartColor(9)).toBe('var(--mi-label2)')
  })
  it('builds sequential, diverging and heat scales', () => {
    expect(miChartSequential()).toHaveLength(7)
    expect(miChartDiverging()).toHaveLength(7)
    expect(miChartHeat()).toHaveLength(5)
  })
  it('computes nice scales', () => {
    expect(miNiceScale(88, 4).ticks).toEqual([0, 25, 50, 75, 100])
    expect(miNiceScale(90, 2).ticks).toEqual([0, 50, 100])
  })
  it('matches the mockup sparkline and bar geometry', () => {
    const pts = miSparkPoints([0, 10], 84, 28)
    expect(pts[0]).toEqual([0, 24])
    expect(pts[1]).toEqual([84, 4])
    expect(miBarPath(10, 20, 24, 100, 4)).toMatch(/^M10 100 V24 Q10 20 14 20 H30 Q34 20 34 24 V100 Z$/)
  })
  it('dodges overlapping labels and levels values', () => {
    const out = miDodge([50, 52], 15, 0, 200)
    expect(out[1]! - out[0]!).toBeGreaterThanOrEqual(15)
    expect(miLevel(0, 8)).toBe(0)
    expect(miLevel(2, 8)).toBe(1)
    expect(miLevel(8, 8)).toBe(4)
  })
})

describe('MiSparkline', () => {
  it('renders line and end dot, decorative without label', () => {
    const w = mount(MiSparkline, { props: { values: [1, 3, 2, 5] } })
    expect(w.find('svg').attributes('aria-hidden')).toBe('true')
    expect(w.find('path').exists()).toBe(true)
    expect(w.find('circle').attributes('r')).toBe('4')
  })
  it('exposes an image role with a label', () => {
    const w = mount(MiSparkline, { props: { values: [1, 2], label: 'Trend' } })
    expect(w.find('svg').attributes('role')).toBe('img')
  })
})

describe('MiStatTile', () => {
  it('shows label, value, delta and direction', () => {
    const w = mount(MiStatTile, { props: { label: 'Conversion', value: '3.8%', delta: '0.4 pt', trend: 'down', tone: 'bad', spark: [3, 2, 1] } })
    expect(w.text()).toContain('3.8%')
    expect(w.find('.mi-st-delta').classes()).toContain('is-bad')
    expect(w.find('.mi-st-arrow').classes()).toContain('is-down')
    expect(w.find('.mi-st-sr').text()).toBe('Down 0.4 pt vs last month')
    expect(w.find('.mi-spark').exists()).toBe(true)
  })
})

describe('MiLineChart', () => {
  const make = () => mount(MiLineChart, { props: { categories: months, series, unit: 'K', title: 'Active users', formatCategory: (c: string) => `${c} 2026` } })

  it('renders lines, area, end labels, legend and hit columns', () => {
    const w = make()
    expect(w.findAll('.mi-lc-line')).toHaveLength(2)
    expect(w.findAll('.mi-lc-area')).toHaveLength(1)
    expect(w.text()).toContain('Web 88K')
    expect(w.text()).toContain('Mobile 58K')
    expect(w.findAll('rect[data-i]')).toHaveLength(12)
    expect(w.find('ul').exists()).toBe(true)
  })
  it('shows the crosshair tooltip on hover', async () => {
    const w = make()
    await w.find('rect[data-i="10"]').trigger('pointermove')
    expect(w.find('.mi-lc-cross').classes()).toContain('is-on')
    expect(w.find('.mi-lc-tip').text()).toContain('Nov 2026')
    expect(w.find('.mi-lc-tip').text()).toContain('82K')
    await w.find('.mi-lc-plot').trigger('pointerleave')
    expect(w.find('.mi-lc-cross').classes()).not.toContain('is-on')
  })
  it('supports keyboard navigation', async () => {
    const w = make()
    const plot = w.find('.mi-lc-plot')
    await plot.trigger('keydown', { key: 'ArrowRight' })
    expect(w.find('.mi-lc-sr').text()).toContain('Jan 2026')
    await plot.trigger('keydown', { key: 'End' })
    expect(w.find('.mi-lc-sr').text()).toContain('Dec 2026')
    await plot.trigger('keydown', { key: 'Escape' })
    expect(w.find('.mi-lc-cross').classes()).not.toContain('is-on')
  })
  it('toggles between chart and table with v-model', async () => {
    const w = make()
    const radios = w.findAll('[role="radio"]')
    expect(radios[0]!.attributes('aria-checked')).toBe('true')
    await radios[1]!.trigger('click')
    expect(w.emitted('update:view')?.[0]).toEqual(['table'])
    expect(w.find('table').exists()).toBe(true)
    expect(w.findAll('tbody tr')).toHaveLength(12)
    expect(w.find('tbody th').text()).toBe('Jan 2026')
    await w.find('[role="radiogroup"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(w.find('.mi-lc-plot').exists()).toBe(true)
  })
  it('hides the legend for a single series', () => {
    const w = mount(MiLineChart, { props: { categories: months, series: [series[0]!], toggle: false } })
    expect(w.find('ul').exists()).toBe(false)
    expect(w.find('[role="radiogroup"]').exists()).toBe(false)
  })
})

describe('MiBarChart', () => {
  const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, value: [62, 74, 70, 81, 90, 48, 40][i]! }))
  it('sizes its viewBox to the real plot width so labels never scale up', async () => {
    let cb: ResizeObserverCallback = () => {}
    vi.stubGlobal('ResizeObserver', class { constructor(f: ResizeObserverCallback) { cb = f } observe() {} disconnect() {} })
    const w = mount(MiBarChart, { props: { data } })
    await w.vm.$nextTick()
    expect(w.find('svg').attributes('viewBox')).toBe('0 0 360 216')
    cb([{ contentRect: { width: 720 } } as ResizeObserverEntry], {} as ResizeObserver)
    await w.vm.$nextTick()
    expect(w.find('svg').attributes('viewBox')).toBe('0 0 720 216')
    expect(w.find('.mi-bc-gridline').attributes('x2')).toBe('716')
    vi.unstubAllGlobals()
  })
  it('renders columns capped at 24px and labels the peak', () => {
    const w = mount(MiBarChart, { props: { data, unit: 'K', max: 100 } })
    expect(w.findAll('.mi-bc-bar')).toHaveLength(7)
    expect(w.find('svg').attributes('aria-label')).toContain('Fri is highest at 90K')
    const on = w.findAll('.mi-bc-val.is-on')
    expect(on).toHaveLength(1)
    expect(on[0]!.text()).toBe('90K')
    expect(w.findAll('.mi-bc-axis').map(t => t.text())).toEqual(expect.arrayContaining(['0', '50K', '100K', 'Mon']))
  })
  it('dims other columns on hover and supports the keyboard', async () => {
    const w = mount(MiBarChart, { props: { data, unit: 'K' } })
    await w.find('rect[data-i="1"]').trigger('pointermove')
    expect(w.findAll('.mi-bc-bar.is-dim')).toHaveLength(6)
    expect(w.find('.mi-bc-val.is-on').text()).toBe('74K')
    await w.find('.mi-bc').trigger('keydown', { key: 'End' })
    expect(w.find('.mi-bc-sr').text()).toBe('Sun: 40K')
  })
})

describe('MiStackedBar', () => {
  const segments = [{ label: 'Direct', value: 42 }, { label: 'Search', value: 31 }, { label: 'Social', value: 17 }, { label: 'Referral', value: 10 }]
  it('renders proportional segments, a labelled image and a legend', () => {
    const w = mount(MiStackedBar, { props: { segments } })
    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Direct 42%, Search 31%, Social 17%, Referral 10%')
    expect(w.findAll('.mi-sb-seg')).toHaveLength(4)
    expect(w.findAll('.mi-sb-seg')[0]!.classes()).toContain('is-first')
    expect(w.findAll('li')).toHaveLength(4)
    expect(w.text()).toContain('31%')
  })
  it('syncs the active segment with v-model:active', async () => {
    const w = mount(MiStackedBar, { props: { segments, active: -1, 'onUpdate:active': (v: number) => w.setProps({ active: v }) } })
    await w.findAll('.mi-sb-seg')[2]!.trigger('pointerover')
    expect(w.findAll('.mi-sb-seg.is-dim')).toHaveLength(3)
    expect(w.findAll('li')[2]!.classes()).toContain('is-on')
    await w.find('[role="img"]').trigger('keydown', { key: 'Escape' })
    expect(w.findAll('.mi-sb-seg.is-dim')).toHaveLength(0)
  })
})

describe('MiMeter', () => {
  it('exposes the meter role with values and a fill offset', () => {
    const w = mount(MiMeter, { props: { value: 82, label: 'Monthly budget', caption: '82 % used', hint: '$1,240 remaining' } })
    const m = w.find('[role="meter"]')
    expect(m.attributes('aria-valuenow')).toBe('82')
    expect(m.attributes('aria-valuemin')).toBe('0')
    expect(m.attributes('aria-valuemax')).toBe('100')
    expect(m.attributes('aria-labelledby')).toBeTruthy()
    expect(w.find('.mi-mt-fill').attributes('style')).toContain('translate3d(-18%')
    expect(w.text()).toContain('$1,240 remaining')
  })
  it('clamps out of range values', () => {
    const w = mount(MiMeter, { props: { value: 140, ariaLabel: 'Load' } })
    expect(w.find('.mi-mt-fill').attributes('style')).toContain('translate3d(0%')
    expect(w.find('[role="meter"]').attributes('aria-label')).toBe('Load')
  })
})

describe('MiRings', () => {
  const rings = [
    { label: 'Tasks', sub: 'Completed this week', value: 0.72 },
    { label: 'Reviews', sub: 'Given to teammates', value: 0.54 },
    { label: 'Focus', sub: 'Hours without meetings', value: 0.88 }
  ]
  it('draws concentric rings with the mockup radii and stroke-dashoffset progress', () => {
    const w = mount(MiRings, { props: { rings } })
    expect(w.find('svg').attributes('aria-label')).toBe('Tasks 72%, Reviews 54%, Focus 88%')
    const arcs = w.findAll('.mi-rg-arc')
    expect(arcs.map(a => a.attributes('r'))).toEqual(['78', '60', '42'])
    const c = 2 * Math.PI * 78
    expect(arcs[0]!.attributes('style')).toContain(`stroke-dashoffset: ${Math.round(c * 0.28 * 10) / 10}`)
    expect(w.text()).toContain('88%')
  })
  it('dims other rings when a legend row is hovered', async () => {
    const w = mount(MiRings, { props: { rings, active: -1, 'onUpdate:active': (v: number) => w.setProps({ active: v }) } })
    await w.findAll('li')[1]!.trigger('pointerenter')
    expect(w.findAll('.mi-rg-ring.is-dim')).toHaveLength(2)
  })
})

describe('MiHeatmap', () => {
  const data = Array.from({ length: 140 }, (_, i) => (i % 5) * 2)
  it('renders a 20 x 7 grid with tooltips, day labels and a legend scale', () => {
    const w = mount(MiHeatmap, { props: { data, unit: 'reviews' } })
    expect(w.findAll('.mi-hm-cell')).toHaveLength(140)
    expect(w.find('svg').attributes('viewBox')).toBe('0 0 370 132')
    expect(w.findAll('.mi-hm-day').map(t => t.text())).toEqual(['Mon', 'Wed', 'Fri'])
    expect(w.find('title').text()).toBe('Week 1, Mon: 0 reviews')
    expect(w.findAll('.mi-lg-step')).toHaveLength(5)
  })
  it('moves with arrow keys and announces the cell', async () => {
    const w = mount(MiHeatmap, { props: { data, unit: 'reviews' } })
    const g = w.find('.mi-hm')
    await g.trigger('keydown', { key: 'ArrowDown' })
    await g.trigger('keydown', { key: 'ArrowDown' })
    expect(w.find('.mi-hm-sr').text()).toBe('Week 1, Tue: 2 reviews')
    await g.trigger('keydown', { key: 'ArrowRight' })
    expect(w.find('.mi-hm-sr').text()).toBe('Week 2, Tue: 6 reviews')
    expect(w.emitted('hover')?.length).toBeGreaterThan(1)
  })
})

describe('MiChartLegend and MiChartTable', () => {
  it('renders the inline variant with shapes', () => {
    const w = mount(MiChartLegend, { props: { items: [{ label: 'Web', color: 'red' }, { label: 'Mobile', color: 'blue', shape: 'square' }] } })
    expect(w.findAll('li')).toHaveLength(2)
    expect(w.findAll('.mi-lg-sw--square')).toHaveLength(1)
  })
  it('renders the ramp variant as an image', () => {
    const w = mount(MiChartLegend, { props: { variant: 'ramp', items: [{ label: '0', color: 'red' }, { label: '1', color: 'blue' }] } })
    expect(w.find('[role="img"]').text()).toContain('Less')
    expect(w.text()).toContain('More')
  })
  it('renders an accessible table with row headers', () => {
    const w = mount(MiChartTable, { props: { caption: 'Users', columns: [{ key: 'm', label: 'Month' }, { key: 'a', label: 'Web' }], rows: [{ m: 'Jan', a: '42K' }, { m: 'Feb', a: '48K' }] } })
    expect(w.findAll('thead th[scope="col"]')).toHaveLength(2)
    expect(w.findAll('tbody th[scope="row"]').map(t => t.text())).toEqual(['Jan', 'Feb'])
    expect(w.find('caption').text()).toBe('Users')
  })
})
