<template>
  <section class="cwt mi:[--cwt-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:[--cwt-shade:color-mix(in_srgb,_var(--mi-label)_3.5%,_var(--mi-card))] mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="cwt-title">
    <header class="cwt__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-6">
      <div class="cwt__title mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="cwt-title" variant="title3" as="h2" weight="semibold">Key accounts</MiText>
        <MiText variant="footnote" tone="label2">{{ contacts.length }} contacts across {{ accounts.length }} accounts · Q4 renewals</MiText>
      </div>
      <!-- The scale every warmth strip is read against: warm on the day of a touch, cold after six weeks. -->
      <div class="cwt__scale mi:inline-flex mi:items-center mi:gap-2 mi:text-[11px] mi:font-medium mi:tracking-[.02em] mi:text-(--cwt-t3) mi:tabular-nums" role="img" aria-label="Warmth scale: cold after 40 days without a touch, hot on the day of a touch">
        <span>40 d</span>
        <span class="cwt__ticks mi:inline-flex mi:items-center mi:gap-0.5"><i v-for="n in TICKS" :key="n" class="is-on mi:[.cwt__ticks_&]:w-1 mi:[.cwt__ticks_&]:h-3 mi:[.cwt__ticks_&]:rounded-[1.5px] mi:[.cwt__scale_.cwt__ticks_&]:w-[3px] mi:[.cwt__scale_.cwt__ticks_&]:h-[9px]" :style="tick(n)" /></span>
        <span>Today</span>
      </div>
    </header>

    <div class="cwt__toolbar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-3">
      <div class="cwt__search mi:flex-[1_1_220px] mi:max-w-80 mi:min-w-0"><MiSearch v-model="query" size="compact" placeholder="Name, title or account" aria-label="Search contacts" /></div>
      <div class="cwt__tools mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiChip v-model="coolingOnly" selectable size="small" tone="neutral" :label="`Needs a touch · ${coolingCount}`" />
        <MiSegmented v-model="sort" label="Sort contacts" :options="sorts" />
      </div>
    </div>

    <div class="cwt__scroll mi:max-h-117.5 mi:overflow-auto mi:overscroll-contain mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:border mi:border-sep">
      <table class="cwt__table mi:w-full mi:border-separate mi:[border-spacing:0] mi:text-[13px] mi:@[680px]:table">
        <caption class="cwt__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Contacts grouped by account, with relationship warmth and open deal value</caption>
        <thead>
          <tr>
            <th scope="col" class="c-exp mi:[.cwt__row_&]:[grid-area:exp] mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap mi:@[680px]:[.cwt__table_thead_&]:w-11"><span class="cwt__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Details</span></th>
            <th class="mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap" scope="col">Contact</th>
            <th class="mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap" scope="col">Warmth</th>
            <th class="mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap" scope="col">Last touch</th>
            <th scope="col" class="is-num mi:[.cwt__table_&]:tabular-nums mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap">Open value</th>
            <th scope="col" class="c-own mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap mi:@[680px]:[.cwt__row_&]:w-16">Owner</th>
          </tr>
        </thead>

        <tbody v-for="g in groups" :key="g.id">
          <tr class="cwt__group">
            <th scope="rowgroup" colspan="6">
              <div class="cwt__group-in mi:flex mi:items-center mi:gap-3 mi:pt-2.5 mi:pr-3.5 mi:pb-2.5 mi:pl-1.5 mi:[background:var(--cwt-shade)] mi:border-t mi:border-t-sep mi:[tbody:first-of-type_&]:[border-top:0] mi:@[680px]:px-[8px_16px]">
                <button type="button" class="cwt__group-btn mi:flex mi:flex-[1_1_auto] mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-1 mi:px-1.5 mi:[border:0] mi:rounded-md mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-expanded="!collapsed.includes(g.id)" @click="toggleGroup(g.id)">
                  <MiIcon name="chevron-right" :size="14" class="cwt__chev mi:text-(--cwt-t3) mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
                  <span class="cwt__mark mi:grid mi:place-items-center mi:flex-[none] mi:w-7.5 mi:h-7.5 mi:rounded-[8px] mi:text-[11px] mi:font-bold mi:tracking-[.04em] mi:[background:var(--mi-p-tint)] mi:text-p-text" :data-tone="g.tone" aria-hidden="true">{{ g.mark }}</span>
                  <span class="cwt__group-name mi:grid mi:min-w-0 mi:font-semibold mi:text-[14px]">
                    <span>{{ g.name }}</span>
                    <small class="mi:[.cwt__group-name_&]:text-[12px] mi:[.cwt__group-name_&]:text-label2">{{ g.city }} · {{ g.rows.length }} {{ g.rows.length === 1 ? 'contact' : 'contacts' }}</small>
                  </span>
                </button>
                <!-- Account heat signature: one dot per contact, so a cooling account shows before a deal slips. -->
                <span class="cwt__sig mi:hidden mi:gap-[3px] mi:@[680px]:inline-flex" role="img" :aria-label="`${g.warm} of ${g.rows.length} contacts touched in the last 10 days`">
                  <i class="mi:[.cwt__sig_&]:w-2 mi:[.cwt__sig_&]:h-2 mi:[.cwt__sig_&]:rounded-[50%] mi:[.cwt__sig_&]:[background:color-mix(in_srgb,_var(--mi-orange)_var(--wp),_var(--mi-blue))] mi:[.cwt__sig_&]:opacity-[calc(.45_+_var(--w)_*_.55)]" v-for="c in g.rows" :key="c.id" :style="heat(c)" />
                </span>
                <span class="cwt__group-total mi:flex-[none] mi:font-semibold mi:text-[14px] mi:tabular-nums">{{ money(g.value) }}</span>
              </div>
            </th>
          </tr>

          <template v-if="!collapsed.includes(g.id)">
            <template v-for="c in g.rows" :key="c.id">
              <tr class="cwt__row mi:[.cwt__table_&]:grid-cols-[36px_minmax(0,_1fr)_auto] mi:[.cwt__table_&]:[grid-template-areas:'exp_who_val'_'._warm_last'] mi:[.cwt__table_&]:items-center mi:[.cwt__table_&]:[transition:background-color_var(--mi-dur-1)_var(--mi-ease)]" :class="{ 'is-open': opened.includes(c.id) }">
                <td class="c-exp mi:[.cwt__row_&]:[grid-area:exp] mi:@[680px]:[.cwt__table_thead_&]:w-11 mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep">
                  <button
                    type="button" class="cwt__exp mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:mx-auto mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:text-(--cwt-t3) mi:cursor-pointer mi:hover:[background:var(--mi-fill3)]" :aria-expanded="opened.includes(c.id)" :aria-controls="`cwt-d-${c.id}`"
                    :aria-label="`Recent interactions with ${c.name}`" @click="toggleRow(c.id)"
                  >
                    <MiIcon class="mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep" name="chevron-down" :size="14" />
                  </button>
                </td>
                <td class="c-who mi:[.cwt__row_&]:[grid-area:who] mi:[.cwt__row_&]:min-w-0 mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep">
                  <span class="cwt__who mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
                    <MiAvatar class="mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep" :name="c.name" size="sm" tone="auto" decorative />
                    <span class="cwt__who-text mi:grid mi:min-w-0">
                      <span class="cwt__name mi:font-semibold mi:text-[14px] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ c.name }}</span>
                      <span class="cwt__role mi:text-[12px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ c.title }}</span>
                    </span>
                  </span>
                </td>
                <td class="c-warm mi:[.cwt__row_&]:[grid-area:warm] mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep mi:@[680px]:[.cwt__row_&]:w-42.5">
                  <span class="cwt__warm mi:inline-flex mi:items-center mi:gap-2.5" :data-band="band(c)">
                    <span class="cwt__ticks mi:inline-flex mi:items-center mi:gap-0.5" role="meter" :aria-label="`Warmth of ${c.name}`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(warmth(c) * 100)" :aria-valuetext="`${band(c)}, ${ago(c.days).toLowerCase()}`">
                      <i class="mi:[.cwt__ticks_&]:w-1 mi:[.cwt__ticks_&]:h-3 mi:[.cwt__ticks_&]:rounded-[1.5px] mi:[.cwt__scale_.cwt__ticks_&]:w-[3px] mi:[.cwt__scale_.cwt__ticks_&]:h-[9px]" v-for="n in TICKS" :key="n" :class="{ 'is-on': n <= lit(c) }" :style="tick(n)" />
                    </span>
                    <span class="cwt__band mi:min-w-13 mi:text-[12px] mi:font-semibold mi:text-label2">{{ band(c) }}</span>
                  </span>
                </td>
                <td class="c-last mi:[.cwt__row_&]:[grid-area:last] mi:[.cwt__row_&]:justify-self-end mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep mi:@[680px]:[.cwt__row_&]:w-35">
                  <span class="cwt__last mi:inline-flex mi:items-center mi:gap-1.5 mi:text-label2 mi:whitespace-nowrap mi:tabular-nums"><MiIcon class="mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep" :svg="glyph[c.touches[0]!.kind]" :size="14" />{{ ago(c.days) }}</span>
                </td>
                <td class="c-val is-num mi:[.cwt__table_&]:tabular-nums mi:[.cwt__row_&]:[grid-area:val] mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep mi:@[680px]:[.cwt__row_&]:w-30">{{ c.value ? money(c.value) : '—' }}</td>
                <td class="c-own mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep mi:@[680px]:[.cwt__row_&]:w-16"><MiAvatar class="mi:@[680px]:[.cwt__row_td&]:border-t mi:@[680px]:[.cwt__row_td&]:border-t-sep" :name="c.owner" size="xs" tone="neutral" /></td>
              </tr>
              <tr v-if="opened.includes(c.id)" :id="`cwt-d-${c.id}`" class="cwt__detail mi:[border-top:1px_dashed_var(--mi-sep)] mi:[background:color-mix(in_srgb,_var(--mi-p-tint)_22%,_transparent)]">
                <td colspan="6">
                  <div class="cwt__detail-in mi:grid mi:gap-2.5 mi:pt-3 mi:pr-4 mi:pb-4 mi:pl-12 mi:@[680px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[680px]:[grid-template-areas:'h_act'_'list_list'] mi:@[680px]:pt-3.5 mi:@[680px]:pr-5 mi:@[680px]:pb-4.5 mi:@[680px]:pl-16.5">
                    <MiText as="h3" variant="caption" weight="semibold" tone="label2" class="cwt__detail-h mi:@[680px]:[grid-area:h] mi:@[680px]:self-center">Last 3 interactions</MiText>
                    <ol class="cwt__touches mi:relative mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[680px]:[grid-area:list] mi:@[680px]:grid-cols-3 mi:@[680px]:gap-4">
                      <li v-for="(t, i) in c.touches.slice(0, 3)" :key="i" class="cwt__touch mi:grid mi:grid-cols-[28px_minmax(0,_1fr)] mi:items-start mi:gap-2.5">
                        <span class="cwt__touch-ico mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[50%] mi:[background:var(--mi-card)] mi:text-label2 mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :data-kind="t.kind"><MiIcon :svg="glyph[t.kind]" :size="14" /></span>
                        <span class="cwt__touch-text mi:grid mi:gap-px mi:min-w-0">
                          <MiText variant="footnote" weight="medium">{{ t.note }}</MiText>
                          <MiText variant="caption" tone="label2" tabular>{{ t.when }} · {{ kindName[t.kind] }} · {{ t.by }}</MiText>
                        </span>
                      </li>
                    </ol>
                    <div class="cwt__detail-act mi:flex mi:@[680px]:[grid-area:act]">
                      <MiButton size="small" variant="tinted" @click="logTouch(c)">
                        <template #leading><MiIcon class="mi:[.cwt__table_tfoot_tr&]:justify-between mi:[.cwt__table_tfoot_th&]:text-label2 mi:[.cwt__table_tfoot_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:top-0 mi:@[680px]:[.cwt__table_thead_th&]:z-2 mi:@[680px]:[.cwt__table_thead_th&]:border-b mi:@[680px]:[.cwt__table_thead_th&]:border-b-sep mi:@[680px]:[.cwt__table_thead_th&]:tracking-[.05em] mi:@[680px]:[.cwt__table_thead_th&]:uppercase mi:@[680px]:[.cwt__table_thead_th&]:text-(--cwt-t3) mi:@[680px]:[.cwt__table_thead_th&]:text-start mi:@[680px]:[.cwt__table_thead_th&]:whitespace-nowrap mi:@[680px]:[.cwt__table_tfoot_th&]:bottom-0 mi:@[680px]:[.cwt__table_tfoot_td&]:bottom-0" name="plus" :size="14" /></template>
                        Log a call
                      </MiButton>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>

        <tbody v-if="!groups.length">
          <tr><td colspan="6" class="cwt__none mi:block mi:py-8 mi:px-4 mi:text-center mi:text-label2">No contact matches this search.</td></tr>
        </tbody>

        <tfoot>
          <tr class="mi:[.cwt__table_tfoot_tr&]:justify-between">
            <th class="mi:[.cwt__table_tfoot_th&]:text-label2 mi:[.cwt__table_tfoot_th&]:text-start mi:@[680px]:[.cwt__table_tfoot_th&]:bottom-0" scope="row" colspan="4">{{ shown.length }} contacts · {{ shown.filter(c => c.days > 10).length }} need a touch</th>
            <td class="is-num mi:[.cwt__table_&]:tabular-nums mi:@[680px]:[.cwt__table_tfoot_td&]:bottom-0">{{ money(shown.reduce((n, c) => n + c.value, 0)) }}</td>
            <td class="c-own mi:@[680px]:[.cwt__row_&]:w-16 mi:@[680px]:[.cwt__table_tfoot_td&]:bottom-0" />
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="cwt__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Kind = 'call' | 'email' | 'meeting' | 'note'
interface Touch { kind: Kind, when: string, note: string, by: string }
interface Contact { id: string, account: string, name: string, title: string, days: number, value: number, owner: string, touches: Touch[] }
interface Account { id: string, name: string, city: string, mark: string, tone: 'p' | 's' | 'n' }

