<template>
  <div class="bfa">
    <section class="bfa__card" aria-labelledby="bfa-title">
      <header class="bfa__head">
        <div>
          <MiText id="bfa-title" variant="title3" as="h2" weight="semibold">Contracts</MiText>
          <MiText variant="footnote" tone="label2">Legal · shared drive</MiText>
        </div>
        <MiMenu v-model="sort" :items="sortItems" variant="popup" aria-label="Sort files" placement="bottom-end" />
      </header>

      <div class="bfa__layout">
        <div class="bfa__files">
          <div class="bfa__bar" :class="{ 'is-active': picked.length }">
            <MiCheckbox
              :model-value="allPicked" :indeterminate="somePicked" :label="picked.length ? `${picked.length} selected` : 'Select all'"
              @update:model-value="toggleAll"
            />
            <MiText as="span" variant="caption" tone="label2" aria-live="polite">{{ status }}</MiText>
          </div>

          <ul class="bfa__list" aria-label="Files">
            <li v-for="f in sorted" :key="f.id" class="bfa__row" :class="{ 'is-picked': picked.includes(f.id) }">
              <MiCheckbox :model-value="picked.includes(f.id)" :aria-label="`Select ${f.name}`" @update:model-value="toggle(f.id)" />
              <span class="bfa__icon" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
              <div class="bfa__text">
                <MiText variant="subheadline" weight="medium" :lines="1">{{ f.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ f.size }} · edited {{ f.edited }}</MiText>
              </div>
              <MiIcon v-if="f.starred" name="star" filled :size="16" label="Starred" class="bfa__star" />
            </li>
            <li v-if="!files.length" class="bfa__empty"><MiText variant="footnote" tone="label2">Folder is empty.</MiText></li>
          </ul>
        </div>

        <!-- Selection menu drawn open in place; it acts on every checked file. -->
        <div class="bfa__menu">
          <MiText variant="caption" tone="label3" weight="semibold" as="h3">Actions for selection</MiText>
          <MiContextMenu inline :items="actions" label="Selection actions" :width="240" highlighted="star" @select="run" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface FileRow { id: string, name: string, size: string, kb: number, edited: string, days: number, starred: boolean, folder?: string }
type MenuIcon = 'check' | 'folder' | 'share' | 'duplicate' | 'trash'

const files = ref<FileRow[]>([
  { id: 'f1', name: 'Master services agreement – Lumen Health.pdf', size: '1.2 MB', kb: 1200, edited: '2 h ago', days: 0, starred: true },
  { id: 'f2', name: 'NDA – Fjord Robotics (signed).pdf', size: '240 KB', kb: 240, edited: 'yesterday', days: 1, starred: false },
  { id: 'f3', name: 'Data processing addendum v3.docx', size: '88 KB', kb: 88, edited: '3 days ago', days: 3, starred: false },
  { id: 'f4', name: 'Office lease – Lyon, 2025 renewal.pdf', size: '3.4 MB', kb: 3400, edited: 'last week', days: 7, starred: false },
  { id: 'f5', name: 'Contractor agreement – Priya Raman.pdf', size: '410 KB', kb: 410, edited: 'Oct 2', days: 30, starred: true }
])
const picked = ref<string[]>(['f2', 'f3'])
const status = ref('')

const sortItems = [{ value: 'edited', label: 'Last edited' }, { value: 'name', label: 'Name' }, { value: 'size', label: 'Size' }]
const sort = ref<string | number | undefined>('edited')
const sorted = computed(() => [...files.value].sort((a, b) =>
  sort.value === 'name' ? a.name.localeCompare(b.name) : sort.value === 'size' ? b.kb - a.kb : a.days - b.days))

const allPicked = computed(() => files.value.length > 0 && picked.value.length === files.value.length)
const somePicked = computed(() => picked.value.length > 0 && !allPicked.value)

const actions = computed(() => {
  const none = !picked.value.length
  const allStarred = !none && picked.value.every(id => files.value.find(f => f.id === id)?.starred)
  const item = (id: string, label: string, icon: MenuIcon, shortcut?: string) => ({ id, label, icon, shortcut, disabled: none })
  return [
    item('star', allStarred ? 'Remove star' : 'Star', 'check', 'S'),
    item('move', 'Move to Archive', 'folder', 'M'),
    item('share', 'Share with Finance', 'share'),
    item('copy', 'Make a copy', 'duplicate', '⌘D'),
    { id: 'sep', type: 'separator' as const },
    { ...item('delete', none ? 'Delete' : `Delete ${picked.value.length} files`, 'trash', '⌫'), destructive: true }
  ]
})

function toggle(id: string): void {
  picked.value = picked.value.includes(id) ? picked.value.filter(x => x !== id) : [...picked.value, id]
}
function toggleAll(on: boolean): void {
  picked.value = on ? files.value.map(f => f.id) : []
}

function run(id: string): void {
  const chosen = files.value.filter(f => picked.value.includes(f.id))
  const n = chosen.length
  if (!n) return
  if (id === 'star') {
    const on = !chosen.every(f => f.starred)
    chosen.forEach((f) => { f.starred = on })
    status.value = `${on ? 'Starred' : 'Unstarred'} ${n} files`
    return
  }
  if (id === 'copy') {
    files.value.push(...chosen.map(f => ({ ...f, id: f.id + '-copy-' + files.value.length, name: 'Copy of ' + f.name, edited: 'just now', days: 0, starred: false })))
    status.value = `Copied ${n} files`
  } else if (id === 'share') {
    status.value = `Shared ${n} files with Finance`
    return
  } else {
    files.value = files.value.filter(f => !picked.value.includes(f.id))
    status.value = id === 'move' ? `Moved ${n} files to Archive` : `Deleted ${n} files`
  }
  picked.value = []
}
</script>

<style scoped>
.bfa { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.bfa__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bfa__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px 16px; }

.bfa__layout { display: grid; gap: 18px; }
.bfa__files { display: grid; min-width: 0; }
.bfa__bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px;
  padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4);
}
.bfa__bar.is-active { background: var(--mi-p-tint); }

.bfa__list { display: grid; margin: 0; padding: 0; list-style: none; }
.bfa__row { display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--mi-sep); }
.bfa__row.is-picked { background: color-mix(in srgb, var(--mi-p) 6%, transparent); }
.bfa__icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--mi-radius-s); background: var(--mi-fill3); color: var(--mi-label2); }
.bfa__text { min-width: 0; }
.bfa__star { color: var(--mi-orange); }
.bfa__empty { padding: 16px 12px; }

.bfa__menu { display: grid; align-content: start; justify-items: start; gap: 8px; }

@container (min-width: 760px) {
  .bfa__card { padding: 24px 28px; }
  .bfa__layout { grid-template-columns: minmax(0, 1fr) 240px; align-items: start; }
}
</style>
