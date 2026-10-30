<script setup lang="ts">
import { ref } from 'vue'
import type { MiContextMenuItem } from '../../app/components/Feedback/MiContextMenu.vue'
import MiActionSheet from '../../app/components/Feedback/MiActionSheet.vue'
import MiAlert from '../../app/components/Feedback/MiAlert.vue'
import MiBadge from '../../app/components/Feedback/MiBadge.vue'
import MiBanner from '../../app/components/Feedback/MiBanner.vue'
import MiContextMenu from '../../app/components/Feedback/MiContextMenu.vue'
import MiDialog from '../../app/components/Feedback/MiDialog.vue'
import MiEmptyState from '../../app/components/Feedback/MiEmptyState.vue'
import MiFbIcon from '../../app/components/Feedback/MiFbIcon.vue'
import MiNotification from '../../app/components/Feedback/MiNotification.vue'
import MiPopover from '../../app/components/Feedback/MiPopover.vue'
import MiProgress from '../../app/components/Feedback/MiProgress.vue'
import MiProgressRing from '../../app/components/Feedback/MiProgressRing.vue'
import MiSheet from '../../app/components/Feedback/MiSheet.vue'
import MiSkeleton from '../../app/components/Feedback/MiSkeleton.vue'
import MiSpinner from '../../app/components/Feedback/MiSpinner.vue'
import MiToast from '../../app/components/Feedback/MiToast.vue'
import MiToaster from '../../app/components/Feedback/MiToaster.vue'
import MiTooltip from '../../app/components/Feedback/MiTooltip.vue'
import { useMiToast } from '../../app/composables/useMiToast'

const toast = useMiToast()

const alertOpen = ref(false)
const dialogOpen = ref(false)
const sheetOpen = ref(false)
const sheetDetent = ref(0)
const actionOpen = ref(false)
const popOpen = ref(false)
const menuOpen = ref(false)
const lastAction = ref('none')

const deleteActions = [
  { id: 'cancel', label: 'Cancel', kind: 'cancel' as const },
  { id: 'delete', label: 'Delete', kind: 'destructive' as const }
]
const saveActions = [
  { id: 'save', label: 'Save', kind: 'primary' as const },
  { id: 'discard', label: 'Don’t save' },
  { id: 'cancel', label: 'Cancel', kind: 'cancel' as const }
]
const shareActions = [
  { id: 'copy', label: 'Copy link' },
  { id: 'invite', label: 'Invite people' },
  { id: 'stop', label: 'Stop sharing', kind: 'destructive' as const }
]

const showInSidebar = ref(true)
const menuItems = ref<MiContextMenuItem[]>([
  { id: 'open', label: 'Open', icon: 'eye', shortcut: '⌘O' },
  { id: 'duplicate', label: 'Duplicate', icon: 'duplicate', shortcut: '⌘D' },
  { id: 'rename', label: 'Rename', icon: 'pencil', shortcut: '↩' },
  { id: 's1', type: 'separator' },
  { id: 'move', label: 'Move to', icon: 'folder', children: [
    { id: 'docs', label: 'Documents' },
    { id: 'archive', label: 'Archive' },
    { id: 'more', label: 'Other', children: [{ id: 'desk', label: 'Desktop' }, { id: 'dl', label: 'Downloads' }] }
  ] },
  { id: 'sidebar', label: 'Show in sidebar', type: 'checkbox', checked: showInSidebar.value },
  { id: 's2', type: 'separator' },
  { id: 'trash', label: 'Move to Trash', icon: 'trash', shortcut: '⌘⌫', destructive: true }
])
function onMenu(id: string) {
  lastAction.value = id
  if (id === 'sidebar') {
    showInSidebar.value = !showInSidebar.value
    menuItems.value = menuItems.value.map(i => (i.id === 'sidebar' ? { ...i, checked: showInSidebar.value } : i))
  }
}

const alerts = ref({ info: true, ok: true })

function fireToasts() {
  toast.success('Link copied', { action: { label: 'Undo', onClick: () => toast.info('Undone') } })
}
function fireLoading() {
  toast.promise(new Promise(r => setTimeout(r, 1800)), { loading: 'Uploading 3 files…', success: 'Upload complete', error: 'Upload failed' })
}
</script>

