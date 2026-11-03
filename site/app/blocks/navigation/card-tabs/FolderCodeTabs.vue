<template>
  <section class="ft" aria-labelledby="ft-title">
    <header class="ft__head">
      <div>
        <MiText id="ft-title" variant="title3" as="h2" weight="semibold">Send your first event</MiText>
        <MiText variant="footnote" tone="label2">Paste this into your backend. Your test key is already filled in.</MiText>
      </div>
      <MiBadge label="Test mode" tone="warning" variant="tint" dot />
    </header>

    <div class="ft__folder">
      <!-- Folder tabs: the selected tab is cut from the same sheet as the card below it. -->
      <div class="ft__tabs" role="tablist" aria-label="Language" @keydown="onKey">
        <button
          v-for="(l, i) in langs" :id="'ft-tab-' + l.id" :key="l.id" :ref="setTab(i)" type="button" role="tab" class="ft__tab"
          :aria-selected="current === l.id" aria-controls="ft-panel" :tabindex="current === l.id ? 0 : -1" @click="select(l.id)"
        >
          <span class="ft__dot" :style="{ '--c': l.color }" aria-hidden="true" />{{ l.label }}
        </button>
      </div>

      <div id="ft-panel" class="ft__card" role="tabpanel" :aria-labelledby="'ft-tab-' + current">
        <MiCodeBlock :key="current" :code="lang.code" :filename="lang.file" />

        <div class="ft__run">
          <MiButton size="small" :loading="sending" @click="send">
            <template #leading><MiIcon :svg="icons.send" :size="15" /></template>
            Send test event
          </MiButton>
          <Transition name="ft">
            <p v-if="response" :key="response.id" class="ft__resp" role="status">
              <span class="ft__code">202</span> Accepted · {{ response.ms }} ms · <span class="ft__mono">{{ response.id }}</span>
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

<style scoped>
.ft { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.ft__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px 16px; }

.ft__folder { display: grid; min-width: 0; }
.ft__tabs { position: relative; z-index: 1; display: flex; gap: 2px; margin-bottom: -2px; padding: 0 24px; overflow-x: auto; scrollbar-width: none; }
.ft__tab {
  position: relative; display: inline-flex; flex: none; align-items: center; gap: 8px; height: 42px; padding: 0 16px 2px; border: 0;
  border-radius: 12px 12px 0 0; font: inherit; font-size: 13px; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill4); cursor: pointer;
}
.ft__tab:hover { color: var(--mi-label); }
.ft__tab:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -3px; }
.ft__tab[aria-selected="true"] { z-index: 1; color: var(--mi-label); background: var(--mi-card); }
/* Concave "ears" at the foot of the selected tab, drawn with radial gradients in the card color. */
.ft__tab[aria-selected="true"]::before, .ft__tab[aria-selected="true"]::after {
  content: ""; position: absolute; bottom: 0; width: 12px; height: 12px;
}
.ft__tab[aria-selected="true"]::before { left: -12px; background: radial-gradient(circle at 0 0, transparent 11.5px, var(--mi-card) 12px); }
.ft__tab[aria-selected="true"]::after { right: -12px; background: radial-gradient(circle at 100% 0, transparent 11.5px, var(--mi-card) 12px); }
.ft__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }

.ft__card { display: grid; gap: 14px; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ft__run { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; min-height: 32px; }
.ft__resp { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; font-size: 13px; color: var(--mi-label2); }
.ft__code { padding: 2px 7px; border-radius: 6px; font: 600 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ft__mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; }
.ft-enter-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.ft-enter-from { opacity: 0; transform: translateY(4px); }

@container (min-width: 640px) {
  .ft__card { padding: 18px; }
}
</style>
