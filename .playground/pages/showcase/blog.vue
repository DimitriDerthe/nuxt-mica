<template>
  <div class="lantern">
    <!-- reading progress: transform only. Teleported, because the playground page wrapper is animated with a transform and would trap position: fixed -->
    <ClientOnly>
      <Teleport to="body">
        <div v-show="view === 'reader'" class="progress" aria-hidden="true">
          <div ref="barEl" class="progress-bar" />
        </div>
      </Teleport>
    </ClientOnly>

    <div class="wrap">
      <NuxtLink to="/showcase" class="back">
        <MiIcon name="arrow-left" :size="15" />
        <span>Back to showcase</span>
      </NuxtLink>

      <!-- ================= MASTHEAD ================= -->
      <header class="mast">
        <div class="mast-top">
          <span class="sc mast-issue">Vol. IV <i>·</i> No. {{ issueNo }}</span>
          <span class="sc mast-date">Sunday, 25 October 2026</span>
          <MiButton size="small" variant="bordered" class="mast-sub" @click="dialogOpen = true">Subscribe</MiButton>
        </div>
        <a href="#" class="wordmark" aria-label="The Lantern Review, front page" @click.prevent="goHome">
          <span class="wm-the">The</span> Lantern Review
        </a>
        <div class="mast-rule" aria-hidden="true" />
        <div class="mast-sub-row">
          <span class="sc">Essays on craft, science &amp; culture</span>
          <span class="sc mast-since">Published Sundays since 2023</span>
        </div>
      </header>

      <Transition name="view" mode="out-in" @after-leave="onAfterLeave" @after-enter="onAfterEnter">
        <!-- ================= FRONT PAGE ================= -->
        <div v-if="view === 'home'" key="home" class="home">
          <section class="front" aria-label="This issue">
            <a class="lead" :href="'#' + featured.slug" @click.prevent="open(featured)">
              <figure class="lead-art">
                <Cover :art="featured.art" />
              </figure>
              <div class="lead-text">
                <p class="kicker"><span>Cover essay</span><i>·</i>{{ featured.topic }}</p>
                <h2 class="lead-title">{{ featured.title }}</h2>
                <div class="lead-foot">
                  <p class="lead-dek">{{ featured.dek }}</p>
                  <p class="byline">By <b>{{ featured.author.name }}</b><i>·</i><span class="num">{{ featured.minutes }}</span> min read</p>
                </div>
              </div>
            </a>

            <aside class="issue" aria-labelledby="issue-h">
              <h2 id="issue-h" class="col-head"><span>Also in this issue</span><span class="num">No. {{ issueNo }}</span></h2>
              <ol class="issue-list">
                <li v-for="(a, i) in alsoInIssue" :key="a.slug">
                  <a class="issue-item" :href="'#' + a.slug" @click.prevent="open(a)">
                    <span class="issue-n num" aria-hidden="true">{{ String(i + 2).padStart(2, '0') }}</span>
                    <span class="issue-body">
                      <span class="kicker">{{ a.topic }}</span>
                      <span class="issue-title">{{ a.title }}</span>
                      <span class="issue-dek">{{ a.dek }}</span>
                      <span class="byline">{{ a.author.name }}<i>·</i><span class="num">{{ a.minutes }}</span> min</span>
                    </span>
                  </a>
                </li>
              </ol>
              <div class="editor">
                <p class="kicker">From the editor</p>
                <p class="editor-copy">This week, three writers on the things that work best when nobody notices them: a settings screen, a boatyard ruler, a retry that does no harm. Read slowly. It will keep.</p>
                <p class="editor-sign">Clara Vos, <span class="sc">Editor</span></p>
              </div>
            </aside>
          </section>

          <!-- ================= ARCHIVE ================= -->
          <section class="archive" aria-labelledby="arch-h">
            <div class="arch-head">
              <h2 id="arch-h" class="arch-title">{{ filtering ? 'Search the archive' : 'From past issues' }}</h2>
              <p class="arch-count num" aria-live="polite">
                {{ feed.length }} {{ feed.length === 1 ? 'essay' : 'essays' }}<template v-if="topic !== 'All'"> in {{ topic }}</template><template v-if="query.trim()"> matching “{{ query.trim() }}”</template>
              </p>
            </div>

            <div class="tools" role="search">
              <div class="chips" role="group" aria-label="Topics">
                <MiChip
                  v-for="t in topics"
                  :key="t"
                  :label="t"
                  size="small"
                  tone="neutral"
                  selectable
                  :model-value="topic === t"
                  @update:model-value="topic = t"
                />
              </div>
              <div class="tools-end">
                <MiSearch
                  v-model="query"
                  class="search"
                  size="compact"
                  shortcut="⌘K"
                  hotkey="k"
                  placeholder="Search titles, authors"
                  aria-label="Search the archive"
                />
                <MiSegmented
                  v-model="layout"
                  class="layout-toggle"
                  label="Layout"
                  :options="[
                    { value: 'grid', icon: 'grid', ariaLabel: 'Grid layout' },
                    { value: 'list', icon: 'list', ariaLabel: 'List layout' }
                  ]"
                />
              </div>
            </div>

            <MiEmptyState
              v-if="!feed.length"
              class="empty"
              icon="search"
              title="Nothing in the archive matches"
              description="Try a shorter phrase or another topic, or clear the filters to see every essay."
              primary-label="Clear filters"
              @primary="clearFilters"
            />

            <TransitionGroup v-else name="tile" tag="div" class="feed" :class="'is-' + layout">
              <a
                v-for="(a, i) in feed"
                :key="a.slug"
                class="entry"
                :class="{ 'is-wide': layout === 'grid' && i === 0 && feed.length > 2 }"
                :href="'#' + a.slug"
                @click.prevent="open(a)"
              >
                <span class="entry-art"><Cover :art="a.art" /></span>
                <span class="entry-body">
                  <span class="kicker">{{ a.topic }}<i>·</i><span class="num">No. {{ a.issue }}</span></span>
                  <span class="entry-title">{{ a.title }}</span>
                  <span class="entry-dek">{{ a.dek }}</span>
                  <span class="byline">{{ a.author.name }}<i>·</i>{{ a.date }}<i>·</i><span class="num">{{ a.minutes }}</span> min</span>
                </span>
              </a>
            </TransitionGroup>
          </section>

          <!-- ================= SUBSCRIPTION CARD ================= -->
          <section class="sub" aria-labelledby="sub-h">
            <div class="sub-card">
              <div class="sub-main">
                <div class="sub-top">
                  <span class="sc">Subscription card</span>
                  <span class="sc num">Nº 018 402</span>
                </div>
                <h2 id="sub-h" class="sub-title">One good essay, every Sunday morning.</h2>
                <p class="sub-copy">No tracking pixels, no “you might also like”. The week’s best piece arrives at 7 a.m., while the coffee is still hot.</p>
                <form class="sub-form" novalidate @submit.prevent="subscribeInline">
                  <MiField label="Email address" :error="inlineError">
                    <div class="sub-row">
                      <MiInput v-model="inlineEmail" type="email" placeholder="you@example.com" autocomplete="email" @update:model-value="inlineError = ''" />
                      <MiButton type="submit" size="regular">Subscribe</MiButton>
                    </div>
                  </MiField>
                </form>
                <dl class="sub-terms">
                  <div><dt>Price</dt><dd>Free</dd></div>
                  <div><dt>Frequency</dt><dd class="num">52 issues a year</dd></div>
                  <div><dt>Readers</dt><dd class="num">18,400</dd></div>
                </dl>
              </div>
              <div class="sub-stub" aria-hidden="true">
                <svg class="seal" viewBox="0 0 120 120">
                  <defs><path :id="sealId" d="M 60 60 m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0" /></defs>
                  <g class="seal-ring">
                    <text class="seal-text"><textPath :href="'#' + sealId" textLength="282" lengthAdjust="spacing">THE LANTERN REVIEW · EST. 2023 · </textPath></text>
                  </g>
                  <circle cx="60" cy="60" r="33" class="seal-in" />
                  <path d="M52 44 a8 8 0 0 1 16 0" class="seal-line" />
                  <rect x="48" y="46" width="24" height="30" rx="5" class="seal-body" />
                  <ellipse cx="60" cy="62" rx="4.2" ry="7" class="seal-flame" />
                  <path d="M46 80 h28" class="seal-line" />
                </svg>
                <span class="sc stub-label">Admit one reader</span>
              </div>
            </div>
          </section>
        </div>

        <!-- ================= READER ================= -->
        <div v-else :key="'r-' + cur.slug" class="reader">
          <nav class="r-top" aria-label="Article">
            <a href="#" class="r-home" @click.prevent="goHome">
              <MiIcon name="arrow-left" :size="15" />
              <span>Front page</span>
            </a>
            <span class="sc r-crumb">{{ cur.topic }} <i>·</i> <span class="num">No. {{ cur.issue }}</span></span>
          </nav>

          <header class="r-head">
            <p class="kicker">{{ cur.topic }}<template v-if="cur === featured"><i>·</i>Cover essay</template></p>
            <h1 class="r-title">{{ cur.title }}</h1>
            <p class="r-dek">{{ cur.dek }}</p>
            <div class="r-meta">
              <div class="r-by">
                <MiAvatar :name="cur.author.name" tone="auto" size="sm" decorative />
                <p class="byline">By <b>{{ cur.author.name }}</b><i>·</i>{{ cur.date }}<i>·</i><span class="num">{{ cur.minutes }}</span> min read</p>
              </div>
              <div class="r-actions">
                <MiIconButton
                  :label="liked.has(cur.slug) ? 'Remove like' : 'Like this essay'"
                  variant="gray"
                  size="regular"
                  :pressed="liked.has(cur.slug)"
                  @click="toggleLike"
                >
                  <MiIcon name="heart" :size="17" :filled="liked.has(cur.slug)" />
                </MiIconButton>
                <span class="like-n num">{{ likeCount }}</span>
                <MiIconButton
                  :label="saved.has(cur.slug) ? 'Remove bookmark' : 'Bookmark this essay'"
                  variant="gray"
                  size="regular"
                  :pressed="saved.has(cur.slug)"
                  @click="toggleSave"
                >
                  <MiIcon name="bookmark" :size="17" :filled="saved.has(cur.slug)" />
                </MiIconButton>
                <MiMenu aria-label="Share this essay" placement="bottom-end" :items="shareItems" @select="onShare">
                  <template #trigger="{ props }">
                    <MiIconButton v-bind="props" label="Share this essay" variant="gray" size="regular">
                      <MiIcon name="share" :size="17" />
                    </MiIconButton>
                  </template>
                </MiMenu>
              </div>
            </div>
          </header>

          <figure class="r-cover">
            <div class="r-cover-art"><Cover :art="cur.art" /></div>
            <figcaption class="cap"><span class="sc">Cover</span> {{ cur.cover }}</figcaption>
          </figure>

          <div class="r-grid">
            <aside class="toc" aria-label="Table of contents">
              <div class="toc-in">
                <p class="kicker">In this essay</p>
                <ol>
                  <li v-for="(s, i) in cur.sections" :key="s.h">
                    <a :href="'#s' + i" :class="{ on: activeSection === i }" :aria-current="activeSection === i ? 'location' : undefined" @click.prevent="jump(i)">
                      <span class="toc-n">{{ roman(i + 1) }}</span>{{ s.h }}
                    </a>
                  </li>
                </ol>
                <p class="toc-left"><span class="num">{{ minLeft }}</span> min left</p>
              </div>
            </aside>

            <article ref="proseEl" class="article">
              <details class="toc-m">
                <summary>
                  <span class="kicker">In this essay</span>
                  <span class="toc-m-n num">{{ cur.sections.length }} parts</span>
                  <MiIcon name="chevron-down" :size="15" class="toc-m-chev" />
                </summary>
                <ol>
                  <li v-for="(s, i) in cur.sections" :key="s.h">
                    <a :href="'#s' + i" @click.prevent="jump(i)"><span class="toc-n">{{ roman(i + 1) }}</span>{{ s.h }}</a>
                  </li>
                </ol>
              </details>

              <div class="prose">
                <section v-for="(s, i) in cur.sections" :key="s.h" class="sec">
                  <p class="sec-n" aria-hidden="true">{{ roman(i + 1) }}</p>
                  <h2 :id="'s' + i" class="sec-h">{{ s.h }}</h2>
                  <p
                    v-for="(p, j) in s.p"
                    :key="j"
                    :class="{ lede: i === 0 && j === 0, last: i === cur.sections.length - 1 && j === s.p.length - 1 }"
                  >{{ p }}</p>
                  <blockquote v-if="s.quote" class="pull">
                    <p>{{ s.quote }}</p>
                  </blockquote>
                  <figure v-if="i === 1" class="plate">
                    <div class="plate-art"><Cover :art="cur.art" mode="plate" /></div>
                    <figcaption class="cap"><span class="sc">Plate I.</span> Construction drawing. {{ cur.plate }}</figcaption>
                  </figure>
                </section>
              </div>

              <footer class="author">
                <MiAvatar :name="cur.author.name" tone="auto" size="lg" decorative />
                <div class="author-body">
                  <p class="kicker">About the author</p>
                  <p class="author-name">{{ cur.author.name }}</p>
                  <p class="author-bio">{{ cur.author.bio }}</p>
                  <p class="byline"><span class="num">{{ essaysBy(cur) }}</span> {{ essaysBy(cur) === 1 ? 'essay' : 'essays' }} in The Lantern Review</p>
                </div>
              </footer>

              <section class="letters" aria-labelledby="c-title">
                <div class="letters-head">
                  <h2 id="c-title" class="letters-title">Letters</h2>
                  <span class="sc num">{{ thread.length }} {{ thread.length === 1 ? 'reply' : 'replies' }}</span>
                </div>
                <form class="c-form" @submit.prevent="postComment">
                  <MiTextarea v-model="draft" :rows="3" :max-rows="8" :maxlength="600" counter aria-label="Write a letter to the author" placeholder="Write to the author. Letters are read by a person before they appear." />
                  <div class="c-actions">
                    <MiButton type="submit" size="regular" :disabled="!draft.trim()">Post letter</MiButton>
                  </div>
                </form>
                <TransitionGroup name="tile" tag="ul" class="c-list">
                  <li v-for="c in thread" :key="c.id" class="c-item">
                    <MiAvatar :name="c.name" tone="auto" size="sm" decorative />
                    <div class="c-main">
                      <p class="c-who"><b>{{ c.name }}</b><span class="sc">{{ c.place }}</span><span class="c-when">{{ c.when }}</span></p>
                      <p class="c-body">{{ c.text }}</p>
                    </div>
                  </li>
                </TransitionGroup>
              </section>
            </article>
          </div>

          <section class="next" aria-labelledby="next-h">
            <div class="col-head next-head">
              <h2 id="next-h">Read next</h2>
              <button type="button" class="r-sub-link" @click="dialogOpen = true">Get one essay every Sunday</button>
            </div>
            <div class="next-grid">
              <a v-for="a in related" :key="a.slug" class="next-item" :href="'#' + a.slug" @click.prevent="open(a)">
                <span class="next-art"><Cover :art="a.art" /></span>
                <span class="kicker">{{ a.topic }}<i>·</i><span class="num">No. {{ a.issue }}</span></span>
                <span class="next-title">{{ a.title }}</span>
                <span class="byline">{{ a.author.name }}<i>·</i><span class="num">{{ a.minutes }}</span> min</span>
              </a>
            </div>
          </section>
        </div>
      </Transition>

      <footer class="colophon">
        <span class="wm-small"><span class="wm-the">The</span> Lantern Review</span>
        <span class="sc">Set in the system serif · Edited in Gothenburg and Lisbon · © 2026</span>
      </footer>
    </div>

    <!-- newsletter dialog -->
    <MiDialog
      v-model="dialogOpen"
      variant="dialog"
      icon="bell"
      title="Subscribe to The Lantern Review"
      :close-on-action="false"
      @close="resetDialog"
    >
      <form class="nl" novalidate @submit.prevent="subscribe">
        <p class="nl-copy">One essay each Sunday at 7 a.m. Free, and one click to leave.</p>
        <MiField label="Email address" :error="emailError" required>
          <MiInput v-model="email" type="email" placeholder="you@example.com" autocomplete="email" @update:model-value="emailError = ''" />
        </MiField>
        <button type="submit" hidden />
      </form>
      <template #actions>
        <MiButton block size="large" @click="subscribe">Subscribe</MiButton>
        <MiButton block variant="plain" @click="dialogOpen = false">Not now</MiButton>
      </template>
    </MiDialog>

    <MiToaster />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, useId, type VNode } from 'vue'