const accounts: Account[] = [
  { id: 'hal', name: 'Halvorsen Freight', city: 'Oslo', mark: 'HF', tone: 'p' },
  { id: 'kes', name: 'Kestrel Robotics', city: 'Munich', mark: 'KR', tone: 's' },
  { id: 'bri', name: 'Brightwater Health', city: 'Boston', mark: 'BH', tone: 'n' },
  { id: 'qui', name: 'Quinta Hotels', city: 'Lisbon', mark: 'QH', tone: 'p' },
  { id: 'mar', name: 'Marlow & Finch', city: 'London', mark: 'MF', tone: 'n' }
]

// `days` since the last touch drives warmth; touches are newest first. Sample data, swap for your CRM.
const contacts = reactive<Contact[]>([
  { id: 'c1', account: 'hal', name: 'Ingrid Halvorsen', title: 'Chief Operating Officer', days: 1, value: 84_000, owner: 'Priya Raman', touches: [
    { kind: 'meeting', when: 'Nov 1', note: 'Signed off the fleet rollout plan for January', by: 'Priya' },
    { kind: 'email', when: 'Oct 27', note: 'Sent the revised 3-year pricing', by: 'Priya' },
    { kind: 'call', when: 'Oct 20', note: 'Asked for SSO and audit log access', by: 'Jonas' }] },
  { id: 'c2', account: 'hal', name: 'Marius Dahl', title: 'Head of Operations', days: 6, value: 22_000, owner: 'Priya Raman', touches: [
    { kind: 'call', when: 'Oct 27', note: 'Wants depot managers trained before go-live', by: 'Priya' },
    { kind: 'email', when: 'Oct 14', note: 'Shared the onboarding checklist', by: 'Camille' },
    { kind: 'meeting', when: 'Oct 2', note: 'Site visit at the Alnabru terminal', by: 'Priya' }] },
  { id: 'c3', account: 'hal', name: 'Sofie Berg', title: 'Procurement Lead', days: 19, value: 0, owner: 'Jonas Weber', touches: [
    { kind: 'email', when: 'Oct 14', note: 'Requested the security questionnaire', by: 'Jonas' },
    { kind: 'note', when: 'Oct 9', note: 'Prefers invoices quarterly, in NOK', by: 'Jonas' },
    { kind: 'call', when: 'Sep 30', note: 'Intro call, vendor onboarding steps', by: 'Jonas' }] },
  { id: 'c4', account: 'kes', name: 'Mei Chen', title: 'CTO', days: 0, value: 120_000, owner: 'Camille Durand', touches: [
    { kind: 'call', when: 'Today', note: 'Agreed on a pilot with two robot lines', by: 'Camille' },
    { kind: 'meeting', when: 'Oct 24', note: 'Architecture review with their platform team', by: 'Camille' },
    { kind: 'email', when: 'Oct 18', note: 'Sent the API rate-limit proposal', by: 'Jonas' }] },
  { id: 'c5', account: 'kes', name: 'Felix Brandt', title: 'Engineering Manager', days: 9, value: 18_000, owner: 'Camille Durand', touches: [
    { kind: 'email', when: 'Oct 24', note: 'Follow-up on webhook retries', by: 'Camille' },
    { kind: 'call', when: 'Oct 11', note: 'Walked through the staging setup', by: 'Jonas' },
    { kind: 'note', when: 'Oct 3', note: 'Champion, but no budget authority', by: 'Camille' }] },
  { id: 'c6', account: 'kes', name: 'Olu Adeyemi', title: 'Finance Director', days: 44, value: 0, owner: 'Camille Durand', touches: [
    { kind: 'email', when: 'Sep 19', note: 'Sent the annual prepay discount', by: 'Camille' },
    { kind: 'meeting', when: 'Sep 5', note: 'Budget cycle closes mid-December', by: 'Camille' },
    { kind: 'call', when: 'Aug 22', note: 'Intro from Mei Chen', by: 'Camille' }] },
  { id: 'c7', account: 'bri', name: 'Dana Whitfield', title: 'VP Clinical Operations', days: 3, value: 64_000, owner: 'Jonas Weber', touches: [
    { kind: 'meeting', when: 'Oct 30', note: 'Demo for the night-shift coordinators', by: 'Jonas' },
    { kind: 'email', when: 'Oct 21', note: 'Shared the HIPAA addendum', by: 'Jonas' },
    { kind: 'call', when: 'Oct 8', note: 'Scoped three pilot wards', by: 'Priya' }] },
  { id: 'c8', account: 'bri', name: 'Rahul Iyer', title: 'Director of IT', days: 27, value: 0, owner: 'Jonas Weber', touches: [
    { kind: 'email', when: 'Oct 6', note: 'Asked about on-prem SAML and SCIM', by: 'Jonas' },
    { kind: 'call', when: 'Sep 24', note: 'Security review kickoff', by: 'Jonas' },
    { kind: 'note', when: 'Sep 12', note: 'Blocks anything without SOC 2 Type II', by: 'Priya' }] },
  { id: 'c9', account: 'qui', name: 'Beatriz Lopes', title: 'Revenue Director', days: 13, value: 36_000, owner: 'Priya Raman', touches: [
    { kind: 'call', when: 'Oct 20', note: 'Wants rate parity reports per property', by: 'Priya' },
    { kind: 'email', when: 'Oct 9', note: 'Sent case study from a Porto group', by: 'Priya' },
    { kind: 'meeting', when: 'Sep 26', note: 'Workshop at the Chiado hotel', by: 'Camille' }] },
  { id: 'c10', account: 'qui', name: 'Tiago Nunes', title: 'General Manager, Porto', days: 35, value: 9_500, owner: 'Priya Raman', touches: [
    { kind: 'email', when: 'Sep 28', note: 'Asked to delay until after high season', by: 'Priya' },
    { kind: 'call', when: 'Sep 15', note: 'Front-desk tablet requirements', by: 'Priya' },
    { kind: 'note', when: 'Sep 2', note: 'Reports to Beatriz from January', by: 'Priya' }] },
  { id: 'c11', account: 'mar', name: 'Eleanor Marlow', title: 'Managing Partner', days: 52, value: 48_000, owner: 'Jonas Weber', touches: [
    { kind: 'meeting', when: 'Sep 11', note: 'Partner lunch, interested in matter tracking', by: 'Jonas' },
    { kind: 'email', when: 'Aug 29', note: 'Sent the legal workspace template', by: 'Jonas' },
    { kind: 'call', when: 'Aug 14', note: 'Referral from Quinta Hotels counsel', by: 'Priya' }] }
])

