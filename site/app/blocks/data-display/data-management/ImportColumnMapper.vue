<template>
  <section class="icm" aria-labelledby="icm-title">
    <header class="icm__head">
      <div>
        <MiText id="icm-title" variant="title3" as="h2" weight="semibold">Map columns</MiText>
        <MiText variant="footnote" tone="label2">customers_q3.csv · {{ TOTAL.toLocaleString('en-US') }} rows · {{ columns.length }} columns</MiText>
      </div>
      <MiBadge :tone="done ? 'success' : 'warning'" :label="done ? 'Ready to import' : 'Needs attention'" dot />
    </header>

    <div class="icm__layout">
      <ul class="icm__cols">
        <li v-for="c in columns" :key="c.id" class="icm__col" :class="{ 'is-skip': c.target === 'skip', 'is-dupe': dupes.has(c.target) }">
          <div class="icm__src">
            <code>{{ c.header }}</code>
            <MiText variant="caption" tone="label2" :lines="1">{{ c.samples.join(' · ') }}</MiText>
          </div>
          <MiIcon name="arrow-right" :size="14" class="icm__arrow" />
          <div class="icm__dst">
            <MiNativeSelect v-model="c.target" size="sm" :aria-label="'Field for ' + c.header" :options="FIELD_OPTIONS" />
            <MiText v-if="dupes.has(c.target)" variant="caption" tone="red" weight="medium">Mapped twice</MiText>
            <MiText v-else-if="failing(c)" variant="caption" tone="orange" weight="medium">{{ failing(c) }} rows won't parse</MiText>
            <MiText v-else-if="c.target !== 'skip'" variant="caption" tone="green" weight="medium">All rows valid</MiText>
            <MiText v-else variant="caption" tone="label3">Not imported</MiText>
          </div>
        </li>
      </ul>

      <!-- Summary: what the import will do, recomputed from the mapping. -->
      <aside class="icm__sum" aria-labelledby="icm-sum-title">
        <MiText id="icm-sum-title" variant="headline" as="h3">Import summary</MiText>
        <div class="icm__ready">
          <span class="icm__big">{{ ready.toLocaleString('en-US') }}</span>
          <MiText variant="footnote" tone="label2">rows ready of {{ TOTAL.toLocaleString('en-US') }}</MiText>
        </div>
        <div class="icm__bar" role="meter" aria-label="Rows ready" :aria-valuenow="ready" aria-valuemin="0" :aria-valuemax="TOTAL">
          <span :style="{ transform: `scaleX(${ready / TOTAL})` }" />
        </div>
        <ul class="icm__req" aria-label="Required fields">
          <li v-for="f in REQUIRED" :key="f" :class="{ 'is-ok': mapped.has(f) }">
            <MiIcon :name="mapped.has(f) ? 'check-circle-fill' : 'exclamation-circle'" :size="16" />
            {{ FIELDS[f] }} {{ mapped.has(f) ? 'mapped' : 'required' }}
          </li>
        </ul>
        <MiText variant="caption" tone="label2">Rows that fail to parse are skipped and listed in a report after the import.</MiText>
        <MiButton block :disabled="!done" @click="imported = true">{{ imported ? 'Import queued' : 'Import ' + ready.toLocaleString('en-US') + ' rows' }}</MiButton>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Field = 'email' | 'name' | 'company' | 'phone' | 'plan' | 'created' | 'skip'
interface Column { id: string, header: string, samples: string[], target: string | number | null, fails: Record<string, number> }

const TOTAL = 1284
const FIELDS: Record<Field, string> = { email: 'Email', name: 'Full name', company: 'Company', phone: 'Phone', plan: 'Plan', created: 'Signed up', skip: 'Skip column' }
const REQUIRED: Field[] = ['email', 'name']
const FIELD_OPTIONS = Object.entries(FIELDS).map(([value, label]) => ({ value, label }))

// `fails`: rows that would not parse if the column were mapped to that field.
const columns = ref<Column[]>([
  { id: 'c1', header: 'E-mail address', samples: ['mara@tidewell.co', 'j.osei@brightloom.com', 'noor@kestrel.dev'], target: 'email', fails: { email: 3 } },
  { id: 'c2', header: 'contact', samples: ['Mara Lindgren', 'Joseph Osei', 'Noor Haddad'], target: 'skip', fails: {} },
  { id: 'c3', header: 'org', samples: ['Tidewell', 'Brightloom', 'Kestrel Labs'], target: 'company', fails: {} },
  { id: 'c4', header: 'tel', samples: ['+44 20 7946 0958', '020 7946 0321', 'n/a'], target: 'phone', fails: { phone: 41 } },
  { id: 'c5', header: 'tier', samples: ['Pro', 'Team', 'pro '], target: 'plan', fails: { plan: 2 } },
  { id: 'c6', header: 'signup_date', samples: ['2024-03-02', '03/14/2024', 'last week'], target: 'created', fails: { created: 12 } }
])
const imported = ref(false)

const failing = (c: Column) => (c.target === null || c.target === 'skip' ? 0 : c.fails[c.target] ?? 0)
const mapped = computed(() => new Set(columns.value.map(c => c.target).filter(t => t !== 'skip')))
const dupes = computed(() => {
  const seen = new Set<string | number | null>()
  const twice = new Set<string | number | null>()
  for (const c of columns.value) if (c.target !== 'skip') (seen.has(c.target) ? twice : seen).add(c.target)
  return twice
})
// Failures can overlap; summing gives the cautious (lowest) estimate.
const ready = computed(() => Math.max(0, TOTAL - columns.value.reduce((n, c) => n + failing(c), 0)))
const done = computed(() => REQUIRED.every(f => mapped.value.has(f)) && dupes.value.size === 0)
</script>

<style scoped>
.icm { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.icm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.icm__layout { display: grid; gap: 14px; }
.icm__cols { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.icm__col { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 14px 16px; }
.icm__col + .icm__col { border-top: 1px solid var(--mi-sep); }
.icm__col.is-skip .icm__src { opacity: .55; }
.icm__col.is-dupe { background: color-mix(in srgb, var(--mi-red) 6%, transparent); }
.icm__src { display: grid; gap: 2px; min-width: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.icm__src code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 600; }
.icm__arrow { display: none; color: var(--mi-label3); }
.icm__dst { display: grid; gap: 4px; }

.icm__sum { display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.icm__ready { display: flex; align-items: baseline; gap: 8px; }
.icm__big { font-size: 34px; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.icm__bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.icm__bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.icm__req { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 13px; }
.icm__req li { display: flex; align-items: center; gap: 8px; color: var(--mi-orange-t); }
.icm__req li.is-ok { color: var(--mi-green-t); }

@container (min-width: 560px) {
  .icm__col { grid-template-columns: minmax(0, 1fr) auto minmax(0, 200px); align-items: center; gap: 14px; }
  .icm__arrow { display: block; }
}
@container (min-width: 900px) {
  .icm__layout { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; }
}
</style>