<template>
  <div class="mi pg">
    <header class="pg-hero">
      <p class="pg-eyebrow">Mica UI Kit · 06</p>
      <h1>Feedback &amp; overlays</h1>
      <p class="pg-lead">Alerts, menus, sheets, notifications, progress and status. Interrupt only when the person must decide.</p>
    </header>

    <section class="pg-sec" aria-labelledby="h-dlg">
      <h2 id="h-dlg">Alerts &amp; dialogs</h2>
      <div class="pg-scrim">
        <MiDialog inline variant="alert" title="Delete 3 projects?" message="They move to Trash and are removed for good after 30 days." :actions="deleteActions" />
        <MiDialog inline variant="dialog" title="Save changes to “Brief”?" message="Your edits will be lost if you close without saving." icon="document" :actions="saveActions" />
        <MiActionSheet inline title="Choose how to share this project" :actions="shareActions" />
      </div>
      <p class="pg-note">Alert · dialog with stacked actions · action sheet. The safe action is never the destructive one.</p>
    </section>

    <div class="pg-grid3">
      <section class="pg-sec" aria-labelledby="h-menu">
        <h2 id="h-menu">Context menu</h2>
        <MiContextMenu inline :items="menuItems" highlighted="duplicate" label="Project" @select="onMenu" />
      </section>

      <section class="pg-sec" aria-labelledby="h-pop">
        <h2 id="h-pop">Popover &amp; tooltip</h2>
        <div class="pg-col">
          <MiPopover inline label="Members" :arrow-offset="62" :model-value="true" @update:model-value="() => {}">
            <template #trigger>
              <button type="button" class="pg-tint" style="margin-left:24px">Members</button>
            </template>
            <div class="pg-col" style="gap:12px">
              <span class="pg-strong">3 members</span>
              <span class="pg-row"><span class="pg-av" style="background:var(--mi-p);color:var(--mi-p-on)">AM</span><span class="pg-grow">Alex Martin</span><span class="pg-mute">Owner</span></span>
              <span class="pg-row"><span class="pg-av" style="background:var(--mi-s);color:var(--mi-s-on)">SR</span><span class="pg-grow">Sam Rivera</span><span class="pg-mute">Editor</span></span>
              <span class="pg-row"><span class="pg-av" style="background:var(--mi-teal);color:#fff">JL</span><span class="pg-grow">Jordan Lee</span><span class="pg-mute">Viewer</span></span>
              <button type="button" class="pg-btn">Manage access</button>
            </div>
          </MiPopover>
          <div class="pg-row" style="padding-top:18px;gap:12px">
            <MiTooltip content="Duplicate" shortcut="⌘D" placement="right" :model-value="true" @update:model-value="() => {}">
              <button type="button" class="pg-icon" aria-label="Duplicate"><MiFbIcon name="duplicate" :size="18" /></button>
            </MiTooltip>
          </div>
        </div>
      </section>

      <section class="pg-sec" aria-labelledby="h-sheet">
        <h2 id="h-sheet">Sheet</h2>
        <MiSheet inline title="New event" cancel-label="Cancel" confirm-label="Add">
          <div class="pg-col" style="gap:16px">
            <div class="pg-group">
              <div class="pg-cell">Design review</div>
              <div class="pg-cell pg-mute">Location or video call</div>
            </div>
            <div class="pg-group">
              <div class="pg-cell pg-between"><span>Starts</span><span class="pg-chip">Oct 30 · 10:00</span></div>
              <div class="pg-cell pg-between"><span>Ends</span><span class="pg-chip">11:00</span></div>
            </div>
          </div>
        </MiSheet>
      </section>
    </div>

    <div class="pg-grid2">
      <section class="pg-sec" aria-labelledby="h-ntf">
        <h2 id="h-ntf">Notifications &amp; toasts</h2>
        <div class="pg-well">
          <MiNotification title="Design review in 10 min" time="now" icon="calendar" message="Room 4 · Alex, Sam and Jordan are attending." />
          <MiNotification title="Sam Rivera commented" time="2 min ago" icon="comment" tone="secondary" message="“Can we try the secondary color on the badge?”" dismissible />
          <div class="pg-wrap" style="padding-top:8px">
            <MiToast tone="success" message="Link copied" action-label="Undo" />
            <MiToast tone="loading" variant="material" message="Uploading 3 files…" />
            <MiToast tone="error" message="Upload failed" description="Check your connection." dismissible />
            <MiToast tone="warning" variant="material" message="Low battery" />
            <MiToast message="Saved" />
          </div>
        </div>
      </section>

      <section class="pg-sec" aria-labelledby="h-bnr">
        <h2 id="h-bnr">Inline banners</h2>
        <div class="pg-col" style="gap:12px">
          <MiAlert v-model="alerts.info" tone="info" title="New sharing options" dismissible>
            You can now invite guests with view‑only access. <a href="#learn" @click.prevent>Learn more</a>
          </MiAlert>
          <MiAlert v-model="alerts.ok" tone="success" title="Payment received" message="Your plan renews on November 29." dismissible />
          <MiAlert tone="warning" title="Storage almost full" message="Free up space or upgrade to keep syncing." action-label="Manage" />
          <MiAlert tone="danger" title="Couldn’t sync “Brief”" message="Check your connection and try again." action-label="Retry" />
          <div class="pg-banners">
            <MiBanner title="Maintenance tonight" message="Sync pauses from 22:00 to 23:00." action-label="Details" dismissible />
            <MiBanner variant="solid" tone="secondary" message="Your trial ends in 3 days." action-label="Upgrade" />
            <MiBanner tone="danger" title="Offline" message="Changes will sync when you reconnect." />
          </div>
        </div>
      </section>
    </div>

    <div class="pg-grid3">
      <section class="pg-card">
        <h3>Progress bars</h3>
        <MiProgress label="Exporting video" :value="64" />
        <MiProgress
          label="Storage"
          value-text="38 of 50 GB"
          size="lg"
          :segments="[{ value: 40, label: 'Documents', tone: 'primary' }, { value: 26, label: 'Photos', tone: 'secondary' }, { value: 10, label: 'Other', tone: 'neutral' }]"
        />
        <MiProgress label="Indeterminate" size="sm" />
      </section>

      <section class="pg-card">
        <h3>Rings &amp; spinners</h3>
        <div class="pg-wrap" style="gap:24px;align-items:center">
          <MiProgressRing :value="72" label="Upload" />
          <MiProgressRing :value="45" :size="44" tone="secondary" label="Goal" />
          <MiProgressRing variant="stop" :size="28" label="Downloading" />
          <MiProgressRing :size="36" label="Syncing" />
        </div>
        <div class="pg-wrap pg-top" style="gap:28px;align-items:center;color:var(--mi-label2)">
          <MiSpinner size="md" />
          <MiSpinner size="lg" />
          <MiSpinner variant="arc" :size="28" tone="primary" />
          <span class="pg-small">Activity indicator · arc</span>
        </div>
      </section>

      <section class="pg-card">
        <h3>Skeleton</h3>
        <MiSkeleton>
          <span class="pg-row" style="gap:12px">
            <MiSkeleton variant="circle" :width="44" />
            <span class="pg-grow pg-col" style="gap:8px">
              <MiSkeleton variant="text" :height="12" width="60%" />
              <MiSkeleton variant="text" width="36%" />
            </span>
          </span>
          <MiSkeleton :height="96" :radius="14" />
          <MiSkeleton variant="text" :lines="['88%', '70%']" />
        </MiSkeleton>
      </section>
    </div>

    <div class="pg-grid2">
      <section class="pg-card" style="gap:20px">
        <h3>Badges &amp; status</h3>
        <div class="pg-wrap" style="gap:28px;align-items:center">
          <MiBadge :count="3">
            <template #target><span class="pg-tile"><MiFbIcon name="bell" :size="22" /></span></template>
          </MiBadge>
          <MiBadge :count="120" placement="top-right">
            <template #target><span class="pg-tile"><MiFbIcon name="comment" :size="22" /></span></template>
          </MiBadge>
          <MiBadge dot-only tone="success" :dot-size="12" placement="bottom-right">
            <template #target><span class="pg-tile pg-round" style="background:var(--mi-p);color:var(--mi-p-on);font-weight:700;font-size:15px">AM</span></template>
          </MiBadge>
          <MiBadge dot-only tone="primary" label="New items">
            <template #target><span class="pg-tile"><MiFbIcon name="inbox" :size="22" /></span></template>
          </MiBadge>
        </div>
        <div class="pg-wrap" style="gap:8px">
          <MiBadge variant="solid" tone="secondary">New</MiBadge>
          <MiBadge>Beta</MiBadge>
          <MiBadge tone="success" dot>Live</MiBadge>
          <MiBadge tone="warning" dot>Paused</MiBadge>
          <MiBadge tone="danger" dot>Failed</MiBadge>
          <MiBadge tone="neutral">Draft</MiBadge>
          <MiBadge variant="outline" tone="neutral">v2.4.0</MiBadge>
        </div>
      </section>

      <MiEmptyState card title="No projects yet" description="Create your first project or import one from a file to get started." primary-label="New project" secondary-label="Import" />
    </div>

    <section class="pg-sec" aria-labelledby="h-live">
      <h2 id="h-live">Live overlays</h2>
      <div class="pg-wrap" style="gap:10px">
        <button type="button" class="pg-btn" data-test="open-alert" @click="alertOpen = true">Alert</button>
        <button type="button" class="pg-btn" data-test="open-dialog" @click="dialogOpen = true">Dialog</button>
        <button type="button" class="pg-btn" data-test="open-action" @click="actionOpen = true">Action sheet</button>
        <button type="button" class="pg-btn" data-test="open-sheet" @click="sheetOpen = true">Sheet</button>
        <MiPopover v-model="popOpen" label="Quick info" placement="bottom-start">
          <template #trigger><button type="button" class="pg-btn" data-test="open-popover">Popover</button></template>
          <div class="pg-col" style="gap:8px">
            <span class="pg-strong">Anchored popover</span>
            <span class="pg-mute">It flips near edges and closes on Escape.</span>
            <button type="button" class="pg-btn" @click="popOpen = false">Done</button>
          </div>
        </MiPopover>
        <MiTooltip content="Hover or focus me" shortcut="⌘K">
          <button type="button" class="pg-btn" data-test="tooltip-trigger">Tooltip</button>
        </MiTooltip>
        <button type="button" class="pg-btn" data-test="toast-ok" @click="fireToasts">Toast</button>
        <button type="button" class="pg-btn" data-test="toast-promise" @click="fireLoading">Toast promise</button>
        <button type="button" class="pg-btn" @click="toast.error('Couldn’t sync', { description: 'Check your connection.', dismissible: true, duration: 0 })">Sticky error</button>
        <button type="button" class="pg-btn" @click="toast.clear()">Clear toasts</button>
      </div>
      <MiContextMenu v-model="menuOpen" :items="menuItems" label="Project" @select="onMenu">
        <div class="pg-ctx" tabindex="0" data-test="ctx-area">Right-click, long-press or press Shift+F10 here · last action: {{ lastAction }}</div>
      </MiContextMenu>
    </section>

    <MiDialog v-model="alertOpen" title="Delete 3 projects?" message="They move to Trash and are removed for good after 30 days." :actions="deleteActions" @action="lastAction = $event" />
    <MiDialog v-model="dialogOpen" variant="dialog" title="Save changes to “Brief”?" message="Your edits will be lost if you close without saving." icon="document" :actions="saveActions" @action="lastAction = $event" />
    <MiActionSheet v-model="actionOpen" title="Choose how to share this project" :actions="shareActions" @action="lastAction = $event" />
    <MiSheet v-model="sheetOpen" v-model:detent="sheetDetent" title="New event" cancel-label="Cancel" confirm-label="Add">
      <div class="pg-col" style="gap:16px">
        <div class="pg-group"><div class="pg-cell">Design review</div><div class="pg-cell pg-mute">Location or video call</div></div>
        <div class="pg-group">
          <div class="pg-cell pg-between"><span>Starts</span><span class="pg-chip">Oct 30 · 10:00</span></div>
          <div class="pg-cell pg-between"><span>Ends</span><span class="pg-chip">11:00</span></div>
        </div>
        <p class="pg-mute">Drag the grabber to change the detent, or flick down to dismiss. Detent index: {{ sheetDetent }}</p>
      </div>
    </MiSheet>
    <MiToaster />
  </div>