const glyph: Record<Kind, string> = {
  call: '<path d="M6.5 3.5h3l1.6 4.2-2 1.3a11 11 0 0 0 5.9 5.9l1.3-2 4.2 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  email: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  meeting: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  note: '<path d="M14.5 4.5 19.5 9.5 9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'
}
const kindName: Record<Kind, string> = { call: 'Call', email: 'Email', meeting: 'Meeting', note: 'Note' }

const COLD_AFTER = 40
const warmth = (c: Contact) => Math.max(0, 1 - c.days / COLD_AFTER)
// Each strip carries its own warmth; CSS mixes the hue from it, so no color is computed in script.
const heat = (c: Contact) => ({ '--w': warmth(c).toFixed(3), '--wp': `${Math.round(warmth(c) * 100)}%` })
// Ten ticks from cold to hot; a contact lights as many as its warmth, each tick keeps its place on the scale.
const TICKS = 10
const lit = (c: Contact) => Math.ceil(warmth(c) * TICKS)
const tick = (n: number) => ({ '--t': `${Math.round(((n - 1) / (TICKS - 1)) * 100)}%` })
const band = (c: Contact) => (c.days <= 3 ? 'Hot' : c.days <= 10 ? 'Warm' : c.days <= 21 ? 'Cooling' : 'Cold')
const ago = (d: number) => (d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`)
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const money = (n: number) => fmt.format(n)

const sorts = [{ value: 'cold', label: 'Coldest first' }, { value: 'value', label: 'Value' }]
const sort = ref<string | number | null>('cold')
const query = ref('')
const coolingOnly = ref(false)
const collapsed = ref<string[]>(['mar'])
const opened = ref<string[]>(['c6'])
const announce = ref('')

const coolingCount = computed(() => contacts.filter(c => c.days > 10).length)
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return contacts.filter((c) => {
    const acc = accounts.find(a => a.id === c.account)!
    return (!coolingOnly.value || c.days > 10) && (!q || `${c.name} ${c.title} ${acc.name}`.toLowerCase().includes(q))
  })
})

const groups = computed(() => {
  const by = sort.value === 'value' ? (a: Contact, b: Contact) => b.value - a.value : (a: Contact, b: Contact) => b.days - a.days
  return accounts
    .map((a) => {
      const rows = shown.value.filter(c => c.account === a.id).sort(by)
      return { ...a, rows, value: rows.reduce((n, c) => n + c.value, 0), warm: rows.filter(c => c.days <= 10).length, coldest: Math.max(0, ...rows.map(c => c.days)) }
    })
    .filter(g => g.rows.length)
    .sort((x, y) => (sort.value === 'value' ? y.value - x.value : y.coldest - x.coldest))
})

const flip = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])
const toggleGroup = (id: string) => { collapsed.value = flip(collapsed.value, id) }
const toggleRow = (id: string) => { opened.value = flip(opened.value, id) }

function logTouch(c: Contact) {
  c.days = 0
  c.touches.unshift({ kind: 'call', when: 'Today', note: 'Logged from the accounts table', by: 'You' })
  announce.value = `Logged a call with ${c.name}. Warmth is back to hot.`
}
</script>

<style scoped>
.cwt__table thead { display: none; }
.cwt__table tbody, .cwt__table tfoot { display: block; }
.cwt__table tr { display: block; }
.cwt__table .is-num { text-align: end; }

.cwt__group th { display: block; padding: 0; font-weight: inherit; text-align: start; }
.cwt__chev { flex: none; transform: rotate(90deg); }
.cwt__group-btn[aria-expanded="false"] .cwt__chev { transform: none; }
.cwt__mark[data-tone="s"] { background: var(--mi-s-tint); color: var(--mi-s-text); }
.cwt__mark[data-tone="n"] { background: var(--mi-fill2); color: var(--mi-label); }
.cwt__group-name span, .cwt__group-name small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cwt__group-name small { font-weight: 400; }

.cwt__table .cwt__row {
  display: grid; gap: 6px 10px; padding: 10px 14px 12px 6px; border-top: 1px solid var(--mi-sep);
}
.cwt__row:hover { background: color-mix(in srgb, var(--mi-fill4) 55%, transparent); }
.cwt__row.is-open { background: color-mix(in srgb, var(--mi-p-tint) 45%, transparent); }
.cwt__row td { display: block; padding: 0; }
.cwt__row .c-val { font-weight: 600; }
.cwt__row .c-own { display: none; }
.cwt__exp:hover { color: var(--mi-label); }
.cwt__exp :deep(svg) { transform: rotate(-90deg); transition: transform var(--mi-dur-2) var(--mi-ease); }
.cwt__exp[aria-expanded="true"] { color: var(--mi-p-text); }
.cwt__exp[aria-expanded="true"] :deep(svg) { transform: none; }
.cwt__ticks i { background: var(--mi-fill3); }
.cwt__ticks i.is-on { background: color-mix(in srgb, var(--mi-orange) var(--t), var(--mi-blue)); }
.cwt__warm[data-band="Hot"] .cwt__band, .cwt__warm[data-band="Warm"] .cwt__band { color: var(--mi-orange-t); }
.cwt__warm[data-band="Cold"] .cwt__band { color: var(--mi-blue); }
.cwt__last :deep(svg) { color: var(--cwt-t3); }
.cwt__detail td { display: block; padding: 0; }
.cwt__detail-h { text-transform: uppercase; letter-spacing: .06em; }
.cwt__touch-ico[data-kind="meeting"] { color: var(--mi-p-text); }
.cwt__touch-ico[data-kind="call"] { color: var(--mi-green-t); }

.cwt__table tfoot tr { display: flex; gap: 12px; padding: 12px 14px; border-top: 1px solid var(--mi-sep); background: var(--cwt-shade); font-size: 12px; }
.cwt__table tfoot th { font-weight: 500; }
.cwt__table tfoot td { font-weight: 700; font-size: 13px; }
.cwt__table tfoot .c-own { display: none; }

@container (min-width: 680px) {
  .cwt__table thead { display: table-header-group; }
  .cwt__table tbody { display: table-row-group; }
  .cwt__table tfoot { display: table-footer-group; }
  .cwt__table tr, .cwt__table tfoot tr { display: table-row; }
  .cwt__table th, .cwt__table td { display: table-cell; }
  .cwt__table thead th {
    position: sticky; padding: 10px 12px;
    background: var(--mi-card); font-size: 11px; font-weight: 600;
  }
  .cwt__table thead th.is-num { text-align: end; }
  .cwt__group th { padding: 0; }
  .cwt__table .cwt__row { display: table-row; }
  .cwt__row td { display: table-cell; padding: 10px 12px; vertical-align: middle; }
  .cwt__row .c-exp { padding-inline: 8px 0; }
  .cwt__row .c-own { display: table-cell; }
  .cwt__detail td { display: table-cell; padding: 0; }
  .cwt__table tfoot th, .cwt__table tfoot td { position: sticky; padding: 12px; border-top: 1px solid var(--mi-sep); background: var(--cwt-shade); }
  .cwt__table tfoot th { padding-left: 20px; }
  .cwt__table tfoot .c-own { display: table-cell; }
}
</style>
