<template>
  <div class="bat mi:@container mi:font-mi mi:text-label">
    <section class="bat__card mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[820px]:py-6 mi:@[820px]:px-7" aria-labelledby="bat-title">
      <header class="bat__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
        <div>
          <MiText id="bat-title" variant="title3" as="h2" weight="semibold">Tag photos</MiText>
          <MiText variant="footnote" tone="label2">Autumn lookbook · {{ picked.length }} of {{ assets.length }} selected</MiText>
        </div>
        <MiButton variant="plain" size="small" @click="picked = picked.length === assets.length ? [] : assets.map(a => a.id)">
          {{ picked.length === assets.length ? 'Select none' : 'Select all' }}
        </MiButton>
      </header>

      <div class="bat__layout mi:grid mi:gap-5 mi:@[820px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[820px]:items-start">
        <ul class="bat__grid mi:grid mi:grid-cols-2 mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-3" aria-label="Photos">
          <li v-for="a in assets" :key="a.id">
            <button type="button" class="bat__tile mi:grid mi:gap-1 mi:w-full mi:pt-1.5 mi:px-1.5 mi:pb-2.5 mi:[border:0] mi:rounded-lg mi:[background:var(--mi-fill4)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:shadow-[inset_0_0_0_2px_transparent] mi:aria-pressed:[background:var(--mi-p-tint)] mi:aria-pressed:shadow-[inset_0_0_0_2px_var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-pressed="picked.includes(a.id)" @click="togglePick(a.id)">
              <span class="bat__thumb mi:relative mi:block mi:aspect-[4_/_3] mi:rounded-md mi:[background:radial-gradient(circle_at_30%_35%,_color-mix(in_srgb,_var(--a)_70%,_var(--mi-card))_0_18%,_transparent_19%),_linear-gradient(160deg,_color-mix(in_srgb,_var(--a)_35%,_var(--mi-card)),_color-mix(in_srgb,_var(--a)_80%,_var(--mi-label)))]" :style="{ '--a': a.hue }" aria-hidden="true"><MiIcon v-if="picked.includes(a.id)" name="check" :size="14" class="bat__tick mi:absolute mi:top-1.5 mi:right-1.5 mi:p-[3px] mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on" /></span>
              <span class="bat__name mi:py-0 mi:px-1 mi:text-[13px] mi:font-semibold">{{ a.name }}</span>
              <span class="bat__count mi:py-0 mi:px-1 mi:text-[12px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ a.tags.length ? a.tags.join(', ') : 'No tags' }}</span>
            </button>
          </li>
        </ul>

        <!-- Tag picker for a mixed selection: a dash means only some selected photos carry the tag. -->
        <div class="bat__picker mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-lg mi:[background:var(--mi-elev)] mi:shadow-2">
          <MiText variant="headline" as="h3">Tags on selection</MiText>
          <MiSearch v-model="query" size="compact" placeholder="Find or create a tag" aria-label="Find or create a tag" @search="create" />
          <ul class="bat__tags mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Tags">
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
