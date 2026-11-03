<script setup lang="ts">
/** Form container with optional title and description; emits the native submit event. Its body is a label/control grid for MiFormRow rows; wrap MiField children in one element so they span both columns. */
withDefaults(defineProps<{
  /** Heading shown in the form header. Replaced by the `header` slot when given. */
  title?: string
  /** Supporting text under the title. Replaced by the `header` slot when given. */
  description?: string
  /** Max width of the field grid. */
  maxWidth?: string
}>(), { maxWidth: '760px' })

const emit = defineEmits<{ submit: [event: SubmitEvent] }>()
defineSlots<{
  /** Form fields, typically MiFormRow rows. */
  default?(): unknown
  /** Replaces the title and description. */
  header?(): unknown
  /** Content aligned to the end of the header, such as a status badge. */
  'header-end'?(): unknown
  /** Footer buttons such as Save and Cancel. */
  actions?(): unknown
}>()
</script>

<template>
  <form class="mi-form mi:@container mi:overflow-hidden mi:rounded-[20px] mi:bg-card mi:shadow-1 mi:font-mi mi:text-label mi:tracking-[-.01em]" novalidate @submit.prevent="emit('submit', $event)">
    <header v-if="title || $slots.header || $slots['header-end']" class="mi-form__head mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-4.5 mi:px-6 mi:[border-bottom:.5px_solid_var(--mi-sep)] mi:@max-[640px]:px-4">
      <div class="mi-form__titles mi:flex mi:flex-col mi:gap-0.5 mi:min-w-0">
        <slot name="header">
          <h3 v-if="title" class="mi-form__title mi:m-0 mi:text-[20px] mi:font-semibold mi:tracking-[-.015em]">{{ title }}</h3>
          <p v-if="description" class="mi-form__desc mi:m-0 mi:text-[13px] mi:text-label2">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots['header-end']" class="mi-form__badge mi:flex-[none]"><slot name="header-end" /></div>
    </header>
    <div class="mi-form__body mi:grid mi:grid-cols-[180px_minmax(0,_1fr)] mi:gap-y-4.5 mi:gap-x-5 mi:items-center mi:py-6.5 mi:px-6 mi:@max-[640px]:grid-cols-[minmax(0,_1fr)] mi:@max-[640px]:gap-1.5 mi:@max-[640px]:py-5 mi:@max-[640px]:px-4" :style="{ maxWidth }"><slot /></div>
    <footer v-if="$slots.actions" class="mi-form__foot mi:flex mi:[justify-content:flex-end] mi:gap-2.5 mi:py-3.5 mi:px-6 mi:[border-top:.5px_solid_var(--mi-sep)] mi:bg-fill4 mi:@max-[640px]:px-4"><slot name="actions" /></footer>
  </form>
</template>
