<template>
  <section class="cec" aria-labelledby="cec-title">
    <div class="cec__grid">
      <form class="cec__form" novalidate @submit.prevent="sendTest">
        <header class="cec__head">
          <div>
            <MiText id="cec-title" variant="title3" as="h2" weight="semibold">November product email</MiText>
            <MiText variant="footnote" tone="label2">Campaign · 18,402 subscribers · draft saved 2 min ago</MiText>
          </div>
          <MiBadge tone="neutral" label="Draft" />
        </header>

        <MiField label="From"><MiNativeSelect v-model="from" :options="SENDERS" /></MiField>

        <MiField label="Subject line" :hint="`${subject.length} characters · ${device === 'phone' ? 'phones show about 35' : 'desktop shows about 60'}`">
          <template #label-end>
            <span class="cec__tags" role="group" aria-label="Insert a merge tag">
              <button v-for="t in TAGS" :key="t.key" type="button" class="cec__tag" @click="insert(t.key)">+ {{ t.label }}</button>
            </span>
          </template>
          <MiInput v-model="subject" />
        </MiField>

        <MiField label="Preview text" hint="The grey line after the subject. Leave it empty and clients show the first words of the body.">
          <MiInput v-model="preheader" placeholder="Shown next to the subject in the inbox" clearable />
        </MiField>

        <MiEditor v-model="body" label="Email body" :min-height="180" />

        <footer class="cec__foot">
          <MiText variant="caption" :tone="sent ? 'green' : 'label2'" aria-live="polite">{{ sent ? 'Test sent to marketing@fernhill.co' : `${passed} of ${checks.length} checks pass` }}</MiText>
          <div class="cec__btns">
            <MiButton type="submit" variant="gray">Send test</MiButton>
            <MiButton :disabled="passed < checks.length">Schedule</MiButton>
          </div>
        </footer>
      </form>

      <aside class="cec__side" aria-labelledby="cec-inbox-title">
        <div class="cec__side-head">
          <MiText id="cec-inbox-title" variant="headline" as="h3">In the inbox</MiText>
          <MiSegmented v-model="device" label="Preview size" :options="[{ value: 'desktop', label: 'Desktop' }, { value: 'phone', label: 'Phone' }]" />
        </div>
        <MiSegmented v-model="who" label="Preview as" :options="RECIPIENTS.map((r, i) => ({ value: i, label: r.label }))" />

        <!-- A faux inbox: our email sits between two real-looking neighbours. -->
        <ul class="cec__inbox" :data-device="device">
          <li v-for="m in inbox" :key="m.id" :class="{ 'is-ours': m.ours }">
            <span class="cec__dot" aria-hidden="true" />
            <div class="cec__mail">
              <div class="cec__mail-top"><b>{{ m.from }}</b><span>{{ m.time }}</span></div>
              <p class="cec__subj">{{ m.subject }}</p>
              <p class="cec__pre">{{ m.pre }}</p>
            </div>
          </li>
        </ul>

        <ul class="cec__checks">
          <li v-for="c in checks" :key="c.label" :class="{ 'is-ok': c.ok }">
            <MiIcon :name="c.ok ? 'check-circle-fill' : 'exclamation-circle'" :size="16" />{{ c.label }}
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

<style scoped>
.cec { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cec__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 900px) { .cec__grid { grid-template-columns: minmax(0, 1fr) 340px; align-items: start; } }
.cec__form { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.cec__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cec__tags { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.cec__tag { padding: 2px 8px; border: 0; border-radius: 999px; background: var(--mi-p-tint); color: var(--mi-p-text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.cec__tag:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.cec__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.cec__btns { display: flex; gap: 8px; }

.cec__side { display: grid; gap: 12px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cec__side-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.cec__inbox { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); overflow: hidden; }
.cec__inbox[data-device="phone"] { max-width: 300px; justify-self: center; width: 100%; }
.cec__inbox li { display: grid; grid-template-columns: 8px minmax(0, 1fr); gap: 10px; padding: 12px; background: var(--mi-card); }
.cec__inbox li + li { border-top: 1px solid var(--mi-sep); }
.cec__inbox li.is-ours { background: var(--mi-p-tint); }
.cec__dot { width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; background: var(--mi-blue); }
.cec__mail { min-width: 0; }
.cec__mail-top { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.cec__mail-top span { color: var(--mi-label3); font-size: 12px; }
.cec__subj, .cec__pre { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.cec__pre { color: var(--mi-label2); }
.cec__checks { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 13px; }
.cec__checks li { display: flex; align-items: center; gap: 8px; color: var(--mi-label2); }
.cec__checks li :deep(svg) { flex: none; color: var(--mi-orange); }
.cec__checks li.is-ok { color: var(--mi-label); }
.cec__checks li.is-ok :deep(svg) { color: var(--mi-green); }
</style>
