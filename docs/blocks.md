# Application UI blocks

Inventory of the Mica block gallery, generated from `site/app/blocks/catalog.ts` and the `meta.json` files by `scripts/gen-manifest.mjs`. Blocks are original, copy-pasteable sections built only with Mica components; each is one SFC at `site/app/blocks/<family>/<category>/<Name>.vue`, shown at `/blocks/<family>/<category>` on the site. Authoring rules: `site/app/blocks/README.md`.

183 blocks in 139 categories. Each line: `<family>/<category>/<Name>` title: summary.

## Analytics & KPIs

Charts, KPI cards, rankings, progress and maps for dashboards and reports.

### Bar Charts

- `analytics/bar-charts/SupportLoadBars` Support load by hour: Tickets per 2-hour window against staffed capacity: windows over capacity turn to the accent color and the panel suggests the rota move that closes the worst gap.

### Line & Area Charts

- `analytics/line-area-charts/SignupForecastArea` Sign-ups against forecast: An area chart of trial sign-ups with forecast and last year as optional overlays, a beat-or-miss strip per period and the moments that moved the line.
- `analytics/line-area-charts/MultiSeriesCrosshair` Multi-series crosshair: Latency by region with a pointer and keyboard crosshair whose readout ranks every visible series, legend toggles that hide a line, and incidents pinned to the time axis.
- `analytics/line-area-charts/StackedChannelArea` Stacked channel area: Sign-ups stacked by acquisition channel, switching between counts and 100% with a crossfade, beside share bars for the month under the cursor; the channel the story is about carries the only accent.
- `analytics/line-area-charts/PeriodDeltaLine` Period over period gap: This period against the previous one, the gap between the lines shaded as gain or loss segment by segment, with a running difference strip and figure that follow the cursor.

### Pie & Radial Charts

- `analytics/pie-radial-charts/CloudSpendDonut` Cloud bill breakdown: A donut of monthly cloud spend whose legend is also a selector: hover previews a service, a click pins it, and the side panel shows its budget meter and top line items.

### Chart Compositions

- `analytics/chart-compositions/ActivationReview` Activation review: A quarterly board that opens with a generated one-paragraph story, then backs it with a trend against target, a first-action mix and a time-to-value histogram; the platform switch rewrites everything.

### KPI Cards

- `analytics/kpi-cards/KpiPulseBoard` Revenue pulse board: A hero metric with its goal meter and trend, framed by stat tiles and a split MRR card; the period switch swaps every figure.
- `analytics/kpi-cards/KpiTargetBands` KPIs against target bands: Each card draws twelve weeks against its shaded target band, so on or off plan reads at a glance; open a card to see the larger chart and where each segment sits in the band.
- `analytics/kpi-cards/KpiNarrativeBento` Narrative bento: A bento of metric tiles led by a paragraph written from the numbers; every figure in the text cites its tile, and pointing at either one lights up the other.
- `analytics/kpi-cards/KpiBulletRow` Bullet chart KPI strip: A dense strip for the top of a dashboard: each metric is a bullet chart with qualitative ranges, target tick and last-period marker, plus a delta chip; the period switch moves every mark.

### Spark Charts

- `analytics/spark-charts/EdgeLatencyWatch` Edge latency watch: A region watchlist with a sparkline per row, p95 change and an SLO headroom bar; sort, filter to degraded regions and switch the window, with rows sliding into their new order.

### Ranking Cards

- `analytics/ranking-cards/QuarterLeaderboard` Quarter leaderboard: A leader card with the margin they hold, then every other rep with movement since last quarter, a bar against the leader and the gap to the person above; the metric switch re-ranks the list with a sliding transition.

### Progress Cards

- `analytics/progress-cards/OkrPaceBoard` OKR pace board: Objectives with key results read against the quarter clock: each bar carries a pace tick for where it should be today, statuses follow from the gap, and a check-in stepper updates progress in place.
- `analytics/progress-cards/QuotaRunwayCards` Plan usage runway: Quota cards that project usage to the reset date: a hatched forecast runs past the limit line when a quota will run out, with the day it happens and a one-click request.

### Data Maps

- `analytics/data-maps/MarketTileMap` Market tile map: A world tile map with one tile per market and no geodata: tiles shade by fifths of the chosen metric, a region filter dims the rest, and a ranked legend and readout follow the tile you point at.

## Data Display

Projects, files, feeds, timelines and lists for scanning and monitoring.

### Projects

- `data-display/projects/ProjectPaceBoard` Project pace board: Client project cards where a tick on each progress bar marks where the work should be today, turning every card into an ahead or behind verdict; filter by pace and sort by due date or lag.

### File Views

- `data-display/file-views/FileShelf` Drawn file shelf: A shared folder in grid or list view where every preview (page, sheet, photo, video, waveform, design) is drawn from tokens; filter by type, search, and pick files to get a selection bar with their combined size.

### Team & Profile Views

- `data-display/team-profile-views/TeamTimeZones` Team across time zones: A distributed team directory with an overlap ribbon: each bar is a UTC hour sized by who is at work, and picking one updates every card's local time, day strip and availability; one tap finds the best meeting slot.

### Integrations

- `data-display/integrations/IntegrationHub` Integration hub with sync pulse: Connected apps show a 24-hour sync pulse with failed deliveries in red and a pause switch; the catalog below filters by category and search, and Connect moves an app into the live section.

### Data Management

- `data-display/data-management/DatasetInventory` Warehouse table inventory: Warehouse tables ranked by freshness against their SLA, with a detail pane that lists columns with null shares and PII masking switches, or switches to a lineage view from sources to the dashboards that depend on the table.

### Activity Feeds

- `data-display/activity-feeds/ActivityDigest` Activity digest: A team feed grouped by day under a week of density bars you can click to jump to a day; type chips filter it, and bursts of commits fold into one line that expands to the hashes.

