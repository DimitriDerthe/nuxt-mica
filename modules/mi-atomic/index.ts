import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, isAbsolute, join, resolve } from 'node:path'
import { addTemplate, addVitePlugin, defineNuxtModule, updateTemplates } from 'nuxt/kit'
import { apply, composedCounts, globalClasses, plan } from './compose.ts'
import { extract, generate, occurrences, parse, rename, shortNames } from './engine.ts'

export interface MiAtomicOptions {
  /** Class prefix: `mi` gives `mi:flex`. */
  prefix: string
  /** Extra directories to scan, besides the `app/` directory of every layer and of the project. */
  scan: string[]
  /**
   * Production builds swap every class for a short name (`mi:@[560px]:grid-cols-2` → `_1f`) in markup, scripts and
   * CSS. Smaller HTML, JS and CSS; dev keeps the readable classes. Default: on in production.
   */
  mangle: boolean
  /**
   * Production builds compose the static classes of each template element into one class whose rules ship with the
   * component's CSS chunk: fewer classes to match per element, and a page loads the rules of the components it
   * renders. Dynamic classes stay atomic in the global sheet. Same rendering; default: on in production.
   */
  compose: boolean
  /**
   * Directories (relative to the project root) whose composed elements drop, in production, the plain class names
   * nothing selects any more. For app code whose class names are not an API; the layer's components keep theirs.
   */
  strip: string[]
}

/** The part of Vite's dev server the module uses (Vite's types are not a dependency of the layer). */
interface DevServer {
  moduleGraph: { getModulesByFile(file: string): Set<unknown> | undefined }
  reloadModule(module: unknown): Promise<void>
}

const EXTENSIONS = new Set(['.vue', '.ts', '.js', '.mjs', '.tsx', '.jsx', '.md'])
const SKIP = new Set(['node_modules', '.nuxt', '.output', 'dist', '.git'])

// Atomic utility classes for the Mica layer. Scans the sources of every layer and of the project for
// `mi:` classes and writes the CSS of those, and only those, to `.nuxt/mi-atomic.css`. No runtime code.
export default defineNuxtModule<MiAtomicOptions>({
  meta: { name: 'mi-atomic', configKey: 'miAtomic' },
  defaults: nuxt => ({ prefix: 'mi', scan: [], mangle: !nuxt.options.dev, compose: !nuxt.options.dev, strip: [] }),
  setup(options, nuxt) {
    const { prefix } = options
    const dirs = [...new Set([...nuxt.options._layers.map(l => l.config.srcDir), ...options.scan.map(d => resolve(nuxt.options.rootDir, d))])]
      .filter((d): d is string => !!d && existsSync(d))

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
    const compose = options.compose && !nuxt.options.dev
    const stripDirs = options.strip.map(d => resolve(nuxt.options.rootDir, d))
    const stripped = (file: string) => stripDirs.some(d => file.startsWith(d + '/'))
    const vueFiles = () => [...byFile.keys()].filter(f => extname(f) === '.vue')
    let combos: Map<string, string> | undefined
    let shared: Set<string> | undefined
    /** Regenerates the stylesheet; returns true when it changed. */
    const regenerate = () => {
      const all = new Set<string>()
      // Composed classes leave the global sheet, except for the helper blocks (`@property`, `@keyframes`) they need.
      const extras = new Set<string>()
      for (const [file, set] of byFile) {
        if (!compose || extname(file) !== '.vue') { for (const t of set) all.add(t); continue }
        for (const t of set) {
          if (shared!.has(t)) all.add(t)
          else for (const e of parse(t, prefix)?.extras ?? []) extras.add(e)
        }
      }
      const next = [...extras].join('') + generate(all, prefix, names)
      if (next === css) return false
      css = next
      return true
    }

    for (const d of dirs) walk(d)
    // Production names, fixed once from the whole scan so the client and server builds agree. Composed classes and
    // the classes left one by one share a single namespace (`_0`, `_1`, …), shortest names to the most used.
    let names: Map<string, string> | undefined
    const counts = new Map<string, number>()
    const plans = new Map(compose ? vueFiles().map(f => [f, plan(readFileSync(f, 'utf8'), prefix)] as const) : [])
    for (const file of byFile.keys()) {
      const src = readFileSync(file, 'utf8')
      const p = plans.get(file)
      occurrences(p ? apply(src, p, prefix) : src, prefix, counts)
    }
    for (const t of counts.keys()) if (!parse(t, prefix)) counts.delete(t)
    if (compose) {
      const keyed = composedCounts(plans.values())
      for (const [k, n] of keyed) counts.set('\0' + k, n)
      shared = globalClasses(plans.values(), prefix)
      // Classes of other files (scripts, markdown) have no known element: global too.
      for (const [file, set] of byFile) if (extname(file) !== '.vue') for (const t of set) shared.add(t)
    }
    if (options.mangle || compose) {
      const all = shortNames(counts)
      if (compose) combos = new Map([...all].filter(([k]) => k.startsWith('\0')).map(([k, v]) => [k.slice(1), options.mangle ? v : '_' + v]))
      if (options.mangle) names = new Map([...all].filter(([k]) => !k.startsWith('\0')))
    }
    regenerate()
    // Written by Nuxt with its other templates, after the build directory is cleaned.
    const out = addTemplate({ filename: 'mi-atomic.css', write: true, getContents: () => css }).dst
    // After the layer's own stylesheets, so utilities win over the base rules at equal specificity.
    nuxt.options.css.push(out)

    const inScope = (file: string) => dirs.some(d => file.startsWith(d + '/')) && !file.split('/').some(s => SKIP.has(s))
    if (names || compose) {
      const map = names
      addVitePlugin({
        name: 'mi-atomic:build',
        enforce: 'pre',
        // Source modules only: `?raw` imports (shown as code) and style sub-requests keep their text.
        transform(code, id) {
          if (id.includes('?') || !EXTENSIONS.has(extname(id)) || !inScope(id)) return
          let out = compose && extname(id) === '.vue' ? apply(code, plan(code, prefix, combos), prefix, map, shared, stripped(id)) : code
          if (map) out = rename(out, map, prefix)
          return out === code ? undefined : { code: out, map: null }
        }
      })
    }
    if (!nuxt.options.dev) return
    const servers = new Set<DevServer>()
    const update = async (file: string, src?: string) => {
      if (!inScope(file)) return
      scanFile(file, src)
      if (!regenerate()) return
      await updateTemplates({ filter: t => t.filename === 'mi-atomic.css' })
      for (const server of servers) {
        const mods = server.moduleGraph.getModulesByFile(out)
        if (mods) for (const m of mods) void server.reloadModule(m)
      }
    }
    nuxt.hook('builder:watch', (_event, path) => {
      const abs = isAbsolute(path) ? path : [nuxt.options.srcDir, nuxt.options.rootDir].map(r => resolve(r, path)).find(existsSync) ?? resolve(nuxt.options.srcDir, path)
      return update(abs)
    })
    addVitePlugin({
      name: 'mi-atomic',
      configureServer(server) { servers.add(server as unknown as DevServer) },
      async handleHotUpdate(ctx) { await update(ctx.file, await ctx.read()) }
    })
  }
})
