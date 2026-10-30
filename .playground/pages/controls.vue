<script setup lang="ts">
import { reactive, ref } from 'vue'
import MiSwitch from '../../app/components/Controls/MiSwitch.vue'
import MiStepper from '../../app/components/Controls/MiStepper.vue'
import MiCheckbox from '../../app/components/Controls/MiCheckbox.vue'
import MiCheckboxGroup from '../../app/components/Controls/MiCheckboxGroup.vue'
import MiRadio from '../../app/components/Controls/MiRadio.vue'
import MiRadioGroup from '../../app/components/Controls/MiRadioGroup.vue'
import MiSegmented from '../../app/components/Controls/MiSegmented.vue'
import MiSlider from '../../app/components/Controls/MiSlider.vue'
import MiChip from '../../app/components/Controls/MiChip.vue'
import MiSwatch from '../../app/components/Controls/MiSwatch.vue'

const themes = [{ name: 'Light', cls: 'mi-light' }, { name: 'Dark', cls: 'mi-dark' }]

const sw = reactive({ wifi: true, bt: false, focus: true, a: true, b: true, c: true, d: true })
const qty = ref(2)
const fontPt = ref(13)

const notif = ref<string[]>(['email', 'digest'])
const notifOptions = [
  { value: 'email', label: 'Email', description: 'Receipts and account notices' },
  { value: 'push', label: 'Push notifications', description: 'On this device only' },
  { value: 'digest', label: 'Weekly digest', description: 'A summary every Monday' }
]
const freq = ref<string | number | boolean | null>('daily')
const freqOptions = [
  { value: 'instant', label: 'Instantly', description: 'As soon as something changes' },
  { value: 'daily', label: 'Daily digest', description: 'Every morning at 9:00' },
  { value: 'weekly', label: 'Weekly summary', description: 'Mondays only' },
  { value: 'never', label: 'Never', description: 'You can still check the activity feed' }
]

const range = ref<string | number | null>('week')
const rangeOptions = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]
const billing = ref<string | number | null>('yearly')
const billingOptions = [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]
const layout = ref<string | number | null>('grid')
const layoutOptions = [
  { value: 'list', icon: 'list' as const, ariaLabel: 'List' },
  { value: 'grid', icon: 'grid' as const, ariaLabel: 'Grid' },
  { value: 'columns', icon: 'columns' as const, ariaLabel: 'Columns' }
]

const volume = ref(64)
const warmth = ref(40)
const price = ref<[number, number]>([20, 75])

const filters = ref<string[]>(['Design', 'Engineering'])
const allFilters = ['All', 'Design', 'Engineering', 'Marketing', 'Sales', 'Support']
const tags = ref(['Swift', 'Vue', 'Nuxt'])
const color = ref<string | null>('primary')

function setFilter(name: string, on: boolean) {
  filters.value = on ? [...filters.value, name] : filters.value.filter(f => f !== name)
}
</script>

