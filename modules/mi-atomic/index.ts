import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, resolve } from 'node:path'
import { addVitePlugin, defineNuxtModule } from 'nuxt/kit'
import type { ViteDevServer } from 'vite'
import { extract, generate } from './engine.ts'

export interface MiAtomicOptions {
  /** Class prefix: `mi` gives `mi:flex`. */
  prefix: string
  /** Extra directories to scan, besides the `app/` directory of every layer and of the project. */
  scan: string[]
}

const EXTENSIONS = new Set(['.vue', '.ts', '.js', '.mjs', '.tsx', '.jsx', '.md'])
const SKIP = new Set(['node_modules', '.nuxt', '.output', 'dist', '.git'])

// Atomic utility classes for the Mica layer. Scans the sources of every layer and of the project for
// `mi:` classes and writes the CSS of those, and only those, to `.nuxt/mi-atomic.css`. No runtime code.
export default defineNuxtModule<MiAtomicOptions>({
  meta: { name: 'mi-atomic', configKey: 'miAtomic' },
  defaults: { prefix: 'mi', scan: [] },
  setup(options, nuxt) {
    const { prefix } = options
    const dirs = [...new Set([...nuxt.options._layers.map(l => l.config.srcDir), ...options.scan.map(d => resolve(nuxt.options.rootDir, d))])]
      .filter((d): d is string => !!d && existsSync(d))
    const out = join(nuxt.options.buildDir, 'mi-atomic.css')

    // Classes per file, so an edit can drop the ones it removed.
    const byFile = new Map<string, Set<string>>()
    let css = ''

    const scanFile = (file: string, src?: string) => {
      if (!EXTENSIONS.has(extname(file))) return
      const text = src ?? (existsSync(file) ? readFileSync(file, 'utf8') : '')
      if (text) byFile.set(file, extract(text, prefix))
      else byFile.delete(file)
    }
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        if (SKIP.has(e.name)) continue
        const p = join(d, e.name)
        if (e.isDirectory()) walk(p)
        else scanFile(p)
      }
    }
    /** Regenerates the stylesheet; returns true when it changed. */
    const write = () => {
      const all = new Set<string>()
      for (const set of byFile.values()) for (const t of set) all.add(t)
      const next = generate(all, prefix)
      if (next === css && existsSync(out)) return false
      css = next
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, css)
      return true
    }

    for (const d of dirs) walk(d)
    write()
    // After the layer's own stylesheets, so utilities win over the base rules at equal specificity.
    nuxt.options.css.push(out)

    if (!nuxt.options.dev) return
    const inScope = (file: string) => dirs.some(d => file.startsWith(d + '/')) && !file.split('/').some(s => SKIP.has(s))
    const servers = new Set<ViteDevServer>()
    const update = (file: string, src?: string) => {
      if (!inScope(file)) return
      scanFile(file, src)
      if (!write()) return
      for (const server of servers) {
        const mods = server.moduleGraph.getModulesByFile(out)
        if (mods) for (const m of mods) void server.reloadModule(m)
      }
    }
    nuxt.hook('builder:watch', (_event, path) => {
      const abs = isAbsolute(path) ? path : [nuxt.options.srcDir, nuxt.options.rootDir].map(r => resolve(r, path)).find(existsSync) ?? resolve(nuxt.options.srcDir, path)
      update(abs)
    })
    addVitePlugin({
      name: 'mi-atomic',
      configureServer(server) { servers.add(server) },
      async handleHotUpdate(ctx) { update(ctx.file, await ctx.read()) }
    })
  }
})
