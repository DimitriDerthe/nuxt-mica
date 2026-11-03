<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="task-cards-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="task-cards-title" variant="title3" as="h2" weight="semibold">Board cards</MiText>
        <MiText variant="footnote" tone="label2">Every card wears a signal rail: on track, at risk or blocked</MiText>
      </div>
      <ul class="mi:flex mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Signal rail legend">
        <li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:[--rail:var(--mi-green)] mi:h-3.5 mi:rounded-[2px] mi:w-[3px] mi:[background:var(--rail)]" />On track</li><li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:[--rail:var(--mi-orange)] mi:h-3.5 mi:rounded-[2px] mi:w-[3px] mi:[background:var(--rail)]" />At risk</li><li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:[--rail:var(--mi-red)] mi:h-3.5 mi:rounded-[2px] mi:w-[3px] mi:[background:var(--rail)]" />Blocked</li>
      </ul>
    </header>

    <div class="mi:[column-count:1] mi:gap-x-3 mi:@[560px]:[column-count:2] mi:@[900px]:[column-count:3]">
      <!-- Design card with drawn cover art. -->
      <article class="mi:[--rail:var(--mi-green)] mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)]" aria-labelledby="task-cards-design">
        <div class="mi:relative mi:h-28 mi:-mt-0.5 mi:-mr-0.5 mi:mb-0.5 mi:ml-[-5px] mi:rounded-[10px] mi:overflow-hidden mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_var(--mi-s-tint))]" aria-hidden="true"><span class="mi:absolute mi:rounded-[50%] mi:w-30 mi:h-30 mi:-top-7.5 mi:right-auto mi:bottom-auto mi:-left-5 mi:[background:radial-gradient(circle_at_35%_35%,_var(--mi-p),_transparent_70%)] mi:opacity-75" /><span class="mi:absolute mi:rounded-[50%] mi:w-22.5 mi:h-22.5 mi:top-auto mi:-right-2.5 mi:-bottom-6 mi:left-auto mi:[background:radial-gradient(circle_at_40%_40%,_var(--mi-s),_transparent_70%)] mi:opacity-80" /><span class="mi:absolute mi:top-5.5 mi:right-[30%] mi:bottom-5.5 mi:left-[34%] mi:rounded-[8px] mi:border-[1.5px] mi:border-card/85 mi:[background:color-mix(in_srgb,_var(--mi-card)_30%,_transparent)]" /></div>
        <div class="mi:flex mi:flex-wrap mi:gap-1.5"><span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:[background:var(--mi-p-tint)] mi:text-p-text">Design</span><span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:[background:var(--mi-s-tint)] mi:text-s-text">Marketing</span></div>
        <h3 id="task-cards-design" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">Holiday campaign hero, three directions</h3>
        <footer class="mi:flex mi:items-center mi:flex-wrap mi:gap-y-1.5 mi:gap-x-2.5 mi:pt-2 mi:border-t mi:border-t-sep">
          <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums"><MiIcon name="chat" :size="14" />12</span>
          <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums"><MiIcon :svg="clip" :size="14" />4</span>
          <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums"><MiIcon name="calendar" :size="14" />Nov 12</span>
          <MiIconButton :label="watching ? 'Stop watching' : 'Watch card'" variant="plain" size="small" :pressed="watching" class="mi:ms-auto!" @click="watching = !watching">
            <MiIcon name="eye" :size="16" :filled="watching" />
          </MiIconButton>
          <MiAvatarGroup :items="[{ name: 'Ines Duarte', tone: 'pink' }, { name: 'Owen Pryce', tone: 'teal' }]" :size="24" />
        </footer>
      </article>

      <!-- Bug with a service-level clock. -->
      <article class="mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)]" :class="acked ? 'mi:[--rail:var(--mi-green)]' : 'mi:[--rail:var(--mi-orange)]'" aria-labelledby="task-cards-bug">
        <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0">
          <MiBadge tone="danger" variant="solid" label="P1" />
          <span class="mi:text-[12px] mi:font-semibold mi:text-label3 mi:tabular-nums">PAY-2291</span>
          <span class="mi:ms-auto mi:text-[12px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">Brightwave · Enterprise</span>
        </div>
        <h3 id="task-cards-bug" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">Refunds stuck in “pending” for Stripe Connect accounts</h3>
        <div class="mi:grid mi:gap-1.5">
          <div class="mi:flex mi:justify-between mi:gap-2">
            <MiText variant="caption" weight="semibold" :tone="acked ? 'green' : 'orange'">{{ acked ? 'Acknowledged · resolve by 18:00' : 'Respond in 3h 20m' }}</MiText>
            <MiText variant="caption2" tone="label2">8h SLA</MiText>
          </div>
          <div class="mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="SLA time used" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="58">
            <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="acked ? 'mi:[background:var(--mi-green)] mi:text-green' : 'mi:[background:var(--mi-orange)]'" :style="{ transform: 'scaleX(.58)' }" />
          </div>
        </div>
        <footer class="mi:flex mi:items-center mi:flex-wrap mi:gap-y-1.5 mi:gap-x-2.5 mi:pt-2 mi:border-t mi:border-t-sep">
          <MiAvatar name="Malik Osei" tone="auto" :size="24" />
          <MiText variant="caption" tone="label2">Malik Osei</MiText>
          <MiButton :variant="acked ? 'gray' : 'tinted'" size="small" class="mi:ms-auto!" @click="acked = !acked">{{ acked ? 'Undo' : 'Acknowledge' }}</MiButton>
        </footer>
      </article>

      <!-- Checklist that drives its own progress. -->
      <article class="mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)]" :class="doneCount === subtasks.length ? 'mi:[--rail:var(--mi-green)]' : 'mi:[--rail:var(--mi-fill)]'" aria-labelledby="task-cards-check">
        <div class="mi:flex mi:flex-wrap mi:gap-1.5"><span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:[background:var(--mi-p-tint)] mi:text-p-text">Payments</span><span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:[background:var(--mi-fill3)] mi:text-label2">DE · AT</span></div>
        <h3 id="task-cards-check" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">Launch Klarna in Germany and Austria</h3>
        <div class="mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Subtasks done" aria-valuemin="0" :aria-valuemax="subtasks.length" :aria-valuenow="doneCount">
          <span class="mi:block mi:h-full mi:rounded-[inherit] mi:[background:var(--mi-green)] mi:text-green mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :style="{ transform: `scaleX(${doneCount / subtasks.length})` }" />
        </div>
        <MiCollapsible v-model:open="checkOpen">
          <template #trigger="{ open }">
            <span class="mi:flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:font-semibold">
              <span>Subtasks</span><span class="mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ doneCount }}/{{ subtasks.length }}</span>
              <MiIcon name="chevron-down" :size="14" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="open ? 'mi:transform-[rotate(180deg)]' : ''" />
            </span>
          </template>
          <ul class="mi:grid mi:gap-1.5 mi:mt-2 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]">
            <li v-for="t in subtasks" :key="t.label"><MiCheckbox v-model="t.done" :label="t.label" /></li>
          </ul>
        </MiCollapsible>
        <footer class="mi:flex mi:items-center mi:flex-wrap mi:gap-y-1.5 mi:gap-x-2.5 mi:pt-2 mi:border-t mi:border-t-sep">
          <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums"><MiIcon name="calendar" :size="14" />Nov 20</span>
          <MiAvatarGroup class="mi:ms-auto!" :items="[{ name: 'Tomás Ruiz', tone: 'blue' }, { name: 'Rosa Lind', tone: 'mint' }, { name: 'Carla Benoit', tone: 'orange' }]" :size="24" />
        </footer>
      </article>

      <!-- Pull request with checks and reviews. -->
      <article class="mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)]" :class="rerequested ? 'mi:[--rail:var(--mi-green)]' : 'mi:[--rail:var(--mi-orange)]'" aria-labelledby="task-cards-pr">
        <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0">
          <span class="mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[6px] mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:text-green-t" aria-hidden="true"><MiIcon :svg="branch" :size="14" /></span>
          <span class="mi:text-[12px] mi:font-semibold mi:text-label3 mi:tabular-nums">#1834</span>
          <span class="mi:ms-auto mi:text-[12px] mi:tabular-nums"><b class="mi:text-green-t">+482</b> <b class="mi:text-red-t">−131</b></span>
        </div>
        <h3 id="task-cards-pr" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">feat(checkout): one-page address step</h3>
        <code class="mi:justify-self-start mi:max-w-full mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:[background:var(--mi-fill4)] mi:[font:12px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">ht/one-page-address</code>
        <ul class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Checks">
          <li class="mi:flex mi:items-center mi:gap-2 mi:text-[13px]" v-for="c in checks" :key="c.name">
            <MiSpinner v-if="c.state === 'run'" :size="14" />
            <MiIcon v-else :name="c.state === 'ok' ? 'check-circle-fill' : 'x-circle-fill'" :size="14" :class="[c.state === 'ok' ? 'mi:text-green' : c.state === 'err' ? 'mi:text-red' : '']" />
            <span>{{ c.name }}</span><span class="mi:ms-auto mi:text-[11px] mi:text-label3 mi:tabular-nums">{{ c.time }}</span>
          </li>
        </ul>
        <footer class="mi:flex mi:items-center mi:flex-wrap mi:gap-y-1.5 mi:gap-x-2.5 mi:pt-2 mi:border-t mi:border-t-sep">
          <span class="mi:relative mi:inline-flex"><MiAvatar name="Tomás Ruiz" tone="blue" :size="22" /><MiIcon name="check" :size="12" :weight="3" class="mi:text-green mi:absolute mi:[inset:auto_-3px_-3px_auto] mi:p-px mi:rounded-[50%] mi:[background:var(--mi-card)]" /></span>
          <span class="mi:relative mi:inline-flex"><MiAvatar name="Rosa Lind" tone="mint" :size="22" /><MiIcon :name="rerequested ? 'more' : 'pencil'" :size="12" :weight="2.6" class="mi:absolute mi:[inset:auto_-3px_-3px_auto] mi:p-px mi:rounded-[50%] mi:[background:var(--mi-card)]" :class="rerequested ? '' : 'mi:text-orange'" /></span>
          <MiText variant="caption" tone="label2">{{ rerequested ? 'Review re-requested' : 'Changes requested' }}</MiText>
          <MiButton variant="plain" size="small" class="mi:ms-auto!" :disabled="rerequested" @click="rerequested = true">Re-request</MiButton>
        </footer>
      </article>

      <!-- Blocked card that can be released. -->
      <article class="mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)]" :class="blocked ? 'mi:[--rail:var(--mi-red)]' : 'mi:[--rail:var(--mi-green)]'" aria-labelledby="task-cards-blocked">
        <div class="mi:flex mi:flex-wrap mi:gap-1.5"><span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:[background:var(--mi-fill3)] mi:text-label2">Infra</span></div>
        <h3 id="task-cards-blocked" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">Move receipt PDFs to the new render service</h3>
        <div v-if="blocked" class="mi:flex mi:[align-items:flex-start] mi:gap-2 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-red)_9%,_transparent)] mi:text-red-t mi:text-[13px] mi:leading-[1.4]">
          <MiIcon name="lock" :size="14" />
          <span>Blocked by <b class="mi:font-bold">INFRA-88</b>: render service quota is capped at 50 req/s</span>
        </div>
        <MiText v-else variant="footnote" tone="green" weight="medium" role="status">Unblocked today. Back in the queue.</MiText>
        <footer class="mi:flex mi:items-center mi:flex-wrap mi:gap-y-1.5 mi:gap-x-2.5 mi:pt-2 mi:border-t mi:border-t-sep">
          <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums"><MiIcon :svg="clock" :size="14" />{{ blocked ? 'Waiting 6 days' : 'Ready' }}</span>
          <MiButton :variant="blocked ? 'bordered' : 'gray'" size="small" class="mi:ms-auto!" @click="blocked = !blocked">{{ blocked ? 'Mark unblocked' : 'Undo' }}</MiButton>
        </footer>
      </article>

      <!-- Epic rolling up its stories. -->
      <article class="mi:[--rail:var(--mi-orange)] mi:grid mi:gap-2.5 mi:mb-3 mi:pt-3.5 mi:pr-3.5 mi:pb-3 mi:pl-[17px] mi:[break-inside:avoid] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--rail,_var(--mi-fill)),_var(--mi-sh1)] mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-3.5" aria-labelledby="task-cards-epic">
        <MiProgressRing :value="64" :size="64" label="Checkout v3 stories done" />
        <div class="mi:grid mi:gap-[3px]">
          <span class="mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-semibold mi:justify-self-start mi:[background:var(--mi-s-tint)] mi:text-s-text">Epic</span>
          <h3 id="task-cards-epic" class="mi:m-0 mi:text-[15px] mi:leading-[1.35] mi:font-semibold mi:tracking-[-.01em]">Checkout v3</h3>
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
