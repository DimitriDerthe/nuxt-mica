# Application UI blocks

Inventory of the Mica block gallery, generated from `site/app/blocks/catalog.ts` and the `meta.json` files by `scripts/gen-manifest.mjs`. Blocks are original, copy-pasteable sections built only with Mica components; each is one SFC at `site/app/blocks/<family>/<category>/<Name>.vue`, shown at `/blocks/<family>/<category>` on the site. Authoring rules: `site/app/blocks/README.md`.

302 blocks in 139 categories. Each line: `<family>/<category>/<Name>` title: summary.

## Analytics & KPIs

Charts, KPI cards, rankings, progress and maps for dashboards and reports.

### Bar Charts

- `analytics/bar-charts/SupportLoadBars` Support load by hour: Tickets per 2-hour window against staffed capacity: windows over capacity turn to the accent color and the panel suggests the rota move that closes the worst gap.
- `analytics/bar-charts/BudgetVarianceBars` Budget variance bars: Diverging bars show each department over or under plan for the quarter; sort by variance or budget, and pick a row to see its meter and the reason behind the gap.

### Line & Area Charts

- `analytics/line-area-charts/SignupForecastArea` Sign-ups against forecast: An area chart of trial sign-ups with forecast and last year as optional overlays, a beat-or-miss strip per period and the moments that moved the line.
- `analytics/line-area-charts/MultiSeriesCrosshair` Multi-series crosshair: Latency by region with a pointer and keyboard crosshair whose readout ranks every visible series, legend toggles that hide a line, and incidents pinned to the time axis.
- `analytics/line-area-charts/StackedChannelArea` Stacked channel area: Sign-ups stacked by acquisition channel, switching between counts and 100% with a crossfade, beside share bars for the month under the cursor; the channel the story is about carries the only accent.
- `analytics/line-area-charts/PeriodDeltaLine` Period over period gap: This period against the previous one, the gap between the lines shaded as gain or loss segment by segment, with a running difference strip and figure that follow the cursor.

### Pie & Radial Charts

- `analytics/pie-radial-charts/CloudSpendDonut` Cloud bill breakdown: A donut of monthly cloud spend whose legend is also a selector: hover previews a service, a click pins it, and the side panel shows its budget meter and top line items.
- `analytics/pie-radial-charts/MarketingMixAllocator` Marketing mix allocator: A donut of the monthly budget driven by one slider per channel: moving one rebalances the others, and a forecast card projects pipeline and names the channel with the best next $5k.

### Chart Compositions

- `analytics/chart-compositions/ActivationReview` Activation review: A quarterly board that opens with a generated one-paragraph story, then backs it with a trend against target, a first-action mix and a time-to-value histogram; the platform switch rewrites everything.
- `analytics/chart-compositions/FulfillmentDayDrill` Fulfillment day drill-down: A week strip of mini bars acts as the selector: picking a day redraws the hourly packed-versus-shipped lines, the carrier mix and the service-level rings.

### KPI Cards

- `analytics/kpi-cards/KpiPulseBoard` Revenue pulse board: A hero metric with its goal meter and trend, framed by stat tiles and a split MRR card; the period switch swaps every figure.
- `analytics/kpi-cards/KpiTargetBands` KPIs against target bands: Each card draws twelve weeks against its shaded target band, so on or off plan reads at a glance; open a card to see the larger chart and where each segment sits in the band.
- `analytics/kpi-cards/KpiNarrativeBento` Narrative bento: A bento of metric tiles led by a paragraph written from the numbers; every figure in the text cites its tile, and pointing at either one lights up the other.
- `analytics/kpi-cards/KpiBulletRow` Bullet chart KPI strip: A dense strip for the top of a dashboard: each metric is a bullet chart with qualitative ranges, target tick and last-period marker, plus a delta chip; the period switch moves every mark.

### Spark Charts

- `analytics/spark-charts/EdgeLatencyWatch` Edge latency watch: A region watchlist with a sparkline per row, p95 change and an SLO headroom bar; sort, filter to degraded regions and switch the window, with rows sliding into their new order.
- `analytics/spark-charts/SubscriptionSmallMultiples` Subscription small multiples: Six daily sparkline tiles share one cursor: point at any chart or drag the scrubber and every tile reads its value and change on that same day.

### Ranking Cards

- `analytics/ranking-cards/QuarterLeaderboard` Quarter leaderboard: A leader card with the margin they hold, then every other rep with movement since last quarter, a bar against the leader and the gap to the person above; the metric switch re-ranks the list with a sliding transition.
- `analytics/ranking-cards/FeatureRankShift` Feature rank shifts: A slope chart linking last period’s rank to this month’s for every feature, with climbers in green and fallers in orange; hover or pick a feature to trace its line and read its trend.

### Progress Cards

- `analytics/progress-cards/OkrPaceBoard` OKR pace board: Objectives with key results read against the quarter clock: each bar carries a pace tick for where it should be today, statuses follow from the gap, and a check-in stepper updates progress in place.
- `analytics/progress-cards/QuotaRunwayCards` Plan usage runway: Quota cards that project usage to the reset date: a hatched forecast runs past the limit line when a quota will run out, with the day it happens and a one-click request.

### Data Maps

- `analytics/data-maps/MarketTileMap` Market tile map: A world tile map with one tile per market and no geodata: tiles shade by fifths of the chosen metric, a region filter dims the rest, and a ranked legend and readout follow the tile you point at.
- `analytics/data-maps/ShippingLaneFlows` Freight lane flows: An abstract network map where lanes are arcs sized by weekly pallets: pick a hub and a direction to light up its lanes, ranked beside the map with transit time and on-time rate.

## Data Display

Projects, files, feeds, timelines and lists for scanning and monitoring.

### Projects

- `data-display/projects/ProjectPaceBoard` Project pace board: Client project cards where a tick on each progress bar marks where the work should be today, turning every card into an ahead or behind verdict; filter by pace and sort by due date or lag.
- `data-display/projects/ProjectStagePipeline` Project stage pipeline: Studio projects under a stage rail where each step shows its project count and booked budget and filters the list; every row tracks budget burn in amber then red, and moves on to the next stage.

### File Views

- `data-display/file-views/FileShelf` Drawn file shelf: A shared folder in grid or list view where every preview (page, sheet, photo, video, waveform, design) is drawn from tokens; filter by type, search, and pick files to get a selection bar with their combined size.
- `data-display/file-views/FolderTreeBrowser` Folder tree with details: A shared drive as a keyboard-friendly tree beside a details pane: folders show their size split by file type, files show their version history with one-click restore.

### Team & Profile Views

- `data-display/team-profile-views/TeamTimeZones` Team across time zones: A distributed team directory with an overlap ribbon: each bar is a UTC hour sized by who is at work, and picking one updates every card's local time, day strip and availability; one tap finds the best meeting slot.
- `data-display/team-profile-views/OrgProfileCard` Profile with reporting line: One teammate's profile card with availability, about, project allocation and reporting line tabs; the manager and direct reports are buttons that open their own profile in place.

### Integrations

- `data-display/integrations/IntegrationHub` Integration hub with sync pulse: Connected apps show a 24-hour sync pulse with failed deliveries in red and a pause switch; the catalog below filters by category and search, and Connect moves an app into the live section.
- `data-display/integrations/IntegrationScopeReview` Integration permission review: Before authorizing an app: required and optional permissions marked read or write, a sync direction per object where two-way needs the matching write scope, and a meter that sums up the write access granted.

### Data Management

- `data-display/data-management/DatasetInventory` Warehouse table inventory: Warehouse tables ranked by freshness against their SLA, with a detail pane that lists columns with null shares and PII masking switches, or switches to a lineage view from sources to the dashboards that depend on the table.
- `data-display/data-management/ImportColumnMapper` CSV import column mapper: Each CSV column with sample values is mapped to a field; rows that would fail to parse and fields mapped twice are flagged, and a summary counts ready rows and gates the import on required fields.

### Activity Feeds

- `data-display/activity-feeds/ActivityDigest` Activity digest: A team feed grouped by day under a week of density bars you can click to jump to a day; type chips filter it, and bursts of commits fold into one line that expands to the hashes.
- `data-display/activity-feeds/AuditTrail` Workspace audit log: A security audit trail of who changed what, with sensitive events flagged in red, filters by risk and actor, and each entry unfolding to its before and after values.

### Timelines

