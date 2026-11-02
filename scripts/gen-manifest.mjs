// Generates the AI-oriented component manifest from the sources (single source of truth).
//   node scripts/gen-manifest.mjs          write llms.txt, components.json, docs/api/*.md, docs/blocks.md
//   node scripts/gen-manifest.mjs --check  fail when generated files are stale
// Component summary: first /** ... */ block of <script setup>. Prop docs: JSDoc above each prop.
import { createChecker } from 'vue-component-meta'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const checker = createChecker(join(root, 'tsconfig.meta.json'), { forceUseTs: true, schema: true })

const files = readdirSync(join(root, 'app/components'), { recursive: true })
  .filter(f => f.endsWith('.vue')).sort()

// Expand object / array-of-object schemas into a compact inline shape so docs never need a second lookup.
function shape(schema, depth = 0) {
  if (!schema || typeof schema !== 'object' || depth > 1) return undefined
  if (schema.kind === 'array' && schema.schema?.length === 1) { const i = shape(schema.schema[0], depth); return i ? i + '[]' : undefined }
  if (schema.kind === 'enum' && Array.isArray(schema.schema)) {
    const objs = schema.schema.filter(x => x && typeof x === 'object' && x.kind === 'object')
    if (objs.length === 1 && schema.schema.every(x => x === 'undefined' || x === objs[0])) return shape(objs[0], depth)
    return undefined
  }
  if (schema.kind !== 'object' || !schema.schema || typeof schema.schema !== 'object') return undefined
  const fields = Object.values(schema.schema).filter(f => !/^on[A-Z]/.test(f.name)).map(f => {
    const t = fmt(f.schema, f.type, 1)
    return `${f.name}${f.required ? '' : '?'}: ${t.length > 60 ? strip(f.type) : t}`
  })
  const out = `{ ${fields.join('; ')} }`
  return out.length <= 220 ? out : undefined
}
const strip = t => String(t).replace(/\s*\|\s*undefined/g, '').replace(/^undefined\s*\|\s*/, '')
function fmt(schema, type, depth = 0) {
  if (schema && typeof schema === 'object' && schema.kind === 'enum' && Array.isArray(schema.schema) && depth < 2) {
    const parts = schema.schema.filter(s => s !== 'undefined').map(s => typeof s === 'string' ? s : fmt(s, s.type, depth + 1))
    const out = [...new Set(parts)].join(' | ').replace(/\bfalse \| true\b|\btrue \| false\b/g, 'boolean')
    return out.length <= 140 ? out : strip(type)
  }
  return strip(type)
}
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim()
const summaryOf = src => {
  const script = src.match(/<script[^>]*setup[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''
  return clean(script.match(/^\s*\/\*\*([\s\S]*?)\*\//)?.[1]?.replace(/^\s*\*\s?/gm, ''))
}

// Exported Mi* types (interfaces, unions) from components and utils, so docs can expand every named type.
const typeDefs = new Map()
const icons = readFileSync(join(root, 'app/utils/miIcons.ts'), 'utf8').match(/export const miIcons[\s\S]*?\n}/)[0]
const iconKeys = [...icons.matchAll(/^\s+'?([a-z0-9-]+)'?:/gm)].map(m => `'${m[1]}'`).join(' | ')
const sources = [
  ...files.map(f => ['app/components/' + f, [...readFileSync(join(root, 'app/components', f), 'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n')]),
  ...readdirSync(join(root, 'app/utils')).filter(f => f.endsWith('.ts')).map(f => ['app/utils/' + f, readFileSync(join(root, 'app/utils', f), 'utf8')])
]
for (const [path, code] of sources) {
  const sf = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true)
  for (const st of sf.statements) {
    if (!(ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) || !st.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue
    const name = st.name.text
    if (!/^Mi[A-Z]/.test(name)) continue
    let body
    // Keep each field's JSDoc as a compact /** ... */ prefix: it often carries the format a value must have.
    const fieldDoc = m => {
      const r = ts.getLeadingCommentRanges(sf.text, m.pos)?.filter(c => sf.text.startsWith('/**', c.pos)).pop()
      return r ? `/** ${clean(sf.text.slice(r.pos + 3, r.end - 2).replace(/^\s*\*\s?/gm, ''))} */ ` : ''
    }
    if (ts.isInterfaceDeclaration(st)) body = '{ ' + st.members.map(m => fieldDoc(m) + clean(m.getText(sf).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')).replace(/[;,]$/, '')).join('; ') + ' }'
    else body = clean(st.type.getText(sf).replace(/\/\*[\s\S]*?\*\//g, '')).replace(/^\|\s*/, '')
    if (body === 'keyof typeof miIcons') body = iconKeys
    const ext = ts.isInterfaceDeclaration(st) && st.heritageClauses ? ' ' + st.heritageClauses.map(h => h.getText(sf)).join(' ') : ''
    typeDefs.set(path + '#' + name, { name, path, def: `${ts.isInterfaceDeclaration(st) ? 'interface' : 'type'} ${name}${ext} ${ts.isInterfaceDeclaration(st) ? body : '= ' + body}` })
  }
}
// Resolve a type name for a component: same file first, then the unique exported definition anywhere.
const lookup = (name, path) => typeDefs.get(path + '#' + name) ?? [...typeDefs.values()].find(t => t.name === name)
function typesFor(c) {
  const text = JSON.stringify([c.props, c.slots, c.emits])
  const seen = new Map(), queue = [...new Set(text.match(/\bMi[A-Z]\w+/g) ?? [])].filter(n => n !== c.name)
  while (queue.length) {
    const n = queue.shift()
    if (seen.has(n)) continue
    const t = lookup(n, c.path)
    if (!t) continue
    seen.set(n, t.def)
    for (const m of t.def.match(/\bMi[A-Z]\w+/g) ?? []) if (!seen.has(m)) queue.push(m)
  }
  return [...seen.values()]
}

const slotProps = s => { const t = clean(s.type).replace(/;\s*}$/, ' }'); return t && t !== '{}' && t !== 'any' ? t : undefined }
const comps = []
for (const f of files) {
  const name = basename(f, '.vue')
  const group = f.split('/')[0]
  const abs = join(root, 'app/components', f)
  const meta = checker.getComponentMeta(abs)
  const props = meta.props.filter(p => !p.global && !p.name.startsWith('aria') || p.name === 'ariaLabel').map(p => ({
    name: p.name, type: shape(p.schema) ?? fmt(p.schema, p.type), required: !!p.required,
    default: p.default !== undefined && clean(p.default) !== 'undefined' ? clean(p.default) : undefined, doc: clean(p.description) || undefined
  }))
  comps.push({
    name, group, path: `app/components/${f}`,
    summary: summaryOf(readFileSync(abs, 'utf8')),
    props,
    slots: meta.slots.map(s => ({ name: s.name, props: slotProps(s), doc: clean(s.description) || undefined })),
    emits: meta.events.map(e => ({ name: e.name, type: clean(e.type), doc: clean(e.description) || undefined })),
    // Exposed members with their signature, e.g. "openAt: (x: number, y: number, byKeyboard?: boolean) => void".
    exposed: meta.exposed.filter(e => !e.name.startsWith('$') && !e.name.startsWith('_') && !props.some(p => p.name === e.name))
      .map(e => { const t = clean(e.type); return t && t !== 'any' ? `${e.name}: ${t}` : e.name }),
  })
}

for (const c of comps) { c.internal = c.summary.startsWith('@internal'); c.types = typesFor(c) }
const pub = comps.filter(c => !c.internal)
const model = c => c.props.some(p => p.name === 'modelValue') && c.emits.some(e => e.name === 'update:modelValue')
const line = c => `- ${c.name}${model(c) ? ' [v-model]' : ''}: ${c.summary || '(no summary)'}`

// Block gallery inventory (docs/blocks.md) from site/app/blocks/catalog.ts and the meta.json files.
// catalog.ts also holds Vite globs, so only its `families` literal is evaluated.
const blocksDir = join(root, 'site/app/blocks')
const catalogSrc = readFileSync(join(blocksDir, 'catalog.ts'), 'utf8')
const families = new Function('c', 'return ' + catalogSrc.match(/export const families: BlockFamily\[\] = (\[[\s\S]*?\n\])\n/)[1])(
  (id, en, fr, ref) => ({ id, title: { en, fr }, ref }))
const blockFiles = new Set(readdirSync(blocksDir, { recursive: true }).filter(f => f.endsWith('.vue')).map(f => f.replace(/\.vue$/, '')))
const blockMeta = (fam, cat) => {
  const p = join(blocksDir, fam, cat, 'meta.json')
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []
}
const listedBlocks = new Set()
const blockSections = families.map(f => {
  const L = [`## ${f.title.en}`, '', f.summary.en]
  for (const c of f.categories) {
    if (c.ref) { L.push('', `### ${c.title.en}`, '', `Listed under ${families.find(x => x.id === c.ref).title.en}.`); continue }
    L.push('', `### ${c.title.en}`, '')
    for (const b of blockMeta(f.id, c.id)) {
      const key = `${f.id}/${c.id}/${b.file}`
      listedBlocks.add(key)
      L.push(`- \`${key}\` ${b.title.en}: ${b.summary.en}`)
    }
  }
  return L.join('\n')
})
const unlisted = [...blockFiles].filter(b => !listedBlocks.has(b))
const missing = [...listedBlocks].filter(b => !blockFiles.has(b))
if (unlisted.length || missing.length) {
  console.log([...unlisted.map(b => `block not in a meta.json of catalog.ts: ${b}`), ...missing.map(b => `meta.json entry without a .vue: ${b}`)].join('\n'))
  process.exit(1)
}
const blockCategories = families.reduce((n, f) => n + f.categories.filter(c => !c.ref).length, 0)
const blocksMd = [
  '# Application UI blocks',
  '',
  'Inventory of the Mica block gallery, generated from `site/app/blocks/catalog.ts` and the `meta.json` files by `scripts/gen-manifest.mjs`. Blocks are original, copy-pasteable sections built only with Mica components; each is one SFC at `site/app/blocks/<family>/<category>/<Name>.vue`, shown at `/blocks/<family>/<category>` on the site. Authoring rules: `site/app/blocks/README.md`.',
  '',
  `${listedBlocks.size} blocks in ${blockCategories} categories. Each line: \`<family>/<category>/<Name>\` title: summary.`,
  '',
  blockSections.join('\n\n'),
  ''
].join('\n')

const index = [
  '# Mica UI layer for Nuxt 4 (components prefixed Mi)',
  '',
  'Auto-registered as <MiName>. No imports, no setup. Theme: useMiTheme() (mode, primary, secondary).',
  'Details of one component: read docs/api/<MiName>.md (props, defaults, slots, emits). Do not read .vue sources.',
  'All tokens are CSS vars --mi-*; never hardcode colors.',
  'Brand vars: --mi-p / --mi-s (solid), -on (text on solid), -hover, -tint, -tint2 (soft fills), -text (readable text).',
  'Neutrals: --mi-page --mi-card --mi-elev --mi-label --mi-label2 --mi-label3 --mi-sep --mi-fill(2-4). Status: --mi-red --mi-orange --mi-green (+ -t text shades).',
  'Icons: <MiIcon name> takes any name listed in docs/api/MiIcon.md. A component `icon` prop uses its group set (MiNavIconName, MiFbIconName), listed under "## Types" in that component file.',
  'Item shapes (options, items, columns, steps...), slot props and every named type (icon names, row/column/menu item interfaces) are expanded in each docs/api file. Template expressions are plain JS (no TS `!`).',
  '',
  ...[...new Set(pub.map(c => c.group))].flatMap(g => [`## ${g}`, ...pub.filter(c => c.group === g).map(line), '']),
  '## Blocks',
  `- ${listedBlocks.size} ready-made application sections (dashboards, tables, forms, auth, billing, navigation...) built only with Mi components, one copy-pasteable SFC each at site/app/blocks/<family>/<category>/<Name>.vue.`,
  `- Pick one from docs/blocks.md (one line per block: path, title, summary), then read only that .vue file. Families: ${families.map(f => f.id).join(', ')}.`,
  '',
  '## Composables',
  '- useMiTheme(): { mode, primary, secondary, resolved, isDark, setMode(m), setPrimary(hex), setSecondary(hex) }',
  '- useMiToast(): { show(opts), success|error|warning|info|loading(message, opts?), update(id, opts), dismiss(id), clear, pause, resume }; mount <MiToaster /> once (docs/api/MiToaster.md, docs/api/MiToast.md)',
  '  toast opts: { message, description?, tone?, variant? (solid or material), action?: { label, onClick? }, duration? (ms, 0 = until dismissed, default 4000), dismissible?, onDismiss?, id? }',
  ''
].join('\n')

const md = c => {
  const L = [`# ${c.name}`, '', c.summary || '', '', `Group: ${c.group}. Source: ${c.path}`, model(c) ? 'Use with v-model.' : '']
  if (c.props.length) {
    L.push('', '## Props', '', '| prop | type | default | notes |', '|---|---|---|---|')
    for (const p of c.props) L.push(`| ${p.name}${p.required ? '*' : ''} | ${p.type.replace(/\|/g, '\\|')} | ${p.default ?? ''} | ${p.doc ?? ''} |`)
  }
  if (c.slots.length) L.push('', '## Slots', '', ...c.slots.map(s => `- ${s.name}${s.props ? ' `' + s.props + '`' : ''}${s.doc ? ': ' + s.doc : ''}`))
  if (c.emits.length) L.push('', '## Emits', '', ...c.emits.map(e => `- ${e.name}${e.type ? ' ' + e.type : ''}${e.doc ? ': ' + e.doc : ''}`))
  if (c.types.length) L.push('', '## Types', '', 'Named types used above (import with `import type { Name } from` the source file when needed).', '', '```ts', ...c.types, '```')
  if (c.exposed.length) L.push('', '## Exposed (template ref)', '', ...c.exposed.map(e => `- ${e}`))
  return L.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n') + '\n'
}

const out = new Map([['llms.txt', index], ['components.json', JSON.stringify(pub, null, 1) + '\n'], ['docs/blocks.md', blocksMd]])
for (const c of pub) out.set(`docs/api/${c.name}.md`, md(c))

if (check) {
  const stale = [...out].filter(([f, t]) => !existsSync(join(root, f)) || readFileSync(join(root, f), 'utf8') !== t).map(([f]) => f)
  if (stale.length) { console.log('stale generated files:\n' + stale.join('\n') + '\nrun: node scripts/gen-manifest.mjs'); process.exit(1) }
  console.log('manifest up to date'); process.exit(0)
}
rmSync(join(root, 'docs/api'), { recursive: true, force: true })
mkdirSync(join(root, 'docs/api'), { recursive: true })
for (const [f, t] of out) writeFileSync(join(root, f), t)
const noSum = pub.filter(c => !c.summary).length
const props = pub.flatMap(c => c.props), undoc = props.filter(p => !p.doc).length
console.log(`${pub.length} public components, ${noSum} without summary, ${undoc}/${props.length} props without doc`)
