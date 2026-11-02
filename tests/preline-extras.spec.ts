import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MiDonutChart from '~/components/Charts/MiDonutChart.vue'
import MiScatterChart from '~/components/Charts/MiScatterChart.vue'
import MiCopyButton from '~/components/Buttons/MiCopyButton.vue'
import MiDevice from '~/components/Base/MiDevice.vue'
import MiConfetti from '~/components/Feedback/MiConfetti.vue'
import MiEditor from '~/components/Inputs/MiEditor.vue'
import { useMiConfetti, registerMiConfettiHost } from '~/composables/useMiConfetti'
import {
  miCreateParticles, miStepParticle, miUpdateParticles, miParticleAlpha, miParticleFlip, miOriginToPx, MI_CONFETTI_FALLBACK_COLORS
} from '~/utils/miConfetti'
import { miSanitizeHtml, miSafeUrl, miTextToHtml, miHtmlToText, miIsEmptyHtml, miEscapeHtml } from '~/utils/miSanitize'

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { queueMicrotask(() => cb(16)); return 1 })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = '' })

const tick = async () => { await Promise.resolve(); await flushPromises() }

/* ------------------------------------------------------------------ sanitizer */
describe('miSanitizeHtml', () => {
  it('keeps the allowed tags', () => {
    const html = '<h2>T</h2><h3>S</h3><p>a <strong>b</strong> <em>c</em> <u>d</u> <s>e</s> <code>f</code></p><ul><li>x</li></ul><ol><li>y</li></ol><blockquote>q</blockquote><pre>p</pre>'
    expect(miSanitizeHtml(html)).toBe(html)
  })
  it('keeps br as a void tag', () => {
    expect(miSanitizeHtml('a<br>b<br/>c</br>')).toBe('a<br>b<br>c<br>'.replace(/<br>$/, ''))
  })
  it('removes script elements with their content', () => {
    expect(miSanitizeHtml('<p>a</p><script>alert(1)</script><p>b</p>')).toBe('<p>a</p><p>b</p>')
    expect(miSanitizeHtml('<SCRIPT src=x></SCRIPT >hi')).toBe('hi')
    expect(miSanitizeHtml('<script>alert(1)')).toBe('')
  })
  it('removes style, iframe, object, embed, svg and math with content', () => {
    for (const t of ['style', 'iframe', 'object', 'embed', 'svg', 'math', 'noscript', 'template', 'textarea']) {
      expect(miSanitizeHtml(`a<${t}>evil</${t}>b`)).toBe('ab')
    }
  })
  it('strips event handler attributes', () => {
    expect(miSanitizeHtml('<p onclick="x()" onmouseover=y>t</p>')).toBe('<p>t</p>')
    expect(miSanitizeHtml('<img src=x onerror=alert(1)>t')).toBe('t')
    expect(miSanitizeHtml('<strong onload="a()" style="color:red" class="c">t</strong>')).toBe('<strong>t</strong>')
  })
  it('strips style and class attributes', () => {
    expect(miSanitizeHtml('<p style="position:fixed" class="x" id="y">t</p>')).toBe('<p>t</p>')
  })
  it('unwraps unknown tags but keeps their text', () => {
    expect(miSanitizeHtml('<span>a</span><font color=red>b</font><table><tr><td>c</td></tr></table>')).toBe('abc')
  })
  it('maps equivalent tags to the allowed ones', () => {
    expect(miSanitizeHtml('<b>a</b><i>b</i><strike>c</strike><del>d</del><div>e</div><h1>f</h1><h4>g</h4>')).toBe('<strong>a</strong><em>b</em><s>c</s><s>d</s><p>e</p><h2>f</h2><h3>g</h3>')
  })
  it('allows http, https and mailto links', () => {
    expect(miSanitizeHtml('<a href="https://x.dev/a?b=1&c=2">l</a>')).toBe('<a href="https://x.dev/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">l</a>')
    expect(miSanitizeHtml('<a href="http://x.dev">l</a>')).toContain('href="http://x.dev"')
    expect(miSanitizeHtml('<a href="mailto:a@b.co">l</a>')).toContain('href="mailto:a@b.co"')
  })
  it('drops javascript: URLs, keeping the link text', () => {
    expect(miSanitizeHtml('<a href="javascript:alert(1)">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="JaVaScRiPt:alert(1)">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href=" \tjava\nscript:alert(1)">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="&#106;avascript:alert(1)">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="&#x6A;&#x61;vascript&colon;alert(1)">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml("<a href='javascript:alert(1)'>l</a>")).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href=javascript:alert(1)>l</a>')).toBe('<a>l</a>')
  })
  it('drops data:, vbscript: and relative URLs', () => {
    expect(miSanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="vbscript:x">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="/relative">l</a>')).toBe('<a>l</a>')
    expect(miSanitizeHtml('<a href="//evil.com">l</a>')).toBe('<a>l</a>')
  })
  it('does not let a quote in href break out of the attribute', () => {
    const out = miSanitizeHtml('<a href="https://x.dev/&quot; onmouseover=&quot;alert(1)">l</a>')
    expect(out).not.toMatch(/ onmouseover=/)
    expect(out).toContain('&quot;')
  })
  it('ignores other attributes on links', () => {
    expect(miSanitizeHtml('<a href="https://x.dev" onclick="x()" target="_self" rel="x">l</a>')).toBe('<a href="https://x.dev" target="_blank" rel="noopener noreferrer">l</a>')
  })
  it('removes comments, doctype and processing instructions', () => {
    expect(miSanitizeHtml('a<!-- <script>x</script> -->b<!DOCTYPE html>c<?xml x?>d')).toBe('abcd')
    expect(miSanitizeHtml('a<!-- never closed')).toBe('a')
  })
  it('escapes stray angle brackets and keeps text safe', () => {
    expect(miSanitizeHtml('1 < 2 and 3 > 2')).toBe('1 &lt; 2 and 3 &gt; 2')
    expect(miSanitizeHtml('<p>a <b')).toBe('<p>a &lt;b</p>')
    expect(miSanitizeHtml('<<script>script>alert(1)<</script>/script>')).not.toMatch(/<script/i)
  })
  it('closes unclosed tags and ignores unmatched closing tags', () => {
    expect(miSanitizeHtml('<p><strong>a')).toBe('<p><strong>a</strong></p>')
    expect(miSanitizeHtml('a</p></strong>b')).toBe('ab')
    expect(miSanitizeHtml('<p><strong>a</p>b')).toBe('<p><strong>a</strong></p>b')
  })
  it('caps nesting depth', () => {
    const out = miSanitizeHtml('<blockquote>'.repeat(200) + 'x')
    expect((out.match(/<blockquote>/g) ?? []).length).toBeLessThanOrEqual(40)
    expect(out).toContain('x')
  })
  it('is idempotent', () => {
    const dirty = '<b>x</b><a href="https://a.co" onclick="y">z</a><script>q</script><div>d</div>1 < 2'
    const once = miSanitizeHtml(dirty)
    expect(miSanitizeHtml(once)).toBe(once)
  })
  it('handles non-string input', () => {
    expect(miSanitizeHtml(null)).toBe('')
    expect(miSanitizeHtml(undefined)).toBe('')
    expect(miSanitizeHtml(42 as unknown as string)).toBe('')
  })
  it('handles attributes containing > inside quotes', () => {
    expect(miSanitizeHtml('<p title="a>b" onclick="x">t</p>')).toBe('<p>t</p>')
    expect(miSanitizeHtml('<img title=">" src=x onerror=alert(1)>after')).toBe('after')
  })
  it('never yields a live script in a DOM', () => {
    const host = document.createElement('div')
    host.innerHTML = miSanitizeHtml('<img src=x onerror=alert(1)><svg onload=alert(1)><script>alert(1)</script><a href="javascript:alert(1)">x</a><p onmouseover=alert(1)>y</p>')
    expect(host.querySelector('script,img,svg,iframe')).toBeNull()
    expect(host.innerHTML).not.toMatch(/on\w+=|javascript:/i)
  })
})

describe('miSafeUrl and text helpers', () => {
  it('accepts only allowed protocols', () => {
    expect(miSafeUrl('https://a.co')).toBe('https://a.co')
    expect(miSafeUrl('MAILTO:a@b.co')).toBe('MAILTO:a@b.co')
    expect(miSafeUrl('ftp://a.co')).toBeNull()
    expect(miSafeUrl('')).toBeNull()
    expect(miSafeUrl('javascript:1')).toBeNull()
  })
  it('escapes HTML', () => {
    expect(miEscapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })
  it('converts plain text to paragraphs and line breaks', () => {
    expect(miTextToHtml('a\nb\n\nc <i>')).toBe('<p>a<br>b</p><p>c &lt;i&gt;</p>')
    expect(miTextToHtml('')).toBe('')
    expect(miTextToHtml('a\r\n\r\nb')).toBe('<p>a</p><p>b</p>')
  })
  it('extracts text and detects empty content', () => {
    expect(miHtmlToText('<p>a&amp;b</p><p>c<br>d</p>')).toBe('a&b\nc\nd')
    expect(miIsEmptyHtml('')).toBe(true)
    expect(miIsEmptyHtml('<p><br></p>')).toBe(true)
    expect(miIsEmptyHtml('<p> </p>')).toBe(true)
    expect(miIsEmptyHtml('<p>x</p>')).toBe(false)
    expect(miIsEmptyHtml(undefined)).toBe(true)
  })
})

/* ------------------------------------------------------------------ confetti engine */
describe('confetti engine', () => {
  const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]! }
  it('creates the requested number of particles at the origin', () => {
    const ps = miCreateParticles({ x: 10, y: 20, count: 30 })
    expect(ps).toHaveLength(30)
    expect(ps.every(p => p.x === 10 && p.y === 20 && p.age === 0)).toBe(true)
  })
  it('clamps count and returns nothing for 0', () => {
    expect(miCreateParticles({ x: 0, y: 0, count: 0 })).toHaveLength(0)
    expect(miCreateParticles({ x: 0, y: 0, count: -5 })).toHaveLength(0)
    expect(miCreateParticles({ x: 0, y: 0, count: 99999 })).toHaveLength(500)
  })
  it('is deterministic with an injected random source', () => {
    const a = miCreateParticles({ x: 0, y: 0, count: 5 }, seq([0.1, 0.9, 0.5]))
    const b = miCreateParticles({ x: 0, y: 0, count: 5 }, seq([0.1, 0.9, 0.5]))
    expect(a).toEqual(b)
  })
  it('points the burst up by default and respects spread 0', () => {
    const ps = miCreateParticles({ x: 0, y: 0, count: 10, spread: 0 }, () => 0.5)
    for (const p of ps) { expect(p.vy).toBeLessThan(0); expect(Math.abs(p.vx)).toBeLessThan(1e-6) }
  })
  it('uses the given colors, else the fallback palette', () => {
    expect(miCreateParticles({ x: 0, y: 0, count: 20, colors: ['#111'] }).every(p => p.color === '#111')).toBe(true)
    expect(miCreateParticles({ x: 0, y: 0, count: 20 }).every(p => MI_CONFETTI_FALLBACK_COLORS.includes(p.color))).toBe(true)
    expect(miCreateParticles({ x: 0, y: 0, count: 5, colors: [] }).every(p => MI_CONFETTI_FALLBACK_COLORS.includes(p.color))).toBe(true)
  })
  it('steps under gravity and ages the particle', () => {
    const [p] = miCreateParticles({ x: 0, y: 0, count: 1, spread: 0, speed: 0 }, () => 0.5)
    const y0 = p!.y
    miStepParticle(p!, 0.1, 1000)
    expect(p!.age).toBeCloseTo(0.1)
    expect(p!.vy).toBeGreaterThan(0)
    expect(p!.y).toBeGreaterThan(y0)
  })
  it('slows horizontal motion with drag', () => {
    const [p] = miCreateParticles({ x: 0, y: 0, count: 1, angle: 0, spread: 0, speed: 1000 }, () => 0.5)
    const v0 = p!.vx
    miStepParticle(p!, 0.5, 0)
    expect(p!.vx).toBeLessThan(v0)
    expect(p!.vx).toBeGreaterThan(0)
  })
  it('removes dead particles and reports the live count', () => {
    const ps = miCreateParticles({ x: 0, y: 0, count: 10, duration: 200 })
    expect(miUpdateParticles(ps, 0.016)).toBe(10)
    for (let i = 0; i < 40; i++) miUpdateParticles(ps, 0.05)
    expect(ps).toHaveLength(0)
    expect(miUpdateParticles(ps, 0.016)).toBe(0)
  })
  it('drops particles that fell below the floor', () => {
    const ps = miCreateParticles({ x: 0, y: 500, count: 5, spread: 0, speed: 0, duration: 10000 })
    for (let i = 0; i < 60 && ps.length; i++) miUpdateParticles(ps, 0.05, 900, 600)
    expect(ps).toHaveLength(0)
  })
  it('caps the time step so a stalled tab cannot teleport particles', () => {
    const [p] = miCreateParticles({ x: 0, y: 0, count: 1, duration: 10000 })
    miUpdateParticles([p!], 5)
    expect(p!.age).toBeLessThanOrEqual(0.05 + 1e-9)
  })
  it('fades out over the end of life', () => {
    const [p] = miCreateParticles({ x: 0, y: 0, count: 1 })
    expect(miParticleAlpha(p!)).toBe(1)
    p!.age = p!.life * 0.85
    expect(miParticleAlpha(p!)).toBeCloseTo(0.5, 1)
    p!.age = p!.life
    expect(miParticleAlpha(p!)).toBe(0)
  })
  it('keeps the flip factor within bounds', () => {
    const [p] = miCreateParticles({ x: 0, y: 0, count: 1 })
    for (let t = 0; t < 7; t += 0.3) { p!.tilt = t; const f = miParticleFlip(p!); expect(f).toBeGreaterThanOrEqual(0.15); expect(f).toBeLessThanOrEqual(1) }
  })
  it('converts ratios to pixels and clamps', () => {
    expect(miOriginToPx({ x: 0.5, y: 0.25 }, 800, 400)).toEqual({ x: 400, y: 100 })
    expect(miOriginToPx({ x: 2, y: -1 }, 800, 400)).toEqual({ x: 800, y: 0 })
    expect(miOriginToPx({ x: NaN, y: 0 }, 100, 100)).toEqual({ x: 50, y: 0 })
  })
})

