<template>
  <section class="src" aria-labelledby="src-title">
    <header class="src__head">
      <div class="src__who">
        <MiAvatar name="Marta Kowalski" size="sm" tone="auto" decorative />
        <div>
          <MiText id="src-title" as="h2" variant="headline" :lines="1">Invoice shows the old VAT number</MiText>
          <MiText variant="caption" tone="label2">#48213 · Marta Kowalski · Studio plan</MiText>
        </div>
      </div>
      <MiBadge :label="solved ? 'Solved' : 'Open'" :tone="solved ? 'success' : 'primary'" dot />
    </header>

    <ol class="src__thread" aria-label="Conversation">
      <li v-for="m in thread" :key="m.id">
        <div v-if="m.kind === 'note'" class="src__note-msg">
          <MiText variant="caption" weight="semibold">{{ m.author }} · internal note · {{ m.time }}</MiText>
          <MiText variant="footnote">{{ m.text }}</MiText>
        </div>
        <MiMessage v-else :align="m.kind === 'agent' ? 'end' : 'start'" :label="m.author">
          <template #avatar><MiAvatar :name="m.author" size="xs" tone="auto" decorative /></template>
          <template #header><MiText variant="caption2" tone="label2">{{ m.author }} · {{ m.time }}</MiText></template>
          <MiBubble :variant="m.kind === 'agent' ? 'default' : 'muted'" :align="m.kind === 'agent' ? 'end' : 'start'">{{ m.text }}</MiBubble>
          <template v-if="m.files" #footer><span class="src__att"><MiIcon :svg="clip" :size="13" />{{ m.files }}</span></template>
        </MiMessage>
      </li>
    </ol>

    <form class="src__composer" :class="{ 'is-note': mode === 'note' }" novalidate @submit.prevent="send(false)" @keydown.enter.meta.prevent="send(false)" @keydown.enter.ctrl.prevent="send(false)">
      <div class="src__bar">
        <MiSegmented v-model="mode" label="Message type" :options="modes" />
        <MiText variant="caption" tone="label2" :lines="1">{{ mode === 'note' ? 'Only your team sees notes' : 'To marta@kowalski.design' }}</MiText>
      </div>

      <MiInputGroup
        v-model="body" multiline :rows="3" :invalid="!!error"
        :aria-label="mode === 'note' ? 'Internal note' : 'Reply to Marta'" aria-describedby="src-hint"
        :placeholder="mode === 'note' ? 'Leave context for the next person on this ticket…' : 'Write your reply…'"
      >
        <template #block-start>
          <div class="src__snips" role="group" aria-label="Saved replies">
            <button v-for="s in snippets" :key="s.label" type="button" class="src__snip" @click="insert(s.text)">{{ s.label }}</button>
          </div>
        </template>
        <template #block-end>
          <div class="src__tools">
            <div class="src__left">
              <MiIconButton label="Attach files" variant="plain" size="small" @click="picker?.click()">
                <MiIcon :svg="clip" :size="18" />
              </MiIconButton>
              <input ref="picker" type="file" multiple class="src__file" tabindex="-1" aria-hidden="true" @change="addFiles">
              <MiChip v-for="(f, i) in files" :key="f" :label="f" size="small" tone="neutral" removable :remove-label="'Remove ' + f" @remove="files.splice(i, 1)" />
            </div>
            <div class="src__right">
              <label v-if="mode === 'reply'" class="src__solve">
                <MiSwitch v-model="solveOnSend" size="compact" label="Mark solved on send" />
                <span aria-hidden="true">Solve</span>
              </label>
              <MiButton type="submit" size="small" :brand="mode === 'note' ? 'secondary' : 'primary'">
                {{ mode === 'note' ? 'Add note' : 'Send' }}
              </MiButton>
            </div>
          </div>
        </template>
      </MiInputGroup>

      <!-- Forgotten-attachment guard: the reply mentions a file but none is attached. -->
      <div v-if="guard" class="src__guard" role="alert">
        <MiIcon name="warning" :size="18" />
        <MiText variant="footnote">Your reply mentions an attachment, but nothing is attached.</MiText>
        <div class="src__guard-actions">
          <MiButton size="small" variant="gray" @click="guard = false; picker?.click()">Attach file</MiButton>
          <MiButton size="small" variant="plain" @click="send(true)">Send anyway</MiButton>
        </div>
      </div>
      <MiText v-else-if="error" variant="caption" tone="red" role="alert">{{ error }}</MiText>
      <MiText v-else id="src-hint" variant="caption2" tone="label3"><MiKbd>⌘</MiKbd> <MiKbd>Enter</MiKbd> to {{ mode === 'note' ? 'add the note' : 'send' }}</MiText>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Val = string | number
