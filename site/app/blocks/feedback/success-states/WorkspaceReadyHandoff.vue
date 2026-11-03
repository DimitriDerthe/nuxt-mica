<template>
  <section class="wrh" aria-labelledby="wrh-title">
    <div class="wrh__card">
      <header class="wrh__head">
        <!-- Four tiles settle into a grid once: transform and opacity keyframes only. -->
        <div class="wrh__mark" aria-hidden="true">
          <span v-for="n in 4" :key="n" :style="{ '--wrh-i': n }" />
        </div>
        <MiText id="wrh-title" variant="title2" as="h2" weight="bold" balance>Fjord Robotics is ready</MiText>
        <MiText variant="footnote" tone="label2">fjord-robotics.tideboard.app · created just now</MiText>
      </header>

      <div class="wrh__grid">
        <div class="wrh__col">
          <MiText variant="subheadline" as="h3" weight="semibold">What we set up</MiText>
          <ul class="wrh__setup">
            <li v-for="(s, i) in SETUP" :key="s.label" :style="{ '--wrh-d': i * 140 + 'ms' }">
              <span class="wrh__tick"><MiIcon name="check" :size="13" :weight="2.8" /></span>
              <div>
                <MiText variant="footnote" weight="medium">{{ s.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ s.detail }}</MiText>
              </div>
            </li>
          </ul>
        </div>

        <form class="wrh__invite" novalidate @submit.prevent="send">
          <MiText id="wrh-invite" variant="subheadline" as="h3" weight="semibold">Bring your team in</MiText>
          <template v-if="!sent.length">
            <MiField label="Work emails" :hint="`Press Return after each one · ${emails.length} of 8`" :error="error">
              <MiTagInput v-model="emails" :max="8" :validate="isEmail" placeholder="name@fjord.io" @reject="rejected" />
            </MiField>
            <div class="wrh__role">
              <MiText variant="footnote" tone="label2">Join as</MiText>
              <MiSegmented v-model="role" label="Role for invited people" :options="ROLES" />
            </div>
            <MiButton type="submit" :disabled="!emails.length">{{ emails.length ? `Send ${emails.length} invite${emails.length > 1 ? 's' : ''}` : 'Add an email first' }}</MiButton>
          </template>
          <MiAlert v-else tone="success" title="Invites on their way" :message="`${sent.length} ${role === 'admin' ? 'admins' : 'members'} will get a link valid for 7 days.`" action-label="Invite more" @action="sent = []" />
        </form>
      </div>

      <nav class="wrh__next" aria-label="Next steps">
        <a v-for="n in NEXT" :key="n.title" href="#" class="wrh__link" @click.prevent>
          <MiIcon :name="n.icon" :size="18" />
          <span><b>{{ n.title }}</b><small>{{ n.detail }}</small></span>
          <MiIcon name="chevron-right" :size="14" />
        </a>
      </nav>

      <footer class="wrh__foot">
        <MiButton variant="plain">Take the 2-minute tour</MiButton>
        <MiButton>Open workspace</MiButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const SETUP = [
  { label: 'Workspace and subdomain', detail: 'fjord-robotics, region EU (Frankfurt)' },
  { label: '3 boards from the Hardware template', detail: 'Roadmap, Build queue, Field issues' },
  { label: '214 issues imported from Jira', detail: 'Labels and assignees matched' },
  { label: 'Slack connected to #eng-updates', detail: 'Daily digest at 9:00' }
]
const ROLES = [{ value: 'member', label: 'Member' }, { value: 'admin', label: 'Admin' }]
const NEXT: { icon: 'people' | 'settings' | 'bell', title: string, detail: string }[] = [
  { icon: 'people', title: 'Create teams', detail: 'Group people by squad' },
  { icon: 'settings', title: 'Set working days', detail: 'Used for cycle dates' },
  { icon: 'bell', title: 'Tune notifications', detail: 'Choose what reaches you' }
]

const emails = ref<string[]>(['ingrid@fjord.io'])
const role = ref<string | number | null>('member')
const error = ref('')
const sent = ref<string[]>([])

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const rejected = (tag: string) => { error.value = isEmail(tag) ? 'That address is already in the list.' : `“${tag}” is not an email address.` }

function send() {
  if (!emails.value.length) return
  sent.value = emails.value
  emails.value = []
  error.value = ''
}
</script>

<style scoped>
.wrh { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.wrh__card { display: grid; gap: 22px; max-width: 880px; margin-inline: auto; padding: 24px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 640px) { .wrh__card { padding: 32px; } }

.wrh__head { display: grid; gap: 4px; }
.wrh__mark { display: grid; grid-template-columns: repeat(2, 20px); gap: 4px; margin-bottom: 12px; }
.wrh__mark span {
  height: 20px; border-radius: 6px; background: var(--mi-p);
  animation: wrh-settle var(--mi-dur-4) var(--mi-spring) calc(var(--wrh-i) * 90ms) both;
}
.wrh__mark span:nth-child(2) { background: var(--mi-s); }
.wrh__mark span:nth-child(3) { background: color-mix(in srgb, var(--mi-p) 45%, transparent); }
.wrh__mark span:nth-child(4) { background: var(--mi-green); }
@keyframes wrh-settle { from { opacity: 0; transform: translateY(-14px) rotate(-12deg) scale(.6); } }

.wrh__grid { display: grid; gap: 24px; }
@container (min-width: 720px) { .wrh__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; } }
.wrh__col { display: grid; align-content: start; gap: 12px; }
.wrh__setup { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.wrh__setup li { display: grid; grid-template-columns: 22px 1fr; gap: 10px; animation: wrh-in var(--mi-dur-3) var(--mi-ease) var(--wrh-d) both; }
.wrh__tick { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
@keyframes wrh-in { from { opacity: 0; transform: translateX(-8px); } }

.wrh__invite { display: grid; align-content: start; gap: 14px; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.wrh__role { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }

.wrh__next { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 640px) { .wrh__next { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.wrh__link {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep);
  color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease);
}
.wrh__link:hover { transform: translateY(-1px); }
.wrh__link:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 2px; }
.wrh__link > :first-child { color: var(--mi-p-text); flex: none; }
.wrh__link > :last-child { color: var(--mi-label3); flex: none; }
.wrh__link span { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.wrh__link small { font-size: 12px; color: var(--mi-label2); }

.wrh__foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid var(--mi-sep); }
@media (prefers-reduced-motion: reduce) { .wrh__mark span, .wrh__setup li { animation: none; } }
</style>