/* ------------------------------------------------------------------ confetti component */
describe('MiConfetti and useMiConfetti', () => {
  function fakeCtx() {
    return new Proxy({ canvas: null } as Record<string, unknown>, {
      get: (t, k) => (k in t ? t[k as string] : vi.fn()),
      set: (t, k, v) => { t[k as string] = v; return true }
    })
  }
  it('renders an inert, hidden, fixed canvas', () => {
    const w = mount(MiConfetti)
    const c = w.get('canvas')
    expect(c.attributes('aria-hidden')).toBe('true')
    expect(c.attributes('class')).toContain('mi-confetti')
    w.unmount()
  })
  it('does nothing without a mounted host', () => {
    registerMiConfettiHost(null)
    expect(useMiConfetti().fire()).toBe(false)
  })
  it('draws a burst and stops its loop when the particles are gone', async () => {
    const ctx = fakeCtx()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
    let t = 0
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length })
    const w = mount(MiConfetti, { attachTo: document.body })
    expect(useMiConfetti().fire({ count: 12, duration: 300 })).toBe(true)
    expect(frames).toHaveLength(1)
    let guard = 0
    while (frames.length && guard++ < 200) { t += 50; frames.shift()!(t) }
    expect(guard).toBeLessThan(200)
    expect(frames).toHaveLength(0)
    w.unmount()
  })
  it('uses one rAF loop for overlapping bursts', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx() as unknown as CanvasRenderingContext2D)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length })
    const w = mount(MiConfetti)
    const { fire } = useMiConfetti()
    fire(); fire(); fire()
    expect(frames).toHaveLength(1)
    w.unmount()
  })
  it('accepts an element origin', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx() as unknown as CanvasRenderingContext2D)
    const w = mount(MiConfetti)
    const el = document.createElement('button')
    el.getBoundingClientRect = () => ({ left: 100, top: 50, width: 40, height: 20 } as DOMRect)
    expect(useMiConfetti().fire({ origin: el })).toBe(true)
    w.unmount()
  })
  it('is a no-op under prefers-reduced-motion', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeCtx() as unknown as CanvasRenderingContext2D)
    const w = mount(MiConfetti)
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
    expect(useMiConfetti().fire()).toBe(false)
    w.unmount()
  })
  it('unregisters its host on unmount', () => {
    const w = mount(MiConfetti)
    w.unmount()
    expect(useMiConfetti().fire()).toBe(false)
  })
})

