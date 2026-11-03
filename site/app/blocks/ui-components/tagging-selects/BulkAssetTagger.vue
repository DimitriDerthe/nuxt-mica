<template>
  <div class="bat">
    <section class="bat__card" aria-labelledby="bat-title">
      <header class="bat__head">
        <div>
          <MiText id="bat-title" variant="title3" as="h2" weight="semibold">Tag photos</MiText>
          <MiText variant="footnote" tone="label2">Autumn lookbook · {{ picked.length }} of {{ assets.length }} selected</MiText>
        </div>
        <MiButton variant="plain" size="small" @click="picked = picked.length === assets.length ? [] : assets.map(a => a.id)">
          {{ picked.length === assets.length ? 'Select none' : 'Select all' }}
        </MiButton>
      </header>

      <div class="bat__layout">
        <ul class="bat__grid" aria-label="Photos">
          <li v-for="a in assets" :key="a.id">
            <button type="button" class="bat__tile" :aria-pressed="picked.includes(a.id)" @click="togglePick(a.id)">
              <span class="bat__thumb" :style="{ '--a': a.hue }" aria-hidden="true"><MiIcon v-if="picked.includes(a.id)" name="check" :size="14" class="bat__tick" /></span>
              <span class="bat__name">{{ a.name }}</span>
              <span class="bat__count">{{ a.tags.length ? a.tags.join(', ') : 'No tags' }}</span>
            </button>
          </li>
        </ul>

        <!-- Tag picker for a mixed selection: a dash means only some selected photos carry the tag. -->
        <div class="bat__picker">
          <MiText variant="headline" as="h3">Tags on selection</MiText>
          <MiSearch v-model="query" size="compact" placeholder="Find or create a tag" aria-label="Find or create a tag" @search="create" />
          <ul class="bat__tags" aria-label="Tags">
            <li v-for="t in tagRows" :key="t.name" class="bat__tag">
              <MiCheckbox
                :model-value="t.state === 'all'" :indeterminate="t.state === 'some'" :disabled="!picked.length"
                :label="t.name" :description="t.state === 'some' ? `On ${t.on} of ${picked.length}` : undefined"
                @update:model-value="apply(t.name, $event)"
              />
            </li>
            <li v-if="canCreate" class="bat__create">
              <MiButton variant="tinted" size="small" :disabled="!picked.length" @click="create">
                <template #leading><MiIcon name="plus" :size="14" /></template>
                Create “{{ query.trim() }}”
              </MiButton>
            </li>
          </ul>
          <MiText variant="caption" tone="label3" aria-live="polite">{{ note }}</MiText>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Asset { id: string, name: string, hue: string, tags: string[] }

const tags = ref(['Outdoor', 'Knitwear', 'Model: Sana', 'Model: Theo', 'Hero shot', 'Needs retouch'])
const assets = ref<Asset[]>([
  { id: 'p1', name: 'IMG_2041.jpg', hue: 'var(--mi-p)', tags: ['Outdoor', 'Knitwear', 'Model: Sana'] },
  { id: 'p2', name: 'IMG_2044.jpg', hue: 'var(--mi-s)', tags: ['Outdoor', 'Model: Sana', 'Hero shot'] },
  { id: 'p3', name: 'IMG_2050.jpg', hue: 'var(--mi-orange)', tags: ['Knitwear'] },
  { id: 'p4', name: 'IMG_2057.jpg', hue: 'var(--mi-green)', tags: ['Model: Theo', 'Needs retouch'] },
  { id: 'p5', name: 'IMG_2063.jpg', hue: 'var(--mi-red)', tags: [] },
  { id: 'p6', name: 'IMG_2071.jpg', hue: 'var(--mi-p-hover)', tags: ['Outdoor'] }
])
const picked = ref<string[]>(['p1', 'p2', 'p3'])
const query = ref('')
const note = ref('')

const selection = computed(() => assets.value.filter(a => picked.value.includes(a.id)))
const tagRows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return tags.value.filter(t => t.toLowerCase().includes(q)).map((name) => {
    const on = selection.value.filter(a => a.tags.includes(name)).length
    const state = !on ? 'none' : on === selection.value.length ? 'all' : 'some'
    return { name, on, state }
  })
})
const canCreate = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q.length > 1 && !tags.value.some(t => t.toLowerCase() === q)
})

function togglePick(id: string): void {
  picked.value = picked.value.includes(id) ? picked.value.filter(x => x !== id) : [...picked.value, id]
}

function apply(name: string, on: boolean): void {
  selection.value.forEach((a) => {
    a.tags = on ? (a.tags.includes(name) ? a.tags : [...a.tags, name]) : a.tags.filter(t => t !== name)
  })
  note.value = `${on ? 'Added' : 'Removed'} “${name}” ${on ? 'to' : 'from'} ${selection.value.length} photos`
}

function create(): void {
  if (!canCreate.value || !picked.value.length) return
  const name = query.value.trim()
  tags.value.push(name)
  apply(name, true)
  query.value = ''
}
</script>

<style scoped>
.bat { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.bat__card { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bat__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px 16px; }

.bat__layout { display: grid; gap: 20px; }
.bat__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.bat__tile {
  display: grid; gap: 4px; width: 100%; padding: 6px 6px 10px; border: 0; border-radius: var(--mi-radius-l);
  background: var(--mi-fill4); color: inherit; font: inherit; text-align: start; cursor: pointer;
  box-shadow: inset 0 0 0 2px transparent;
}
.bat__tile[aria-pressed="true"] { background: var(--mi-p-tint); box-shadow: inset 0 0 0 2px var(--mi-p); }
.bat__tile:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
/* Drawn thumbnail: two token gradients, no image files. */
.bat__thumb {
  position: relative; display: block; aspect-ratio: 4 / 3; border-radius: var(--mi-radius-m);
  background: radial-gradient(circle at 30% 35%, color-mix(in srgb, var(--a) 70%, var(--mi-card)) 0 18%, transparent 19%),
    linear-gradient(160deg, color-mix(in srgb, var(--a) 35%, var(--mi-card)), color-mix(in srgb, var(--a) 80%, var(--mi-label)));
}
.bat__tick { position: absolute; top: 6px; right: 6px; padding: 3px; border-radius: 50%; background: var(--mi-p); color: var(--mi-p-on); }
.bat__name { padding: 0 4px; font-size: 13px; font-weight: 600; }
.bat__count { padding: 0 4px; font-size: 12px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bat__picker { display: grid; align-content: start; gap: 12px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh2); }
.bat__tags { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }

@container (min-width: 520px) { .bat__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@container (min-width: 820px) {
  .bat__card { padding: 24px 28px; }
  .bat__layout { grid-template-columns: minmax(0, 1fr) 280px; align-items: start; }
}
</style>
