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
  <form class="mi-form" novalidate @submit.prevent="emit('submit', $event)">
    <header v-if="title || $slots.header || $slots['header-end']" class="mi-form__head">
      <div class="mi-form__titles">
        <slot name="header">
          <h3 v-if="title" class="mi-form__title">{{ title }}</h3>
          <p v-if="description" class="mi-form__desc">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots['header-end']" class="mi-form__badge"><slot name="header-end" /></div>
    </header>
    <div class="mi-form__body" :style="{ maxWidth }"><slot /></div>
    <footer v-if="$slots.actions" class="mi-form__foot"><slot name="actions" /></footer>
  </form>
</template>

<style scoped>
.mi-form { container-type: inline-size; overflow: hidden; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); letter-spacing: -.01em; }
.mi-form__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 24px; border-bottom: .5px solid var(--mi-sep); }
.mi-form__titles { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mi-form__title { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.015em; }
.mi-form__desc { margin: 0; font-size: 13px; color: var(--mi-label2); }
.mi-form__badge { flex: none; }
.mi-form__body { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 18px 20px; align-items: center; padding: 26px 24px; }
.mi-form__foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-top: .5px solid var(--mi-sep); background: var(--mi-fill4); }
@container (max-width: 640px) {
  .mi-form__body { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .mi-form__head, .mi-form__foot { padding-inline: 16px; }
  .mi-form__body { padding: 20px 16px; }
}
</style>
