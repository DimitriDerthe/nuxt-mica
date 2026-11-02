import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { blocksOf, families, findCategory, loadBlock } from '../site/app/blocks/catalog'

const owned = families.flatMap(f => f.categories.filter(c => !c.ref).map(c => ({ family: f.id, category: c })))
const all = owned.flatMap(o => blocksOf(o.family, o.category.id).map(meta => ({ ...o, meta })))
const read = (b: typeof all[number]) => readFileSync(join(process.cwd(), 'site/app/blocks', b.family, b.category.id, `${b.meta.file}.vue`), 'utf8')
const style = (src: string) => src.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''

describe('application UI blocks', () => {
  it('gives every category at least one block', () => {
    const empty = owned.filter(o => !blocksOf(o.family, o.category.id).length).map(o => `${o.family}/${o.category.id}`)
    expect(empty).toEqual([])
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

  it('styles blocks with tokens and container queries only', () => {
    for (const b of all) {
      const css = style(read(b))
      const at = `${b.family}/${b.category.id}/${b.meta.file}`
      expect(css.match(/#[0-9a-f]{3,8}\b/gi), `${at} hardcodes a hex color`).toBeNull()
      expect(css, `${at} uses a viewport media query for layout`).not.toMatch(/@media\s*\((min|max)-width/)
      expect(css, `${at} must be a size container`).toMatch(/container(-type)?:\s*([\w-]+\s*\/\s*)?inline-size/)
    }
  })

  it('animates only compositor-friendly properties', () => {
    const layout = /\b(width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*|box-shadow|border[\w-]*)\b/
    const bad = all.flatMap(b => (style(read(b)).match(/transition(-property)?:[^;}]+/g) ?? [])
      .filter(t => layout.test(t)).map(t => `${b.family}/${b.category.id}/${b.meta.file}: ${t}`))
    expect(bad).toEqual([])
  })

  it('never container-queries the root element against itself', () => {
    const bad = all.flatMap((b) => {
      const src = read(b)
      const root = src.match(/<template>\s*(?:<!--[\s\S]*?-->\s*)*<[a-zA-Z-]+[^>]*?\sclass="([\w-]+)/)?.[1]
      if (!root) return [`${b.meta.file}: no root class`]
      const queries = style(src).match(/@container[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g) ?? []
      const self = new RegExp(`(^|[},])\\s*\\.${root}([.:\\[][^\\s>+~,{]*)?\\s*[,{]`)
      return queries.filter(q => self.test(q.replace(/^@container[^{]*\{/, ''))).map(() => `${b.family}/${b.category.id}/${b.meta.file}: .${root}`)
    })
    expect(bad).toEqual([])
  })
})