### Timelines

- `data-display/timelines/IncidentTimeline` Incident timeline: A postmortem view where a ribbon sized by real phase durations (detect, triage, mitigate, monitor) filters the timeline below, with the alert's error spike and the key decision quoted in place.

### Description Lists

- `data-display/description-lists/ContractDetails` Editable contract details: Two description lists for a customer contract with copyable IDs and inline editing; edits are highlighted with their previous value, derived figures recalculate, and a change tray collects them until saved or discarded.

### List Groups

- `data-display/list-groups/ReleaseChecklist` Release checklist groups: Grouped task lists for an app release under a segmented gauge where each group fills on its own; finished groups fold into a single line, and the scope switch shows all, open or only your tasks.

## Tables

Record, order, product, project and analytics grids for back offices.

### User & Contact Tables

- `tables/user-contact-tables/MemberAccessTable` Member access table: Workspace members with a seat meter, inline role selects, 2FA status and a 12-week activity strip that makes dormant accounts fade out; search, role filter, sorting and bulk role changes, stacked as cards at narrow widths.
- `tables/user-contact-tables/ContactWarmthTable` Contact warmth table: CRM contacts grouped by account, each with a warmth strip that cools from orange to blue as days pass since the last touch; collapsible account rows with a heat signature and totals, rows that expand to the last three interactions, and a one-click call log that warms a contact back up.
- `tables/user-contact-tables/SheetGridTable` Spreadsheet grid: A dense, spreadsheet-like contact sheet: sticky header and first column, a formula bar with the active cell address, arrow-key navigation with Shift range selection, Enter to edit and Esc to cancel, a column visibility menu and a live count, sum and average of the selection.
- `tables/user-contact-tables/TeamDirectory` Team directory: A people directory with a table or cards view, department filter chips, an A–Z scrubber that jumps to a letter and follows your scroll, and a live local time for everyone with a 24-hour strip showing their working window and whether they can be reached now.

### Order & Billing Tables

- `tables/order-billing-tables/ReceivablesAgingTable` Receivables aging table: Open invoices under an aging strip that splits the outstanding total by lateness; each bucket filters the table, overdue rows show how late they are and can be reminded, and the list turns into cards on small screens.

### Product Tables

- `tables/product-tables/StockCoverTable` Stock cover table: A product catalog where each row shows days of stock left against the supplier's lead time, so items that will sell out before a restock stand out and can be reordered; listing switches, search and views, cards on small screens.

### Project Tables

- `tables/project-tables/RoadmapGanttTable` Roadmap table with inline Gantt: A sortable project table whose schedule column is a Gantt chart: month lines and today's line run through every row, bars are clipped to the chosen range (quarter or six weeks), and budget burn sits beside each project.

### Analytics Tables

- `tables/analytics-tables/ChannelPerformanceTable` Channel performance table: Acquisition channels with in-cell data bars that keep a ghost tick at last period's sessions, conversion chips tinted by rate, revenue deltas and trend sparklines; the period switch rescales every figure and the totals above.

### Content Tables

- `tables/content-tables/EditorialPipelineTable` Editorial pipeline table: Articles from draft to live with four readiness checks (copy, images, SEO, legal) that editors tick in place; once all pass, a draft offers to schedule itself into the next slot. Status filter with counts, search, sorting and pagination.

### Admin Utility Tables

- `tables/admin-utility-tables/ApiKeysTable` API keys table: API keys with masked tokens, read and write scopes, a week of usage, and an expiry bar measured against each key's own lifetime; idle and expiring keys are flagged, rotation is one click and revoking asks for an inline confirmation.

## Forms

Settings, uploads, filters, pickers, payments and every data-entry pattern.

### Advanced Forms

- `forms/advanced-forms/IncidentDeclareForm` Incident declaration form: A conditional incident form: severity drives the accent and locks paging, the status page message appears only when public, and a live preview plus readiness list track what is still missing.

### Transfer Forms

- `forms/transfer-forms/ApiScopeTransfer` API key scope transfer: Two filterable lists move scopes onto a restricted key; a blast-radius meter and a plain-English sentence say what the key can do, and admin scopes require an explicit acknowledgement.

### Form Pages & Settings

- `forms/form-pages-settings/WorkspaceSettingsPage` Workspace settings page: A sectioned settings page whose nav marks sections with unsaved edits or errors; one save bar lists every pending change and can discard or save them together.
- `forms/form-pages-settings/ProfileLivePreview` Profile with live preview: Profile fields beside the card teammates will see, updating as you type: the handle is checked for availability with free suggestions, and the preview shrinks to a sticky strip on narrow screens.
- `forms/form-pages-settings/NotificationMatrix` Notification matrix: Events against channels in one grid, with row and column toggles that go mixed when partly on, a weekly volume forecast per channel, quiet hours on a 24-hour strip and a digest choice.
- `forms/form-pages-settings/SecurityCenter` Security center: A protection score that climbs as you set up two-step login, store recovery codes and revoke an unrecognised device, each with an inline flow and confirmation.

### Text Editors

- `forms/text-editors/ReleaseNotesEditor` Release notes editor: A rich-text document with an inline title, autosave status, live word count and reading time, an outline built from its headings and a readiness ring that gates publishing.

### Message Composer Textareas

- `forms/message-composer-textareas/SupportReplyComposer` Support reply composer: A ticket composer that switches between customer reply and internal note (the field turns into a sticky note), inserts saved replies, attaches files and catches a mentioned but missing attachment before sending.

### Utility Textareas

- `forms/utility-textareas/EnvImportTextarea` Environment variable import: Paste a .env file and every line is parsed as you type: invalid names, duplicates, empty values and overwritten keys are flagged per line, and detected secrets are masked before import.

### Option Pickers

