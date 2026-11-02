<template>
  <section class="imd" aria-labelledby="imd-page-title">
    <!-- Faux page under the dialog -->
    <div class="imd__page" :inert="open || undefined">
      <div class="imd__page-head">
        <div>
          <MiText id="imd-page-title" variant="title3" as="h2" weight="semibold">Members</MiText>
          <MiText variant="footnote" tone="label2">Northwind Studio · {{ USED }} of {{ SEATS }} seats used</MiText>
        </div>
        <MiButton size="small" @click="reopen">Invite people</MiButton>
      </div>
      <ul class="imd__people">
        <li v-for="m in members" :key="m.name">
          <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
          <div class="imd__who"><b>{{ m.name }}</b><span>{{ m.mail }}</span></div>
          <MiBadge variant="outline" tone="neutral" :label="m.role" />
        </li>
      </ul>
    </div>

    <Transition name="imd-fade">
      <div v-if="open" class="imd__scrim">
        <MiDialog
          :model-value="true" inline variant="dialog" style="max-width: 440px"
          :title="sent ? 'Invites on their way' : 'Invite to Northwind Studio'"
        >
          <template #icon>
            <MiIcon :name="sent ? 'check' : 'people'" :size="26" />
          </template>

          <div v-if="!sent" class="imd__body">
            <MiField label="Email addresses" :error="tagError" hint="Paste a list or press Return after each address">
              <MiTagInput v-model="emails" placeholder="name@company.com" :validate="isEmail" @reject="onReject" @add="tagError = ''" />
            </MiField>

            <p v-if="emails.length" class="imd__split">
              <span><i class="is-team" />{{ teammates }} teammate{{ teammates === 1 ? '' : 's' }}</span>
              <span v-if="guests"><i class="is-guest" />{{ guests }} external guest{{ guests === 1 ? '' : 's' }}, free</span>
            </p>

            <MiField label="Role">
              <MiNativeSelect v-model="role" :options="roles" />
            </MiField>

            <!-- Seat bar: used seats, then the seats this invite would take, on one track. -->
            <div class="imd__seats">
              <div class="imd__seats-row">
                <MiText variant="footnote" weight="semibold" tone="label">Seats</MiText>
                <MiText variant="footnote" :tone="over > 0 ? 'red' : 'label2'" tabular>
                  {{ USED + teammates }} of {{ SEATS }}{{ over > 0 ? ` · ${over} over` : '' }}
                </MiText>
              </div>
              <div class="imd__track" role="meter" aria-label="Seats after this invite" :aria-valuenow="USED + teammates" aria-valuemin="0" :aria-valuemax="SEATS">
                <span class="is-new" :class="{ 'is-over': over > 0 }" :style="{ transform: `scaleX(${Math.min(1, (USED + teammates) / SEATS)})` }" />
                <span class="is-used" :style="{ transform: `scaleX(${USED / SEATS})` }" />
              </div>
              <MiText v-if="over > 0" variant="caption" tone="red">
                Remove {{ over }} teammate{{ over === 1 ? '' : 's' }} or add seats at $12 per month each.
              </MiText>
            </div>
          </div>

          <div v-else class="imd__body">
            <MiText variant="subheadline" tone="label2">
              {{ sentTo.length }} people will get an email from you with a link that expires in 7 days.
            </MiText>
            <ul class="imd__sent">
              <li v-for="e in sentTo" :key="e"><MiAvatar :name="e" size="xs" tone="auto" decorative />{{ e }}</li>
            </ul>
          </div>

          <template #actions>
            <div class="imd__actions">
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

<style scoped>
.imd { container-type: inline-size; position: relative; display: grid; min-height: 520px; border-radius: var(--mi-radius-xl); overflow: hidden; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); }
.imd__page, .imd__scrim { grid-area: 1 / 1; }
.imd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.imd__page-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.imd__people { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.imd__people li { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.imd__people li + li { border-top: 1px solid var(--mi-sep); }
.imd__who { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.imd__who span { color: var(--mi-label2); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.imd__scrim { display: grid; place-items: center; padding: 20px 14px; background: var(--mi-scrim); }
.imd-fade-enter-active, .imd-fade-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease); }
.imd-fade-enter-from, .imd-fade-leave-to { opacity: 0; }

.imd__body { display: grid; gap: 14px; margin-top: 4px; text-align: start; color: var(--mi-label); }
.imd__split { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: -6px 0 0; font-size: 12px; color: var(--mi-label2); }
.imd__split span { display: inline-flex; align-items: center; gap: 6px; }
.imd__split i { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-p); }
.imd__split i.is-guest { background: var(--mi-label3); }

.imd__seats { display: grid; gap: 6px; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.imd__seats-row { display: flex; justify-content: space-between; gap: 8px; }
.imd__track { position: relative; height: 8px; border-radius: 4px; overflow: hidden; background: var(--mi-fill3); }
.imd__track span { position: absolute; inset: 0; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.imd__track .is-used { background: var(--mi-label2); }
.imd__track .is-new { background: var(--mi-p); }
.imd__track .is-new.is-over { background: var(--mi-red); }

.imd__sent { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; font-size: 14px; }
.imd__sent li { display: flex; align-items: center; gap: 8px; min-width: 0; overflow-wrap: anywhere; }
.imd__actions { display: grid; gap: 8px; width: 100%; }
</style>
