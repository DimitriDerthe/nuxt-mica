<template>
  <section class="ftb" aria-labelledby="ftb-title">
    <header class="ftb__head">
      <MiText id="ftb-title" variant="title3" as="h2" weight="semibold">Brand refresh 2025</MiText>
      <MiText variant="footnote" tone="label2">Shared drive · {{ fmtSize(sizeOf(ROOT)) }} · 3 collaborators</MiText>
    </header>

    <div class="ftb__layout">
      <nav class="ftb__tree" aria-label="Folders">
        <MiTree v-model:selected="selected" v-model:expanded="expanded" :items="treeItems" aria-label="Brand refresh files" />
      </nav>

      <article class="ftb__pane" aria-live="polite">
        <p class="ftb__path">{{ path.map(n => n.label).join(' / ') }}</p>

        <div class="ftb__hero">
          <span class="ftb__art" :class="'is-' + node.kind" aria-hidden="true"><MiIcon :name="ICON[node.kind]" :size="26" /></span>
          <div class="ftb__hero-text">
            <MiText variant="headline" as="h3" :lines="1">{{ node.label }}</MiText>
            <MiText variant="footnote" tone="label2">
              {{ node.children ? countFiles(node) + ' files · ' : '' }}{{ fmtSize(sizeOf(node)) }}{{ node.owner ? ' · ' + node.owner : '' }}
            </MiText>
          </div>
        </div>

        <!-- Folder: what is inside by type. File: its version history. -->
        <MiStackedBar
          v-if="node.children" :segments="mix" :height="10" :legend-columns="2"
          :aria-label="'Storage by file type in ' + node.label" :format-share="p => p.toFixed(0) + '%'"
        />
        <template v-else>
          <MiText variant="footnote" weight="semibold" as="h4">Versions</MiText>
          <ol class="ftb__versions">
            <li v-for="(v, i) in node.versions" :key="v.id" class="ftb__version">
              <MiAvatar :name="v.by" size="xs" tone="auto" decorative />
              <div class="ftb__version-text">
                <span><b>{{ v.by }}</b> · {{ v.when }}</span>
                <MiText variant="caption" tone="label2">{{ v.note }}</MiText>
              </div>
              <MiBadge v-if="i === 0" tone="primary" label="Current" />
              <MiButton v-else variant="plain" size="mini" @click="restore(v.id)">Restore</MiButton>
            </li>
          </ol>
        </template>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'folder' | 'doc' | 'image' | 'sheet'
interface Version { id: string, by: string, when: string, note: string }
interface FileNode { id: string, label: string, kind: Kind, size?: number, owner?: string, versions?: Version[], children?: FileNode[] }
interface TreeItem { id: string, label: string, icon: 'folder' | 'document' | 'image', children?: TreeItem[] }

const ICON: Record<Kind, 'folder' | 'document' | 'image'> = { folder: 'folder', doc: 'document', sheet: 'document', image: 'image' }
const KIND_LABEL: Record<Exclude<Kind, 'folder'>, string> = { doc: 'Documents', image: 'Images', sheet: 'Sheets' }
const KIND_COLOR: Record<Exclude<Kind, 'folder'>, string> = { doc: 'var(--mi-p)', image: 'var(--mi-s)', sheet: 'var(--mi-green)' }

const v = (id: string, by: string, when: string, note: string): Version => ({ id, by, when, note })
// Sizes in KB; swap for your storage API.
const ROOT: FileNode = {
  id: 'root', label: 'Brand refresh 2025', kind: 'folder', children: [
    { id: 'logo', label: 'Logo', kind: 'folder', children: [
      { id: 'mark', label: 'mark-final.png', kind: 'image', size: 2140, owner: 'Inès Morel', versions: [v('m3', 'Inès Morel', 'Today 11:20', 'Tightened the counter of the m'), v('m2', 'Tom Becker', 'Mon', 'Exported at 4096 px'), v('m1', 'Inès Morel', '12 May', 'First pass')] },
      { id: 'lockups', label: 'lockups.png', kind: 'image', size: 3820, owner: 'Inès Morel', versions: [v('l1', 'Inès Morel', 'Mon', 'Horizontal and stacked')] }
    ] },
    { id: 'guide', label: 'Guidelines', kind: 'folder', children: [
      { id: 'voice', label: 'Voice and tone.doc', kind: 'doc', size: 186, owner: 'Ade Okafor', versions: [v('vt2', 'Ade Okafor', 'Yesterday', 'Added do and don’t examples'), v('vt1', 'Ade Okafor', '2 May', 'Outline')] },
      { id: 'type', label: 'Typography.doc', kind: 'doc', size: 412, owner: 'Tom Becker', versions: [v('ty1', 'Tom Becker', 'Fri', 'Type scale and pairings')] }
    ] },
    { id: 'budget', label: 'Budget.sheet', kind: 'sheet', size: 64, owner: 'Ade Okafor', versions: [v('b2', 'Ade Okafor', 'Today 09:02', 'Agency invoice for May'), v('b1', 'Tom Becker', '28 Apr', 'Initial estimate')] }
  ]
}