/* ------------------------------------------------------------------ copy button */
describe('MiCopyButton', () => {
  function clipboard(impl: (t: string) => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(impl) }, configurable: true })
    return (navigator.clipboard as unknown as { writeText: ReturnType<typeof vi.fn> }).writeText
  }
  afterEach(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }) })

  it('renders a labelled button', () => {
    const w = mount(MiCopyButton, { props: { value: 'x' } })
    expect(w.get('button').attributes('type')).toBe('button')
    expect(w.text()).toContain('Copy')
    expect(w.find('[role="status"]').attributes('aria-live')).toBe('polite')
  })
  it('copies the value, swaps to the confirmation and emits copy', async () => {
    const write = clipboard(async () => {})
    const w = mount(MiCopyButton, { props: { value: 'hello', copiedLabel: 'Done' } })
    await w.get('button').trigger('click')
    await tick()
    expect(write).toHaveBeenCalledWith('hello')
    expect(w.emitted('copy')![0]).toEqual(['hello'])
    expect(w.get('button').classes()).toContain('is-copied')
    expect(w.text()).toContain('Done')
    expect(w.get('[role="status"]').text()).toBe('Done')
  })
  it('reverts after the timeout', async () => {
    vi.useFakeTimers()
    clipboard(async () => {})
    const w = mount(MiCopyButton, { props: { value: 'a', timeout: 500 } })
    await w.get('button').trigger('click')
    await vi.advanceTimersByTimeAsync(0)
    expect(w.get('button').classes()).toContain('is-copied')
    await vi.advanceTimersByTimeAsync(600)
    expect(w.get('button').classes()).not.toContain('is-copied')
    expect(w.get('[role="status"]').text()).toBe('')
    vi.useRealTimers()
  })
  it('prefers getValue, sync or async, over value', async () => {
    const write = clipboard(async () => {})
    const w = mount(MiCopyButton, { props: { value: 'no', getValue: async () => 'from fn' } })
    await w.get('button').trigger('click')
    await tick()
    expect(write).toHaveBeenCalledWith('from fn')
    expect(w.emitted('copy')![0]).toEqual(['from fn'])
  })
  it('falls back to a hidden textarea and execCommand without navigator.clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    const exec = vi.fn(() => true)
    ;(document as unknown as { execCommand: unknown }).execCommand = exec
    const w = mount(MiCopyButton, { props: { value: 'fallback text' }, attachTo: document.body })
    await w.get('button').trigger('click')
    await tick()
    expect(exec).toHaveBeenCalledWith('copy')
    expect(w.emitted('copy')).toBeTruthy()
    expect(document.querySelector('textarea')).toBeNull()
  })
  it('falls back when writeText rejects', async () => {
    clipboard(async () => { throw new Error('denied') })
    const exec = vi.fn(() => true)
    ;(document as unknown as { execCommand: unknown }).execCommand = exec
    const w = mount(MiCopyButton, { props: { value: 'x' } })
    await w.get('button').trigger('click')
    await tick()
    expect(exec).toHaveBeenCalled()
    expect(w.emitted('copy')).toBeTruthy()
  })
  it('emits error when every strategy fails', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    ;(document as unknown as { execCommand: unknown }).execCommand = vi.fn(() => false)
    const w = mount(MiCopyButton, { props: { value: 'x' } })
    await w.get('button').trigger('click')
    await tick()
    expect(w.emitted('error')).toBeTruthy()
    expect(w.emitted('copy')).toBeFalsy()
    expect(w.get('button').classes()).not.toContain('is-copied')
  })
  it('emits error when getValue throws', async () => {
    const w = mount(MiCopyButton, { props: { getValue: () => { throw new Error('boom') } } })
    await w.get('button').trigger('click')
    await tick()
    expect(w.emitted('error')).toBeTruthy()
  })
  it('keeps an accessible name when icon only', () => {
    const w = mount(MiCopyButton, { props: { value: 'x', iconOnly: true, label: 'Copy link' } })
    expect(w.get('button').attributes('aria-label')).toBe('Copy link')
    expect(w.find('.mi-copy__text').exists()).toBe(false)
  })
  it('does nothing when disabled', async () => {
    const write = clipboard(async () => {})
    const w = mount(MiCopyButton, { props: { value: 'x', disabled: true } })
    await w.get('button').trigger('click')
    expect(write).not.toHaveBeenCalled()
    expect(w.get('button').attributes('disabled')).toBeDefined()
  })
  it('copies an empty string when no value is given', async () => {
    const write = clipboard(async () => {})
    const w = mount(MiCopyButton)
    await w.get('button').trigger('click')
    await tick()
    expect(write).toHaveBeenCalledWith('')
  })
})

