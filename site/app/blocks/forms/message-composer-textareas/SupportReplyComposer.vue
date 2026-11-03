<template>
  <section class="mi:@container/src mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="src-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
      <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:flex-[1_1_240px]">
        <MiAvatar name="Marta Kowalski" size="sm" tone="auto" decorative />
        <div class="mi:min-w-0">
          <MiText id="src-title" as="h2" variant="headline" :lines="1">Invoice shows the old VAT number</MiText>
          <MiText variant="caption" tone="label2">#48213 · Marta Kowalski · Studio plan</MiText>
        </div>
      </div>
      <MiBadge :label="solved ? 'Solved' : 'Open'" :tone="solved ? 'success' : 'primary'" dot />
    </header>

    <ol class="mi:grid mi:gap-3.5 mi:m-0 mi:p-4 mi:[list-style:none] mi:rounded-xl mi:bg-fill4 mi:max-h-85 mi:overflow-y-auto mi:overscroll-contain" aria-label="Conversation">
      <li v-for="m in thread" :key="m.id">
        <div v-if="m.kind === 'note'" class="mi:grid mi:gap-1 mi:max-w-130 mi:mx-auto mi:py-2.5 mi:px-3.5 mi:rounded-[12px] mi:[background:color-mix(in_srgb,_var(--mi-yellow)_16%,_var(--mi-card))] mi:[border:1px_dashed_color-mix(in_srgb,_var(--mi-orange)_45%,_transparent)]">
          <MiText variant="caption" weight="semibold">{{ m.author }} · internal note · {{ m.time }}</MiText>
          <MiText variant="footnote">{{ m.text }}</MiText>
        </div>
        <MiMessage v-else :align="m.kind === 'agent' ? 'end' : 'start'" :label="m.author">
          <template #avatar><MiAvatar :name="m.author" size="xs" tone="auto" decorative /></template>
          <template #header><MiText variant="caption2" tone="label2">{{ m.author }} · {{ m.time }}</MiText></template>
          <MiBubble :variant="m.kind === 'agent' ? 'default' : 'muted'" :align="m.kind === 'agent' ? 'end' : 'start'">{{ m.text }}</MiBubble>
          <template v-if="m.files" #footer><span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[11px] mi:text-label2"><MiIcon :svg="clip" :size="13" />{{ m.files }}</span></template>
        </MiMessage>
      </li>
    </ol>

    <form class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-xl mi:shadow-2" :class="mode === 'note' ? 'mi:[background:color-mix(in_srgb,_var(--mi-yellow)_12%,_var(--mi-card))]' : 'mi:bg-card'" novalidate @submit.prevent="send(false)" @keydown.enter.meta.prevent="send(false)" @keydown.enter.ctrl.prevent="send(false)">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3">
        <MiSegmented v-model="mode" label="Message type" :options="modes" />
        <MiText variant="caption" tone="label2" :lines="1">{{ mode === 'note' ? 'Only your team sees notes' : 'To marta@kowalski.design' }}</MiText>
      </div>

      <MiInputGroup
        v-model="body" multiline :rows="3" :invalid="!!error"
        :aria-label="mode === 'note' ? 'Internal note' : 'Reply to Marta'" aria-describedby="src-hint"
        :placeholder="mode === 'note' ? 'Leave context for the next person on this ticket…' : 'Write your reply…'"
      >
        <template #block-start>
          <div class="mi:flex mi:gap-1.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:py-0.5 mi:px-0" role="group" aria-label="Saved replies">
            <button v-for="s in snippets" :key="s.label" type="button" class="mi:[font:inherit] mi:text-[12px] mi:flex-[none] mi:py-1 mi:px-2.5 mi:border mi:border-sep mi:rounded-[999px] mi:bg-transparent mi:cursor-pointer mi:text-label2 mi:hover:text-label mi:hover:bg-fill3 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="insert(s.text)">{{ s.label }}</button>
          </div>
        </template>
        <template #block-end>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:w-full">
            <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:min-w-0">
              <MiIconButton label="Attach files" variant="plain" size="small" @click="picker?.click()">
                <MiIcon :svg="clip" :size="18" />
              </MiIconButton>
              <input ref="picker" type="file" multiple class="mi:hidden" tabindex="-1" aria-hidden="true" @change="addFiles">
              <MiChip v-for="(f, i) in files" :key="f" :label="f" size="small" tone="neutral" removable :remove-label="'Remove ' + f" @remove="files.splice(i, 1)" />
            </div>
            <div class="mi:flex mi:items-center mi:gap-3 mi:ms-auto">
              <label v-if="mode === 'reply'" class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:text-label2 mi:cursor-pointer">
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
      <div v-if="guard" class="mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-2.5 mi:py-2.5 mi:px-3 mi:rounded-[12px] mi:text-orange-t mi:[background:color-mix(in_srgb,_var(--mi-orange)_12%,_transparent)]" role="alert">
        <MiIcon name="warning" :size="18" />
        <MiText variant="footnote" class="mi:text-label! mi:flex-[1_1_200px]">Your reply mentions an attachment, but nothing is attached.</MiText>
        <div class="mi:flex mi:gap-1.5">
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

