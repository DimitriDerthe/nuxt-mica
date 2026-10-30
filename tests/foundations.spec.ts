import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MiIcon from '../app/components/Base/MiIcon.vue'
import MiText from '../app/components/Base/MiText.vue'
import MiSurface from '../app/components/Base/MiSurface.vue'
import MiColorRamp from '../app/components/Base/MiColorRamp.vue'
import MiThemeSwitcher from '../app/components/Base/MiThemeSwitcher.vue'
import MiColorPicker from '../app/components/Base/MiColorPicker.vue'
import MiLogo from '../app/components/Base/MiLogo.vue'
import { miIconNames, miIcons, miiHome } from '../app/utils/miIcons'
import { miRamp } from '../app/utils/miRamp'

const state = {
  mode: ref<'light' | 'dark' | 'system'>('system'),
  primary: ref('#0071E3'),
  secondary: ref('#BF4800')
}
const setMode = vi.fn((m: 'light' | 'dark' | 'system') => { state.mode.value = m })
const setPrimary = vi.fn((h: string) => { state.primary.value = h })
const setSecondary = vi.fn((h: string) => { state.secondary.value = h })

vi.mock('../app/composables/useMiTheme', () => ({
  useMiTheme: () => ({ ...state, setMode, setPrimary, setSecondary })
}))

beforeEach(() => {
  state.mode.value = 'system'
  state.primary.value = '#0071E3'
  state.secondary.value = '#BF4800'
  vi.clearAllMocks()
})

describe('MiLogo', () => {
  it('renders a labelled wordmark with a brand-colored full stop', () => {
    const w = mount(MiLogo)
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Mica')
    expect(w.attributes('viewBox')).toBe('0 -8 218 68')
    expect(w.attributes('style')).toContain('height: 24px')
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-logo--label', 'mi-logo--dot-primary']))
    expect(w.findAll('.mi-logo__dot')).toHaveLength(1)
    expect(w.findAll('path')).toHaveLength(4)
  })

  it('draws the short form and the dot alone', () => {
    const short = mount(MiLogo, { props: { variant: 'short' } })
    expect(short.attributes('viewBox')).toBe('0 10 91 50')
    expect(short.findAll('path')).toHaveLength(1)
    const dot = mount(MiLogo, { props: { variant: 'dot', size: '1em' } })
    expect(dot.find('g').exists()).toBe(false)
    expect(dot.findAll('circle')).toHaveLength(1)
    expect(dot.attributes('style')).toContain('height: 1em')
  })

  it('supports tones, dot colors, pulse and decorative use', () => {
    const w = mount(MiLogo, { props: { tone: 'on-primary', dot: 'secondary', pulse: true, decorative: true } })
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-logo--on-primary', 'mi-logo--dot-secondary', 'mi-logo--pulse']))
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.attributes('role')).toBeUndefined()
    expect(w.attributes('aria-label')).toBeUndefined()
  })
})

describe('MiIcon', () => {
  it('renders a decorative svg by name', () => {
    const w = mount(MiIcon, { props: { name: 'home' } })
    expect(w.element.tagName.toLowerCase()).toBe('svg')
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.attributes('role')).toBeUndefined()
    expect(w.html()).toContain('M4 11l8-7 8 7')
  })

  it('exposes an accessible name when labelled', () => {
    const w = mount(MiIcon, { props: { name: 'search', label: 'Search' } })
    expect(w.attributes('role')).toBe('img')
    expect(w.attributes('aria-label')).toBe('Search')
    expect(w.attributes('aria-hidden')).toBeUndefined()
  })

  it('supports size, weight, filled, spin and raw markup', () => {
    const w = mount(MiIcon, { props: { svg: miiHome, size: 32, weight: 2.4, filled: true, spin: true } })
    expect(w.attributes('width')).toBe('32')
    expect(w.attributes('stroke-width')).toBe('2.4')
    expect(w.attributes('fill')).toBe('currentColor')
    expect(w.classes()).toContain('mi-icon--spin')
  })

  it('ships a non-empty markup for every name', () => {
    expect(miIconNames.length).toBeGreaterThan(55)
    for (const n of miIconNames) expect(miIcons[n].length).toBeGreaterThan(10)
  })
})