useHead({ title: 'The Lantern Review · Mica showcase' })

/* ---------- generative cover art: layered SVG built from brand tokens ---------- */
type Part = VNode | VNode[]
const Cover = defineComponent({
  props: {
    art: { type: Number, required: true },
    mode: { type: String, default: 'cover' }
  },
  setup(props) {
    const uid = useId()
    const id = (k: string) => `${uid}-${k}`
    const stop = (offset: number, color: string, opacity = 1) => h('stop', { offset, style: `stop-color:${color};stop-opacity:${opacity}` })
    const vgrad = (k: string, stops: VNode[]) => h('linearGradient', { id: id(k), x1: 0, y1: 0, x2: 0, y2: 1 }, stops)
    const bg = (fill: string) => h('rect', { width: 400, height: 300, class: 'bg', style: { fill } })
    const P = 'var(--paper)'
    const mix = (c: string, pct: number, base = P) => `color-mix(in oklab, ${c} ${pct}%, ${base})`
    const range = (n: number) => Array.from({ length: n }, (_, i) => i)

    const art: Record<number, () => Part[]> = {
      /* Design: Swiss grid, a circle and one quarter turn */
      0: () => [
        bg(P),
        range(15).map(i => h('line', { x1: 25 + i * 25, y1: 0, x2: 25 + i * 25, y2: 300, class: 'kl', 'stroke-width': 1, opacity: 0.07 })),
        range(11).map(i => h('line', { x1: 0, y1: 25 + i * 25, x2: 400, y2: 25 + i * 25, class: 'kl', 'stroke-width': 1, opacity: 0.07 })),
        h('circle', { cx: 250, cy: 135, r: 105, class: 'p' }),
        h('path', { d: 'M 250 135 L 250 30 A 105 105 0 0 1 355 135 Z', class: 's' }),
        h('circle', { cx: 250, cy: 135, r: 62, class: 'pal', 'stroke-width': 1.5, opacity: 0.55 }),
        h('rect', { x: 45, y: 52, width: 30, height: 30, class: 'k' }),
        h('rect', { x: 45, y: 184, width: 92, height: 7, class: 'k', opacity: 0.85 }),
        h('rect', { x: 45, y: 199, width: 64, height: 7, class: 'k', opacity: 0.3 }),
        h('rect', { x: 45, y: 214, width: 78, height: 7, class: 'k', opacity: 0.3 }),
        h('line', { x1: 45, y1: 246, x2: 355, y2: 246, class: 'kl', 'stroke-width': 1.5 }),
        h('circle', { cx: 165, cy: 246, r: 5, class: 'k' })
      ],
      /* Craft: nested hull ribs and a plumb line */
      1: () => [
        h('defs', [vgrad('g', [stop(0, P), stop(1, mix('var(--mi-s)', 30))])]),
        bg(`url(#${id('g')})`),
        range(13).map(i => h('line', { x1: 40 + i * 26.6, y1: 18, x2: 40 + i * 26.6, y2: i % 4 ? 26 : 34, class: 'kl', 'stroke-width': 1.2, opacity: 0.5 })),
        range(9).map((i) => {
          const r = 30 + i * 26
          const hi = i === 5
          return h('path', { d: `M ${200 - r} 300 A ${r} ${r} 0 0 1 ${200 + r} 300`, class: hi ? 'pl' : 'kl', 'stroke-width': hi ? 7 : 1.4, opacity: hi ? 1 : 0.5 })
        }),
        h('path', { d: 'M 170 300 A 30 30 0 0 1 230 300 Z', class: 'p' }),
        h('line', { x1: 200, y1: 50, x2: 200, y2: 252, class: 'kl', 'stroke-width': 1, opacity: 0.6 }),
        h('circle', { cx: 200, cy: 50, r: 4, class: 'k' }),
        h('path', { d: 'M 200 250 l 7 11 l -7 11 l -7 -11 z', class: 'k' })
      ],
      /* Science: kelp stems rising through a deepening column of water */
      2: () => [
        h('defs', [vgrad('g', [stop(0, mix('var(--mi-s)', 22)), stop(0.5, mix('var(--mi-p)', 55)), stop(1, mix('var(--mi-p)', 80, 'var(--mi-label)'))])]),
        bg(`url(#${id('g')})`),
        [30, 42, 54].map((y, k) => h('path', {
          d: `M 0 ${y} ` + range(8).map(i => `Q ${i * 50 + 25} ${y + (i % 2 ? 5 : -5)} ${i * 50 + 50} ${y}`).join(' '),
          class: 'pal', 'stroke-width': 1.5, opacity: 0.75 - k * 0.2
        })),
        range(7).map((i) => {
          const x = 38 + i * 55 + (i % 2) * 10
          const top = 92 + ((i * 37) % 70)
          return [
            h('path', { d: `M ${x} 310 C ${x + 26} 250, ${x - 24} 190, ${x + 6} ${top}`, class: 'pal', 'stroke-width': i % 3 ? 2.5 : 4, opacity: 0.85 }),
            h('ellipse', { cx: x + 12, cy: 238, rx: 11, ry: 3.6, class: 'pa', opacity: 0.55, transform: `rotate(-32 ${x + 12} 238)` }),
            h('ellipse', { cx: x - 6, cy: 186, rx: 10, ry: 3.4, class: 'pa', opacity: 0.45, transform: `rotate(28 ${x - 6} 186)` })
          ]
        }),
        [[70, 120, 3], [96, 88, 2], [252, 110, 3.5], [270, 82, 2], [346, 140, 2.5]].map(([cx, cy, r]) => h('circle', { cx, cy, r, class: 'pal', 'stroke-width': 1, opacity: 0.8 }))
      ],
      /* Technology: a dot matrix, a lost packet, a timer that ran out */
      3: () => {
        const C = 2 * Math.PI * 86
        return [
          h('defs', [h('linearGradient', { id: id('g'), x1: 0, y1: 0, x2: 1, y2: 1 }, [stop(0, P), stop(1, mix('var(--mi-p)', 16))])]),
          bg(`url(#${id('g')})`),
          range(16).map(c => range(12).map(r => h('circle', { cx: 20 + c * 24, cy: 18 + r * 24, r: 1.6, class: 'k', opacity: 0.2 }))),
          range(6).map(c => h('circle', { cx: 44 + c * 24, cy: 258 - c * 24, r: 4.5, class: 'p' })),
          h('circle', { cx: 188, cy: 114, r: 5, class: 'pl', 'stroke-width': 1.5, 'stroke-dasharray': '2 2.5' }),
          h('circle', { cx: 275, cy: 135, r: 86, class: 'kl', 'stroke-width': 1.5, 'stroke-dasharray': '3 6', opacity: 0.5 }),
          h('circle', { cx: 275, cy: 135, r: 86, class: 'pl', 'stroke-width': 16, 'stroke-dasharray': `${C * 0.82} ${C}`, transform: 'rotate(-90 275 135)' }),
          h('rect', { x: 191, y: 92, width: 12, height: 12, class: 'k' }),
          h('text', { x: 275, y: 143, 'text-anchor': 'middle', class: 'k art-num' }, '3.000 s')
        ]
      },
      /* Culture: six tins against a low sun */
      4: () => {
        const hs = [70, 84, 62, 92, 76, 66]
        return [
          h('defs', [vgrad('g', [stop(0, mix('var(--mi-s)', 32)), stop(0.75, P)])]),
          bg(`url(#${id('g')})`),
          h('circle', { cx: 200, cy: 218, r: 108, class: 's', opacity: 0.85 }),
          h('circle', { cx: 200, cy: 218, r: 72, class: 'pa', opacity: 0.22 }),
          [130, 226].map(x => h('path', { d: `M ${x} 150 c -10 -14 10 -24 0 -40 s 10 -26 0 -40`, class: 'kl', 'stroke-width': 1.6, opacity: 0.45 })),
          hs.map((hh, i) => {
            const x = 62 + i * 48
            return [
              h('rect', { x: x - 2, y: 245 - hh, width: 38, height: 6, rx: 2, class: 'k' }),
              h('rect', { x, y: 250 - hh, width: 34, height: hh, rx: 3, class: 'k', opacity: 0.9 }),
              h('rect', { x: x + 5, y: 250 - hh * 0.62, width: 24, height: 14, rx: 1, class: 'pa', opacity: 0.92 })
            ]
          }),
          h('rect', { x: 0, y: 250, width: 400, height: 50, class: 'p' }),
          h('line', { x1: 0, y1: 250, x2: 400, y2: 250, class: 'kl', 'stroke-width': 2 })
        ]
      },
      /* Craft: ruled paper, a margin, one long cursive stroke and a pencil */
      5: () => [
        bg(P),
        range(12).map(i => h('line', { x1: 0, y1: 40 + i * 22, x2: 400, y2: 40 + i * 22, class: 'pl', 'stroke-width': 1, opacity: 0.25 })),
        h('line', { x1: 64, y1: 0, x2: 64, y2: 300, class: 'sl', 'stroke-width': 1.5 }),
        [60, 150, 240].map(cy => h('circle', { cx: 30, cy, r: 7, class: 'k', opacity: 0.1 })),
        h('path', { d: 'M 92 200 C 120 120 150 96 160 140 C 168 178 140 200 150 214 C 168 236 196 150 214 128 C 232 108 246 150 236 178 C 228 200 252 214 270 182 C 288 150 300 120 318 132 C 336 146 318 196 342 196 C 356 196 366 176 376 160', class: 'kl', 'stroke-width': 5.5, 'stroke-linecap': 'round' }),
        h('g', { transform: 'rotate(-28 290 90)' }, [
          h('rect', { x: 200, y: 82, width: 150, height: 16, rx: 2, class: 'p' }),
          h('rect', { x: 340, y: 82, width: 22, height: 16, rx: 3, class: 's' }),
          h('path', { d: 'M 200 82 L 178 90 L 200 98 Z', class: 'pa' }),
          h('path', { d: 'M 200 82 L 178 90 L 200 98 Z', class: 'kl', 'stroke-width': 1, opacity: 0.4 }),
          h('path', { d: 'M 186 87 L 178 90 L 186 93 Z', class: 'k' })
        ])
      ],
      /* Science: layered tides under a moon and its orbit */
      6: () => [
        h('defs', [vgrad('g', [stop(0, mix('var(--mi-p)', 28)), stop(1, P)])]),
        bg(`url(#${id('g')})`),
        h('ellipse', { cx: 210, cy: 92, rx: 150, ry: 46, class: 'kl', 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: 0.45 }),
        h('circle', { cx: 300, cy: 74, r: 34, class: 's' }),
        h('circle', { cx: 314, cy: 66, r: 30, class: 'pa', opacity: 0.35 }),
        range(10).map(i => h('line', { x1: 14, y1: 150 + i * 14, x2: i % 2 ? 22 : 28, y2: 150 + i * 14, class: 'kl', 'stroke-width': 1.2, opacity: 0.55 })),
        range(5).map((i) => {
          const y = 162 + i * 28
          const a = 9 + i * 2
          const L = 110 + i * 18
          let d = `M -20 ${y}`
          for (let x = -20; x < 420; x += L) d += ` q ${L / 4} ${-a} ${L / 2} 0 t ${L / 2} 0`
          return h('path', { d: d + ' V 300 H -20 Z', class: 'p', opacity: [0.22, 0.38, 0.55, 0.75, 0.95][i] })
        })
      ],
      /* Technology: strata of formats, stacked in isometric slabs */
      7: () => [
        bg(P),
        range(6).map((i) => {
          const y = 226 - i * 30
          const x = 200 + (i % 2 ? 10 : -10)
          const top = ['p', 'pa', 's', 'pa', 'p', 'k'][i]!
          return [
            h('path', { d: `M ${x - 120} ${y} L ${x} ${y + 40} L ${x} ${y + 52} L ${x - 120} ${y + 12} Z`, class: 'k', opacity: 0.62 }),
            h('path', { d: `M ${x} ${y + 40} L ${x + 120} ${y} L ${x + 120} ${y + 12} L ${x} ${y + 52} Z`, class: 'k', opacity: 0.38 }),
            h('path', { d: `M ${x} ${y - 40} L ${x + 120} ${y} L ${x} ${y + 40} L ${x - 120} ${y} Z`, class: top }),
            top === 'pa' ? h('path', { d: `M ${x} ${y - 40} L ${x + 120} ${y} L ${x} ${y + 40} L ${x - 120} ${y} Z`, class: 'kl', 'stroke-width': 1, opacity: 0.5 }) : []
          ]
        }),
        range(4).map(i => h('rect', { x: 24, y: 40 + i * 12, width: 40 - i * 8, height: 4, class: 'k', opacity: 0.5 }))
      ],
      /* Design: a wayfinding pictogram, a circle and an arrow */
      8: () => [
        bg('var(--mi-p)'),
        range(34).map(i => h('line', { x1: i * 12, y1: 300, x2: i * 12 + 40, y2: 258, class: 'pal', 'stroke-width': 1.2, opacity: 0.3 })),
        h('circle', { cx: 122, cy: 140, r: 78, class: 's' }),
        h('circle', { cx: 122, cy: 140, r: 78, class: 'pal', 'stroke-width': 1.5, opacity: 0.5, 'stroke-dasharray': '1 5' }),
        h('path', { d: 'M 176 140 H 326 M 278 92 L 326 140 L 278 188', class: 'pal', 'stroke-width': 22, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }),
        h('rect', { x: 344, y: 30, width: 26, height: 26, class: 'k' })
      ]
    }

    /* plate mode shows a detail of the same composition */
    const plateBox: Record<number, string> = {
      0: '150 20 220 165', 1: '80 150 240 180', 2: '0 120 240 180', 3: '170 40 210 158', 4: '40 120 240 180',
      5: '80 60 240 180', 6: '120 40 280 210', 7: '60 60 280 210', 8: '40 50 300 225'
    }

    return () => {
      const box = props.mode === 'plate' ? plateBox[props.art] ?? '0 0 400 300' : '0 0 400 300'
      return h('div', { class: ['cover', 'cover-' + props.mode], 'aria-hidden': 'true' }, [
        h('svg', { viewBox: box, preserveAspectRatio: 'xMidYMid slice' }, [
          h('defs', [
            h('filter', { id: id('n'), x: 0, y: 0, width: '100%', height: '100%' }, [
              h('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 2, stitchTiles: 'stitch', result: 'n' }),
              h('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 -0.45', result: 'a' }),
              h('feFlood', { style: 'flood-color: var(--mi-label)', result: 'c' }),
              h('feComposite', { in: 'c', in2: 'a', operator: 'in' })
            ])
          ]),
          ...(art[props.art] ?? art[0]!)(),
          props.mode === 'plate' ? h('g', { class: 'construct' }, [...range(21).map(i => h('line', { x1: i * 20, y1: 0, x2: i * 20, y2: 300 })), ...range(16).map(i => h('line', { x1: 0, y1: i * 20, x2: 400, y2: i * 20 }))]) : [],
          h('rect', { width: 400, height: 300, filter: `url(#${id('n')})`, class: 'grain' })
        ])
      ])
    }
  }
})

