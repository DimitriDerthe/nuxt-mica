<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="icm-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="icm-title" variant="title3" as="h2" weight="semibold">Map columns</MiText>
        <MiText variant="footnote" tone="label2">customers_q3.csv · {{ TOTAL.toLocaleString('en-US') }} rows · {{ columns.length }} columns</MiText>
      </div>
      <MiBadge :tone="done ? 'success' : 'warning'" :label="done ? 'Ready to import' : 'Needs attention'" dot />
    </header>

    <div class="mi:grid mi:gap-3.5 mi:@[900px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[900px]:items-start">
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-card mi:shadow-1 mi:overflow-hidden">
        <li v-for="c in columns" :key="c.id" class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2 mi:py-3.5 mi:px-4 mi:not-first:border-t mi:not-first:border-t-sep mi:@[560px]:grid-cols-[minmax(0,_1fr)_auto_minmax(0,_200px)] mi:@[560px]:items-center mi:@[560px]:gap-3.5" :class="dupes.has(c.target) ? 'mi:[background:color-mix(in_srgb,_var(--mi-red)_6%,_transparent)]' : ''">
          <div class="mi:grid mi:gap-0.5 mi:min-w-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" :class="c.target === 'skip' ? 'mi:opacity-55' : ''">
            <code class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[13px] mi:font-semibold">{{ c.header }}</code>
            <MiText variant="caption" tone="label2" :lines="1">{{ c.samples.join(' · ') }}</MiText>
          </div>
          <MiIcon name="arrow-right" :size="14" class="mi:hidden! mi:@[560px]:block! mi:text-label3" />
          <div class="mi:grid mi:gap-1">
            <MiNativeSelect v-model="c.target" size="sm" :aria-label="'Field for ' + c.header" :options="FIELD_OPTIONS" />
            <MiText v-if="dupes.has(c.target)" variant="caption" tone="red" weight="medium">Mapped twice</MiText>
            <MiText v-else-if="failing(c)" variant="caption" tone="orange" weight="medium">{{ failing(c) }} rows won't parse</MiText>
            <MiText v-else-if="c.target !== 'skip'" variant="caption" tone="green" weight="medium">All rows valid</MiText>
            <MiText v-else variant="caption" tone="label3">Not imported</MiText>
          </div>
        </li>
      </ul>

      <!-- Summary: what the import will do, recomputed from the mapping. -->
      <aside class="mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-lg mi:bg-card mi:shadow-1" aria-labelledby="icm-sum-title">
        <MiText id="icm-sum-title" variant="headline" as="h3">Import summary</MiText>
        <div class="mi:flex mi:items-baseline mi:gap-2">
          <span class="mi:text-[34px] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ ready.toLocaleString('en-US') }}</span>
          <MiText variant="footnote" tone="label2">rows ready of {{ TOTAL.toLocaleString('en-US') }}</MiText>
        </div>
        <div class="mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" aria-label="Rows ready" :aria-valuenow="ready" aria-valuemin="0" :aria-valuemax="TOTAL">
          <span class="mi:block mi:h-full mi:bg-p mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${ready / TOTAL})` }" />
        </div>
        <ul class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px]" aria-label="Required fields">
          <li class="mi:flex mi:items-center mi:gap-2" v-for="f in REQUIRED" :key="f" :class="mapped.has(f) ? 'mi:text-green-t' : 'mi:text-orange-t'">
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