const toItem = (n: FileNode): TreeItem => ({ id: n.id, label: n.label, icon: ICON[n.kind], children: n.children?.map(toItem) })
const treeItems = [toItem(ROOT)]

const files = ref(ROOT)
const selected = ref<string | number | (string | number)[] | null | undefined>('mark')
const expanded = ref<(string | number)[]>(['root', 'logo'])

function trail(n: FileNode, id: unknown): FileNode[] | null {
  if (n.id === id) return [n]
  for (const c of n.children ?? []) { const t = trail(c, id); if (t) return [n, ...t] }
  return null
}
const path = computed(() => trail(files.value, selected.value) ?? [files.value])
const node = computed(() => path.value[path.value.length - 1]!)

const leaves = (n: FileNode): FileNode[] => (n.children ? n.children.flatMap(leaves) : [n])
const sizeOf = (n: FileNode) => leaves(n).reduce((s, f) => s + (f.size ?? 0), 0)
const countFiles = (n: FileNode) => leaves(n).length
const fmtSize = (kb: number) => (kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB')

const mix = computed(() => (['image', 'doc', 'sheet'] as const)
  .map(k => ({ label: KIND_LABEL[k], color: KIND_COLOR[k], value: leaves(node.value).filter(f => f.kind === k).reduce((s, f) => s + (f.size ?? 0), 0) }))
  .filter(s => s.value > 0))

function restore(id: string) {
  const list = node.value.versions
  const old = list?.find(x => x.id === id)
  if (!list || !old) return
  list.unshift({ id: id + '-r' + list.length, by: 'You', when: 'Just now', note: 'Restored the version from ' + old.when })
}
</script>

<style scoped>
.ftb { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ftb__head { display: grid; gap: 2px; }
.ftb__layout { display: grid; gap: 12px; }
.ftb__tree, .ftb__pane { border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ftb__tree { padding: 8px; }
.ftb__pane { display: grid; align-content: start; gap: 14px; padding: 18px; }
.ftb__path { margin: 0; font-size: 12px; color: var(--mi-label3); overflow-wrap: anywhere; }
.ftb__hero { display: flex; align-items: center; gap: 14px; min-width: 0; }
.ftb__hero-text { display: grid; min-width: 0; }
.ftb__art { display: grid; place-items: center; flex: none; width: 56px; height: 56px; border-radius: var(--mi-radius-m); color: var(--mi-p-text); background: linear-gradient(145deg, var(--mi-p-tint), color-mix(in srgb, var(--mi-p) 26%, transparent)); }
.ftb__art.is-image { color: var(--mi-s-text); background: linear-gradient(145deg, var(--mi-s-tint), color-mix(in srgb, var(--mi-s) 30%, transparent)); }
.ftb__art.is-sheet { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }
.ftb__art.is-folder { color: var(--mi-label2); background: var(--mi-fill3); }
.ftb__versions { display: grid; margin: 0; padding: 0; list-style: none; }
.ftb__version { display: flex; align-items: center; gap: 10px; padding: 10px 0; }
.ftb__version + .ftb__version { border-top: 1px solid var(--mi-sep); }
.ftb__version-text { display: grid; flex: 1; min-width: 0; font-size: 13px; }
.ftb__version-text b { font-weight: 600; }

@container (min-width: 640px) {
  .ftb__layout { grid-template-columns: minmax(220px, 280px) minmax(0, 1fr); align-items: start; }
}
</style>