/* ---------- content ---------- */
interface Section { h: string, p: string[], quote?: string }
interface Author { name: string, bio: string }
interface Article {
  slug: string, title: string, dek: string, topic: string, date: string, issue: number, minutes: number
  art: number, likes: number, cover: string, plate: string
  author: Author
  sections: Section[]
}

const authors = {
  maren: { name: 'Maren Okafor', bio: 'Maren writes about typography, interfaces and the small decisions that make objects feel considered. She edits the Design desk.' },
  tobias: { name: 'Tobias Lindqvist', bio: 'A former joiner turned journalist, Tobias covers workshops, tools and the people who still make things by hand.' },
  priya: { name: 'Priya Raman', bio: 'Priya is a marine ecologist and science writer. Her reporting follows slow, patient systems, from kelp to coastlines.' },
  elio: { name: 'Elio Marchetti', bio: 'Elio is a software engineer who writes about the quiet infrastructure under everyday technology.' },
  hana: { name: 'Hana Sato', bio: 'Hana covers food, cities and the rituals that hold neighbourhoods together. She lives above a tea shop.' },
  noor: { name: 'Noor Haddad', bio: 'Noor is a physical oceanographer in Plymouth. She spends her winters arguing with tide gauges and usually loses.' },
  ines: { name: 'Inês Carvalho', bio: 'Inês is a digital archivist at a national library, where she keeps forty years of software readable.' },
  kofi: { name: 'Kofi Mensah', bio: 'Kofi designs signage for railways and hospitals. He believes the best sign is the one you never remember reading.' }
} satisfies Record<string, Author>

