<script setup lang="ts">
import { ref } from 'vue'
import MiButton from '../../app/components/Buttons/MiButton.vue'
import MiIconButton from '../../app/components/Buttons/MiIconButton.vue'
import MiButtonGroup from '../../app/components/Buttons/MiButtonGroup.vue'
import MiMenu from '../../app/components/Buttons/MiMenu.vue'
import MiTextLink from '../../app/components/Buttons/MiTextLink.vue'
import type { MiMenuItem } from '../../app/utils/miMenu'
import type { MiSegmentOption } from '../../app/utils/miButtons'

const { isDark, setMode } = useMiTheme()

const styles = [
  { variant: 'filled', title: 'Filled', note: 'Primary action', text: 'Continue', icon: 'plus', iconText: 'New project' },
  { variant: 'filled', brand: 'secondary', title: 'Filled secondary', note: 'Promotional action', text: 'Upgrade', icon: 'star', iconText: 'Go Pro' },
  { variant: 'tinted', title: 'Tinted', note: 'Secondary action', text: 'Add to list', icon: 'share', iconText: 'Share' },
  { variant: 'gray', title: 'Gray', note: 'Neutral action', text: 'Cancel', icon: 'filters', iconText: 'Filters' },
  { variant: 'bordered', title: 'Bordered', note: 'Toolbar, dense UI', text: 'Export', icon: 'calendar', iconText: 'Schedule' },
  { variant: 'plain', title: 'Plain', note: 'Inline, low emphasis', text: 'Edit', icon: 'chevron', iconText: 'Learn more' },
  { variant: 'destructive', title: 'Destructive', note: 'Irreversible action', text: 'Delete', icon: 'trash', iconText: 'Move to Trash', softIcon: true }
] as const

const sizes = [
  { size: 'mini', label: 'Mini · 24', text: 'Get' },
  { size: 'small', label: 'Small · 30', text: 'Download' },
  { size: 'regular', label: 'Regular · 36', text: 'Download' },
  { size: 'large', label: 'Large · 44', text: 'Download' },
  { size: 'capsule', label: 'Capsule · 48', text: 'Get started' }
] as const

const align = ref<string | number | undefined>('left')
const alignOptions: MiSegmentOption[] = [
  { value: 'left', ariaLabel: 'Align left' },
  { value: 'center', ariaLabel: 'Align center' },
  { value: 'right', ariaLabel: 'Align right' }
]
const alignPaths: Record<string, string> = { left: 'M4 6h16M4 12h10M4 18h13', center: 'M4 6h16M7 12h10M5.5 18h13', right: 'M4 6h16M10 12h10M7 18h13' }

const range = ref<string | number | undefined>('30')
const rangeItems: MiMenuItem[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { separator: true },
  { value: 'all', label: 'All time' }
]
const sortItems: MiMenuItem[] = [
  { heading: 'Sort by' },
  { value: 'name', label: 'Name', shortcut: '⌘1' },
  { value: 'date', label: 'Date modified', shortcut: '⌘2' },
  { value: 'size', label: 'Size', shortcut: '⌘3' },
  { separator: true },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete', destructive: true }
]
const publishItems: MiMenuItem[] = [
  { value: 'schedule', label: 'Schedule…' },
  { value: 'draft', label: 'Save as draft' },
  { value: 'preview', label: 'Preview' }
]
const last = ref('none')
const bold = ref(true)
const saving = ref(false)
function save() {
  saving.value = true
  setTimeout(() => { saving.value = false }, 1600)
}
</script>