</template>

<style scoped>
.pg{background:var(--mi-page);color:var(--mi-label);padding:32px 16px 96px;display:flex;flex-direction:column;gap:48px;max-width:1280px;margin:0 auto;font-family:var(--mi-font);letter-spacing:-.01em}
.pg h1{margin:0;font-size:clamp(34px,6vw,56px);line-height:1.08;font-weight:700;letter-spacing:-.035em}
.pg h2{margin:0;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-.02em}
.pg h3{margin:0;font-size:20px;font-weight:600;letter-spacing:-.015em}
.pg-hero{display:flex;flex-direction:column;gap:12px;max-width:640px}
.pg-eyebrow{margin:0;font-size:15px;font-weight:600;color:var(--mi-p-text)}
.pg-lead{margin:0;font-size:19px;line-height:28px;color:var(--mi-label2)}
.pg-sec{display:flex;flex-direction:column;gap:14px;min-width:0}
.pg-note{margin:0;font-size:13px;color:var(--mi-label2)}
.pg-scrim{border-radius:20px;background:var(--mi-scrim);padding:40px 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px;align-items:center;justify-items:center}
.pg-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:20px;align-items:start}
.pg-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:20px;align-items:start}
.pg-card{background:var(--mi-card);border-radius:20px;box-shadow:var(--mi-sh1);padding:24px;display:flex;flex-direction:column;gap:18px;min-width:0}
.pg-well{border-radius:20px;background:var(--mi-fill4);padding:20px;display:flex;flex-direction:column;gap:12px}
.pg-col{display:flex;flex-direction:column;min-width:0}
.pg-row{display:flex;align-items:center;gap:10px}
.pg-wrap{display:flex;flex-wrap:wrap;gap:12px}
.pg-top{padding-top:14px;border-top:.5px solid var(--mi-sep)}
.pg-grow{flex:1;min-width:0}
.pg-between{justify-content:space-between}
.pg-strong{font-size:15px;font-weight:600}
.pg-mute{font-size:12px;color:var(--mi-label2)}
.pg-small{font-size:13px}
.pg-av{width:28px;height:28px;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none}
.pg-btn{height:32px;padding:0 14px;border:0;border-radius:8px;background:var(--mi-fill3);color:var(--mi-label);font-size:14px;font-weight:500}
.pg-btn:active{background:var(--mi-fill2)}
.pg-tint{height:32px;padding:0 12px;border:0;border-radius:8px;background:var(--mi-p-tint);color:var(--mi-p-text);font-size:14px;font-weight:600;align-self:flex-start}
.pg-icon{width:36px;height:32px;border:0;border-radius:8px;background:var(--mi-fill3);color:var(--mi-label);display:flex;align-items:center;justify-content:center}
.pg-group{border-radius:12px;background:var(--mi-fill4);padding:0 14px}
.pg-cell{min-height:46px;display:flex;align-items:center;font-size:17px}
.pg-cell+.pg-cell{border-top:.5px solid var(--mi-sep)}
.pg-chip{padding:4px 10px;border-radius:7px;background:var(--mi-fill3);font-size:15px}
.pg-tile{width:44px;height:44px;border-radius:12px;background:var(--mi-fill3);color:var(--mi-label);display:flex;align-items:center;justify-content:center}
.pg-round{border-radius:50%}
.pg-banners{display:flex;flex-direction:column;border-radius:14px;overflow:hidden;box-shadow:var(--mi-sh1)}
.pg-ctx{margin-top:16px;padding:28px 16px;border-radius:16px;border:1px dashed var(--mi-sep2);color:var(--mi-label2);font-size:14px;text-align:center;outline-offset:2px}
</style>
