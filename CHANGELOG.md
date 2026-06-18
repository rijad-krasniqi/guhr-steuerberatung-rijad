# Changelog

All notable changes to the Guhr client-onboarding board are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

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
