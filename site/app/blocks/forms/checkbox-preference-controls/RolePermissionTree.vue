<template>
  <section class="rpt" aria-labelledby="rpt-title">
    <div class="rpt__grid">
      <div class="rpt__main">
        <header class="rpt__head">
          <div>
            <MiText id="rpt-title" variant="title3" as="h2" weight="semibold">Support lead</MiText>
            <MiText variant="footnote" tone="label2">Custom role · 6 people in Brightdesk use it</MiText>
          </div>
          <MiBadge :tone="preset === 'custom' ? 'warning' : 'primary'" :label="preset === 'custom' ? 'Edited' : `Same as ${presetLabel}`" />
        </header>

        <div class="rpt__presets">
          <MiText variant="footnote" tone="label2">Start from</MiText>
          <MiSegmented :model-value="preset" label="Start from a preset" :options="PRESET_OPTIONS" @update:model-value="applyPreset" />
        </div>

        <!-- Checking a section checks every action in it; partly checked sections show a dash. -->
        <MiTree
          v-model:expanded="expanded" class="rpt__tree" :items="TREE" checkable aria-label="Permissions"
          :selected="checked" @update:selected="onSelect"
        />
      </div>

      <aside class="rpt__side" aria-labelledby="rpt-sum-title">
        <MiText id="rpt-sum-title" variant="headline" as="h3">What this role can do</MiText>
        <ul class="rpt__areas">
          <li v-for="a in areas" :key="a.id">
            <div class="rpt__area-top">
              <MiText variant="footnote" weight="medium">{{ a.label }}</MiText>
              <MiText variant="caption" tone="label2" tabular>{{ a.on }} / {{ a.total }}</MiText>
            </div>
            <div class="rpt__bar" role="meter" :aria-label="`${a.label} permissions`" aria-valuemin="0" :aria-valuemax="a.total" :aria-valuenow="a.on">
              <span :style="{ transform: `scaleX(${a.on / a.total})` }" />
            </div>
          </li>
        </ul>

        <MiAlert v-if="sensitive.length" tone="warning" :title="`${sensitive.length} sensitive ${sensitive.length > 1 ? 'permissions' : 'permission'}`">
          {{ sensitive.join(', ') }}. These are logged and need two-step login.
        </MiAlert>

        <div class="rpt__foot">
          <MiText variant="caption" :tone="savedAt ? 'green' : 'label2'" aria-live="polite">{{ savedAt ? 'Saved for 6 people' : dirty ? 'Unsaved changes' : 'No changes' }}</MiText>
          <MiButton :disabled="!dirty" @click="save">Save role</MiButton>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Id = string | number
interface Leaf { id: string, label: string, sensitive?: boolean }
interface Area { id: string, label: string, icon: 'folder' | 'people' | 'billing' | 'settings', leaves: Leaf[] }

const AREAS: Area[] = [
  { id: 'tickets', label: 'Tickets', icon: 'folder', leaves: [{ id: 't.view', label: 'View tickets' }, { id: 't.reply', label: 'Reply and add notes' }, { id: 't.assign', label: 'Reassign' }, { id: 't.delete', label: 'Delete tickets', sensitive: true }] },
  { id: 'customers', label: 'Customers', icon: 'people', leaves: [{ id: 'c.view', label: 'View profiles' }, { id: 'c.edit', label: 'Edit contact details' }, { id: 'c.export', label: 'Export customer list', sensitive: true }] },
  { id: 'billing', label: 'Billing', icon: 'billing', leaves: [{ id: 'b.view', label: 'View invoices' }, { id: 'b.refund', label: 'Issue refunds', sensitive: true }, { id: 'b.plan', label: 'Change plan', sensitive: true }] },
  { id: 'workspace', label: 'Workspace', icon: 'settings', leaves: [{ id: 'w.invite', label: 'Invite people' }, { id: 'w.macros', label: 'Edit macros' }, { id: 'w.keys', label: 'Manage API keys', sensitive: true }] }
]
const TREE = AREAS.map(a => ({ id: a.id, label: a.label, icon: a.icon, children: a.leaves.map(l => ({ id: l.id, label: l.label })) }))
const LEAVES = AREAS.flatMap(a => a.leaves)

const PRESETS: Record<string, { label: string, ids: string[] }> = {
  viewer: { label: 'Viewer', ids: ['t.view', 'c.view', 'b.view'] },
  agent: { label: 'Agent', ids: ['t.view', 't.reply', 'c.view', 'c.edit', 'w.macros'] },
  admin: { label: 'Admin', ids: LEAVES.map(l => l.id) }
}
const PRESET_OPTIONS = [...Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.label })), { value: 'custom', label: 'Custom' }]

const initial = ['t.view', 't.reply', 't.assign', 'c.view', 'c.edit', 'b.view', 'b.refund', 'w.macros']
const checked = ref<Id[]>([...initial])
const saved = ref<Id[]>([...initial])
const expanded = ref<Id[]>(['tickets', 'billing'])
const savedAt = ref(false)

const same = (a: Id[], b: Id[]) => a.length === b.length && a.every(x => b.includes(x))
const preset = computed(() => Object.keys(PRESETS).find(k => same(checked.value, PRESETS[k]!.ids)) ?? 'custom')
const presetLabel = computed(() => PRESETS[preset.value]?.label ?? '')
const dirty = computed(() => !same(checked.value, saved.value))
const areas = computed(() => AREAS.map(a => ({ id: a.id, label: a.label, total: a.leaves.length, on: a.leaves.filter(l => checked.value.includes(l.id)).length })))
const sensitive = computed(() => LEAVES.filter(l => l.sensitive && checked.value.includes(l.id)).map(l => l.label))

function onSelect(v: Id | Id[] | null | undefined) {
  checked.value = Array.isArray(v) ? v : []
  savedAt.value = false
}
function applyPreset(v: string | number | null) {
  const p = PRESETS[String(v)]
  if (p) onSelect([...p.ids])
}
function save() {
  saved.value = [...checked.value]
  savedAt.value = true
}
</script>

<style scoped>
.rpt { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.rpt__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .rpt__grid { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }
.rpt__main { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.rpt__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }
.rpt__presets { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid var(--mi-sep); }
.rpt__tree { min-width: 0; }

.rpt__side { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rpt__areas { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.rpt__area-top { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.rpt__bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.rpt__bar span { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.rpt__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
</style>
