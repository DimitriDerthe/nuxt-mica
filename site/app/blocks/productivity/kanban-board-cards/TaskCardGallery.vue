<template>
  <section class="tc" aria-labelledby="task-cards-title">
    <header class="tc__head">
      <div>
        <MiText id="task-cards-title" variant="title3" as="h2" weight="semibold">Board cards</MiText>
        <MiText variant="footnote" tone="label2">Every card wears a signal rail: on track, at risk or blocked</MiText>
      </div>
      <ul class="tc__key" aria-label="Signal rail legend">
        <li><i class="is-ok" />On track</li><li><i class="is-risk" />At risk</li><li><i class="is-blocked" />Blocked</li>
      </ul>
    </header>

    <div class="tc__grid">
      <!-- Design card with drawn cover art. -->
      <article class="tc__card is-ok" aria-labelledby="task-cards-design">
        <div class="tc__cover" aria-hidden="true"><span class="tc__orb tc__orb--a" /><span class="tc__orb tc__orb--b" /><span class="tc__frame" /></div>
        <div class="tc__labels"><span class="tc__label is-p">Design</span><span class="tc__label is-s">Marketing</span></div>
        <h3 id="task-cards-design" class="tc__title">Holiday campaign hero, three directions</h3>
        <footer class="tc__foot">
          <span class="tc__meta"><MiIcon name="chat" :size="14" />12</span>
          <span class="tc__meta"><MiIcon :svg="clip" :size="14" />4</span>
          <span class="tc__meta"><MiIcon name="calendar" :size="14" />Nov 12</span>
          <MiIconButton :label="watching ? 'Stop watching' : 'Watch card'" variant="plain" size="small" :pressed="watching" class="tc__push" @click="watching = !watching">
            <MiIcon name="eye" :size="16" :filled="watching" />
          </MiIconButton>
          <MiAvatarGroup :items="[{ name: 'Ines Duarte', tone: 'pink' }, { name: 'Owen Pryce', tone: 'teal' }]" :size="24" />
        </footer>
      </article>

      <!-- Bug with a service-level clock. -->
      <article class="tc__card" :class="acked ? 'is-ok' : 'is-risk'" aria-labelledby="task-cards-bug">
        <div class="tc__top">
          <MiBadge tone="danger" variant="solid" label="P1" />
          <span class="tc__key-id">PAY-2291</span>
          <span class="tc__cust">Brightwave · Enterprise</span>
        </div>
        <h3 id="task-cards-bug" class="tc__title">Refunds stuck in “pending” for Stripe Connect accounts</h3>
        <div class="tc__sla">
          <div class="tc__sla-row">
            <MiText variant="caption" weight="semibold" :tone="acked ? 'green' : 'orange'">{{ acked ? 'Acknowledged · resolve by 18:00' : 'Respond in 3h 20m' }}</MiText>
            <MiText variant="caption2" tone="label2">8h SLA</MiText>
          </div>
          <div class="tc__bar" role="meter" aria-label="SLA time used" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="58">
            <span :class="acked ? 'is-ok' : 'is-risk'" :style="{ transform: 'scaleX(.58)' }" />
          </div>
        </div>
        <footer class="tc__foot">
          <MiAvatar name="Malik Osei" tone="auto" :size="24" />
          <MiText variant="caption" tone="label2">Malik Osei</MiText>
          <MiButton :variant="acked ? 'gray' : 'tinted'" size="small" class="tc__push" @click="acked = !acked">{{ acked ? 'Undo' : 'Acknowledge' }}</MiButton>
        </footer>
      </article>

      <!-- Checklist that drives its own progress. -->
      <article class="tc__card" :class="doneCount === subtasks.length ? 'is-ok' : 'is-neutral'" aria-labelledby="task-cards-check">
        <div class="tc__labels"><span class="tc__label is-p">Payments</span><span class="tc__label">DE · AT</span></div>
        <h3 id="task-cards-check" class="tc__title">Launch Klarna in Germany and Austria</h3>
        <div class="tc__bar" role="meter" aria-label="Subtasks done" aria-valuemin="0" :aria-valuemax="subtasks.length" :aria-valuenow="doneCount">
          <span class="is-ok" :style="{ transform: `scaleX(${doneCount / subtasks.length})` }" />
        </div>
        <MiCollapsible v-model:open="checkOpen">
          <template #trigger="{ open }">
            <span class="tc__check-trigger">
              <span>Subtasks</span><span class="tc__check-n">{{ doneCount }}/{{ subtasks.length }}</span>
              <MiIcon name="chevron-down" :size="14" class="tc__chev" :class="{ 'is-open': open }" />
            </span>
          </template>
          <ul class="tc__checks">
            <li v-for="t in subtasks" :key="t.label"><MiCheckbox v-model="t.done" :label="t.label" /></li>
          </ul>
        </MiCollapsible>
        <footer class="tc__foot">
          <span class="tc__meta"><MiIcon name="calendar" :size="14" />Nov 20</span>
          <MiAvatarGroup class="tc__push" :items="[{ name: 'Tomás Ruiz', tone: 'blue' }, { name: 'Rosa Lind', tone: 'mint' }, { name: 'Carla Benoit', tone: 'orange' }]" :size="24" />
        </footer>
      </article>

      <!-- Pull request with checks and reviews. -->
      <article class="tc__card" :class="rerequested ? 'is-ok' : 'is-risk'" aria-labelledby="task-cards-pr">
        <div class="tc__top">
          <span class="tc__pr-icon" aria-hidden="true"><MiIcon :svg="branch" :size="14" /></span>
          <span class="tc__key-id">#1834</span>
          <span class="tc__diff"><b class="is-add">+482</b> <b class="is-del">−131</b></span>
        </div>
        <h3 id="task-cards-pr" class="tc__title">feat(checkout): one-page address step</h3>
        <code class="tc__branch">ht/one-page-address</code>
        <ul class="tc__ci" aria-label="Checks">
          <li v-for="c in checks" :key="c.name">
            <MiSpinner v-if="c.state === 'run'" :size="14" />
            <MiIcon v-else :name="c.state === 'ok' ? 'check-circle-fill' : 'x-circle-fill'" :size="14" :class="'is-' + c.state" />
            <span>{{ c.name }}</span><span class="tc__ci-t">{{ c.time }}</span>
          </li>
        </ul>
        <footer class="tc__foot">
          <span class="tc__rev"><MiAvatar name="Tomás Ruiz" tone="blue" :size="22" /><MiIcon name="check" :size="12" :weight="3" class="is-ok" /></span>
          <span class="tc__rev"><MiAvatar name="Rosa Lind" tone="mint" :size="22" /><MiIcon :name="rerequested ? 'more' : 'pencil'" :size="12" :weight="2.6" :class="rerequested ? '' : 'is-risk'" /></span>
          <MiText variant="caption" tone="label2">{{ rerequested ? 'Review re-requested' : 'Changes requested' }}</MiText>
          <MiButton variant="plain" size="small" class="tc__push" :disabled="rerequested" @click="rerequested = true">Re-request</MiButton>
        </footer>
      </article>

      <!-- Blocked card that can be released. -->
      <article class="tc__card" :class="blocked ? 'is-blocked' : 'is-ok'" aria-labelledby="task-cards-blocked">
        <div class="tc__labels"><span class="tc__label">Infra</span></div>
        <h3 id="task-cards-blocked" class="tc__title">Move receipt PDFs to the new render service</h3>
        <div v-if="blocked" class="tc__blocker">
          <MiIcon name="lock" :size="14" />
          <span>Blocked by <b>INFRA-88</b>: render service quota is capped at 50 req/s</span>
        </div>
        <MiText v-else variant="footnote" tone="green" weight="medium" role="status">Unblocked today. Back in the queue.</MiText>
        <footer class="tc__foot">
          <span class="tc__meta"><MiIcon :svg="clock" :size="14" />{{ blocked ? 'Waiting 6 days' : 'Ready' }}</span>
          <MiButton :variant="blocked ? 'bordered' : 'gray'" size="small" class="tc__push" @click="blocked = !blocked">{{ blocked ? 'Mark unblocked' : 'Undo' }}</MiButton>
        </footer>
      </article>

      <!-- Epic rolling up its stories. -->
      <article class="tc__card is-risk tc__epic" aria-labelledby="task-cards-epic">
        <MiProgressRing :value="64" :size="64" label="Checkout v3 stories done" />
        <div class="tc__epic-text">
          <span class="tc__label is-s tc__epic-tag">Epic</span>
          <h3 id="task-cards-epic" class="tc__title">Checkout v3</h3>
          <MiText variant="footnote" tone="label2">16 of 25 stories · due Dec 4</MiText>
          <MiText variant="caption" tone="orange" weight="semibold">2 stories slipped last sprint</MiText>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const watching = ref(true)
