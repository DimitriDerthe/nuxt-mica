<template>
  <footer ref="root" class="swf" aria-labelledby="swf-title">
    <h2 id="swf-title" class="swf__sr">Tallyfold footer</h2>

    <!-- Tier 1: newsletter -->
    <section class="swf__news" aria-labelledby="swf-news-title">
      <div class="swf__news-text">
        <MiText id="swf-news-title" variant="headline" as="h3">Release notes, once a month</MiText>
        <MiText variant="footnote" tone="label2">What shipped, what's next, and one studio's workflow. No tracking pixels.</MiText>
      </div>
      <form class="swf__form" novalidate @submit.prevent="subscribe">
        <MiInput v-model="email" type="email" size="sm" placeholder="you@studio.com" aria-label="Email address" :invalid="state === 'invalid'" :success="state === 'done'" />
        <MiButton type="submit" size="small" :disabled="state === 'done'">{{ state === 'done' ? 'Subscribed' : 'Subscribe' }}</MiButton>
        <MiText variant="caption" :tone="state === 'invalid' ? 'red' : 'green'" class="swf__msg" aria-live="polite">{{ message }}</MiText>
      </form>
    </section>

    <!-- Tier 2: link columns; disclosures on narrow widths -->
    <nav class="swf__cols" aria-label="Footer">
      <section v-for="c in columns" :key="c.id" class="swf__col">
        <h3 class="swf__col-head">
          <component
            :is="wide ? 'span' : 'button'" :type="wide ? undefined : 'button'" class="swf__col-btn"
            :aria-expanded="wide ? undefined : !!open[c.id]" :aria-controls="wide ? undefined : 'swf-c-' + c.id" @click="!wide && (open[c.id] = !open[c.id])"
          >
            {{ c.title }}
            <MiIcon v-if="!wide" name="chevron-down" :size="14" class="swf__chev" :class="{ 'is-open': open[c.id] }" />
          </component>
        </h3>
        <ul v-show="wide || open[c.id]" :id="'swf-c-' + c.id" class="swf__links">
          <li v-for="l in c.links" :key="l.label">
            <a href="#">{{ l.label }}</a>
            <MiBadge v-if="l.tag" :label="l.tag" tone="primary" variant="tint" shape="pill" />
          </li>
        </ul>
      </section>
    </nav>

    <!-- Tier 3: legal, locale and appearance -->
    <div class="swf__bar">
      <MiText variant="caption" tone="label2">© 2027 Tallyfold Ltd · Made in Bristol</MiText>
      <div class="swf__legal">
        <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
      </div>
      <div class="swf__prefs">
        <MiNativeSelect v-model="lang" size="sm" :options="langs" aria-label="Language" />
        <MiThemeSwitcher icon-only />
      </div>
    </div>

    <!-- Tier 4: oversized outlined wordmark, cropped by the footer edge -->
    <div class="swf__mark" aria-hidden="true">tallyfold</div>
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

<style scoped>
.swf { container-type: inline-size; position: relative; display: grid; gap: 0; overflow: hidden; font-family: var(--mi-font); color: var(--mi-label); border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.swf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.swf__news { display: grid; gap: 14px; padding: 22px 20px; background: linear-gradient(120deg, var(--mi-p-tint), transparent 70%); border-bottom: 1px solid var(--mi-sep); }
.swf__news-text { display: grid; gap: 4px; }
.swf__form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: start; }
.swf__msg { grid-column: 1 / -1; min-height: 1lh; }

.swf__cols { display: grid; grid-template-columns: minmax(0, 1fr); padding: 6px 20px; }
.swf__col + .swf__col { border-top: 1px solid var(--mi-sep); }
.swf__col-head { margin: 0; font-size: 13px; font-weight: 600; }
.swf__col-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; }
button.swf__col-btn { cursor: pointer; }
button.swf__col-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.swf__chev { color: var(--mi-label2); transition: transform var(--mi-dur-2) var(--mi-ease); }
.swf__chev.is-open { transform: rotate(180deg); }
.swf__links { display: grid; gap: 10px; margin: 0; padding: 0 0 14px; list-style: none; }
.swf__links li { display: flex; align-items: center; gap: 8px; }
.swf__links a, .swf__legal a { color: var(--mi-label2); font-size: 14px; text-decoration: none; }
.swf__links a:hover, .swf__legal a:hover { color: var(--mi-label); }
.swf__links a:focus-visible, .swf__legal a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }

.swf__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; padding: 16px 20px; border-top: 1px solid var(--mi-sep); }
.swf__legal { display: flex; flex-wrap: wrap; gap: 16px; }
.swf__legal a { font-size: 13px; }
.swf__prefs { display: flex; align-items: center; gap: 8px; }

/* Outlined wordmark: sized to the container, cropped by the footer's bottom edge. */
.swf__mark {
  margin: -0.12em 0 -0.32em; padding: 0 16px; font-size: 18cqi; font-weight: 800; line-height: 1; letter-spacing: -.06em; text-align: center; white-space: nowrap;
  color: transparent; -webkit-text-stroke: 1px var(--mi-sep2); user-select: none; pointer-events: none;
  background: linear-gradient(180deg, color-mix(in srgb, var(--mi-p) 14%, transparent), transparent 75%); -webkit-background-clip: text; background-clip: text;
}

@container (min-width: 640px) {
  .swf__news { grid-template-columns: minmax(0, 1fr) minmax(0, 380px); align-items: center; padding: 26px 28px; }
  .swf__cols { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; padding: 26px 28px 10px; }
  .swf__col + .swf__col { border-top: 0; }
  .swf__col-head { padding-bottom: 12px; color: var(--mi-label); }
  .swf__col-btn { padding: 0; }
  .swf__bar { padding: 18px 28px; }
  .swf__legal { margin-right: auto; }
}
</style>
