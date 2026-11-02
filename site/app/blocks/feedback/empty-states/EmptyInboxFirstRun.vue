<template>
  <div class="eif-cq">
    <section class="eif" aria-labelledby="eif-title">
      <header class="eif__bar">
        <div class="eif__bar-title">
          <MiText id="eif-title" variant="headline" as="h2">Support inbox</MiText>
          <MiBadge :count="conversations.length" show-zero tone="neutral" count-noun="conversations" />
        </div>
        <MiText variant="caption" tone="label2">{{ connected.length }} of 3 channels connected</MiText>
      </header>

      <!-- Once a channel delivers, the empty state steps aside for the real list. -->
      <ul v-if="conversations.length" class="eif__list" aria-label="Conversations">
        <li v-for="c in conversations" :key="c.id" class="eif__row">
          <MiAvatar :name="c.from" size="sm" tone="auto" decorative />
          <div class="eif__row-body">
            <div class="eif__row-top">
              <MiText variant="subheadline" weight="semibold" :lines="1">{{ c.from }}</MiText>
              <MiText variant="caption2" tone="label3">{{ c.time }}</MiText>
            </div>
            <MiText variant="footnote" tone="label2" :lines="1">{{ c.subject }}</MiText>
          </div>
          <MiBadge :label="c.via" tone="primary" />
        </li>
      </ul>

      <div v-else class="eif__empty">
        <!-- Token-drawn artwork: three fanned envelopes waiting on a soft halo. -->
        <div class="eif__art" aria-hidden="true">
          <span class="eif__halo" />
          <span class="eif__env eif__env--l" />
          <span class="eif__env eif__env--r" />
          <span class="eif__env eif__env--c"><i /><i /></span>
          <span class="eif__ping" />
        </div>
        <MiText variant="title3" as="h3" weight="semibold" align="center" balance>
          Your inbox is ready for its first conversation
        </MiText>
        <MiText variant="footnote" tone="label2" align="center" class="eif__lead">
          Connect one channel to start. Customers will never see this screen; they just write to you.
        </MiText>
      </div>

      <div class="eif__paths" role="group" aria-label="Ways to start">
        <button
          v-for="p in paths" :key="p.id" type="button" class="eif__path"
          :aria-pressed="path === p.id" @click="path = p.id"
        >
          <span class="eif__path-icon"><MiIcon :svg="p.glyph" :size="18" /></span>
          <span class="eif__path-text">
            <strong>{{ p.title }}</strong>
            <span>{{ p.blurb }}</span>
          </span>
          <MiIcon v-if="connected.includes(p.id)" name="check-circle-fill" :size="18" class="eif__done" label="Connected" />
        </button>
      </div>

      <div class="eif__step" aria-live="polite">
        <template v-if="path === 'email'">
          <MiText variant="subheadline" weight="semibold" as="h4">Forward your support address</MiText>
          <MiText variant="footnote" tone="label2">Add a forwarding rule from help@northwind.studio to this address, then send a test.</MiText>
          <div class="eif__code">
            <code>northwind-7f3k@in.relaymail.io</code>
            <MiCopyButton value="northwind-7f3k@in.relaymail.io" variant="ghost" icon-only label="Copy forwarding address" />
          </div>
        </template>
        <template v-else-if="path === 'widget'">
          <MiText variant="subheadline" weight="semibold" as="h4">Add the chat widget</MiText>
          <MiText variant="footnote" tone="label2">Paste this before the closing body tag. It loads in 9 kB and waits for the page to be idle.</MiText>
          <div class="eif__code">
            <code>&lt;script src="https://cdn.relaymail.io/w.js" data-inbox="7f3k" defer&gt;&lt;/script&gt;</code>
            <MiCopyButton :value="snippet" variant="ghost" icon-only label="Copy snippet" />
          </div>
        </template>
        <template v-else>
          <MiText variant="subheadline" weight="semibold" as="h4">Bring your history</MiText>
          <MiText variant="footnote" tone="label2">Import a CSV export of past tickets. Threads, tags and customer names are kept; up to 50,000 rows.</MiText>
        </template>

        <div class="eif__actions">
          <MiButton :loading="waiting" :disabled="connected.includes(path)" @click="connect">
            {{ connected.includes(path) ? 'Connected' : current.action }}
          </MiButton>
          <MiText v-if="waiting" variant="caption" tone="label2">{{ current.waiting }}</MiText>
          <MiButton v-if="conversations.length" variant="plain" size="small" @click="reset">Reset demo</MiButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type PathId = 'email' | 'widget' | 'import'
interface Conversation { id: number, from: string, subject: string, time: string, via: string }

const snippet = '<script src="https://cdn.relaymail.io/w.js" data-inbox="7f3k" defer><\/script>'

