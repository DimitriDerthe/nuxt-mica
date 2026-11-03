<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="wrh-title">
    <div class="mi:grid mi:gap-5.5 mi:max-w-220 mi:mx-auto mi:py-6 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[640px]:p-8">
      <header class="mi:grid mi:gap-1">
        <!-- Four tiles settle into a grid once: transform and opacity keyframes only. -->
        <div class="mi:grid mi:grid-cols-[repeat(2,_20px)] mi:gap-1 mi:mb-3" aria-hidden="true">
          <span class="mi:h-5 mi:rounded-[6px] mi:[--mi-in-y:-14px] mi:[--mi-in-r:-12deg] mi:[--mi-in-s:.6] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)_calc(var(--wrh-i)_*_90ms)_both] mi:motion-reduce:animate-none" :class="n === 2 ? 'mi:bg-s' : n === 3 ? 'mi:bg-p/45' : n === 4 ? 'mi:bg-green' : 'mi:bg-p'" v-for="n in 4" :key="n" :style="{ '--wrh-i': n }" />
        </div>
        <MiText id="wrh-title" variant="title2" as="h2" weight="bold" balance>Fjord Robotics is ready</MiText>
        <MiText variant="footnote" tone="label2">fjord-robotics.tideboard.app · created just now</MiText>
      </header>

      <div class="mi:grid mi:gap-6 mi:@[720px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[720px]:gap-8">
        <div class="mi:grid mi:content-start mi:gap-3">
          <MiText variant="subheadline" as="h3" weight="semibold">What we set up</MiText>
          <ul class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:grid mi:[--mi-in-x:-8px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)_var(--wrh-d)_both] mi:motion-reduce:animate-none mi:grid-cols-[22px_1fr] mi:gap-2.5" v-for="(s, i) in SETUP" :key="s.label" :style="{ '--wrh-d': i * 140 + 'ms' }">
              <span class="mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:text-green-t"><MiIcon name="check" :size="13" :weight="2.8" /></span>
              <div>
                <MiText variant="footnote" weight="medium">{{ s.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ s.detail }}</MiText>
              </div>
            </li>
          </ul>
        </div>

        <form class="mi:grid mi:content-start mi:gap-3.5 mi:p-4.5 mi:rounded-lg mi:bg-fill4" novalidate @submit.prevent="send">
          <MiText id="wrh-invite" variant="subheadline" as="h3" weight="semibold">Bring your team in</MiText>
          <template v-if="!sent.length">
            <MiField label="Work emails" :hint="`Press Return after each one · ${emails.length} of 8`" :error="error">
              <MiTagInput v-model="emails" :max="8" :validate="isEmail" placeholder="name@fjord.io" @reject="rejected" />
            </MiField>
            <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
              <MiText variant="footnote" tone="label2">Join as</MiText>
              <MiSegmented v-model="role" label="Role for invited people" :options="ROLES" />
            </div>
            <MiButton type="submit" :disabled="!emails.length">{{ emails.length ? `Send ${emails.length} invite${emails.length > 1 ? 's' : ''}` : 'Add an email first' }}</MiButton>
          </template>
          <MiAlert v-else tone="success" title="Invites on their way" :message="`${sent.length} ${role === 'admin' ? 'admins' : 'members'} will get a link valid for 7 days.`" action-label="Invite more" @action="sent = []" />
        </form>
      </div>

      <nav class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:@[640px]:grid-cols-3" aria-label="Next steps">
        <a v-for="n in NEXT" :key="n.title" href="#" class="mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:border mi:border-sep mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
          <MiIcon class="mi:text-p-text! mi:flex-none!" :name="n.icon" :size="18" />
          <span class="mi:grid mi:flex-1 mi:text-[14px] mi:min-w-0"><b>{{ n.title }}</b><small class="mi:text-[12px] mi:text-label2">{{ n.detail }}</small></span>
          <MiIcon class="mi:text-label3! mi:flex-none!" name="chevron-right" :size="14" />
        </a>
      </nav>

      <footer class="mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2.5 mi:pt-4.5 mi:border-t mi:border-t-sep">
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
