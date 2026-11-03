<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="cec-title">
    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[900px]:grid-cols-[minmax(0,_1fr)_340px] mi:@[900px]:items-start">
      <form class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="sendTest">
        <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
          <div>
            <MiText id="cec-title" variant="title3" as="h2" weight="semibold">November product email</MiText>
            <MiText variant="footnote" tone="label2">Campaign · 18,402 subscribers · draft saved 2 min ago</MiText>
          </div>
          <MiBadge tone="neutral" label="Draft" />
        </header>

        <MiField label="From"><MiNativeSelect v-model="from" :options="SENDERS" /></MiField>

        <MiField label="Subject line" :hint="`${subject.length} characters · ${device === 'phone' ? 'phones show about 35' : 'desktop shows about 60'}`">
          <template #label-end>
            <span class="mi:inline-flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Insert a merge tag">
              <button v-for="t in TAGS" :key="t.key" type="button" class="mi:[font:inherit] mi:text-[12px] mi:font-semibold mi:py-0.5 mi:px-2 mi:[border:0] mi:rounded-[999px] mi:bg-p-tint mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="insert(t.key)">+ {{ t.label }}</button>
            </span>
          </template>
          <MiInput v-model="subject" />
        </MiField>

        <MiField label="Preview text" hint="The grey line after the subject. Leave it empty and clients show the first words of the body.">
          <MiInput v-model="preheader" placeholder="Shown next to the subject in the inbox" clearable />
        </MiField>

        <MiEditor v-model="body" label="Email body" :min-height="180" />

        <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText variant="caption" :tone="sent ? 'green' : 'label2'" aria-live="polite">{{ sent ? 'Test sent to marketing@fernhill.co' : `${passed} of ${checks.length} checks pass` }}</MiText>
          <div class="mi:flex mi:gap-2">
            <MiButton type="submit" variant="gray">Send test</MiButton>
            <MiButton :disabled="passed < checks.length">Schedule</MiButton>
          </div>
        </footer>
      </form>

      <aside class="mi:grid mi:gap-3 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="cec-inbox-title">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
          <MiText id="cec-inbox-title" variant="headline" as="h3">In the inbox</MiText>
          <MiSegmented v-model="device" label="Preview size" :options="[{ value: 'desktop', label: 'Desktop' }, { value: 'phone', label: 'Phone' }]" />
        </div>
        <MiSegmented v-model="who" label="Preview as" :options="RECIPIENTS.map((r, i) => ({ value: i, label: r.label }))" />

        <!-- A faux inbox: our email sits between two real-looking neighbours. -->
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:border mi:border-sep mi:overflow-hidden mi:[&[data-device='phone']]:max-w-75 mi:[&[data-device='phone']]:justify-self-center mi:[&[data-device='phone']]:w-full" :data-device="device">
          <li class="mi:not-first:border-t mi:not-first:border-t-sep mi:grid mi:grid-cols-[8px_minmax(0,_1fr)] mi:gap-2.5 mi:p-3" v-for="m in inbox" :key="m.id" :class="m.ours ? 'mi:bg-p-tint' : 'mi:bg-card'">
            <span class="mi:w-2 mi:h-2 mi:mt-[5px] mi:rounded-[50%] mi:bg-blue" aria-hidden="true" />
            <div class="mi:min-w-0">
              <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[13px]"><b>{{ m.from }}</b><span class="mi:text-label3 mi:text-[12px]">{{ m.time }}</span></div>
              <p class="mi:m-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13px]">{{ m.subject }}</p>
              <p class="mi:m-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13px] mi:text-label2">{{ m.pre }}</p>
            </div>
          </li>
        </ul>

        <ul class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px]">
          <li class="mi:flex mi:items-center mi:gap-2" v-for="c in checks" :key="c.label" :class="c.ok ? 'mi:text-label' : 'mi:text-label2'">
            <MiIcon class="mi:flex-[none]" :class="c.ok ? 'mi:text-green' : 'mi:text-orange'" :name="c.ok ? 'check-circle-fill' : 'exclamation-circle'" :size="16" />{{ c.label }}
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const SENDERS = [{ value: 'iris', label: 'Iris at Fernhill <iris@fernhill.co>' }, { value: 'team', label: 'Fernhill <hello@fernhill.co>' }]
const TAGS = [{ key: '{first_name}', label: 'First name' }, { key: '{plan}', label: 'Plan' }]
const RECIPIENTS = [
  { label: 'Ava, Pro plan', first_name: 'Ava', plan: 'Pro' },
  { label: 'No name, Free plan', first_name: '', plan: 'Free' }
]
const SPAM = /\b(free|act now|guaranteed|winner)\b|!!/i

const from = ref<string | number | null>('iris')
const subject = ref('{first_name}, your {plan} workspace just got offline mode')
const preheader = ref('Edit boards on the train; changes sync the moment you are back.')
const body = ref('<h2>Work anywhere, even without signal</h2><p>Boards, docs and comments now open offline. Everything syncs when you reconnect.</p><ul><li>Turn it on in Settings › Offline</li><li>Works on desktop and mobile</li></ul>')
const device = ref<string | number | null>('desktop')
const who = ref<string | number | null>(0)
const sent = ref(false)

const person = computed(() => RECIPIENTS[Number(who.value)] ?? RECIPIENTS[0]!)
const fill = (s: string) => s.replace('{first_name}', person.value.first_name || 'Hi there').replace('{plan}', person.value.plan)
const limit = computed(() => (device.value === 'phone' ? 35 : 60))
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)
const bodyText = computed(() => body.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())

const inbox = computed(() => [
  { id: 1, from: 'Linear', time: '9:41', subject: 'Weekly digest: 12 issues closed', pre: 'Your team shipped 4 projects this week.', ours: false },
  { id: 2, from: SENDERS.find(s => s.value === from.value)?.label.split(' <')[0] ?? '', time: '9:30', subject: cut(fill(subject.value), limit.value), pre: cut(preheader.value || bodyText.value, limit.value + 20), ours: true },
  { id: 3, from: 'Calendar', time: '8:02', subject: 'Design review moved to 15:00', pre: 'Room 4B · 45 minutes', ours: false }
])
const checks = computed(() => [
  { label: 'Subject fits on a phone', ok: fill(subject.value).length <= 35 },
  { label: 'Preview text is set', ok: preheader.value.trim().length > 0 },
  { label: 'No spam trigger words', ok: !SPAM.test(subject.value + ' ' + preheader.value) },
  { label: 'Body has a heading', ok: body.value.includes('<h') }
])
const passed = computed(() => checks.value.filter(c => c.ok).length)

function insert(tag: string) {
  subject.value = subject.value.includes(tag) ? subject.value : `${subject.value.trimEnd()} ${tag}`
}
watch([subject, preheader, body, from], () => { sent.value = false })
function sendTest() { sent.value = true }
</script>