const paths = [
  { id: 'email' as const, title: 'Forward email', blurb: 'Keep your address, route it here', action: 'Send a test email', waiting: 'Waiting for the test to land…', glyph: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>' },
  { id: 'widget' as const, title: 'Chat widget', blurb: 'Live chat on your site in one line', action: 'Open a preview chat', waiting: 'Starting a preview chat…', glyph: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>' },
  { id: 'import' as const, title: 'Import history', blurb: 'Bring past tickets from a CSV', action: 'Import sample CSV', waiting: 'Reading 1,284 rows…', glyph: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>' }
]

// What each channel delivers once connected; sample data.
const arrivals: Record<PathId, Conversation[]> = {
  email: [{ id: 1, from: 'You (test)', subject: 'Test: is this thing on?', time: 'Just now', via: 'Email' }],
  widget: [{ id: 2, from: 'Visitor from Lyon', subject: 'Do you ship the oak desk to Belgium?', time: 'Just now', via: 'Chat' }],
  import: [
    { id: 3, from: 'Hana Okafor', subject: 'Invoice 2291 shows the wrong VAT number', time: 'Oct 30', via: 'Import' },
    { id: 4, from: 'Teodor Brandt', subject: 'Replacement hinge for the Linden cabinet', time: 'Oct 29', via: 'Import' }
  ]
}

const path = ref<PathId>('email')
const connected = ref<PathId[]>([])
const conversations = ref<Conversation[]>([])
const waiting = ref(false)
const current = computed(() => paths.find(p => p.id === path.value)!)
let timer: ReturnType<typeof setTimeout> | undefined

function connect() {
  waiting.value = true
  const id = path.value
  timer = setTimeout(() => {
    waiting.value = false
    connected.value = [...connected.value, id]
    conversations.value = [...arrivals[id], ...conversations.value]
  }, 1400)
}

function reset() {
  clearTimeout(timer)
  waiting.value = false
  connected.value = []
  conversations.value = []
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.eif-cq { container-type: inline-size; }
.eif { display: grid; gap: 20px; max-width: 880px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 640px) { .eif { padding: 24px 28px; } }
.eif__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 14px; border-bottom: 1px solid var(--mi-sep); }
.eif__bar-title { display: flex; align-items: center; gap: 8px; }

.eif__empty { display: grid; justify-items: center; gap: 8px; padding: 8px 0; }
.eif__lead { max-width: 46ch; }

.eif__art { position: relative; width: 180px; height: 120px; margin-bottom: 8px; }
.eif__halo { position: absolute; inset: -10% 5%; border-radius: 50%; background: radial-gradient(closest-side, var(--mi-p-tint), transparent); }
.eif__env { position: absolute; left: 50%; top: 22px; width: 104px; height: 72px; margin-left: -52px; border-radius: 12px; background: var(--mi-elev); box-shadow: var(--mi-sh2); border: 1px solid var(--mi-sep); }
.eif__env--l { transform: translate(-34px, 10px) rotate(-12deg); background: var(--mi-fill3); box-shadow: none; }
.eif__env--r { transform: translate(34px, 10px) rotate(12deg); background: var(--mi-fill3); box-shadow: none; }
.eif__env--c { display: grid; align-content: center; gap: 7px; padding: 0 18px; animation: eif-bob 4.8s var(--mi-ease-in-out) infinite; }
.eif__env--c i { display: block; height: 7px; border-radius: 4px; background: var(--mi-fill2); }
.eif__env--c i:first-child { width: 70%; background: var(--mi-p); opacity: .7; }
.eif__ping { position: absolute; right: 30px; top: 14px; width: 14px; height: 14px; border-radius: 50%; background: var(--mi-s); box-shadow: 0 0 0 3px var(--mi-card); }
@keyframes eif-bob { 50% { transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .eif__env--c { animation: none; } }

.eif__list { list-style: none; margin: 0; padding: 0; display: grid; }
.eif__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 4px; animation: eif-in var(--mi-dur-4) var(--mi-spring) both; }
.eif__row + .eif__row { border-top: 1px solid var(--mi-sep); }
.eif__row-body { display: grid; min-width: 0; }
.eif__row-top { display: flex; justify-content: space-between; gap: 8px; }
@keyframes eif-in { from { opacity: 0; transform: translateY(8px); } }

.eif__paths { display: grid; gap: 8px; }
@container (min-width: 620px) { .eif__paths { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.eif__path {
  position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 14px; text-align: start;
  border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: transparent; color: inherit; font: inherit; cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.eif__path:hover { background: var(--mi-fill4); }
.eif__path:active { transform: scale(.985); }
.eif__path:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.eif__path[aria-pressed="true"] { border-color: var(--mi-p); background: color-mix(in srgb, var(--mi-p) 6%, transparent); }
.eif__path-icon { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
.eif__path-text { display: grid; gap: 2px; min-width: 0; font-size: 13px; color: var(--mi-label2); }
.eif__path-text strong { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.eif__done { position: absolute; top: 10px; right: 10px; color: var(--mi-green); }

.eif__step { display: grid; gap: 8px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.eif__code { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 6px 6px 6px 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); border: 1px solid var(--mi-sep); }
.eif__code code { flex: 1; min-width: 0; overflow-x: auto; white-space: nowrap; font-size: 13px; scrollbar-width: none; }
.eif__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 6px; }
</style>
