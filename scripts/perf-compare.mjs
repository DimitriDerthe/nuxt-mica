// Page cost of two static builds of the site, side by side: bytes the browser loads (gzip-estimated) and the
// main-thread time spent on style, layout and script, as reported by Chrome's performance metrics.
//
//   node scripts/perf-compare.mjs <originA>=<dirA> <originB>=<dirB> [runs=5] [path…]
//
// Each origin serves the static build in its directory; sizes are the gzip size of each file the page loaded.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium } from '@playwright/test'

const [specA, specB, runsArg, ...paths] = process.argv.slice(2)
const [a, dirA] = specA.split('=')
const [b, dirB] = specB.split('=')
const DIR = { [new URL(a).origin]: dirA, [new URL(b).origin]: dirB }
const gz = new Map()
function gzipOf(href) {
  const u = new URL(href)
  let f = join(DIR[u.origin], decodeURIComponent(u.pathname))
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html')
  if (!existsSync(f)) return 0
  if (!gz.has(f)) gz.set(f, gzipSync(readFileSync(f)).length)
  return gz.get(f)
}
const runs = +(runsArg ?? 5)
const PAGES = paths.length ? paths : [
  '/', '/components', '/components/button', '/components/data-table', '/blocks',
  '/blocks/analytics/kpi-cards', '/blocks/tables/user-contact-tables', '/blocks/application-pages/admin-dashboard-pages',
  '/blocks/forms/advanced-forms', '/blocks/navigation/dashboard-sidebars'
]

async function measure(page, cdp, url) {
  const bytes = { css: 0, js: 0, html: 0 }
  await cdp.send('Performance.enable')
  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'networkidle' })
  if (await page.locator('.bf__frame').count()) await page.waitForFunction(() => !document.querySelector('.bf__spin'))
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  const wall = Date.now() - t0
  const { metrics } = await cdp.send('Performance.getMetrics')
  const m = Object.fromEntries(metrics.map(x => [x.name, x.value]))
  const fcp = await page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0)
  await cdp.send('Performance.disable')
  const loaded = await page.evaluate(() => [location.href, ...performance.getEntriesByType('resource').map(e => e.name)])
  for (const href of new Set(loaded)) {
    const k = /\.css(\?|$)/.test(href) ? 'css' : /\.m?js(\?|$)/.test(href) ? 'js' : href === loaded[0] ? 'html' : null
    if (k) bytes[k] += gzipOf(href)
  }
  return { ...bytes, fcp, style: m.RecalcStyleDuration * 1000, layout: m.LayoutDuration * 1000, script: m.ScriptDuration * 1000, wall }
}

const median = xs => { const s = [...xs].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
const browser = await chromium.launch()
const rows = []
for (const path of PAGES) {
  const res = { a: [], b: [] }
  for (let i = 0; i < runs; i++) {
    // Fresh context per run (cold cache), alternating builds to spread machine noise evenly.
    for (const [k, origin] of i % 2 ? [['b', b], ['a', a]] : [['a', a], ['b', b]]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()
      const cdp = await ctx.newCDPSession(page)
      res[k].push(await measure(page, cdp, new URL(path, origin).href))
      await ctx.close()
    }
  }
  const pick = (k, f) => median(res[k].map(r => r[f]))
  rows.push({ path, ...Object.fromEntries(['css', 'js', 'html', 'fcp', 'style', 'layout', 'script'].flatMap(f => [[`${f}A`, pick('a', f)], [`${f}B`, pick('b', f)]])) })
}
await browser.close()

const kb = n => (n / 1024).toFixed(1)
const ms = n => n.toFixed(1)
const pct = (x, y) => (x ? `${y >= x ? '+' : ''}${Math.round((y - x) / x * 100)}%` : '')
console.log('page | CSS gz KB | JS gz KB | HTML gz KB | FCP ms | style ms | layout ms | script ms')
for (const r of rows) {
  console.log([r.path, ...[['css', kb], ['js', kb], ['html', kb], ['fcp', ms], ['style', ms], ['layout', ms], ['script', ms]]
    .map(([f, fmt]) => `${fmt(r[f + 'A'])} → ${fmt(r[f + 'B'])} (${pct(r[f + 'A'], r[f + 'B'])})`)].join(' | '))
}
const sum = f => rows.reduce((s, r) => s + r[f], 0)
console.log(['TOTAL', ...['css', 'js', 'html', 'fcp', 'style', 'layout', 'script'].map(f => `${(f === 'css' || f === 'js' || f === 'html' ? kb : ms)(sum(f + 'A'))} → ${(f === 'css' || f === 'js' || f === 'html' ? kb : ms)(sum(f + 'B'))} (${pct(sum(f + 'A'), sum(f + 'B'))})`)].join(' | '))