/* ------------------------------------------------------------------ device */
describe('MiDevice', () => {
  it('renders the slot inside the screen', () => {
    const w = mount(MiDevice, { slots: { default: '<p class="c">hi</p>' } })
    expect(w.get('.mi-dev__screen .c').text()).toBe('hi')
    expect(w.classes()).toContain('mi-dev--phone')
  })
  it.each(['phone', 'tablet', 'laptop', 'browser'] as const)('supports %s', (device) => {
    const w = mount(MiDevice, { props: { device } })
    expect(w.classes()).toContain(`mi-dev--${device}`)
    expect(w.find('.mi-dev__base').exists()).toBe(device === 'laptop')
    expect(w.find('.mi-dev__bar').exists()).toBe(device === 'browser')
  })
  it('applies landscape to phone and tablet only', () => {
    expect(mount(MiDevice, { props: { device: 'phone', orientation: 'landscape' } }).classes()).toContain('is-landscape')
    expect(mount(MiDevice, { props: { device: 'tablet', orientation: 'landscape' } }).classes()).toContain('is-landscape')
    expect(mount(MiDevice, { props: { device: 'laptop', orientation: 'landscape' } }).classes()).not.toContain('is-landscape')
  })
  it('shows the host of the url in the browser bar', () => {
    const w = mount(MiDevice, { props: { device: 'browser', url: 'https://mica.dev/app/' } })
    expect(w.get('.mi-dev__url').text()).toBe('mica.dev/app')
  })
  it('exposes a labelled group only when labelled', () => {
    expect(mount(MiDevice).attributes('role')).toBeUndefined()
    const w = mount(MiDevice, { props: { label: 'App preview' } })
    expect(w.attributes('role')).toBe('group')
    expect(w.attributes('aria-label')).toBe('App preview')
  })
  it('sets the max width from the prop or the device default', () => {
    expect(mount(MiDevice, { props: { maxWidth: 222 } }).attributes('style')).toContain('222px')
    expect(mount(MiDevice, { props: { device: 'laptop' } }).attributes('style')).toContain('900px')
  })
  it('applies the bezel tone class', () => {
    expect(mount(MiDevice, { props: { tone: 'light' } }).classes()).toContain('mi-dev--light')
  })
})

