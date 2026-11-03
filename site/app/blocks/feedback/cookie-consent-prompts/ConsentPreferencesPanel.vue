<template>
  <section class="cpp mi:@container mi:font-mi mi:text-label" aria-labelledby="cpp-title">
    <div class="cpp__stage mi:relative mi:grid mi:place-items-center mi:min-h-130 mi:py-5 mi:px-3 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:color-mix(in_srgb,_var(--mi-label)_22%,_var(--mi-page))] mi:@[640px]:py-10 mi:@[640px]:px-7">
      <div class="cpp__backdrop mi:absolute mi:inset-0 mi:-z-1 mi:grid mi:content-start mi:gap-3 mi:p-7 mi:opacity-35" aria-hidden="true"><i class="mi:[.cpp__backdrop_&]:block mi:[.cpp__backdrop_&]:h-3 mi:[.cpp__backdrop_&]:rounded-[6px] mi:[.cpp__backdrop_&]:bg-card mi:[.cpp__backdrop_&:first-child]:w-[55%] mi:[.cpp__backdrop_&:first-child]:h-6.5 mi:[.cpp__backdrop_&:first-child]:mb-2.5 mi:[.cpp__backdrop_&:nth-child(3n)]:w-[82%]" v-for="n in 7" :key="n" /></div>

      <div v-if="open" class="cpp__panel mi:grid mi:gap-4 mi:w-full mi:max-w-215 mi:p-4.5 mi:rounded-xl mi:bg-elev mi:shadow-3 mi:@[640px]:p-6" role="dialog" aria-modal="false" aria-labelledby="cpp-title">
        <header class="cpp__head mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
          <div>
            <MiText id="cpp-title" variant="title3" as="h2" weight="semibold">Privacy preferences</MiText>
            <MiText variant="footnote" tone="label2">Fernhall Journal · choices are kept for 6 months</MiText>
          </div>
          <MiIconButton label="Close preferences" variant="gray" size="small" @click="open = false">
            <MiIcon name="close" :size="16" />
          </MiIconButton>
        </header>

        <MiAlert v-if="gpc" tone="info" title="Global Privacy Control detected">
          Your browser asks sites not to sell or share data, so advertising starts switched off.
        </MiAlert>

        <div class="cpp__body mi:grid mi:gap-4 mi:@[780px]:grid-cols-[minmax(0,_1fr)_240px] mi:@[780px]:items-start">
          <ul class="cpp__list mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:rounded-lg mi:border mi:border-sep">
            <li v-for="c in categories" :key="c.id" class="cpp__cat mi:grid mi:gap-1 mi:pt-3.5 mi:px-3.5 mi:pb-2 mi:[.cpp__cat+&]:border-t mi:[.cpp__cat+&]:border-t-sep">
              <div class="cpp__cat-head mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
                <div class="cpp__cat-title mi:grid mi:gap-0.5 mi:min-w-0">
                  <MiText :id="'cpp-c-' + c.id" variant="subheadline" weight="semibold" as="h3">{{ c.label }}</MiText>
                  <MiText variant="caption" tone="label2">{{ c.desc }}</MiText>
                </div>
                <MiBadge v-if="c.locked" label="Always on" tone="neutral" variant="outline" />
                <MiSwitch v-else v-model="c.on" :aria-labelledby="'cpp-c-' + c.id" />
              </div>
              <MiCollapsible :title="`${c.partners.length} ${c.partners.length === 1 ? 'service' : 'services'} · kept up to ${c.longest}`">
                <ul class="cpp__partners mi:[list-style:none] mi:m-0 mi:pt-1 mi:px-0 mi:pb-1.5 mi:grid mi:gap-1.5">
                  <li class="mi:[.cpp__partners_&]:grid mi:[.cpp__partners_&]:grid-cols-[minmax(0,_1fr)_auto] mi:[.cpp__partners_&]:gap-y-0 mi:[.cpp__partners_&]:gap-x-3 mi:[.cpp__partners_&]:text-[13px]" v-for="p in c.partners" :key="p.name">
                    <span class="cpp__p-name mi:font-medium">{{ p.name }}</span>
                    <span class="cpp__p-why mi:row-[2] mi:text-label2 mi:text-[12px]">{{ p.why }}</span>
                    <span class="cpp__p-keep mi:row-[span_2] mi:self-center mi:text-label3 mi:text-[12px] mi:tabular-nums">{{ p.keep }}</span>
                  </li>
                </ul>
              </MiCollapsible>
            </li>
          </ul>

          <!-- Plain-language receipt of what the current switches mean, updated as you toggle. -->
          <aside class="cpp__plain mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4" aria-labelledby="cpp-plain">
            <MiText id="cpp-plain" variant="caption" tone="label3" weight="semibold" class="cpp__caps">In plain words</MiText>
            <ul class="cpp__says mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-2.5 mi:text-[13px] mi:leading-[1.4]" aria-live="polite">
              <li class="mi:[.cpp__says_li&]:grid-cols-[20px_1fr] mi:[.cpp__says_li&]:gap-2 mi:[.cpp__says_li&]:items-start mi:[.cpp__says_li&[data-on='false']]:text-label2" v-for="c in categories" :key="c.id" :data-on="c.on">
                <MiIcon class="mi:[.cpp__says_li&]:grid-cols-[20px_1fr] mi:[.cpp__says_li&]:gap-2 mi:[.cpp__says_li&]:items-start mi:[.cpp__says_li&[data-on='false']]:text-label2" :name="c.on ? 'check' : 'close'" :size="14" :weight="2.4" />
                <span>{{ c.on ? c.yes : c.no }}</span>
              </li>
            </ul>
          </aside>
        </div>

        <footer class="cpp__foot mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:pt-4 mi:border-t mi:border-t-sep mi:@[560px]:flex mi:@[560px]:[justify-content:flex-end]">
          <MiButton variant="gray" @click="setAll(false)">Reject all</MiButton>
          <MiButton variant="gray" @click="setAll(true)">Accept all</MiButton>
          <MiButton class="cpp__save mi:col-span-full" @click="save">Save my choices</MiButton>
        </footer>
      </div>

      <div v-else class="cpp__closed mi:grid mi:justify-items-center mi:gap-2.5 mi:py-5 mi:px-6 mi:rounded-xl mi:bg-elev mi:shadow-2 mi:text-center">
        <MiText variant="footnote" tone="label2" role="status">{{ status }}</MiText>
        <MiButton variant="tinted" size="small" @click="open = true">Privacy preferences</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Partner { name: string, why: string, keep: string }