const acked = ref(false)
const checkOpen = ref(true)
const rerequested = ref(false)
const blocked = ref(true)

// Sample subtasks and CI checks; swap for your tracker and CI APIs.
const subtasks = reactive([
  { label: 'Merchant contract signed', done: true },
  { label: 'Sandbox keys in Vault', done: true },
  { label: 'German and Austrian legal copy', done: true },
  { label: 'Refund webhook handler', done: false },
  { label: 'Finance sign-off on fees', done: false }
])
const doneCount = computed(() => subtasks.filter(t => t.done).length)

const checks = [
  { name: 'Lint and types', state: 'ok', time: '48s' },
  { name: 'Unit tests', state: 'ok', time: '2m 11s' },
  { name: 'E2E checkout', state: 'run', time: 'running' },
  { name: 'Preview deploy', state: 'ok', time: '1m 02s' }
]

const clip = '<path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.1-8.1a3.3 3.3 0 014.7 4.7l-8.1 8.1a1.7 1.7 0 01-2.4-2.4l7.4-7.4"/>'
const branch = '<circle cx="6" cy="5.5" r="2.2"/><circle cx="6" cy="18.5" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 7.7v8.6M18 10.2c0 4-6 3-11 6.5"/>'
const clock = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
</script>

<style scoped>
.tc { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.tc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.tc__key { display: flex; gap: 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); }
.tc__key li { display: inline-flex; align-items: center; gap: 6px; }
.tc__key i { width: 3px; height: 14px; border-radius: 2px; }
.tc__key .is-ok, .tc__card.is-ok { --rail: var(--mi-green); }
.tc__key .is-risk, .tc__card.is-risk { --rail: var(--mi-orange); }
.tc__key .is-blocked, .tc__card.is-blocked { --rail: var(--mi-red); }
.tc__card.is-neutral { --rail: var(--mi-fill); }
.tc__key i { background: var(--rail); }