const articles: Article[] = [
  {
    slug: 'the-case-for-boring-interfaces', topic: 'Design', date: '25 Oct 2026', issue: 42, minutes: 12, art: 0, likes: 214, author: authors.maren,
    cover: 'Grid study No. 42: a circle, one quarter turn, nothing else.',
    plate: 'Detail of the cover. The quarter turn is the only element that moves the eye; everything else waits.',
    title: 'The case for boring interfaces',
    dek: 'The best software disappears. Why restraint, not novelty, is the hardest thing to design.',
    sections: [
      { h: 'Delight is overrated', p: [
        'Every product team eventually asks the same question: where is the delight? The word has become a line item, something to be scheduled between the login screen and the settings page. But ask people what they remember about the tools they rely on, and they rarely mention surprise. They mention the absence of friction.',
        'A good form does not charm you. It accepts what you typed, tells you plainly what went wrong, and lets you carry on. That is not a lack of ambition. It is the result of dozens of small, unglamorous decisions made correctly.'
      ] },
      { h: 'What restraint actually costs', p: [
        'Restraint is expensive because it requires saying no to ideas that are genuinely good. An animation that would look wonderful in a portfolio can make a checkout feel slow. A custom control that is more beautiful than the native one can break for the person using a screen reader or a stylus.',
        'The discipline lies in asking what each element is doing for the person in front of it. If the honest answer is “making us look clever”, it goes.'
      ], quote: 'A boring interface is one where nothing asks for your attention except the thing you came to do.' },
      { h: 'Familiar is a feature', p: [
        'People spend most of their day in software they did not design, and they bring those expectations with them. A back button that behaves like every other back button is a gift. A date picker that follows the conventions of the platform spares someone a moment of doubt.',
        'This is not an argument against invention. It is an argument for spending it where it matters: in the clarity of the writing, the speed of the response, the care taken over an error message at the worst possible moment.'
      ] },
      { h: 'A practical test', p: [
        'Before shipping a screen, remove one thing. Then another. Stop when the task becomes harder. What remains is usually what the screen was for all along, and it tends to age far better than whatever was fashionable the month you built it.'
      ] }
    ]
  },
  {
    slug: 'kelp-forests-are-quietly-coming-back', topic: 'Science', date: '25 Oct 2026', issue: 42, minutes: 14, art: 2, likes: 342, author: authors.priya,
    cover: 'Seven stems in a column of cold water, drawn from the bay survey transects.',
    plate: 'Detail: holdfasts and the first fronds, where recovery begins one stubborn anchor at a time.',
    title: 'Kelp forests are quietly coming back',
    dek: 'After two decades of collapse, a stretch of cold coastline is recovering. Nobody planned it.',
    sections: [
      { h: 'A coastline that looked finished', p: [
        'When divers first surveyed the bay in 2009, they found what they described as an urchin barren: purple spiny animals blanketing bare rock, with almost no kelp left standing. The forest that once sheltered juvenile fish and slowed winter swells had been grazed to stubble.',
        'Barrens like this can persist for decades. Urchins are patient, and they can survive starvation in a dormant state, waiting for the next scrap of algae to drift in.'
      ] },
      { h: 'The turning point', p: [
        'The recovery began with an unglamorous event. A run of cold winters, combined with a wasting disease in sunflower star predators farther north, shifted the balance in unexpected ways, and a local fishery for spiny lobster, once overfished, began to rebound.',
        'Lobsters eat urchins. As their numbers climbed, the grazing pressure eased in patches, and kelp spores, always present in the water, finally found bare rock they could hold.'
      ], quote: 'The forest did not return all at once. It returned one stubborn holdfast at a time.' },
      { h: 'Reading the new canopy', p: [
        'Last summer the survey team recorded canopy cover at roughly a third of its historic extent, up from near zero. Fish counts inside the recovering patches were nearly four times higher than on the barren ground beside them.',
        'The team is careful about the word recovery. Warmer water could undo the gains in a single heatwave, and the forest that is growing back contains fewer species than the one that vanished.'
      ] },
      { h: 'What to do with good news', p: [
        'The lesson, the researchers argue, is less about celebration than about attention. Ecosystems can turn quickly when pressure is lifted, but only if someone is watching closely enough to notice, and funding the boring work of counting.'
      ] }
    ]
  },
  {
    slug: 'a-workshop-that-measures-in-hands', topic: 'Craft', date: '25 Oct 2026', issue: 42, minutes: 9, art: 1, likes: 163, author: authors.tobias,
    cover: 'Nine ribs of a clinker hull, set out from a single plumb line.',
    plate: 'Detail: the keel and the first frames, marked “a forearm from the keel” before any tape is allowed.',
    title: 'A workshop that still measures in hands',
    dek: 'In a Gothenburg boatyard, the apprentices learn proportion by feel before they are allowed a tape.',
    sections: [
      { h: 'The first month without a ruler', p: [
        'The boatyard sits at the end of a gravel road, between a closed fish smokehouse and the water. Inside, the smell is cedar, linseed oil and old coffee. New apprentices are given a plane, a pencil and one rule: no measuring tape for the first month.',
        'It sounds like theatre, and Anders Holm, who has run the yard for thirty-one years, admits that it partly is. But the reasoning is practical. A tape tells you the length of a plank. It does not tell you whether the curve of a hull looks right.'
      ] },
      { h: 'Learning proportion through the body', p: [
        'Holm teaches with a hand span, a forearm and a thumb joint. A plank is “two spans and a thumb”. A frame sits “a forearm from the keel”. These measures differ slightly from person to person, which is exactly the point: the apprentice calibrates to their own body, and the boat to the apprentice.',
        'By the second month, most can mark a rib within a couple of millimetres by eye. The tape is introduced as a way to check, never to decide.'
      ], quote: 'The tape confirms what the eye already knows. It should never be the first to speak.' },
      { h: 'What survives automation', p: [
        'The yard owns a CNC router, and nobody here is sentimental about it. It cuts templates faster and truer than any person could. What it cannot do is notice that a piece of oak has a grain that will twist in a year, or feel when a plank has been steamed a minute too long.',
        'That judgement, Holm says, is the actual product. The boats are merely where it lives.'
      ] },
      { h: 'A slow apprenticeship', p: [
        'There are four apprentices this year, and the waiting list is longer than the yard can honour. Holm does not plan to expand. “If we hurried,” he says, planing a long curl off a pine spar, “we would only teach people to hurry.”'
      ] }
    ]
  },
  {
    slug: 'what-a-network-timeout-teaches', topic: 'Technology', date: '25 Oct 2026', issue: 42, minutes: 8, art: 3, likes: 128, author: authors.elio,
    cover: 'Six packets, one missing, and a three-second timer that ran out first.',
    plate: 'Detail: the point where the caller stopped waiting, a few milliseconds before the answer arrived.',
    title: 'What a single network timeout teaches you',
    dek: 'Three seconds of silence between two servers, and everything you assumed about reliability.',
    sections: [
      { h: 'The request that never came back', p: [
        'The incident began with a graph that was too calm. Error rates were flat, latency looked healthy, and yet customers were reporting that payments had vanished into thin air. The cause turned out to be a single call between two services that sometimes took slightly longer than the timeout.',
        'When it did, the caller gave up and retried. The callee, which had in fact succeeded, received the retry and did the work a second time.'
      ] },
      { h: 'Silence is not failure', p: [
        'A timeout tells you only that you stopped waiting. It says nothing about whether the other side finished. Treating the two as the same is among the oldest mistakes in distributed systems, and it keeps getting made because the happy path hides it so well.',
        'The remedy is an idempotency key: a unique token the caller attaches to the request, so that a repeat can be recognised and answered with the original result rather than executed again.'
      ], quote: 'You cannot know whether a message arrived. You can only design so that asking twice is harmless.' },
      { h: 'Designing for the second attempt', p: [
        'Once you accept that retries will happen, a lot of decisions get easier. Writes become upserts. Operations are recorded before they are performed. Side effects such as sending an email are moved behind a queue that deduplicates.',
        'None of this is exotic, but it has to be done deliberately, and it is much cheaper to do on the first day than the day after an incident.'
      ] },
      { h: 'The smaller lesson', p: [
        'The team changed one more thing: they now write down, for every external call, what happens if it is slow, if it fails, and if it succeeds but the answer is lost. Three sentences per call. It is the best reliability document they own.'
      ] }
    ]
  },
  {
    slug: 'the-tea-shop-on-the-corner', topic: 'Culture', date: '18 Oct 2026', issue: 41, minutes: 7, art: 4, likes: 97, author: authors.hana,
    cover: 'Six tins on a worn counter, against the last of the afternoon.',
    plate: 'Detail: the counter, worn pale where elbows have rested for four decades.',
    title: 'The tea shop that holds a street together',
    dek: 'Mr. Aldous has sold the same six teas for forty years. The neighbourhood has rearranged itself around him.',
    sections: [
      { h: 'Six teas and a kettle', p: [
        'There is no sign over the door, only a small brass kettle hung on a bracket. Inside, six tins stand on a shelf, each with a handwritten label, and a long counter worn pale where elbows have rested for four decades.',
        'The owner, Mr. Aldous, has never added a seventh tea. Asked why, he considers the question for some time. “Six is enough to choose from,” he says. “Seven is a decision.”'
      ] },
      { h: 'A place with no agenda', p: [
        'What the shop sells, in practice, is time. Regulars arrive at fixed hours: the postwoman at ten, the two retired surveyors at eleven, a student who revises at the end of the counter every afternoon. Nobody is hurried, and nobody is asked to buy a second cup.',
        'Urbanists call this a third place, somewhere that is neither home nor work. Mr. Aldous would call it a Tuesday.'
      ], quote: 'We do not have a loyalty scheme. We have a kettle that is always on.' },
      { h: 'What happens when it closes', p: [
        'Last winter a burst pipe shut the shop for three weeks. The neighbours noticed first in small ways. The postwoman rerouted past it out of habit. A bench outside stayed empty. The florist two doors down said her own sales dipped, though she could not explain why.',
        'When the kettle reappeared on its bracket, someone had taped a note to the window. It said only: welcome back.'
      ] },
      { h: 'Small anchors', p: [
        'Cities invest in squares and flagship libraries, and they are right to. But the fabric of a street is often held by something far smaller: a counter, a kettle, a person who remembers how you take it.'
      ] }
    ]
  },
  {
    slug: 'notes-on-writing-by-hand', topic: 'Craft', date: '18 Oct 2026', issue: 41, minutes: 10, art: 5, likes: 189, author: authors.maren,
    cover: 'Ruled paper, a red margin and one sentence that refused to be typed.',
    plate: 'Detail: the crossings-out stay. Arrows stay. Half sentences stay.',
    title: 'Notes on writing by hand in a typed world',
    dek: 'A paper notebook is slower, messier and, for certain kinds of thinking, quietly unbeatable.',
    sections: [
      { h: 'The friction is the point', p: [
        'I type about ninety words a minute and write by hand at perhaps twenty. For years I treated that gap as a tax. Then I noticed that the sentences I kept were almost always the slow ones.',
        'Handwriting forces a pause between thought and record. In that pause the weaker half of an idea tends to fall away before it reaches the page.'
      ] },
      { h: 'What the research says, and does not', p: [
        'Studies comparing note-taking by hand and by keyboard are often quoted as if they settled the matter. They do not. Some find better conceptual recall for handwriting; others find little difference once participants are allowed to review their notes.',
        'What seems consistent is narrower and more useful: when you cannot transcribe everything, you are obliged to decide what matters, and deciding is a form of learning.'
      ], quote: 'A notebook is not a faster way to store thoughts. It is a slower way to have them.' },
      { h: 'A modest setup', p: [
        'Nothing here requires a ritual or an expensive pen. I use a plain notebook with a soft cover, one pencil, and a rule that I may not tidy anything up on the day I write it. Crossings-out stay. Arrows stay. Half sentences stay.',
        'Once a week I read back through the pages and type up only what still seems alive. Most of it is not. That is a feature: the notebook absorbs the clutter so that the typed version does not have to.'
      ] },
      { h: 'Keeping both', p: [
        'This is not a manifesto against screens. I draft, edit and publish on one. I simply begin elsewhere, with a pencil and a little less speed, and I find that the work arrives on the screen already knowing what it wants to say.'
      ] }
    ]
  },
  {
    slug: 'the-quiet-arithmetic-of-tides', topic: 'Science', date: '11 Oct 2026', issue: 40, minutes: 11, art: 6, likes: 156, author: authors.noor,
    cover: 'Five harmonics stacked into one sea, under a moon on its long ellipse.',
    plate: 'Detail: where the predicted curve and the observed one part company.',
    title: 'The quiet arithmetic of tides',
    dek: 'Tide tables are printed a year ahead and are almost never wrong. The interesting part is the margin where they are.',
    sections: [
      { h: 'Two bulges and a clock', p: [
        'Every harbour town keeps two clocks: the one on the church tower and the one written in the mud. The second runs about fifty minutes late each day, because the moon rises later each day, and the sea follows the moon more faithfully than anyone follows the church.',
        'The schoolbook picture of two watery bulges is right as far as it goes. What it leaves out is the coastline, which bends, funnels and delays the tide until the shape of a bay matters as much as the sky above it.'
      ] },
      { h: 'Predicting the sea a century ahead', p: [
        'In the nineteenth century, engineers built brass machines of pulleys and gears that summed the tide from its parts: one wheel for the moon, one for the sun, more for the wobbles of each orbit. A good machine could print a year of tides for a port in an afternoon.',
        'Modern prediction uses the same idea with more terms. A busy port might use sixty constituents, each a pure rhythm, added together into a curve that rarely misses by more than a few centimetres.'
      ], quote: 'The tide table is the only forecast printed a year in advance that is almost never wrong.' },
      { h: 'Where the arithmetic breaks', p: [
        'What the gears cannot know is the weather. A deep low pressure lifts the sea like a hand under a sheet; a steady onshore wind piles it against the coast. Those surges arrive on top of the predicted tide and are what flood streets.',
        'The difference between the table and the gauge, the residual, is where forecasters spend their nights in a storm.'
      ] },
      { h: 'Reading the margin', p: [
        'Over decades, the residual has a slower story to tell. Averaged across years, it creeps upward. The moon has not changed. The sea it is pulling has simply grown, a few millimetres a year, and the margin is where you can watch it happen.'
      ] }
    ]
  },
  {
    slug: 'files-that-outlive-their-software', topic: 'Technology', date: '11 Oct 2026', issue: 40, minutes: 9, art: 7, likes: 141, author: authors.ines,
    cover: 'Six strata of storage, from punched card to plain text, in the order they were forgotten.',
    plate: 'Detail: the upper layers, the formats we still trust because we can read them with our eyes.',
    title: 'The files that will outlive their software',
    dek: 'An archivist on why plain text keeps winning, and what it takes to open a spreadsheet from 1994.',
    sections: [
      { h: 'A spreadsheet from 1994', p: [
        'The request came from a historian: a parish council budget, saved on a floppy disk by a clerk who retired in 1998. The disk was fine. The file opened in nothing we owned. It took two days, an emulator and a borrowed manual to see the numbers again.',
        'Most of the work in a digital archive looks like that. Not rescuing data from decay, but rescuing meaning from software that no longer runs.'
      ] },
      { h: 'Plain text is a promise', p: [
        'The files that age best are the ones a stranger could understand without the program that made them: plain text, comma separated values, simple markup. They are not elegant. They are legible, and legibility is what survives.',
        'Proprietary formats are not villains. They are just bets that a company, and its file specification, will outlive the document. Sometimes that bet pays. Often it does not.'
      ], quote: 'The most durable format is the one a stranger could decode with a pencil and some patience.' },
      { h: 'Migration as maintenance', p: [
        'We migrate every collection on a schedule, whether it needs it or not, the way a ship is repainted before it rusts. Each migration is checked by hashing the content before and after, and by a person opening a sample to see that it still says the same thing.',
        'It is tedious. It is also the only method that has worked for forty years.'
      ] },
      { h: 'What to keep', p: [
        'If you want your own files readable in thirty years, keep a plain copy of anything you care about next to the original. Your future self, or a historian, will be grateful for the boring version.'
      ] }
    ]
  },
  {
    slug: 'signs-that-ask-nothing-of-you', topic: 'Design', date: '4 Oct 2026', issue: 39, minutes: 6, art: 8, likes: 118, author: authors.kofi,
    cover: 'A circle, an arrow and the corridor you were about to take.',
    plate: 'Detail: the arrow is placed one decision early, before the corridor splits.',
    title: 'Signs that ask nothing of you',
    dek: 'A wayfinding designer on tired travellers, fewer words, and the sign you should never notice.',
    sections: [
      { h: 'The station at 6:40 a.m.', p: [
        'I test every scheme at the worst time of day: early, crowded, with luggage. At 6:40 a.m. nobody reads. They glance, decide and walk, and a sign has perhaps half a second to be useful before it becomes an obstacle.',
        'Most bad signage is written for a calm person standing still. Almost nobody who needs it is calm or still.'
      ] },
      { h: 'Fewer words, placed earlier', p: [
        'The commonest mistake is placement, not wording. A sign at the junction arrives too late; the decision was made ten metres back. We move signs upstream, to the moment before the question forms.',
        'Then we cut words until it hurts. “Platforms 4 to 9” beats “To platforms 4, 5, 6, 7, 8 and 9 and the taxi rank”. The taxi rank gets its own sign, further on.'
      ], quote: 'A good sign answers the question you are about to ask, one corridor before you ask it.' },
      { h: 'Testing with tired people', p: [
        'We recruit testers off overnight flights and ask them to find a gate. We do not ask what they think of the signs. We watch where they hesitate, and every hesitation becomes a change on the drawings.'
      ] },
      { h: 'The quiet part', p: [
        'When a scheme works, nobody mentions it. The complaints stop, the information desk gets quieter, and the signs fade into the building. It is the only design work I know where being forgotten is the goal.'
      ] }
    ]
  }
]

