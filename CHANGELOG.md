# Changelog

All notable changes to the Guhr client-onboarding board are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.2.1] — 2026-06-18

### Changed — resilient header
- Moved the secondary actions (Activity log, Archived, Reset) into a compact
  **"⋯" overflow menu** so the header no longer overflows or breaks when the
  window is narrowed.
- Made the header responsive: it sheds the lowest-value chrome first as space
  tightens (picker captions, then the client/phase stats, then the brand
  subtitle), keeping the filter, "acting as", New inquiry, and menu usable.

### Removed
- Unused `.btn-secondary` / `.linklike` styles (superseded by the overflow menu).

## [1.2.0] — 2026-06-18

### Added — advisor filtering
- A **View** filter in the header narrows the board to a single advisor's cards
  (or Unassigned), so a colleague can focus on just their own work. Column counts
  and the header total reflect the filtered view, and the control is tinted while
  a filter is active. Creating a client clears the filter so the new card shows.

### Added — archive & delete
- Cards can be **archived** (hidden from the board but kept) from the detail
  panel, and **deleted** permanently (with confirmation).
- New **Archived** panel (header button, with a live count) lists archived
  clients and lets you **restore** or **delete** them.
- `Client` gained an optional `archived` flag; both actions are recorded in the
  activity trail (new `archived` / `unarchived` / `deleted` entry types).

## [1.1.0] — 2026-06-18

Tasks, assignment, and an audit trail — turning the board from a static layout
into a working tool people are accountable for.

### Added — tasks on cards
- Required-document items are now editable **tasks**: add a task to any card,
  remove it, and check it off. Tasks are no longer fixed seed data.
- Each task can be **assigned to an advisor**, so it's clear who owns what.
- `ChecklistItem` gained `id` and `assignee` fields.

### Added — advisor assignment
- The detail panel's advisor field is now an editable selector (it was
  read-only). A card can be assigned, reassigned, or unassigned.

### Added — activity trail / admin panel
- New append-only **activity log** records every meaningful change — moves,
  priority/mandate/advisor changes, task add/remove/complete/assign, detail and
  notes edits, card creation, and board reset — with who, what, and when.
- New **Activity** panel (opened from the header) shows the trail newest-first,
  grouped by day, with relative timestamps.
- New **"Acting as"** identity switcher in the header stamps each change with the
  acting advisor, so the trail is meaningful without a full auth system.

### Added — richer new-client flow
- Replaced the name-only inline add with a **new-client modal** that captures
  name, business descriptor, mandate type, advisor, priority, contact details,
  and target phase. New cards open straight into the detail panel to finish up.

### Changed — editable everywhere
- Client name, business descriptor, email, and phone are now inline-editable in
  the detail panel (commit on blur, so the trail logs one edit, not one per key).
- Mandate type is now editable from the detail panel.
- Persistence key bumped to `guhr.onboarding.board.v2` (state now also stores the
  activity log and current user).

### Removed
- The inline `AddCardForm` component (superseded by the new-client modal).

## [1.0.0] — 2026-06-18

Initial build of the client-onboarding Kanban board, rebuilt from the design
export into a real, runnable React application.

### Added — project scaffold
- Vite + React 18 + TypeScript project setup (`package.json`, `vite.config.ts`,
  `tsconfig.json`, `index.html`).
- Brand typefaces wired up: Work Sans (UI/headings) and Mulish (body).
- Guhr logo assets copied into `public/assets/`.

### Added — domain model & data
- `src/lib/types.ts` — core domain types (Client, ColumnId, Priority, etc.).
- `src/lib/brand.ts` — design tokens extracted verbatim from the export:
  mandate-tag colors, advisor roster, priority cues, the seven phases.
- `src/lib/dates.ts` — relative ("3 days ago") and full date formatting.
- `src/data/seedClients.ts` — 11 realistic German sample clients from the design.

### Added — state & persistence
- `src/lib/useBoard.ts` — single source of truth for client data with
  add / update / move / checklist-toggle / reset operations, debounced-persisted
  to `localStorage` so changes survive a refresh (no backend required).
- `src/lib/useDragAndDrop.ts` — transient drag state via the native HTML5 DnD API.

### Added — UI components
- 7-column board with live per-column counts.
- Cards showing mandate tag, priority indicator, relative date, name, business
  descriptor, notes preview, document-checklist progress, and advisor avatar.
- Drag-and-drop between columns with dragging (dimmed) and drop-target
  (highlighted) states, no page reload.
- Slide-in detail panel: email, phone, advisor, date, phase dropdown, priority
  selector, interactive required-documents checklist, and editable notes —
  all edits live and persisted. Closes on overlay click or Escape.
- Inline "add a card" flow in every column, plus a header "New inquiry" shortcut.
- Header "Reset" action to restore the original sample data.

### Notes
- Styling matches the design export pixel-for-pixel (cream board surface, gold
  accent, exact hex values, spacing, and typography).
- Respects `prefers-reduced-motion` for the panel animations.
