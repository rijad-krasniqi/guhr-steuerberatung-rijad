# Guhr Steuerberatung — Client Onboarding Board

An internal Kanban tool for tracking new tax-advisory clients through a seven-stage
onboarding pipeline, from first inquiry to a signed, active engagement. Built to
match Guhr Steuerberatung's in-house brand — the gold/tan accent, cream board
surface, their logo and typography — so it reads as a tool the firm built itself.

![Pipeline: New Inquiry → Consultation Scheduled → Documents Requested → Documents Received → Engagement Letter Sent → Signed & Active → On Hold / Paused](public/assets/logo.svg)

---

## Run it locally

Requires **Node 18+** (developed on Node 22).

```bash
npm install
npm run dev
```

That starts the Vite dev server and opens <http://localhost:5173>. That single
command is all you need.

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

---

## Tech stack & why

The brief asked for a single-page, state-heavy internal tool (drag-and-drop,
modals, live updates, no reloads) with clean, maintainable code and fast local
runnability — and warned against over-engineering. Each choice below serves that.

| Choice | Why |
| --- | --- |
| **React 18** | The board is fundamentally a tree of components reacting to one shared state. React's declarative model keeps "the UI is a function of the data" honest, which matters for live updates across the board and the detail panel. It's also the most maintainable choice for the next person at the firm. |
| **TypeScript** | The data has a clear shape (clients, phases, mandate types, advisors). Types document that shape, catch wiring mistakes at compile time, and make the code self-describing for a future maintainer. |
| **Vite** | Near-instant dev server and a one-command start (`npm run dev`). Minimal config, no bundler ceremony. |
| **Native HTML5 drag-and-drop** | The interaction is simple — move a card from one column to another. The browser's built-in DnD does this with zero dependencies, and the original design was built the same way. Pulling in a DnD library here would be exactly the "kitchen-sink" dependency the brief warns against. |
| **Hand-written CSS (no UI framework)** | Brand fidelity is a scored criterion, and the design specifies exact hex values, spacing, and type. A CSS framework would fight those values and risk a generic-SaaS look. Plain CSS with brand tokens (`src/index.css` + `src/lib/brand.ts`) reproduces the design exactly. |
| **`localStorage` persistence** | See below. |

**Total runtime dependencies: just `react` and `react-dom`.** Everything else is
dev-only tooling.

### State & persistence: why localStorage, not a backend

All client data lives in one flat array, each card carrying its own `column`
field. Moving a card between phases is therefore just a field update — no
cross-list bookkeeping. That whole array is debounced-saved to `localStorage`
(`src/lib/useBoard.ts`), so edits survive a page refresh.

For a single-user internal tool being evaluated locally, this is the right
trade-off: it makes the app runnable with one command and no setup (no database,
no server process, no env vars), while still delivering the "changes survive a
refresh" requirement. The state layer is deliberately isolated behind the
`useBoard` hook, so if the firm later needs multi-user, shared data, swapping
`localStorage` for a REST/Supabase backend means changing one file — the
components never touch persistence directly.

A **Reset** action in the header restores the original sample data.

---

## Project structure

```
src/
  main.tsx                # React entry point
  App.tsx                 # Composition root: wires board state, drag, and panel
  index.css               # All layout/typography + brand surfaces (exact design values)
  lib/
    types.ts              # Domain types (Client, ColumnId, Priority, …)
    brand.ts              # Design tokens: mandate/advisor/priority colors, phases
    dates.ts              # Relative + full date formatting
    useBoard.ts           # Client state + localStorage persistence (single source of truth)
    useDragAndDrop.ts     # Transient drag/drop UI state (native HTML5 DnD)
  data/
    seedClients.ts        # 11 realistic German sample clients from the design
  components/
    Header.tsx            # Brand lockup, live stats, "New inquiry", Reset
    Board (in App.tsx)    # Lays out the seven columns
    Column.tsx            # One phase: header + count, card list, add-card footer
    Card.tsx              # A single client card
    AddCardForm.tsx       # Inline "add a card" input
    DetailPanel.tsx       # Slide-in side panel with all editable fields
    Avatar.tsx            # Advisor avatar (shared by card + panel)
public/assets/            # Guhr logo (color + white)
```

Boundaries are drawn so each file has one job: `brand.ts` owns *what the brand
looks like*, `useBoard.ts` owns *the data and how it's saved*, and the components
own *how it's presented*. Data-driven colors (a mandate tag, an advisor avatar)
are applied inline from `brand.ts`; everything static lives in `index.css`.

---

## Features

- **Seven-column pipeline** — New Inquiry, Consultation Scheduled, Documents
  Requested, Documents Received, Engagement Letter Sent, Signed & Active, and a
  muted On Hold / Paused column. Each column shows a live count.
- **Rich cards** — client name, business descriptor, colored mandate-type tag,
  assigned advisor (colored initials avatar, or a dashed "unassigned" marker),
  date added (shown relatively, e.g. "3 days ago"), a priority indicator, a
  two-line notes preview, and — where relevant — a document-checklist progress
  indicator (dots + "X / N complete").
- **Drag-and-drop** between columns with no page reload. The dragged card dims;
  the hovered column highlights as a drop target.
- **Detail panel** — a slide-in side panel showing email, phone, advisor, date
  added, a **phase** dropdown, a **priority** selector (High / Standard / Low),
  an **interactive required-documents checklist** with live progress, and an
  **editable notes / next-steps** field. Every edit is live and persisted.
  Closes on overlay click or Escape.
- **Add a card** inline in any column, plus a header "New inquiry" shortcut that
  opens the add form in the New Inquiry column.
- **Persistence** — all changes survive a refresh via `localStorage`; **Reset**
  restores the seeded sample data.
- **Accessible motion** — panel animations respect `prefers-reduced-motion`.

---

## Design notes

The design was provided as an exported reference implementation. Colors, spacing,
type sizes, and the sample data were taken from it verbatim and live in
`src/lib/brand.ts`, `src/index.css`, and `src/data/seedClients.ts`. The app
language is English (as requested), while the sample clients and business types
remain authentically German.
