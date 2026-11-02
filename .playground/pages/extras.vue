<script setup lang="ts">
import { ref } from 'vue'
import MiDonutChart from '../../app/components/Charts/MiDonutChart.vue'
import MiScatterChart from '../../app/components/Charts/MiScatterChart.vue'
import MiCopyButton from '../../app/components/Buttons/MiCopyButton.vue'
import MiDevice from '../../app/components/Base/MiDevice.vue'
import MiConfetti from '../../app/components/Feedback/MiConfetti.vue'
import MiEditor from '../../app/components/Inputs/MiEditor.vue'
import MiButton from '../../app/components/Buttons/MiButton.vue'
import { useMiConfetti } from '../../app/composables/useMiConfetti'

const channels = [
  { label: 'Direct', value: 4200 },
  { label: 'Search', value: 3100 },
  { label: 'Social', value: 1700 },
  { label: 'Referral', value: 1000 }
]
const groupA = [{ x: 158, y: 52 }, { x: 163, y: 58 }, { x: 167, y: 61 }, { x: 171, y: 66 }, { x: 175, y: 71 }, { x: 180, y: 77 }, { x: 184, y: 80 }]
const groupB = [{ x: 160, y: 62 }, { x: 166, y: 69 }, { x: 170, y: 74 }, { x: 174, y: 79 }, { x: 178, y: 84 }, { x: 183, y: 90 }]
const scatter = [{ name: 'Group A', points: groupA }, { name: 'Group B', points: groupB }]
const bubbles = [
  { name: 'EMEA', points: [{ x: 12, y: 40, r: 120 }, { x: 25, y: 55, r: 300 }, { x: 40, y: 48, r: 60 }, { x: 55, y: 70, r: 500 }] },
  { name: 'APAC', points: [{ x: 18, y: 30, r: 90 }, { x: 33, y: 62, r: 220 }, { x: 48, y: 80, r: 150 }] }
]
const html = ref('<h2>Release notes</h2><p>Select text and use <strong>Bold</strong>, <em>Italic</em> or <a href="https://example.com">links</a>.</p><ul><li>Lists</li><li>Quotes</li></ul><blockquote>A quote.</blockquote><p>Inline <code>code</code>.</p>')
const empty = ref('')
const { fire } = useMiConfetti()
const themes = [{ cls: 'mi-light', name: 'Light' }, { cls: 'mi-dark', name: 'Dark' }]
const devices = ['phone', 'tablet', 'laptop', 'browser'] as const
</script>

<template>
  <div class="mi mi-px">
    <MiConfetti />
    <section v-for="th in themes" :key="th.cls" :class="['mi-px-theme', th.cls]">
      <header>
        <p class="mi-px-eyebrow">Extras</p>
        <h1>Charts, devices and editing</h1>
        <span class="mi-px-pill">{{ th.name }} appearance</span>
      </header>

      <h2>Donut and pie</h2>
      <div class="mi-px-pair">
        <MiDonutChart title="Revenue by channel" subtitle="Last 30 days" unit="$" :data="channels" />
        <MiDonutChart title="Pie with labels" variant="pie" value-labels="percent" :data="channels" :toggle="false" />
        <MiDonutChart title="Thin ring, no legend" :thickness="14" :gap="6" :legend="false" :data="channels" total-label="Visits" />
        <MiDonutChart title="Empty" :data="[]" />
        <MiDonutChart title="Custom center" :data="channels" value-labels="value">
          <template #center="{ active, totalText }">
            <strong style="font-size:22px">{{ active ? active.label : 'All' }}</strong>
            <span style="font-size:12px;color:var(--mi-label2)">{{ active ? active.text : totalText }}</span>
          </template>
        </MiDonutChart>
      </div>

      <h2>Scatter and bubble</h2>
      <div class="mi-px-pair">
        <MiScatterChart title="Height vs. weight" x-label="Height" y-label="Weight" x-unit=" cm" y-unit=" kg" :series="scatter" />
        <MiScatterChart title="Bubble size" x-label="Spend" y-label="Growth" y-unit="%" size-label="Customers" :series="bubbles" />
        <MiScatterChart title="Single series" :series="[scatter[0]!]" :height="220" />
      </div>

      <h2>Copy button</h2>
      <div class="mi-px-row">
        <MiCopyButton value="npm install mica" />
        <MiCopyButton value="npm install mica" variant="outline" label="Copy command" copied-label="Copied!" />
        <MiCopyButton value="id_42" variant="ghost" icon-only label="Copy id" />
        <MiCopyButton value="x" disabled />
      </div>

      <h2>Devices</h2>
      <div class="mi-px-devices">
        <MiDevice v-for="d in devices" :key="d" :device="d" url="https://mica.dev/dashboard" :label="`${d} mockup`">
          <div class="mi-px-screen"><b>Good evening</b><i /><i class="b" /></div>
        </MiDevice>
        <MiDevice device="phone" orientation="landscape"><div class="mi-px-screen"><b>Landscape</b><i /></div></MiDevice>
        <MiDevice device="tablet" orientation="landscape" tone="light"><div class="mi-px-screen"><b>Tablet, light bezel</b><i /></div></MiDevice>
      </div>

      <h2>Confetti</h2>
      <div class="mi-px-row">
        <MiButton @click="fire({ origin: { x: 0.5, y: 0.6 }, count: 140 })">Fire from center</MiButton>
        <MiButton variant="tinted" @click="(e: MouseEvent) => fire({ origin: e.currentTarget as HTMLElement, spread: 360, count: 90, speed: 520 })">Fire from here</MiButton>
      </div>

      <h2>Editor</h2>
      <div class="mi-px-pair">
        <MiEditor v-model="html" label="Notes" />
        <MiEditor v-model="empty" label="Empty" placeholder="Write something..." :min-height="120" />
        <MiEditor :model-value="html" label="Read only" readonly :toolbar="false" />
        <MiEditor :model-value="html" label="Disabled" disabled />
        <MiEditor v-model="empty" label="Invalid" invalid placeholder="Required" :min-height="100" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.mi-px { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); font-family: var(--mi-font); }
.mi-px-theme { background: var(--mi-page); color: var(--mi-label); padding: 40px 28px; display: flex; flex-direction: column; gap: 22px; min-width: 0; }
@media (max-width: 1100px) { .mi-px { grid-template-columns: minmax(0, 1fr); } .mi-px-theme { padding: 28px 16px; } }
.mi-px-eyebrow { margin: 0 0 8px; font-size: 15px; font-weight: 600; color: var(--mi-p-text); }
h1 { margin: 0 0 12px; font-size: 36px; line-height: 1.08; letter-spacing: -.03em; }
h2 { margin: 12px 0 0; font-size: 20px; letter-spacing: -.02em; }
.mi-px-pill { display: inline-flex; align-items: center; height: 30px; padding: 0 14px; border-radius: 999px; background: var(--mi-fill3); font-size: 13px; font-weight: 600; }
.mi-px-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 18px; align-items: start; }
.mi-px-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.mi-px-devices { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 28px 20px; align-items: center; }
.mi-px-screen { height: 100%; display: grid; align-content: center; gap: 8px; padding: 10%; box-sizing: border-box; background: linear-gradient(160deg, var(--mi-p-tint), var(--mi-card)); font-size: 14px; }
.mi-px-screen i { height: 10px; border-radius: 5px; background: var(--mi-p); opacity: .8; }
.mi-px-screen i.b { width: 60%; background: var(--mi-s); }
</style>
