import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiOrb from '~/components/Ai/MiOrb.vue'
import MiShimmerText from '~/components/Ai/MiShimmerText.vue'
import MiTrace from '~/components/Ai/MiTrace.vue'
import { MI_ORB_STATES, miOrbActiveCount, miOrbCount, miOrbEase, miOrbPoint, miOrbProject, miOrbSubscribe } from '~/utils/miOrb'
import type { MiOrbDot, MiOrbPoint } from '~/utils/miOrb'

const pt = (): MiOrbPoint => ({ x: 0, y: 0, z: 0, w: 0 })
const dot = (): MiOrbDot => ({ x: 0, y: 0, r: 0, a: 0 })

describe('miOrb engine', () => {
  it('scales the dot count with size and density, within bounds', () => {
    expect(miOrbCount(20)).toBeLessThan(miOrbCount(64))
    expect(miOrbCount(64, 2)).toBeGreaterThan(miOrbCount(64))
    expect(miOrbCount(4)).toBe(24)
    expect(miOrbCount(1000)).toBe(240)
  })

  it('keeps every state on or near the unit sphere with a positive weight', () => {
    for (const state of MI_ORB_STATES) {
      const n = miOrbCount(64)
      for (const t of [0, 0.7, 3.3]) {
        for (let i = 0; i < n; i++) {
          const p = miOrbPoint(state, i, n, t, pt())
          const len = Math.hypot(p.x, p.y, p.z)
          expect(len, `${state} #${i}`).toBeLessThan(1.3)
          expect(Number.isFinite(len)).toBe(true)
          expect(p.w, `${state} weight`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('is deterministic for a given time, and moves over time', () => {
    const a = miOrbPoint('thinking', 5, 100, 1, pt())
    const b = miOrbPoint('thinking', 5, 100, 1, pt())
    const c = miOrbPoint('working', 5, 100, 2, pt())
    const d = miOrbPoint('working', 5, 100, 2.5, pt())
    expect(a).toEqual(b)
    expect(c).not.toEqual(d)
  })

  it('projects inside the canvas with depth-shaded radius and alpha', () => {
    const size = 64
    for (const state of MI_ORB_STATES) {
      const n = miOrbCount(size)
      for (let i = 0; i < n; i++) {
        const d = miOrbProject(miOrbPoint(state, i, n, 1.5, pt()), state, 1.5, size, 1.5, dot())
        expect(d.x).toBeGreaterThanOrEqual(-2)
        expect(d.x).toBeLessThanOrEqual(size + 2)
        expect(d.y).toBeGreaterThanOrEqual(-2)
        expect(d.y).toBeLessThanOrEqual(size + 2)
        expect(d.a).toBeGreaterThan(0)
        expect(d.a).toBeLessThanOrEqual(1)
        expect(d.r).toBeGreaterThan(0)
      }
    }
    // Front dots read larger and stronger than back dots.
    const front = miOrbProject({ x: 0, y: 0, z: 1, w: 1 }, 'idle', 0, size, 1.5, dot())
    const back = miOrbProject({ x: 0, y: 0, z: -1, w: 1 }, 'idle', 0, size, 1.5, dot())
    expect(front.r).toBeGreaterThan(back.r)
    expect(front.a).toBeGreaterThan(back.a)
  })

  it('eases from 0 to 1 and clamps outside', () => {
    expect(miOrbEase(-1)).toBe(0)
    expect(miOrbEase(0.5)).toBeCloseTo(0.5)
    expect(miOrbEase(2)).toBe(1)
  })

  it('runs one shared frame loop for all subscribers', () => {
    const raf = vi.fn(() => 1)
    const caf = vi.fn()
    vi.stubGlobal('requestAnimationFrame', raf)
    vi.stubGlobal('cancelAnimationFrame', caf)
    const off1 = miOrbSubscribe(() => {})
    const off2 = miOrbSubscribe(() => {})
    expect(raf).toHaveBeenCalledTimes(1)
    expect(miOrbActiveCount()).toBe(2)
    off1()
    expect(caf).not.toHaveBeenCalled()
    off2()
    expect(caf).toHaveBeenCalledTimes(1)
    expect(miOrbActiveCount()).toBe(0)
    vi.unstubAllGlobals()
  })
})

describe('MiOrb', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders a sized canvas with a status role named after the state', () => {
    const w = mount(MiOrb, { props: { state: 'searching', size: 'lg' } })
    expect(w.attributes('role')).toBe('status')
    expect(w.attributes('aria-label')).toBe('Searching')
    expect(w.attributes('data-state')).toBe('searching')
    expect(w.attributes('style')).toContain('width: 64px')
    expect(w.find('canvas').attributes('aria-hidden')).toBe('true')
  })

  it('takes a custom label, or hides from assistive tech with an empty one', () => {
    expect(mount(MiOrb, { props: { label: 'Reading 4 files' } }).attributes('aria-label')).toBe('Reading 4 files')
    const hidden = mount(MiOrb, { props: { label: '' } })
    expect(hidden.attributes('role')).toBeUndefined()
    expect(hidden.attributes('aria-hidden')).toBe('true')
  })

  it('maps size presets and tones', () => {
    expect(mount(MiOrb, { props: { size: 'sm' } }).attributes('style')).toContain('width: 20px')
    expect(mount(MiOrb, { props: { size: 40 } }).attributes('style')).toContain('width: 40px')
    expect(mount(MiOrb, { props: { tone: 'secondary' } }).attributes('style')).toContain('var(--mi-s-text)')
    expect(mount(MiOrb, { props: { tone: 'inherit' } }).attributes('style')).not.toContain('var(--mi-')
  })

  it('does not start the loop under reduced motion', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
    const before = miOrbActiveCount()
    const w = mount(MiOrb)
    await nextTick()
    expect(miOrbActiveCount()).toBe(before)
    await w.setProps({ state: 'working' })
    expect(w.attributes('data-state')).toBe('working')
    w.unmount()
  })
})

describe('MiShimmerText', () => {
  it('renders the text once for assistive tech and a hidden highlight copy', () => {
    const w = mount(MiShimmerText, { props: { text: 'Thinking…' } })
    expect(w.find('.mi-shim__base').text()).toBe('Thinking…')
    expect(w.find('.mi-shim__win').attributes('aria-hidden')).toBe('true')
    expect(w.attributes('style')).toContain('--mi-shim-dur: 2.2s')
  })

  it('drops the sweep when paused and renders the slot over the text prop', () => {
    const w = mount(MiShimmerText, { props: { text: 'x', paused: true, as: 'p' }, slots: { default: 'Done in 4 s' } })
    expect(w.element.tagName).toBe('P')
    expect(w.find('.mi-shim__win').exists()).toBe(false)
    expect(w.text()).toBe('Done in 4 s')
  })
})

describe('MiTrace running step', () => {
  it('shows a decorative orb while a step runs', () => {
    const w = mount(MiTrace, { props: { steps: [{ title: 'Reading files', status: 'running' }, { title: 'Done step' }] } })
    const orb = w.findComponent(MiOrb)
    expect(orb.exists()).toBe(true)
    expect(orb.attributes('aria-hidden')).toBe('true')
    expect(w.text()).toContain('running')
  })
})