- `forms/option-pickers/MeetingSlotPicker` Meeting slot picker: Length, place and time zone pickers drive a day strip with availability pips and a slot grid that shows each start in both your time and the host's; longer meetings drop slots that no longer fit.
- `forms/option-pickers/IssuePropertyPicker` Issue property pickers: An issue's status, priority, assignees and labels, each opening its own inline picker: single choice closes on pick, multi-select stays open, and labels can be created from the search with validation.

### Selectable Cards & Lists

- `forms/selectable-cards-lists/RegionSelectCards` Region selection cards: Radio cards compare latency, grid carbon and price per region with a best-balance badge, sortable and filterable by area; an EU residency switch locks other regions, and a checkbox list picks backup replicas.

### Checkbox & Preference Controls

- `forms/checkbox-preference-controls/NotificationMatrix` Notification channel matrix: Events by channel in one checkbox matrix with mixed-state column toggles, a locked security row and presets that light up only while they match; a live estimate shows weekly volume per channel.

### Ratings & Emoji Selectors

- `forms/ratings-emoji-selectors/SessionFeedbackCard` Session feedback card: Five drawn faces whose mouths curve from frown to grin set the card's tint and the follow-up chips, then half-star ratings for three aspects and an optional note; it ends on a thank-you with the running average.

### Switches

- `forms/switches/FeatureFlagSwitchboard` Feature flag switchboard: Per-environment switches for each flag, with stale-flag hints and a filter; turning one on in production opens an inline rollout slider and a required audit reason, while turning it off acts instantly as a kill switch.

### Create & Edit Forms

- `forms/create-edit-forms/MemberRecordEditor` Member record editor: One record that reads as details, edits in place or starts blank for a new member; contractors reveal an end date, and saving goes through a field-by-field diff review with undo afterwards.

### File Upload Forms

- `forms/file-upload-forms/VendorDocsUpload` Compliance document upload: A drop zone with simulated per-file progress feeds a checklist of required documents, auto-matched from file names; the insurance certificate asks for its expiry, and a ring counts what is still missing.

### Image Upload Forms

- `forms/image-upload-forms/FocalPointUpload` Cover upload with focal point: Upload a cover, then set its focal point on the image: the header, feed card and badge crops re-frame live, with alt text validated before saving.

### Document & Import Uploads

- `forms/document-import-uploads/ContactImportMapper` CSV import with column matching: Upload a CSV (or the sample), match its columns to contact fields with automatic guesses, then review a health bar of ready, invalid and duplicate rows before importing.

### Create & Edit Form Modals

- `forms/create-edit-form-modals/NewProjectSheet` New project sheet: A create form in a sheet over the project board: the key follows the name until edited, the color and template cards update a live identity preview, and Create stays off until the key is valid and free.
- `forms/create-edit-form-modals/InviteMembersDialog` Invite members dialog: A compact dialog that turns pasted emails into tags, tells teammates from free external guests, and shows on a seat bar whether the invite fits the plan.

### Content Editor Forms

- `forms/content-editor-forms/ArticleComposer` Article composer with publishing checks: A headline, excerpt, rich-text body and tags beside a live search snippet, a length meter and a checklist that unlocks Publish once every check passes.

### Range Controls

- `forms/range-controls/PriceRangeHistogram` Price range over a histogram: A dual price slider under a histogram of bookable stays, synced min and max fields, presets, plus distance and rating sliders that reshape the histogram and the live count.

### Filter Panels

- `forms/filter-panels/JobFacetPanel` Faceted filter panel: A job board side panel whose counts are true facets: each number shows what you would get with every other filter applied, empty options turn off, and active filters become removable chips.

### Filter Bars

- `forms/filter-bars/IssueQueryBar` Query token filter bar: Filters as tokens you can read: flip is / is not in one click, change values from a menu, switch match all or any, and see the whole query read back as a sentence over the issue list.
- `forms/filter-bars/OrderStatusBar` Order status filter bar: Status pills with live counts and a clickable distribution strip, followed by search, channel, flagged and sort controls that recount every pill as they change.

### Payment Method Forms

- `forms/payment-method-forms/CardPaymentForm` Card and SEPA payment form: A live card that recolors with the detected brand and flips to its back for the security code, a number mask grouped per brand with a Luhn check, and a SEPA tab that validates IBAN length and checksum. UI only, with test numbers.

### Billing & Upgrade Forms

- `forms/billing-upgrade-forms/SeatUpgradeForm` Plan and seat upgrade: Pick a plan, cycle and seat count while a summary prorates the change: a bar shows the unused part of the current cycle turned into credit, and the pay button carries the exact amount due today.

### Contact & Feedback Forms

- `forms/contact-feedback-forms/AdaptiveFeedbackForm` Adaptive feedback form: A five-face mood scale that rewrites the follow-up question, its topic chips and the placeholder; a rough answer offers a support callback, a happy one asks to quote you.

### Newsletter Signup Forms

- `forms/newsletter-signup-forms/DigestSignupForm` Newsletter signup with issue preview: Email, frequency and topic choices drive a live preview of the next issue: its send date, subject line, stories and reading time change as you pick.

### Product Review Forms

- `forms/product-review-forms/ProductReviewForm` Product review with live preview: Star rating, a runs-small to runs-large fit scale, aspect stars, pros and cons tags, photos and a length meter, mirrored in a preview of the card shoppers will see.

## Authentication

Sign in, sign up, recovery, verification, onboarding and setup journeys.

### Authentication Pages

