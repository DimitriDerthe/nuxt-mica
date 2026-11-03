<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div class="mi:grid mi:grid-rows-[auto_minmax(0,_1fr)] mi:min-h-155 mi:[background:radial-gradient(80%_60%_at_20%_30%,_var(--mi-p-tint),_transparent_70%),_var(--mi-page)]">
      <header class="mi:flex mi:items-center mi:justify-between mi:py-4 mi:px-5 mi:@[760px]:py-5 mi:@[760px]:px-8">
        <span class="mi:inline-flex mi:items-center mi:gap-2 mi:font-bold mi:tracking-[-.02em]"><span class="mi:w-5.5 mi:h-5.5 mi:rounded-[6px] mi:[background:linear-gradient(160deg,_var(--mi-p)_0_50%,_var(--mi-s)_50%_100%)] mi:[clip-path:polygon(50%_8%,_100%_92%,_0_92%)]" aria-hidden="true" />Ridgeline</span>
        <MiTextLink href="#" :chevron="false">Help centre</MiTextLink>
      </header>

      <main class="mi:grid mi:content-center mi:gap-2 mi:pt-0 mi:px-5 mi:pb-7 mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[760px]:items-center mi:@[760px]:gap-10 mi:@[760px]:pt-0 mi:@[760px]:px-10 mi:@[760px]:pb-10" aria-labelledby="otm-title">
        <!-- Illustration: a contour map whose trail runs off the torn edge, and the reader's pin beyond it. -->
        <svg class="mi:w-full mi:max-w-105 mi:h-auto mi:justify-self-center mi:overflow-visible mi:@[760px]:order-2 mi:@[760px]:max-w-120" viewBox="0 0 400 300" aria-hidden="true">
          <g transform="rotate(-3 180 150)">
            <path d="M30 40h262l-8 22 10 18-9 24 11 20-10 26 9 22-11 24 10 22-8 22H30a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8z" class="mi:fill-card mi:stroke-sep mi:[stroke-width:1] mi:[filter:drop-shadow(0_6px_14px_color-mix(in_srgb,_var(--mi-label)_10%,_transparent))]" />
            <g transform="translate(150 140)">
              <path class="mi:fill-[color:none] mi:stroke-sep2 mi:[stroke-width:1.2] mi:[vector-effect:non-scaling-stroke]" :d="blob" />
              <path class="mi:fill-[color:none] mi:stroke-sep2 mi:[stroke-width:1.2] mi:[vector-effect:non-scaling-stroke]" :d="blob" transform="scale(.76)" />
              <path class="mi:fill-[color:none] mi:stroke-sep2 mi:[stroke-width:1.2] mi:[vector-effect:non-scaling-stroke]" :d="blob" transform="translate(6 -4) scale(.52)" />
              <path :d="blob" transform="translate(12 -8) scale(.28)" class="mi:fill-p-tint mi:stroke-p mi:[stroke-width:1.2] mi:[vector-effect:non-scaling-stroke]" />
            </g>
            <path d="M44 226c30-6 40-34 70-40s52 14 78-10 20-62 52-74 44 2 50-6" class="mi:fill-[color:none] mi:stroke-p mi:[stroke-width:2.5] mi:[stroke-linecap:round] mi:[stroke-dasharray:1_7]" />
            <circle cx="44" cy="226" r="5" class="mi:fill-card mi:stroke-p mi:[stroke-width:2.5]" />
            <g transform="translate(66 76)">
              <circle r="16" class="mi:fill-[color:none] mi:stroke-sep2" />
              <path d="M0-11 4 0H-4z" class="mi:fill-red" />
              <path d="M0 11 4 0H-4z" class="mi:fill-label3" />
              <text class="mi:fill-label2 mi:[font:700_9px_var(--mi-font)]" y="-20" text-anchor="middle">N</text>
            </g>
          </g>
          <g>
            <ellipse cx="346" cy="214" rx="18" ry="5" class="mi:[--mi-beat:.75] mi:[--mi-beat-o:.05] mi:animate-[beat_2.8s_var(--mi-ease-in-out)_infinite] mi:motion-reduce:animate-none mi:fill-label mi:opacity-10 mi:[transform-box:fill-box] mi:origin-center" />
            <g class="mi:animate-[float_2.8s_var(--mi-ease-in-out)_infinite] mi:motion-reduce:animate-none">
              <path d="M346 196c-16-18-24-30-24-42a24 24 0 0 1 48 0c0 12-8 24-24 42z" class="mi:fill-p" />
              <circle cx="346" cy="154" r="12" class="mi:fill-p-on" />
              <text x="346" y="159" text-anchor="middle" class="mi:[font:800_15px_var(--mi-font)] mi:fill-p">?</text>
            </g>
          </g>
        </svg>

        <div class="mi:grid mi:gap-3 mi:max-w-130">
          <MiText variant="caption" tone="label2" weight="semibold" class="mi:tracking-[.08em]! mi:uppercase">Error 404 · ref 7Q2-K9</MiText>
          <MiText id="otm-title" variant="largeTitle" as="h2" weight="bold" balance>You've walked off the map</MiText>
          <MiText variant="body" tone="label2">
            Nothing lives at <code class="mi:py-px mi:px-1.5 mi:rounded-[5px] mi:[background:var(--mi-fill4)] mi:text-label mi:[font:500_.88em_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:wrap-anywhere">/routes/cairngorms-loop-2019</code>. The route may have been renamed when it was updated. Let's get you back on the trail.
          </MiText>

          <div class="mi:grid mi:gap-2 mi:mt-1">
            <MiSearch v-model="query" placeholder="Search routes and pages" aria-label="Search routes and pages" :cancelable="false" />
            <ul class="mi:grid mi:m-0 mi:p-1 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Suggested pages">
              <li v-for="p in hits" :key="p.label">
                <a href="#" class="mi:group mi:flex mi:items-center mi:gap-3 mi:py-[9px] mi:px-2.5 mi:rounded-md mi:text-inherit mi:[text-decoration:none] mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]">
                  <MiIcon :name="p.icon" :size="16" class="mi:flex-none mi:text-p-text" />
                  <span class="mi:grid mi:flex-1 mi:min-w-0"><b class="mi:text-[14px] mi:font-semibold">{{ p.label }}</b><span class="mi:text-[12px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ p.hint }}</span></span>
                  <MiIcon name="chevron-right" :size="14" class="mi:flex-none mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:group-hover:transform-[translateX(3px)]" />
                </a>
              </li>
              <li v-if="!hits.length" class="mi:py-3 mi:px-2.5 mi:text-[13px] mi:text-label2">No page matches “{{ query }}”. Try a place name.</li>
            </ul>
          </div>

          <div class="mi:flex mi:flex-wrap mi:gap-2 mi:mt-1.5">
            <MiButton href="#">
              <template #leading><MiIcon name="arrow-left" :size="16" /></template>
              Back to my routes
            </MiButton>
            <MiButton variant="plain" :disabled="reported" @click="reported = true">{{ reported ? 'Thanks, we will fix that link' : 'Report a broken link' }}</MiButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const blob = 'M-110-10C-105-70-40-95 20-85S120-40 115 10 60 95 0 90-115 50-110-10z'

const pages = [
  { label: 'Cairngorms loop', hint: '2024 edition · 38 km · 2 days', icon: 'globe' as const },
  { label: 'Saved routes', hint: '12 routes in your library', icon: 'bookmark' as const },
  { label: 'Offline maps', hint: 'Download areas for no signal', icon: 'archive' as const },
  { label: 'Trail conditions', hint: 'Reports from the last 7 days', icon: 'info-circle' as const },
  { label: 'Help centre', hint: 'Guides and contact', icon: 'chat' as const }
]
const query = ref('')
const reported = ref(false)
const hits = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q ? pages.filter(p => (p.label + ' ' + p.hint).toLowerCase().includes(q)) : pages
  return list.slice(0, 3)
})
</script>

