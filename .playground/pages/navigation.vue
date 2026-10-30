<script setup lang="ts">
import { ref } from 'vue'
import MiBreadcrumb from '../../app/components/Navigation/MiBreadcrumb.vue'
import MiLocalNav from '../../app/components/Navigation/MiLocalNav.vue'
import MiNavBar from '../../app/components/Navigation/MiNavBar.vue'
import MiPageControl from '../../app/components/Navigation/MiPageControl.vue'
import MiPagination from '../../app/components/Navigation/MiPagination.vue'
import MiSidebar from '../../app/components/Navigation/MiSidebar.vue'
import MiSteps from '../../app/components/Navigation/MiSteps.vue'
import MiTabBar from '../../app/components/Navigation/MiTabBar.vue'
import MiToolbar from '../../app/components/Navigation/MiToolbar.vue'

const sidebarCollapsed = ref(false)
const side = ref('projects')
const tab = ref('library')
const capsule = ref('library')
const step = ref(1)
const local = ref('overview')
const page = ref(3)
const bigPage = ref(8)
const dot = ref(1)
const view = ref('grid')
const query = ref('')
const nbCollapsed = ref(false)

const groups = [
  { label: 'Workspace', items: [
    { id: 'home', label: 'Home', icon: 'home' as const },
    { id: 'inbox', label: 'Inbox', icon: 'inbox' as const, badge: 4 },
    { id: 'projects', label: 'Projects', icon: 'folder' as const },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' as const },
    { id: 'documents', label: 'Documents', icon: 'document' as const }
  ] },
  { label: 'Tags', collapsible: true, items: [
    { id: 'design', label: 'Design', color: 'purple' as const },
    { id: 'marketing', label: 'Marketing', color: 'orange' as const },
    { id: 'engineering', label: 'Engineering', color: 'teal' as const }
  ] }
]
const tabs = [
  { id: 'home', label: 'Home', icon: 'home' as const },
  { id: 'search', label: 'Search', icon: 'search' as const },
  { id: 'library', label: 'Library', icon: 'photo' as const, badge: 2 },
  { id: 'profile', label: 'Profile', icon: 'person' as const }
]
const steps = [
  { label: 'Details', description: 'Name and description' },
  { label: 'Billing', description: 'Plan and payment method' },
  { label: 'Confirm', description: 'Review and finish' }
]
const localItems = [
  { id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' },
  { id: 'files', label: 'Files' }, { id: 'settings', label: 'Settings' }
]
const views = [{ id: 'grid', label: 'Grid view', icon: 'grid' as const }, { id: 'list', label: 'List view', icon: 'list' as const }]
const crumbs = [{ label: 'Home' }, { label: 'Projects' }, { label: 'Spring campaign' }]
const path = [{ label: 'Documents' }, { label: 'Clients' }, { label: 'Brief.pdf' }]
</script>

<template>
  <div class="mi pg">
    <h1>Navigation</h1>

    <h2>Toolbar</h2>
    <div class="card">
      <MiToolbar
        v-model:view="view" v-model:search="query" title="Projects" subtitle="12 items" :views="views" searchable
        primary-label="New" avatar="AM" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      />
    </div>

    <div class="grid2">
      <section>
        <h2>Sidebar</h2>
        <MiSidebar v-model="side" v-model:collapsed="sidebarCollapsed" :groups="groups" footer-label="New list" />
      </section>
      <section>
        <h2>Mobile bars</h2>
        <div class="phone">
          <div class="scroll">
            <MiNavBar v-model:collapsed="nbCollapsed" title="Library" back-label="Home" action-label="Edit" />
            <div v-for="n in 14" :key="n" class="row" />
          </div>
          <MiTabBar v-model="tab" :items="tabs" />
        </div>
        <div class="card">
          <MiTabBar v-model="capsule" :items="tabs" variant="capsule" aria-label="Sections" />
        </div>
        <div class="card">
          <MiSteps v-model="step" :steps="steps" aria-label="Checkout progress" />
        </div>
        <div class="card">
          <MiSteps v-model="step" :steps="steps" orientation="horizontal" aria-label="Checkout progress (horizontal)" />
        </div>
      </section>
    </div>

    <h2>Local navigation</h2>
    <MiLocalNav v-model="local" title="Projects" :items="localItems" action-label="Invite" />

    <div class="grid3">
      <div class="card">
        <MiBreadcrumb :items="crumbs" />
        <p class="cap">Path control</p>
        <MiBreadcrumb :items="path" variant="path" aria-label="Path" />
      </div>
      <div class="card">
        <MiPagination v-model="page" :total="5" />
        <MiPagination v-model="bigPage" :total="20" />
      </div>
      <div class="card">
        <div class="slide">Slide {{ dot + 1 }}</div>
        <MiPageControl v-model="dot" :count="5" style="align-self:center" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg{padding:32px;display:flex;flex-direction:column;gap:20px;background:var(--mi-page);min-height:100vh}
h1{margin:0;font-size:44px;letter-spacing:-.03em}
h2{margin:0 0 10px;font-size:22px;letter-spacing:-.02em}
.card{border-radius:18px;background:var(--mi-card);box-shadow:var(--mi-sh1);padding:18px;display:flex;flex-direction:column;gap:14px;overflow:hidden;margin-bottom:16px}
.grid2{display:grid;grid-template-columns:300px minmax(0,1fr);gap:20px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.phone{height:420px;border-radius:22px;overflow:hidden;background:var(--mi-page);box-shadow:var(--mi-sh2);display:flex;flex-direction:column;margin-bottom:16px}
.scroll{flex:1;overflow-y:auto;min-height:0}
.row{height:56px;margin:10px 16px;border-radius:12px;background:var(--mi-card)}
.cap{margin:0;font-size:12px;font-weight:600;color:var(--mi-label2)}
.slide{height:96px;border-radius:12px;background:var(--mi-p-tint);color:var(--mi-p-text);display:flex;align-items:center;justify-content:center;font-weight:600}
@media (max-width:900px){.grid2,.grid3{grid-template-columns:minmax(0,1fr)}}
</style>