/* ------------------------------------------------------------------ donut */
const channels = [
  { label: 'Direct', value: 50 },
  { label: 'Search', value: 30 },
  { label: 'Social', value: 20 }
]
describe('MiDonutChart', () => {
  it('draws one segment per positive value with an accessible description', () => {
    const w = mount(MiDonutChart, { props: { data: channels } })
    expect(w.findAll('circle.mi-dc-seg-c')).toHaveLength(3)
    const img = w.get('svg[role="img"]')
    expect(img.attributes('aria-label')).toContain('Direct 50%')
    expect(w.get('[role="group"]').attributes('aria-label')).toContain('arrow keys')
  })
  it('sizes segments as shares of the circle', () => {
    const w = mount(MiDonutChart, { props: { data: channels, gap: 0 } })
    const lens = w.findAll('circle.mi-dc-seg-c').map(c => Number(c.attributes('stroke-dasharray')!.split(' ')[0]))
    expect(lens).toEqual([50, 30, 20])
  })
  it('leaves a gap between segments', () => {
    const w = mount(MiDonutChart, { props: { data: channels, gap: 6 } })
    const lens = w.findAll('circle.mi-dc-seg-c').map(c => Number(c.attributes('stroke-dasharray')!.split(' ')[0]))
    expect(lens[0]!).toBeLessThan(50)
  })
  it('skips zero and negative values but keeps them in the legend', () => {
    const w = mount(MiDonutChart, { props: { data: [...channels, { label: 'None', value: 0 }, { label: 'Neg', value: -4 }] } })
    expect(w.findAll('circle.mi-dc-seg-c')).toHaveLength(3)
    expect(w.findAll('.mi-lg-row')).toHaveLength(5)
  })
  it('shows the total in the center and the highlighted segment on hover', async () => {
    const w = mount(MiDonutChart, { props: { data: channels, unit: '$' } })
    expect(w.get('.mi-dc-big').text()).toBe('100$')
    await w.get('circle[data-i="1"]').trigger('pointermove')
    await tick()
    expect(w.get('.mi-dc-big').text()).toBe('30$')
    expect(w.get('.mi-dc-cap').text()).toBe('Search')
    expect(w.findAll('circle.is-on')).toHaveLength(1)
    expect(w.emitted('hover')![0]).toEqual([1])
    await w.get('[role="group"]').trigger('pointerleave')
    await tick()
    expect(w.get('.mi-dc-big').text()).toBe('100$')
  })
  it('highlights with the keyboard and announces the segment', async () => {
    const w = mount(MiDonutChart, { props: { data: channels } })
    const g = w.get('[role="group"]')
    expect(g.attributes('tabindex')).toBe('0')
    await g.trigger('keydown', { key: 'ArrowRight' })
    expect(w.findAll('circle.is-on')).toHaveLength(1)
    expect(w.get('[role="status"]').text()).toContain('Direct')
    await g.trigger('keydown', { key: 'End' })
    expect(w.get('[role="status"]').text()).toContain('Social')
    await g.trigger('keydown', { key: 'ArrowRight' })
    expect(w.get('[role="status"]').text()).toContain('Direct')
    await g.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.get('[role="status"]').text()).toContain('Social')
    await g.trigger('keydown', { key: 'Escape' })
    expect(w.findAll('circle.is-on')).toHaveLength(0)
  })
  it('syncs the highlight with the legend (v-model:active)', async () => {
    const w = mount(MiDonutChart, { props: { data: channels, active: -1, 'onUpdate:active': (v: number) => w.setProps({ active: v }) } })
    await w.findAll('.mi-lg-row')[2]!.trigger('pointerenter')
    expect(w.findAll('circle.is-on')).toHaveLength(1)
    expect(w.get('circle.is-on').attributes('data-i')).toBe('2')
  })
  it('renders a pie without a center and with a tooltip on hover', async () => {
    const w = mount(MiDonutChart, { props: { data: channels, variant: 'pie' } })
    expect(w.find('.mi-dc-center').exists()).toBe(false)
    expect(w.get('circle.mi-dc-seg-c').attributes('stroke-width')).toBe(String(110 - 2))
    await w.get('circle[data-i="0"]').trigger('pointermove')
    await tick()
    expect(w.get('.mi-dc-tip').text()).toContain('Direct')
  })
  it('draws value labels only on large enough segments', () => {
    const w = mount(MiDonutChart, { props: { data: [{ label: 'A', value: 95 }, { label: 'B', value: 5 }], valueLabels: 'percent' } })
    expect(w.findAll('.mi-dc-lbl')).toHaveLength(1)
    expect(w.get('.mi-dc-lbl').text()).toBe('95%')
    const v = mount(MiDonutChart, { props: { data: channels, valueLabels: 'value', unit: 'k' } })
    expect(v.findAll('.mi-dc-lbl').map(t => t.text())).toEqual(['50k', '30k', '20k'])
  })
  it('uses explicit colors and the shared palette otherwise', () => {
    const w = mount(MiDonutChart, { props: { data: [{ label: 'A', value: 1, color: 'rgb(1, 2, 3)' }, { label: 'B', value: 1 }] } })
    const cs = w.findAll('circle.mi-dc-seg-c')
    expect(cs[0]!.attributes('style')).toContain('rgb(1, 2, 3)')
    expect(cs[1]!.attributes('style')).toContain('--mi-s')
  })
  it('toggles to an accessible table', async () => {
    const w = mount(MiDonutChart, { props: { data: channels } })
    await w.findAll('[role="radio"]')[1]!.trigger('click')
    expect(w.find('svg').exists()).toBe(false)
    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(rows[0]!.text()).toContain('Direct')
    expect(rows[0]!.text()).toContain('50%')
    expect(w.emitted('update:view')![0]).toEqual(['table'])
  })
  it('switches view with arrow keys on the toggle', async () => {
    const w = mount(MiDonutChart, { props: { data: channels }, attachTo: document.body })
    await w.get('[role="radiogroup"]').trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:view')![0]).toEqual(['table'])
  })
  it('hides the toggle and legend when asked', () => {
    const w = mount(MiDonutChart, { props: { data: channels, toggle: false, legend: false } })
    expect(w.find('[role="radiogroup"]').exists()).toBe(false)
    expect(w.find('.mi-lg-list').exists()).toBe(false)
  })
  it('handles empty and all-zero data', () => {
    for (const data of [[], [{ label: 'A', value: 0 }]]) {
      const w = mount(MiDonutChart, { props: { data } })
      expect(w.findAll('circle.mi-dc-seg-c')).toHaveLength(0)
      expect(w.text()).toContain('No data')
      expect(w.get('svg').attributes('aria-label')).toContain('no data')
    }
  })
  it('handles a single segment and non-finite values', () => {
    const w = mount(MiDonutChart, { props: { data: [{ label: 'A', value: 10 }, { label: 'B', value: NaN }] } })
    const segs = w.findAll('circle.mi-dc-seg-c')
    expect(segs).toHaveLength(1)
    expect(segs[0]!.attributes('stroke-dasharray')).toBe('100 0')
  })
  it('renders the center slot with the highlighted segment', async () => {
    const w = mount(MiDonutChart, { props: { data: channels }, slots: { center: `<template #center="{ active, total }"><b class="cs">{{ active ? active.label : total }}</b></template>` } })
    expect(w.get('.cs').text()).toBe('100')
    await w.get('circle[data-i="2"]').trigger('pointermove')
    await tick()
    expect(w.get('.cs').text()).toBe('Social')
  })
  it('honours formatValue and a custom aria label', () => {
    const w = mount(MiDonutChart, { props: { data: channels, formatValue: (v: number) => `#${v}`, ariaLabel: 'Custom' } })
    expect(w.get('.mi-dc-big').text()).toBe('#100')
    expect(w.get('svg').attributes('aria-label')).toBe('Custom')
  })
})

