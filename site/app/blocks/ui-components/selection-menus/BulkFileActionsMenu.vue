<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[760px]:py-6 mi:@[760px]:px-7" aria-labelledby="bfa-title">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
        <div>
          <MiText id="bfa-title" variant="title3" as="h2" weight="semibold">Contracts</MiText>
          <MiText variant="footnote" tone="label2">Legal · shared drive</MiText>
        </div>
        <MiMenu v-model="sort" :items="sortItems" variant="popup" aria-label="Sort files" placement="bottom-end" />
      </header>

      <div class="mi:grid mi:gap-4.5 mi:@[760px]:grid-cols-[minmax(0,_1fr)_240px] mi:@[760px]:items-start">
        <div class="mi:grid mi:min-w-0">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-3 mi:py-2.5 mi:px-3 mi:rounded-md" :class="picked.length ? 'mi:bg-p-tint' : 'mi:bg-fill4'">
            <MiCheckbox
              :model-value="allPicked" :indeterminate="somePicked" :label="picked.length ? `${picked.length} selected` : 'Select all'"
              @update:model-value="toggleAll"
            />
            <MiText as="span" variant="caption" tone="label2" aria-live="polite">{{ status }}</MiText>
          </div>

          <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Files">
            <li v-for="f in sorted" :key="f.id" class="mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-2.5 mi:px-3 mi:border-b mi:border-b-sep" :class="picked.includes(f.id) ? 'mi:[background:color-mix(in_srgb,_var(--mi-p)_6%,_transparent)]' : ''">
              <MiCheckbox :model-value="picked.includes(f.id)" :aria-label="`Select ${f.name}`" @update:model-value="toggle(f.id)" />
              <span class="mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-sm mi:bg-fill3 mi:text-label2" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
              <div class="mi:min-w-0">
                <MiText variant="subheadline" weight="medium" :lines="1">{{ f.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ f.size }} · edited {{ f.edited }}</MiText>
              </div>
              <MiIcon v-if="f.starred" name="star" filled :size="16" label="Starred" class="mi:text-orange" />
            </li>
            <li v-if="!files.length" class="mi:py-4 mi:px-3"><MiText variant="footnote" tone="label2">Folder is empty.</MiText></li>
          </ul>
        </div>

        <!-- Selection menu drawn open in place; it acts on every checked file. -->
        <div class="mi:grid mi:content-start mi:justify-items-start mi:gap-2">
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