- `data-display/timelines/IncidentTimeline` Incident timeline: A postmortem view where a ribbon sized by real phase durations (detect, triage, mitigate, monitor) filters the timeline below, with the alert's error spike and the key decision quoted in place.
- `data-display/timelines/ShipmentTracker` Shipment tracker: An order split into parcels, each with a delivery estimate, a milestone track from ordered to delivered and a scan history that switches between key milestones and every carrier scan.

### Description Lists

- `data-display/description-lists/ContractDetails` Editable contract details: Two description lists for a customer contract with copyable IDs and inline editing; edits are highlighted with their previous value, derived figures recalculate, and a change tray collects them until saved or discarded.
- `data-display/description-lists/InstanceSpecSheet` Searchable instance spec sheet: A cloud server's specs in three description lists (compute, network, storage) with a search that narrows every list at once, copy buttons on IDs and IPs, and the whole sheet copyable as YAML.

### List Groups

- `data-display/list-groups/ReleaseChecklist` Release checklist groups: Grouped task lists for an app release under a segmented gauge where each group fills on its own; finished groups fold into a single line, and the scope switch shows all, open or only your tasks.
- `data-display/list-groups/ContactIndex` Alphabetical contact index: Contacts grouped by letter with sticky headings in their own scroll area, a starred group on top, an A to Z rail that jumps to a letter, and a search that empties letters as it narrows.

## Tables

Record, order, product, project and analytics grids for back offices.

### User & Contact Tables

- `tables/user-contact-tables/MemberAccessTable` Member access table: Workspace members with a seat meter, inline role selects, 2FA status and a 12-week activity strip that makes dormant accounts fade out; search, role filter, sorting and bulk role changes, stacked as cards at narrow widths.
- `tables/user-contact-tables/ContactWarmthTable` Contact warmth table: CRM contacts grouped by account, each with a warmth strip that cools from orange to blue as days pass since the last touch; collapsible account rows with a heat signature and totals, rows that expand to the last three interactions, and a one-click call log that warms a contact back up.
- `tables/user-contact-tables/SheetGridTable` Spreadsheet grid: A dense, spreadsheet-like contact sheet: sticky header and first column, a formula bar with the active cell address, arrow-key navigation with Shift range selection, Enter to edit and Esc to cancel, a column visibility menu and a live count, sum and average of the selection.
- `tables/user-contact-tables/TeamDirectory` Team directory: A people directory with a table or cards view, department filter chips, an A–Z scrubber that jumps to a letter and follows your scroll, and a live local time for everyone with a 24-hour strip showing their working window and whether they can be reached now.

### Order & Billing Tables

- `tables/order-billing-tables/ReceivablesAgingTable` Receivables aging table: Open invoices under an aging strip that splits the outstanding total by lateness; each bucket filters the table, overdue rows show how late they are and can be reminded, and the list turns into cards on small screens.
- `tables/order-billing-tables/OrderDayLedger` Orders grouped by day: Orders under one row per day carrying its net subtotal; each order expands to its line items, moves along a three-step fulfillment track or gets refunded, and the status switch narrows the ledger.

### Product Tables

- `tables/product-tables/StockCoverTable` Stock cover table: A product catalog where each row shows days of stock left against the supplier's lead time, so items that will sell out before a restock stand out and can be reordered; listing switches, search and views, cards on small screens.
- `tables/product-tables/MarginRepricingTable` Margin repricing table: Edit prices in place and watch each margin bar move against the target tick; a slider previews a move on every price, the blended margin weighs best sellers, and edits publish or discard together.

### Project Tables

- `tables/project-tables/RoadmapGanttTable` Roadmap table with inline Gantt: A sortable project table whose schedule column is a Gantt chart: month lines and today's line run through every row, bars are clipped to the chosen range (quarter or six weeks), and budget burn sits beside each project.
- `tables/project-tables/SprintCapacityTable` Sprint table with capacity: Sprint tasks in collapsible status groups under a capacity strip per teammate; changing a task owner moves its points between the bars and flags anyone over capacity.

### Analytics Tables

- `tables/analytics-tables/ChannelPerformanceTable` Channel performance table: Acquisition channels with in-cell data bars that keep a ghost tick at last period's sessions, conversion chips tinted by rate, revenue deltas and trend sparklines; the period switch rescales every figure and the totals above.
- `tables/analytics-tables/CohortRetentionTable` Cohort retention table: A retention triangle of weekly signup cohorts shaded by how many stay, with a weighted average row; switch plan or show people instead of percentages, and point at any cell to read it against the average.

### Content Tables

- `tables/content-tables/EditorialPipelineTable` Editorial pipeline table: Articles from draft to live with four readiness checks (copy, images, SEO, legal) that editors tick in place; once all pass, a draft offers to schedule itself into the next slot. Status filter with counts, search, sorting and pagination.
- `tables/content-tables/MediaLibraryTable` Media library table: Images, videos and documents with drawn thumbnails, page usage and license countdowns; kind filters with counts, search, and a bulk bar that deletes only the files no page uses.

### Admin Utility Tables

- `tables/admin-utility-tables/ApiKeysTable` API keys table: API keys with masked tokens, read and write scopes, a week of usage, and an expiry bar measured against each key's own lifetime; idle and expiring keys are flagged, rotation is one click and revoking asks for an inline confirmation.
- `tables/admin-utility-tables/WebhookDeliveriesTable` Webhook deliveries log: Webhook attempts with status codes, latency bars against the timeout, success rate and p95; failed rows filter out, expand to show the response and redeliver in one click.

## Forms

Settings, uploads, filters, pickers, payments and every data-entry pattern.

### Advanced Forms

- `forms/advanced-forms/IncidentDeclareForm` Incident declaration form: A conditional incident form: severity drives the accent and locks paging, the status page message appears only when public, and a live preview plus readiness list track what is still missing.
- `forms/advanced-forms/AutomationRuleBuilder` When, if, then rule builder: A routing rule built from a trigger, repeatable conditions joined by all or any, and an action; the rule reads back as a plain sentence and a dry run marks which recent deals it would catch.

### Transfer Forms

- `forms/transfer-forms/ApiScopeTransfer` API key scope transfer: Two filterable lists move scopes onto a restricted key; a blast-radius meter and a plain-English sentence say what the key can do, and admin scopes require an explicit acknowledgement.
- `forms/transfer-forms/ColumnChooserTransfer` Table column chooser: Grouped, searchable hidden fields move into an ordered list of shown columns that reorders by drag or keyboard, capped at eight, with a live preview of the table header.

### Form Pages & Settings

- `forms/form-pages-settings/WorkspaceSettingsPage` Workspace settings page: A sectioned settings page whose nav marks sections with unsaved edits or errors; one save bar lists every pending change and can discard or save them together.
- `forms/form-pages-settings/ProfileLivePreview` Profile with live preview: Profile fields beside the card teammates will see, updating as you type: the handle is checked for availability with free suggestions, and the preview shrinks to a sticky strip on narrow screens.
- `forms/form-pages-settings/NotificationMatrix` Notification matrix: Events against channels in one grid, with row and column toggles that go mixed when partly on, a weekly volume forecast per channel, quiet hours on a 24-hour strip and a digest choice.
- `forms/form-pages-settings/SecurityCenter` Security center: A protection score that climbs as you set up two-step login, store recovery codes and revoke an unrecognised device, each with an inline flow and confirmation.

### Text Editors

- `forms/text-editors/ReleaseNotesEditor` Release notes editor: A rich-text document with an inline title, autosave status, live word count and reading time, an outline built from its headings and a readiness ring that gates publishing.
- `forms/text-editors/CommitMessageEditor` Commit message editor: Type, scope and summary build a Conventional Commit header on a 50/72 ruler, lint checks flag tense, case and periods, and a preview rewraps the body at 72 columns with its footers.

### Message Composer Textareas

- `forms/message-composer-textareas/SupportReplyComposer` Support reply composer: A ticket composer that switches between customer reply and internal note (the field turns into a sticky note), inserts saved replies, attaches files and catches a mentioned but missing attachment before sending.
- `forms/message-composer-textareas/ChannelMentionComposer` Channel composer with mentions: A team channel composer: typing @ opens a keyboard-driven member list, Enter sends and highlights mentions in the feed, and a calendar menu schedules the message for later.

### Utility Textareas

- `forms/utility-textareas/EnvImportTextarea` Environment variable import: Paste a .env file and every line is parsed as you type: invalid names, duplicates, empty values and overwritten keys are flagged per line, and detected secrets are masked before import.
- `forms/utility-textareas/PromptTemplateTextarea` Prompt template with variables: Write a template and every {{variable}} gets a test field; a preview fills them in, invalid names and unbalanced braces are flagged, and a meter estimates the token count.