- `authentication/authentication-pages/SignInContours` Split sign-in with contour art: Passkey-first sign-in beside a generative contour map seeded by the email domain, so each workspace gets its own terrain.
- `authentication/authentication-pages/SignUpStrength` Sign-up with a faceted strength gem: Password strength drawn as a five-facet gem: each rule met slides a facet into place, and the stone settles once all are set. SSO, terms and real validation included.
- `authentication/authentication-pages/MagicLinkFlow` Passwordless magic link flow: One card that moves from email to inbox to code: mail app shortcuts, a resend countdown, a link lifetime draining along the top edge and a pasteable 6-digit fallback.
- `authentication/authentication-pages/ReturningAccountChooser` Returning account chooser with changelog: Saved accounts as cards with last use, workspace and SSO badges; the sign-in method follows the pick, and the changelog shows only what shipped since that account's last visit.

### Verification & Recovery Pages

- `authentication/verification-recovery-pages/VerifyCodeRecovery` Verification code with recovery fallback: A one-time code screen with email, SMS or authenticator delivery, an attempts meter, resend cooldown and a switch to single-use recovery codes.

### Guest Checkout & Order Lookup

- `authentication/guest-checkout-order-lookup/OrderLookupJourney` Guest order lookup with delivery rail: Find an order with its number and postcode, then follow it along a delivery rail with glaze-painted items and an offer to save it to an account.

### Authentication Form Snippets

- `authentication/authentication-form-snippets/AuthSnippetTrio` Magic link, password and passkey snippets: Three drop-in cards: a sign-in link that becomes its own confirmation, a password setter with live strength and match checks, and a one-tap passkey return.

### Authentication Modals

- `authentication/authentication-modals/StepUpAuthDialog` Step-up re-authentication dialog: A sensitive action asks for a fresh sign-in: password or passkey in a dialog over the API keys page, which then unlocks for ten minutes.

### Onboarding Pages

- `authentication/onboarding-pages/OnboardingLivePreview` Onboarding with a live workspace preview: Role cards, space chips and team size on one side; a miniature of the future workspace assembles itself on the other as each answer lands.
- `authentication/onboarding-pages/SetupChecklist` First-run setup checklist: A ring that counts minutes left, not percent; each task opens inline with its real action (invites, repository, theme), and finished ones fold into a completed list with a drawn check.
- `authentication/onboarding-pages/ConversationalOnboarding` Conversational onboarding: Setup as a short chat: questions arrive as assistant bubbles, tappable chips become your reply, every answer stays editable from a topic rail, and a summary card closes the loop.
- `authentication/onboarding-pages/ConnectToolsStep` Connect your tools step: Integrations as toggle cards with a live connecting state; a stacked meter adds each tool's hours saved per week and measures the total against a full workday.

### Set Up Flows

- `authentication/set-up-flows/DomainSetupFlow` Workspace and domain setup flow: Four validated steps with working back and next: name and address, DNS records to copy and verify, invitations as tags, then a review before launch.

## Application Pages

Admin screens, AI interfaces, profiles and account pages.

### Admin Dashboard Pages

- `application-pages/admin-dashboard-pages/StudioOpsDashboard` Studio back-office dashboard: A full admin shell for a ceramics shop: sidebar, header with search, KPI tiles, a week-over-week sales chart, a low-stock panel and a searchable orders table.
- `application-pages/admin-dashboard-pages/SaasMetricsDashboard` SaaS revenue dashboard: A top-navigation revenue page: a strip of headline figures, an MRR bridge from opening to closing MRR whose steps reveal the accounts behind them, and a cohort retention heatmap shaded in the brand colour.
- `application-pages/admin-dashboard-pages/SupportQueueDashboard` Support queue wallboard: A live support desk: tickets in priority lanes with SLA countdowns that turn amber then red before breach, one-click take that loads your bar, agent presence with workload meters and a CSAT trend.
- `application-pages/admin-dashboard-pages/ReleaseOpsDashboard` Release operations dashboard: An engineering page: a 24-hour deployment timeline across preview, staging and production that traces a build's promotion path, 90-day uptime bars per service, open incidents and the on-call rotation.

### AI Interface Pages

- `application-pages/ai-interface-pages/AnalystAgentWorkbench` Analyst agent workbench: An AI analysis workspace: threads, a cited answer with its reasoning trace, findings and SQL, and a composer with attachments and a live context-budget meter.

### Profile Cards & Status Panels

- `application-pages/profile-cards-status-panels/TeamPresencePanel` Team presence with time-zone overlap: Set your presence and status with a live preview, next to teammate cards whose 24-hour strips show exactly when your working days overlap.

### Person & Account Detail Headers

- `application-pages/person-account-detail-headers/AccountRenewalHeader` Account header with contract runway: A CRM account header: identity, owner and actions, a facts strip for revenue, seats, health and renewal, and a runway placing today between signature and renewal.

### Settings Modals

- `application-pages/settings-modals/WorkspaceSettingsSheet` Workspace settings sheet: A settings modal with its own section nav, shown open on a backdrop; edits mark their section with a dot, and the footer counts unsaved changes with save and discard.

## Billing & Payments

Invoices, plans, transactions, payment methods and cards.

### Invoice Layouts

- `billing/invoice-layouts/PerforatedInvoice` Printable invoice with tear-off slip: A paper-like invoice: sender and client facts, line items, totals that recompute with an early-payment discount, a paid stamp and a perforated payment slip with a barcode.

### Subscription Plans

- `billing/subscription-plans/SeatPlanPicker` Seat-based plan picker: Monthly or yearly billing and a team-size slider recompute every price, total and saving; plans outside their seat range step aside and the best fit moves with the team.
- `billing/subscription-plans/PlanFeatureMatrix` Plan feature matrix: Sticky plan headers over a feature matrix grouped by area: pick a feature to light up the plans that include it, hide the rows every plan shares, and switch plans one at a time on narrow screens.
- `billing/subscription-plans/UsagePriceCalculator` Usage price calculator: Sliders for events, editors and storage with their rate tiers marked underneath drive a live monthly estimate, split per line and set against the flat plan on the same scale.
- `billing/subscription-plans/CurrentPlanManager` Current plan manager: Quota meters that warn before a limit, an upgrade case built from the dates you hit it, and a plan change preview with prorated amounts, new limits and the effective date.