const issueNo = 42
const roman = (n: number) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n - 1] ?? String(n)
// compare by name: `cur` is a reactive proxy, so object identity would not match
const essaysBy = (a: Article) => articles.filter(x => x.author.name === a.author.name).length

/* ---------- front page ---------- */
const view = ref<'home' | 'reader'>('home')
const current = ref<Article | null>(null)
const featured = articles[0]!
const cur = computed(() => current.value ?? featured)
const alsoInIssue = articles.filter(a => a.issue === issueNo && a !== featured)
const topics = ['All', ...Array.from(new Set(articles.map(a => a.topic)))]
const topic = ref('All')
const query = ref('')
const layout = ref<string | number | null>('grid')
const sealId = useId()

const filtering = computed(() => topic.value !== 'All' || !!query.value.trim())
const feed = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!filtering.value) return articles.filter(a => a.issue !== issueNo)
  return articles.filter((a) => {
    if (topic.value !== 'All' && a.topic !== topic.value) return false
    if (!q) return true
    return [a.title, a.dek, a.topic, a.author.name].some(t => t.toLowerCase().includes(q))
  })
})
function clearFilters() { topic.value = 'All'; query.value = '' }

/* ---------- navigation between views ---------- */
let homeScroll = 0
let targetScroll = 0
function open(a: Article) {
  if (view.value === 'home') homeScroll = window.scrollY
  targetScroll = 0
  activeSection.value = 0
  current.value = a
  view.value = 'reader'
}
function goHome() {
  if (view.value === 'home') return
  targetScroll = homeScroll
  view.value = 'home'
}
// out-in transition: scroll between the two halves, so the move is never visible
function onAfterLeave() { window.scrollTo(0, targetScroll) }
async function onAfterEnter() {
  await nextTick()
  if (view.value === 'reader') attach()
  else detach()
}

/* ---------- reader: progress bar (rAF + scaleX, passive) ---------- */
const barEl = ref<HTMLElement | null>(null)
const proseEl = ref<HTMLElement | null>(null)
const activeSection = ref(0)
const progress = ref(0)
const minLeft = computed(() => current.value ? Math.max(0, Math.ceil(current.value.minutes * (1 - progress.value))) : 0)
let ticking = false
let heads: HTMLElement[] = []

