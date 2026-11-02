<template>
  <section class="tcs" aria-labelledby="tcs-title">
    <div class="tcs__in">
    <div class="tcs__scene" :class="['is-' + colorway, { 'is-flipped': flipped, 'is-frozen': frozen }]">
      <!-- Nine invisible hover zones drive the tilt through :has(), so it is pure CSS transforms. -->
      <div class="tcs__zones" aria-hidden="true"><i v-for="n in 9" :key="n" /></div>
      <div class="tcs__tilt">
        <div class="tcs__flip">
          <div class="tcs__face tcs__front" role="img" :aria-label="`${colorLabel} card ending 7731${frozen ? ', frozen' : ''}`">
            <span class="tcs__waves" aria-hidden="true" />
            <span class="tcs__sheen" aria-hidden="true" />
            <div class="tcs__row">
              <span class="tcs__issuer">Fernhouse</span>
              <span class="tcs__kind">Virtual · Travel</span>
            </div>
            <span class="tcs__chip" aria-hidden="true" />
            <span class="tcs__number">{{ revealed ? '4000 0012 3456 7731' : '•••• •••• •••• 7731' }}</span>
            <div class="tcs__row tcs__row--end">
              <span><small>Cardholder</small>Ines Okafor</span>
              <span><small>Valid thru</small>{{ revealed ? '09/29' : '••/••' }}</span>
              <span class="tcs__network" aria-hidden="true"><i /><i /></span>
            </div>
            <span class="tcs__frost" aria-hidden="true"><MiIcon name="lock" :size="22" />Frozen</span>
          </div>
          <div class="tcs__face tcs__back" aria-hidden="true">
            <span class="tcs__stripe" />
            <span class="tcs__sign"><span>Ines Okafor</span><b>{{ revealed ? '418' : '•••' }}</b></span>
            <span class="tcs__fine">Issued for team travel. Report loss in the app, 24/7.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tcs__panel">
      <div class="tcs__panel-head">
        <MiText id="tcs-title" as="h2" variant="title3" weight="bold">Travel card</MiText>
        <MiBadge :tone="frozen ? 'neutral' : 'success'" :label="frozen ? 'Frozen' : 'Active'" dot />
      </div>

      <MiMeter :value="spent" :max="limit" label="Monthly limit" :caption="`€${spent.toLocaleString('en-IE')} spent`" :hint="`€${(limit - spent).toLocaleString('en-IE')} left of €${limit.toLocaleString('en-IE')}`" />

      <div class="tcs__actions">
        <MiButton variant="gray" size="small" :pressed="revealed" @click="revealed = !revealed">
          <template #leading><MiIcon name="eye" :size="15" /></template>
          {{ revealed ? 'Hide details' : 'Show details' }}
        </MiButton>
        <MiButton variant="gray" size="small" :pressed="flipped" @click="flipped = !flipped">{{ flipped ? 'Show front' : 'Show back' }}</MiButton>
      </div>

      <div class="tcs__row-set">
        <div class="tcs__setting">
          <div>
            <MiText id="tcs-freeze" variant="subheadline" weight="medium">Freeze card</MiText>
            <MiText variant="caption" tone="label2">Declines new payments; subscriptions keep running.</MiText>
          </div>
          <MiSwitch v-model="frozen" aria-labelledby="tcs-freeze" />
        </div>
        <div class="tcs__setting tcs__setting--col">
          <MiText id="tcs-colors" variant="subheadline" weight="medium">Card colour</MiText>
          <div class="tcs__swatches" role="radiogroup" aria-labelledby="tcs-colors">
            <button
              v-for="c in colorways" :key="c.id" type="button" role="radio" class="tcs__swatch" :class="'is-' + c.id"
              :aria-checked="colorway === c.id" :aria-label="c.label" @click="colorway = c.id"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const colorways = [{ id: 'brand', label: 'Brand' }, { id: 'dusk', label: 'Dusk' }, { id: 'graphite', label: 'Graphite' }]