### Payment Transaction Details

- `billing/payment-transaction-details/TransactionMoneyTrail` Payment detail with money trail: One card payment end to end: amount and status, a bar splitting gross into net, fees and refunds, details, lifecycle timeline and a validated partial refund that updates it all.

### Payment Method Modals

- `billing/payment-method-modals/AddCardDialog` Add card dialog with live preview: A card form in a dialog over the billing page: the number formats and detects the network as you type, a mini card mirrors it, and expiry, CVC and checksum are validated.

### Payment Method Panels

- `billing/payment-method-panels/FallbackMethodsPanel` Payment methods as a fallback chain: Saved cards and a direct debit ordered by drag: the first is charged, the rest are numbered fallbacks; expiring cards are flagged and removal asks in place.

### Payment Cards

- `billing/payment-cards/TiltCardStudio` Tilting payment card with controls: A CSS-drawn card that tilts toward the pointer through nine hover zones and transforms only, flips to its back, freezes under frost, and changes colourway beside its spending limit.

## Communication

Inbox, chat, AI chat, support widgets, calls, voice and contacts.

### Inbox Layouts

- `communication/inbox-layouts/InboxReplyDebt` Reply-debt inbox: Three-pane inbox sorted by who owes the next move, with a waiting-time bar per sender; replying moves the thread to Waiting.

### Chat Workspace Layouts

- `communication/chat-workspace-layouts/DecisionLogWorkspace` Team chat with decision log: Channels, conversation and a decision log: mark any message as a decision and jump back to it from the side panel.

### Customer Detail Layouts

- `communication/customer-detail-layouts/CustomerDossier` Customer dossier: Support conversation beside the customer’s health, seats and relationship timeline; internal notes stay in the flow and land on the timeline.

### AI Chat Layouts

- `communication/ai-chat-layouts/AiCitedAnswers` Research chat with cited answers: AI research workspace: history, reasoning trace and numbered citations that light up their source cards; follow-ups stream in.

### Chat Toolbars

- `communication/chat-toolbars/MorphingChatToolbar` Morphing chat toolbar: One conversation toolbar with three modes: default actions, in-chat search with match stepping, and multi-select with bulk actions.

### Message Bubbles

- `communication/message-bubbles/QuoteReplyBubbles` Bubbles with quoted replies: Grouped bubbles with reactions, read receipts and an unread divider; quoted replies jump back to the original and flash it.

### Media & Attachment Bubbles

- `communication/media-attachment-bubbles/MediaMosaicBubbles` Photo mosaic and file bubbles: A photo mosaic that opens an inline viewer, file cards, a drawn location pin and attachments that upload with live progress.

### AI Chat Bubbles

- `communication/ai-chat-bubbles/AnswerDraftsBubble` Assistant answer with drafts: Assistant bubble with a reasoning trace, a diff code block and feedback; “try another approach” keeps earlier drafts behind a pager.

### Support Chat Widgets

- `communication/support-chat-widgets/SupportQueueWidget` Support widget with live queue: Floating support chat over a storefront: topic shortcuts, queue position, a typing agent and an unread badge on the launcher.

### Support Chat Sidebars

- `communication/support-chat-sidebars/HelpDeflectSidebar` Help sidebar that answers first: Docked help panel beside the app: while you type, matching guides appear above the composer; guides open in their own tab.

### Inbox Threads

- `communication/inbox-threads/CollapsedThreadStack` Email thread with folded replies: Long email thread with pinned key points; middle replies fold into a paper stack, each message expands on its own, replies append.

### Video Call Layouts

- `communication/video-call-layouts/SpeakerStageCall` Speaker stage call: Video call with a pinned stage, a filmstrip you can pin from, a moving speaking ring, call controls and an in-call chat.

### Call Device Settings

- `communication/call-device-settings/DeviceCheckPanel` Pre-call device check: Camera preview with mirror and blur, a mic level ladder that follows device and volume, speaker test and audio effects.

### Voice Messages

- `communication/voice-messages/VoiceTranscriptNotes` Voice notes with live transcript: Voice bubbles with a seekable waveform, playback speed and a transcript that follows playback; record and send a new note.

### Contact Cards

- `communication/contact-cards/TimezoneOverlapCards` Contacts with working-hour overlap: Contact cards showing local time, availability and how their working day overlaps yours; sort by overlap or name.

### Connections & Selectors

- `communication/connections-selectors/NewChatPicker` New conversation picker: Pick people as chips from suggested, team and external groups; a group takes shape with a suggested name and a guest notice.

## Productivity

Calendars, schedules, planning boards and kanban.

### Calendar Views

- `productivity/calendar-views/WeekFocusCalendar` Week view with focus windows: A week grid with positioned, side-by-side events, a now line and a meeting-load meter per day; each day's longest free stretch becomes a one-click focus block.

### Calendar Drawers

- `productivity/calendar-drawers/EventDetailDrawer` Event drawer with leave-by time: A day agenda behind an open side drawer that works back from the start time to when you should leave, with RSVP, guest statuses, a reminder and notes; picking a row swaps the event.

### Schedule Management

- `productivity/schedule-management/ShiftRosterPlanner` Shift roster with coverage: Paint early and late shifts onto a weekly roster while coverage rows count the gaps, hours meters flag overtime and short rest is marked; one click fills the gaps, then publish.

### Scheduling Modals

- `productivity/scheduling-modals/BookSlotDialog` Book a slot with shared availability: A scheduling dialog shown open over its page: pick a duration and a day, then a start time whose dots show who is free; one button jumps to the first time everyone can make it.

### Month & Year Calendars

