// Rendering equivalence check between two builds of the site: snapshots the computed style and box of
// every element (and its ::before/::after) on every page, at several widths and in both themes.
//
//   node scripts/iso-check.mjs snap <origin> <out.json> [--only <substring>]   hash snapshot of every page
//   node scripts/iso-check.mjs diff <a.json> <b.json> [--noise <a2.json,…>]     pages and elements that differ
//   node scripts/iso-check.mjs detail <originA> <originB> <path> [state]       property-level diff of one page
//
// <origin> serves a static build (`nuxt generate site`, then any static server). Pages come from its sitemap.xml.
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const [cmd, ...args] = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args.splice(i, 2)[1] }

// Block previews are measured at these frame widths, the page chrome at these viewport widths.
const FRAMES = [390, 768, 1200]
const VIEWPORTS = [390, 1440]
const THEMES = ['light', 'dark']

/** Runs in the page: one string (or hash) per element, keyed by its structural path. */
function measure({ full, scope }) {
  const hash = (s) => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i)
      h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
  }
  const props = [...getComputedStyle(document.body)].filter(p => !p.startsWith('--'))
  // Two normalizations, both without visual effect: scoped keyframe names carry a hash of their file, and
  // a background position does nothing without a background image.
  const value = (cs, p) => {
    const v = cs.getPropertyValue(p)
    if (p.startsWith('animation')) return v.replace(/-[0-9a-f]{8}\b/g, '')
    if (p.startsWith('background-position') && cs.getPropertyValue('background-image') === 'none') return ''
    return v
  }
  const style = (cs) => props.map(p => p + ':' + value(cs, p))
  const out = {}
  const roots = scope ? [...document.querySelectorAll(scope)] : [document.body]
  const walk = (el, path) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const parts = [...style(cs), `box:${r.x.toFixed(2)},${r.y.toFixed(2)},${r.width.toFixed(2)},${r.height.toFixed(2)}`]
    for (const pe of ['::before', '::after']) {
      const ps = getComputedStyle(el, pe)
      const c = ps.getPropertyValue('content')
      if (c !== 'none' && c !== 'normal') parts.push(...style(ps).map(s => pe + s))
    }
    if (full === true || (Array.isArray(full) && full.includes(path))) out[path] = parts
    else if (!full) out[path] = hash(parts.join('\n'))
    const seen = {}
    for (const c of el.children) {
      const tag = c.tagName.toLowerCase()
      seen[tag] = (seen[tag] ?? 0) + 1
      walk(c, `${path}>${tag}:${seen[tag]}`)
    }
  }
  roots.forEach((r, i) => walk(r, scope ? `${scope}#${i}` : 'body'))
  return out
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r))
    for (const a of document.getAnimations()) {
      try { a.finish() }
      catch { a.pause(); a.currentTime = 0 }
    }
    await new Promise(r => requestAnimationFrame(r))
  })
}

/** `full` is a boolean, or the paths to measure in full per state. */
const pick = (full, state) => (typeof full === 'boolean' ? full : full[state] ?? [])

/** Every state of one page: [state name, measurement]. */
async function states(page, url, full) {
  const res = {}
  for (const vw of VIEWPORTS) {
    await page.setViewportSize({ width: vw, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle' })
    const blocks = await page.locator('.bf__frame').count()
    if (blocks) await page.waitForFunction(() => !document.querySelector('.bf__spin'), null, { timeout: 30000 })
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'no-preference' })
      await page.evaluate(t => { document.documentElement.dataset.theme = t }, theme)
      await settle(page)
      res[`${vw}/${theme}`] = await page.evaluate(measure, { full: pick(full, `${vw}/${theme}`), scope: null })
      // Block previews again at fixed frame widths, so every container query is exercised.
      if (blocks && vw === 1440) {
        for (const w of FRAMES) {
          await page.evaluate(w => { for (const f of document.querySelectorAll('.bf__frame')) f.style.width = w + 'px' }, w)
          await settle(page)
          res[`frame${w}/${theme}`] = await page.evaluate(measure, { full: pick(full, `frame${w}/${theme}`), scope: '.bf__frame' })
        }
        await page.evaluate(() => { for (const f of document.querySelectorAll('.bf__frame')) f.style.width = '' })
      }
    }
  }
  return res
}

async function pages(origin, only) {
  const xml = await (await fetch(new URL('sitemap.xml', origin))).text()
  const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname))]
    .filter(p => !p.startsWith('/fr'))
  return only ? urls.filter(u => u.includes(only)) : urls
}

async function snap(origin, file) {
  const only = flag('--only')
  const list = await pages(origin, only)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })
  const result = {}
  let done = 0
  const queue = [...list]
  await Promise.all(Array.from({ length: 6 }, async () => {
    const page = await ctx.newPage()
    for (let url = queue.shift(); url; url = queue.shift()) {
      try { result[url] = await states(page, new URL(url, origin).href, false) }
      catch (e) { result[url] = { error: String(e.message ?? e) } }
      if (++done % 50 === 0) console.log(`${done}/${list.length}`)
    }
  }))
  await browser.close()
  writeFileSync(file, JSON.stringify(result))
  console.log(`\n${file}: ${list.length} pages`)
}