### Option Pickers

- `forms/option-pickers/MeetingSlotPicker` Meeting slot picker: Length, place and time zone pickers drive a day strip with availability pips and a slot grid that shows each start in both your time and the host's; longer meetings drop slots that no longer fit.
- `forms/option-pickers/IssuePropertyPicker` Issue property pickers: An issue's status, priority, assignees and labels, each opening its own inline picker: single choice closes on pick, multi-select stays open, and labels can be created from the search with validation.

### Selectable Cards & Lists

- `forms/selectable-cards-lists/RegionSelectCards` Region selection cards: Radio cards compare latency, grid carbon and price per region with a best-balance badge, sortable and filterable by area; an EU residency switch locks other regions, and a checkbox list picks backup replicas.
- `forms/selectable-cards-lists/AddonCheckboxCards` Add-on checkbox cards: Multi-select add-on cards with per-seat pricing and a monthly or yearly switch; picking an add-on pulls in what it requires, and a running total shows the yearly saving.

### Checkbox & Preference Controls

- `forms/checkbox-preference-controls/NotificationMatrix` Notification channel matrix: Events by channel in one checkbox matrix with mixed-state column toggles, a locked security row and presets that light up only while they match; a live estimate shows weekly volume per channel.
- `forms/checkbox-preference-controls/RolePermissionTree` Role permission tree: A checkable permission tree with mixed parent states and presets that light up only while they match; a side summary counts rights per area and flags the sensitive ones.

### Ratings & Emoji Selectors

- `forms/ratings-emoji-selectors/SessionFeedbackCard` Session feedback card: Five drawn faces whose mouths curve from frown to grin set the card's tint and the follow-up chips, then half-star ratings for three aspects and an optional note; it ends on a thank-you with the running average.
- `forms/ratings-emoji-selectors/NpsScoreCard` Net Promoter Score card: A 0 to 10 scale banded into detractors, passives and promoters; the chosen group tints the card and swaps the follow-up question and reason chips.

### Switches

- `forms/switches/FeatureFlagSwitchboard` Feature flag switchboard: Per-environment switches for each flag, with stale-flag hints and a filter; turning one on in production opens an inline rollout slider and a required audit reason, while turning it off acts instantly as a kill switch.
- `forms/switches/PrivacyConsentCenter` Privacy preference center: A consent panel shown open over the site: one switch per cookie category, the necessary one locked on, expandable lists of services with retention, and reject all, accept all or save.

### Create & Edit Forms

- `forms/create-edit-forms/MemberRecordEditor` Member record editor: One record that reads as details, edits in place or starts blank for a new member; contractors reveal an end date, and saving goes through a field-by-field diff review with undo afterwards.
- `forms/create-edit-forms/ProductVariantEditor` Product with variants: Create a product whose size and color tags generate the variant table; each line gets its own SKU, price, stock and on-sale toggle, and the footer flags lines on sale with no stock.

### File Upload Forms

- `forms/file-upload-forms/VendorDocsUpload` Compliance document upload: A drop zone with simulated per-file progress feeds a checklist of required documents, auto-matched from file names; the insurance certificate asks for its expiry, and a ring counts what is still missing.
- `forms/file-upload-forms/FileTransferSend` Large file transfer: Collect files against a 2 GB budget meter, then email them or get a link, pick an expiry and a download alert; sending ends on a copyable link.

### Image Upload Forms

- `forms/image-upload-forms/FocalPointUpload` Cover upload with focal point: Upload a cover, then set its focal point on the image: the header, feed card and badge crops re-frame live, with alt text validated before saving.
- `forms/image-upload-forms/ListingPhotoChecklist` Listing photo shot list: A shot list of required and optional rooms, each a slot with its framing tip, upload, type and size checks, and a cover pick; saving unlocks once every required shot is in.

### Document & Import Uploads

- `forms/document-import-uploads/ContactImportMapper` CSV import with column matching: Upload a CSV (or the sample), match its columns to contact fields with automatic guesses, then review a health bar of ready, invalid and duplicate rows before importing.
- `forms/document-import-uploads/InvoiceExtractReview` Invoice extraction review: Drop a supplier invoice and review the extracted fields beside a faux page: each field shows its confidence, focusing it lights its region, and unsure ones need a confirmation before posting.

### Create & Edit Form Modals

- `forms/create-edit-form-modals/NewProjectSheet` New project sheet: A create form in a sheet over the project board: the key follows the name until edited, the color and template cards update a live identity preview, and Create stays off until the key is valid and free.
- `forms/create-edit-form-modals/InviteMembersDialog` Invite members dialog: A compact dialog that turns pasted emails into tags, tells teammates from free external guests, and shows on a seat bar whether the invite fits the plan.

### Content Editor Forms

- `forms/content-editor-forms/ArticleComposer` Article composer with publishing checks: A headline, excerpt, rich-text body and tags beside a live search snippet, a length meter and a checklist that unlocks Publish once every check passes.
- `forms/content-editor-forms/CampaignEmailComposer` Campaign email composer: Subject with merge tags, preview text and a rich-text body beside a faux inbox that shows the email as a chosen recipient would see it on desktop or phone, with send checks.

### Range Controls

- `forms/range-controls/PriceRangeHistogram` Price range over a histogram: A dual price slider under a histogram of bookable stays, synced min and max fields, presets, plus distance and rating sliders that reshape the histogram and the live count.
- `forms/range-controls/BudgetSplitSliders` Budget split sliders: One slider per ad channel splits a monthly budget, with projected leads per channel, a stacked bar of the split, and an over-budget state that blocks saving.

### Filter Panels

- `forms/filter-panels/JobFacetPanel` Faceted filter panel: A job board side panel whose counts are true facets: each number shows what you would get with every other filter applied, empty options turn off, and active filters become removable chips.
- `forms/filter-panels/FlightFilterPanel` Flight search filters: A flight filter panel with stops priced from the cheapest match, departure windows per leg, airlines with an Only shortcut and a travel time cap; the button carries the live count and lowest fare.

### Filter Bars

- `forms/filter-bars/IssueQueryBar` Query token filter bar: Filters as tokens you can read: flip is / is not in one click, change values from a menu, switch match all or any, and see the whole query read back as a sentence over the issue list.
- `forms/filter-bars/OrderStatusBar` Order status filter bar: Status pills with live counts and a clickable distribution strip, followed by search, channel, flagged and sort controls that recount every pill as they change.

### Payment Method Forms

- `forms/payment-method-forms/CardPaymentForm` Card and SEPA payment form: A live card that recolors with the detected brand and flips to its back for the security code, a number mask grouped per brand with a Luhn check, and a SEPA tab that validates IBAN length and checksum. UI only, with test numbers.
- `forms/payment-method-forms/CheckoutMethodPicker` Checkout payment method picker: Radio cards for phone wallet, saved card, pay in 4 and bank transfer, each revealing only what it needs: a security code, an installment schedule or copyable transfer details, with a pay button that adapts.

### Billing & Upgrade Forms

- `forms/billing-upgrade-forms/SeatUpgradeForm` Plan and seat upgrade: Pick a plan, cycle and seat count while a summary prorates the change: a bar shows the unused part of the current cycle turned into credit, and the pay button carries the exact amount due today.
- `forms/billing-upgrade-forms/CreditTopUpForm` Usage credit top-up: Top up prepaid API credits with presets or a slider: a runway bar shows how many days of usage the balance covers before and after, bonus tiers kick in, and auto-recharge sets a threshold.

### Contact & Feedback Forms

- `forms/contact-feedback-forms/AdaptiveFeedbackForm` Adaptive feedback form: A five-face mood scale that rewrites the follow-up question, its topic chips and the placeholder; a rough answer offers a support callback, a happy one asks to quote you.
- `forms/contact-feedback-forms/RoutedContactForm` Routed contact form: Pick what the message is about and the form routes it: team-specific fields appear, the side card shows who will answer, their hours and reply time, and sending ends on a reference.

### Newsletter Signup Forms

- `forms/newsletter-signup-forms/DigestSignupForm` Newsletter signup with issue preview: Email, frequency and topic choices drive a live preview of the next issue: its send date, subject line, stories and reading time change as you pick.
- `forms/newsletter-signup-forms/ArchiveTypoSignup` Newsletter signup with archive: A pitch with reader proof beside the latest issues, an email field that spots a mistyped domain and offers a one-tap fix, then a confirm-your-inbox state.

### Product Review Forms