- `productivity/month-year-calendars/YearLeavePlanner` Year and month leave planner: Twelve compact months where every weekday toggles a day off against a 25-day allowance, holidays and company events marked; bridge days are suggested, and any month opens as a labelled month view.

### Kanban Board Layouts

- `productivity/kanban-board-layouts/ReleaseKanbanBoard` Release board with WIP limits: A full release board: cards drag to reorder within a column and step between stages with move buttons, columns push back when over their work-in-progress limit, stale cards show their age and the header burns down the points.

### Kanban Group Headings

- `productivity/kanban-group-headings/FlowColumnHeadings` Stage headings with capacity slots: Kanban column headings that show work in progress as slots, overflow striped past the limit, with cycle time and its trend, owners and a working actions menu; columns collapse into slim vertical spines.

### Kanban Board Cards

- `productivity/kanban-board-cards/TaskCardGallery` Task cards with signal rails: Six card shapes for one board, a design brief with cover art, a P1 bug on an SLA clock, a live checklist, a pull request with checks and reviews, a blocked task and an epic roll-up, each with a rail that turns green, orange or red as you act on it.

## Feedback & States

Empty and success states, shortcuts, reviews and consent prompts.

### Empty States

- `feedback/empty-states/EmptyInboxFirstRun` First-run inbox: An empty inbox that teaches: three ways to start, each with its real setup step, and the empty state gives way to the first conversations once a channel connects.
- `feedback/empty-states/NoResultsRecovery` No results, with a way back: A search that comes up empty and explains why: a funnel shows which filter emptied the list, each filter chip says how many results removing it brings back, and a typo gets a one-click correction.
- `feedback/empty-states/TemplateStartEmpty` Start from a template: An empty projects page that offers starting points: template cards with drawn previews, a blank option and imports; picking one opens a live preview that follows the name you type and the sample-data switch.
- `feedback/empty-states/AccessRequestEmpty` Request access: A no-access state that sets expectations: the owner with their working day on a 24-hour band, a request form with access level and message, then a pending timeline you can cancel.

### Success States

- `feedback/success-states/PaymentSentReceipt` Payment sent receipt: A calm success screen: a check that bursts once, a receipt that prints out of a slot with a torn edge, a delivery tracker and two follow-up switches.

### Action Cards & Shortcut Links

- `feedback/action-cards-shortcut-links/QuickActionsLaunchpad` Quick actions launchpad: Six action cards with single-key shortcuts that work while the panel has focus, a pinnable list of places to jump back into, and a trail of what you just used.

### Product Review Sections

- `feedback/product-review-sections/ReviewsFitLedger` Reviews with fit meter: A rating summary whose bars double as star filters, a fit meter between runs small and runs large, topic chips, three sorts and helpful votes on every review.

### Cookie Consent Prompts

- `feedback/cookie-consent-prompts/ConsentCornerCard` Fair consent card: A compact prompt over a storefront where Reject all weighs as much as Accept all, Choose unfolds per-kind switches in place, and the decision folds into a pill that reopens it.
- `feedback/cookie-consent-prompts/ConsentPreferencesPanel` Privacy preferences panel: A full preferences dialog shown open in place: category switches with their services and retention, a Global Privacy Control notice, and a plain-words summary that rewrites itself as you toggle.

## Search & Command

Search results and keyboard-first command palettes.

### Search Results

- `search/search-results/SearchResultsWorkspace` Workspace search results: Docs, issues, people and code for one query: a best-match card, highlighted terms, a relevance spine on every row, and type, date and sort filters with live counts.

### Command Palette Modals

- `search/command-palette-modals/CommandPaletteScopes` Scoped command palette: A palette shown open over a blurred app: scope tabs narrow it to actions, projects or people, and a preview pane describes the top match before you run it.
- `search/command-palette-modals/NestedPalette` Nested command palette: A palette that acts on one issue and drills down: “Move to project…” pushes a page, breadcrumb chips show the path and jump back, Backspace on an empty query pops a level, and faint sheets stacked above the palette show how deep you are. Full keyboard support with an announced active option.
- `search/command-palette-modals/AskPalette` Ask AI palette: Search that understands questions: as you type, an Ask AI row with a thinking orb drafts a short answer with steps and cited sources, while docs, settings and people stay listed below; recent queries and suggested actions fill the empty state.
- `search/command-palette-modals/SpotlightPalette` Spotlight with instant answers: A minimal, centered search over a frosted wallpaper that answers before you open anything: percentages, arithmetic, unit and temperature conversions and time zones (“3pm PST in Paris”), with the result set large, the working shown like a receipt, related apps below and a keyboard-hint footer.

## Modals

Task-focused dialogs, gathered from the families that own them.

### Authentication Modals

Listed under Authentication.

### Settings Modals

Listed under Application Pages.

### Create & Edit Form Modals

Listed under Forms.

### Scheduling Modals

Listed under Productivity.

### Payment Method Modals

Listed under Billing & Payments.

## Drawers

Detail panels and filter drawers that slide from the edge.

### Utility & Detail Drawers

- `drawers/utility-detail-drawers/TicketDetailDrawer` Support ticket detail drawer: A right drawer over the support inbox: customer card, SLA countdown meter, status, assignee and priority, the conversation as a timeline and a reply box that can solve the ticket. Rows open it, arrows step through tickets.

### Filter Drawers

- `drawers/filter-drawers/TransactionFilterDrawer` Staged transaction filter drawer: A right drawer that edits a draft of the filters: period, amount range, type with counts, categories, cards and missing receipts, previewed as a count, a total and a daily spend sparkline before Show applies them to the list.

### Listing Filter Panels

- `drawers/listing-filter-panels/RentalFilterDrawer` Live rental filter drawer: A left drawer over a rental listing: rent range, rooms, size, neighbourhoods with counts, must-haves and move-in date. Behind a light scrim, homes that stop matching fade back as you filter; closing keeps only the matches.