describe('MiText', () => {
  it.each([
    ['largeTitle', 'H1'], ['title1', 'H2'], ['title2', 'H3'], ['title3', 'H4'], ['headline', 'P'], ['body', 'P'],
    ['callout', 'P'], ['subheadline', 'P'], ['footnote', 'P'], ['caption', 'P'], ['caption2', 'P']
  ] as const)('maps %s to a semantic element', (variant, tag) => {
    const w = mount(MiText, { props: { variant }, slots: { default: 'Hello' } })
    expect(w.element.tagName).toBe(tag)
    expect(w.classes()).toContain(`mi-text--${variant}`)
    expect(w.text()).toBe('Hello')
  })

  it('applies tone, weight, alignment, clamp and element override', () => {
    const w = mount(MiText, { props: { as: 'span', tone: 'label2', weight: 'bold', align: 'center', lines: 2, tabular: true }, slots: { default: 'x' } })
    expect(w.element.tagName).toBe('SPAN')
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-text--tone-label2', 'mi-text--clamp', 'mi-text--tab']))
    const style = w.attributes('style') ?? ''
    expect(style).toContain('font-weight: 700')
    expect(style).toContain('text-align: center')
    expect(style).toContain('--mi-text-lines: 2')
  })
})

describe('MiSurface', () => {
  it('renders a card with default elevation', () => {
    const w = mount(MiSurface, { slots: { default: 'Body' } })
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-surface--card', 'mi-surface--e1', 'mi-surface--r-lg']))
    expect(w.find('.mi-surface__bg').exists()).toBe(false)
    expect(w.text()).toBe('Body')
  })

  it('renders elevated with explicit elevation and padding', () => {
    const w = mount(MiSurface, { props: { variant: 'elevated', elevation: 3, padding: 'lg', radius: 'capsule', as: 'section' } })
    expect(w.element.tagName).toBe('SECTION')
    expect(w.classes()).toEqual(expect.arrayContaining(['mi-surface--elevated', 'mi-surface--e3', 'mi-surface--p-lg', 'mi-surface--r-capsule']))
  })

  it.each(['ultra-thin', 'thin', 'regular', 'thick'] as const)('renders the %s material on a single hidden layer', (material) => {
    const w = mount(MiSurface, { props: { variant: 'material', material } })
    expect(w.classes()).toContain(`mi-surface--m-${material}`)
    const bg = w.find('.mi-surface__bg')
    expect(bg.exists()).toBe(true)
    expect(bg.attributes('aria-hidden')).toBe('true')
    expect(w.classes()).toContain('mi-surface--e0')
  })
})

describe('MiColorRamp', () => {
  it('derives nine stops from the base color', () => {
    const stops = miRamp('#0071E3')
    expect(stops.map(s => s.label)).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800'])
    expect(stops[5]!.color).toBe('#0071E3')
    expect(stops[0]!.color).not.toBe(stops[8]!.color)
  })

  it('renders a labelled list with accessible cells', () => {
    const w = mount(MiColorRamp, { props: { color: '#BF4800', label: 'Secondary ramp' } })
    expect(w.attributes('aria-label')).toBe('Secondary ramp')
    const cells = w.findAll('li')
    expect(cells).toHaveLength(9)
    expect(cells[5]!.text()).toContain('500')
    expect(cells[5]!.text()).toContain('#BF4800')
  })

  it('can hide the visible labels and falls back on invalid input', () => {
    const w = mount(MiColorRamp, { props: { color: 'nope', labels: false } })
    expect(w.find('.mi-ramp__label').exists()).toBe(false)
    expect(w.findAll('li')[5]!.text()).toContain('#0071E3')
  })
})