/* ------------------------------------------------------------------ scatter */
const sc = [
  { name: 'A', points: [{ x: 1, y: 10 }, { x: 4, y: 30 }, { x: 9, y: 22 }] },
  { name: 'B', points: [{ x: 2, y: 5 }, { x: 7, y: 40 }] }
]
describe('MiScatterChart', () => {
  it('draws a point and a hit target per data point', () => {
    const w = mount(MiScatterChart, { props: { series: sc } })
    expect(w.findAll('circle.mi-sc-dot')).toHaveLength(5)
    expect(w.findAll('.mi-sc-hits circle')).toHaveLength(5)
    expect(w.get('svg[role="img"]').attributes('aria-label')).toContain('Scatter chart')
    expect(w.get('svg[role="img"]').attributes('aria-label')).toContain('A: 3 points')
  })
  it('draws axes with nice ticks', () => {
    const w = mount(MiScatterChart, { props: { series: sc, xLabel: 'Days', yLabel: 'Score', yUnit: '%' } })
    const labels = w.findAll('text.mi-sc-axis').map(t => t.text())
    expect(labels).toContain('Days')
    expect(labels).toContain('Score')
    expect(labels.some(l => l === '40%' || l === '50%')).toBe(true)
    expect(labels).toContain('0%')
  })
  it('turns into a bubble chart when points have a size', () => {
    const w = mount(MiScatterChart, { props: { series: [{ name: 'S', points: [{ x: 1, y: 1, r: 10 }, { x: 2, y: 2, r: 40 }] }], maxRadius: 20 } })
    expect(w.get('svg').attributes('aria-label')).toContain('Bubble chart')
    const radii = w.findAll('circle.mi-sc-dot').map(c => Number(c.attributes('r'))).sort((a, b) => a - b)
    expect(radii[1]).toBe(20)
    expect(radii[0]).toBeLessThan(20)
    expect(radii[0]).toBeGreaterThanOrEqual(4)
  })
  it('uses the plain dot size without sizes', () => {
    const w = mount(MiScatterChart, { props: { series: sc, dotSize: 7 } })
    expect(new Set(w.findAll('circle.mi-sc-dot').map(c => c.attributes('r')))).toEqual(new Set(['7']))
  })
  it('shows a tooltip on hover and emits hover', async () => {
    const w = mount(MiScatterChart, { props: { series: sc, xLabel: 'Day', yLabel: 'Score' } })
    const hit = w.findAll('.mi-sc-hits circle')[0]!
    await hit.trigger('pointermove')
    await tick()
    expect(w.get('.mi-sc-tip').classes()).toContain('is-on')
    expect(w.get('.mi-sc-tip').text()).toContain('A')
    expect(w.emitted('hover')!.at(-1)![0]).toMatchObject({ series: expect.any(Number), index: expect.any(Number) })
    await w.get('[role="group"]').trigger('pointerleave')
    await tick()
    expect(w.get('.mi-sc-tip').classes()).not.toContain('is-on')
    expect(w.emitted('hover')!.at(-1)).toEqual([null])
  })
  it('reads points left to right with the keyboard', async () => {
    const w = mount(MiScatterChart, { props: { series: sc } })
    const g = w.get('[role="group"]')
    await g.trigger('keydown', { key: 'ArrowRight' })
    expect(w.get('[role="status"]').text()).toContain('A: 1, 10')
    await g.trigger('keydown', { key: 'ArrowRight' })
    expect(w.get('[role="status"]').text()).toContain('B: 2, 5')
    await g.trigger('keydown', { key: 'End' })
    expect(w.get('[role="status"]').text()).toContain('A: 9, 22')
    await g.trigger('keydown', { key: 'Home' })
    expect(w.get('[role="status"]').text()).toContain('A: 1, 10')
    await g.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.get('[role="status"]').text()).toContain('A: 1, 10')
    await g.trigger('keydown', { key: 'Escape' })
    expect(w.get('.mi-sc-tip').classes()).not.toContain('is-on')
  })
  it('lists a legend for several series only', () => {
    expect(mount(MiScatterChart, { props: { series: sc } }).find('.mi-lg-inline').exists()).toBe(true)
    expect(mount(MiScatterChart, { props: { series: [sc[0]!], toggle: false } }).find('.mi-lg-inline').exists()).toBe(false)
  })
  it('toggles to a table including sizes', async () => {
    const w = mount(MiScatterChart, { props: { series: [{ name: 'S', points: [{ x: 1, y: 2, r: 3 }] }], xLabel: 'X axis', sizeLabel: 'Volume' } })
    await w.findAll('[role="radio"]')[1]!.trigger('click')
    const heads = w.findAll('thead th').map(t => t.text())
    expect(heads).toEqual(['Series', 'X axis', 'Y', 'Volume'])
    expect(w.get('tbody tr').text()).toContain('S')
  })
  it('handles empty series and non-finite points', () => {
    const w = mount(MiScatterChart, { props: { series: [] } })
    expect(w.findAll('circle.mi-sc-dot')).toHaveLength(0)
    const v = mount(MiScatterChart, { props: { series: [{ name: 'A', points: [{ x: NaN, y: 1 }, { x: 1, y: 1 }] }] } })
    expect(v.findAll('circle.mi-sc-dot')).toHaveLength(1)
  })
  it('handles a single point and identical values', () => {
    const w = mount(MiScatterChart, { props: { series: [{ name: 'A', points: [{ x: 5, y: 5 }, { x: 5, y: 5 }] }] } })
    expect(w.findAll('circle.mi-sc-dot')).toHaveLength(2)
    expect(w.html()).not.toContain('NaN')
  })
  it('supports negative values', () => {
    const w = mount(MiScatterChart, { props: { series: [{ name: 'A', points: [{ x: -10, y: -5 }, { x: 10, y: 5 }] }] } })
    const labels = w.findAll('text.mi-sc-axis').map(t => t.text())
    expect(labels.some(l => l.startsWith('-'))).toBe(true)
    expect(w.html()).not.toContain('NaN')
  })
})

