<script setup lang="ts">
import { computed, ref } from 'vue'
import MiList from '../../app/components/Content/MiList.vue'
import MiListItem from '../../app/components/Content/MiListItem.vue'
import MiSwipeRow from '../../app/components/Content/MiSwipeRow.vue'
import MiCard from '../../app/components/Content/MiCard.vue'
import MiAvatar from '../../app/components/Content/MiAvatar.vue'
import MiAvatarGroup from '../../app/components/Content/MiAvatarGroup.vue'
import MiDetails from '../../app/components/Content/MiDetails.vue'
import MiTable from '../../app/components/Content/MiTable.vue'
import MiAccordion from '../../app/components/Content/MiAccordion.vue'

const themes = [
  { name: 'Light', cls: 'mi-light' },
  { name: 'Dark', cls: 'mi-dark' }
]

const previews = ref(true)

const mail = [
  { from: 'Sam Rivera', time: '09:41', subject: 'Spring campaign review', body: 'I left comments on the hero section and the pricing cards. Mostly spacing tweaks, nothing blocking.', unread: true },
  { from: 'Jordan Lee', time: 'Yesterday', subject: 'Assets for the launch', body: 'Uploaded the final icon set and the dark mode screenshots to the shared folder.', unread: true },
  { from: 'Calendar', time: 'Tue', subject: 'Design review moved', body: 'The Thursday review now starts at 10:00 in Room 4.', unread: false }
]
const swipeActions = [
  { id: 'archive', label: 'Archive', tone: 'primary' as const, icon: 'M5 9.5V18a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 18V9.5M10 13h4M5 4.5h14a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 8V6A1.5 1.5 0 015 4.5z' },
  { id: 'delete', label: 'Delete', tone: 'danger' as const, icon: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13' }
]
const swipeOpen = ref<Record<string, boolean>>({ billing: true })
const lastAction = ref('No action yet')

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'kind', label: 'Kind', muted: true },
  { key: 'size', label: 'Size', align: 'end' as const, muted: true, numeric: true },
  { key: 'date', label: 'Modified', muted: true }
]
const files = [
  { id: 'Assets', name: 'Assets', kind: 'Folder', size: '—', date: 'Yesterday, 18:02', folder: true },
  { id: 'Brand guidelines.pdf', name: 'Brand guidelines.pdf', kind: 'PDF document', size: '4.2 MB', date: 'Today, 09:41' },
  { id: 'Budget.xlsx', name: 'Budget.xlsx', kind: 'Spreadsheet', size: '86 KB', date: 'Oct 24, 2026' },
  { id: 'Hero shot.png', name: 'Hero shot.png', kind: 'PNG image', size: '2.8 MB', date: 'Oct 27, 2026' },
  { id: 'Notes.md', name: 'Notes.md', kind: 'Markdown text', size: '3 KB', date: 'Oct 20, 2026' }
]
const sort = ref<{ key: string, dir: 'asc' | 'desc' } | null>({ key: 'name', dir: 'asc' })
const selected = ref<string[]>(['Brand guidelines.pdf'])
const selLabel = computed(() => (selected.value.length ? `${selected.value.length} of ${files.length} selected` : `${files.length} items`))
const multi = ref<string[]>([])
const bigRows = Array.from({ length: 120 }, (_, i) => ({ id: String(i), name: `Item ${i + 1}`, kind: i % 2 ? 'Document' : 'Image', size: `${(i * 37) % 900} KB`, date: `Oct ${(i % 28) + 1}, 2026` }))

const faq = ref<string | null>('0')
const faqItems = [
  { value: '0', title: 'Can I change the primary color later?', content: 'Yes. Every component reads the primary and secondary from tokens, so one change restyles buttons, focus rings, selections and charts at once.' },
  { value: '1', title: 'How does dark mode pick its colors?', content: 'Backgrounds step lighter as layers rise, labels use softened whites, and accents are lightened until text reaches a 4.5:1 contrast ratio.' },
  { value: '2', title: 'Which font should I ship?', content: 'Use the system UI stack so each platform gets its native font. Everywhere else the kit falls back to Inter at the same sizes and weights.' }
]
const multiFaq = ref<string[]>(['0', '2'])