const colorway = ref('brand')
const colorLabel = computed(() => colorways.find(c => c.id === colorway.value)?.label ?? '')
const revealed = ref(false)
const flipped = ref(false)
const frozen = ref(false)
const spent = 1240
const limit = 2000
</script>

<style scoped>
.tcs { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.tcs__in { display: grid; gap: 22px; align-items: center; }
@container (min-width: 740px) { .tcs__in { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 36px; } }

/* Scene and tilt */
.tcs__scene { position: relative; width: 100%; max-width: 420px; justify-self: center; perspective: 900px; --rx: 0deg; --ry: 0deg; --sx: -60%; --so: 0; }
.tcs__zones { position: absolute; inset: 0; z-index: 3; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
.tcs__scene:has(.tcs__zones i:nth-child(1):hover) { --rx: 7deg; --ry: -9deg; --sx: -40%; --so: .5; }
.tcs__scene:has(.tcs__zones i:nth-child(2):hover) { --rx: 8deg; --ry: 0deg; --sx: -10%; --so: .45; }
.tcs__scene:has(.tcs__zones i:nth-child(3):hover) { --rx: 7deg; --ry: 9deg; --sx: 20%; --so: .5; }
.tcs__scene:has(.tcs__zones i:nth-child(4):hover) { --rx: 0deg; --ry: -10deg; --sx: -35%; --so: .4; }
.tcs__scene:has(.tcs__zones i:nth-child(5):hover) { --rx: 0deg; --ry: 0deg; --sx: 0%; --so: .3; }
.tcs__scene:has(.tcs__zones i:nth-child(6):hover) { --rx: 0deg; --ry: 10deg; --sx: 35%; --so: .4; }
.tcs__scene:has(.tcs__zones i:nth-child(7):hover) { --rx: -7deg; --ry: -9deg; --sx: -20%; --so: .5; }
.tcs__scene:has(.tcs__zones i:nth-child(8):hover) { --rx: -8deg; --ry: 0deg; --sx: 10%; --so: .45; }
.tcs__scene:has(.tcs__zones i:nth-child(9):hover) { --rx: -7deg; --ry: 9deg; --sx: 40%; --so: .5; }
.tcs__tilt { transform: rotateX(var(--rx)) rotateY(var(--ry)); transform-style: preserve-3d; transition: transform var(--mi-dur-4) var(--mi-spring); }
.tcs__flip { position: relative; aspect-ratio: 1.586; transform-style: preserve-3d; transition: transform 600ms var(--mi-spring); }
.tcs__scene.is-flipped .tcs__flip { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) { .tcs__tilt { transform: none; } .tcs__flip { transition: none; } }

/* Faces */
.tcs__face {
  position: absolute; inset: 0; display: grid; overflow: hidden; border-radius: 18px; isolation: isolate;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  color: var(--tcs-ink); background: var(--tcs-bg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--tcs-ink) 14%, transparent), 0 24px 44px -22px color-mix(in srgb, var(--mi-label) 60%, transparent);
}
.tcs__scene { --tcs-ink: var(--mi-p-on); --tcs-bg: linear-gradient(140deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 45%, var(--mi-s)) 70%, var(--mi-s)); }
.tcs__scene.is-dusk { --tcs-ink: var(--mi-s-on); --tcs-bg: linear-gradient(150deg, color-mix(in srgb, var(--mi-purple) 80%, var(--mi-label)), var(--mi-pink) 80%); }
.tcs__scene.is-graphite { --tcs-ink: var(--mi-page); --tcs-bg: linear-gradient(150deg, var(--mi-label), color-mix(in srgb, var(--mi-label) 70%, var(--mi-label2))); }

