<script lang="ts">
// The site mounts <MiToaster position="bottom-center" /> once in app.vue, so this example drives
// that toaster through useMiToast() instead of mounting a second one (which would duplicate every toast).
export const playground = {
  controls: [] as string[],
  height: 240
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const toast = useMiToast()

function burst() {
  toast.info('Syncing 3 folders', { description: 'Design, Finance, Legal' })
  setTimeout(() => toast.success('Design is up to date'), 350)
  setTimeout(() => toast.warning('Finance has 2 conflicts', { description: 'Review them before the next sync.' }), 700)
  setTimeout(() => toast.error('Legal could not sync', { description: 'You no longer have access to this folder.' }), 1050)
}

function undoable() {
  toast.show({
    message: 'Conversation archived',
    action: { label: 'Undo', onClick: () => toast.success('Conversation restored') }
  })
}
</script>

<template>
  <div class="ex mi:grid mi:gap-3.5 mi:justify-items-center mi:w-[min(100%,_420px)] mi:text-center">
    <p class="cap mi:m-0 mi:text-[14px] mi:leading-[1.45] mi:text-label2">Toasts appear at the bottom of the window. The toaster keeps the newest three.</p>
    <div class="btns mi:flex mi:flex-wrap mi:justify-center mi:gap-2">
      <MiButton size="small" @click="toast.success('Changes saved')">Success</MiButton>
      <MiButton variant="gray" size="small" @click="toast.error('Couldn’t reach the server', { description: 'Retrying in 10 seconds.' })">Error</MiButton>
      <MiButton variant="gray" size="small" @click="undoable">With action</MiButton>
      <MiButton variant="tinted" size="small" @click="burst">Queue four</MiButton>
      <MiButton variant="plain" size="small" @click="toast.clear()">Clear all</MiButton>
    </div>
  </div>
</template>