- `forms/product-review-forms/ProductReviewForm` Product review with live preview: Star rating, a runs-small to runs-large fit scale, aspect stars, pros and cons tags, photos and a length meter, mirrored in a preview of the card shoppers will see.
- `forms/product-review-forms/OrderItemsReview` Review every item of an order: Each item of a delivered order gets inline stars; rating one opens prompt chips tuned to the score and an optional note, items can be skipped, and one button posts them all.

## Authentication

Sign in, sign up, recovery, verification, onboarding and setup journeys.

### Authentication Pages

- `authentication/authentication-pages/SignInContours` Split sign-in with contour art: Passkey-first sign-in beside a generative contour map seeded by the email domain, so each workspace gets its own terrain.
- `authentication/authentication-pages/SignUpStrength` Sign-up with a faceted strength gem: Password strength drawn as a five-facet gem: each rule met slides a facet into place, and the stone settles once all are set. SSO, terms and real validation included.
- `authentication/authentication-pages/MagicLinkFlow` Passwordless magic link flow: One card that moves from email to inbox to code: mail app shortcuts, a resend countdown, a link lifetime draining along the top edge and a pasteable 6-digit fallback.
- `authentication/authentication-pages/ReturningAccountChooser` Returning account chooser with changelog: Saved accounts as cards with last use, workspace and SSO badges; the sign-in method follows the pick, and the changelog shows only what shipped since that account's last visit.

### Verification & Recovery Pages

- `authentication/verification-recovery-pages/VerifyCodeRecovery` Verification code with recovery fallback: A one-time code screen with email, SMS or authenticator delivery, an attempts meter, resend cooldown and a switch to single-use recovery codes.
- `authentication/verification-recovery-pages/PasswordResetFlow` Password reset journey: Request a reset link, open it from an inbox preview, then choose a new password with a strength meter, a match check and an option to sign out other devices.

### Guest Checkout & Order Lookup

- `authentication/guest-checkout-order-lookup/OrderLookupJourney` Guest order lookup with delivery rail: Find an order with its number and postcode, then follow it along a delivery rail with glaze-painted items and an offer to save it to an account.
- `authentication/guest-checkout-order-lookup/GuestReturnStart` Guest return with drop-off code: Start a return without an account: find the order by email and number, pick items with a reason each, choose card refund or bonus store credit, and get a drop-off code.

### Authentication Form Snippets

- `authentication/authentication-form-snippets/AuthSnippetTrio` Magic link, password and passkey snippets: Three drop-in cards: a sign-in link that becomes its own confirmation, a password setter with live strength and match checks, and a one-tap passkey return.
- `authentication/authentication-form-snippets/TwoFactorSnippets` Two-factor code and recovery snippets: Two drop-in cards: a 6-digit code challenge with an SMS cooldown and a recovery-code fallback, and a one-time recovery-codes sheet you must confirm you saved.

### Authentication Modals

- `authentication/authentication-modals/StepUpAuthDialog` Step-up re-authentication dialog: A sensitive action asks for a fresh sign-in: password or passkey in a dialog over the API keys page, which then unlocks for ten minutes.
- `authentication/authentication-modals/SessionTimeoutDialog` Session timeout dialog: An idle-timeout warning with a countdown ring over a document with unsaved work; stay signed in, or let it expire into a sign-in form that keeps the draft.

### Onboarding Pages

- `authentication/onboarding-pages/OnboardingLivePreview` Onboarding with a live workspace preview: Role cards, space chips and team size on one side; a miniature of the future workspace assembles itself on the other as each answer lands.
- `authentication/onboarding-pages/SetupChecklist` First-run setup checklist: A ring that counts minutes left, not percent; each task opens inline with its real action (invites, repository, theme), and finished ones fold into a completed list with a drawn check.
- `authentication/onboarding-pages/ConversationalOnboarding` Conversational onboarding: Setup as a short chat: questions arrive as assistant bubbles, tappable chips become your reply, every answer stays editable from a topic rail, and a summary card closes the loop.
- `authentication/onboarding-pages/ConnectToolsStep` Connect your tools step: Integrations as toggle cards with a live connecting state; a stacked meter adds each tool's hours saved per week and measures the total against a full workday.

### Set Up Flows

- `authentication/set-up-flows/DomainSetupFlow` Workspace and domain setup flow: Four validated steps with working back and next: name and address, DNS records to copy and verify, invitations as tags, then a review before launch.
- `authentication/set-up-flows/SecurityChecklistSetup` Account security checklist: A non-linear setup checklist with a progress ring: each task opens in place, from linking an authenticator with a code to storing recovery codes and adding a backup phone.

## Application Pages

Admin screens, AI interfaces, profiles and account pages.

### Admin Dashboard Pages

- `application-pages/admin-dashboard-pages/StudioOpsDashboard` Studio back-office dashboard: A full admin shell for a ceramics shop: sidebar, header with search, KPI tiles, a week-over-week sales chart, a low-stock panel and a searchable orders table.
- `application-pages/admin-dashboard-pages/SaasMetricsDashboard` SaaS revenue dashboard: A top-navigation revenue page: a strip of headline figures, an MRR bridge from opening to closing MRR whose steps reveal the accounts behind them, and a cohort retention heatmap shaded in the brand colour.
- `application-pages/admin-dashboard-pages/SupportQueueDashboard` Support queue wallboard: A live support desk: tickets in priority lanes with SLA countdowns that turn amber then red before breach, one-click take that loads your bar, agent presence with workload meters and a CSAT trend.
- `application-pages/admin-dashboard-pages/ReleaseOpsDashboard` Release operations dashboard: An engineering page: a 24-hour deployment timeline across preview, staging and production that traces a build's promotion path, 90-day uptime bars per service, open incidents and the on-call rotation.

### AI Interface Pages

- `application-pages/ai-interface-pages/AnalystAgentWorkbench` Analyst agent workbench: An AI analysis workspace: threads, a cited answer with its reasoning trace, findings and SQL, and a composer with attachments and a live context-budget meter.
- `application-pages/ai-interface-pages/AgentRunConsole` Agent run console: An autonomous agent run paused before an irreversible step: its plan trace, an approval card with audience scope and the template diff, and run details; approve, decline or stop mid-send.

### Profile Cards & Status Panels

- `application-pages/profile-cards-status-panels/TeamPresencePanel` Team presence with time-zone overlap: Set your presence and status with a live preview, next to teammate cards whose 24-hour strips show exactly when your working days overlap.
- `application-pages/profile-cards-status-panels/OnCallStatusCard` On-call status panel: Who is on call now with presence and shift progress, a live page to acknowledge or escalate, the escalation chain that follows, and the next person in the rota.

### Person & Account Detail Headers

- `application-pages/person-account-detail-headers/AccountRenewalHeader` Account header with contract runway: A CRM account header: identity, owner and actions, a facts strip for revenue, seats, health and renewal, and a runway placing today between signature and renewal.
- `application-pages/person-account-detail-headers/TeammateProfileHeader` Teammate profile header: A directory profile header: identity, focus status and actions, the reporting line up to the CEO with direct reports, a facts strip with local time and hours, and switchable focus, skills and time-off panels.

### Settings Modals

- `application-pages/settings-modals/WorkspaceSettingsSheet` Workspace settings sheet: A settings modal with its own section nav, shown open on a backdrop; edits mark their section with a dot, and the footer counts unsaved changes with save and discard.
- `application-pages/settings-modals/NotificationMatrixDialog` Notification matrix dialog: A notification settings dialog shown open over an inbox: events by channels in a checkbox matrix whose column headers toggle a whole channel, quiet hours, and a live unsaved-changes count.

## Billing & Payments

Invoices, plans, transactions, payment methods and cards.

### Invoice Layouts

- `billing/invoice-layouts/PerforatedInvoice` Printable invoice with tear-off slip: A paper-like invoice: sender and client facts, line items, totals that recompute with an early-payment discount, a paid stamp and a perforated payment slip with a barcode.
- `billing/invoice-layouts/UsageInvoiceBreakdown` Usage invoice by service or project: A metered cloud invoice whose lines regroup by service or by project, with a stacked spend bar, expandable line tables, committed-use credit and the amount due.

### Subscription Plans