// Sample categories and services; swap for your consent manager's vendor list.
const categories = reactive([
  {
    id: 'essential', label: 'Essential', desc: 'Sign-in, subscription paywall and security.', on: true, locked: true, longest: '30 days',
    yes: 'Keeps you signed in and your subscription working.', no: '',
    partners: [{ name: 'Fernhall session', why: 'Sign-in', keep: '30 days' }, { name: 'Edge shield', why: 'Bot and abuse checks', keep: '24 hours' }] as Partner[]
  },
  {
    id: 'reading', label: 'Reading preferences', desc: 'Text size, saved articles and dark mode on this device.', on: true, locked: false, longest: '1 year',
    yes: 'Remembers text size and saved articles here.', no: 'Forgets your text size and saved articles on each visit.',
    partners: [{ name: 'Fernhall preferences', why: 'Display settings', keep: '1 year' }] as Partner[]
  },
  {
    id: 'audience', label: 'Audience measurement', desc: 'Counts readers per article, without building a profile of you.', on: false, locked: false, longest: '13 months',
    yes: 'Counts your visits anonymously to rank articles.', no: 'Does not count your visits.',
    partners: [{ name: 'Tallyhouse Analytics', why: 'Page counts', keep: '13 months' }, { name: 'Scroll depth', why: 'Reading time', keep: '30 days' }] as Partner[]
  },
  {
    id: 'ads', label: 'Personalised advertising', desc: 'Lets partners choose ads from your reading on other sites.', on: false, locked: false, longest: '6 months',
    yes: 'Shares reading interests with 4 ad partners.', no: 'Shows ads, but none chosen from your reading.',
    partners: [{ name: 'Brightline Ads', why: 'Ad selection', keep: '6 months' }, { name: 'Marlow Exchange', why: 'Ad auction', keep: '90 days' }, { name: 'Quayside Retarget', why: 'Follow-up ads', keep: '6 months' }, { name: 'Tern Attribution', why: 'Campaign reports', keep: '30 days' }] as Partner[]
  }
])

const gpc = true
const open = ref(true)
const status = ref('Preferences closed without changes.')

function setAll(on: boolean) {
  categories.forEach((c) => { c.on = c.locked || on })
  save()
}
function save() {
  const n = categories.filter(c => c.on).length
  status.value = `Saved: ${n} of ${categories.length} categories on.`
  open.value = false
}
</script>

<style scoped>
.cpp__panel { animation: cpp-in var(--mi-dur-4) var(--mi-spring) both; }
@keyframes cpp-in { from { opacity: 0; transform: translateY(12px) scale(.98); } }
.cpp__caps { text-transform: uppercase; letter-spacing: .06em; }
.cpp__says li { display: grid; }
.cpp__says li :deep(svg) { margin-top: 1px; padding: 3px; box-sizing: content-box; border-radius: 50%; }
.cpp__says li[data-on="true"] :deep(svg) { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }
.cpp__says li[data-on="false"] :deep(svg) { color: var(--mi-label3); background: var(--mi-fill3); }
@media (prefers-reduced-motion: reduce) { .cpp__panel { animation: none; } }
</style>