interface Msg { id: number, kind: 'customer' | 'agent' | 'note', author: string, time: string, text: string, files?: string }

const clip = '<path d="M20.5 11.5 12.6 19.4a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>'
const modes = [{ value: 'reply', label: 'Reply' }, { value: 'note', label: 'Note' }]
const snippets = [
  { label: 'VAT update steps', text: 'You can update the VAT number under Settings → Billing → Tax details. New invoices pick it up straight away.' },
  { label: 'Reissue invoice', text: 'I have reissued invoice INV-2291 with the correct VAT number; it is attached to this reply.' },
  { label: 'Sign-off', text: 'Let me know if anything else looks off. Have a good week!' }
]

const thread = ref<Msg[]>([
  { id: 1, kind: 'customer', author: 'Marta Kowalski', time: '09:12', text: 'Hi! We changed our VAT number in September but October’s invoice still shows the old one (PL5260001246). Our accountant needs a corrected copy.' },
  { id: 2, kind: 'note', author: 'Jonas Weber', time: '09:40', text: 'Billing confirms the new number was saved on Oct 3, after the invoice was generated. Safe to reissue.' }
])
const mode = ref<Val | null>('reply')
const body = ref('')
const files = ref<string[]>([])
const solveOnSend = ref(false)
const solved = ref(false)
const error = ref('')
const guard = ref(false)
const picker = ref<HTMLInputElement | null>(null)

function insert(text: string) {
  body.value = body.value.trim() ? body.value.trimEnd() + '\n\n' + text : text
  error.value = ''
}
function addFiles(e: Event) {
  const input = e.target as HTMLInputElement
  for (const f of Array.from(input.files ?? [])) if (!files.value.includes(f.name)) files.value.push(f.name)
  input.value = ''
  guard.value = false
}

function send(force: boolean) {
  const text = body.value.trim()
  if (!text) { error.value = mode.value === 'note' ? 'A note needs some text.' : 'Write a reply before sending.'; return }
  if (!force && mode.value === 'reply' && !files.value.length && /\b(attach(ed|ment)?|enclosed)\b/i.test(text)) { guard.value = true; return }
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  thread.value.push({
    id: Date.now(), kind: mode.value === 'note' ? 'note' : 'agent', author: 'Inès Moreau', time: now, text,
    files: files.value.length ? files.value.join(', ') : undefined
  })
  if (mode.value === 'reply' && solveOnSend.value) solved.value = true
  body.value = ''
  files.value = []
  error.value = ''
  guard.value = false
}
</script>

<style scoped>
.src { container: src / inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.src__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.src__who { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1 1 240px; }
.src__who > div { min-width: 0; }

.src__thread { display: grid; gap: 14px; margin: 0; padding: 16px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-fill4); max-height: 340px; overflow-y: auto; overscroll-behavior: contain; }
.src__note-msg {
  display: grid; gap: 4px; max-width: 520px; margin-inline: auto; padding: 10px 14px; border-radius: 12px;
  background: color-mix(in srgb, var(--mi-yellow) 16%, var(--mi-card)); border: 1px dashed color-mix(in srgb, var(--mi-orange) 45%, transparent);
}

.src__composer {
  display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2);
}
/* Note mode: the composer turns into a sticky note so nobody sends a note to the customer by mistake. */
.src__composer.is-note { background: color-mix(in srgb, var(--mi-yellow) 12%, var(--mi-card)); }
.src__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.src__snips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 2px 0; }
.src__snip {
  flex: none; padding: 4px 10px; border: 1px solid var(--mi-sep); border-radius: 999px; background: transparent; cursor: pointer;
  font: inherit; font-size: 12px; color: var(--mi-label2);
}
.src__snip:hover { color: var(--mi-label); background: var(--mi-fill3); }
.src__snip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.src__tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.src__left { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }
.src__right { display: flex; align-items: center; gap: 12px; margin-inline-start: auto; }
.src__solve { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label2); cursor: pointer; }
.src__file { display: none; }
.src__att { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--mi-label2); }

.src__guard {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; padding: 10px 12px; border-radius: 12px; color: var(--mi-orange-t);
  background: color-mix(in srgb, var(--mi-orange) 12%, transparent); animation: src-in var(--mi-dur-3) var(--mi-ease);
}
.src__guard :deep(p) { color: var(--mi-label); flex: 1 1 200px; }
.src__guard-actions { display: flex; gap: 6px; }
@keyframes src-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .src__guard { animation: none; } }
</style>
