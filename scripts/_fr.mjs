import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const c = JSON.parse(readFileSync('components.json', 'utf8'))
const slug = n => n.replace(/^Mi/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const bad = []
for (let i = 0; i < c.length; i += 40) {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
  const errs = []; p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.text().slice(0,120)) }); p.on('pageerror', e => errs.push(e.message.slice(0,120)))
  for (const x of c.slice(i, i + 40)) { errs.length = 0
    try { await p.goto(`http://localhost:3010/fr/components/${slug(x.name)}`, { waitUntil: 'networkidle' }); if (errs.length) bad.push(x.name + ' ' + [...new Set(errs)].join('|')) } catch { bad.push(x.name + ' CRASH') } }
  await b.close()
}
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
await p.goto('http://localhost:3010/fr/components/bubble', { waitUntil: 'networkidle' })
console.log(await p.locator('.head__lead').innerText(), '|', await p.locator('.tbl__doc').first().innerText())
await p.goto('http://localhost:3010/components/bubble', { waitUntil: 'networkidle' })
console.log(await p.locator('.head__lead').innerText()); await b.close()
console.log(c.length, bad.length ? bad.join('\n') : 'all clean')
