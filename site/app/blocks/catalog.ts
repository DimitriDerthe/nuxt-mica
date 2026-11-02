// Application UI block catalog: every family and category of the Mica block gallery, built with Mica
// components. Blocks live in `blocks/<family>/<category>/<Name>.vue`, described by the
// `meta.json` next to them; this file only names the families and categories and orders them.

export interface Localized { en: string, fr: string }

export interface BlockCategory {
  id: string
  title: Localized
  /** Family that owns the blocks when this entry is only a cross-reference (the Modals family). */
  ref?: string
}

export interface BlockFamily {
  id: string
  title: Localized
  summary: Localized
  categories: BlockCategory[]
}

export interface BlockMeta {
  /** File name of the block, without `.vue`. */
  file: string
  title: Localized
  summary: Localized
  /** Minimum preview height in px (defaults to 360). */
  height?: number
  /** `pad` (default) frames the block with padding on a dotted stage; `bleed` lets full-page layouts touch the frame. */
  stage?: 'pad' | 'bleed'
}

const c = (id: string, en: string, fr: string, ref?: string): BlockCategory => ({ id, title: { en, fr }, ref })

export const families: BlockFamily[] = [
  {
    id: 'analytics',
    title: { en: 'Analytics & KPIs', fr: 'Analytique et KPI' },
    summary: { en: 'Charts, KPI cards, rankings, progress and maps for dashboards and reports.', fr: 'Graphiques, cartes KPI, classements, progression et cartes pour tableaux de bord et rapports.' },
    categories: [
      c('bar-charts', 'Bar Charts', 'Diagrammes en barres'),
      c('line-area-charts', 'Line & Area Charts', 'Courbes et aires'),
      c('pie-radial-charts', 'Pie & Radial Charts', 'Secteurs et radiaux'),
      c('chart-compositions', 'Chart Compositions', 'Compositions de graphiques'),
      c('kpi-cards', 'KPI Cards', 'Cartes KPI'),
      c('spark-charts', 'Spark Charts', 'Micro-graphiques'),
      c('ranking-cards', 'Ranking Cards', 'Cartes de classement'),
      c('progress-cards', 'Progress Cards', 'Cartes de progression'),
      c('data-maps', 'Data Maps', 'Cartes de données')
    ]
  },
  {
    id: 'data-display',
    title: { en: 'Data Display', fr: 'Affichage de données' },
    summary: { en: 'Projects, files, feeds, timelines and lists for scanning and monitoring.', fr: 'Projets, fichiers, flux, chronologies et listes pour parcourir et surveiller.' },
    categories: [
      c('projects', 'Projects', 'Projets'),
      c('file-views', 'File Views', 'Vues de fichiers'),
      c('team-profile-views', 'Team & Profile Views', 'Équipe et profils'),
      c('integrations', 'Integrations', 'Intégrations'),
      c('data-management', 'Data Management', 'Gestion des données'),
      c('activity-feeds', 'Activity Feeds', "Flux d'activité"),
      c('timelines', 'Timelines', 'Chronologies'),
      c('description-lists', 'Description Lists', 'Listes de description'),
      c('list-groups', 'List Groups', 'Groupes de listes')
    ]
  },
  {
    id: 'tables',
    title: { en: 'Tables', fr: 'Tableaux' },
    summary: { en: 'Record, order, product, project and analytics grids for back offices.', fr: "Grilles d'enregistrements, commandes, produits, projets et analyses pour back-offices." },
    categories: [
      c('user-contact-tables', 'User & Contact Tables', 'Utilisateurs et contacts'),
      c('order-billing-tables', 'Order & Billing Tables', 'Commandes et facturation'),
      c('product-tables', 'Product Tables', 'Produits'),
      c('project-tables', 'Project Tables', 'Tableaux de projets'),
      c('analytics-tables', 'Analytics Tables', 'Tableaux analytiques'),
      c('content-tables', 'Content Tables', 'Contenus'),
      c('admin-utility-tables', 'Admin Utility Tables', "Utilitaires d'administration")
    ]
  },
  {
    id: 'forms',
    title: { en: 'Forms', fr: 'Formulaires' },
    summary: { en: 'Settings, uploads, filters, pickers, payments and every data-entry pattern.', fr: 'Réglages, envois, filtres, sélecteurs, paiements et toutes les saisies de données.' },
    categories: [
      c('advanced-forms', 'Advanced Forms', 'Formulaires avancés'),
      c('transfer-forms', 'Transfer Forms', 'Formulaires de transfert'),
      c('form-pages-settings', 'Form Pages & Settings', 'Pages de formulaire et réglages'),
      c('text-editors', 'Text Editors', 'Éditeurs de texte'),
      c('message-composer-textareas', 'Message Composer Textareas', 'Zones de rédaction de message'),
      c('utility-textareas', 'Utility Textareas', 'Zones de texte utilitaires'),
      c('option-pickers', 'Option Pickers', "Sélecteurs d'options"),
      c('selectable-cards-lists', 'Selectable Cards & Lists', 'Cartes et listes sélectionnables'),
      c('checkbox-preference-controls', 'Checkbox & Preference Controls', 'Cases à cocher et préférences'),
      c('ratings-emoji-selectors', 'Ratings & Emoji Selectors', 'Notes et emojis'),
      c('switches', 'Switches', 'Interrupteurs'),
      c('create-edit-forms', 'Create & Edit Forms', 'Création et édition'),
      c('file-upload-forms', 'File Upload Forms', 'Envoi de fichiers'),
      c('image-upload-forms', 'Image Upload Forms', "Envoi d'images"),
      c('document-import-uploads', 'Document & Import Uploads', 'Documents et imports'),
      c('create-edit-form-modals', 'Create & Edit Form Modals', 'Modales de création et édition'),
      c('content-editor-forms', 'Content Editor Forms', 'Éditeurs de contenu'),
      c('range-controls', 'Range Controls', 'Plages de valeurs'),
      c('filter-panels', 'Filter Panels', 'Panneaux de filtres'),
      c('filter-bars', 'Filter Bars', 'Barres de filtres'),
      c('payment-method-forms', 'Payment Method Forms', 'Moyens de paiement'),
      c('billing-upgrade-forms', 'Billing & Upgrade Forms', 'Facturation et montée en gamme'),
      c('contact-feedback-forms', 'Contact & Feedback Forms', 'Contact et retours'),
      c('newsletter-signup-forms', 'Newsletter Signup Forms', 'Inscription à la newsletter'),
      c('product-review-forms', 'Product Review Forms', 'Avis produit')
    ]
  },
  {
    id: 'authentication',
    title: { en: 'Authentication', fr: 'Authentification' },
    summary: { en: 'Sign in, sign up, recovery, verification, onboarding and setup journeys.', fr: 'Connexion, inscription, récupération, vérification, accueil et configuration.' },
    categories: [
      c('authentication-pages', 'Authentication Pages', "Pages d'authentification"),
      c('verification-recovery-pages', 'Verification & Recovery Pages', 'Vérification et récupération'),
      c('guest-checkout-order-lookup', 'Guest Checkout & Order Lookup', 'Commande invité et suivi'),
      c('authentication-form-snippets', 'Authentication Form Snippets', "Fragments d'authentification"),
      c('authentication-modals', 'Authentication Modals', "Modales d'authentification"),
      c('onboarding-pages', 'Onboarding Pages', "Pages d'accueil"),
      c('set-up-flows', 'Set Up Flows', 'Parcours de configuration')
    ]
  },
  {
    id: 'application-pages',
    title: { en: 'Application Pages', fr: "Pages d'application" },
    summary: { en: 'Admin screens, AI interfaces, profiles and account pages.', fr: "Écrans d'administration, interfaces IA, profils et pages de compte." },
    categories: [
      c('admin-dashboard-pages', 'Admin Dashboard Pages', "Tableaux de bord d'administration"),
      c('ai-interface-pages', 'AI Interface Pages', "Pages d'interface IA"),
      c('profile-cards-status-panels', 'Profile Cards & Status Panels', 'Cartes de profil et statuts'),
      c('person-account-detail-headers', 'Person & Account Detail Headers', 'En-têtes de personne et compte'),
      c('settings-modals', 'Settings Modals', 'Modales de réglages')
    ]
  },
  {
    id: 'billing',
    title: { en: 'Billing & Payments', fr: 'Facturation et paiements' },
    summary: { en: 'Invoices, plans, transactions, payment methods and cards.', fr: 'Factures, offres, transactions, moyens de paiement et cartes.' },
    categories: [
      c('invoice-layouts', 'Invoice Layouts', 'Mises en page de facture'),
      c('subscription-plans', 'Subscription Plans', "Offres d'abonnement"),
      c('payment-transaction-details', 'Payment Transaction Details', 'Détails de transaction'),
      c('payment-method-modals', 'Payment Method Modals', 'Modales de moyen de paiement'),
      c('payment-method-panels', 'Payment Method Panels', 'Panneaux de moyens de paiement'),
      c('payment-cards', 'Payment Cards', 'Cartes de paiement')
    ]
  },
  {
    id: 'communication',
    title: { en: 'Communication', fr: 'Communication' },
    summary: { en: 'Inbox, chat, AI chat, support widgets, calls, voice and contacts.', fr: 'Messagerie, chat, chat IA, support, appels, messages vocaux et contacts.' },
    categories: [
      c('inbox-layouts', 'Inbox Layouts', 'Boîtes de réception'),
      c('chat-workspace-layouts', 'Chat Workspace Layouts', 'Espaces de discussion'),
      c('customer-detail-layouts', 'Customer Detail Layouts', 'Fiches client'),
      c('ai-chat-layouts', 'AI Chat Layouts', 'Chats IA'),
      c('chat-toolbars', 'Chat Toolbars', 'Barres de chat'),
      c('message-bubbles', 'Message Bubbles', 'Bulles de message'),
      c('media-attachment-bubbles', 'Media & Attachment Bubbles', 'Bulles média et pièces jointes'),
      c('ai-chat-bubbles', 'AI Chat Bubbles', 'Bulles de chat IA'),
      c('support-chat-widgets', 'Support Chat Widgets', 'Widgets de support'),
      c('support-chat-sidebars', 'Support Chat Sidebars', 'Panneaux de support'),
      c('inbox-threads', 'Inbox Threads', 'Fils de discussion'),
      c('video-call-layouts', 'Video Call Layouts', 'Appels vidéo'),
      c('call-device-settings', 'Call Device Settings', "Réglages d'appareils d'appel"),
      c('voice-messages', 'Voice Messages', 'Messages vocaux'),
      c('contact-cards', 'Contact Cards', 'Cartes de contact'),
      c('connections-selectors', 'Connections & Selectors', 'Connexions et sélecteurs')
    ]
  },
  {
    id: 'productivity',
    title: { en: 'Productivity', fr: 'Productivité' },
    summary: { en: 'Calendars, schedules, planning boards and kanban.', fr: 'Calendriers, plannings, tableaux de planification et kanban.' },
    categories: [
      c('calendar-views', 'Calendar Views', 'Vues de calendrier'),
      c('calendar-drawers', 'Calendar Drawers', 'Tiroirs de calendrier'),
      c('schedule-management', 'Schedule Management', 'Gestion de planning'),
      c('scheduling-modals', 'Scheduling Modals', 'Modales de planification'),
      c('month-year-calendars', 'Month & Year Calendars', 'Calendriers mois et année'),
      c('kanban-board-layouts', 'Kanban Board Layouts', 'Tableaux kanban'),
      c('kanban-group-headings', 'Kanban Group Headings', 'En-têtes de colonnes kanban'),
      c('kanban-board-cards', 'Kanban Board Cards', 'Cartes kanban')
    ]
  },
  {
    id: 'feedback',
    title: { en: 'Feedback & States', fr: 'Retours et états' },
    summary: { en: 'Empty and success states, shortcuts, reviews and consent prompts.', fr: 'États vides et de réussite, raccourcis, avis et consentement.' },
    categories: [
      c('empty-states', 'Empty States', 'États vides'),
      c('success-states', 'Success States', 'États de réussite'),
      c('action-cards-shortcut-links', 'Action Cards & Shortcut Links', "Cartes d'action et raccourcis"),
      c('product-review-sections', 'Product Review Sections', "Sections d'avis produit"),
      c('cookie-consent-prompts', 'Cookie Consent Prompts', 'Consentement aux cookies')
    ]
  },
  {
    id: 'search',
    title: { en: 'Search & Command', fr: 'Recherche et commandes' },
    summary: { en: 'Search results and keyboard-first command palettes.', fr: 'Résultats de recherche et palettes de commandes au clavier.' },
    categories: [
      c('search-results', 'Search Results', 'Résultats de recherche'),
      c('command-palette-modals', 'Command Palette Modals', 'Palettes de commandes')
    ]
  },
  {
    id: 'modals',
    title: { en: 'Modals', fr: 'Modales' },
    summary: { en: 'Task-focused dialogs, gathered from the families that own them.', fr: 'Dialogues centrés sur une tâche, regroupés depuis leurs familles.' },
    categories: [
      c('authentication-modals', 'Authentication Modals', "Modales d'authentification", 'authentication'),
      c('settings-modals', 'Settings Modals', 'Modales de réglages', 'application-pages'),
      c('create-edit-form-modals', 'Create & Edit Form Modals', 'Modales de création et édition', 'forms'),
      c('scheduling-modals', 'Scheduling Modals', 'Modales de planification', 'productivity'),
      c('payment-method-modals', 'Payment Method Modals', 'Modales de moyen de paiement', 'billing')
    ]
  },
  {
    id: 'drawers',
    title: { en: 'Drawers', fr: 'Tiroirs' },
    summary: { en: 'Detail panels and filter drawers that slide from the edge.', fr: 'Panneaux de détail et tiroirs de filtres qui glissent depuis le bord.' },
    categories: [
      c('utility-detail-drawers', 'Utility & Detail Drawers', 'Tiroirs utilitaires et détails'),
      c('filter-drawers', 'Filter Drawers', 'Tiroirs de filtres'),
      c('listing-filter-panels', 'Listing Filter Panels', 'Filtres de listing')
    ]
  },
  {
    id: 'ui-components',
    title: { en: 'UI Components', fr: "Composants d'interface" },
    summary: { en: 'Menus, selects, buttons, badges, chips, progress and links.', fr: 'Menus, listes, boutons, badges, puces, progression et liens.' },
    categories: [
      c('dropdown-menus', 'Dropdown Menus', 'Menus déroulants'),
      c('account-workspace-menus', 'Account & Workspace Menus', 'Menus de compte et espace'),
      c('selection-menus', 'Selection Menus', 'Menus de sélection'),
      c('select-menus', 'Select Menus', 'Listes de sélection'),
      c('tagging-selects', 'Tagging Selects', "Sélecteurs d'étiquettes"),
      c('embedded-compact-selects', 'Embedded & Compact Selects', 'Sélecteurs intégrés et compacts'),
      c('ecommerce-menus', 'Ecommerce Menus', 'Menus e-commerce'),
      c('editor-toolbar-menus', 'Editor & Toolbar Menus', "Menus d'éditeur et barres d'outils"),
      c('profile-popovers', 'Profile Popovers', 'Popovers de profil'),
      c('buttons', 'Buttons', 'Boutons'),
      c('action-button-groups', 'Action Button Groups', "Groupes de boutons d'action"),
      c('segmented-controls', 'Segmented Controls', 'Contrôles segmentés'),
      c('label-feedback-groups', 'Label & Feedback Groups', 'Libellés et retours'),
      c('badge-styles', 'Badge Styles', 'Styles de badge'),
      c('status-badges', 'Status Badges', 'Badges de statut'),
      c('tag-chips', 'Tag Chips', 'Puces'),
      c('progress-indicators', 'Progress Indicators', 'Indicateurs de progression'),
      c('utility-links', 'Utility Links', 'Liens utilitaires')
    ]
  },
  {
    id: 'navigation',
    title: { en: 'Navigation & Layout', fr: 'Navigation et mise en page' },
    summary: { en: 'Headers, navbars, sidebars, tabs, shells, footers and error pages.', fr: "En-têtes, barres de navigation, barres latérales, onglets, coquilles, pieds de page et pages d'erreur." },
    categories: [
      c('dashboard-headers', 'Dashboard Headers', 'En-têtes de tableau de bord'),
      c('workspace-headers', 'Workspace Headers', "En-têtes d'espace de travail"),
      c('application-navbars', 'Application Navbars', "Barres de navigation d'application"),
      c('flow-headers', 'Flow Headers', 'En-têtes de parcours'),
      c('secondary-navs', 'Secondary Navs', 'Navigations secondaires'),
      c('scroll-navigation', 'Scroll Navigation', 'Navigation au défilement'),
      c('card-tabs', 'Card Tabs', 'Onglets en carte'),
      c('dashboard-sidebars', 'Dashboard Sidebars', 'Barres latérales de tableau de bord'),
      c('application-sidebars', 'Application Sidebars', "Barres latérales d'application"),
      c('dashboard-sidebar-modules', 'Dashboard Sidebar Modules', 'Modules de barre latérale'),
      c('sidebar-navigation', 'Sidebar Navigation', 'Navigation latérale'),
      c('multi-panel-layouts', 'Multi-Panel Layouts', 'Mises en page multi-panneaux'),
      c('detached-sidebar-layouts', 'Detached Sidebar Layouts', 'Barres latérales détachées'),
      c('dashboard-demo-layouts', 'Dashboard Demo Layouts', 'Démos de tableau de bord'),
      c('title-bars', 'Title Bars', 'Barres de titre'),
      c('dashboard-footers', 'Dashboard Footers', 'Pieds de tableau de bord'),
      c('stacked-footers', 'Stacked Footers', 'Pieds de page empilés'),
      c('blank-error-pages', 'Blank & Error Pages', "Pages vides et d'erreur"),
      c('sticky-layouts', 'Sticky Layouts', 'Mises en page collantes')
    ]
  }
]

