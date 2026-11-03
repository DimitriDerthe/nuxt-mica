<template>
  <div class="ilt-cq mi:@container">
    <section class="ilt mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:font-mi mi:text-label mi:@[780px]:grid-cols-[minmax(0,_1fr)_296px] mi:@[780px]:gap-7" aria-labelledby="ilt-title">
      <div class="ilt__main mi:grid mi:gap-4 mi:min-w-0">
        <header class="ilt__issue mi:grid mi:gap-2 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
          <MiText variant="caption" tone="label3" weight="medium" class="ilt__key">MOB-233</MiText>
          <MiText id="ilt-title" variant="title3" as="h2" weight="semibold" balance>Push notification opens the wrong thread on Android 15</MiText>
          <ul class="ilt__chips mi:flex mi:flex-wrap mi:gap-1.5 mi:mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]" aria-label="Applied labels">
            <li v-for="l in pickedLabels" :key="l.value">
              <MiChip tone="neutral" size="small" removable :remove-label="'Remove label ' + l.label" @remove="toggle(l.value)">
                <span class="ilt__dot mi:inline-block mi:flex-[none] mi:w-2 mi:h-2 mi:me-1.5 mi:rounded-[50%]" :style="{ background: `var(--mi-${l.color})` }" />{{ l.label }}
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
        <div class="ilt__panel mi:grid mi:gap-2.5 mi:-my-1 mi:-mx-1.5">
          <MiSearch v-model="query" size="compact" placeholder="Filter labels" aria-label="Filter labels" :cancelable="false" />
          <div class="ilt__scroll mi:grid mi:gap-2.5 mi:max-h-75 mi:overflow-y-auto mi:overscroll-contain">
            <div v-for="g in filteredGroups" :key="g.name" role="group" :aria-label="g.name" class="ilt__group mi:grid mi:gap-px">
              <MiText variant="caption2" tone="label3" weight="semibold" class="ilt__group-name mi:pt-0.5 mi:px-2 mi:pb-1">
                {{ g.name }}<span v-if="g.exclusive"> · pick one</span>
              </MiText>
              <button
                v-for="l in g.items" :key="l.value" type="button" class="ilt__row mi:flex mi:items-center mi:gap-0.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-inherit mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-pressed="picked.includes(l.value)"
                @click="toggle(l.value)"
              >
                <span class="ilt__dot mi:inline-block mi:flex-[none] mi:w-2 mi:h-2 mi:me-1.5 mi:rounded-[50%]" :style="{ background: `var(--mi-${l.color})` }" />
                <span class="ilt__name mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ l.label }}</span>
                <span class="ilt__count mi:me-2 mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ l.count }}</span>
                <MiIcon name="check" :size="15" class="ilt__tick mi:text-p-text mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.ilt__row[aria-pressed='true']_&]:opacity-100" />
              </button>
            </div>
            <MiText v-if="!filteredGroups.length" variant="footnote" tone="label2" class="ilt__empty mi:p-2">No label matches “{{ query }}”.</MiText>
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
.ilt__key { letter-spacing: .02em; }
.ilt__group-name { text-transform: uppercase; letter-spacing: .06em; }
.ilt__row { font: inherit; font-size: 14px; }
.ilt__row:hover { background: var(--mi-fill4); }
.ilt__row[aria-pressed="true"] { background: var(--mi-p-tint); }
.ilt__tick { transform: scale(.6); }
.ilt__row[aria-pressed="true"] .ilt__tick { transform: none; }
</style>