<template>
  <div class="mi page">
    <section v-for="t in themes" :key="t.name" :class="['mi', t.cls, 'col']" :data-theme-name="t.name">
      <h1>Selection controls · {{ t.name }}</h1>

      <h2>Switches</h2>
      <div class="card list">
        <div class="row"><span class="tile" style="background:var(--mi-blue);color:#fff"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9a15 15 0 0120 0M5 12.5a10.5 10.5 0 0114 0M8.5 16a5.5 5.5 0 017 0"/><circle cx="12" cy="19.2" r="1" fill="currentColor"/></svg></span><span class="grow">Wi-Fi</span><MiSwitch v-model="sw.wifi" label="Wi-Fi" /></div>
        <div class="row"><span class="tile" style="background:var(--mi-indigo);color:#fff"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg></span><span class="grow">Bluetooth</span><MiSwitch v-model="sw.bt" label="Bluetooth" /></div>
        <div class="row"><span class="tile" style="background:var(--mi-purple);color:#fff"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg></span><span class="grow">Focus mode</span><MiSwitch v-model="sw.focus" label="Focus mode" /></div>
        <div class="row"><span class="tile" style="background:var(--mi-fill);color:var(--mi-label3)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg></span><span class="grow muted">Managed by your organization</span><MiSwitch :model-value="true" disabled label="Managed setting" /></div>
      </div>

      <h2>Variants and steppers</h2>
      <div class="card stack">
        <div class="wrap">
          <label class="inline"><MiSwitch v-model="sw.a" label="Primary" /><small>Primary</small></label>
          <label class="inline"><MiSwitch v-model="sw.b" tone="secondary" label="Secondary" /><small>Secondary</small></label>
          <label class="inline"><MiSwitch v-model="sw.c" tone="success" label="Success" /><small>Success</small></label>
          <label class="inline"><MiSwitch v-model="sw.d" size="compact" label="Compact" /><small>Compact</small></label>
        </div>
        <div class="row split"><span><b>Seats</b><small class="block">Between 1 and 10</small></span><MiStepper v-model="qty" :min="1" :max="10" label="Seats" show-value /></div>
        <div class="row split"><span><b>Font size</b><small class="block">Desktop stepper with value field</small></span><MiStepper v-model="fontPt" variant="field" :min="8" :max="72" unit="pt" label="Font size" /></div>
      </div>

      <h2>Checkboxes and radios</h2>
      <div class="grid2">
        <div class="card"><MiCheckboxGroup v-model="notif" label="Notifications" parent-label="All notifications" :options="notifOptions" /></div>
        <div class="card"><MiRadioGroup v-model="freq" label="Summary frequency" :options="freqOptions" /></div>
      </div>

      <h2>Segmented controls</h2>
      <div class="card stack">
        <div class="grid2">
          <div class="stack"><small>Regular</small><MiSegmented v-model="range" :options="rangeOptions" label="Date range" /><small>Showing: {{ range }}</small></div>
          <div class="stack"><small>Tinted with primary</small><MiSegmented v-model="billing" :options="billingOptions" variant="tinted" label="Plan billing" /></div>
        </div>
        <div class="stack"><small>Icon segments</small><MiSegmented v-model="layout" :options="layoutOptions" label="Layout" /></div>
      </div>

      <h2>Sliders</h2>
      <div class="grid2">
        <div class="card stack">
          <MiSlider v-model="volume" label="Volume" unit="%">
            <template #start><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /></svg></template>
            <template #end><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5h3.5L11 5.5v13l-4.5-4H3z" /><path d="M15 9a4 4 0 010 6M17.5 6.5a7.5 7.5 0 010 11" /></svg></template>
          </MiSlider>
          <MiSlider v-model="warmth" label="Warmth" unit="%" tone="secondary">
            <template #start>Less</template>
            <template #end>More</template>
          </MiSlider>
        </div>
        <div class="card stack">
          <MiSlider v-model="price" label="Price range" :min="0" :max="100" :step="5" unit="$" />
          <MiSlider :model-value="30" disabled aria-label="Disabled slider" />
        </div>
      </div>

      <h2>Chips and color well</h2>
      <div class="card stack">
        <div class="wrap">
          <MiChip v-for="f in allFilters" :key="f" selectable :label="f" :model-value="filters.includes(f)" @update:model-value="setFilter(f, $event)" />
        </div>
        <div class="wrap">
          <MiChip v-for="tg in tags" :key="tg" removable tone="secondary" :label="tg" @remove="tags = tags.filter(x => x !== tg)" />
          <MiChip label="Static" size="small" />
          <MiChip selectable tone="neutral" size="small" label="Neutral" :model-value="true" />
          <MiChip selectable disabled label="Disabled" />
        </div>
        <MiSwatch v-model="color" label="Label color" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); min-height: 100dvh; }
.col { background: var(--mi-page); color: var(--mi-label); padding: 32px 16px; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
h1 { margin: 0 0 8px; font-size: 32px; letter-spacing: -.03em; }
h2 { margin: 12px 0 0; font-size: 22px; letter-spacing: -.02em; }
.card { background: var(--mi-card); border-radius: 20px; box-shadow: var(--mi-sh1); padding: 20px; min-width: 0; }
.card.list { border-radius: 14px; padding: 0 16px; }
.stack { display: flex; flex-direction: column; gap: 14px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; }
.row { display: flex; align-items: center; gap: 14px; min-height: 52px; font-size: 17px; }
.row + .row { border-top: .5px solid var(--mi-sep); }
.row.split { justify-content: space-between; font-size: 15px; }
.grow { flex: 1; }
.tile { width: 30px; height: 30px; flex: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.muted, small { color: var(--mi-label2); }
small { font-size: 13px; }
.block { display: block; }
.wrap { display: flex; flex-wrap: wrap; gap: 8px 24px; align-items: center; }
.inline { display: inline-flex; align-items: center; gap: 10px; }
</style>
