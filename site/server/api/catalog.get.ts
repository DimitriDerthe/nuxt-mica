// Slim component catalog and llms.txt excerpt for the landing page, derived from the generated manifest.
import manifest from '../../../components.json'

interface Entry { name: string, group: string, summary: string }

export default defineEventHandler(async () => {
  const llms = String(await useStorage('assets:mica').getItem('llms.txt') ?? '')
  const groups = new Map<string, string[]>()
  const roots = (manifest as Entry[]).filter(c => !rootOf(c.name))
  for (const c of roots) groups.set(c.group, [...(groups.get(c.group) ?? []), c.name])
  return {
    total: roots.length,
    // Every documented <Mi…> tag, sub-parts of compound components included.
    all: (manifest as Entry[]).length,
    groups: [...groups].sort((a, b) => groupOrder.indexOf(a[0]) - groupOrder.indexOf(b[0])).map(([name, components]) => ({ name, components })),
    // The header plus the first component group: enough to show the shape of the file.
    llms: llms.split('\n## Buttons')[0]!.trim()
  }
})
