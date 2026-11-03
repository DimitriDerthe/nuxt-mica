<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="rc-title">
    <div class="mi:max-w-150 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Climbing crew" initials="CC" size="sm" tone="teal" decorative />
        <div>
          <MiText id="rc-title" as="h2" variant="headline" weight="semibold">Climbing crew</MiText>
          <MiText variant="caption" tone="label2">Jade, Omar, Bea and you</MiText>
        </div>
      </header>

      <div class="mi:grid mi:gap-3.5 mi:pt-4 mi:px-3 mi:pb-4.5 mi:[background:var(--mi-page)] mi:@[480px]:px-4.5" role="log" aria-label="Messages in Climbing crew">
        <!-- Link preview: the thumbnail is drawn with token gradients, no remote image. -->
        <MiMessage label="Jade Martin">
          <template #avatar><MiAvatar name="Jade Martin" size="xs" tone="pink" decorative /></template>
          <template #header>Jade · 18:04</template>
          <MiBubble variant="secondary" class="mi:grid! mi:gap-2.5 mi:max-w-[min(100%,22rem)]!">
            <a href="#" class="mi:grid mi:overflow-hidden mi:rounded-[12px] mi:[background:var(--mi-card)] mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
              <span class="mi:block mi:aspect-[2_/_1] mi:[background:linear-gradient(160deg,_var(--mi-p-tint2),_var(--mi-s-tint))]" aria-hidden="true"><svg class="mi:block mi:w-full mi:h-full" viewBox="0 0 120 60"><path class="mi:fill-[color:color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-card))]" d="M0 60 30 22l16 18 22-30 52 50Z" /><circle class="mi:fill-s mi:opacity-70" cx="96" cy="14" r="7" /></svg></span>
              <span class="mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3">
                <span class="mi:text-[11.5px] mi:text-label3">boulderhall-nord.de</span>
                <span class="mi:text-[13.5px] mi:font-semibold mi:leading-[1.35]">New wall opens Saturday: 40 fresh problems, 4A to 7C</span>
              </span>
            </a>
            Reset day! Anyone in?
          </MiBubble>
        </MiMessage>

        <!-- Event invite: RSVP updates the attendee row and the counts. -->
        <MiMessage label="Omar Haddad">
          <template #avatar><MiAvatar name="Omar Haddad" size="xs" tone="indigo" decorative /></template>
          <template #header>Omar · 18:09</template>
          <MiBubble variant="secondary" class="mi:grid! mi:gap-2.5 mi:max-w-[min(100%,22rem)]!">
            <div class="mi:flex mi:items-center mi:gap-3">
              <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-12 mi:h-13 mi:rounded-[12px] mi:[background:var(--mi-card)] mi:text-[20px] mi:font-bold mi:leading-none" aria-hidden="true"><b class="mi:text-[10px] mi:tracking-[.08em] mi:text-red">SAT</b>14</span>
              <div class="mi:min-w-0">
                <MiText as="h3" variant="subheadline" weight="semibold">Opening session</MiText>
                <MiText variant="caption" tone="label2">Sat, Jun 14 · 10:00 to 13:00 · Boulderhalle Nord</MiText>
              </div>
            </div>
            <div class="mi:flex mi:items-center mi:gap-2">
              <MiAvatarGroup :items="going" :max="4" size="xs" />
              <MiText variant="caption" tone="label2">{{ going.length }} going</MiText>
            </div>
            <MiSegmented v-model="rsvp" label="Your RSVP" :options="rsvpOptions" />
          </MiBubble>
        </MiMessage>

        <!-- File: the attachment card with type and size. -->
        <MiMessage label="Bea Kowalski">
          <template #avatar><MiAvatar name="Bea Kowalski" size="xs" tone="orange" decorative /></template>
          <template #header>Bea · 18:15</template>
          <MiAttachment name="Day-pass-waiver.pdf" :file-size="182400" type="application/pdf" :removable="false" class="mi:max-w-[22rem]!" />
        </MiMessage>

        <!-- Shared contact: one tap saves it. -->
        <MiMessage align="end" label="You">
          <MiBubble align="end" variant="tinted" class="mi:grid! mi:gap-2.5 mi:max-w-[min(100%,22rem)]!">
            <div class="mi:flex mi:items-center mi:gap-3">
              <MiAvatar name="Nils Becker" size="md" tone="green" decorative />
              <div class="mi:min-w-0">
                <MiText as="h3" variant="subheadline" weight="semibold">Nils Becker</MiText>
                <MiText variant="caption" tone="label2">Route setter · lends shoes, size 38 to 45</MiText>
              </div>
            </div>
            <MiButton :variant="saved ? 'gray' : 'filled'" size="small" block :disabled="saved" @click="saved = true">
              <template #leading><MiIcon :name="saved ? 'check' : 'plus'" :size="14" /></template>
              {{ saved ? 'Saved to contacts' : 'Add contact' }}
            </MiButton>
          </MiBubble>
          <template #footer>Read 18:20</template>
        </MiMessage>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Rsvp = 'yes' | 'maybe' | 'no'
const rsvpOptions: { value: Rsvp, label: string }[] = [{ value: 'yes', label: 'Going' }, { value: 'maybe', label: 'Maybe' }, { value: 'no', label: 'Can’t' }]
const rsvp = ref<string | number | null>(null)
const saved = ref(false)

interface Member { name: string, tone: 'indigo' | 'pink' | 'primary' }
const others: Member[] = [{ name: 'Omar Haddad', tone: 'indigo' }, { name: 'Jade Martin', tone: 'pink' }]
const going = computed<Member[]>(() => (rsvp.value === 'yes' ? [...others, { name: 'You', tone: 'primary' }] : others))
</script>