/** Blocks of each category, keyed `family/category`, read from the `meta.json` files at build time. */
const metas = import.meta.glob<BlockMeta[]>('./*/*/meta.json', { eager: true, import: 'default' })

export const blocksOf = (family: string, category: string): BlockMeta[] => metas[`./${family}/${category}/meta.json`] ?? []

/** The family and category that hold the blocks of an entry (follows Modals cross-references). */
export const ownerOf = (family: BlockFamily, cat: BlockCategory) => ({ family: cat.ref ?? family.id, category: cat.id })

/** Lazy loaders for the block components and their source text, keyed `family/category/File`. */
const components = import.meta.glob('./*/*/*.vue')
// Client only: the server bundle never needs the source text, and its define pass rewrites
// expressions such as `typeof window` inside the raw strings, which breaks the chunk.
const sources: Record<string, () => Promise<string>> = import.meta.client
  ? import.meta.glob<string>('./*/*/*.vue', { query: '?raw', import: 'default' })
  : {}

export const loadBlock = (family: string, category: string, file: string) => components[`./${family}/${category}/${file}.vue`]
export const loadSource = (family: string, category: string, file: string) => sources[`./${family}/${category}/${file}.vue`]

export const findFamily = (id: string) => families.find(f => f.id === id)
export const findCategory = (family: string, id: string) => findFamily(family)?.categories.find(x => x.id === id)

export const blockCount = () => families.reduce((n, f) => n + f.categories.filter(x => !x.ref).reduce((m, x) => m + blocksOf(f.id, x.id).length, 0), 0)
export const categoryCount = () => families.reduce((n, f) => n + f.categories.filter(x => !x.ref).length, 0)
