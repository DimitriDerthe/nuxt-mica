<template>
  <section class="rrt mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="rrt-title">
    <header class="rrt__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rrt-title" variant="title3" as="h2" weight="semibold">Rooms · Thursday, November 5</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ freeHours }} free room-hours left today · tap a free half hour to hold it</MiText>
      </div>
      <MiSegmented v-model="minSeats" label="Minimum seats" :options="seatOptions" />
    </header>

    <!-- Rooms are rows, the day runs left to right; the track scrolls inside its own frame on narrow screens. -->
    <div class="rrt__scroll mi:overflow-x-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="Room timeline">
      <div class="rrt__grid mi:[--label:128px] mi:min-w-190 mi:pt-3 mi:pr-4 mi:pb-4 mi:pl-0 mi:@[900px]:[--label:160px]">
        <div class="rrt__axis mi:grid mi:grid-cols-20 mi:ml-(--label) mi:pb-1.5 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span v-for="h in hours" :key="h" :style="{ gridColumn: `${(h - START) * 2 + 1} / span 2` }">{{ h }}:00</span>
        </div>

        <div v-for="room in shown" :key="room.id" class="rrt__row mi:grid mi:grid-cols-[var(--label)_minmax(0,_1fr)] mi:border-t mi:border-t-sep">
          <div class="rrt__room mi:sticky mi:left-0 mi:z-3 mi:grid mi:content-center mi:pt-2.5 mi:pr-3 mi:pb-2.5 mi:pl-4 mi:[background:var(--mi-card)]">
            <span class="rrt__room-name mi:text-[14px] mi:font-semibold">{{ room.name }}</span>
            <span class="rrt__room-meta mi:text-[12px] mi:text-label2">{{ room.seats }} seats · Floor {{ room.floor }}</span>
          </div>
          <div class="rrt__track mi:grid mi:grid-cols-20 mi:relative mi:grid-rows-[52px] mi:py-1.5 mi:[background:repeating-linear-gradient(90deg,_transparent_0_calc(10%_-_1px),_var(--mi-sep)_calc(10%_-_1px)_10%)]" role="group" :aria-label="room.name">
            <span class="rrt__now mi:[.rrt__track>&]:row-[1] mi:z-2 mi:w-0.5 mi:-ml-px mi:[background:var(--mi-red)] mi:pointer-events-none" aria-hidden="true" :style="{ gridColumn: NOW_SLOT + 1 }" />
            <button
              v-for="s in freeSlots(room)" :key="s" type="button" class="rrt__free mi:[.rrt__track>&]:row-[1] mi:m-0.5 mi:[border:0] mi:rounded-sm mi:[background:var(--mi-p-tint)] mi:cursor-pointer mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:before:content-['+'] mi:before:text-[16px] mi:before:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[0]" :style="{ gridColumn: s + 1 }"
              :aria-label="`Hold ${room.name} at ${clock(s)}`" @click="hold(room.id, s)"
            />
            <button
              v-for="b in room.bookings" :key="b.id" type="button" class="rrt__booking mi:[.rrt__track>&]:row-[1] mi:z-1 mi:grid mi:content-center mi:min-w-0 mi:m-0.5 mi:py-1 mi:px-2 mi:overflow-hidden mi:text-start mi:rounded-md mi:[background:var(--mi-fill3)] mi:text-label mi:[font:inherit] mi:cursor-pointer mi:[&.is-mine]:[background:var(--mi-p-tint)] mi:[&.is-mine]:text-p-text mi:[&.is-on]:shadow-[inset_0_0_0_2px_var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
              :class="{ 'is-mine': b.mine, 'is-on': selectedId === b.id }"
              :style="{ gridColumn: `${b.from + 1} / span ${b.slots}` }" :aria-pressed="selectedId === b.id" @click="selectedId = b.id"
            >
              <span class="rrt__b-title mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ b.title }}</span>
              <span class="rrt__b-time mi:text-[11px] mi:opacity-75 mi:whitespace-nowrap mi:tabular-nums">{{ clock(b.from) }}–{{ clock(b.from + b.slots) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <footer class="rrt__detail mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:min-h-16 mi:py-3 mi:px-4 mi:rounded-lg mi:[background:var(--mi-fill4)]" aria-live="polite">
      <template v-if="selected">
        <div class="rrt__detail-text mi:grid mi:min-w-0">
          <MiText variant="subheadline" weight="semibold">{{ selected.booking.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ selected.room.name }} · {{ clock(selected.booking.from) }}–{{ clock(selected.booking.from + selected.booking.slots) }} · {{ selected.booking.owner }}</MiText>
        </div>
        <div class="rrt__detail-actions mi:flex mi:flex-wrap mi:gap-2">
          <MiButton v-if="selected.booking.mine" size="small" variant="gray" @click="extend(selected.booking)">Extend 30 min</MiButton>
          <MiButton v-if="selected.booking.mine" size="small" variant="destructive" soft @click="release(selected.room.id, selected.booking.id)">Release</MiButton>
          <MiBadge v-else tone="neutral" label="Booked by someone else" />
        </div>
      </template>
      <MiText v-else variant="footnote" tone="label2">Select a booking to see who holds it.</MiText>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Booking { id: string, title: string, owner: string, from: number, slots: number, mine?: boolean }
interface Room { id: string, name: string, seats: number, floor: number, bookings: Booking[] }

const START = 8
const SLOTS = 20 // 8:00 to 18:00 in half hours
const NOW_SLOT = 6 // 11:00
const hours = Array.from({ length: SLOTS / 2 }, (_, i) => START + i)

const seatOptions = [{ value: 0, label: 'Any' }, { value: 6, label: '6+' }, { value: 10, label: '10+' }]
const minSeats = ref<string | number | null>(0)
const selectedId = ref<string | null>('b4')

// Sample bookings in half-hour slots from 8:00; swap for your room API.
const rooms = ref<Room[]>([
  { id: 'fjord', name: 'Fjord', seats: 4, floor: 2, bookings: [
    { id: 'b1', title: 'Hiring sync', owner: 'Dana Whitfield', from: 2, slots: 2 },
    { id: 'b2', title: 'Vendor call', owner: 'Ken Osei', from: 10, slots: 3 }
  ] },
  { id: 'atlas', name: 'Atlas', seats: 8, floor: 2, bookings: [
    { id: 'b3', title: 'Sprint planning', owner: 'Lena Brooks', from: 1, slots: 4 },
    { id: 'b4', title: 'Pricing review', owner: 'You', from: 7, slots: 2, mine: true },
    { id: 'b5', title: 'Partner demo', owner: 'Omar Haddad', from: 13, slots: 2 }
  ] },
  { id: 'meridian', name: 'Meridian', seats: 12, floor: 3, bookings: [
    { id: 'b6', title: 'All hands', owner: 'People team', from: 4, slots: 3 },
    { id: 'b7', title: 'Board prep', owner: 'Sofia Lindqvist', from: 14, slots: 4 }
  ] },
  { id: 'kiln', name: 'Kiln', seats: 6, floor: 3, bookings: [
    { id: 'b8', title: 'Design crit', owner: 'Mei Tanaka', from: 6, slots: 2 }
  ] },
  { id: 'harbor', name: 'Harbor', seats: 16, floor: 4, bookings: [
    { id: 'b9', title: 'Customer workshop', owner: 'Ravi Menon', from: 2, slots: 8 }
  ] }
])

const shown = computed<Room[]>(() => rooms.value.filter(r => r.seats >= Number(minSeats.value ?? 0)))
const taken = (room: Room): Set<number> => new Set(room.bookings.flatMap(b => Array.from({ length: b.slots }, (_, i) => b.from + i)))
const freeSlots = (room: Room): number[] => {
  const busy = taken(room)
  return Array.from({ length: SLOTS }, (_, i) => i).filter(i => i >= NOW_SLOT && !busy.has(i))
}
const freeHours = computed(() => shown.value.reduce((sum, r) => sum + freeSlots(r).length, 0) / 2)

const selected = computed(() => {
  for (const room of rooms.value) {
    const booking = room.bookings.find(b => b.id === selectedId.value)
    if (booking) return { room, booking }
  }
  return null
})

const clock = (slot: number): string => `${START + Math.floor(slot / 2)}:${slot % 2 ? '30' : '00'}`

let seq = 0
function hold(roomId: string, from: number) {
  const room = rooms.value.find(r => r.id === roomId)
  if (!room) return
  const id = `hold-${++seq}`
  room.bookings.push({ id, title: 'Held by you', owner: 'You', from, slots: 1, mine: true })
  selectedId.value = id
}
function extend(b: Booking) {
  const room = rooms.value.find(r => r.bookings.includes(b))
  const end = b.from + b.slots
  if (room && end < SLOTS && !taken(room).has(end)) b.slots++
}
function release(roomId: string, id: string) {
  const room = rooms.value.find(r => r.id === roomId)
  if (room) room.bookings = room.bookings.filter(b => b.id !== id)
  selectedId.value = null
}
</script>

<style scoped>
.rrt__free:hover, .rrt__free:focus-visible { opacity: 1; }

.rrt__booking {
  border: 0;
  border-left: 3px solid var(--mi-label3);
}
.rrt__booking.is-mine { border-left-color: var(--mi-p); }
</style>
