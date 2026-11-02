<script setup lang="ts">
import { ref } from 'vue'
import MiFileUpload from '../../app/components/Inputs/MiFileUpload.vue'
import MiFileInput from '../../app/components/Inputs/MiFileInput.vue'
import MiTimePicker from '../../app/components/Inputs/MiTimePicker.vue'
import MiRating from '../../app/components/Controls/MiRating.vue'
import MiPasswordStrength from '../../app/components/Inputs/MiPasswordStrength.vue'
import MiRepeater from '../../app/components/Inputs/MiRepeater.vue'
import MiInput from '../../app/components/Inputs/MiInput.vue'

const themes = [{ name: 'Light', cls: 'mi-light' }, { name: 'Dark', cls: 'mi-dark' }]

const files = ref<File[]>([new File(['x'.repeat(2400)], 'brand-guidelines.pdf'), new File(['x'.repeat(880000)], 'hero-shot.png')])
const none = ref<File[]>([])
const single = ref<File[]>([])
const progress = { 'brand-guidelines.pdf': 1, 'hero-shot.png': 0.58 }
const rejected = ref('')
function onReject(r: { file: File, reason: string }[]) { rejected.value = r.map(x => `${x.file.name} (${x.reason})`).join(', ') }

const input1 = ref<File | File[] | null>(null)
const input2 = ref<File | File[] | null>([])

const t24 = ref<string | null>('14:30')
const t12 = ref<string | null>('09:05')
const tSec = ref<string | null>('18:45:10')
const tEmpty = ref<string | null>(null)
const tRange = ref<string | null>('10:00')

const r1 = ref(3)
const r2 = ref(3.5)
const r3 = ref(2)
const r4 = ref(4)

const pw = ref('')
const pw2 = ref('Mica-2026')
const pwScore = ref(0)

const guests = ref([{ name: 'Ada Lovelace', email: 'ada@example.com' }, { name: '', email: '' }])
const blank = () => ({ name: '', email: '' })
</script>

<template>
  <div class="mi page">
    <section v-for="t in themes" :key="t.name" :class="['mi', t.cls, 'col']" :data-theme-name="t.name">
      <h1>Forms · {{ t.name }}</h1>

      <h2>File upload</h2>
      <div class="card stack">
        <MiFileUpload v-model="files" multiple accept="image/*,.pdf" :max-size="5242880" :max-files="3" hint="PNG, JPG or PDF up to 5 MB" :progress="progress" label="Upload documents" @reject="onReject" />
        <small>Last rejected: {{ rejected || 'none' }}</small>
        <div class="grid2">
          <MiFileUpload v-model="single" label="Single file" hint="Replaces the current file" />
          <MiFileUpload v-model="none" disabled label="Disabled" hint="Uploads are locked" />
        </div>
      </div>

      <h2>File input</h2>
      <div class="card stack">
        <MiFileInput v-model="input1" label="Resume" accept=".pdf,.doc,.docx" :max-size="2097152" />
        <MiFileInput v-model="input2" multiple label="Attachments" button-label="Choose files" />
        <MiFileInput :model-value="null" disabled label="Disabled" />
      </div>

      <h2>Time picker</h2>
      <div class="card wrap">
        <label class="field"><small>24 hour</small><MiTimePicker v-model="t24" label="Start" /></label>
        <label class="field"><small>12 hour</small><MiTimePicker v-model="t12" hour12 label="Alarm" /></label>
        <label class="field"><small>Seconds</small><MiTimePicker v-model="tSec" seconds label="Precise" /></label>
        <label class="field"><small>Step 15, 09:00 to 17:30</small><MiTimePicker v-model="tRange" :minute-step="15" min="09:00" max="17:30" label="Office hours" /></label>
        <label class="field"><small>Empty</small><MiTimePicker v-model="tEmpty" label="Empty" /></label>
        <label class="field"><small>Invalid</small><MiTimePicker :model-value="'25:00'" invalid label="Invalid" /></label>
        <label class="field"><small>Disabled</small><MiTimePicker :model-value="'08:00'" disabled label="Disabled" /></label>
      </div>

      <h2>Rating</h2>
      <div class="card stack">
        <div class="wrap"><MiRating v-model="r1" label="Whole stars" show-value /><MiRating v-model="r2" half label="Half stars" show-value /></div>
        <div class="wrap"><MiRating v-model="r3" size="sm" clearable label="Small, clearable" /><MiRating v-model="r4" size="lg" label="Large" /></div>
        <div class="wrap"><MiRating :model-value="4.5" half readonly label="Read only" show-value /><MiRating :model-value="3" disabled label="Disabled" /><MiRating :model-value="7" :max="10" size="sm" readonly label="Ten stars" /></div>
      </div>

      <h2>Password strength</h2>
      <div class="card grid2">
        <div class="stack">
          <MiInput v-model="pw" type="password" aria-label="New password" placeholder="Type a password" />
          <MiPasswordStrength :value="pw" @score="pwScore = $event" />
          <small>Score: {{ pwScore }}</small>
        </div>
        <div class="stack">
          <MiInput v-model="pw2" type="password" aria-label="Password with checklist" />
          <MiPasswordStrength :value="pw2" :requirements="['length', 'upper', 'lower', 'number', 'symbol']" />
        </div>
      </div>

      <h2>Repeater</h2>
      <div class="card stack">
        <MiRepeater v-model="guests" :template="blank" :min="1" :max="4" label="Guest" add-label="Add guest" remove-label="Remove guest">
          <template #default="{ row, update }">
            <MiInput :model-value="String(row.name)" placeholder="Name" aria-label="Name" @update:model-value="update({ name: $event })" />
            <MiInput :model-value="String(row.email)" type="email" placeholder="Email" aria-label="Email" @update:model-value="update({ email: $event })" />
          </template>
        </MiRepeater>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); min-height: 100dvh; }
.col { background: var(--mi-page); color: var(--mi-label); padding: 32px 16px; display: flex; flex-direction: column; gap: 16px; min-width: 0; font-family: var(--mi-font); }
h1 { margin: 0 0 8px; font-size: 32px; letter-spacing: -.03em; }
h2 { margin: 12px 0 0; font-size: 22px; letter-spacing: -.02em; }
.card { background: var(--mi-card); border-radius: 20px; box-shadow: var(--mi-sh1); padding: 20px; min-width: 0; }
.stack { display: flex; flex-direction: column; gap: 14px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; }
.wrap { display: flex; flex-wrap: wrap; gap: 16px 28px; align-items: center; }
.field { display: grid; gap: 6px; }
small { color: var(--mi-label2); font-size: 13px; }
</style>
