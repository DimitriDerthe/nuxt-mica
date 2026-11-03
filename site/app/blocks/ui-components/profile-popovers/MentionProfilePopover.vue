<template>
  <div class="mpp-cq mi:@container">
    <section class="mpp mi:grid mi:gap-5.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:font-mi mi:text-label mi:@[760px]:grid-cols-[minmax(0,_1fr)_296px] mi:@[760px]:gap-8" aria-labelledby="mpp-title">
      <div class="mpp__thread mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <MiText id="mpp-title" variant="headline" as="h2">PAY-1187 · Retry budget for card captures</MiText>
        <article v-for="c in comments" :key="c.id" class="mpp__comment mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-3 mi:pt-3.5 mi:[border-top:.5px_solid_var(--mi-sep)]">
          <MiAvatar :name="c.author" size="sm" tone="auto" decorative />
          <div class="mpp__comment-body mi:grid mi:gap-0.5 mi:min-w-0">
            <p class="mpp__meta mi:m-0 mi:text-[14px]"><strong>{{ c.author }}</strong> <span class="mi:[.mpp__meta_&]:text-[12px] mi:[.mpp__meta_&]:text-label3">{{ c.time }}</span></p>
            <p class="mpp__text mi:m-0 mi:text-[15px] mi:leading-[1.6] mi:text-label">
              <template v-for="(part, i) in c.parts" :key="i">
                <MiPopover v-if="part.person" placement="top-start" :width="260" :label="who(part).name" @update:model-value="(o) => o && pin(who(part).key)">
                  <template #trigger="{ attrs }">
                    <button v-bind="attrs" type="button" class="mpp__mention mi:inline mi:[border:0] mi:rounded-[6px] mi:bg-p-tint mi:text-p-text mi:cursor-pointer mi:hover:bg-p-tint2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]">@{{ who(part).handle }}</button>
                  </template>
                  <div class="mpp__mini mi:flex mi:items-center mi:gap-2.5">
                    <MiAvatar :name="who(part).name" size="sm" tone="auto" decorative />
                    <div>
                      <MiText variant="subheadline" weight="semibold">{{ who(part).name }}</MiText>
                      <MiText variant="caption" tone="label2">{{ who(part).role }} · {{ localTime(who(part).offset) }}</MiText>
                    </div>
                  </div>
                </MiPopover>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
          </div>
        </article>
        <MiText variant="caption" tone="label3">Tap a mention for a quick card; the full card pins on the right.</MiText>
      </div>

      <!-- Full profile card, open in place under its mention. -->
      <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="34" :label="person.name + ' profile'" class="mpp__pop">
        <template #trigger="{ attrs, toggle }">
          <button v-bind="attrs" type="button" class="mpp__mention mpp__mention--pinned mi:inline mi:[border:0] mi:rounded-[6px] mi:bg-p-tint mi:text-p-text mi:cursor-pointer mi:hover:bg-p-tint2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="toggle">@{{ person.handle }}</button>
        </template>

        <div class="mpp__card mi:grid mi:gap-4">
          <div class="mpp__who mi:flex mi:items-center mi:gap-3.5">
            <MiBadge dot-only :tone="person.available ? 'success' : 'warning'" placement="bottom-right" :dot-size="12" :aria-label="person.available ? 'Available' : 'Busy'">
              <template #target><MiAvatar :name="person.name" size="lg" tone="auto" decorative /></template>
            </MiBadge>
            <div class="mpp__id mi:grid mi:gap-px mi:min-w-0">
              <MiText variant="headline" as="h3">{{ person.name }}</MiText>
              <MiText variant="footnote" tone="label2">{{ person.role }}</MiText>
              <MiText variant="caption" :tone="person.available ? 'green' : 'orange'" weight="medium">{{ person.status }}</MiText>
            </div>
          </div>

          <!-- Their day on one track: working hours band and a "now" tick. -->
          <div class="mpp__day mi:grid mi:gap-1.5 mi:p-3 mi:rounded-md mi:bg-fill4">
            <div class="mpp__day-row mi:flex mi:justify-between mi:gap-2">
              <MiText variant="caption" weight="semibold" tabular>{{ localTime(person.offset) }} in {{ person.city }}</MiText>
              <MiText variant="caption" tone="label2">{{ gap(person.offset) }}</MiText>
            </div>
            <div class="mpp__track mi:relative mi:h-2 mi:rounded-[4px] mi:bg-fill3" role="img" :aria-label="dayLabel">
              <span class="mpp__band mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[inherit] mi:[background:color-mix(in_srgb,_var(--mi-p)_45%,_transparent)]" :style="{ left: '37.5%', width: '37.5%' }" />
              <span class="mpp__now mi:absolute mi:-top-1 mi:w-0.5 mi:h-4 mi:-ml-px mi:rounded-[1px] mi:bg-label" :style="{ left: (hour(person.offset) / 24) * 100 + '%' }" />
            </div>
            <MiText variant="caption2" tone="label3">{{ advice }}</MiText>
          </div>

          <dl class="mpp__stats mi:grid mi:grid-cols-3 mi:gap-2 mi:m-0">
            <div class="mi:[.mpp__stats_&]:grid mi:[.mpp__stats_&]:gap-0.5"><dt class="mi:[.mpp__stats_&]:text-[11px] mi:[.mpp__stats_&]:text-label2">Reviews</dt><dd class="mi:[.mpp__stats_&]:text-[14px] mi:[.mpp__stats_&]:font-semibold mi:[.mpp__stats_&]:tabular-nums">{{ person.reviews }}</dd></div>
            <div class="mi:[.mpp__stats_&]:grid mi:[.mpp__stats_&]:gap-0.5"><dt class="mi:[.mpp__stats_&]:text-[11px] mi:[.mpp__stats_&]:text-label2">Replies in</dt><dd class="mi:[.mpp__stats_&]:text-[14px] mi:[.mpp__stats_&]:font-semibold mi:[.mpp__stats_&]:tabular-nums">{{ person.reply }}</dd></div>
            <div class="mi:[.mpp__stats_&]:grid mi:[.mpp__stats_&]:gap-0.5"><dt class="mi:[.mpp__stats_&]:text-[11px] mi:[.mpp__stats_&]:text-label2">Shared</dt><dd class="mi:[.mpp__stats_&]:text-[14px] mi:[.mpp__stats_&]:font-semibold mi:[.mpp__stats_&]:tabular-nums">{{ person.shared }} channels</dd></div>
          </dl>

          <div class="mpp__actions mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2">
            <MiButton size="small" block>Message</MiButton>
            <MiButton size="small" variant="gray" block :pressed="following[person.key]" @click="following[person.key] = !following[person.key]">
              {{ following[person.key] ? 'Following' : 'Follow' }}
            </MiButton>
          </div>
        </div>
      </MiPopover>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Key = 'kenji' | 'sofia' | 'ruth'