## UI Components

Menus, selects, buttons, badges, chips, progress and links.

### Dropdown Menus

- `ui-components/dropdown-menus/IssueActionsDropdown` Issue row actions: Every issue row owns a live action menu whose entries follow its state (reopen, unassign, checked priority), shown pinned open beside its trigger, with undo for archive.

### Account & Workspace Menus

- `ui-components/account-workspace-menus/WorkspaceSwitcherMenu` Workspace switcher: An open workspace switcher with plans, member counts and unread badges, beside a live account menu; switching repaints the workspace card with its own hue, seats and team.

### Selection Menus

- `ui-components/selection-menus/TableViewOptionsMenu` Table display options: An open display panel with group-by, density and column checkboxes, mirrored by a live checked-item pulldown; the renewals table beside it re-renders with every choice.

### Select Menus

- `ui-components/select-menus/TimezoneOverlapSelect` Timezone overlap select: Two city selects with live local times, one drawn open as a listbox; both workdays line up on a half-hour strip that lights the shared hours and suggests a standup slot.

### Tagging Selects

- `ui-components/tagging-selects/IssueLabelTagger` Issue label tagger: A multi-select combobox and an open label picker share one set of colour-coded labels, with exclusive groups that swap a sibling out, plus a validated keyword tag field.

### Embedded & Compact Selects

- `ui-components/embedded-compact-selects/SentenceFilterSelects` Sentence filter selects: A receivables filter written as a sentence whose underlined words are compact selects, with live totals, next to an amount field whose embedded currency list is shown open.

### Ecommerce Menus

- `ui-components/ecommerce-menus/StorefrontCartMenus` Storefront menus and mini bag: A shop menu open in place with aisles and a featured box, plus an open mini bag whose steppers, free-shipping meter and totals reprice live with the currency menu.

### Editor & Toolbar Menus

- `ui-components/editor-toolbar-menus/DocEditorToolbar` Editor toolbar and slash menu: A formatting toolbar with a block-style menu, mark toggles, alignment and an insert menu that restyle the selected paragraph live, plus a slash command menu open at the caret.

### Profile Popovers

- `ui-components/profile-popovers/MentionProfilePopover` Mention profile popover: Mentions in a comment thread open quick profile popovers, while the full card stays pinned open: status, local time on a working-day track with advice on when to reach out, stats and a follow toggle.

### Buttons

- `ui-components/buttons/ReleaseButtonDeck` Release action deck: Every button style on one release page: icon toggles, a ladder from plain to filled, a loading promote action and a press-and-hold rollback.

### Action Button Groups

- `ui-components/action-button-groups/ReviewActionGroups` Code review action groups: A pull request toolbar built from button groups: an attached file pager, a unified or split diff switch, a verdict strip and a split merge button whose strategy you pick.

### Segmented Controls

- `ui-components/segmented-controls/ViewModeSegments` Task view segments: Icon, text and tinted segmented controls driving a live task list: switch list, grid or board, density and sort order, with the sorted field highlighted on every card.

### Label & Feedback Groups

- `ui-components/label-feedback-groups/ArticleFeedbackGroup` Guide feedback group: A metadata label group and a helpful vote on a docs guide: the vote moves the live score, then opens reason chips and an optional note in place.

### Badge Styles

- `ui-components/badge-styles/ChangelogBadgeStyles` Changelog badge styles: Solid, tinted, outline, dot, count and anchored badges in a release feed where each style means one thing; count badges drive the filters and unread dots clear on demand.

### Status Badges

- `ui-components/status-badges/ServiceStatusBoard` Service status board: Operational, degraded, outage, maintenance and deploying badges on a platform status board, each row with a 30-day uptime ribbon and an incident note that unfolds.

### Tag Chips

- `ui-components/tag-chips/AudienceChipBuilder` Audience chip builder: Selectable, removable and suggestion chips plus a tag input that shape a campaign audience, read back as one plain sentence with a live estimate.

### Progress Indicators

- `ui-components/progress-indicators/ImportProgressConsole` Import progress console: One running import told by every progress primitive: stage steps, an overall ring, per-entity bars, a segmented outcome bar, an API budget meter and an indeterminate reindex, with pause and resume.

### Utility Links

- `ui-components/utility-links/ResourceLinksPanel` Developer resource links: Back, inline, chevron, external, download, copy, shortcut and footer links on an API keys page; each trailing glyph nudges toward where the link goes.

## Navigation & Layout

Headers, navbars, sidebars, tabs, shells, footers and error pages.

### Dashboard Headers

- `navigation/dashboard-headers/FleetDashboardHeader` Fleet dashboard header: A three-tier dashboard header: workspace switcher, trail and global tools, a title with a live freshness pill and range actions, then a pulse rail of four figures that follows the range.
- `navigation/dashboard-headers/BriefingHeader` Morning briefing header: A greeting that writes the day's briefing as one sentence from live data; each count is a link that opens its items, and approving a deploy rewrites the sentence. Quick action chips and an at-a-glance column sit alongside.
- `navigation/dashboard-headers/CollaborativeHeader` Collaborative document header: A compact sticky header over a shared spec: the path folds its middle folders into a menu on narrow widths, presence rings match each live cursor, click a face to follow that person, and renaming shows a short sync.
- `navigation/dashboard-headers/RangeBrushHeader` Range brush header: A revenue header whose period is brushed on a 120-day mini chart: drag either handle or the whole window, or pick a preset, and the four figures and their change against the previous period follow.

### Workspace Headers

- `navigation/workspace-headers/ProjectWorkspaceHeader` Project workspace header: A project header with trail, favorite and share, a property strip whose status menu recolors the pill, and tabs with counts that switch the page below.
- `navigation/workspace-headers/DocWorkspaceHeader` Document workspace header: A collaborative document header: editable title with save state, live presence, comments and publish, plus an editing mode switch that recolors the header line and shows suggestions in the page.