const details = [
  { key: 'owner', label: 'Owner', value: 'Alex Martin' },
  { key: 'created', label: 'Created', value: 'October 12, 2026' },
  { key: 'status', label: 'Status', value: 'In review' },
  { key: 'link', label: 'Link', value: 'Copy share link', href: '#' }
]

const group = [{ name: 'Alex Martin' }, { name: 'Sam Rivera' }, { name: 'Jordan Lee', tone: 'teal' as const }, { name: 'Casey Kim' }, { name: 'Robin Park' }, { name: 'Dana Fox' }]
</script>

<template>
  <div class="cp">
    <section v-for="th in themes" :key="th.name" :class="[th.cls, 'cp__col']" :data-theme-col="th.name">
      <header class="cp__head">
        <div>
          <p class="cp__eyebrow">Mica UI Kit</p>
          <h1 class="cp__h1">Lists &amp; content</h1>
          <p class="cp__lead">Grouped lists, cards, avatars, tables and disclosure. Content first, chrome second.</p>
        </div>
        <span class="cp__pill"><span class="cp__pdot" />{{ th.name }} appearance</span>
      </header>

      <div class="cp__two">
        <div class="cp__stack">
          <h2 class="cp__h2">Grouped list</h2>
          <MiList>
            <MiListItem variant="profile" href="#" title="Alex Martin" subtitle="Account, sharing and devices" chevron>
              <template #leading><MiAvatar name="Alex Martin" :size="56" decorative /></template>
            </MiListItem>
          </MiList>
          <MiList header="General" footer="Previews show the first line of each message on the lock screen.">
            <MiListItem href="#" title="Appearance" value="Automatic" tile="indigo" chevron>
              <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z" /></svg></template>
            </MiListItem>
            <MiListItem href="#" title="Notifications" tile="red" chevron>
              <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 004 0" /></svg></template>
              <template #trailing><span class="cp__badge">2</span></template>
            </MiListItem>
            <MiListItem title="Show previews" tile="green">
              <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg></template>
              <template #trailing>
                <button type="button" class="cp__sw" role="switch" :aria-checked="previews" aria-label="Show previews" @click="previews = !previews">
                  <span class="cp__knob" />
                </button>
              </template>
            </MiListItem>
            <MiListItem href="#" title="Language" value="English" tile="blue" chevron>
              <template #leading><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" /></svg></template>
            </MiListItem>
          </MiList>
          <MiList label="Account actions">
            <MiListItem button destructive align="center" title="Sign out" />
          </MiList>
        </div>

        <div class="cp__stack">
          <h2 class="cp__h2">Inbox list &amp; swipe actions</h2>
          <MiList footer="Unread rows carry a primary dot. Swiping reveals actions; offer the same actions in a context menu." label="Inbox">
            <MiListItem
              v-for="m in mail"
              :key="m.from"
              variant="rich"
              href="#"
              :dot="m.unread"
              :title="m.from"
              :value="m.time"
              :subtitle="m.subject"
              :description="m.body"
            />
            <MiSwipeRow v-model:open="swipeOpen.billing" :actions="swipeActions" @action="lastAction = `Triggered: ${$event}`">
              <MiListItem variant="rich" href="#" dot title="Billing" value="Mon" subtitle="Your receipt is ready" description="Download it from the account page anytime." />
            </MiSwipeRow>
          </MiList>
          <p class="cp__note" aria-live="polite">{{ lastAction }}</p>
        </div>
      </div>

      <div class="cp__stack">
        <h2 class="cp__h2">Cards</h2>
        <div class="cp__three">
          <MiCard eyebrow="Guide" title="Designing for dark mode" description="Why elevation becomes lighter, not darker, as layers stack.">
            <template #media>
              <div class="cp__cover" role="img" aria-label="Image placeholder">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.5" /><path d="M20.5 16l-5-5-8 8" /></svg>
                <span>[COVER IMAGE]</span>
              </div>
            </template>
            <template #footer><a class="cp__link" href="#">Read article ›</a></template>
          </MiCard>
          <MiCard>
            <template #header>
              <div class="cp__between"><span class="cp__plan">Pro</span><span class="cp__tag">Popular</span></div>
            </template>
            <span class="cp__price"><span class="cp__amount">[PRICE]</span><span class="cp__per">/ month</span></span>
            <ul class="cp__checks">
              <li v-for="f in ['Unlimited projects', 'Guest access and comments', 'Version history']" :key="f">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>{{ f }}
              </li>
            </ul>
            <template #footer><button type="button" class="cp__cta">Choose Pro</button></template>
          </MiCard>
          <MiCard align="center">
            <MiAvatar name="Sam Rivera" size="xl" tone="primary-soft" decorative />
            <span class="cp__who"><span class="cp__name">Sam Rivera</span><span class="cp__role">Product designer · Paris</span></span>
            <span class="cp__chips"><span class="cp__chip">Design systems</span><span class="cp__chip">Motion</span></span>
            <template #footer>
              <span class="cp__duo"><button type="button" class="cp__btn cp__btn--p">Message</button><button type="button" class="cp__btn">Follow</button></span>
            </template>
          </MiCard>
        </div>
      </div>

      <div class="cp__two">
        <MiCard padding="lg" title="Avatars">
          <div class="cp__avs">
            <MiAvatar name="Alex Martin" size="xs" />
            <MiAvatar name="Sam Rivera" size="sm" tone="secondary" />
            <MiAvatar name="Jordan Lee" size="md" tone="teal" />
            <MiAvatar size="lg" tone="neutral" alt="Unknown user" />
            <MiAvatar name="New Workspace" initials="NW" size="lg" shape="square" tone="primary-soft" />
            <MiAvatarGroup :items="group" :max="3" label="Alex, Sam, Jordan and 3 others" />
          </div>
          <span class="cp__note">24 · 32 · 44 · 64. Circles for people, rounded squares for teams and apps.</span>
        </MiCard>
        <MiCard padding="lg" title="Details">
          <MiDetails :items="details">
            <template #value-status><span class="cp__status">In review</span></template>
          </MiDetails>
        </MiCard>
      </div>

      <div class="cp__stack">
        <div class="cp__between"><h2 class="cp__h2">Table</h2><span class="cp__note">{{ selLabel }}</span></div>
        <MiTable v-model:sort="sort" v-model:selected="selected" :columns="columns" :rows="files" selectable="single" caption="Files">
          <template #cell-name="{ row }">
            <span class="cp__file">
              <svg v-if="row.folder" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="cp__folder"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10.5a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z" /><path d="M14 3.5V8h4" /></svg>
              <span class="cp__fname">{{ row.name }}</span>
            </span>
          </template>
        </MiTable>
        <span class="cp__note">Alternating rows, sortable header, selection filled with primary. Click a row or the Name header.</span>
        <h3 class="cp__h3">Multiple selection, sticky header, 120 rows</h3>
        <MiTable v-model:selected="multi" :columns="columns.map(c => ({ ...c, sortable: true }))" :rows="bigRows" selectable="multiple" max-height="260px" caption="Large table" />
      </div>

      <div class="cp__stack">
        <h2 class="cp__h2">Disclosure</h2>
        <MiAccordion v-model="faq" :items="faqItems" />
        <h3 class="cp__h3">Multiple open</h3>
        <MiAccordion v-model="multiFaq" type="multiple" :items="faqItems" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.cp{display:flex;flex-wrap:wrap;font-family:var(--mi-font);letter-spacing:-.01em}