/* Masonry with CSS columns: cards keep their natural height and never overlap. */
.tc__grid { column-count: 1; column-gap: 12px; }
@container (min-width: 560px) { .tc__grid { column-count: 2; } }
@container (min-width: 900px) { .tc__grid { column-count: 3; } }

.tc__card {
  display: grid; gap: 10px; margin-bottom: 12px; padding: 14px 14px 12px 17px; break-inside: avoid; border-radius: var(--mi-radius-l);
  background: var(--mi-card); box-shadow: inset 3px 0 0 var(--rail, var(--mi-fill)), var(--mi-sh1);
}
.tc__title { margin: 0; font-size: 15px; line-height: 1.35; font-weight: 600; letter-spacing: -.01em; }
.tc__top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tc__key-id { font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.tc__cust { margin-inline-start: auto; font-size: 12px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tc__labels { display: flex; flex-wrap: wrap; gap: 6px; }
.tc__label { padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--mi-fill3); color: var(--mi-label2); }
.tc__label.is-p { background: var(--mi-p-tint); color: var(--mi-p-text); }
.tc__label.is-s { background: var(--mi-s-tint); color: var(--mi-s-text); }

.tc__foot { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; padding-top: 8px; border-top: 1px solid var(--mi-sep); }
.tc__meta { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.tc__push { margin-inline-start: auto; }

.tc__cover { position: relative; height: 112px; margin: -2px -2px 2px -5px; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, var(--mi-p-tint), var(--mi-s-tint)); }
.tc__orb { position: absolute; border-radius: 50%; }
.tc__orb--a { width: 120px; height: 120px; inset: -30px auto auto -20px; background: radial-gradient(circle at 35% 35%, var(--mi-p), transparent 70%); opacity: .75; }
.tc__orb--b { width: 90px; height: 90px; inset: auto -10px -24px auto; background: radial-gradient(circle at 40% 40%, var(--mi-s), transparent 70%); opacity: .8; }
.tc__frame { position: absolute; inset: 22px 30% 22px 34%; border-radius: 8px; border: 1.5px solid color-mix(in srgb, var(--mi-card) 85%, transparent); background: color-mix(in srgb, var(--mi-card) 30%, transparent); }

.tc__sla { display: grid; gap: 6px; }
.tc__sla-row { display: flex; justify-content: space-between; gap: 8px; }
.tc__bar { height: 5px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.tc__bar span { display: block; height: 100%; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.tc__bar span.is-ok { background: var(--mi-green); }
.tc__bar span.is-risk { background: var(--mi-orange); }

.tc__check-trigger { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
.tc__check-n { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.tc__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.tc__chev.is-open { transform: rotate(180deg); }
.tc__checks { display: grid; gap: 6px; margin: 8px 0 0; padding: 0; list-style: none; }

.tc__pr-icon { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.tc__diff { margin-inline-start: auto; font-size: 12px; font-variant-numeric: tabular-nums; }
.tc__diff .is-add { color: var(--mi-green-t); }
.tc__diff .is-del { color: var(--mi-red-t); }
.tc__branch { justify-self: start; max-width: 100%; padding: 2px 8px; border-radius: 6px; background: var(--mi-fill4); font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc__ci { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.tc__ci li { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.tc__ci-t { margin-inline-start: auto; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.tc__card .is-ok { color: var(--mi-green); }
.tc__card .is-err { color: var(--mi-red); }
.tc__card .tc__rev .is-risk { color: var(--mi-orange); }
.tc__rev { position: relative; display: inline-flex; }
.tc__rev > :last-child { position: absolute; inset: auto -3px -3px auto; padding: 1px; border-radius: 50%; background: var(--mi-card); }

.tc__blocker { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--mi-red) 9%, transparent); color: var(--mi-red-t); font-size: 13px; line-height: 1.4; }
.tc__blocker b { font-weight: 700; }

.tc__epic { grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 14px; }
.tc__epic-text { display: grid; gap: 3px; }
.tc__epic-tag { justify-self: start; }
</style>
