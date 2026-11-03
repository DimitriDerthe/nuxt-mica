<template>
  <section class="mi:@container mi:relative mi:grid mi:min-h-130 mi:rounded-xl mi:overflow-hidden mi:font-mi mi:text-label mi:bg-page mi:shadow-[0_0_0_1px_var(--mi-sep)]" aria-labelledby="imd-page-title">
    <!-- Faux page under the dialog -->
    <div class="mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3.5 mi:p-5" :inert="open || undefined">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
        <div>
          <MiText id="imd-page-title" variant="title3" as="h2" weight="semibold">Members</MiText>
          <MiText variant="footnote" tone="label2">Northwind Studio · {{ USED }} of {{ SEATS }} seats used</MiText>
        </div>
        <MiButton size="small" @click="reopen">Invite people</MiButton>
      </div>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-card mi:shadow-1">
        <li v-for="m in members" :key="m.name" class="mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:not-first:border-t mi:not-first:border-t-sep">
          <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
          <div class="mi:grid mi:flex-1 mi:min-w-0 mi:text-[14px]"><b>{{ m.name }}</b><span class="mi:text-label2 mi:text-[12px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ m.mail }}</span></div>
          <MiBadge variant="outline" tone="neutral" :label="m.role" />
        </li>
      </ul>
    </div>

    <Transition enter-active-class="mi:transition-opacity mi:duration-[var(--mi-dur-3)] mi:ease-mi" leave-active-class="mi:transition-opacity mi:duration-[var(--mi-dur-3)] mi:ease-mi" enter-from-class="mi:opacity-0" leave-to-class="mi:opacity-0">
      <div v-if="open" class="mi:[grid-area:1_/_1] mi:grid mi:place-items-center mi:py-5 mi:px-3.5 mi:bg-scrim">
        <MiDialog
          :model-value="true" inline variant="dialog" style="max-width: 440px"
          :title="sent ? 'Invites on their way' : 'Invite to Northwind Studio'"
        >
          <template #icon>
            <MiIcon :name="sent ? 'check' : 'people'" :size="26" />
          </template>

          <div v-if="!sent" class="mi:grid mi:gap-3.5 mi:mt-1 mi:text-start mi:text-label">
            <MiField label="Email addresses" :error="tagError" hint="Paste a list or press Return after each address">
              <MiTagInput v-model="emails" placeholder="name@company.com" :validate="isEmail" @reject="onReject" @add="tagError = ''" />
            </MiField>

            <p v-if="emails.length" class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-3.5 mi:-mt-1.5 mi:mx-0 mi:mb-0 mi:text-[12px] mi:text-label2">
              <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:bg-p mi:w-2 mi:h-2 mi:rounded-[50%]" />{{ teammates }} teammate{{ teammates === 1 ? '' : 's' }}</span>
              <span v-if="guests" class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:bg-label3 mi:w-2 mi:h-2 mi:rounded-[50%]" />{{ guests }} external guest{{ guests === 1 ? '' : 's' }}, free</span>
            </p>

            <MiField label="Role">
              <MiNativeSelect v-model="role" :options="roles" />
            </MiField>

            <!-- Seat bar: used seats, then the seats this invite would take, on one track. -->
            <div class="mi:grid mi:gap-1.5 mi:p-3 mi:rounded-md mi:bg-fill4">
              <div class="mi:flex mi:justify-between mi:gap-2">
                <MiText variant="footnote" weight="semibold" tone="label">Seats</MiText>
                <MiText variant="footnote" :tone="over > 0 ? 'red' : 'label2'" tabular>
                  {{ USED + teammates }} of {{ SEATS }}{{ over > 0 ? ` · ${over} over` : '' }}
                </MiText>
              </div>
              <div class="mi:relative mi:h-2 mi:rounded-[4px] mi:overflow-hidden mi:bg-fill3" role="meter" aria-label="Seats after this invite" :aria-valuenow="USED + teammates" aria-valuemin="0" :aria-valuemax="SEATS">
                <span class="mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] " :class="over > 0 ? 'mi:bg-red' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(1, (USED + teammates) / SEATS)})` }" />
                <span class="mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:bg-label2" :style="{ transform: `scaleX(${USED / SEATS})` }" />
              </div>
              <MiText v-if="over > 0" variant="caption" tone="red">
                Remove {{ over }} teammate{{ over === 1 ? '' : 's' }} or add seats at $12 per month each.
              </MiText>
            </div>
          </div>

          <div v-else class="mi:grid mi:gap-3.5 mi:mt-1 mi:text-start mi:text-label">
            <MiText variant="subheadline" tone="label2">
              {{ sentTo.length }} people will get an email from you with a link that expires in 7 days.
            </MiText>
            <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[14px]">
              <li class="mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:wrap-anywhere" v-for="e in sentTo" :key="e"><MiAvatar :name="e" size="xs" tone="auto" decorative />{{ e }}</li>
            </ul>
          </div>

          <template #actions>
            <div class="mi:grid mi:gap-2 mi:w-full">
              <template v-if="!sent">
                <MiButton block :disabled="!emails.length || over > 0" @click="send">
                  {{ emails.length ? `Send ${emails.length} invite${emails.length === 1 ? '' : 's'}` : 'Send invites' }}
                </MiButton>
                <MiButton variant="gray" block @click="open = false">Cancel</MiButton>
              </template>
              <MiButton v-else block @click="open = false">Done</MiButton>
            </div>
          </template>
        </MiDialog>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const SEATS = 12
const USED = 9
const DOMAIN = 'northwind.studio'

const members = [
  { name: 'Clara Mendes', mail: 'clara@northwind.studio', role: 'Owner' },
  { name: 'Yusuf Demir', mail: 'yusuf@northwind.studio', role: 'Admin' },
  { name: 'Hana Sato', mail: 'hana@northwind.studio', role: 'Member' },
  { name: 'Felix Brandt', mail: 'felix@northwind.studio', role: 'Member' },
  { name: 'Amara Diallo', mail: 'amara@northwind.studio', role: 'Member' }
]
const roles = [
  { value: 'member', label: 'Member · edit projects they join' },
  { value: 'admin', label: 'Admin · manage members and billing' },
  { value: 'viewer', label: 'Viewer · comment only' }
]

const open = ref(true)
const sent = ref(false)
const emails = ref<string[]>(['lucia@northwind.studio', 'ravi@northwind.studio', 'mo@brightpixel.agency'])
const role = ref<string | number | null>('member')
const tagError = ref('')
const sentTo = ref<string[]>([])

const isEmail = (t: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(t)
const onReject = (t: string) => { tagError.value = isEmail(t) ? `${t} is already in the list.` : `“${t}” is not an email address.` }

// External addresses join as guests and do not take a seat.
const teammates = computed(() => emails.value.filter(e => e.toLowerCase().endsWith('@' + DOMAIN)).length)
const guests = computed(() => emails.value.length - teammates.value)
const over = computed(() => Math.max(0, USED + teammates.value - SEATS))

function send() {
  sentTo.value = [...emails.value]
  sent.value = true
}
function reopen() {
  emails.value = []
  sent.value = false
  tagError.value = ''
  open.value = true
}
</script>
