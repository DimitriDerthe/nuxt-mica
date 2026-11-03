<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ft-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
      <div>
        <MiText id="ft-title" variant="title3" as="h2" weight="semibold">Send your first event</MiText>
        <MiText variant="footnote" tone="label2">Paste this into your backend. Your test key is already filled in.</MiText>
      </div>
      <MiBadge label="Test mode" tone="warning" variant="tint" dot />
    </header>

    <div class="mi:grid mi:min-w-0">
      <!-- Folder tabs: the selected tab is cut from the same sheet as the card below it. -->
      <div class="mi:relative mi:z-1 mi:flex mi:gap-0.5 mi:-mb-0.5 mi:py-0 mi:px-6 mi:overflow-x-auto mi:[scrollbar-width:none]" role="tablist" aria-label="Language" @keydown="onKey">
        <button
          v-for="(l, i) in langs" :id="'ft-tab-' + l.id" :key="l.id" :ref="setTab(i)" type="button" role="tab" class="mi:relative mi:inline-flex mi:flex-[none] mi:items-center mi:gap-2 mi:h-10.5 mi:pt-0 mi:px-4 mi:pb-0.5 mi:[border:0] mi:rounded-[12px_12px_0_0] mi:[font:inherit] mi:text-[13px] mi:font-semibold mi:text-label2 mi:hover:text-label mi:aria-selected:text-label mi:[background:var(--mi-fill4)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-3px] mi:aria-selected:z-1 mi:aria-selected:[background:var(--mi-card)] mi:aria-selected:before:content-[''] mi:aria-selected:before:absolute mi:aria-selected:before:bottom-0 mi:aria-selected:before:w-3 mi:aria-selected:before:h-3 mi:aria-selected:after:content-[''] mi:aria-selected:after:absolute mi:aria-selected:after:bottom-0 mi:aria-selected:after:w-3 mi:aria-selected:after:h-3 mi:aria-selected:before:-left-3 mi:aria-selected:before:[background:radial-gradient(circle_at_0_0,_transparent_11.5px,_var(--mi-card)_12px)] mi:aria-selected:after:-right-3 mi:aria-selected:after:[background:radial-gradient(circle_at_100%_0,_transparent_11.5px,_var(--mi-card)_12px)]"
          :aria-selected="current === l.id" aria-controls="ft-panel" :tabindex="current === l.id ? 0 : -1" @click="select(l.id)"
        >
          <span class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--c)]" :style="{ '--c': l.color }" aria-hidden="true" />{{ l.label }}
        </button>
      </div>

      <div id="ft-panel" class="mi:grid mi:gap-3.5 mi:p-3.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[640px]:p-4.5" role="tabpanel" :aria-labelledby="'ft-tab-' + current">
        <MiCodeBlock :key="current" :code="lang.code" :filename="lang.file" />

        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5 mi:min-h-8">
          <MiButton size="small" :loading="sending" @click="send">
            <template #leading><MiIcon :svg="icons.send" :size="15" /></template>
            Send test event
          </MiButton>
          <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(4px)]">
            <p v-if="response" :key="response.id" class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:m-0 mi:text-[13px] mi:text-label2" role="status">
              <span class="mi:py-0.5 mi:px-[7px] mi:rounded-[6px] mi:[font:600_12px_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)]">202</span> Accepted · {{ response.ms }} ms · <span class="mi:font-[ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-[12px]">{{ response.id }}</span>
            </p>
            <MiText v-else variant="caption" tone="label3">Events sent with a test key never reach live dashboards.</MiText>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const icons = { send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/><path d="m11 13 3-3"/>' }
const key = 'sk_test_51NzQ8kT2'

const langs = [
  {
    id: 'curl', label: 'cURL', file: 'Terminal', color: 'var(--mi-label3)',
    code: `curl https://api.tidewater.dev/v3/events \\\n  -u ${key}: \\\n  -d name="order.paid" \\\n  -d "properties[amount]"=4200 \\\n  -d "properties[currency]"=eur`
  },
  {
    id: 'node', label: 'Node.js', file: 'track.mjs', color: 'var(--mi-green)',
    code: `import Tidewater from '@tidewater/node'\n\nconst tw = new Tidewater('${key}')\n\nawait tw.events.create({\n  name: 'order.paid',\n  properties: { amount: 4200, currency: 'eur' }\n})`
  },
  {
    id: 'python', label: 'Python', file: 'track.py', color: 'var(--mi-blue)',
    code: `import tidewater\n\ntw = tidewater.Client("${key}")\n\ntw.events.create(\n    name="order.paid",\n    properties={"amount": 4200, "currency": "eur"},\n)`
  },
  {
    id: 'go', label: 'Go', file: 'main.go', color: 'var(--mi-teal)',
    code: `client := tidewater.New("${key}")\n\n_, err := client.Events.Create(ctx, &tidewater.Event{\n\tName:       "order.paid",\n\tProperties: map[string]any{"amount": 4200, "currency": "eur"},\n})`
  }
]

const current = ref('node')
const lang = computed(() => langs.find(l => l.id === current.value)!)
const sending = ref(false)
const response = ref<{ id: string, ms: number } | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined
function select(id: string) { current.value = id; response.value = null }
function send() {
  sending.value = true
  timer = setTimeout(() => {
    sending.value = false
    response.value = { id: 'evt_' + Math.random().toString(36).slice(2, 10), ms: 60 + Math.round(Math.random() * 50) }
  }, 700)
}
onBeforeUnmount(() => clearTimeout(timer))

const tabEls: (HTMLButtonElement | undefined)[] = []
const setTab = (i: number) => (el: unknown) => { tabEls[i] = el instanceof HTMLButtonElement ? el : undefined }
function onKey(e: KeyboardEvent) {
  const i = langs.findIndex(l => l.id === current.value)
  const moves: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: langs.length - 1 }
  const to = moves[e.key]
  if (to === undefined) return
  e.preventDefault()
  const n = (to + langs.length) % langs.length
  select(langs[n]!.id)
  tabEls[n]?.focus()
}
</script>