- `billing/subscription-plans/SeatPlanPicker` Seat-based plan picker: Monthly or yearly billing and a team-size slider recompute every price, total and saving; plans outside their seat range step aside and the best fit moves with the team.
- `billing/subscription-plans/PlanFeatureMatrix` Plan feature matrix: Sticky plan headers over a feature matrix grouped by area: pick a feature to light up the plans that include it, hide the rows every plan shares, and switch plans one at a time on narrow screens.
- `billing/subscription-plans/UsagePriceCalculator` Usage price calculator: Sliders for events, editors and storage with their rate tiers marked underneath drive a live monthly estimate, split per line and set against the flat plan on the same scale.
- `billing/subscription-plans/CurrentPlanManager` Current plan manager: Quota meters that warn before a limit, an upgrade case built from the dates you hit it, and a plan change preview with prorated amounts, new limits and the effective date.

### Payment Transaction Details

- `billing/payment-transaction-details/TransactionMoneyTrail` Payment detail with money trail: One card payment end to end: amount and status, a bar splitting gross into net, fees and refunds, details, lifecycle timeline and a validated partial refund that updates it all.
- `billing/payment-transaction-details/DisputeEvidencePanel` Chargeback dispute with evidence: A disputed charge with its response window, an evidence checklist where required items gate submission, a written summary for the bank and an under-review state.

### Payment Method Modals

- `billing/payment-method-modals/AddCardDialog` Add card dialog with live preview: A card form in a dialog over the billing page: the number formats and detects the network as you type, a mini card mirrors it, and expiry, CVC and checksum are validated.
- `billing/payment-method-modals/SepaMandateDialog` Bank account and SEPA mandate dialog: A two-step dialog over the billing page: the IBAN formats, detects its country and passes a mod-97 checksum, then the customer reviews and signs the direct debit mandate.

### Payment Method Panels

- `billing/payment-method-panels/FallbackMethodsPanel` Payment methods as a fallback chain: Saved cards and a direct debit ordered by drag: the first is charged, the rest are numbered fallbacks; expiring cards are flagged and removal asks in place.
- `billing/payment-method-panels/PayMethodChooser` Payment method chooser with details: Pick card, bank transfer or invoice terms; a detail pane shows the card on file, copyable transfer details or Net 30 to 60 terms with a PO number, and the next charge updates.

### Payment Cards

- `billing/payment-cards/TiltCardStudio` Tilting payment card with controls: A CSS-drawn card that tilts toward the pointer through nine hover zones and transforms only, flips to its back, freezes under frost, and changes colourway beside its spending limit.
- `billing/payment-cards/VirtualCardWallet` Team virtual card wallet: One virtual card per vendor with its spend against a monthly limit, freeze switches that frost the card face, a status filter and a one-line form to issue a new card.

## Communication

Inbox, chat, AI chat, support widgets, calls, voice and contacts.

### Inbox Layouts

- `communication/inbox-layouts/InboxReplyDebt` Reply-debt inbox: Three-pane inbox sorted by who owes the next move, with a waiting-time bar per sender; replying moves the thread to Waiting.
- `communication/inbox-layouts/TriageDeckInbox` One-at-a-time triage inbox: Unread mail as a deck: archive, keep for later or reply with a click or a key, with progress, an up-next queue and undo.

### Chat Workspace Layouts

- `communication/chat-workspace-layouts/DecisionLogWorkspace` Team chat with decision log: Channels, conversation and a decision log: mark any message as a decision and jump back to it from the side panel.
- `communication/chat-workspace-layouts/TopicThreadsWorkspace` Stream with topic threads: A channel split into named topics: filter open or resolved, read one topic at a time and resolve it when settled; replying reopens it.

### Customer Detail Layouts

- `communication/customer-detail-layouts/CustomerDossier` Customer dossier: Support conversation beside the customer’s health, seats and relationship timeline; internal notes stay in the flow and land on the timeline.
- `communication/customer-detail-layouts/CustomerOrdersDetail` Customer with order history: Customer header with lifetime stats over an order list; each order shows items, shipping facts and history, with refund and resend actions.

### AI Chat Layouts

- `communication/ai-chat-layouts/AiCitedAnswers` Research chat with cited answers: AI research workspace: history, reasoning trace and numbered citations that light up their source cards; follow-ups stream in.
- `communication/ai-chat-layouts/AiCanvasSplit` Chat with a document canvas: Writing workspace: requests in the chat edit a draft beside it, the changed paragraph is marked, versions can be undone, and phones switch between the two panes.

### Chat Toolbars

- `communication/chat-toolbars/MorphingChatToolbar` Morphing chat toolbar: One conversation toolbar with three modes: default actions, in-chat search with match stepping, and multi-select with bulk actions.
- `communication/chat-toolbars/MessageActionToolbar` Message action toolbar: A per-message toolbar on hover or focus: quick reactions that count, reply with a quote in the composer, pin to a channel banner, copy and a more menu.

### Message Bubbles

- `communication/message-bubbles/QuoteReplyBubbles` Bubbles with quoted replies: Grouped bubbles with reactions, read receipts and an unread divider; quoted replies jump back to the original and flash it.
- `communication/message-bubbles/DeliveryStateBubbles` Bubbles with delivery states: Sending, sent, delivered and read receipts, a failed message to retry, an offline switch, and edit or unsend on your last message.

### Media & Attachment Bubbles

- `communication/media-attachment-bubbles/MediaMosaicBubbles` Photo mosaic and file bubbles: A photo mosaic that opens an inline viewer, file cards, a drawn location pin and attachments that upload with live progress.
- `communication/media-attachment-bubbles/RichCardBubbles` Link, event and contact bubbles: A drawn link preview, an event invite with RSVP that updates attendees, a file card and a shared contact you can save.

### AI Chat Bubbles

- `communication/ai-chat-bubbles/AnswerDraftsBubble` Assistant answer with drafts: Assistant bubble with a reasoning trace, a diff code block and feedback; “try another approach” keeps earlier drafts behind a pager.
- `communication/ai-chat-bubbles/ToolApprovalBubble` Assistant action awaiting approval: The assistant proposes a calendar change as a reviewable diff; untick events, keep or drop the note to attendees, then approve, watch it run and undo.

### Support Chat Widgets

- `communication/support-chat-widgets/SupportQueueWidget` Support widget with live queue: Floating support chat over a storefront: topic shortcuts, queue position, a typing agent and an unread badge on the launcher.
- `communication/support-chat-widgets/ContactOptionsWidget` Widget with callback booking: Support launcher offering chat, email or a callback: pick a day and slot, enter a validated phone number and get a confirmation.

### Support Chat Sidebars

- `communication/support-chat-sidebars/HelpDeflectSidebar` Help sidebar that answers first: Docked help panel beside the app: while you type, matching guides appear above the composer; guides open in their own tab.
- `communication/support-chat-sidebars/TicketHistorySidebar` Support panel with conversation history: Docked support panel listing open and resolved conversations; resolved ones ask for a star rating and a reply reopens them.

### Inbox Threads

- `communication/inbox-threads/CollapsedThreadStack` Email thread with folded replies: Long email thread with pinned key points; middle replies fold into a paper stack, each message expands on its own, replies append.
- `communication/inbox-threads/ParticipantFilterThread` Thread filtered by participant: Group email thread with participant chips and a mentions-me switch; messages collapse to one-line previews and expand on demand.

### Video Call Layouts

- `communication/video-call-layouts/SpeakerStageCall` Speaker stage call: Video call with a pinned stage, a filmstrip you can pin from, a moving speaking ring, call controls and an in-call chat.
- `communication/video-call-layouts/HandRaiseGalleryCall` Gallery call with raised hands: Equal-tile gallery with a first-come raised-hand queue: the host calls on the next person, who is unmuted and gets the speaking ring.

### Call Device Settings

- `communication/call-device-settings/DeviceCheckPanel` Pre-call device check: Camera preview with mirror and blur, a mic level ladder that follows device and volume, speaker test and audio effects.
- `communication/call-device-settings/CallQualityPanel` In-call quality and bandwidth: Latency, loss and jitter against their thresholds, a measured upload that disables resolutions it cannot carry, incoming video choices and a live data-per-hour estimate.

### Voice Messages

- `communication/voice-messages/VoiceTranscriptNotes` Voice notes with live transcript: Voice bubbles with a seekable waveform, playback speed and a transcript that follows playback; record and send a new note.
- `communication/voice-messages/PushToTalkChannel` Push-to-talk channel: Walkie-talkie style voice clips with unheard dots, play-all-unheard in sequence and a hold-to-talk button that sends on release.

### Contact Cards

- `communication/contact-cards/TimezoneOverlapCards` Contacts with working-hour overlap: Contact cards showing local time, availability and how their working day overlaps yours; sort by overlap or name.
- `communication/contact-cards/KeepInTouchCards` Keep-in-touch cards: Contacts sorted by how overdue a catch-up is against each cadence, with a time-since meter and a one-tap log.

