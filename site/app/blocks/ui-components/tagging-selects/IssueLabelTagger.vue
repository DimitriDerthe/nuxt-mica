<template>
  <div class="ilt-cq">
    <section class="ilt" aria-labelledby="ilt-title">
      <div class="ilt__main">
        <header class="ilt__issue">
          <MiText variant="caption" tone="label3" weight="medium" class="ilt__key">MOB-233</MiText>
          <MiText id="ilt-title" variant="title3" as="h2" weight="semibold" balance>Push notification opens the wrong thread on Android 15</MiText>
          <ul class="ilt__chips" aria-label="Applied labels">
            <li v-for="l in pickedLabels" :key="l.value">
              <MiChip tone="neutral" size="small" removable :remove-label="'Remove label ' + l.label" @remove="toggle(l.value)">
                <span class="ilt__dot" :style="{ background: `var(--mi-${l.color})` }" />{{ l.label }}
              </MiChip>
            </li>
            <li v-if="!pickedLabels.length"><MiText variant="footnote" tone="label3">No labels yet</MiText></li>
          </ul>
        </header>

        <MiField label="Labels" hint="Type and Effort hold one label each: picking another swaps it.">
          <MiCombobox v-model="comboModel" :options="comboOptions" multiple clearable placeholder="Add labels" search-placeholder="Filter labels" />
        </MiField>

        <MiField label="Keywords" :hint="keywordHint" :error="rejected">
          <MiTagInput
            v-model="keywords" :max="6" :validate="validKeyword" placeholder="Add keyword, press Return"
            remove-label="Remove keyword" @reject="onReject" @add="rejected = ''"
          />
        </MiField>
      </div>

      <!-- Label picker drawn open next to its trigger; rows toggle the same labels. -->
      <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="40" label="Edit labels" class="ilt__pop">
        <template #trigger="{ attrs, toggle }">
          <MiButton v-bind="attrs" variant="gray" size="small" @click="toggle">
            <template #leading><MiIcon name="bookmark" :size="16" /></template>
            Edit labels
          </MiButton>
        </template>
        <div class="ilt__panel">
          <MiSearch v-model="query" size="compact" placeholder="Filter labels" aria-label="Filter labels" :cancelable="false" />
          <div class="ilt__scroll">
            <div v-for="g in filteredGroups" :key="g.name" role="group" :aria-label="g.name" class="ilt__group">
              <MiText variant="caption2" tone="label3" weight="semibold" class="ilt__group-name">
                {{ g.name }}<span v-if="g.exclusive"> · pick one</span>
              </MiText>
              <button
                v-for="l in g.items" :key="l.value" type="button" class="ilt__row" :aria-pressed="picked.includes(l.value)"
                @click="toggle(l.value)"
              >
                <span class="ilt__dot" :style="{ background: `var(--mi-${l.color})` }" />
                <span class="ilt__name">{{ l.label }}</span>
                <span class="ilt__count">{{ l.count }}</span>
                <MiIcon name="check" :size="15" class="ilt__tick" />
              </button>
            </div>
            <MiText v-if="!filteredGroups.length" variant="footnote" tone="label2" class="ilt__empty">No label matches “{{ query }}”.</MiText>
          </div>
        </div>
      </MiPopover>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Label { value: string, label: string, color: string, count: number, group: string }
const groups = [
  { name: 'Type', exclusive: true },
  { name: 'Area', exclusive: false },
  { name: 'Effort', exclusive: true }
]
const labels: Label[] = [
  { value: 'bug', label: 'bug', color: 'red', count: 128, group: 'Type' },
  { value: 'feature', label: 'feature', color: 'indigo', count: 94, group: 'Type' },
  { value: 'chore', label: 'chore', color: 'teal', count: 41, group: 'Type' },
  { value: 'android', label: 'android', color: 'green', count: 57, group: 'Area' },
  { value: 'notifications', label: 'notifications', color: 'orange', count: 23, group: 'Area' },
  { value: 'deep-links', label: 'deep-links', color: 'purple', count: 9, group: 'Area' },
  { value: 'onboarding', label: 'onboarding', color: 'pink', count: 15, group: 'Area' },
  { value: 'effort-s', label: 'effort: S', color: 'mint', count: 61, group: 'Effort' },
  { value: 'effort-m', label: 'effort: M', color: 'yellow', count: 48, group: 'Effort' },
  { value: 'effort-l', label: 'effort: L', color: 'orange', count: 19, group: 'Effort' }
]