interface Person { key: Key, name: string, handle: string, role: string, city: string, offset: number, available: boolean, status: string, reviews: number, reply: string, shared: number }

const people: Record<Key, Person> = {
  kenji: { key: 'kenji', name: 'Kenji Watanabe', handle: 'kenji', role: 'Staff engineer · Payments', city: 'Osaka', offset: 9, available: false, status: 'Focus mode until 18:00', reviews: 38, reply: '~2 h', shared: 4 },
  sofia: { key: 'sofia', name: 'Sofia Lindqvist', handle: 'sofia.l', role: 'Ledger lead · Finance platform', city: 'Stockholm', offset: 1, available: true, status: 'Available', reviews: 21, reply: '~20 min', shared: 6 },
  ruth: { key: 'ruth', name: 'Ruth Abebe', handle: 'ruth', role: 'Engineering manager', city: 'Addis Ababa', offset: 3, available: true, status: 'Available', reviews: 9, reply: '~1 h', shared: 7 }
}

type Part = { text?: string, person?: Key }
const who = (part: Part) => people[part.person ?? 'kenji']
const comments: { id: number, author: string, time: string, parts: Part[] }[] = [
  { id: 1, author: 'Ruth Abebe', time: '09:12', parts: [{ text: 'Can ' }, { person: 'kenji' }, { text: ' sanity-check the retry budget before Friday? ' }, { person: 'sofia' }, { text: ' already signed off on the ledger side.' }] },
  { id: 2, author: 'Sofia Lindqvist', time: '09:20', parts: [{ text: 'Yes, ledger is fine at 3 retries. ' }, { person: 'kenji' }, { text: ', the open question is the jitter window.' }] }
]

const nowUtc = 8.7 // 08:42 UTC, fixed for the demo
const viewerOffset = 1 // the reader is in Paris
const hour = (offset: number) => (((nowUtc + offset) % 24) + 24) % 24
const localTime = (offset: number) => { const h = hour(offset); return `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}` }
const gap = (offset: number) => { const d = offset - viewerOffset; return d === 0 ? 'Same time as you' : `${Math.abs(d)} h ${d > 0 ? 'ahead' : 'behind'}` }

const open = ref(true)
const pinned = ref<Key>('kenji')
const person = computed(() => people[pinned.value])
function pin(key: Key) { pinned.value = key }

const following = reactive<Record<Key, boolean>>({ kenji: false, sofia: true, ruth: false })

const dayLabel = computed(() => `Working hours 09:00 to 18:00, it is ${localTime(person.value.offset)} now`)
const advice = computed(() => {
  const h = hour(person.value.offset)
  if (h < 9) return `Starts in ${Math.ceil(9 - h)} h · a message now waits until morning`
  if (h >= 18) return 'Day is over · expect a reply tomorrow morning'
  if (h >= 17) return 'Last hour of their day · keep it short'
  return 'Inside working hours'
})
</script>

<style scoped>
.mpp__meta span { margin-inline-start: 6px; }
.mpp__text :deep(.mi-pop-anchor) { display: inline; }

.mpp__mention { padding: 1px 5px; font: inherit; font-weight: 600; }
.mpp__mention--pinned { padding: 4px 10px; font-size: 15px; }
.mpp__stats dd { margin: 0; }
</style>
