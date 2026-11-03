<template>
  <section class="rc" aria-labelledby="rc-title">
    <div class="rc__card">
      <header class="rc__head">
        <MiAvatar name="Climbing crew" initials="CC" size="sm" tone="teal" decorative />
        <div>
          <MiText id="rc-title" as="h2" variant="headline" weight="semibold">Climbing crew</MiText>
          <MiText variant="caption" tone="label2">Jade, Omar, Bea and you</MiText>
        </div>
      </header>

      <div class="rc__log" role="log" aria-label="Messages in Climbing crew">
        <!-- Link preview: the thumbnail is drawn with token gradients, no remote image. -->
        <MiMessage label="Jade Martin">
          <template #avatar><MiAvatar name="Jade Martin" size="xs" tone="pink" decorative /></template>
          <template #header>Jade · 18:04</template>
          <MiBubble variant="secondary" class="rc__bub">
            <a href="#" class="rc__link" @click.prevent>
              <span class="rc__link-art" aria-hidden="true"><svg viewBox="0 0 120 60"><path d="M0 60 30 22l16 18 22-30 52 50Z" /><circle cx="96" cy="14" r="7" /></svg></span>
              <span class="rc__link-text">
                <span class="rc__link-host">boulderhall-nord.de</span>
                <span class="rc__link-title">New wall opens Saturday: 40 fresh problems, 4A to 7C</span>
              </span>
            </a>
            Reset day! Anyone in?
          </MiBubble>
        </MiMessage>

        <!-- Event invite: RSVP updates the attendee row and the counts. -->
        <MiMessage label="Omar Haddad">
          <template #avatar><MiAvatar name="Omar Haddad" size="xs" tone="indigo" decorative /></template>
          <template #header>Omar · 18:09</template>
          <MiBubble variant="secondary" class="rc__bub">
            <div class="rc__event">
              <span class="rc__date" aria-hidden="true"><b>SAT</b>14</span>
              <div class="rc__event-text">
                <MiText as="h3" variant="subheadline" weight="semibold">Opening session</MiText>
                <MiText variant="caption" tone="label2">Sat, Jun 14 · 10:00 to 13:00 · Boulderhalle Nord</MiText>
              </div>
            </div>
            <div class="rc__rsvp">
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
          <MiAttachment name="Day-pass-waiver.pdf" :file-size="182400" type="application/pdf" :removable="false" class="rc__file" />
        </MiMessage>

        <!-- Shared contact: one tap saves it. -->
        <MiMessage align="end" label="You">
          <MiBubble align="end" variant="tinted" class="rc__bub">
            <div class="rc__contact">
              <MiAvatar name="Nils Becker" size="md" tone="green" decorative />
              <div class="rc__contact-text">
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

<style scoped>
.rc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.rc__card { max-width: 600px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.rc__head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.rc__log { display: grid; gap: 14px; padding: 16px 12px 18px; background: var(--mi-page); }
@container (min-width: 480px) { .rc__log { padding-inline: 18px; } }
.rc .rc__bub { display: grid; gap: 10px; max-width: min(100%, 22rem); }

.rc__link { display: grid; overflow: hidden; border-radius: 12px; background: var(--mi-card); color: inherit; text-decoration: none; }
.rc__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rc__link-art { display: block; aspect-ratio: 2 / 1; background: linear-gradient(160deg, var(--mi-p-tint2), var(--mi-s-tint)); }
.rc__link-art svg { display: block; width: 100%; height: 100%; }
.rc__link-art path { fill: color-mix(in srgb, var(--mi-p) 55%, var(--mi-card)); }
.rc__link-art circle { fill: var(--mi-s); opacity: .7; }
.rc__link-text { display: grid; gap: 2px; padding: 10px 12px; }
.rc__link-host { font-size: 11.5px; color: var(--mi-label3); }
.rc__link-title { font-size: 13.5px; font-weight: 600; line-height: 1.35; }

.rc__event { display: flex; align-items: center; gap: 12px; }
.rc__event-text { min-width: 0; }
.rc__date { display: grid; place-items: center; flex: none; width: 48px; height: 52px; border-radius: 12px; background: var(--mi-card); font-size: 20px; font-weight: 700; line-height: 1; }
.rc__date b { font-size: 10px; letter-spacing: .08em; color: var(--mi-red); }
.rc__rsvp { display: flex; align-items: center; gap: 8px; }

.rc__file { max-width: 22rem; }
.rc__contact { display: flex; align-items: center; gap: 12px; }
.rc__contact-text { min-width: 0; }
</style>