<template>
  <div class="mi page">
    <header class="head">
      <div>
        <p class="eyebrow">Mica UI Kit · 02</p>
        <h1>Buttons</h1>
        <p class="lede">One prominent action per view. Everything else steps down to tinted, gray or plain.</p>
      </div>
      <MiButton variant="gray" size="small" @click="setMode(isDark ? 'light' : 'dark')">{{ isDark ? 'Light' : 'Dark' }} appearance</MiButton>
    </header>

    <section class="block">
      <div class="sec"><h2>Styles</h2><p>Ordered from most to least prominent.</p></div>
      <div class="card table">
        <div class="row head-row"><span>Style</span><span>Default</span><span>With icon</span><span>Disabled</span></div>
        <div v-for="s in styles" :key="s.title" class="row">
          <span class="name"><b>{{ s.title }}</b><small>{{ s.note }}</small></span>
          <span><MiButton :variant="s.variant" :brand="'brand' in s ? s.brand : 'primary'">{{ s.text }}</MiButton></span>
          <span>
            <MiButton :variant="s.variant" :brand="'brand' in s ? s.brand : 'primary'" :soft="'softIcon' in s">
              <template v-if="s.icon !== 'chevron'" #leading>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-if="s.icon === 'plus'" d="M12 5v14M5 12h14" />
                  <path v-else-if="s.icon === 'star'" d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />
                  <template v-else-if="s.icon === 'share'"><path d="M12 3v12M8 7l4-4 4 4" /><path d="M6 11v8a1 1 0 001 1h10a1 1 0 001-1v-8" /></template>
                  <template v-else-if="s.icon === 'filters'"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></template>
                  <template v-else-if="s.icon === 'calendar'"><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></template>
                  <path v-else-if="s.icon === 'trash'" d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
                </svg>
              </template>
              <template v-else #trailing>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </template>
              {{ s.iconText }}
            </MiButton>
          </span>
          <span><MiButton :variant="s.variant" disabled>{{ s.text }}</MiButton></span>
        </div>
      </div>
    </section>

    <div class="two">
      <section class="card pad">
        <div class="sec"><h3>Sizes</h3><p>Large and capsule meet the 44 px touch target.</p></div>
        <div class="stack">
          <div v-for="s in sizes" :key="s.size" class="line"><span class="tag">{{ s.label }}</span><MiButton :size="s.size">{{ s.text }}</MiButton></div>
          <div class="line"><span class="tag">Block</span><MiButton size="xlarge" block>Continue</MiButton></div>
        </div>
      </section>

      <section class="card pad">
        <div class="sec"><h3>Icon buttons</h3><p>Circular for floating actions, square for toolbars. Always labelled.</p></div>
        <div class="icons">
          <span class="tag">Filled</span>
          <span><MiIconButton label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></MiIconButton></span>
          <span><MiIconButton label="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4" /><path d="M6 11v8a1 1 0 001 1h10a1 1 0 001-1v-8" /></svg></MiIconButton></span>
          <span><MiIconButton label="Favorite" brand="secondary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg></MiIconButton></span>
          <span><MiIconButton label="Close" variant="gray" size="small"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></MiIconButton></span>
          <span class="tag">Tinted</span>
          <span><MiIconButton label="Add" variant="tinted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></MiIconButton></span>
          <span><MiIconButton label="Notifications" variant="tinted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 004 0" /></svg></MiIconButton></span>
          <span><MiIconButton label="Favorite" variant="tinted" brand="secondary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg></MiIconButton></span>
          <span><MiIconButton label="More" variant="gray"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="18" cy="12" r="1.7" /></svg></MiIconButton></span>
          <span class="tag">Toolbar</span>
          <span><MiIconButton label="Toggle sidebar" variant="plain" size="toolbar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M9.5 5v14" /></svg></MiIconButton></span>
          <span><MiIconButton label="Search" variant="plain" size="toolbar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg></MiIconButton></span>
          <span><MiIconButton label="Bold" variant="plain" size="toolbar" :pressed="bold" @click="bold = !bold">B</MiIconButton></span>
          <span><MiIconButton label="Delete" variant="plain" size="toolbar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /></svg></MiIconButton></span>
        </div>
      </section>
    </div>

    <div class="two">
      <section class="card pad">
        <div class="sec"><h3>Menus &amp; groups</h3><p>Pop-up, pull-down, split and grouped buttons.</p></div>
        <div class="wrap">
          <MiMenu v-model="range" :items="rangeItems" variant="popup" label="Range" aria-label="Date range" />
          <MiMenu :items="sortItems" label="Sort by" aria-label="Sort by" @select="(i) => (last = String(i.value))" />
          <MiButtonGroup variant="split" label="Publish">
            <MiButton>Publish</MiButton>
            <MiMenu :items="publishItems" placement="bottom-end" @select="(i) => (last = String(i.value))">
              <template #trigger="{ props }">
                <MiButton v-bind="props" aria-label="More publish options">
                  <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></template>
                </MiButton>
              </template>
            </MiMenu>
          </MiButtonGroup>
        </div>
        <div class="wrap">
          <MiButtonGroup variant="attached" label="History">
            <MiIconButton label="Back" variant="plain" size="toolbar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></MiIconButton>
            <MiIconButton label="Forward" variant="plain" size="toolbar" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></MiIconButton>
          </MiButtonGroup>
          <MiButtonGroup v-model="align" variant="segmented" label="Text alignment" :options="alignOptions">
            <template #option="{ option }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path :d="alignPaths[String(option.value)]" /></svg>
            </template>
          </MiButtonGroup>
          <MiTextLink href="#">Text link</MiTextLink>
        </div>
        <p class="note">Range: {{ range }} · Last action: {{ last }} · Alignment: {{ align }}</p>
      </section>

      <section class="card pad">
        <div class="sec"><h3>States</h3><p>Hover darkens 5 %, press scales to 97 %, focus shows a 3 px ring.</p></div>
        <div class="states">
          <div><MiButton>Save</MiButton><small>Rest</small></div>
          <div><MiButton state="hover">Save</MiButton><small>Hover</small></div>
          <div><MiButton state="focus">Save</MiButton><small>Focus</small></div>
          <div><MiButton :loading="true">Saving</MiButton><small>Loading</small></div>
        </div>
        <div class="foot">
          <span class="tag">Dialog footer</span>
          <div class="actions">
            <MiButton variant="gray">Cancel</MiButton>
            <MiButton :loading="saving" @click="save">{{ saving ? 'Saving' : 'Save changes' }}</MiButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding: 48px 32px 80px; background: var(--mi-page); color: var(--mi-label); font-family: var(--mi-font); display: flex; flex-direction: column; gap: 48px; letter-spacing: -0.01em; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.eyebrow { margin: 0 0 12px; font-size: 15px; font-weight: 600; color: var(--mi-p-text); }