.cp__col{flex:1 1 640px;min-width:0;display:flex;flex-direction:column;gap:56px;padding:48px clamp(16px,3vw,64px);background:var(--mi-page);color:var(--mi-label)}
.cp__head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
.cp__eyebrow{margin:0 0 12px;font-size:15px;font-weight:600;color:var(--mi-p-text)}
.cp__h1{margin:0 0 12px;font-size:clamp(36px,4vw,56px);line-height:1.07;font-weight:700;letter-spacing:-.035em}
.cp__lead{margin:0;max-width:640px;font-size:19px;line-height:28px;color:var(--mi-label2)}
.cp__pill{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 14px;border-radius:999px;background:var(--mi-fill3);font-size:13px;font-weight:600;white-space:nowrap}
.cp__pdot{width:8px;height:8px;border-radius:50%;background:var(--mi-p)}
.cp__two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:20px;align-items:start}
.cp__three{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:20px;align-items:stretch}
.cp__stack{display:flex;flex-direction:column;gap:10px;min-width:0}
.cp__h2{margin:0 0 4px;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-.02em}
.cp__h3{margin:14px 0 0;font-size:17px;font-weight:600}
.cp__note{margin:0 16px 0 0;font-size:13px;line-height:18px;color:var(--mi-label2)}
.cp__between{display:flex;justify-content:space-between;align-items:center;gap:16px}
.cp__badge{min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:var(--mi-red-t);color:#fff;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.cp__sw{position:relative;width:51px;height:31px;flex:none;border:0;border-radius:999px;padding:0;background:var(--mi-off)}
.cp__sw[aria-checked=true]{background:var(--mi-p)}
.cp__knob{position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.15),0 3px 1px rgba(0,0,0,.06);transition:transform .22s cubic-bezier(.3,.7,.4,1)}
.cp__sw[aria-checked=true] .cp__knob{transform:translateX(20px)}
.cp__cover{width:100%;height:100%;background:var(--mi-s-tint);color:var(--mi-s-text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600}
.cp__link{font-size:15px;font-weight:500;color:var(--mi-p-text);text-decoration:none}
.cp__plan{font-size:17px;font-weight:600}
.cp__tag{height:24px;padding:0 10px;border-radius:999px;background:var(--mi-s);color:var(--mi-s-on);font-size:12px;font-weight:700;display:inline-flex;align-items:center}
.cp__price{display:flex;align-items:baseline;gap:6px}
.cp__amount{font-size:40px;line-height:44px;font-weight:700;letter-spacing:-.03em}
.cp__per{font-size:15px;color:var(--mi-label2)}
.cp__checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:15px}
.cp__checks li{display:flex;gap:10px;align-items:center}
.cp__checks svg{color:var(--mi-p-text)}
.cp__cta{width:100%;height:44px;border:0;border-radius:12px;background:var(--mi-p);color:var(--mi-p-on);font-size:17px;font-weight:600}
.cp__who{display:flex;flex-direction:column;gap:2px}
.cp__name{font-size:20px;font-weight:700;letter-spacing:-.015em}
.cp__role{font-size:15px;color:var(--mi-label2)}
.cp__chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.cp__chip{height:24px;padding:0 10px;border-radius:999px;background:var(--mi-fill3);font-size:12px;font-weight:600;display:inline-flex;align-items:center}
.cp__duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}
.cp__btn{height:36px;border:0;border-radius:10px;background:var(--mi-fill3);color:var(--mi-label);font-size:15px;font-weight:600}
.cp__btn--p{background:var(--mi-p);color:var(--mi-p-on)}
.cp__avs{display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap}
.cp__status{height:24px;padding:0 10px;border-radius:999px;background:var(--mi-p-tint);color:var(--mi-p-text);font-size:12px;font-weight:600;display:inline-flex;align-items:center}
.cp__file{display:flex;align-items:center;gap:10px;font-weight:500}
.cp__file svg{color:var(--mi-label2)}
.cp__file .cp__folder{color:var(--mi-blue)}
:deep(.mi-tbl__tr--sel) .cp__file svg{color:inherit}
</style>