.tcs__front { grid-template-rows: auto 1fr auto auto; gap: 8px; padding: clamp(14px, 5cqi, 22px); }
.tcs__waves { position: absolute; inset: 0; z-index: -1; opacity: .5; background: repeating-radial-gradient(circle at 110% 120%, transparent 0 14px, color-mix(in srgb, var(--tcs-ink) 16%, transparent) 14px 15px); }
.tcs__sheen { position: absolute; inset: -20% -40%; z-index: 2; pointer-events: none; opacity: var(--so); background: linear-gradient(105deg, transparent 35%, color-mix(in srgb, var(--mi-card) 55%, transparent) 50%, transparent 65%); transform: translateX(var(--sx)); transition: transform var(--mi-dur-4) var(--mi-spring), opacity var(--mi-dur-3) var(--mi-ease); }
.tcs__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.tcs__issuer { font-weight: 800; font-size: 17px; letter-spacing: -.02em; }
.tcs__kind { font-size: 11px; font-weight: 600; opacity: .8; }
.tcs__chip { align-self: center; width: 42px; height: 32px; border-radius: 7px; background: linear-gradient(135deg, color-mix(in srgb, var(--mi-yellow) 70%, var(--mi-card)), var(--mi-yellow) 60%, color-mix(in srgb, var(--mi-yellow) 70%, var(--mi-orange))); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-label) 18%, transparent); }
.tcs__number { font: 600 clamp(15px, 4.4cqi, 21px)/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; white-space: nowrap; }
.tcs__row--end { align-items: flex-end; font-size: 13px; font-weight: 600; }
.tcs__row--end small { display: block; font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
.tcs__row--end > span:nth-child(2) { margin-right: auto; }
.tcs__network { display: flex; }
.tcs__network i { width: 24px; height: 24px; border-radius: 50%; background: color-mix(in srgb, var(--tcs-ink) 80%, transparent); }
.tcs__network i + i { margin-left: -10px; background: color-mix(in srgb, var(--tcs-ink) 45%, transparent); }
.tcs__frost {
  position: absolute; inset: 0; z-index: 2; display: grid; place-content: center; justify-items: center; gap: 6px;
  font-weight: 700; color: var(--mi-label); background: color-mix(in srgb, var(--mi-card) 55%, transparent);
  -webkit-backdrop-filter: blur(6px) grayscale(1); backdrop-filter: blur(6px) grayscale(1); opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.tcs__scene.is-frozen .tcs__frost { opacity: 1; }

.tcs__back { transform: rotateY(180deg); grid-template-rows: auto auto 1fr; align-content: start; gap: 14px; padding: 22px 0; }
.tcs__stripe { height: 40px; background: color-mix(in srgb, var(--mi-label) 80%, transparent); }
.tcs__sign { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 22px; padding: 8px 12px; border-radius: 6px; background: color-mix(in srgb, var(--mi-card) 85%, transparent); color: var(--mi-label); font-size: 13px; font-style: italic; }
.tcs__sign b { font: 700 14px/1 ui-monospace, SFMono-Regular, Menlo, monospace; font-style: normal; letter-spacing: .1em; }
.tcs__fine { align-self: end; margin: 0 22px; font-size: 10px; opacity: .8; }

/* Panel */
.tcs__panel { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tcs__panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.tcs__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.tcs__row-set { display: grid; }
.tcs__setting { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 0; border-top: 1px solid var(--mi-sep); }
.tcs__setting--col { flex-wrap: wrap; }
.tcs__swatches { display: flex; gap: 10px; }
.tcs__swatch { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; box-shadow: 0 0 0 1px var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-spring); }
.tcs__swatch:hover { transform: scale(1.08); }
.tcs__swatch:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.tcs__swatch[aria-checked="true"] { box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-label); }
.tcs__swatch.is-brand { background: linear-gradient(140deg, var(--mi-p), var(--mi-s)); }
.tcs__swatch.is-dusk { background: linear-gradient(150deg, var(--mi-purple), var(--mi-pink)); }
.tcs__swatch.is-graphite { background: linear-gradient(150deg, var(--mi-label), var(--mi-label2)); }
</style>
