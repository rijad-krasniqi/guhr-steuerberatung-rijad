// Core domain types for the onboarding board.
// Kept deliberately small and explicit so the data shape is obvious at a glance.

/** The seven pipeline phases. Stored on each card as its `column`. */
export type ColumnId =
  | "neu" // New Inquiry
  | "erst" // Consultation Scheduled
  | "angef" // Documents Requested
  | "erh" // Documents Received
  | "vertrag" // Engagement Letter Sent
  | "aktiv" // Signed & Active
  | "paus"; // On Hold / Paused

export type Priority = "high" | "normal" | "low";

/** Mandate (engagement) type — drives the colored tag on each card. */
export type MandateType =
  | "Income Tax"
  | "GmbH"
  | "UG"
  | "GbR"
  | "Freelancer"
  | "VAT";

/** Advisor initials used as a lookup key into the MEMBERS table. */
export type MemberId = "KG" | "LH" | "TK" | "MS" | "JB" | "SW";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Client {
  id: string;
  name: string;
  /** Business descriptor shown under the name, e.g. "Freelancer · Graphic Design". */
  sub: string;
  mandate: MandateType;
  /** Assigned advisor, or null when unassigned. */
  member: MemberId | null;
  /** ISO date (YYYY-MM-DD) the client was added. */
  date: string;
  priority: Priority;
  column: ColumnId;
  email: string;
  phone: string;
  notes: string;
  /** Required-documents checklist, or null when the phase has none. */
  checklist: ChecklistItem[] | null;
}