const open = ref(true)
const picked = ref<string[]>(['bug', 'android', 'notifications', 'effort-m'])
const pickedLabels = computed(() => labels.filter(l => picked.value.includes(l.value)))

// Adding a label from an exclusive group pushes out its sibling.
function withLabel(list: string[], value: string) {
  const label = labels.find(l => l.value === value)
  const exclusive = groups.find(g => g.name === label?.group)?.exclusive
  const rest = exclusive ? list.filter(v => labels.find(l => l.value === v)?.group !== label?.group) : list
  return [...rest, value]
}
function toggle(value: string) {
  picked.value = picked.value.includes(value) ? picked.value.filter(v => v !== value) : withLabel(picked.value, value)
}

const comboOptions = labels.map(l => ({ value: l.value, label: l.label, group: l.group, description: `${l.count} issues` }))
const comboModel = computed<(string | number)[] | string | number | null>({
  get: () => picked.value,
  set: (next) => {
    const list = Array.isArray(next) ? next.map(String) : []
    const added = list.find(v => !picked.value.includes(v))
    picked.value = added ? withLabel(list.filter(v => v !== added), added) : list
  }
})

const query = ref('')
const filteredGroups = computed(() => groups
  .map(g => ({ ...g, items: labels.filter(l => l.group === g.name && l.label.includes(query.value.trim().toLowerCase())) }))
  .filter(g => g.items.length))

const keywords = ref<string[]>(['android-15', 'fcm', 'thread-id'])
const rejected = ref('')
const validKeyword = (tag: string) => /^[a-z0-9][a-z0-9-]{1,23}$/.test(tag)
const keywordHint = computed(() => `${keywords.value.length} of 6 · lowercase, digits and hyphens`)
function onReject(tag: string) {
  rejected.value = keywords.value.length >= 6 ? 'Six keywords at most.' : `“${tag}” is not a valid keyword: use lowercase, digits and hyphens.`
}
</script>

<style scoped>
.ilt-cq { container-type: inline-size; }
.ilt { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); align-items: start; font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 780px) { .ilt { grid-template-columns: minmax(0, 1fr) 296px; gap: 28px; } }

.ilt__main { display: grid; gap: 16px; min-width: 0; }
.ilt__issue { display: grid; gap: 8px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ilt__key { letter-spacing: .02em; }
.ilt__chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 0; padding: 0; list-style: none; }
.ilt__dot { display: inline-block; flex: none; width: 8px; height: 8px; margin-inline-end: 6px; border-radius: 50%; }

.ilt__panel { display: grid; gap: 10px; margin: -4px -6px; }
.ilt__scroll { display: grid; gap: 10px; max-height: 300px; overflow-y: auto; overscroll-behavior: contain; }
.ilt__group { display: grid; gap: 1px; }
.ilt__group-name { padding: 2px 8px 4px; text-transform: uppercase; letter-spacing: .06em; }
.ilt__row { display: flex; align-items: center; gap: 2px; width: 100%; padding: 7px 8px; border: 0; border-radius: var(--mi-radius-s); background: none; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
.ilt__row:hover { background: var(--mi-fill4); }
.ilt__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.ilt__row[aria-pressed="true"] { background: var(--mi-p-tint); }
.ilt__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ilt__count { margin-inline-end: 8px; font-size: 12px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.ilt__tick { color: var(--mi-p-text); opacity: 0; transform: scale(.6); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-spring); }
.ilt__row[aria-pressed="true"] .ilt__tick { opacity: 1; transform: none; }
.ilt__empty { padding: 8px; }
</style>