function paint() {
  ticking = false
  const el = proseEl.value, bar = barEl.value
  if (!el || !bar) return
  const r = el.getBoundingClientRect()
  const total = r.height - window.innerHeight * 0.5
  const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
  // active section: last heading above 30% of the viewport (all rect reads happen before the transform write)
  const line = window.innerHeight * 0.3
  let active = 0
  heads.forEach((hd, i) => { if (hd.getBoundingClientRect().top < line) active = i })
  if (active !== activeSection.value) activeSection.value = active
  bar.style.transform = `scaleX(${p.toFixed(4)})`
  // reactive only at 1% steps, so the TOC footer re-renders rarely
  const step = Math.round(p * 100) / 100
  if (step !== progress.value) progress.value = step
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint) } }
function attach() {
  detach()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  heads = Array.from(proseEl.value?.querySelectorAll<HTMLElement>('h2[id^="s"]') ?? [])
  paint()
}
function detach() {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  heads = []
}
onBeforeUnmount(detach)
function jump(i: number) {
  const el = document.getElementById('s' + i)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: reduce ? 'auto' : 'smooth' })
  activeSection.value = i
}

/* ---------- actions ---------- */
const toast = useMiToast()
const liked = ref(new Set<string>())
const saved = ref(new Set<string>())
const likeCount = computed(() => current.value ? current.value.likes + (liked.value.has(current.value.slug) ? 1 : 0) : 0)
function flip(set: Set<string>, key: string) {
  const n = new Set(set)
  if (n.has(key)) n.delete(key)
  else n.add(key)
  return n
}
function toggleLike() {
  const a = current.value!
  const on = !liked.value.has(a.slug)
  liked.value = flip(liked.value, a.slug)
  if (on) toast.success('Thanks for the like', { description: a.author.name + ' will see it.' })
  else toast.info('Like removed')
}
function toggleSave() {
  const a = current.value!
  const on = !saved.value.has(a.slug)
  saved.value = flip(saved.value, a.slug)
  if (on) toast.success('Saved to your reading list')
  else toast.info('Removed from your reading list')
}
const shareItems = [
  { value: 'copy', label: 'Copy link' },
  { value: 'email', label: 'Send by email' },
  { value: 'sep', separator: true },
  { value: 'feed', label: 'Share to your feed' }
]
async function onShare(item: { value?: string | number }) {
  if (item.value === 'copy') {
    try { await navigator.clipboard.writeText(location.href) } catch { /* clipboard may be blocked */ }
    toast.success('Link copied')
  } else if (item.value === 'email') toast.info('Opening your mail app')
  else if (item.value === 'feed') toast.success('Shared to your feed')
}

/* ---------- read next ---------- */
const related = computed(() => {
  const c = current.value
  if (!c) return []
  const others = articles.filter(a => a.slug !== c.slug)
  return [...others.filter(a => a.topic === c.topic), ...others.filter(a => a.topic !== c.topic && a.issue === c.issue), ...others.filter(a => a.topic !== c.topic && a.issue !== c.issue)].slice(0, 3)
})

/* ---------- letters (local) ---------- */
interface Comment { id: number, name: string, place: string, when: string, text: string }
const seeds: Comment[] = [
  { id: -2, name: 'Jonas Weber', place: 'Leipzig', when: '2 days ago', text: 'The clearest framing of this I have read all year. I printed it, which I have not done with an essay in a long time, and left it on the desk of the person who needed it most.' },
  { id: -1, name: 'Amara Diallo', place: 'Dakar', when: 'Yesterday', text: 'I would add one thing: the best examples I know came from people who were willing to ship less, and to say so out loud in the meeting.' }
]
const comments = ref<Record<string, Comment[]>>({})
const thread = computed(() => current.value ? (comments.value[current.value.slug] ?? seeds) : [])
const draft = ref('')
let cid = 1
function postComment() {
  const text = draft.value.trim()
  if (!text || !current.value) return
  comments.value = { ...comments.value, [current.value.slug]: [{ id: cid++, name: 'You', place: 'Reader', when: 'Just now', text }, ...thread.value] }
  draft.value = ''
  toast.success('Letter posted')
}

/* ---------- newsletter ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const dialogOpen = ref(false)
const email = ref('')
const emailError = ref('')
function resetDialog() { emailError.value = '' }
function validate(v: string) {
  if (!v) return 'Please enter your email address.'
  if (!EMAIL.test(v)) return 'That does not look like a valid email address.'
  return ''
}
function subscribe() {
  const v = email.value.trim()
  emailError.value = validate(v)
  if (emailError.value) return
  dialogOpen.value = false
  email.value = ''
  toast.success('You are on the list', { description: 'Your first essay arrives on Sunday at 7 a.m.' })
}
const inlineEmail = ref('')
const inlineError = ref('')
function subscribeInline() {
  const v = inlineEmail.value.trim()
  inlineError.value = validate(v)
  if (inlineError.value) return
  inlineEmail.value = ''
  toast.success('You are on the list', { description: 'Your first essay arrives on Sunday at 7 a.m.' })
}
</script>

<style scoped>
/* ---------- tokens for this publication ---------- */
.lantern {
  --serif: ui-serif, "New York", "Iowan Old Style", Georgia, serif;
  --paper: color-mix(in oklab, var(--mi-card) 94%, var(--mi-orange) 6%);
  --paper-page: color-mix(in oklab, var(--mi-page) 95%, var(--mi-orange) 5%);
  --ink: var(--mi-label);
  --ink2: var(--mi-label2);
  --ink3: var(--mi-label3);
  --rule: var(--mi-sep);
  --r: 6px;
  --gut: 16px;
  background: var(--paper-page);
  /* full-bleed paper behind the centred column, without horizontal overflow */
  box-shadow: 0 0 0 100vmax var(--paper-page);
  clip-path: inset(0 -100vmax);
  color: var(--ink);
  font-family: var(--mi-font);
}
@media (min-width: 760px) { .lantern { --gut: 32px; } }
.wrap { max-width: 1200px; margin: 0 auto; padding: 8px var(--gut) 40px; overflow-x: clip; }

/* shared editorial atoms */
.sc { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink2); }
.num { font-variant-numeric: tabular-nums lining-nums; }
.kicker { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 0; margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--mi-p-text); }
.kicker i, .byline i, .sc i { font-style: normal; margin: 0 .5em; color: var(--ink3); }
.byline { margin: 0; font-size: 13px; color: var(--ink2); line-height: 1.5; }
.byline b { color: var(--ink); font-weight: 600; }
.cap { margin: 10px 0 0; font-size: 13px; line-height: 1.5; color: var(--ink2); font-family: var(--serif); font-style: italic; }
.cap .sc { font-family: var(--mi-font); font-style: normal; font-size: 10px; margin-right: 6px; }
a { color: inherit; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; border-radius: 3px; }

.back { display: inline-flex; align-items: center; gap: 6px; color: var(--ink2); font-size: 13px; text-decoration: none; padding: 10px 0 6px; }
.back:hover { color: var(--mi-p-text); }

/* progress */
.progress { position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 80; pointer-events: none; }
.progress-bar { height: 100%; background: var(--mi-p); transform: scaleX(0); transform-origin: 0 50%; will-change: transform; }

/* ---------- masthead ---------- */
.mast { padding-top: 10px; }
.mast-top { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; border-top: 1px solid var(--ink); padding: 10px 0 0; }
.mast-date { display: none; }
.mast-sub { justify-self: end; }
.wordmark { display: block; text-align: center; text-decoration: none; color: var(--ink); font-family: var(--serif); font-weight: 600; font-size: clamp(2.35rem, 10.4vw, 7.25rem); line-height: .98; letter-spacing: -.035em; padding: 20px 0 18px; text-wrap: balance; }
.wm-the { font-style: italic; font-weight: 400; font-size: .52em; letter-spacing: -.01em; vertical-align: .38em; margin-right: .06em; color: var(--ink2); }
.mast-rule { border-top: 2px solid var(--ink); border-bottom: 1px solid var(--ink); height: 3px; }
.mast-sub-row { display: flex; justify-content: center; gap: 24px; padding: 10px 0; border-bottom: 1px solid var(--rule); }
.mast-since { display: none; }
@media (min-width: 760px) {
  .mast-top { grid-template-columns: 1fr auto 1fr; }
  .mast-date { display: block; }
  .mast-sub-row { justify-content: space-between; }
  .mast-since { display: block; }
}

/* ---------- front page ---------- */
.front { display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; padding: 32px 0 0; }
.lead { display: block; text-decoration: none; color: inherit; }
.lead-art { position: relative; margin: 0; aspect-ratio: 4 / 3; border-radius: var(--r); overflow: hidden; background: var(--paper); box-shadow: 0 0 0 1px var(--rule); }
.lead-text { padding-top: 20px; }
.lead-title { font-family: var(--serif); font-weight: 600; font-size: clamp(2.1rem, 6.2vw, 4.4rem); line-height: 1.02; letter-spacing: -.03em; margin: 12px 0 0; text-wrap: balance; max-width: 15ch; }
.lead-foot { display: grid; gap: 14px; margin-top: 16px; }
.lead-dek { margin: 0; font-family: var(--serif); font-style: italic; font-size: 1.2rem; line-height: 1.45; color: var(--ink2); max-width: 44ch; text-wrap: pretty; }
.lead:hover .lead-title, .lead:focus-visible .lead-title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .12em; }

.col-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0; padding: 8px 0 10px; border-top: 2px solid var(--ink); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.col-head h2 { margin: 0; font: inherit; }
.col-head .num { color: var(--ink2); }
.issue-list { list-style: none; margin: 0; padding: 0; }
.issue-list li + li { border-top: 1px solid var(--rule); }
.issue-item { display: grid; grid-template-columns: 2.4rem minmax(0, 1fr); gap: 12px; padding: 18px 0; text-decoration: none; color: inherit; }
.issue-n { font-family: var(--serif); font-size: 1.6rem; line-height: 1; color: var(--mi-p-text); font-style: italic; padding-top: 2px; }
.issue-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.issue-title { font-family: var(--serif); font-weight: 600; font-size: 1.3rem; line-height: 1.18; letter-spacing: -.012em; text-wrap: balance; }
.issue-dek { font-family: var(--serif); font-size: .98rem; line-height: 1.45; color: var(--ink2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.issue-item:hover .issue-title, .issue-item:focus-visible .issue-title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .14em; }

.editor { margin-top: 8px; padding: 20px 20px 18px; background: var(--paper); border-radius: var(--r); box-shadow: 0 0 0 1px var(--rule), inset 0 1px 0 var(--mi-fill4); }
.editor-copy { margin: 10px 0 0; font-family: var(--serif); font-size: 1.02rem; line-height: 1.55; text-wrap: pretty; }
.editor-sign { margin: 12px 0 0; font-family: var(--serif); font-style: italic; color: var(--ink2); }
.editor-sign .sc { font-style: normal; font-size: 10px; margin-left: 4px; }

@media (min-width: 760px) {
  .lead-art { aspect-ratio: 16 / 10; }
  .lead-foot { grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px; }
  .lead-foot .byline { white-space: nowrap; }
}
@media (min-width: 1024px) {
  .front { grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr); gap: 0; padding-top: 40px; }
  .lead { padding-right: 40px; border-right: 1px solid var(--rule); }
  .lead-foot { grid-template-columns: 1fr; align-items: start; gap: 14px; }
  .issue { padding-left: 40px; }
}
@media (min-width: 1200px) {
  .lead-foot { grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 28px; }
}