### Connections & Selectors

- `communication/connections-selectors/NewChatPicker` New conversation picker: Pick people as chips from suggested, team and external groups; a group takes shape with a suggested name and a guest notice.
- `communication/connections-selectors/ForwardMessagePicker` Forward to conversations: Forward a quoted message to up to five recent people and channels, with search, removable chips and an optional note.

## Productivity

Calendars, schedules, planning boards and kanban.

### Calendar Views

- `productivity/calendar-views/WeekFocusCalendar` Week view with focus windows: A week grid with positioned, side-by-side events, a now line and a meeting-load meter per day; each day's longest free stretch becomes a one-click focus block.
- `productivity/calendar-views/RoomResourceTimeline` Room timeline by resource: Meeting rooms as rows on a day timeline with a now line and seat filter; tap a free half hour to hold it, then extend or release your own bookings.

### Calendar Drawers

- `productivity/calendar-drawers/EventDetailDrawer` Event drawer with leave-by time: A day agenda behind an open side drawer that works back from the start time to when you should leave, with RSVP, guest statuses, a reminder and notes; picking a row swaps the event.
- `productivity/calendar-drawers/QuickAddEventDrawer` Quick add drawer with clash check: A bottom drawer to create an event while a dashed ghost previews it on the day behind; overlaps are flagged with a one-click move to the next free slot.

### Schedule Management

- `productivity/schedule-management/ShiftRosterPlanner` Shift roster with coverage: Paint early and late shifts onto a weekly roster while coverage rows count the gaps, hours meters flag overtime and short rest is marked; one click fills the gaps, then publish.
- `productivity/schedule-management/OnCallRotation` On-call rotation with overrides: A weekly primary and secondary rotation where any slot can be handed to a teammate as an override, with quarter load bars that keep swaps fair.

### Scheduling Modals

- `productivity/scheduling-modals/BookSlotDialog` Book a slot with shared availability: A scheduling dialog shown open over its page: pick a duration and a day, then a start time whose dots show who is free; one button jumps to the first time everyone can make it.
- `productivity/scheduling-modals/RecurrenceRuleDialog` Recurrence rule dialog: A dialog shown open over its page to set how an event repeats, read back in plain words with the next dates, and which occurrences the change applies to.

### Month & Year Calendars

- `productivity/month-year-calendars/YearLeavePlanner` Year and month leave planner: Twelve compact months where every weekday toggles a day off against a 25-day allowance, holidays and company events marked; bridge days are suggested, and any month opens as a labelled month view.
- `productivity/month-year-calendars/MonthAgendaCalendar` Month view with day agenda: A month grid that shows dots on phones and titled chips with overflow on wider screens, calendar filters, month paging and the selected day listed beside it.

### Kanban Board Layouts

- `productivity/kanban-board-layouts/ReleaseKanbanBoard` Release board with WIP limits: A full release board: cards drag to reorder within a column and step between stages with move buttons, columns push back when over their work-in-progress limit, stale cards show their age and the header burns down the points.
- `productivity/kanban-board-layouts/SwimlaneKanbanBoard` Swimlane board: Stages as columns and lanes grouped by assignee or priority, with sticky stage headers, collapsible lanes, point totals and blocked cards held back.

### Kanban Group Headings

- `productivity/kanban-group-headings/FlowColumnHeadings` Stage headings with capacity slots: Kanban column headings that show work in progress as slots, overflow striped past the limit, with cycle time and its trend, owners and a working actions menu; columns collapse into slim vertical spines.
- `productivity/kanban-group-headings/EpicLaneHeadings` Epic lane headings with forecast: Horizontal group headings per epic: progress split by status, a velocity forecast that flags epics due too soon, owners and an add button; lanes expand into their tasks.

### Kanban Board Cards

- `productivity/kanban-board-cards/TaskCardGallery` Task cards with signal rails: Six card shapes for one board, a design brief with cover art, a P1 bug on an SLA clock, a live checklist, a pull request with checks and reviews, a blocked task and an epic roll-up, each with a rail that turns green, orange or red as you act on it.
- `productivity/kanban-board-cards/CardFieldsCustomizer` Card layout customizer: Pick a density and the fields a card shows, see a live column of cards update, and read how many cards now fit on screen.

## Feedback & States

Empty and success states, shortcuts, reviews and consent prompts.

### Empty States

- `feedback/empty-states/EmptyInboxFirstRun` First-run inbox: An empty inbox that teaches: three ways to start, each with its real setup step, and the empty state gives way to the first conversations once a channel connects.
- `feedback/empty-states/NoResultsRecovery` No results, with a way back: A search that comes up empty and explains why: a funnel shows which filter emptied the list, each filter chip says how many results removing it brings back, and a typo gets a one-click correction.
- `feedback/empty-states/TemplateStartEmpty` Start from a template: An empty projects page that offers starting points: template cards with drawn previews, a blank option and imports; picking one opens a live preview that follows the name you type and the sample-data switch.
- `feedback/empty-states/AccessRequestEmpty` Request access: A no-access state that sets expectations: the owner with their working day on a 24-hour band, a request form with access level and message, then a pending timeline you can cancel.

### Success States

- `feedback/success-states/PaymentSentReceipt` Payment sent receipt: A calm success screen: a check that bursts once, a receipt that prints out of a slot with a torn edge, a delivery tracker and two follow-up switches.
- `feedback/success-states/WorkspaceReadyHandoff` Workspace ready handoff: A setup success screen: four tiles settle into place, a checklist of what was created ticks in, an invite form turns the moment into team growth and three next steps follow.

### Action Cards & Shortcut Links

- `feedback/action-cards-shortcut-links/QuickActionsLaunchpad` Quick actions launchpad: Six action cards with single-key shortcuts that work while the panel has focus, a pinnable list of places to jump back into, and a trail of what you just used.
- `feedback/action-cards-shortcut-links/SuggestedActionsFeed` Suggested actions feed: Action cards raised by what changed in the account, each with its impact, a one-click fix, a snooze and an undo, filtered by area while a meter counts what is handled.

### Product Review Sections

- `feedback/product-review-sections/ReviewsFitLedger` Reviews with fit meter: A rating summary whose bars double as star filters, a fit meter between runs small and runs large, topic chips, three sorts and helpful votes on every review.
- `feedback/product-review-sections/AttributeScoreReviews` Reviews scored by attribute: Software reviews split by company size: attribute bars sit against the category average, and picking an attribute ranks the reviews by it, with liked and disliked notes on each.

### Cookie Consent Prompts

- `feedback/cookie-consent-prompts/ConsentCornerCard` Fair consent card: A compact prompt over a storefront where Reject all weighs as much as Accept all, Choose unfolds per-kind switches in place, and the decision folds into a pill that reopens it.
- `feedback/cookie-consent-prompts/ConsentPreferencesPanel` Privacy preferences panel: A full preferences dialog shown open in place: category switches with their services and retention, a Global Privacy Control notice, and a plain-words summary that rewrites itself as you toggle.

## Search & Command

Search results and keyboard-first command palettes.

### Search Results

- `search/search-results/SearchResultsWorkspace` Workspace search results: Docs, issues, people and code for one query: a best-match card, highlighted terms, a relevance spine on every row, and type, date and sort filters with live counts.
- `search/search-results/CatalogSearchResults` Shop search with typo fix: Product results for a misspelled query with a did-you-mean fix, price range, brand chips whose counts ignore their own filter, stock filter, sorting and an empty state.

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
- `drawers/utility-detail-drawers/DeployDetailDrawer` Deployment detail drawer: A bottom drawer over a deployments list: commit, author and status, build steps with duration bars and the failing test output, plus a retry for failed builds and a two-step rollback for older ones.

### Filter Drawers

- `drawers/filter-drawers/TransactionFilterDrawer` Staged transaction filter drawer: A right drawer that edits a draft of the filters: period, amount range, type with counts, categories, cards and missing receipts, previewed as a count, a total and a daily spend sparkline before Show applies them to the list.
- `drawers/filter-drawers/LogQueryDrawer` Log query builder drawer: A bottom drawer over a log viewer that builds a query from field, operator and value rows matched by all or any, loads saved queries, previews the query string and the match count, and applies it on Show.

### Listing Filter Panels