/* ------------------------------------------------------------------ editor */
describe('MiEditor', () => {
  let exec: ReturnType<typeof vi.fn>
  beforeEach(() => {
    exec = vi.fn(() => true)
    ;(document as unknown as { execCommand: unknown }).execCommand = exec
    ;(document as unknown as { queryCommandState: unknown }).queryCommandState = vi.fn(() => false)
    ;(document as unknown as { queryCommandValue: unknown }).queryCommandValue = vi.fn(() => 'p')
  })
  const surface = (w: ReturnType<typeof mount>) => w.get('[role="textbox"]')

  it('exposes a labelled multiline textbox', () => {
    const w = mount(MiEditor, { props: { label: 'Body', placeholder: 'Write...' } })
    const s = surface(w)
    expect(s.attributes('aria-multiline')).toBe('true')
    expect(s.attributes('aria-label')).toBe('Body')
    expect(s.attributes('contenteditable')).toBe('true')
    expect(s.attributes('aria-placeholder')).toBe('Write...')
    expect(s.attributes('tabindex')).toBe('0')
  })
  it('sanitizes the initial value', () => {
    const w = mount(MiEditor, { props: { modelValue: '<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)>' } })
    expect(surface(w).html()).toContain('<p>ok</p>')
    expect(surface(w).element.querySelector('script,img')).toBeNull()
  })
  it('flags the empty state for the placeholder', async () => {
    const w = mount(MiEditor, { props: { modelValue: '', placeholder: 'Type' } })
    expect(surface(w).attributes('data-empty')).toBe('true')
    expect(surface(w).attributes('data-placeholder')).toBe('Type')
    await w.setProps({ modelValue: '<p>x</p>' })
    expect(surface(w).attributes('data-empty')).toBeUndefined()
  })
  it('emits sanitized HTML on input', async () => {
    const w = mount(MiEditor, { props: { modelValue: '' } })
    surface(w).element.innerHTML = '<b onclick="x()">hi</b><script>alert(1)</script><div>line</div>'
    await surface(w).trigger('input')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['<strong>hi</strong><p>line</p>'])
  })
  it('replaces the content when the model changes from outside', async () => {
    const w = mount(MiEditor, { props: { modelValue: '<p>a</p>' } })
    await w.setProps({ modelValue: '<p>b</p><script>x</script>' })
    expect(surface(w).html()).toContain('<p>b</p>')
    expect(surface(w).html()).not.toContain('script')
  })
  it('does not rewrite the DOM for its own updates', async () => {
    const w = mount(MiEditor, { props: { modelValue: '', 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) } })
    const el = surface(w).element
    el.innerHTML = '<p>typing</p>'
    const node = el.firstChild
    await surface(w).trigger('input')
    await tick()
    expect(el.firstChild).toBe(node)
  })
  it('renders the formatting toolbar with named buttons', () => {
    const w = mount(MiEditor)
    const tb = w.get('[role="toolbar"]')
    const names = tb.findAll('button').map(b => b.attributes('aria-label'))
    expect(names).toEqual(['Bold', 'Italic', 'Underline', 'Strikethrough', 'Heading 2', 'Heading 3', 'Bulleted list', 'Numbered list', 'Quote', 'Code', 'Link', 'Undo', 'Redo', 'Clear formatting'])
    expect(tb.get('[aria-label="Bold"]').attributes('aria-pressed')).toBe('false')
    expect(tb.get('[aria-label="Undo"]').attributes('aria-pressed')).toBeUndefined()
  })
  it('hides the toolbar when asked', () => {
    expect(mount(MiEditor, { props: { toolbar: false } }).find('[role="toolbar"]').exists()).toBe(false)
  })
  it('runs formatting commands from the toolbar', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await w.get('[aria-label="Bold"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('bold', false, undefined)
    await w.get('[aria-label="Italic"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('italic', false, undefined)
    await w.get('[aria-label="Underline"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('underline', false, undefined)
    await w.get('[aria-label="Strikethrough"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('strikeThrough', false, undefined)
    await w.get('[aria-label="Heading 2"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('formatBlock', false, '<h2>')
    await w.get('[aria-label="Quote"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('formatBlock', false, '<blockquote>')
    await w.get('[aria-label="Bulleted list"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('insertUnorderedList', false, undefined)
    await w.get('[aria-label="Numbered list"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('insertOrderedList', false, undefined)
    await w.get('[aria-label="Undo"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('undo', false, undefined)
    await w.get('[aria-label="Redo"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('redo', false, undefined)
    await w.get('[aria-label="Clear formatting"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('removeFormat', false, undefined)
    w.unmount()
  })
  it('toggles a heading back to a paragraph', async () => {
    ;(document as unknown as { queryCommandValue: unknown }).queryCommandValue = vi.fn(() => 'h2')
    const w = mount(MiEditor, { attachTo: document.body })
    await w.get('[aria-label="Heading 2"]').trigger('click')
    expect(exec).toHaveBeenCalledWith('formatBlock', false, '<p>')
    w.unmount()
  })
  it('supports Cmd/Ctrl+B, I and U shortcuts', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await surface(w).trigger('keydown', { key: 'b', ctrlKey: true })
    expect(exec).toHaveBeenCalledWith('bold', false, undefined)
    await surface(w).trigger('keydown', { key: 'I', metaKey: true })
    expect(exec).toHaveBeenCalledWith('italic', false, undefined)
    await surface(w).trigger('keydown', { key: 'u', ctrlKey: true })
    expect(exec).toHaveBeenCalledWith('underline', false, undefined)
    exec.mockClear()
    await surface(w).trigger('keydown', { key: 'b' })
    await surface(w).trigger('keydown', { key: 'b', ctrlKey: true, shiftKey: true })
    expect(exec).not.toHaveBeenCalledWith('bold', false, undefined)
    w.unmount()
  })
  it('opens the link field with Cmd/Ctrl+K and applies a safe link', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await surface(w).trigger('keydown', { key: 'k', metaKey: true })
    await tick()
    const input = w.get('input')
    expect(input.attributes('aria-label')).toBe('Link address')
    await input.setValue('example.com')
    await w.get('form').trigger('submit')
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<a href="https://example.com">https://example.com</a>')
    expect(w.find('form').exists()).toBe(false)
    w.unmount()
  })
  it('rejects javascript: links', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await w.get('[aria-label="Link"]').trigger('click')
    await tick()
    await w.get('input').setValue('javascript:alert(1)')
    await w.get('form').trigger('submit')
    expect(w.get('input').attributes('aria-invalid')).toBe('true')
    expect(exec).not.toHaveBeenCalledWith('createLink', expect.anything(), expect.anything())
    expect(exec).not.toHaveBeenCalledWith('insertHTML', expect.anything(), expect.stringContaining('javascript'))
    w.unmount()
  })
  it('closes the link field with Escape', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await w.get('[aria-label="Link"]').trigger('click')
    await tick()
    await w.get('form').trigger('keydown', { key: 'Escape' })
    expect(w.find('form').exists()).toBe(false)
    w.unmount()
  })
  it('pastes sanitized HTML', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    const data = { getData: (t: string) => (t === 'text/html' ? '<p>hi</p><script>alert(1)</script><span onclick="x">s</span>' : 'hi') }
    await surface(w).trigger('paste', { clipboardData: data })
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>hi</p>s')
    w.unmount()
  })
  it('pastes plain text as escaped paragraphs in text mode', async () => {
    const w = mount(MiEditor, { props: { pasteMode: 'text' }, attachTo: document.body })
    const data = { getData: (t: string) => (t === 'text/html' ? '<b>rich</b>' : 'a <b>\n\nb') }
    await surface(w).trigger('paste', { clipboardData: data })
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>a &lt;b&gt;</p><p>b</p>')
    w.unmount()
  })
  it('drops text only, never markup', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    await surface(w).trigger('drop', { dataTransfer: { getData: (t: string) => (t === 'text/plain' ? '<img src=x onerror=1>' : '<img src=x onerror=1>') } })
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>&lt;img src=x onerror=1&gt;</p>')
    w.unmount()
  })
  it('is not editable when readonly, but stays focusable', async () => {
    const w = mount(MiEditor, { props: { readonly: true, modelValue: '<p>x</p>' } })
    expect(surface(w).attributes('contenteditable')).toBe('false')
    expect(surface(w).attributes('aria-readonly')).toBe('true')
    expect(surface(w).attributes('tabindex')).toBe('0')
    expect(w.get('[aria-label="Bold"]').attributes('disabled')).toBeDefined()
    await surface(w).trigger('keydown', { key: 'b', ctrlKey: true })
    expect(exec).not.toHaveBeenCalledWith('bold', false, undefined)
  })
  it('blocks everything when disabled', async () => {
    const w = mount(MiEditor, { props: { disabled: true } })
    expect(surface(w).attributes('aria-disabled')).toBe('true')
    expect(surface(w).attributes('contenteditable')).toBe('false')
    expect(surface(w).attributes('tabindex')).toBeUndefined()
    expect(w.findAll('[role="toolbar"] button').every(b => b.attributes('disabled') !== undefined)).toBe(true)
    await surface(w).trigger('paste', { clipboardData: { getData: () => 'x' } })
    expect(exec).not.toHaveBeenCalled()
  })
  it('applies min and max height', () => {
    const w = mount(MiEditor, { props: { minHeight: 220, maxHeight: '40vh' } })
    const style = surface(w).attributes('style')!
    expect(style).toContain('min-height: 220px')
    expect(style).toContain('max-height: 40vh')
  })
  it('marks invalid', () => {
    expect(surface(mount(MiEditor, { props: { invalid: true } })).attributes('aria-invalid')).toBe('true')
  })
  it('moves between toolbar buttons with arrow keys (roving tabindex)', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    const btns = () => w.findAll('[role="toolbar"] button')
    expect(btns().map(b => b.attributes('tabindex')).filter(t => t === '0')).toHaveLength(1)
    ;(btns()[0]!.element as HTMLElement).focus()
    await w.get('[role="toolbar"]').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(btns()[1]!.element)
    await w.get('[role="toolbar"]').trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(btns().at(-1)!.element)
    await w.get('[role="toolbar"]').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(btns()[0]!.element)
    w.unmount()
  })
  it('keeps the selection in the editor when pressing toolbar buttons', () => {
    const w = mount(MiEditor)
    const ev = new MouseEvent('mousedown', { cancelable: true, bubbles: true })
    w.get('[role="toolbar"]').element.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
  })
  it('reflects the selection state in aria-pressed', async () => {
    ;(document as unknown as { queryCommandState: unknown }).queryCommandState = vi.fn((c: string) => c === 'bold')
    const w = mount(MiEditor, { props: { modelValue: '<p>text</p>' }, attachTo: document.body })
    const el = surface(w).element
    const range = document.createRange()
    range.selectNodeContents(el.querySelector('p')!)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    await tick()
    await tick()
    expect(w.get('[aria-label="Bold"]').attributes('aria-pressed')).toBe('true')
    expect(w.get('[aria-label="Italic"]').attributes('aria-pressed')).toBe('false')
    w.unmount()
  })
  it('normalises the DOM to sanitized HTML on blur', async () => {
    const w = mount(MiEditor, { attachTo: document.body })
    surface(w).element.innerHTML = '<b>x</b><style>x</style>'
    await surface(w).trigger('blur')
    expect(surface(w).element.innerHTML).toBe('<strong>x</strong>')
    w.unmount()
  })
})
