<template>
  <footer ref="root" class="mi:@container mi:relative mi:grid mi:content-start mi:gap-0 mi:overflow-hidden mi:font-mi mi:text-label mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="swf-title">
    <h2 id="swf-title" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Tallyfold footer</h2>

    <!-- Tier 1: newsletter -->
    <section class="mi:grid mi:gap-3.5 mi:py-5.5 mi:px-5 mi:[background:linear-gradient(120deg,_var(--mi-p-tint),_transparent_70%)] mi:border-b mi:border-b-sep mi:@[640px]:grid-cols-[minmax(0,_1fr)_minmax(0,_380px)] mi:@[640px]:items-center mi:@[640px]:py-6.5 mi:@[640px]:px-7" aria-labelledby="swf-news-title">
      <div class="mi:grid mi:gap-1">
        <MiText id="swf-news-title" variant="headline" as="h3">Release notes, once a month</MiText>
        <MiText variant="footnote" tone="label2">What shipped, what's next, and one studio's workflow. No tracking pixels.</MiText>
      </div>
      <form class="mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:gap-2 mi:items-start" novalidate @submit.prevent="subscribe">
        <MiInput v-model="email" type="email" size="sm" placeholder="you@studio.com" aria-label="Email address" :invalid="state === 'invalid'" :success="state === 'done'" />
        <MiButton type="submit" size="small" :disabled="state === 'done'">{{ state === 'done' ? 'Subscribed' : 'Subscribe' }}</MiButton>
        <MiText variant="caption" :tone="state === 'invalid' ? 'red' : 'green'" class="mi:col-span-full mi:min-h-[1lh]" aria-live="polite">{{ message }}</MiText>
      </form>
    </section>

    <!-- Tier 2: link columns; disclosures on narrow widths -->
    <nav class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:py-1.5 mi:px-5 mi:@[640px]:grid-cols-4 mi:@[640px]:gap-6 mi:@[640px]:pt-6.5 mi:@[640px]:px-7 mi:@[640px]:pb-2.5" aria-label="Footer">
      <section v-for="c in columns" :key="c.id" class="mi:not-first:border-t mi:not-first:border-t-sep mi:@[640px]:not-first:[border-top:0]">
        <h3 class="mi:m-0 mi:text-[13px] mi:font-semibold mi:@[640px]:pb-3 mi:@[640px]:text-label">
          <component
            :is="wide ? 'span' : 'button'" :type="wide ? undefined : 'button'" class="mi:flex mi:items-center mi:justify-between mi:w-full mi:py-3.5 mi:px-0 mi:[border:0] mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-left mi:@[640px]:p-0" :class="wide ? '' : 'mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]'"
            :aria-expanded="wide ? undefined : !!open[c.id]" :aria-controls="wide ? undefined : 'swf-c-' + c.id" @click="!wide && (open[c.id] = !open[c.id])"
          >
            {{ c.title }}
            <MiIcon v-if="!wide" name="chevron-down" :size="14" class="mi:text-label2 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="open[c.id] ? 'mi:transform-[rotate(180deg)]' : ''" />
          </component>
        </h3>
        <ul v-show="wide || open[c.id]" :id="'swf-c-' + c.id" class="mi:grid mi:gap-2.5 mi:m-0 mi:pt-0 mi:px-0 mi:pb-3.5 mi:[list-style:none]">
          <li v-for="l in c.links" :key="l.label" class="mi:flex mi:items-center mi:gap-2">
            <a href="#" class="mi:text-label2 mi:text-[14px] mi:[text-decoration:none] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]">{{ l.label }}</a>
            <MiBadge v-if="l.tag" :label="l.tag" tone="primary" variant="tint" shape="pill" />
          </li>
        </ul>
      </section>
    </nav>

    <!-- Tier 3: legal, locale and appearance -->
    <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-5 mi:py-4 mi:px-5 mi:border-t mi:border-t-sep mi:@[640px]:py-4.5 mi:@[640px]:px-7">
      <MiText variant="caption" tone="label2">© 2027 Tallyfold Ltd · Made in Bristol</MiText>
      <div class="mi:flex mi:flex-wrap mi:gap-4 mi:@[640px]:mr-auto">
        <a class="mi:text-label2 mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:[text-decoration:none] mi:hover:text-label" href="#">Privacy</a><a class="mi:text-label2 mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:[text-decoration:none] mi:hover:text-label" href="#">Terms</a><a class="mi:text-label2 mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:[text-decoration:none] mi:hover:text-label" href="#">Cookies</a>
      </div>
      <div class="mi:flex mi:items-center mi:gap-2">
        <MiNativeSelect v-model="lang" size="sm" :options="langs" aria-label="Language" />
        <MiThemeSwitcher icon-only />
      </div>
    </div>

    <!-- Tier 4: oversized outlined wordmark, cropped by the footer edge -->
    <div class="mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-p)_14%,_transparent),_transparent_75%)] mi:bg-clip-text mi:[-webkit-background-clip:text] mi:mt-[-0.12em] mi:mx-0 mi:mb-[-0.32em] mi:py-0 mi:px-4 mi:text-[18cqi] mi:font-extrabold mi:leading-none mi:tracking-[-.06em] mi:text-center mi:whitespace-nowrap mi:text-transparent mi:[-webkit-text-stroke:1px_var(--mi-sep2)] mi:select-none mi:pointer-events-none" aria-hidden="true">tallyfold</div>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const columns = [
  { id: 'product', title: 'Product', links: [{ label: 'Time tracking' }, { label: 'Planner', tag: 'New' }, { label: 'Invoicing' }, { label: 'Pricing' }] },
  { id: 'dev', title: 'Developers', links: [{ label: 'REST API' }, { label: 'Webhooks' }, { label: 'Zapier recipes' }, { label: 'System status' }] },
  { id: 'company', title: 'Company', links: [{ label: 'About' }, { label: 'Careers', tag: '4 open' }, { label: 'Press kit' }, { label: 'Contact' }] },
  { id: 'help', title: 'Help', links: [{ label: 'Guides' }, { label: 'Community forum' }, { label: 'Security' }, { label: 'Accessibility' }] }
]
const open = reactive<Record<string, boolean>>({ product: true })

const root = ref<HTMLElement>()
const wide = ref(true)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([e]) => { if (e) wide.value = e.contentRect.width >= 640 })
  if (root.value) ro.observe(root.value)
})
onBeforeUnmount(() => ro?.disconnect())

const email = ref('')
const state = ref<'idle' | 'invalid' | 'done'>('idle')
const message = ref('')
function subscribe() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    state.value = 'invalid'
    message.value = 'Enter an email address like you@studio.com.'
    return
  }
  state.value = 'done'
  message.value = `Check ${email.value.trim()} to confirm.`
}

const langs = [
  { value: 'en', label: 'English (UK)' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' }
]
const lang = ref<string | number | null>('en')
</script>

