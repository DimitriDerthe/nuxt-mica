// Typed access to the layer's generated manifest (components.json), the single source of the API docs.
import manifest from '../../../components.json'

export interface ManifestProp { name: string, type: string, required: boolean, default?: string, doc?: string }
export interface ManifestEntry {
  name: string
  group: string
  path: string
  summary: string
  props: ManifestProp[]
  slots: { name: string, props?: string, doc?: string }[]
  emits: { name: string, type?: string, doc?: string }[]
  exposed: string[]
  types: string[]
}

export const components = manifest as unknown as ManifestEntry[]
export const groupOrder = ['Base', 'Buttons', 'Controls', 'Inputs', 'Navigation', 'Feedback', 'Content', 'Charts', 'Chat', 'Ai']

/** Compound components: their sub-parts (MiTabsTrigger, MiAttachmentAction...) live on the root's page, not in the lists. */
const compoundRoots = ['MiAttachment', 'MiCodeBlock', 'MiQuestionnaire', 'MiTrace', 'MiTabs', 'MiMessage', 'MiMessageScroller', 'MiBubble', 'MiToggle', 'MiKbd']

/** Root of a sub-part (longest compound root that prefixes it at a word boundary), or null for a standalone component. */
export function rootOf(name: string): string | null {
  if (compoundRoots.includes(name)) return null
  const root = compoundRoots.filter(r => name !== r && name.startsWith(r) && /[A-Z]/.test(name[r.length] ?? '')).sort((a, b) => b.length - a.length)[0]
  return root ?? null
}

// French API descriptions: key -> [english source, french]. A translation applies only while its source text is unchanged.
import frApi from '../../i18n/api.fr.json'
const fr = frApi as Record<string, [string, string]>
const tr = (key: string, en?: string) => (en && fr[key]?.[0] === en ? fr[key]![1] : en)

/** Entry with its descriptions in `lang` (English when untranslated or stale). */
export function localize<T extends ManifestEntry>(e: T, lang?: string): T {
  if (lang !== 'fr') return e
  return {
    ...e,
    summary: tr(`${e.name}#summary`, e.summary) ?? e.summary,
    props: e.props.map(p => ({ ...p, doc: tr(`${e.name}.prop.${p.name}`, p.doc) })),
    slots: e.slots.map(s => ({ ...s, doc: tr(`${e.name}.slot.${s.name}`, s.doc) })),
    emits: e.emits.map(x => ({ ...x, doc: tr(`${e.name}.emit.${x.name}`, x.doc) }))
  }
}