/* ---------- archive ---------- */
.archive { margin-top: 72px; }
@media (min-width: 1024px) { .archive { margin-top: 112px; } }
.arch-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 16px; border-top: 2px solid var(--ink); padding-top: 14px; }
.arch-title { margin: 0; font-family: var(--serif); font-weight: 600; font-size: clamp(1.75rem, 4vw, 2.5rem); letter-spacing: -.025em; line-height: 1.1; }
.arch-count { margin: 0; font-size: 13px; color: var(--ink2); }
.tools { display: flex; flex-direction: column; gap: 12px; margin: 18px 0 28px; padding: 12px 0; border-block: 1px solid var(--rule); }
.chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 3px 2px; margin: -3px -2px; min-width: 0; }
.chips::-webkit-scrollbar { display: none; }
.chips > * { flex: none; }
@media (max-width: 899px) { .chips { mask-image: linear-gradient(90deg, var(--ink) calc(100% - 28px), transparent); } }
.tools-end { display: flex; align-items: center; gap: 10px; }
.search { flex: 1; min-width: 0; }
.layout-toggle { flex: none; }
@media (min-width: 900px) {
  .tools { flex-direction: row; align-items: center; justify-content: space-between; }
  .chips { flex-wrap: wrap; overflow: visible; }
  .search { width: 240px; flex: none; }
}
.empty { margin: 24px 0 8px; }

.feed { display: grid; gap: 0; grid-template-columns: minmax(0, 1fr); }
.entry { display: grid; text-decoration: none; color: inherit; min-width: 0; }
.entry-art { position: relative; display: block; border-radius: var(--r); overflow: hidden; background: var(--paper); box-shadow: 0 0 0 1px var(--rule); }
.entry-body { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.entry-title { font-family: var(--serif); font-weight: 600; font-size: 1.3rem; line-height: 1.18; letter-spacing: -.012em; text-wrap: balance; }
.entry-dek { font-family: var(--serif); font-size: 1rem; line-height: 1.45; color: var(--ink2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.entry:hover .entry-title, .entry:focus-visible .entry-title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .14em; }
.entry .cover :deep(svg) { transition: transform var(--mi-dur-4) var(--mi-ease); }
.entry:hover .cover :deep(svg) { transform: scale(1.035); }

/* grid: mobile is a ruled list with thumbnails, the first entry opens wide */
.feed.is-grid .entry { grid-template-columns: minmax(0, 1fr) 96px; gap: 16px; padding: 18px 0; border-top: 1px solid var(--rule); }
.feed.is-grid .entry:first-child { border-top: 0; padding-top: 0; }
.feed.is-grid .entry-art { aspect-ratio: 1; order: 2; align-self: start; }
.feed.is-grid .entry-dek { display: none; }
.feed.is-grid .entry.is-wide { grid-template-columns: minmax(0, 1fr); }
.feed.is-grid .entry.is-wide .entry-art { order: 0; aspect-ratio: 16 / 10; }
.feed.is-grid .entry.is-wide .entry-dek { display: -webkit-box; }
.feed.is-grid .entry.is-wide .entry-title { font-size: 1.6rem; }
@media (min-width: 760px) {
  .feed.is-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px 32px; }
  .feed.is-grid .entry, .feed.is-grid .entry:first-child { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 0; border: 0; align-content: start; }
  .feed.is-grid .entry-art { order: 0; aspect-ratio: 4 / 3; }
  .feed.is-grid .entry-dek { display: -webkit-box; }
  .feed.is-grid .entry.is-wide { grid-column: 1 / -1; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 32px; align-items: center; }
  .feed.is-grid .entry.is-wide .entry-title { font-size: clamp(1.7rem, 3vw, 2.4rem); line-height: 1.08; letter-spacing: -.025em; }
  .feed.is-grid .entry.is-wide .entry-dek { font-size: 1.1rem; -webkit-line-clamp: 3; }
}
@media (min-width: 1024px) {
  .feed.is-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 56px 40px; }
  .feed.is-grid .entry { grid-column: span 2; }
  .feed.is-grid .entry.is-wide { grid-column: span 4; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 18px; }
  .feed.is-grid .entry.is-wide .entry-art { aspect-ratio: 16 / 9; }
  .feed.is-grid .entry.is-wide + .entry { padding-left: 40px; border-left: 1px solid var(--rule); grid-column: span 2; }
  .feed.is-grid .entry.is-wide + .entry .entry-art { aspect-ratio: 3 / 4; }
}

/* list: refined index with issue number, title, and a small plate */
.feed.is-list .entry { grid-template-columns: minmax(0, 1fr) 88px; gap: 16px; padding: 20px 0; border-top: 1px solid var(--rule); align-items: start; }
.feed.is-list .entry:first-child { border-top: 0; padding-top: 4px; }
.feed.is-list .entry-art { aspect-ratio: 1; order: 2; }
.feed.is-list .entry-dek { display: none; }
@media (min-width: 760px) {
  .feed.is-list .entry { grid-template-columns: minmax(0, 1fr) 168px; gap: 32px; padding: 26px 0; }
  .feed.is-list .entry-art { aspect-ratio: 4 / 3; }
  .feed.is-list .entry-title { font-size: 1.65rem; letter-spacing: -.02em; }
  .feed.is-list .entry-dek { display: -webkit-box; max-width: 62ch; }
}

/* ---------- subscription card ---------- */
.sub { margin-top: 88px; }
@media (min-width: 1024px) { .sub { margin-top: 128px; } }
.sub-card {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr);
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, color-mix(in oklab, var(--mi-p) 9%, transparent) 27px 28px),
    var(--paper);
  border-radius: var(--r);
  box-shadow: 0 0 0 1px var(--rule), inset 0 1px 0 var(--mi-fill4), var(--mi-sh2);
  max-width: 980px; margin: 0 auto;
}
.sub-main { padding: 24px 20px 22px; min-width: 0; }
.sub-top { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--ink); }
.sub-title { margin: 18px 0 0; font-family: var(--serif); font-weight: 600; font-size: clamp(1.75rem, 4.4vw, 2.6rem); line-height: 1.06; letter-spacing: -.025em; text-wrap: balance; max-width: 18ch; }
.sub-copy { margin: 12px 0 0; font-family: var(--serif); font-size: 1.05rem; line-height: 1.55; color: var(--ink2); max-width: 46ch; text-wrap: pretty; }
.sub-form { margin-top: 22px; max-width: 520px; }
.sub-row { display: flex; gap: 10px; align-items: center; }
.sub-row > :first-child { flex: 1; min-width: 0; }
.sub-terms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 24px 0 0; border-top: 1px solid var(--rule); }
.sub-terms div { padding: 12px 10px 0 0; min-width: 0; }
.sub-terms div + div { padding-left: 12px; border-left: 1px solid var(--rule); }
.sub-terms dt { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink2); }
.sub-terms dd { margin: 4px 0 0; font-family: var(--serif); font-size: 1rem; }
.sub-stub { position: relative; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 22px 20px 24px; border-top: 2px dashed color-mix(in oklab, var(--ink) 28%, transparent); }
/* punched notches at both ends of the perforation */
.sub-stub::before, .sub-stub::after { content: ''; position: absolute; top: -12px; width: 22px; height: 22px; border-radius: 50%; background: var(--paper-page); box-shadow: inset 0 0 0 1px var(--rule); }
.sub-stub::before { left: -11px; }
.sub-stub::after { right: -11px; }
.seal { width: 104px; height: 104px; flex: none; }
.seal-ring { transform-origin: 60px 60px; animation: seal-turn 60s linear infinite; }
.seal-text { font-family: var(--mi-font); font-size: 9.5px; font-weight: 700; fill: var(--mi-p-text); }
.seal-in { fill: none; stroke: var(--mi-p); stroke-width: 1.2; }
.seal-body { fill: var(--mi-p); }
.seal-flame { fill: var(--paper); }
.seal-line { fill: none; stroke: var(--ink); stroke-width: 1.6; stroke-linecap: round; }
.stub-label { max-width: 9ch; line-height: 1.5; }
@keyframes seal-turn { to { transform: rotate(360deg); } }
@media (min-width: 760px) {
  .sub-card { grid-template-columns: minmax(0, 1fr) 220px; }
  .sub-main { padding: 36px 40px 32px; }
  .sub-stub { flex-direction: column; border-top: 0; border-left: 2px dashed color-mix(in oklab, var(--ink) 28%, transparent); padding: 32px 20px; text-align: center; }
  .sub-stub::before, .sub-stub::after { left: -12px; right: auto; }
  .sub-stub::before { top: -11px; }
  .sub-stub::after { top: auto; bottom: -11px; }
  .seal { width: 132px; height: 132px; }
}

/* ---------- colophon ---------- */
.colophon { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 80px; padding: 22px 0 8px; border-top: 1px solid var(--ink); text-align: center; }
.wm-small { font-family: var(--serif); font-weight: 600; font-size: 1.35rem; letter-spacing: -.02em; }
.colophon .sc { font-size: 10px; line-height: 1.6; }

