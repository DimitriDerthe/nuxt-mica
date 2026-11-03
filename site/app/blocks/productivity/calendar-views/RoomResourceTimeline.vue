<template>
  <section class="rrt" aria-labelledby="rrt-title">
    <header class="rrt__head">
      <div>
        <MiText id="rrt-title" variant="title3" as="h2" weight="semibold">Rooms · Thursday, November 5</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ freeHours }} free room-hours left today · tap a free half hour to hold it</MiText>
      </div>
      <MiSegmented v-model="minSeats" label="Minimum seats" :options="seatOptions" />
    </header>

    <!-- Rooms are rows, the day runs left to right; the track scrolls inside its own frame on narrow screens. -->
    <div class="rrt__scroll" tabindex="0" aria-label="Room timeline">
      <div class="rrt__grid">
        <div class="rrt__axis" aria-hidden="true">
          <span v-for="h in hours" :key="h" :style="{ gridColumn: `${(h - START) * 2 + 1} / span 2` }">{{ h }}:00</span>
        </div>

        <div v-for="room in shown" :key="room.id" class="rrt__row">
          <div class="rrt__room">
            <span class="rrt__room-name">{{ room.name }}</span>
            <span class="rrt__room-meta">{{ room.seats }} seats · Floor {{ room.floor }}</span>
          </div>
          <div class="rrt__track" role="group" :aria-label="room.name">
            <span class="rrt__now" aria-hidden="true" :style="{ gridColumn: NOW_SLOT + 1 }" />
            <button
              v-for="s in freeSlots(room)" :key="s" type="button" class="rrt__free" :style="{ gridColumn: s + 1 }"
              :aria-label="`Hold ${room.name} at ${clock(s)}`" @click="hold(room.id, s)"
            />
            <button
              v-for="b in room.bookings" :key="b.id" type="button" class="rrt__booking"
              :class="{ 'is-mine': b.mine, 'is-on': selectedId === b.id }"
              :style="{ gridColumn: `${b.from + 1} / span ${b.slots}` }" :aria-pressed="selectedId === b.id" @click="selectedId = b.id"
            >
              <span class="rrt__b-title">{{ b.title }}</span>
              <span class="rrt__b-time">{{ clock(b.from) }}–{{ clock(b.from + b.slots) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <footer class="rrt__detail" aria-live="polite">
      <template v-if="selected">
        <div class="rrt__detail-text">
          <MiText variant="subheadline" weight="semibold">{{ selected.booking.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ selected.room.name }} · {{ clock(selected.booking.from) }}–{{ clock(selected.booking.from + selected.booking.slots) }} · {{ selected.booking.owner }}</MiText>
        </div>
        <div class="rrt__detail-actions">
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
.rrt { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.rrt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.rrt__scroll { overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rrt__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rrt__grid { --label: 128px; min-width: 760px; padding: 12px 16px 16px 0; }
.rrt__axis, .rrt__track { display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); }
.rrt__axis { margin-left: var(--label); padding-bottom: 6px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.rrt__row { display: grid; grid-template-columns: var(--label) minmax(0, 1fr); border-top: 1px solid var(--mi-sep); }

/* Room labels stay put while the day scrolls sideways. */
.rrt__room { position: sticky; left: 0; z-index: 3; display: grid; align-content: center; padding: 10px 12px 10px 16px; background: var(--mi-card); }
.rrt__room-name { font-size: 14px; font-weight: 600; }
.rrt__room-meta { font-size: 12px; color: var(--mi-label2); }

.rrt__track { position: relative; grid-template-rows: 52px; padding-block: 6px; background: repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--mi-sep) calc(10% - 1px) 10%); }
.rrt__track > * { grid-row: 1; }
.rrt__now { z-index: 2; width: 2px; margin-left: -1px; background: var(--mi-red); pointer-events: none; }
/* Free half hours stay invisible until hovered or focused, so the day reads calm. */
.rrt__free { margin: 2px; border: 0; border-radius: var(--mi-radius-s); background: var(--mi-p-tint); cursor: pointer; opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.rrt__free::before { content: "+"; font-size: 16px; color: var(--mi-p-text); }
.rrt__free:hover, .rrt__free:focus-visible { opacity: 1; }
.rrt__free:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 0; }

.rrt__booking {
  z-index: 1; display: grid; align-content: center; min-width: 0; margin: 2px; padding: 4px 8px; overflow: hidden; text-align: start;
  border: 0; border-radius: var(--mi-radius-m); background: var(--mi-fill3); color: var(--mi-label); font: inherit; cursor: pointer;
  border-left: 3px solid var(--mi-label3);
}
.rrt__booking.is-mine { background: var(--mi-p-tint); border-left-color: var(--mi-p); color: var(--mi-p-text); }
.rrt__booking.is-on { box-shadow: inset 0 0 0 2px var(--mi-p); }
.rrt__booking:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rrt__b-title { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rrt__b-time { font-size: 11px; opacity: .75; white-space: nowrap; font-variant-numeric: tabular-nums; }

.rrt__detail { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; min-height: 64px; padding: 12px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.rrt__detail-text { display: grid; min-width: 0; }
.rrt__detail-actions { display: flex; flex-wrap: wrap; gap: 8px; }

@container (min-width: 900px) { .rrt__grid { --label: 160px; } }
</style>
