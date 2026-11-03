// Fails when a component animates properties that trigger layout/paint. Usage: node scripts/lint-motion.mjs [dir]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { extract, generate } from '../modules/mi-atomic/engine.ts'

const BAD = /\b(width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*|box-shadow|border[\w-]*|background[\w-]*|color|font-size|inset|grid-template-\w+)\b/
const root = process.argv[2] ?? 'app/components'
let fails = 0

function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.vue')) check(p)
  }
}

function check(file) {
  const src = readFileSync(file, 'utf8')
  const style = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n') + '\n' + generate(extract(src))
  for (const m of style.matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/g)) {
    const v = m[1].replace(/var\([^)]*\)/g, '').replace(/cubic-bezier\([^)]*\)|linear\([^)]*\)/g, '')
    const hit = v.split(',').map(s => s.trim().split(/\s+/)[0]).find(p => p === 'all' || BAD.test(p))
    if (hit) { console.log(`${file}: transition on "${hit}"`); fails++ }
  }
  for (const k of style.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?)\}\s*(?=@|\.|\w|\/|:|$)/g)) {
    const hit = k[1].match(BAD)
    if (hit) { console.log(`${file}: keyframes animate "${hit[0]}"`); fails++ }
  }
}
walk(root)
console.log(fails ? `${fails} motion violation(s)` : 'motion lint ok')
process.exit(fails ? 1 : 0)
