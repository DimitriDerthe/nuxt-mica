<script setup lang="ts">
import { computed, ref } from 'vue'
import MiInput from '../../app/components/Inputs/MiInput.vue'
import MiField from '../../app/components/Inputs/MiField.vue'
import MiSearch from '../../app/components/Inputs/MiSearch.vue'
import MiSelect from '../../app/components/Inputs/MiSelect.vue'
import MiTextarea from '../../app/components/Inputs/MiTextarea.vue'
import MiCalendar from '../../app/components/Inputs/MiCalendar.vue'
import MiDatePicker from '../../app/components/Inputs/MiDatePicker.vue'
import MiTagInput from '../../app/components/Inputs/MiTagInput.vue'
import MiCodeInput from '../../app/components/Inputs/MiCodeInput.vue'
import MiForm from '../../app/components/Inputs/MiForm.vue'
import MiFormRow from '../../app/components/Inputs/MiFormRow.vue'

useHead({ title: 'Inputs' })

const themes = [{ cls: 'mi-light', name: 'Light' }, { cls: 'mi-dark', name: 'Dark' }]

const name = ref('')
const email = ref('alex.martin@example.com')
const url = ref('')
const user = ref('al')
const pass = ref('')
const q = ref('Roadmap')
const today = new Date(2026, 9, 29)
const tz = ref<string | number | null>('paris')
const bio = ref('Product designer focused on calm, legible interfaces.')
const date = ref<Date | null>(new Date(2026, 9, 30))
const dueTime = ref<Date | null>(new Date(2026, 9, 30, 17, 0))
const tags = ref(['Design', 'Q4', 'Launch'])
const code = ref('482')
const codeDone = ref('')
const visibility = ref(1)
const project = ref('')
const description = ref('')
const owner = ref<string | number | null>('alex')

const tzOptions = [
  { value: 'paris', label: 'Central European Time · Paris' },
  { value: 'london', label: 'Greenwich Mean Time · London' },
  { value: 'ny', label: 'Eastern Time · New York' },
  { value: 'sf', label: 'Pacific Time · San Francisco' }
]
const ownerOptions = [
  { value: 'alex', label: 'Alex Martin' },
  { value: 'sam', label: 'Sam Rivera' },
  { value: 'jordan', label: 'Jordan Lee', description: 'On leave until Nov 4', disabled: true }
]
const visOptions = ['Private', 'Team', 'Public']
const visHelp = ['Only you can see this project.', 'Everyone in your team can view and comment.', 'Anyone with the link can view.']
const userBad = computed(() => user.value.length < 3)
</script>

<template>
  <div class="mi pg">
    <div class="pg__cols">
      <section v-for="th in themes" :key="th.cls" :class="th.cls" class="pg__col" :data-theme-col="th.name">
        <header class="pg__head">
          <p class="pg__eyebrow">Mica UI Kit · 04</p>
          <h1>Text inputs</h1>
          <p class="pg__lead">Fields, search, pickers and forms. 17 px text on touch so mobile browsers never zoom in.</p>
          <span class="pg__pill">{{ th.name }} appearance</span>
        </header>

        <div class="pg__card">
          <div><h3>Text field states</h3><p>Label above, help text below. Errors replace the help text and never rely on color alone.</p></div>
          <div class="pg__grid3">
            <MiField label="Full name" hint="Default"><MiInput v-model="name" placeholder="Alex Martin" /></MiField>
            <MiField label="Email" hint="Focused · primary ring"><MiInput v-model="email" type="email" /></MiField>
            <MiField label="Website" hint="Prefix add-on"><MiInput v-model="url" prefix="https://" placeholder="yourstudio.com" /></MiField>
            <MiField label="Username" :error="userBad ? 'Use at least 3 characters' : undefined" :success="userBad ? undefined : 'Available'"><MiInput v-model="user" /></MiField>
            <MiField label="Passphrase" hint="Trailing action · reveal"><MiInput v-model="pass" type="password" autocomplete="off" placeholder="At least 12 characters" /></MiField>
            <MiField label="Organization" hint="Disabled" disabled><MiInput model-value="Northwind Studio" disabled /></MiField>
            <MiField label="Clearable" hint="Clear button once there is text"><MiInput v-model="name" clearable placeholder="Type something" /></MiField>
            <MiField label="Amount" hint="Suffix add-on"><MiInput model-value="120" suffix="EUR" /></MiField>
            <MiField label="Compact" hint="Small size"><MiInput size="sm" model-value="Spring campaign" /></MiField>
          </div>
        </div>

        <div class="pg__grid2">
          <div class="pg__card">
            <div><h3>Search</h3><p>Filled, rounded, with an inline clear button once there is text.</p></div>
            <MiSearch v-model="q" />
            <MiSearch size="compact" shortcut="⌘K" hotkey="k" aria-label="Search in toolbar" />
            <p class="pg__note">Compact toolbar variant with shortcut hint.</p>
          </div>
          <div class="pg__card">
            <div><h3>Pop-up &amp; text area</h3><p>Custom listbox with full keyboard support. Text areas grow and count characters.</p></div>
            <MiField label="Time zone"><MiSelect v-model="tz" :options="tzOptions" /></MiField>
            <MiField label="Bio">
              <template #label-end>{{ bio.length }} / 160</template>
              <MiTextarea v-model="bio" :maxlength="160" placeholder="A sentence or two about you" />
            </MiField>
          </div>
        </div>

        <div class="pg__grid2">
          <div class="pg__card">
            <div class="pg__split">
              <div><h3>Date picker</h3><p>Inline calendar. Today in primary text, selection filled.</p></div>
              <MiDatePicker v-model="date" />
            </div>
            <MiCalendar v-model="date" :today="today" />
          </div>
          <div class="pg__card pg__card--gap">
            <div><h3>Tokens, codes &amp; inline actions</h3><p>Composite fields built from the same field surface.</p></div>
            <MiField label="Tags"><MiTagInput v-model="tags" /></MiField>
            <div class="pg__stack">
              <span class="pg__lbl">Verification code</span>
              <MiCodeInput v-model="code" @complete="codeDone = $event" />
              <span class="pg__note">{{ codeDone ? `Completed: ${codeDone}` : 'Paste or type six digits.' }}</span>
            </div>
            <MiField label="Newsletter">
              <div class="pg__row"><MiInput type="email" placeholder="name@example.com" /><button type="button" class="pg__btn pg__btn--primary pg__btn--lg">Subscribe</button></div>
            </MiField>
          </div>
        </div>

        <MiForm title="New project" description="Form layout · right-aligned labels on desktop, stacked below 640 px">
          <template #header-end><span class="pg__badge">Example</span></template>
          <MiFormRow label="Project name"><MiInput v-model="project" size="sm" placeholder="Spring campaign" /></MiFormRow>
          <MiFormRow label="Description" top><MiTextarea v-model="description" size="sm" :rows="2" placeholder="What is this project about?" /></MiFormRow>
          <MiFormRow label="Owner"><MiSelect v-model="owner" size="sm" :options="ownerOptions" class="pg__max" /></MiFormRow>
          <MiFormRow label="Due date"><MiDatePicker v-model="dueTime" time /></MiFormRow>
          <MiFormRow label="Visibility" :hint="visHelp[visibility]">
            <span role="radiogroup" aria-label="Visibility" class="pg__seg">
              <button v-for="(l, i) in visOptions" :key="l" type="button" role="radio" :aria-checked="visibility === i" :class="{ on: visibility === i }" @click="visibility = i">{{ l }}</button>
            </span>
          </MiFormRow>
          <template #actions>
            <button type="button" class="pg__btn">Cancel</button>
            <button type="submit" class="pg__btn pg__btn--primary">Create project</button>
          </template>
        </MiForm>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pg { min-height: 100vh; }
