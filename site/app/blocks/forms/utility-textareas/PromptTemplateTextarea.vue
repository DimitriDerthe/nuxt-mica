<template>
  <section class="mi:@container/ptt mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ptt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ptt-title" as="h2" variant="title3" weight="semibold">Prompt template</MiText>
        <MiText variant="footnote" tone="label2">Support macro · “Refund follow-up” · variables use <code v-text="syntax" /></MiText>
      </div>
      <MiBadge :tone="issues.length ? 'warning' : 'success'" :label="issues.length ? `${issues.length} to check` : 'Template valid'" dot />
    </header>

    <div class="mi:grid mi:gap-3.5 mi:@[820px]/ptt:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)] mi:@[820px]/ptt:items-start">
      <div class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <MiField label="Template" :hint="`${vars.length} variables detected`">
          <template #default="{ id, describedBy }">
            <MiTextarea :id="id" v-model="template" class="mi:[&_textarea]:font-[ui-monospace,SFMono-Regular,Menlo,monospace]! mi:[&_textarea]:text-[13px]! mi:[&_textarea]:leading-[1.55]!" :rows="7" :max-rows="14" :aria-describedby="describedBy" />
          </template>
        </MiField>
        <ul v-if="issues.length" class="mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-orange-t" aria-label="Template issues">
          <li class="mi:flex mi:[align-items:flex-start] mi:gap-1.5" v-for="i in issues" :key="i"><MiIcon class="mi:mt-0.5" name="warning" :size="14" />{{ i }}</li>
        </ul>

        <!-- One test field per detected variable, created and removed as the template changes. -->
        <fieldset v-if="vars.length" class="mi:[border:0] mi:border-t mi:border-t-sep mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:m-0 mi:pt-3.5 mi:px-0 mi:pb-0 mi:min-w-0 mi:@[480px]/ptt:grid-cols-2">
          <legend class="mi:float-left mi:w-full mi:mb-2.5 mi:p-0 mi:text-[13px] mi:font-semibold mi:text-label2">Test values</legend>
          <MiField v-for="v in vars" :key="v" :label="v">
            <MiInput :model-value="values[v] ?? ''" size="sm" :placeholder="`Value for ${v}`" @update:model-value="values[v] = $event" />
          </MiField>
        </fieldset>
      </div>

      <div class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText as="h3" variant="subheadline" weight="semibold">Preview</MiText>
          <MiCopyButton :value="filled" label="Copy" variant="ghost" />
        </div>
        <p class="mi:m-0 mi:p-3.5 mi:rounded-lg mi:text-[14px] mi:leading-[1.6] mi:whitespace-pre-wrap mi:wrap-anywhere mi:bg-fill4">
          <template v-for="(p, i) in parts" :key="i">
            <mark v-if="p.kind === 'var'" class="mi:py-px mi:px-1 mi:rounded-[4px]" :class="p.filled ? 'mi:text-p-text mi:bg-p-tint' : 'mi:text-orange-t mi:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)] mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[12.5px]'">{{ p.text }}</mark><template v-else>{{ p.text }}</template>
          </template>
        </p>
        <div class="mi:grid mi:gap-1.5">
          <div class="mi:flex mi:justify-between mi:gap-2">
            <MiText variant="caption" tone="label2">≈ {{ tokens }} tokens of {{ limit }}</MiText>
            <MiText variant="caption" :tone="tokens > limit ? 'red' : 'label3'" tabular>{{ Math.round(tokens / limit * 100) }}%</MiText>
          </div>
          <div class="mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" aria-label="Prompt size" :aria-valuenow="tokens" aria-valuemin="0" :aria-valuemax="limit">
            <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :class="tokens > limit ? 'mi:bg-red' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(tokens / limit, 1)})` }" />
          </div>
        </div>
        <MiButton block :disabled="issues.length > 0">Save template</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Part { kind: 'text' | 'var', text: string, filled?: boolean }

const limit = 400
const syntax = '{{name}}'
const template = ref(`You are a support agent for Northbeam Outfitters.
Write a short, warm reply to {{customer_name}} about order {{order_id}}.
Their refund of {{refund_amount}} was approved on {{approved_date}}.
Mention it reaches their card within 5 business days.
Sign off as {{agent name}} and keep it under 90 words.`)
const values = reactive<Record<string, string>>({ customer_name: 'Ines Duarte', order_id: 'NB-40917', refund_amount: '$86.40' })

const varRe = /\{\{\s*([\w.]+)\s*\}\}/g
const vars = computed(() => [...new Set([...template.value.matchAll(varRe)].map(m => m[1] ?? ''))].filter(Boolean))
const issues = computed(() => {
  const out: string[] = []
  const t = template.value
  const opens = (t.match(/\{\{/g) ?? []).length
  const closes = (t.match(/\}\}/g) ?? []).length
  if (opens !== closes) out.push(`Unbalanced braces: ${opens} “{{” for ${closes} “}}”.`)
  for (const m of t.matchAll(/\{\{([^}]*)\}\}/g)) {
    const name = (m[1] ?? '').trim()
    if (!/^[\w.]+$/.test(name)) out.push(`“${name || 'empty'}” is not a valid name; use letters, digits and underscores.`)
  }
  return out
})

// Split the template into text and variable parts so values render highlighted as plain text nodes.
const parts = computed<Part[]>(() => template.value.split(/(\{\{\s*[\w.]+\s*\}\})/g).filter(Boolean).map((chunk) => {
  const name = chunk.match(/^\{\{\s*([\w.]+)\s*\}\}$/)?.[1]
  if (!name) return { kind: 'text', text: chunk }
  const value = values[name]?.trim()
  return { kind: 'var', text: value || name, filled: !!value }
}))
const filled = computed(() => parts.value.map(p => p.text).join(''))
// Rough estimate: about four characters per token for English text.
const tokens = computed(() => Math.ceil(filled.value.length / 4))
</script>