describe('MiThemeSwitcher', () => {
  it('renders a radiogroup with the current mode checked', () => {
    const w = mount(MiThemeSwitcher)
    expect(w.attributes('role')).toBe('radiogroup')
    const radios = w.findAll('[role=radio]')
    expect(radios.map(r => r.text())).toEqual(['Light', 'Dark', 'System'])
    expect(radios.map(r => r.attributes('aria-checked'))).toEqual(['false', 'false', 'true'])
    expect(radios.map(r => r.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
  })

  it('changes the mode on click and emits change', async () => {
    const w = mount(MiThemeSwitcher)
    await w.findAll('[role=radio]')[1]!.trigger('click')
    expect(setMode).toHaveBeenCalledWith('dark')
    expect(w.emitted('change')![0]).toEqual(['dark'])
    expect(w.findAll('[role=radio]')[1]!.attributes('aria-checked')).toBe('true')
  })

  it('supports arrow, Home and End keys with wrap-around', async () => {
    const w = mount(MiThemeSwitcher, { attachTo: document.body })
    await w.trigger('keydown', { key: 'ArrowRight' })
    expect(setMode).toHaveBeenLastCalledWith('light')
    await w.trigger('keydown', { key: 'ArrowLeft' })
    expect(setMode).toHaveBeenLastCalledWith('system')
    await w.trigger('keydown', { key: 'Home' })
    expect(setMode).toHaveBeenLastCalledWith('light')
    await w.trigger('keydown', { key: 'End' })
    expect(setMode).toHaveBeenLastCalledWith('system')
    w.unmount()
  })

  it('labels icon-only buttons for assistive tech', () => {
    const w = mount(MiThemeSwitcher, { props: { iconOnly: true } })
    expect(w.findAll('[role=radio]').map(r => r.attributes('aria-label'))).toEqual(['Light', 'Dark', 'System'])
  })
})

describe('MiColorPicker', () => {
  it('shows the current color and the primary presets', () => {
    const w = mount(MiColorPicker)
    expect((w.find('input').element as HTMLInputElement).value).toBe('#0071E3')
    const sw = w.findAll('[role=radio]')
    expect(sw).toHaveLength(4)
    expect(sw[0]!.attributes('aria-checked')).toBe('true')
    expect(w.find('[role=radiogroup]').attributes('aria-label')).toBe('Primary presets')
  })

  it('applies a preset swatch through setPrimary', async () => {
    const w = mount(MiColorPicker)
    await w.findAll('[role=radio]')[1]!.trigger('click')
    expect(setPrimary).toHaveBeenCalledWith('#5856D6')
    expect(w.emitted('change')![0]).toEqual(['#5856D6'])
  })

  it('edits the secondary color when targeted', async () => {
    const w = mount(MiColorPicker, { props: { target: 'secondary' } })
    expect(w.find('label').text()).toBe('Secondary')
    await w.findAll('[role=radio]')[2]!.trigger('click')
    expect(setSecondary).toHaveBeenCalledWith('#0A7E8C')
  })

  it('commits a typed hex on Enter and expands shorthand', async () => {
    const w = mount(MiColorPicker)
    const input = w.find('input')
    await input.setValue('#d30')
    await input.trigger('keydown', { key: 'Enter' })
    expect(setPrimary).toHaveBeenCalledWith('#DD3300')
  })

  it('flags invalid input and does not change the theme', async () => {
    const w = mount(MiColorPicker)
    const input = w.find('input')
    await input.setValue('zzz')
    await input.trigger('blur')
    expect(setPrimary).not.toHaveBeenCalled()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(w.find('[role=alert]').exists()).toBe(true)
    await input.trigger('keydown', { key: 'Escape' })
    expect(w.find('[role=alert]').exists()).toBe(false)
    expect((input.element as HTMLInputElement).value).toBe('#0071E3')
  })

  it('moves between swatches with arrow keys', async () => {
    const w = mount(MiColorPicker, { attachTo: document.body })
    await w.findAll('[role=radio]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(setPrimary).toHaveBeenLastCalledWith('#5856D6')
    await w.findAll('[role=radio]')[1]!.trigger('keydown', { key: 'End' })
    expect(setPrimary).toHaveBeenLastCalledWith('#D3006A')
    w.unmount()
  })
})