.pg__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 760px), 1fr)); }
.pg__col { display: flex; flex-direction: column; gap: 32px; min-width: 0; padding: clamp(20px, 4vw, 64px); background: var(--mi-page); color: var(--mi-label); font-family: var(--mi-font); letter-spacing: -.01em; }
.pg__head { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.pg__head h1 { margin: 0; font-size: clamp(36px, 5vw, 56px); line-height: 1.05; font-weight: 700; letter-spacing: -.035em; }
.pg__eyebrow { margin: 0; font-size: 15px; font-weight: 600; color: var(--mi-p-text); }
.pg__lead { margin: 0; max-width: 560px; font-size: 19px; line-height: 28px; color: var(--mi-label2); }
.pg__pill { display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border-radius: 999px; background: var(--mi-fill3); font-size: 13px; font-weight: 600; }
.pg__card { display: flex; flex-direction: column; gap: 20px; min-width: 0; padding: 24px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.pg__card h3 { margin: 0 0 4px; font-size: 20px; font-weight: 600; letter-spacing: -.015em; }
.pg__card p { margin: 0; font-size: 13px; color: var(--mi-label2); }
.pg__grid3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px 20px; }
.pg__grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 20px; }
.pg__split { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.pg__stack { display: flex; flex-direction: column; gap: 8px; }
.pg__lbl { font-size: 13px; font-weight: 600; color: var(--mi-label2); }
.pg__note { font-size: 13px; color: var(--mi-label2); }
.pg__row { display: flex; gap: 8px; }
.pg__max { max-width: 320px; }
.pg__badge { padding: 4px 10px; border-radius: 999px; background: var(--mi-s-tint); color: var(--mi-s-text); font-size: 12px; font-weight: 600; }
.pg__btn { height: 32px; padding: 0 16px; border: 0; border-radius: 8px; background: var(--mi-fill3); color: var(--mi-label); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease); }
.pg__btn:active { transform: scale(.97); }
.pg__btn--primary { background: var(--mi-p); color: var(--mi-p-on); }
.pg__btn--lg { height: 44px; padding: 0 20px; border-radius: 10px; font-size: 17px; }
.pg__seg { display: inline-grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; width: 100%; max-width: 320px; padding: 2px; border-radius: 9px; background: var(--mi-fill3); }
.pg__seg button { height: 28px; border: 0; border-radius: 7px; background: transparent; color: var(--mi-label); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
.pg__seg button.on { background: var(--mi-seg); box-shadow: 0 3px 8px rgba(0, 0, 0, .12), 0 3px 1px rgba(0, 0, 0, .04); font-weight: 600; }
</style>