function diff(a, b) {
  const A = JSON.parse(readFileSync(a, 'utf8'))
  const B = JSON.parse(readFileSync(b, 'utf8'))
  // A second snapshot of the same build marks the elements that change on their own (random data, clocks).
  // Comma-separated: an element is noise when it differs in any of them.
  const noise = (flag('--noise') ?? '').split(',').filter(Boolean).map(f => JSON.parse(readFileSync(f, 'utf8')))
  let bad = 0
  for (const url of Object.keys(A).sort()) {
    if (!B[url]) { console.log(`${url}: missing`); bad++; continue }
    if (A[url].error || B[url].error) { console.log(`${url}: error ${A[url].error ?? B[url].error}`); bad++; continue }
    const lines = []
    for (const state of Object.keys(A[url])) {
      const x = A[url][state], y = B[url][state] ?? {}
      const paths = new Set([...Object.keys(x), ...Object.keys(y)])
      const off = [...paths].filter(p => x[p] !== y[p] && noise.every(N => !N[url]?.[state] || N[url][state][p] === x[p]))
      if (off.length) lines.push(`  ${state}: ${off.length} element(s), e.g. ${off.slice(0, 3).join('  ')}`)
    }
    if (lines.length) { bad++; console.log(url + '\n' + lines.join('\n')) }
  }
  console.log(bad ? `${bad} page(s) differ` : `identical: ${Object.keys(A).length} pages`)
  process.exit(bad ? 1 : 0)
}

async function detail(originA, originB, path, state) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const A = await states(page, new URL(path, originA).href, true)
  const B = await states(page, new URL(path, originB).href, true)
  await browser.close()
  for (const s of Object.keys(A)) {
    if (state && s !== state) continue
    for (const p of new Set([...Object.keys(A[s]), ...Object.keys(B[s] ?? {})])) {
      const x = A[s][p] ?? [], y = B[s]?.[p] ?? []
      const d = x.map((v, i) => v !== y[i] ? `${v}  →  ${(y[i] ?? '').replace(/^[^:]*:/, '')}` : null).filter(Boolean)
      if (d.length || x.length !== y.length) console.log(`${s} ${p}\n    ${d.slice(0, 12).join('\n    ')}`)
    }
  }
}

/** Property-level differences between two snapshots, grouped: which property changed how, how often, where. */
async function explain(originA, originB, snapA, snapB) {
  const A0 = JSON.parse(readFileSync(snapA, 'utf8'))
  const B0 = JSON.parse(readFileSync(snapB, 'utf8'))
  const noiseFile = flag('--noise')
  const N = noiseFile ? JSON.parse(readFileSync(noiseFile, 'utf8')) : null
  const work = []
  for (const url of Object.keys(A0)) {
    if (A0[url].error || !B0[url] || B0[url].error) continue
    const paths = {}
    for (const st of Object.keys(A0[url])) {
      const x = A0[url][st], y = B0[url][st] ?? {}, n = N?.[url]?.[st] ?? x
      const off = Object.keys(x).filter(p => x[p] !== y[p] && x[p] === n[p])
      if (off.length) paths[st] = off.slice(0, 40)
    }
    if (Object.keys(paths).length) work.push({ url, paths })
  }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })
  const groups = new Map()
  await Promise.all(Array.from({ length: 6 }, async () => {
    const page = await ctx.newPage()
    for (let w = work.shift(); w; w = work.shift()) {
      const A = await states(page, new URL(w.url, originA).href, w.paths)
      const B = await states(page, new URL(w.url, originB).href, w.paths)
      for (const s of Object.keys(w.paths)) {
        for (const p of Object.keys(A[s] ?? {})) {
          const x = A[s][p], y = B[s]?.[p] ?? []
          x.forEach((v, i) => {
            if (v === y[i] || v.startsWith('box:')) return
            const k = `${v}  →  ${(y[i] ?? '').replace(/^[^:]*:/, '')}`
            const g = groups.get(k) ?? { n: 0, where: new Set() }
            g.n++; if (g.where.size < 3) g.where.add(`${w.url} ${s} ${p}`)
            groups.set(k, g)
          })
        }
      }
    }
  }))
  await browser.close()
  for (const [k, g] of [...groups].sort((a, b) => b[1].n - a[1].n)) console.log(`${g.n}\t${k}\n\t${[...g.where].join('\n\t')}`)
}

if (cmd === 'explain') await explain(args[0], args[1], args[2], args[3])
else if (cmd === 'snap') await snap(args[0], args[1])
else if (cmd === 'diff') diff(args[0], args[1])
else if (cmd === 'detail') await detail(args[0], args[1], args[2], args[3])
else console.log('usage: iso-check.mjs snap|diff|detail …')