/* ---------- cover art ---------- */
.cover { position: absolute; inset: 0; overflow: hidden; }
.cover :deep(svg) { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.cover :deep(.k) { fill: var(--ink); }
.cover :deep(.kl) { fill: none; stroke: var(--ink); }
.cover :deep(.p) { fill: var(--mi-p); }
.cover :deep(.pl) { fill: none; stroke: var(--mi-p); }
.cover :deep(.s) { fill: var(--mi-s); }
.cover :deep(.sl) { fill: none; stroke: var(--mi-s); }
.cover :deep(.pa) { fill: var(--paper); }
.cover :deep(.pal) { fill: none; stroke: var(--paper); }
.cover :deep(.grain) { opacity: .16; pointer-events: none; }
.cover :deep(.art-num) { font-family: var(--mi-font); font-size: 21px; font-weight: 600; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
/* plate: the same composition redrawn as a construction drawing */
.cover-plate :deep(.bg) { fill: var(--paper) !important; }
.cover-plate :deep(:is(.p, .s, .k, .pa)) { fill: color-mix(in oklab, var(--mi-p) 6%, transparent); stroke: var(--mi-p); stroke-width: 1.25px; vector-effect: non-scaling-stroke; }
.cover-plate :deep(:is(.kl, .pl, .sl, .pal)) { stroke: var(--ink); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.cover-plate :deep(.art-num) { fill: var(--ink); stroke: none; }
.cover-plate :deep(.construct line) { stroke: var(--mi-p); stroke-width: 1px; opacity: .12; vector-effect: non-scaling-stroke; }

/* ---------- reader ---------- */
.r-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--rule); }
.r-home { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-size: 14px; font-weight: 500; color: var(--ink); }
.r-home:hover { color: var(--mi-p-text); }
.r-head { max-width: 860px; margin: 0 auto; padding: 40px 0 0; text-align: center; display: flex; flex-direction: column; align-items: center; }
.r-head .kicker { justify-content: center; }
.r-title { margin: 16px 0 0; font-family: var(--serif); font-weight: 600; font-size: clamp(2.3rem, 7vw, 4.75rem); line-height: 1.02; letter-spacing: -.032em; text-wrap: balance; }
.r-dek { margin: 18px 0 0; font-family: var(--serif); font-style: italic; font-size: clamp(1.15rem, 2.4vw, 1.45rem); line-height: 1.42; color: var(--ink2); max-width: 40ch; text-wrap: balance; }
.r-meta { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 26px; padding-top: 18px; border-top: 1px solid var(--rule); width: 100%; max-width: 620px; }
.r-by { display: flex; align-items: center; gap: 10px; text-align: left; }
.r-actions { display: flex; align-items: center; gap: 8px; }
.like-n { min-width: 3ch; font-size: 13px; color: var(--ink2); text-align: left; }
@media (min-width: 760px) {
  .r-head { padding-top: 64px; }
  .r-meta { flex-direction: row; justify-content: space-between; }
}

.r-cover { margin: 36px calc(var(--gut) * -1) 0; }
.r-cover-art { position: relative; aspect-ratio: 4 / 3; overflow: hidden; background: var(--paper); }
.r-cover .cap { padding: 0 var(--gut); }
@media (min-width: 760px) {
  .r-cover { margin: 48px auto 0; max-width: 1040px; }
  .r-cover-art { aspect-ratio: 16 / 9; border-radius: var(--r); box-shadow: 0 0 0 1px var(--rule); }
  .r-cover .cap { padding: 0; text-align: right; }
}

.r-grid { display: grid; grid-template-columns: minmax(0, 1fr); justify-content: center; gap: 0 56px; margin-top: 40px; }
.toc { display: none; }
.article { min-width: 0; max-width: 68ch; margin: 0 auto; width: 100%; font-size: 1rem; }
@media (min-width: 1100px) {
  .r-grid { grid-template-columns: 210px minmax(0, 68ch); margin-top: 56px; }
  .article { margin: 0; }
  .toc { display: block; position: relative; }
  .toc-in { position: sticky; top: 104px; padding-top: 6px; }
  .toc ol { list-style: none; margin: 14px 0 0; padding: 0; border-left: 1px solid var(--rule); }
  .toc a { display: grid; grid-template-columns: 2.1em 1fr; padding: 7px 0 7px 14px; margin-left: -1px; border-left: 2px solid transparent; color: var(--ink2); font-family: var(--serif); font-size: 15px; line-height: 1.35; text-decoration: none; }
  .toc a:hover { color: var(--ink); }
  .toc a.on { color: var(--ink); border-left-color: var(--mi-p); }
  .toc-n { font-family: var(--mi-font); font-size: 10px; font-weight: 700; letter-spacing: .1em; color: var(--ink3); padding-top: .32em; }
  .toc a.on .toc-n { color: var(--mi-p-text); }
  .toc-left { margin: 16px 0 0; padding-top: 12px; border-top: 1px solid var(--rule); font-size: 12px; color: var(--ink2); }
  .toc-m { display: none; }
}
@media (min-width: 1280px) {
  .r-grid { grid-template-columns: 210px minmax(0, 68ch) 150px; }
}

/* mobile table of contents */
.toc-m { border-block: 1px solid var(--rule); margin-bottom: 8px; }
.toc-m summary { display: flex; align-items: center; gap: 10px; padding: 12px 0; cursor: pointer; list-style: none; }
.toc-m summary::-webkit-details-marker { display: none; }
.toc-m-n { margin-left: auto; font-size: 12px; color: var(--ink2); }
.toc-m-chev { color: var(--ink2); transition: transform var(--mi-dur-2) var(--mi-ease); }
.toc-m[open] .toc-m-chev { transform: rotate(180deg); }
.toc-m ol { list-style: none; margin: 0; padding: 0 0 12px; }
.toc-m a { display: grid; grid-template-columns: 2.2em 1fr; padding: 8px 0; text-decoration: none; font-family: var(--serif); font-size: 1.02rem; }
.toc-m .toc-n { font-size: 10px; font-weight: 700; letter-spacing: .1em; color: var(--mi-p-text); padding-top: .4em; }

/* prose */
.prose { font-family: var(--serif); font-size: 1.125rem; line-height: 1.7; color: color-mix(in oklab, var(--ink) 92%, transparent); }
@media (min-width: 760px) { .prose { font-size: 1.22rem; line-height: 1.72; } }
.sec { margin-top: 2.6em; }
.sec:first-child { margin-top: 1.6em; }
.sec-n { margin: 0; font-family: var(--mi-font); font-size: 11px; font-weight: 700; letter-spacing: .16em; color: var(--mi-p-text); }
.sec-h { margin: .3em 0 .7em; font-family: var(--serif); font-weight: 600; font-size: 1.55em; line-height: 1.15; letter-spacing: -.02em; color: var(--ink); text-wrap: balance; scroll-margin-top: 110px; }
.sec:first-child .sec-h { font-size: 1.3em; }
.prose p:not(.sec-n) { margin: 0 0 1.1em; text-wrap: pretty; hyphens: auto; }
.prose .lede { color: var(--ink); }
.prose .lede::first-letter { float: left; font-family: var(--serif); font-weight: 600; font-size: 4.7em; line-height: .78; margin: .07em .09em 0 0; color: var(--mi-p-text); }
.prose .lede::first-line { font-variant-caps: all-small-caps; letter-spacing: .05em; font-size: 1.04em; }
.prose .last::after { content: ''; display: inline-block; width: .5em; height: .5em; margin-left: .4em; background: var(--mi-p); vertical-align: baseline; }

.pull { margin: 1.8em 0; padding: .9em 0 .8em; border-block: 1px solid var(--ink); position: relative; }
.pull::before { content: '“'; position: absolute; top: .02em; left: 0; font-family: var(--serif); font-size: 3.6em; line-height: 1; color: var(--mi-p); }
.pull p { margin: 0 !important; padding-left: 1.3em; font-family: var(--serif); font-style: italic; font-size: 1.45em; line-height: 1.28; letter-spacing: -.012em; color: var(--ink); text-wrap: balance; }
@media (min-width: 1280px) { .pull { margin-right: -150px; } }

.plate { margin: 2em 0; }
.plate-art { position: relative; aspect-ratio: 4 / 3; border-radius: var(--r); overflow: hidden; background: var(--paper); box-shadow: 0 0 0 1px var(--rule); }
@media (min-width: 1280px) { .plate { margin-right: -150px; } .plate-art { aspect-ratio: 16 / 9; } }

/* author */
.author { display: flex; gap: 18px; align-items: flex-start; margin-top: 48px; padding-top: 24px; border-top: 2px solid var(--ink); }
.author-body { min-width: 0; }
.author-name { margin: 6px 0 0; font-family: var(--serif); font-weight: 600; font-size: 1.35rem; letter-spacing: -.015em; }
.author-bio { margin: 6px 0 8px; font-family: var(--serif); font-size: 1.02rem; line-height: 1.55; color: var(--ink2); }

/* letters */
.letters { margin-top: 64px; }
.letters-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-top: 12px; border-top: 1px solid var(--rule); margin-bottom: 18px; }
.letters-title { margin: 0; font-family: var(--serif); font-weight: 600; font-size: 1.75rem; letter-spacing: -.02em; }
.c-form { display: flex; flex-direction: column; gap: 12px; }
.c-actions { display: flex; justify-content: flex-end; }
.c-list { list-style: none; margin: 24px 0 0; padding: 0; }
.c-item { display: flex; gap: 12px; padding: 20px 0; border-top: 1px solid var(--rule); }
.c-main { min-width: 0; }
.c-who { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-size: 14px; }
.c-who .sc { font-size: 10px; }
.c-when { font-size: 12px; color: var(--ink3); }
.c-body { margin: 6px 0 0; font-family: var(--serif); font-size: 1.05rem; line-height: 1.6; text-wrap: pretty; }

/* read next */
.next { margin-top: 88px; }
.next-head { align-items: center; }
.next-head h2 { font-size: 11px; }
.r-sub-link { border: 0; background: none; padding: 4px 0; font: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--mi-p-text); cursor: pointer; }
.r-sub-link:hover { text-decoration: underline; text-underline-offset: .2em; }
.next-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px; margin-top: 18px; }
.next-item { display: grid; grid-template-columns: 96px minmax(0, 1fr); grid-template-rows: auto auto 1fr; column-gap: 16px; row-gap: 6px; text-decoration: none; color: inherit; align-items: start; }
.next-art { position: relative; grid-row: 1 / 4; aspect-ratio: 1; border-radius: var(--r); overflow: hidden; background: var(--paper); box-shadow: 0 0 0 1px var(--rule); }
.next-title { font-family: var(--serif); font-weight: 600; font-size: 1.2rem; line-height: 1.2; letter-spacing: -.01em; text-wrap: balance; }
.next-item:hover .next-title, .next-item:focus-visible .next-title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .14em; }
@media (min-width: 760px) {
  .next-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .next-item { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; }
  .next-art { grid-row: auto; aspect-ratio: 4 / 3; margin-bottom: 8px; }
}

/* newsletter dialog */
.nl { display: flex; flex-direction: column; gap: 14px; text-align: left; }
.nl-copy { margin: 0; font-size: 15px; color: var(--ink2); }

/* view transitions: transform + opacity only */
.view-enter-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-4) var(--mi-ease); }
.view-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease-in-out), transform var(--mi-dur-2) var(--mi-ease-in-out); }
.view-enter-from { opacity: 0; transform: translateY(16px); }
.view-leave-to { opacity: 0; transform: translateY(-6px); }
.tile-enter-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.tile-enter-from { opacity: 0; transform: translateY(10px); }
.tile-leave-active { display: none; }
@media (prefers-reduced-motion: reduce) {
  .view-enter-active, .view-leave-active, .tile-enter-active { transition-duration: 1ms; }
  .view-enter-from, .view-leave-to, .tile-enter-from { transform: none; }
  .seal-ring { animation: none; }
  .entry:hover .cover :deep(svg) { transform: none; }
}
</style>
