<template>
  <section class="ptt" aria-labelledby="ptt-title">
    <header class="ptt__head">
      <div>
        <MiText id="ptt-title" as="h2" variant="title3" weight="semibold">Prompt template</MiText>
        <MiText variant="footnote" tone="label2">Support macro · “Refund follow-up” · variables use <code v-text="syntax" /></MiText>
      </div>
      <MiBadge :tone="issues.length ? 'warning' : 'success'" :label="issues.length ? `${issues.length} to check` : 'Template valid'" dot />
    </header>

    <div class="ptt__body">
      <div class="ptt__edit">
        <MiField label="Template" :hint="`${vars.length} variables detected`">
          <template #default="{ id, describedBy }">
            <MiTextarea :id="id" v-model="template" class="ptt__mono" :rows="7" :max-rows="14" :aria-describedby="describedBy" />
          </template>
        </MiField>
        <ul v-if="issues.length" class="ptt__issues" aria-label="Template issues">
          <li v-for="i in issues" :key="i"><MiIcon name="warning" :size="14" />{{ i }}</li>
        </ul>

        <!-- One test field per detected variable, created and removed as the template changes. -->
        <fieldset v-if="vars.length" class="ptt__vars">
          <legend class="ptt__legend">Test values</legend>
          <MiField v-for="v in vars" :key="v" :label="v">
            <MiInput :model-value="values[v] ?? ''" size="sm" :placeholder="`Value for ${v}`" @update:model-value="values[v] = $event" />
          </MiField>
        </fieldset>
      </div>

      <div class="ptt__side">
        <div class="ptt__side-head">
          <MiText as="h3" variant="subheadline" weight="semibold">Preview</MiText>
          <MiCopyButton :value="filled" label="Copy" variant="ghost" />
        </div>
        <p class="ptt__preview">
          <template v-for="(p, i) in parts" :key="i">
            <mark v-if="p.kind === 'var'" class="ptt__var" :class="{ 'is-empty': !p.filled }">{{ p.text }}</mark><template v-else>{{ p.text }}</template>
          </template>
        </p>
        <div class="ptt__budget">
          <div class="ptt__budget-line">
            <MiText variant="caption" tone="label2">≈ {{ tokens }} tokens of {{ limit }}</MiText>
            <MiText variant="caption" :tone="tokens > limit ? 'red' : 'label3'" tabular>{{ Math.round(tokens / limit * 100) }}%</MiText>
          </div>
          <div class="ptt__meter" role="meter" aria-label="Prompt size" :aria-valuenow="tokens" aria-valuemin="0" :aria-valuemax="limit">
            <span :class="{ 'is-over': tokens > limit }" :style="{ transform: `scaleX(${Math.min(tokens / limit, 1)})` }" />
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

<style scoped>
.ptt { container: ptt / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.ptt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.ptt__body { display: grid; gap: 14px; }
@container ptt (min-width: 820px) { .ptt__body { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); align-items: start; } }
.ptt__edit, .ptt__side { display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ptt__mono :deep(textarea) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.55; }

.ptt__issues { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-orange-t); }
.ptt__issues li { display: flex; align-items: flex-start; gap: 6px; }
.ptt__issues :deep(svg) { flex: none; margin-top: 2px; }

.ptt__vars { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 0; padding: 14px 0 0; border: 0; border-top: 1px solid var(--mi-sep); min-width: 0; }
@container ptt (min-width: 480px) { .ptt__vars { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ptt__legend { float: left; width: 100%; margin-bottom: 10px; padding: 0; font-size: 13px; font-weight: 600; color: var(--mi-label2); }

.ptt__side-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ptt__preview { margin: 0; padding: 14px; border-radius: var(--mi-radius-l); font-size: 14px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--mi-fill4); }
.ptt__var { padding: 1px 4px; border-radius: 4px; color: var(--mi-p-text); background: var(--mi-p-tint); }
.ptt__var.is-empty { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }

.ptt__budget { display: grid; gap: 6px; }
.ptt__budget-line { display: flex; justify-content: space-between; gap: 8px; }
.ptt__meter { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.ptt__meter span { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-ease); }
.ptt__meter span.is-over { background: var(--mi-red); }
</style>