### Application Navbars

- `navigation/application-navbars/AppNavbarFlyout` App navbar with flyouts: An application navbar with a cycle capsule, flyout menus for projects and insights, a find button, create and account menus, and an inline sheet behind a burger at narrow widths.

### Flow Headers

- `navigation/flow-headers/WorkspaceFlowHeader` Workspace setup flow header: A focused flow header with steps that only jump back, a time-left estimate, save and exit, and a progress hairline; narrow widths swap the steps for one compact line.

### Secondary Navs

- `navigation/secondary-navs/SettingsSecondaryNav` Settings secondary nav: One settings nav in two shapes, a grouped column when wide and a scrolling strip when narrow, with counts, a New badge and an unsaved-changes dot that follows your edits.

### Scroll Navigation

- `navigation/scroll-navigation/PostmortemScrollNav` Postmortem scroll navigation: A long incident report in its own scroll pane: the outline follows the section in view with a sliding marker, turns into a chip strip when narrow, and a scroll-driven hairline shows reading progress.

### Card Tabs

- `navigation/card-tabs/MetricCardTabs` Metric card tabs: Four metric cards that are the tabs themselves: picking one lights its edge and redraws the daily chart against last week, with full arrow-key support.
- `navigation/card-tabs/FolderCodeTabs` Folder code tabs: Folder-style language tabs cut from the same sheet as the code card below, with a test event you can send and a response line that appears in place.

### Dashboard Sidebars

- `navigation/dashboard-sidebars/PulseSidebar` Live-pulse dashboard sidebar: A bike-share operations sidebar whose rows carry live micro-stats, with a jump filter, collapsible sections, an icon-rail mode on wide screens and an off-canvas panel on narrow ones.

### Application Sidebars

- `navigation/application-sidebars/DualRailSidebar` Dual-rail application sidebar: An editorial workspace with an icon rail and a context panel whose folder tree follows the chosen area; tap the active area to tuck the panel, and on phones the rail turns into a bottom tab bar.
- `navigation/application-sidebars/FloatingDockSidebar` Floating dock sidebar: A sidebar card that floats off the edges and folds into an icon rail with tooltips; a workspace switcher on top, pinned favourites reached with G then a letter, and a storage meter that becomes a ring when folded.
- `navigation/application-sidebars/SpacesSidebar` Spaces sidebar: Browser-style spaces: dots at the bottom switch between Personal, Design and Engineering, the whole shell takes the space's tint and the list slides sideways, with pinned tiles and unread counts you can clear.
- `navigation/application-sidebars/FilterTreeSidebar` Filterable tree sidebar: A dense sidebar whose filter field narrows the nested tree as you type: matches are highlighted, their parents open on their own, empty results suggest other words, with collapsible sections and a Recent list.

### Dashboard Sidebar Modules

- `navigation/dashboard-sidebar-modules/SidebarModuleRack` Sidebar module rack: Workspace switcher, setup checklist with progress ring, plan usage meters, a dismissible changelog card and a presence picker, each shown in the sidebar slice it belongs to.

### Sidebar Navigation

- `navigation/sidebar-navigation/HandbookNav` Handbook navigation with reading trail: A nested company-handbook sidebar that tracks what you have read: marks on a guide line, per-section counts, an overall meter, a highlighting filter and recently viewed pages.

### Multi-Panel Layouts

- `navigation/multi-panel-layouts/TriageWorkspace` Three-panel triage workspace: A support desk split into a queue, a live thread and a customer panel with resizable handles; replies, macros and solve all work, and on phones the panels become a sliding stack.

### Detached Sidebar Layouts

- `navigation/detached-sidebar-layouts/DetachedStudioLayout` Floating studio sidebar: A podcast studio layout whose sidebar floats as an inset card over a tinted backdrop, with collapsible show lists and a mini player whose waveform plays; it slides in from the edge on narrow screens.

### Dashboard Demo Layouts

- `navigation/dashboard-demo-layouts/CoopEnergyDashboard` Community energy dashboard: A complete co-op dashboard: sidebar, top bar and a sun-path hero that places the sun on its arc, with KPI tiles, a generation chart, live site bars and working views for sites, members, payouts and settings.

### Title Bars

- `navigation/title-bars/RecordTitleBar` Record title bar with phase ribbon: A project header with breadcrumb, inline rename, status menu, follow and share actions, key facts, a one-line phase timeline marking today, and counted tabs.
- `navigation/title-bars/SelectionTitleBar` Collection title bar with selection mode: An invoices header with live totals, search, quick filters and a list or card view; selecting rows cross-fades it into a contextual bar whose bulk actions really apply.

### Dashboard Footers

- `navigation/dashboard-footers/StatusStripFooter` Status strip dashboard footer: An app footer that doubles as a status page: a 60-day uptime strip you can walk with the arrow keys, the build id with copy, a region switch with latency, links and a shortcut hint.

### Stacked Footers

- `navigation/stacked-footers/StackedWordmarkFooter` Stacked footer with outlined wordmark: Four tiers: a validated newsletter sign-up, link columns that fold into disclosures on phones, a legal bar with language and appearance switches, and an oversized outlined wordmark cropped by the edge.

### Blank & Error Pages

- `navigation/blank-error-pages/OffTheMapError` Off-the-map 404 page: A not-found page for a route planner: a contour-map illustration whose trail runs off the torn edge, the missing path spelled out, a search that suggests live pages and a broken-link report.

### Sticky Layouts

- `navigation/sticky-layouts/StickyReleaseNotes` Four-layer sticky release notes: A self-scrolling changelog that stacks four sticky layers: a frosted header with a scroll-driven progress line, a version index that tracks the section in view, per-version headings and a feedback bar.
