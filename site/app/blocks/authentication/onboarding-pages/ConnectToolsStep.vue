<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="cts-title">
    <div class="mi:grid mi:gap-5 mi:[grid-template-areas:'head'_'meter'_'grid'_'foot'] mi:@[900px]:grid-cols-[minmax(0,_1fr)_290px] mi:@[900px]:[grid-template-areas:'head_head'_'grid_meter'_'foot_foot'] mi:@[900px]:gap-x-6 mi:@[900px]:gap-y-5.5 mi:@[1100px]:grid-cols-[minmax(0,_1fr)_320px] mi:@[1100px]:gap-x-8">
      <header class="mi:[grid-area:head] mi:grid mi:gap-1.5 mi:max-w-155">
        <MiText variant="caption" weight="semibold" tone="primary" class="mi:tracking-[.02em]!">Step 3 of 4 · Integrations</MiText>
        <MiText id="cts-title" as="h2" variant="title1" weight="bold" balance>Bring your tools along</MiText>
        <MiText variant="subheadline" tone="label2">Connect what Kestrel Labs already uses. Fernway only reads what each project needs, and you can disconnect any time.</MiText>
      </header>

      <!-- Hours meter: each connection adds its own segment, measured against a full workday. -->
      <aside class="mi:[grid-area:meter] mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:radial-gradient(100%_90%_at_100%_0%,_var(--mi-p-tint),_transparent_65%),_var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh1)] mi:@[560px]:py-5 mi:@[560px]:px-5.5 mi:@[900px]:self-stretch mi:@[900px]:grid-rows-[auto_auto_auto_auto_1fr_auto] mi:@[900px]:p-5.5 mi:@[900px]:gap-3.5" aria-labelledby="cts-meter-title">
        <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3">
          <MiText id="cts-meter-title" as="h3" variant="footnote" weight="semibold" tone="label2">Estimated time saved</MiText>
          <p class="mi:flex mi:items-baseline mi:gap-1.5 mi:m-0 mi:@[900px]:basis-full" aria-live="polite"><span class="mi:text-[34px] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums mi:@[900px]:text-[44px]">{{ hours.toFixed(1) }}</span><span class="mi:text-[13px] mi:font-medium mi:text-label2">h / week</span></p>
        </div>
        <div
          class="mi:relative mi:h-3 mi:rounded-[6px] mi:overflow-hidden mi:[background:var(--mi-fill3)]" role="meter" aria-label="Hours saved per week" :aria-valuenow="+hours.toFixed(1)" aria-valuemin="0" :aria-valuemax="MAX"
          :aria-valuetext="`${hours.toFixed(1)} hours a week`"
        >
          <span
            v-for="(t, i) in tools" :key="t.id" class="mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]"
            :style="{ transform: `scaleX(${ends[i]! / MAX})`, zIndex: tools.length - i, background: t.color }"
          />
          <span v-for="(t, i) in tools" :key="'cut-' + t.id" class="mi:absolute mi:inset-0 mi:pointer-events-none mi:z-20 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:bottom-0 mi:before:-left-px mi:before:w-0.5 mi:before:[background:var(--mi-card)]" :class="t.on ? 'mi:opacity-100' : 'mi:opacity-0'" :style="{ transform: `translateX(${ends[i]! / MAX * 100}%)` }" />
          <span class="mi:absolute mi:inset-0 mi:z-21 mi:pointer-events-none mi:before:content-[''] mi:before:absolute mi:before:top-0.5 mi:before:bottom-0.5 mi:before:-left-px mi:before:w-0.5 mi:before:rounded-[1px] mi:before:[background:var(--mi-label)] mi:before:opacity-55" :style="{ transform: `translateX(${8 / MAX * 100}%)` }" />
        </div>
        <div class="mi:relative mi:flex mi:h-4 mi:overflow-hidden mi:-mt-1 mi:text-[11px] mi:text-label3" aria-hidden="true">
          <span>0 h</span>
          <span class="mi:absolute mi:inset-0 mi:pointer-events-none" :style="{ transform: `translateX(${8 / MAX * 100}%)` }"><span class="mi:absolute mi:right-full mi:-mr-px mi:pr-0 mi:whitespace-nowrap mi:transform-[translateX(50%)]">a full workday</span></span>
        </div>
        <ul v-if="connected.length" class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2">
          <li class="mi:inline-flex mi:items-center mi:gap-1.5" v-for="t in connected" :key="t.id"><i class="mi:w-2 mi:h-2 mi:rounded-[2px]" :style="{ background: t.color }" />{{ t.name }}<b class="mi:tabular-nums mi:font-semibold mi:text-label">{{ t.hours.toFixed(1) }} h</b></li>
        </ul>
        <MiText v-else variant="caption" tone="label3">Turn on a tool to see what it gives back.</MiText>
        <div v-if="best" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5 mi:pt-2.5 mi:pr-2.5 mi:pb-2.5 mi:pl-2.5 mi:rounded-md mi:[background:var(--mi-fill4)] mi:@[900px]:self-end">
          <span class="mi:rounded-[11px] mi:grid mi:place-items-center mi:w-9.5 mi:h-9.5 mi:text-[14px] mi:font-bold mi:tracking-[-.02em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_22%,_transparent)]" :style="{ '--tint': best.color }" aria-hidden="true">{{ best.mark }}</span>
          <MiText as="span" variant="footnote" tone="label2">Biggest gain left: <strong class="mi:text-label mi:font-semibold">{{ best.name }}</strong>, +{{ best.hours.toFixed(1) }} h</MiText>
          <MiButton variant="tinted" size="small" :disabled="!!busy" @click="toggle(best.id, true)">Connect</MiButton>
        </div>
        <MiText variant="caption" tone="label3" class="mi:pt-2.5 mi:border-t mi:border-t-sep">Median for 2,400 teams of 2–10 people in their first month.</MiText>
      </aside>

      <ul class="mi:[grid-area:grid] mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:content-start mi:@[560px]:grid-cols-2" aria-label="Integrations">
        <li v-for="t in tools" :key="t.id" class="mi:relative mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-start mi:gap-3 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-green)_55%,_transparent)] mi:after:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] " :class="t.on ? 'mi:after:opacity-100' : 'mi:after:opacity-0'">
          <span class="mi:rounded-[11px] mi:grid mi:place-items-center mi:w-9.5 mi:h-9.5 mi:text-[14px] mi:font-bold mi:tracking-[-.02em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_22%,_transparent)]" :style="{ '--tint': t.color }" aria-hidden="true">{{ t.mark }}</span>
          <div class="mi:grid mi:gap-[3px] mi:min-w-0">
            <span :id="'cts-n-' + t.id" class="mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]">{{ t.name }}</span>
            <span class="mi:text-[13px] mi:leading-[1.4] mi:text-label2">{{ t.desc }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:min-h-4.5 mi:mt-1 mi:text-[12px] mi:font-medium mi:text-[color:var(--mi-green-t,_var(--mi-green))]" aria-live="polite">
              <template v-if="busy === t.id"><MiSpinner size="sm" label="" /> Connecting…</template>
              <template v-else-if="t.on"><i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[background:var(--mi-green)]" />{{ t.detail }}</template>
              <template v-else><span class="mi:text-label3 mi:tabular-nums">+{{ t.hours.toFixed(1) }} h a week</span></template>
            </span>
          </div>
          <MiSwitch
            :model-value="t.on || busy === t.id" size="compact" :disabled="!!busy && busy !== t.id"
            :label="`${t.on ? 'Disconnect' : 'Connect'} ${t.name}`" @update:model-value="toggle(t.id, $event)"
          />
        </li>
      </ul>

      <footer class="mi:[grid-area:foot] mi:grid mi:grid-cols-[auto_1fr_auto] mi:items-center mi:gap-3 mi:pt-4 mi:border-t mi:border-t-sep">
        <MiButton variant="plain" @click="step = Math.max(0, step - 1)">
          <template #leading><MiIcon name="arrow-left" :size="15" /></template>
          Back
        </MiButton>
        <ol class="mi:flex mi:justify-center mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Onboarding progress">
          <li class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:h-[7px] mi:rounded-[4px]" v-for="n in 4" :key="n" :class="[n - 1 === step ? 'mi:w-5.5 mi:[background:var(--mi-p)]' : n - 1 < step ? 'mi:w-[7px] mi:[background:color-mix(in_srgb,_var(--mi-p)_45%,_var(--mi-fill))]' : 'mi:w-[7px] mi:[background:var(--mi-fill)]']" :aria-current="n - 1 === step ? 'step' : undefined">
            <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">Step {{ n }} of 4</span>
          </li>
        </ol>
        <MiButton :variant="connected.length ? 'filled' : 'gray'" @click="step = Math.min(3, step + 1)">
          {{ connected.length ? `Continue with ${connected.length}` : 'Skip for now' }}
          <template #trailing><MiIcon name="arrow-right" :size="15" /></template>
        </MiButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Tool { id: string, name: string, mark: string, color: string, desc: string, detail: string, hours: number, on: boolean }

const MAX = 9.5
const tools = ref<Tool[]>([
  { id: 'slack', name: 'Slack', mark: 'S', color: 'var(--mi-purple)', desc: 'Standups and launch digests post to your channels.', detail: '#launch-room, #eng', hours: 1.5, on: true },
  { id: 'github', name: 'GitHub', mark: 'Gh', color: 'var(--mi-label2)', desc: 'Pull requests link to tasks and close them on merge.', detail: 'kestrel-labs · 14 repos', hours: 2.5, on: true },
  { id: 'linear', name: 'Linear', mark: 'L', color: 'var(--mi-indigo)', desc: 'Two-way sync for issues, cycles and estimates.', detail: 'Team KES', hours: 1.0, on: false },
  { id: 'figma', name: 'Figma', mark: 'F', color: 'var(--mi-pink)', desc: 'Live frames inside specs, with comments kept in sync.', detail: '3 projects', hours: 1.5, on: false },
  { id: 'notion', name: 'Notion', mark: 'N', color: 'var(--mi-orange)', desc: 'Import the product wiki and keep its backlinks.', detail: 'Product wiki', hours: 0.8, on: false },
  { id: 'calendar', name: 'Google Calendar', mark: 'Ca', color: 'var(--mi-teal)', desc: 'Blocks focus time around milestones and reviews.', detail: 'amara@kestrel.dev', hours: 1.2, on: false }
])
const busy = ref<string | null>(null)
const step = ref(2)
let timer: ReturnType<typeof setTimeout> | undefined

const best = computed(() => tools.value.filter(t => !t.on && busy.value !== t.id).sort((a, b) => b.hours - a.hours)[0])
const connected = computed(() => tools.value.filter(t => t.on))
const hours = computed(() => connected.value.reduce((n, t) => n + t.hours, 0))
// Cumulative end of each tool's segment; unconnected tools end where the previous one did.
const ends = computed(() => {
  let sum = 0
  return tools.value.map(t => (sum += t.on ? t.hours : 0))
})

function toggle(id: string, on: boolean) {
  const t = tools.value.find(x => x.id === id)
  if (!t) return
  if (!on) { t.on = false; return }
  busy.value = id
  // UI demo only: nothing is sent anywhere.
  timer = setTimeout(() => { t.on = true; busy.value = null }, 700)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
