<script lang="ts">
export const playground = {
  props: { shortcuts: 'letters' },
  controls: ['shortcuts'],
  layout: 'start',
  height: 360
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const answers = ref<Record<string, string | string[]>>({})
const done = ref(false)
</script>

<template>
  <div class="ex">
    <MiQuestionnaire v-model="answers" v-bind="p" @submit="done = true">
      <MiQuestionnaireProgress />
      <MiQuestionnaireItem name="goal" required>
        <MiQuestionnaireTitle>What are you building?</MiQuestionnaireTitle>
        <MiQuestionnaireDescription>This helps us tailor the starter template.</MiQuestionnaireDescription>
        <MiQuestionnaireChoices>
          <MiQuestionnaireChoice value="web">Web app</MiQuestionnaireChoice>
          <MiQuestionnaireChoice value="api">API service</MiQuestionnaireChoice>
          <MiQuestionnaireChoice value="mobile">Mobile app</MiQuestionnaireChoice>
        </MiQuestionnaireChoices>
        <MiQuestionnaireError />
      </MiQuestionnaireItem>
      <MiQuestionnaireItem name="features" multiple>
        <MiQuestionnaireTitle>Which features do you need?</MiQuestionnaireTitle>
        <MiQuestionnaireChoices>
          <MiQuestionnaireChoice value="auth">Authentication</MiQuestionnaireChoice>
          <MiQuestionnaireChoice value="billing">Billing</MiQuestionnaireChoice>
          <MiQuestionnaireChoice value="i18n">Localization</MiQuestionnaireChoice>
          <MiQuestionnaireInput aria-label="Something else" placeholder="Something else" />
        </MiQuestionnaireChoices>
        <MiQuestionnaireError />
      </MiQuestionnaireItem>
      <MiQuestionnaireItem name="notes">
        <MiQuestionnaireTitle>Anything we should know?</MiQuestionnaireTitle>
        <MiQuestionnaireChoices>
          <MiQuestionnaireInput aria-label="Notes" placeholder="Deadlines, constraints, links" />
        </MiQuestionnaireChoices>
        <MiQuestionnaireError />
      </MiQuestionnaireItem>
      <MiQuestionnaireActions>
        <MiQuestionnairePrevious>Back</MiQuestionnairePrevious>
        <MiQuestionnaireSkip>Skip</MiQuestionnaireSkip>
        <MiQuestionnaireNext>Next</MiQuestionnaireNext>
        <MiQuestionnaireSubmit>Finish</MiQuestionnaireSubmit>
      </MiQuestionnaireActions>
    </MiQuestionnaire>
    <p v-if="done" class="ok">Thanks, answers sent: {{ Object.keys(answers).join(', ') }}</p>
  </div>
</template>

<style scoped>
.ex { width: min(100%, 420px); display: grid; gap: 12px; }
.ok { margin: 0; font-size: 14px; color: var(--mi-label2); }
</style>
