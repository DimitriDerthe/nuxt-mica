// Frame-time probe. Usage: node scripts/fps.mjs <path> [baseUrl]
// Loads the page at 3 viewports, hovers/clicks interactive elements while sampling rAF deltas and long tasks.
import { chromium } from '@playwright/test'

const path = process.argv[2] ?? '/'
const base = process.argv[3] ?? 'http://localhost:3100'
const sizes = [{ n: 'mobile', width: 390, height: 844 }, { n: 'tablet', width: 820, height: 1180 }, { n: 'desktop', width: 1440, height: 900 }]
const browser = await chromium.launch()
let bad = false
for (const s of sizes) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, colorScheme: scheme })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(String(e)))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      window.__f = []; window.__lt = 0
      let last = performance.now()
      const tick = (t) => { window.__f.push(t - last); last = t; requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
      try { new PerformanceObserver(l => { window.__lt += l.getEntries().filter(e => e.duration > 50).length }).observe({ entryTypes: ['longtask'] }) } catch {}
    })
    const els = await page.$$('button:not([disabled]), [role=switch], [role=tab], summary, input[type=checkbox], input[type=radio]')
    for (const el of els.slice(0, 60)) {
      try { await el.scrollIntoViewIfNeeded({ timeout: 500 }); await el.hover({ timeout: 500 }); await page.waitForTimeout(40); await el.click({ timeout: 500, trial: false }); await page.waitForTimeout(60); await page.keyboard.press('Escape') } catch {}
    }
    for (let y = 0; y < 6; y++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(50) }
    const r = await page.evaluate(() => {
      const f = window.__f.slice(2).sort((a, b) => a - b)
      const p = q => f[Math.min(f.length - 1, Math.floor(f.length * q))] ?? 0
      return { frames: f.length, p50: +p(.5).toFixed(1), p95: +p(.95).toFixed(1), max: +f[f.length - 1]?.toFixed(1), longTasks: window.__lt }
    })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    const ok = r.p95 <= 20 && r.longTasks === 0 && !errors.length
    if (!ok) bad = true
    console.log(`${ok ? 'PASS' : 'FAIL'} ${path} ${s.n}/${scheme} p50=${r.p50}ms p95=${r.p95}ms max=${r.max}ms longTasks=${r.longTasks} hOverflow=${overflow} errors=${errors.length}${errors.length ? ' ' + errors[0].slice(0, 120) : ''}`)
    await ctx.close()
  }
}
await browser.close()
process.exit(bad ? 1 : 0)
