// Application UI block catalog: every family and category of the Preline "Application UI" collection,
// rebuilt with Mica components. Blocks live in `blocks/<family>/<category>/<Name>.vue`, described by the
// `meta.json` next to them; this file only names the families and categories and orders them.

export interface Localized { en: string, fr: string }

export interface BlockCategory {
  id: string
  title: Localized
  /** Number of variants in the Preline category this one answers. */
  preline: number
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

const c = (id: string, en: string, fr: string, preline: number, ref?: string): BlockCategory => ({ id, title: { en, fr }, preline, ref })

export const families: BlockFamily[] = [
  {
    id: 'analytics',
    title: { en: 'Analytics & KPIs', fr: 'Analytique et KPI' },
    summary: { en: 'Charts, KPI cards, rankings, progress and maps for dashboards and reports.', fr: 'Graphiques, cartes KPI, classements, progression et cartes pour tableaux de bord et rapports.' },
    categories: [
      c('bar-charts', 'Bar Charts', 'Diagrammes en barres', 9),
      c('line-area-charts', 'Line & Area Charts', 'Courbes et aires', 5),
      c('pie-radial-charts', 'Pie & Radial Charts', 'Secteurs et radiaux', 6),
      c('chart-compositions', 'Chart Compositions', 'Compositions de graphiques', 10),
      c('kpi-cards', 'KPI Cards', 'Cartes KPI', 17),
      c('spark-charts', 'Spark Charts', 'Micro-graphiques', 5),
      c('ranking-cards', 'Ranking Cards', 'Cartes de classement', 3),
      c('progress-cards', 'Progress Cards', 'Cartes de progression', 15),
      c('data-maps', 'Data Maps', 'Cartes de données', 1)
    ]
  },
  {
    id: 'data-display',
    title: { en: 'Data Display', fr: 'Affichage de données' },
    summary: { en: 'Projects, files, feeds, timelines and lists for scanning and monitoring.', fr: 'Projets, fichiers, flux, chronologies et listes pour parcourir et surveiller.' },
    categories: [
      c('projects', 'Projects', 'Projets', 3),
      c('file-views', 'File Views', 'Vues de fichiers', 10),
      c('team-profile-views', 'Team & Profile Views', 'Équipe et profils', 2),
      c('integrations', 'Integrations', 'Intégrations', 4),
      c('data-management', 'Data Management', 'Gestion des données', 3),
      c('activity-feeds', 'Activity Feeds', "Flux d'activité", 6),
      c('timelines', 'Timelines', 'Chronologies', 6),
      c('description-lists', 'Description Lists', 'Listes de description', 9),
      c('list-groups', 'List Groups', 'Groupes de listes', 12)
    ]
  },
  {
    id: 'tables',
    title: { en: 'Tables', fr: 'Tableaux' },
    summary: { en: 'Record, order, product, project and analytics grids for back offices.', fr: "Grilles d'enregistrements, commandes, produits, projets et analyses pour back-offices." },
    categories: [
      c('user-contact-tables', 'User & Contact Tables', 'Utilisateurs et contacts', 10),
      c('order-billing-tables', 'Order & Billing Tables', 'Commandes et facturation', 7),
      c('product-tables', 'Product Tables', 'Produits', 3),
      c('project-tables', 'Project Tables', 'Projets', 3),
      c('analytics-tables', 'Analytics Tables', 'Tableaux analytiques', 6),
      c('content-tables', 'Content Tables', 'Contenus', 3),
      c('admin-utility-tables', 'Admin Utility Tables', "Utilitaires d'administration", 3)
    ]
  },
  {
    id: 'forms',
    title: { en: 'Forms', fr: 'Formulaires' },
    summary: { en: 'Settings, uploads, filters, pickers, payments and every data-entry pattern.', fr: 'Réglages, envois, filtres, sélecteurs, paiements et toutes les saisies de données.' },
    categories: [
      c('advanced-forms', 'Advanced Forms', 'Formulaires avancés', 5),
      c('transfer-forms', 'Transfer Forms', 'Formulaires de transfert', 3),
      c('form-pages-settings', 'Form Pages & Settings', 'Pages de formulaire et réglages', 11),
      c('text-editors', 'Text Editors', 'Éditeurs de texte', 3),
      c('message-composer-textareas', 'Message Composer Textareas', 'Zones de rédaction de message', 9),
      c('utility-textareas', 'Utility Textareas', 'Zones de texte utilitaires', 1),
      c('option-pickers', 'Option Pickers', "Sélecteurs d'options", 13),
      c('selectable-cards-lists', 'Selectable Cards & Lists', 'Cartes et listes sélectionnables', 14),
      c('checkbox-preference-controls', 'Checkbox & Preference Controls', 'Cases à cocher et préférences', 8),
      c('ratings-emoji-selectors', 'Ratings & Emoji Selectors', 'Notes et emojis', 6),
      c('switches', 'Switches', 'Interrupteurs', 5),
      c('create-edit-forms', 'Create & Edit Forms', 'Création et édition', 10),
      c('file-upload-forms', 'File Upload Forms', 'Envoi de fichiers', 4),
      c('image-upload-forms', 'Image Upload Forms', "Envoi d'images", 3),
      c('document-import-uploads', 'Document & Import Uploads', 'Documents et imports', 2),
      c('create-edit-form-modals', 'Create & Edit Form Modals', 'Modales de création et édition', 10),
      c('content-editor-forms', 'Content Editor Forms', 'Éditeurs de contenu', 1),
      c('range-controls', 'Range Controls', 'Plages de valeurs', 3),
      c('filter-panels', 'Filter Panels', 'Panneaux de filtres', 3),
      c('filter-bars', 'Filter Bars', 'Barres de filtres', 12),
      c('payment-method-forms', 'Payment Method Forms', 'Moyens de paiement', 6),
      c('billing-upgrade-forms', 'Billing & Upgrade Forms', 'Facturation et montée en gamme', 3),
      c('contact-feedback-forms', 'Contact & Feedback Forms', 'Contact et retours', 3),
      c('newsletter-signup-forms', 'Newsletter Signup Forms', 'Inscription à la newsletter', 4),
      c('product-review-forms', 'Product Review Forms', 'Avis produit', 1)
    ]
  },
  {
    id: 'authentication',
    title: { en: 'Authentication', fr: 'Authentification' },
    summary: { en: 'Sign in, sign up, recovery, verification, onboarding and setup journeys.', fr: 'Connexion, inscription, récupération, vérification, accueil et configuration.' },
    categories: [
      c('authentication-pages', 'Authentication Pages', "Pages d'authentification", 5),
      c('verification-recovery-pages', 'Verification & Recovery Pages', 'Vérification et récupération', 4),
      c('guest-checkout-order-lookup', 'Guest Checkout & Order Lookup', 'Commande invité et suivi', 3),
      c('authentication-form-snippets', 'Authentication Form Snippets', "Fragments d'authentification", 3),
      c('authentication-modals', 'Authentication Modals', "Modales d'authentification", 4),
      c('onboarding-pages', 'Onboarding Pages', "Pages d'accueil", 4),
      c('set-up-flows', 'Set Up Flows', 'Parcours de configuration', 4)
    ]
  },
  {
    id: 'application-pages',
    title: { en: 'Application Pages', fr: "Pages d'application" },
    summary: { en: 'Admin screens, AI interfaces, profiles and account pages.', fr: "Écrans d'administration, interfaces IA, profils et pages de compte." },
    categories: [
      c('admin-dashboard-pages', 'Admin Dashboard Pages', "Tableaux de bord d'administration", 1),
      c('ai-interface-pages', 'AI Interface Pages', "Pages d'interface IA", 4),
      c('profile-cards-status-panels', 'Profile Cards & Status Panels', 'Cartes de profil et statuts', 5),
      c('person-account-detail-headers', 'Person & Account Detail Headers', 'En-têtes de personne et compte', 5),
      c('settings-modals', 'Settings Modals', 'Modales de réglages', 4)
    ]
  },
  {
    id: 'billing',
    title: { en: 'Billing & Payments', fr: 'Facturation et paiements' },
    summary: { en: 'Invoices, plans, transactions, payment methods and cards.', fr: 'Factures, offres, transactions, moyens de paiement et cartes.' },
    categories: [
      c('invoice-layouts', 'Invoice Layouts', 'Mises en page de facture', 3),
      c('subscription-plans', 'Subscription Plans', "Offres d'abonnement", 2),
      c('payment-transaction-details', 'Payment Transaction Details', 'Détails de transaction', 3),
      c('payment-method-modals', 'Payment Method Modals', 'Modales de moyen de paiement', 3),
      c('payment-method-panels', 'Payment Method Panels', 'Panneaux de moyens de paiement', 4),
      c('payment-cards', 'Payment Cards', 'Cartes de paiement', 1)
    ]
  },
  {
    id: 'communication',
    title: { en: 'Communication', fr: 'Communication' },
    summary: { en: 'Inbox, chat, AI chat, support widgets, calls, voice and contacts.', fr: 'Messagerie, chat, chat IA, support, appels, messages vocaux et contacts.' },
    categories: [
      c('inbox-layouts', 'Inbox Layouts', 'Boîtes de réception', 1),
      c('chat-workspace-layouts', 'Chat Workspace Layouts', 'Espaces de discussion', 6),
      c('customer-detail-layouts', 'Customer Detail Layouts', 'Fiches client', 1),
      c('ai-chat-layouts', 'AI Chat Layouts', 'Chats IA', 2),
      c('chat-toolbars', 'Chat Toolbars', 'Barres de chat', 2),
      c('message-bubbles', 'Message Bubbles', 'Bulles de message', 4),
      c('media-attachment-bubbles', 'Media & Attachment Bubbles', 'Bulles média et pièces jointes', 6),
      c('ai-chat-bubbles', 'AI Chat Bubbles', 'Bulles de chat IA', 2),
      c('support-chat-widgets', 'Support Chat Widgets', 'Widgets de support', 6),
      c('support-chat-sidebars', 'Support Chat Sidebars', 'Panneaux de support', 1),
      c('inbox-threads', 'Inbox Threads', 'Fils de discussion', 2),
      c('video-call-layouts', 'Video Call Layouts', 'Appels vidéo', 4),
      c('call-device-settings', 'Call Device Settings', "Réglages d'appareils d'appel", 1),
      c('voice-messages', 'Voice Messages', 'Messages vocaux', 3),
      c('contact-cards', 'Contact Cards', 'Cartes de contact', 3),
      c('connections-selectors', 'Connections & Selectors', 'Connexions et sélecteurs', 3)
    ]
  },
  {
    id: 'productivity',
    title: { en: 'Productivity', fr: 'Productivité' },
    summary: { en: 'Calendars, schedules, planning boards and kanban.', fr: 'Calendriers, plannings, tableaux de planification et kanban.' },
    categories: [
      c('calendar-views', 'Calendar Views', 'Vues de calendrier', 4),
      c('calendar-drawers', 'Calendar Drawers', 'Tiroirs de calendrier', 3),
      c('schedule-management', 'Schedule Management', 'Gestion de planning', 3),
      c('scheduling-modals', 'Scheduling Modals', 'Modales de planification', 4),
      c('month-year-calendars', 'Month & Year Calendars', 'Calendriers mois et année', 3),
      c('kanban-board-layouts', 'Kanban Board Layouts', 'Tableaux kanban', 5),
      c('kanban-group-headings', 'Kanban Group Headings', 'En-têtes de colonnes kanban', 4),
      c('kanban-board-cards', 'Kanban Board Cards', 'Cartes kanban', 4)
    ]
  },
  {
    id: 'feedback',
    title: { en: 'Feedback & States', fr: 'Retours et états' },
    summary: { en: 'Empty and success states, shortcuts, reviews and consent prompts.', fr: 'États vides et de réussite, raccourcis, avis et consentement.' },
    categories: [
      c('empty-states', 'Empty States', 'États vides', 8),
      c('success-states', 'Success States', 'États de réussite', 2),
      c('action-cards-shortcut-links', 'Action Cards & Shortcut Links', "Cartes d'action et raccourcis", 17),
      c('product-review-sections', 'Product Review Sections', "Sections d'avis produit", 3),
      c('cookie-consent-prompts', 'Cookie Consent Prompts', 'Consentement aux cookies', 10)
    ]
  },
  {
    id: 'search',
    title: { en: 'Search & Command', fr: 'Recherche et commandes' },
    summary: { en: 'Search results and keyboard-first command palettes.', fr: 'Résultats de recherche et palettes de commandes au clavier.' },
    categories: [
      c('search-results', 'Search Results', 'Résultats de recherche', 9),
      c('command-palette-modals', 'Command Palette Modals', 'Palettes de commandes', 6)
    ]
  },
  {
    id: 'modals',
    title: { en: 'Modals', fr: 'Modales' },
    summary: { en: 'Task-focused dialogs, gathered from the families that own them.', fr: 'Dialogues centrés sur une tâche, regroupés depuis leurs familles.' },
    categories: [
      c('authentication-modals', 'Authentication Modals', "Modales d'authentification", 4, 'authentication'),
      c('settings-modals', 'Settings Modals', 'Modales de réglages', 4, 'application-pages'),
      c('create-edit-form-modals', 'Create & Edit Form Modals', 'Modales de création et édition', 10, 'forms'),
      c('scheduling-modals', 'Scheduling Modals', 'Modales de planification', 4, 'productivity'),
      c('payment-method-modals', 'Payment Method Modals', 'Modales de moyen de paiement', 3, 'billing')
    ]
  },
  {
    id: 'drawers',
    title: { en: 'Drawers', fr: 'Tiroirs' },
    summary: { en: 'Detail panels and filter drawers that slide from the edge.', fr: 'Panneaux de détail et tiroirs de filtres qui glissent depuis le bord.' },
    categories: [
      c('utility-detail-drawers', 'Utility & Detail Drawers', 'Tiroirs utilitaires et détails', 6),
      c('filter-drawers', 'Filter Drawers', 'Tiroirs de filtres', 2),
      c('listing-filter-panels', 'Listing Filter Panels', 'Filtres de listing', 3)
    ]
  },
  {
    id: 'ui-components',
    title: { en: 'UI Components', fr: "Composants d'interface" },
    summary: { en: 'Menus, selects, buttons, badges, chips, progress and links.', fr: 'Menus, listes, boutons, badges, puces, progression et liens.' },
    categories: [
      c('dropdown-menus', 'Dropdown Menus', 'Menus déroulants', 9),
      c('account-workspace-menus', 'Account & Workspace Menus', 'Menus de compte et espace', 8),
      c('selection-menus', 'Selection Menus', 'Menus de sélection', 10),
      c('select-menus', 'Select Menus', 'Listes de sélection', 13),
      c('tagging-selects', 'Tagging Selects', "Sélecteurs d'étiquettes", 2),
      c('embedded-compact-selects', 'Embedded & Compact Selects', 'Sélecteurs intégrés et compacts', 4),
      c('ecommerce-menus', 'Ecommerce Menus', 'Menus e-commerce', 4),
      c('editor-toolbar-menus', 'Editor & Toolbar Menus', "Menus d'éditeur et barres d'outils", 4),
      c('profile-popovers', 'Profile Popovers', 'Popovers de profil', 2),
      c('buttons', 'Buttons', 'Boutons', 9),
      c('action-button-groups', 'Action Button Groups', "Groupes de boutons d'action", 6),
      c('segmented-controls', 'Segmented Controls', 'Contrôles segmentés', 3),
      c('label-feedback-groups', 'Label & Feedback Groups', 'Libellés et retours', 4),
      c('badge-styles', 'Badge Styles', 'Styles de badge', 8),
      c('status-badges', 'Status Badges', 'Badges de statut', 4),
      c('tag-chips', 'Tag Chips', 'Puces', 7),
      c('progress-indicators', 'Progress Indicators', 'Indicateurs de progression', 9),
      c('utility-links', 'Utility Links', 'Liens utilitaires', 3)
    ]
  },
  {
    id: 'navigation',
    title: { en: 'Navigation & Layout', fr: 'Navigation et mise en page' },
    summary: { en: 'Headers, navbars, sidebars, tabs, shells, footers and error pages.', fr: "En-têtes, barres de navigation, barres latérales, onglets, coquilles, pieds de page et pages d'erreur." },
    categories: [
      c('dashboard-headers', 'Dashboard Headers', 'En-têtes de tableau de bord', 7),
      c('workspace-headers', 'Workspace Headers', "En-têtes d'espace de travail", 12),
      c('application-navbars', 'Application Navbars', "Barres de navigation d'application", 6),
      c('flow-headers', 'Flow Headers', 'En-têtes de parcours', 1),
      c('secondary-navs', 'Secondary Navs', 'Navigations secondaires', 4),
      c('scroll-navigation', 'Scroll Navigation', 'Navigation au défilement', 2),
      c('card-tabs', 'Card Tabs', 'Onglets en carte', 11),
      c('dashboard-sidebars', 'Dashboard Sidebars', 'Barres latérales de tableau de bord', 6),
      c('application-sidebars', 'Application Sidebars', "Barres latérales d'application", 5),
      c('dashboard-sidebar-modules', 'Dashboard Sidebar Modules', 'Modules de barre latérale', 5),
      c('sidebar-navigation', 'Sidebar Navigation', 'Navigation latérale', 2),
      c('multi-panel-layouts', 'Multi-Panel Layouts', 'Mises en page multi-panneaux', 7),
      c('detached-sidebar-layouts', 'Detached Sidebar Layouts', 'Barres latérales détachées', 2),
      c('dashboard-demo-layouts', 'Dashboard Demo Layouts', 'Démos de tableau de bord', 4),
      c('title-bars', 'Title Bars', 'Barres de titre', 17),
      c('dashboard-footers', 'Dashboard Footers', 'Pieds de tableau de bord', 1),
      c('stacked-footers', 'Stacked Footers', 'Pieds de page empilés', 2),
      c('blank-error-pages', 'Blank & Error Pages', "Pages vides et d'erreur", 4),
      c('sticky-layouts', 'Sticky Layouts', 'Mises en page collantes', 2)
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
