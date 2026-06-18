// Brand + design tokens, pulled verbatim from the design export so the app
// renders pixel-for-pixel like Guhr's in-house tool. Layout/spacing values live
// in index.css; this file holds the *data-driven* colors that the components
// look up at render time (mandate tags, advisor avatars, priority cues, phases).

import type { ColumnId, MandateType, MemberId, Priority } from "./types";

/** The gold/tan accent that defines the Guhr brand. */
export const GOLD = "#C3A35B";
export const GOLD_HOVER = "#B2924A";

/** Colored tag styles per mandate type. */
export const MANDATE: Record<MandateType, { bg: string; color: string }> = {
  "Income Tax": { bg: "#E7EEF8", color: "#2E5C92" },
  GmbH: { bg: "#E1F0EC", color: "#287A67" },
  UG: { bg: "#ECE7F5", color: "#5E4894" },
  GbR: { bg: "#FAEADC", color: "#B5722A" },
  Freelancer: { bg: "#F5EED6", color: "#9A7B22" },
  VAT: { bg: "#F9E6EC", color: "#A8456A" },
};

/** Advisors. `bg` is the avatar color; initials double as the lookup id. */
export const MEMBERS: Record<MemberId, { name: string; initials: string; bg: string }> = {
  KG: { name: "Karsten Guhr", initials: "KG", bg: "#2E5C92" },
  LH: { name: "Lena Hoffmann", initials: "LH", bg: "#287A67" },
  TK: { name: "Tobias Krüger", initials: "TK", bg: "#9A7B22" },
  MS: { name: "Mareike Schulz", initials: "MS", bg: "#5E4894" },
  JB: { name: "Jonas Becker", initials: "JB", bg: "#A8456A" },
  SW: { name: "Sophie Wagner", initials: "SW", bg: "#B5722A" },
};

export const PRIORITY: Record<Priority, { color: string; label: string; short: string }> = {
  high: { color: "#C25B4E", label: "High priority", short: "High" },
  normal: { color: GOLD, label: "Standard priority", short: "Standard" },
  low: { color: "#8AA17E", label: "Low priority", short: "Low" },
};

/** The seven pipeline phases, in board order. */
export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "neu", title: "New Inquiry" },
  { id: "erst", title: "Consultation Scheduled" },
  { id: "angef", title: "Documents Requested" },
  { id: "erh", title: "Documents Received" },
  { id: "vertrag", title: "Engagement Letter Sent" },
  { id: "aktiv", title: "Signed & Active" },
  { id: "paus", title: "On Hold / Paused" },
];

/** The one phase rendered in a muted, "parked" style. */
export const PAUSED_COLUMN: ColumnId = "paus";

/** Mandate types offered in the detail panel's selector. */
export const MANDATE_TYPES = Object.keys(MANDATE) as MandateType[];

/** All advisor ids, for assignment dropdowns and the "acting as" switcher. */
export const MEMBER_IDS = Object.keys(MEMBERS) as MemberId[];

/** Look up a phase's display title by id. */
export function columnTitle(id: ColumnId): string {
  return COLUMNS.find((c) => c.id === id)?.title ?? id;
}

/** Friendly advisor name, or "Unassigned" for null. */
export function memberLabel(member: MemberId | null): string {
  return member ? MEMBERS[member].name : "Unassigned";
}