- `drawers/listing-filter-panels/RentalFilterDrawer` Live rental filter drawer: A left drawer over a rental listing: rent range, rooms, size, neighbourhoods with counts, must-haves and move-in date. Behind a light scrim, homes that stop matching fade back as you filter; closing keeps only the matches.
- `drawers/listing-filter-panels/SneakerFacetDrawer` Product facet drawer: A right drawer over a shoe listing with folding facets: a size grid that strikes out sizes nobody stocks, colour swatches, a price range and brands with live counts; applied facets become removable chips above the grid.

## UI Components

Menus, selects, buttons, badges, chips, progress and links.

### Dropdown Menus

- `ui-components/dropdown-menus/IssueActionsDropdown` Issue row actions: Every issue row owns a live action menu whose entries follow its state (reopen, unassign, checked priority), shown pinned open beside its trigger, with undo for archive.
- `ui-components/dropdown-menus/DealFilterMenus` Multi-select filter menus: A deal pipeline filtered by pulldown menus with checked entries, counts on their triggers and removable chips, plus a close-date picker; the Stage menu is also shown open and drives the same filter.

### Account & Workspace Menus

- `ui-components/account-workspace-menus/WorkspaceSwitcherMenu` Workspace switcher: An open workspace switcher with plans, member counts and unread badges, beside a live account menu; switching repaints the workspace card with its own hue, seats and team.
- `ui-components/account-workspace-menus/AccountStatusMenu` Account and presence menu: An account menu open under its avatar: presence switch, status message, clear-after menu and notification pause, then account switching and sign out; the avatar dot follows your presence.

### Selection Menus

- `ui-components/selection-menus/TableViewOptionsMenu` Table display options: An open display panel with group-by, density and column checkboxes, mirrored by a live checked-item pulldown; the renewals table beside it re-renders with every choice.
- `ui-components/selection-menus/BulkFileActionsMenu` Bulk file actions menu: A contracts folder with checkbox selection and a select-all mixed state, beside an open selection menu that stars, archives, copies or deletes every checked file.

### Select Menus

- `ui-components/select-menus/TimezoneOverlapSelect` Timezone overlap select: Two city selects with live local times, one drawn open as a listbox; both workdays line up on a half-hour strip that lights the shared hours and suggests a standup slot.
- `ui-components/select-menus/InviteRoleSelects` Invite role selects: An invite list where each person gets a role select with what the role can do, while a seat meter and the monthly cost follow every change.

### Tagging Selects

- `ui-components/tagging-selects/IssueLabelTagger` Issue label tagger: A multi-select combobox and an open label picker share one set of colour-coded labels, with exclusive groups that swap a sibling out, plus a validated keyword tag field.
- `ui-components/tagging-selects/BulkAssetTagger` Bulk photo tagger: Select several photos and tag them at once: each tag shows checked, mixed or empty for the selection, and typing a new name creates and applies it.

### Embedded & Compact Selects

- `ui-components/embedded-compact-selects/SentenceFilterSelects` Sentence filter selects: A receivables filter written as a sentence whose underlined words are compact selects, with live totals, next to an amount field whose embedded currency list is shown open.
- `ui-components/embedded-compact-selects/DnsRecordFields` DNS record fields: A DNS record form whose fields carry their own compact selects, record type before the name and TTL after the value, with per-type validation and a live zone line.

### Ecommerce Menus

- `ui-components/ecommerce-menus/StorefrontCartMenus` Storefront menus and mini bag: A shop menu open in place with aisles and a featured box, plus an open mini bag whose steppers, free-shipping meter and totals reprice live with the currency menu.
- `ui-components/ecommerce-menus/CatalogFilterMenus` Catalog sort and filter menus: A category page with a sort menu and a filter popover open in place: price range, sizes and colour narrow the product grid live, and the trigger counts the active filters.

### Editor & Toolbar Menus

- `ui-components/editor-toolbar-menus/DocEditorToolbar` Editor toolbar and slash menu: A formatting toolbar with a block-style menu, mark toggles, alignment and an insert menu that restyle the selected paragraph live, plus a slash command menu open at the caret.
- `ui-components/editor-toolbar-menus/SheetFormatToolbar` Spreadsheet format toolbar: A spreadsheet toolbar with a number format menu, decimal buttons, bold and italic toggles, alignment and an open fill colour popover, all reading and writing the selected cell beside a formula bar.

### Profile Popovers

- `ui-components/profile-popovers/MentionProfilePopover` Mention profile popover: Mentions in a comment thread open quick profile popovers, while the full card stays pinned open: status, local time on a working-day track with advice on when to reach out, stats and a follow toggle.
- `ui-components/profile-popovers/ProjectMemberPopover` Project member popover: A project avatar row whose profile popover stays open and slides its arrow to the picked member: status, task stats, sprint capacity, project access select and removal.

### Buttons

- `ui-components/buttons/ReleaseButtonDeck` Release action deck: Every button style on one release page: icon toggles, a ladder from plain to filled, a loading promote action and a press-and-hold rollback.
- `ui-components/buttons/PlanButtonStates` Plan management buttons: Buttons on a billing page: an upgrade that loads then confirms, a seat counter whose save button explains why it waits, a mini to large size ladder and a two-step cancel that spells out the consequence.

### Action Button Groups

- `ui-components/action-button-groups/ReviewActionGroups` Code review action groups: A pull request toolbar built from button groups: an attached file pager, a unified or split diff switch, a verdict strip and a split merge button whose strategy you pick.
- `ui-components/action-button-groups/CalendarActionGroups` Calendar header action groups: A calendar header made of button groups: an attached previous, today and next pager, a day, week or month switch and a split create button whose event type you pick; the grid below follows every press.

### Segmented Controls

- `ui-components/segmented-controls/ViewModeSegments` Task view segments: Icon, text and tinted segmented controls driving a live task list: switch list, grid or board, density and sort order, with the sorted field highlighted on every card.
- `ui-components/segmented-controls/EnergyUsageSegments` Energy usage segments: Period, unit and circuit segmented controls reshape a home energy chart, switching between kWh and cost with the total, trend and peak recalculated.

### Label & Feedback Groups

- `ui-components/label-feedback-groups/ArticleFeedbackGroup` Guide feedback group: A metadata label group and a helpful vote on a docs guide: the vote moves the live score, then opens reason chips and an optional note in place.
- `ui-components/label-feedback-groups/SearchRelevanceJudge` Search relevance review: Search results for one query, each with a source and freshness label group and a Relevant, Partly or Off-topic vote that moves a live precision meter.

### Badge Styles

- `ui-components/badge-styles/ChangelogBadgeStyles` Changelog badge styles: Solid, tinted, outline, dot, count and anchored badges in a release feed where each style means one thing; count badges drive the filters and unread dots clear on demand.
- `ui-components/badge-styles/InboxCountBadges` Inbox count and label badges: A support inbox where folder counts cap at 9+ or 99+, presence dots sit on agent avatars and label badges mark VIP, urgent or external mail; reading a message brings every count down.

### Status Badges

- `ui-components/status-badges/ServiceStatusBoard` Service status board: Operational, degraded, outage, maintenance and deploying badges on a platform status board, each row with a 30-day uptime ribbon and an incident note that unfolds.
- `ui-components/status-badges/OrderStatusQueue` Order status queue: A shop order queue with seven fulfilment badges and count badges on each filter, where advancing an order swaps its badge and updates every count.

### Tag Chips

- `ui-components/tag-chips/AudienceChipBuilder` Audience chip builder: Selectable, removable and suggestion chips plus a tag input that shape a campaign audience, read back as one plain sentence with a live estimate.
- `ui-components/tag-chips/JobFilterChips` Job filter chips: Selectable chip groups filter a job board, each chip showing how many roles it would leave, with removable active-filter chips and a clear-all.

### Progress Indicators

- `ui-components/progress-indicators/ImportProgressConsole` Import progress console: One running import told by every progress primitive: stage steps, an overall ring, per-entity bars, a segmented outcome bar, an API budget meter and an indeterminate reindex, with pause and resume.
- `ui-components/progress-indicators/SetupChecklistProgress` Setup checklist progress: A workspace setup checklist where every ticked task fills a count ring and per-track bars weighted by minutes, with the time left updating live.

### Utility Links

- `ui-components/utility-links/ResourceLinksPanel` Developer resource links: Back, inline, chevron, external, download, copy, shortcut and footer links on an API keys page; each trailing glyph nudges toward where the link goes.
- `ui-components/utility-links/OrderConfirmationLinks` Order confirmation links: Back, inline, copy, next-step and policy links on an order confirmation; tracking, invoice, calendar, returns and support links each nudge their glyph toward where they lead.

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
- `navigation/application-navbars/CommandNavbar` Command-first app navbar: A research-repository navbar built around one search button that opens a grouped command palette in place, with page links, a notification count and a chip strip when narrow.

