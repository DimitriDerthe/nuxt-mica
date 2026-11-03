import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { escape, extract, generate, parse } from '../modules/mi-atomic/engine'
import { blocksOf, families, findCategory, loadBlock } from '../site/app/blocks/catalog'

const owned = families.flatMap(f => f.categories.filter(c => !c.ref).map(c => ({ family: f.id, category: c })))
const all = owned.flatMap(o => blocksOf(o.family, o.category.id).map(meta => ({ ...o, meta })))
const read = (b: typeof all[number]) => readFileSync(join(process.cwd(), 'site/app/blocks', b.family, b.category.id, `${b.meta.file}.vue`), 'utf8')
const style = (src: string) => src.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''
/** Everything a block styles with: its scoped CSS plus the CSS of the `mi:` classes it uses. */
const css = (src: string) => style(src) + '\n' + generate(extract(src))
const rootClasses = (src: string) => src.match(/<template>\s*(?:<!--[\s\S]*?-->\s*)*<[a-zA-Z-]+[^>]*?\sclass="([^"]+)"/)?.[1].split(/\s+/) ?? []
/** Declarations of the root's own utilities, without variants. */
const rootUtilities = (src: string) => rootClasses(src).map(t => parse(t)).filter(r => r && !r.at.length && r.selector === '.' + escape(r.token))
  .flatMap(r => r!.decls.map(([p, v]) => `${p}: ${v};`)).join(' ')

describe('application UI blocks', () => {
  it('gives every category two to four blocks', () => {
    const off = owned.map(o => ({ at: `${o.family}/${o.category.id}`, n: blocksOf(o.family, o.category.id).length }))
      .filter(o => o.n < 2 || o.n > 4).map(o => `${o.at}: ${o.n}`)
    expect(off).toEqual([])
  })

  it('keeps category ids unique within each family', () => {
    for (const f of families) expect(new Set(f.categories.map(c => c.id)).size).toBe(f.categories.length)
  })

  it('points every cross-reference to an owned category', () => {
    for (const f of families) for (const c of f.categories.filter(x => x.ref)) {
      const target = findCategory(c.ref!, c.id)
      expect(target, `${f.id}/${c.id}`).toBeDefined()
      expect(target!.ref).toBeUndefined()
    }
  })

  it('describes each block with a file, bilingual title and summary', () => {
    for (const b of all) {
      const at = `${b.family}/${b.category.id}/${b.meta.file}`
      expect(loadBlock(b.family, b.category.id, b.meta.file), at).toBeTypeOf('function')
      for (const k of ['en', 'fr'] as const) {
        expect(b.meta.title[k]?.trim(), `${at} title.${k}`).toBeTruthy()
        expect(b.meta.summary[k]?.trim(), `${at} summary.${k}`).toBeTruthy()
      }
    }
  })

  it('styles blocks with utilities only, without a style block', () => {
    const bad = all.filter(b => /<style/.test(read(b))).map(b => `${b.family}/${b.category.id}/${b.meta.file}`)
    expect(bad).toEqual([])
  })

  it('styles blocks with tokens and container queries only', () => {
    for (const b of all) {
      const all = css(read(b))
      const at = `${b.family}/${b.category.id}/${b.meta.file}`
      expect(all.match(/#[0-9a-f]{3,8}\b/gi), `${at} hardcodes a hex color`).toBeNull()
      expect(all, `${at} uses a viewport media query for layout`).not.toMatch(/@media\s*\((min|max)-width/)
      expect(all, `${at} must be a size container`).toMatch(/container(-type)?:\s*([\w-]+\s*\/\s*)?inline-size/)
    }
  })

  it('never injects raw HTML or evaluates strings', () => {
    const bad = all.flatMap((b) => {
      const src = read(b)
      const at = `${b.family}/${b.category.id}/${b.meta.file}`
      const hits = [/\bv-html\b/, /\.(inner|outer)HTML\b/, /\beval\s*\(/, /\bnew Function\b/, /document\.write/].filter(r => r.test(src)).map(r => `${at}: ${r}`)
      const blank = (src.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []).filter(a => !/rel="[^"]*noopener/.test(a)).map(() => `${at}: target=_blank without rel=noopener`)
      return [...hits, ...blank]
    })
    expect(bad).toEqual([])
  })

  it('clears every timer it starts', () => {
    const bad = all.filter((b) => {
      const src = read(b)
      return /\bset(Timeout|Interval)\s*\(/.test(src) && !/\bclear(Timeout|Interval)\b/.test(src)
    }).map(b => `${b.family}/${b.category.id}/${b.meta.file}`)
    expect(bad).toEqual([])
  })

  it('keeps padded root grids from stretching their rows', () => {
    // The preview frame (and many app layouts) give a block more height than it needs: a root grid
    // without align-content spreads that space between its rows, opening gaps when content shrinks.
    const bad = all.filter(b => b.meta.stage !== 'bleed').flatMap((b) => {
      const rule = rootUtilities(read(b))
      return /display:\s*grid/.test(rule) && !/align-content|place-content|grid-template(-rows)?:/.test(rule) ? [`${b.family}/${b.category.id}/${b.meta.file}`] : []
    })
    expect(bad).toEqual([])
  })

  it('animates only compositor-friendly properties', () => {
    const layout = /\b(width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*|box-shadow|border[\w-]*)\b/
    const bad = all.flatMap(b => (css(read(b)).match(/transition(-property)?:[^;}]+/g) ?? [])
      .filter(t => layout.test(t)).map(t => `${b.family}/${b.category.id}/${b.meta.file}: ${t}`))
    expect(bad).toEqual([])
  })

  it('never container-queries the root element against itself', () => {
    const bad = all.flatMap((b) => {
      const src = read(b)
      if (!rootClasses(src).length) return [`${b.meta.file}: no root class`]
      return rootClasses(src).filter(t => parse(t)?.at.some(a => a.startsWith('@container'))).map(x => `${b.family}/${b.category.id}/${b.meta.file}: ${x}`)
    })
    expect(bad).toEqual([])
  })

  it('puts only mi: utilities in class attributes', () => {
    // Static `class` and the string literals of `:class` (comparison operands are not classes).
    const tokens = (src: string) => {
      const tpl = src.slice(0, src.search(/<script/) === -1 ? undefined : src.search(/<script/))
      const found: string[] = []
      for (const m of tpl.matchAll(/(?<![:\w@-])class="([^"]*)"/g)) found.push(...m[1]!.split(/\s+/))
      for (const m of tpl.matchAll(/(?<![\w@-]):class="([^"]*)"/g)) {
        const expr = m[1]!.replace(/(?:===?|!==?)\s*'[^']*'|'[^']*'\s*(?:===?|!==?)/g, '')
        for (const l of expr.matchAll(/'([^']*)'/g)) found.push(...l[1]!.split(/\s+/))
      }
      return found.filter(t => t && !t.startsWith('mi:') && !t.startsWith('mi-'))
    }
    const bad = all.flatMap(b => tokens(read(b)).map(t => `${b.family}/${b.category.id}/${b.meta.file}: ${t}`))
    expect(bad).toEqual([])
  })
})
