# Ai components

Each family follows the shadcn composition. Parts are separate components; the root also accepts shortcut props that render a default layout when no default slot is given.

## Attachment
`MiAttachment` > `MiAttachmentMedia`, `MiAttachmentContent` (`MiAttachmentTitle`, `MiAttachmentDescription`), `MiAttachmentActions` (`MiAttachmentAction`), `MiAttachmentTrigger`; `MiAttachmentGroup` lays out a scrollable snapping row.
- `MiAttachment`: `state` (`idle|uploading|processing|error|done`, shimmer while in progress), `size` (`sm|default|lg`), `orientation` (`horizontal|vertical`). Shortcut props: `name`, `fileSize` (bytes), `type` (MIME), `preview`, `progress`, `error`, `removable`. Event: `remove` (shortcut button).
- `MiAttachmentMedia`: `variant` (`icon|image`). `MiAttachmentAction`: emits `click`; set `aria-label`. `MiAttachmentTrigger`: `href` (anchor) or button, emits `click`.

## Trace
`MiTrace` > `MiTraceLine` (`status`: `running|error|pending`) with `MiTraceIcon`, `MiTraceTitle`, `MiTraceDescription`; `MiTraceCollapsible` (`v-model:open`, `defaultOpen`) > `MiTraceCollapsibleTrigger` + `MiTraceCollapsibleContent` (`keepMounted`).
- Shortcut: `MiTrace` `steps: MiTraceStep[]` (`id?`, `title`, `description?`, `status?: done|running|error|pending`, `duration?` ms, `detail?`, `open?`) and `label`.

## Questionnaire
`MiQuestionnaire` > `MiQuestionnaireProgress`, `MiQuestionnaireItem` (`name`, `multiple`, `required`) > `MiQuestionnaireTitle`, `MiQuestionnaireDescription`, `MiQuestionnaireChoices` > `MiQuestionnaireChoice` (`value`) / `MiQuestionnaireInput`, `MiQuestionnaireError`; `MiQuestionnaireActions` > `Previous`, `Skip` (hidden when required), `Next`, `Submit` (last step).
- `MiQuestionnaire`: `v-model` answers by item name (`string`, or `string[]` when multiple), `defaultItem`, `shortcuts` (`letters|none`: A, B, C pick a choice), `questions: MiQuestion[]` shortcut (`name`, `title`, `description?`, `choices?`, `multiple?`, `required?`, `input?`). Event: `submit(answers)`. Items render in order; the form is a native `<form>` with one named field per item.

## CodeBlock
`MiCodeBlock` > `MiCodeBlockHeader` (`MiCodeBlockTitle`, `MiCodeBlockActions` > `MiCodeBlockCopyButton`), `MiCodeBlockContent` (`wrap`, `lineNumbers`; a string child or `MiCodeBlockLine` children), `MiCodeBlockFooter`.
- `MiCodeBlock`: `size` (`default|sm`), `variant` (`default|destructive`). Shortcut: `code`, `filename`, `language`, `lineNumbers`, `copyable`, slot `highlighted` for pre-highlighted HTML (no highlighter dependency).
- `MiCodeBlockLine`: `variant` (`default|highlighted|added|removed`). `MiCodeBlockCopyButton`: `value`, emits `copy`. Line numbers are CSS counters, so they are not copied.