### Flow Headers

- `navigation/flow-headers/WorkspaceFlowHeader` Workspace setup flow header: A focused flow header with steps that only jump back, a time-left estimate, save and exit, and a progress hairline; narrow widths swap the steps for one compact line.
- `navigation/flow-headers/CheckoutFlowHeader` Checkout flow header: A checkout header with back to shop, a secure badge and a step trail that only links back; narrow widths fold the order summary under the header behind a total that follows the shipping choice.

### Secondary Navs

- `navigation/secondary-navs/SettingsSecondaryNav` Settings secondary nav: One settings nav in two shapes, a grouped column when wide and a scrolling strip when narrow, with counts, a New badge and an unsaved-changes dot that follows your edits.
- `navigation/secondary-navs/RepoSecondaryNav` Repository tab nav: A code repository header with watch and star toggles and underline tabs carrying counts and a failing-build dot; narrow widths swap the tabs for a single select.

### Scroll Navigation

- `navigation/scroll-navigation/PostmortemScrollNav` Postmortem scroll navigation: A long incident report in its own scroll pane: the outline follows the section in view with a sliding marker, turns into a chip strip when narrow, and a scroll-driven hairline shows reading progress.
- `navigation/scroll-navigation/MenuCategoryScrollNav` Menu with sticky category chips: A café ordering menu in its own scroll pane: a sticky chip bar follows the category in view and keeps its chip centred, a tap scrolls to that section, and add buttons fill the basket.

### Card Tabs

- `navigation/card-tabs/MetricCardTabs` Metric card tabs: Four metric cards that are the tabs themselves: picking one lights its edge and redraws the daily chart against last week, with full arrow-key support.
- `navigation/card-tabs/FolderCodeTabs` Folder code tabs: Folder-style language tabs cut from the same sheet as the code card below, with a test event you can send and a response line that appears in place.

### Dashboard Sidebars

- `navigation/dashboard-sidebars/PulseSidebar` Live-pulse dashboard sidebar: A bike-share operations sidebar whose rows carry live micro-stats, with a jump filter, collapsible sections, an icon-rail mode on wide screens and an off-canvas panel on narrow ones.
- `navigation/dashboard-sidebars/SuiteSwitcherSidebar` Icon rail with contextual panel: A CRM suite sidebar in two layers: an app rail on the edge and a panel that swaps its sections per app and remembers each selection; when narrow the panel slides over the page.

### Application Sidebars

- `navigation/application-sidebars/DualRailSidebar` Dual-rail application sidebar: An editorial workspace with an icon rail and a context panel whose folder tree follows the chosen area; tap the active area to tuck the panel, and on phones the rail turns into a bottom tab bar.
- `navigation/application-sidebars/FloatingDockSidebar` Floating dock sidebar: A sidebar card that floats off the edges and folds into an icon rail with tooltips; a workspace switcher on top, pinned favourites reached with G then a letter, and a storage meter that becomes a ring when folded.
- `navigation/application-sidebars/SpacesSidebar` Spaces sidebar: Browser-style spaces: dots at the bottom switch between Personal, Design and Engineering, the whole shell takes the space's tint and the list slides sideways, with pinned tiles and unread counts you can clear.
- `navigation/application-sidebars/FilterTreeSidebar` Filterable tree sidebar: A dense sidebar whose filter field narrows the nested tree as you type: matches are highlighted, their parents open on their own, empty results suggest other words, with collapsible sections and a Recent list.

### Dashboard Sidebar Modules

- `navigation/dashboard-sidebar-modules/SidebarModuleRack` Sidebar module rack: Workspace switcher, setup checklist with progress ring, plan usage meters, a dismissible changelog card and a presence picker, each shown in the sidebar slice it belongs to.
- `navigation/dashboard-sidebar-modules/SidebarUtilityModules` Sidebar utility modules: Pinned views you can reorder and unpin, the next meetings with a join button, a quick-capture note that lands in the inbox, and a trial card that counts days as cells.

### Sidebar Navigation

- `navigation/sidebar-navigation/HandbookNav` Handbook navigation with reading trail: A nested company-handbook sidebar that tracks what you have read: marks on a guide line, per-section counts, an overall meter, a highlighting filter and recently viewed pages.
- `navigation/sidebar-navigation/ChannelSidebar` Team chat channel sidebar: A clinic chat sidebar with starred, channel and direct message sections, mention counts, presence dots and muted channels; an unread-only switch, mark all read and folding sections all work.

### Multi-Panel Layouts

- `navigation/multi-panel-layouts/TriageWorkspace` Three-panel triage workspace: A support desk split into a queue, a live thread and a customer panel with resizable handles; replies, macros and solve all work, and on phones the panels become a sliding stack.
- `navigation/multi-panel-layouts/MillerColumnsBrowser` Miller columns file browser: An architecture studio's files in cascading columns, projects then folders then files, ending in a preview panel; on phones one column shows at a time with a back button and a breadcrumb.

### Detached Sidebar Layouts

- `navigation/detached-sidebar-layouts/DetachedStudioLayout` Floating studio sidebar: A podcast studio layout whose sidebar floats as an inset card over a tinted backdrop, with collapsible show lists and a mini player whose waveform plays; it slides in from the edge on narrow screens.
- `navigation/detached-sidebar-layouts/IslandsReviewLayout` Floating islands review layout: A design-review layout of three floating cards: file navigation, a canvas with numbered comment pins and a comments panel; pins and threads highlight each other, and the nav becomes a pill strip when narrow.

### Dashboard Demo Layouts

- `navigation/dashboard-demo-layouts/CoopEnergyDashboard` Community energy dashboard: A complete co-op dashboard: sidebar, top bar and a sun-path hero that places the sun on its arc, with KPI tiles, a generation chart, live site bars and working views for sites, members, payouts and settings.
- `navigation/dashboard-demo-layouts/BistroServiceDashboard` Restaurant service dashboard: A top-navigation dashboard for a restaurant: a venue switch that swaps every figure, covers by hour, arriving bookings you can seat, a filtered bookings list and a floor plan whose tables cycle state.

### Title Bars

- `navigation/title-bars/RecordTitleBar` Record title bar with phase ribbon: A project header with breadcrumb, inline rename, status menu, follow and share actions, key facts, a one-line phase timeline marking today, and counted tabs.
- `navigation/title-bars/SelectionTitleBar` Collection title bar with selection mode: An invoices header with live totals, search, quick filters and a list or card view; selecting rows cross-fades it into a contextual bar whose bulk actions really apply.

### Dashboard Footers

- `navigation/dashboard-footers/StatusStripFooter` Status strip dashboard footer: An app footer that doubles as a status page: a 60-day uptime strip you can walk with the arrow keys, the build id with copy, a region switch with latency, links and a shortcut hint.
- `navigation/dashboard-footers/PreferencesFooter` Footer with preferences and feedback: An app footer that asks if the page helped, folds its link columns into disclosures when narrow, and sets language, currency and appearance with a live sample of how amounts will read.

### Stacked Footers

- `navigation/stacked-footers/StackedWordmarkFooter` Stacked footer with outlined wordmark: Four tiers: a validated newsletter sign-up, link columns that fold into disclosures on phones, a legal bar with language and appearance switches, and an oversized outlined wordmark cropped by the edge.
- `navigation/stacked-footers/SupportStatusFooter` Support footer with live status: Three help doors above link columns and a region-scoped system status panel whose services fold into a disclosure, closed by a compact legal bar.

### Blank & Error Pages

- `navigation/blank-error-pages/OffTheMapError` Off-the-map 404 page: A not-found page for a route planner: a contour-map illustration whose trail runs off the torn edge, the missing path spelled out, a search that suggests live pages and a broken-link report.
- `navigation/blank-error-pages/AccessDeniedPage` Request access 403 page: A restricted-document page: a locked-file illustration, the document and its owner, a request form with access level and message, and a pending state you can withdraw.

### Sticky Layouts

- `navigation/sticky-layouts/StickyReleaseNotes` Four-layer sticky release notes: A self-scrolling changelog that stacks four sticky layers: a frosted header with a scroll-driven progress line, a version index that tracks the section in view, per-version headings and a feedback bar.
- `navigation/sticky-layouts/StickyPlanSummary` Plan configurator with sticky summary: A self-scrolling upgrade form with a frosted header and pinned step headings; the price summary sticks beside the form on wide screens and becomes a bottom bar on phones.