h1 { margin: 0 0 12px; font-size: clamp(40px, 6vw, 56px); line-height: 1.07; font-weight: 700; letter-spacing: -0.035em; }
.lede { margin: 0; max-width: 640px; font-size: 19px; line-height: 28px; color: var(--mi-label2); }
.block { display: flex; flex-direction: column; gap: 20px; }
.sec { display: flex; flex-direction: column; gap: 4px; }
h2 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; }
h3 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.015em; }
.sec p { margin: 0; font-size: 13px; color: var(--mi-label2); }
h2 + p { font-size: 15px; }
.card { background: var(--mi-card); border-radius: 20px; box-shadow: var(--mi-sh1); }
.pad { padding: 24px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.table { padding: 4px 24px; overflow-x: auto; }
.row { display: grid; grid-template-columns: 170px repeat(3, minmax(150px, 1fr)); gap: 16px; align-items: center; padding: 14px 0; border-top: 0.5px solid var(--mi-sep); }
.head-row { border-top: 0; padding: 14px 0 10px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.name { display: flex; flex-direction: column; }
.name b { font-size: 15px; font-weight: 600; }
.name small, .states small { font-size: 12px; color: var(--mi-label2); }
.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 20px; }
.stack { display: flex; flex-direction: column; gap: 14px; }
.line { display: flex; align-items: center; gap: 16px; }
.line > :last-child[class*='is-block'] { flex: 1; }
.tag { width: 76px; flex: none; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.icons { display: grid; grid-template-columns: 76px repeat(4, minmax(0, 1fr)); gap: 12px; align-items: center; }
.wrap { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.note { margin: 0; font-size: 12px; color: var(--mi-label2); }
.states { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 16px; align-items: end; }
.states > div { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.foot { display: flex; flex-direction: column; gap: 10px; padding-top: 12px; border-top: 0.5px solid var(--mi-sep); }
.actions { display: flex; justify-content: flex-end; gap: 10px; }
@media (max-width: 640px) {
  .page { padding: 32px 16px 64px; }
  .table { padding: 4px 16px; }
  .row { grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 12px 16px; }
  .row > :first-child { grid-column: 1 / -1; }
  .head-row { display: none; }
  .icons { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .icons > .tag { grid-column: 1 / -1; }
}
</style>
