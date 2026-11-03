<template>
  <section class="wrh mi:@container mi:font-mi mi:text-label" aria-labelledby="wrh-title">
    <div class="wrh__card mi:grid mi:gap-5.5 mi:max-w-220 mi:mx-auto mi:py-6 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[640px]:p-8">
      <header class="wrh__head mi:grid mi:gap-1">
        <!-- Four tiles settle into a grid once: transform and opacity keyframes only. -->
        <div class="wrh__mark mi:grid mi:grid-cols-[repeat(2,_20px)] mi:gap-1 mi:mb-3" aria-hidden="true">
          <span class="mi:[.wrh__mark_&]:h-5 mi:[.wrh__mark_&]:rounded-[6px] mi:[.wrh__mark_&]:bg-p" v-for="n in 4" :key="n" :style="{ '--wrh-i': n }" />
        </div>
        <MiText id="wrh-title" variant="title2" as="h2" weight="bold" balance>Fjord Robotics is ready</MiText>
        <MiText variant="footnote" tone="label2">fjord-robotics.tideboard.app · created just now</MiText>
      </header>

      <div class="wrh__grid mi:grid mi:gap-6 mi:@[720px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[720px]:gap-8">
        <div class="wrh__col mi:grid mi:content-start mi:gap-3">
          <MiText variant="subheadline" as="h3" weight="semibold">What we set up</MiText>
          <ul class="wrh__setup mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:[.wrh__setup_li&]:grid-cols-[22px_1fr] mi:[.wrh__setup_li&]:gap-2.5" v-for="(s, i) in SETUP" :key="s.label" :style="{ '--wrh-d': i * 140 + 'ms' }">
              <span class="wrh__tick mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:text-green-t"><MiIcon class="mi:[.wrh__setup_li&]:grid-cols-[22px_1fr] mi:[.wrh__setup_li&]:gap-2.5" name="check" :size="13" :weight="2.8" /></span>
              <div>
                <MiText class="mi:[.wrh__setup_li&]:grid-cols-[22px_1fr] mi:[.wrh__setup_li&]:gap-2.5" variant="footnote" weight="medium">{{ s.label }}</MiText>
                <MiText class="mi:[.wrh__setup_li&]:grid-cols-[22px_1fr] mi:[.wrh__setup_li&]:gap-2.5" variant="caption" tone="label2">{{ s.detail }}</MiText>
              </div>
            </li>
          </ul>
        </div>

        <form class="wrh__invite mi:grid mi:content-start mi:gap-3.5 mi:p-4.5 mi:rounded-lg mi:bg-fill4" novalidate @submit.prevent="send">
          <MiText id="wrh-invite" variant="subheadline" as="h3" weight="semibold">Bring your team in</MiText>
          <template v-if="!sent.length">
            <MiField label="Work emails" :hint="`Press Return after each one · ${emails.length} of 8`" :error="error">
              <MiTagInput v-model="emails" :max="8" :validate="isEmail" placeholder="name@fjord.io" @reject="rejected" />
            </MiField>
            <div class="wrh__role mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
              <MiText variant="footnote" tone="label2">Join as</MiText>
              <MiSegmented v-model="role" label="Role for invited people" :options="ROLES" />
            </div>
            <MiButton type="submit" :disabled="!emails.length">{{ emails.length ? `Send ${emails.length} invite${emails.length > 1 ? 's' : ''}` : 'Add an email first' }}</MiButton>
          </template>
          <MiAlert v-else tone="success" title="Invites on their way" :message="`${sent.length} ${role === 'admin' ? 'admins' : 'members'} will get a link valid for 7 days.`" action-label="Invite more" @action="sent = []" />
        </form>
      </div>

      <nav class="wrh__next mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:@[640px]:grid-cols-3" aria-label="Next steps">
        <a v-for="n in NEXT" :key="n.title" href="#" class="wrh__link mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:border mi:border-sep mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
          <MiIcon class="mi:[.wrh__link_span&]:min-w-0 mi:[.wrh__link_small&]:text-label2" :name="n.icon" :size="18" />
          <span class="mi:[.wrh__link_span&]:min-w-0"><b>{{ n.title }}</b><small class="mi:[.wrh__link_small&]:text-label2">{{ n.detail }}</small></span>
          <MiIcon class="mi:[.wrh__link_span&]:min-w-0 mi:[.wrh__link_small&]:text-label2" name="chevron-right" :size="14" />
        </a>
      </nav>

      <footer class="wrh__foot mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2.5 mi:pt-4.5 mi:border-t mi:border-t-sep">
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
.wrh__mark span {
  animation: wrh-settle var(--mi-dur-4) var(--mi-spring) calc(var(--wrh-i) * 90ms) both;
}
.wrh__mark span:nth-child(2) { background: var(--mi-s); }
.wrh__mark span:nth-child(3) { background: color-mix(in srgb, var(--mi-p) 45%, transparent); }
.wrh__mark span:nth-child(4) { background: var(--mi-green); }
@keyframes wrh-settle { from { opacity: 0; transform: translateY(-14px) rotate(-12deg) scale(.6); } }
.wrh__setup li { display: grid; animation: wrh-in var(--mi-dur-3) var(--mi-ease) var(--wrh-d) both; }
@keyframes wrh-in { from { opacity: 0; transform: translateX(-8px); } }
.wrh__link > :first-child { color: var(--mi-p-text); flex: none; }
.wrh__link > :last-child { color: var(--mi-label3); flex: none; }
.wrh__link span { display: grid; flex: 1; font-size: 14px; }
.wrh__link small { font-size: 12px; }
@media (prefers-reduced-motion: reduce) { .wrh__mark span, .wrh__setup li { animation: none; } }
</style>
