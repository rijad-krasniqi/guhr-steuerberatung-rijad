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

/**
 * A required-document / onboarding task on a card. Each task can be checked off
 * and assigned to an advisor, so the team can see who owns what.
 */
export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** Advisor responsible for this task, or null when unassigned. */
  assignee: MemberId | null;
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
  /** Required-documents / task checklist, or null when the card has none. */
  checklist: ChecklistItem[] | null;
}

/** Fields collected by the "new client" form when a card is created. */
export interface NewClientDraft {
  name: string;
  sub: string;
  mandate: MandateType;
  member: MemberId | null;
  priority: Priority;
  column: ColumnId;
  email: string;
  phone: string;
}

/** The kinds of changes recorded in the activity trail. */
export type ActivityType =
  | "created"
  | "moved"
  | "priority"
  | "advisor"
  | "mandate"
  | "details"
  | "notes"
  | "task_added"
  | "task_removed"
  | "task_done"
  | "task_undone"
  | "task_assigned"
  | "reset";

/**
 * One entry in the audit trail. The log is append-only: entries are never
 * mutated, so it's a faithful record of who changed what and when.
 */
export interface ActivityEntry {
  id: string;
  /** Epoch milliseconds. */
  timestamp: number;
  /** The advisor acting (the current user at the time of the change). */
  actor: MemberId;
  type: ActivityType;
  cardId: string;
  cardName: string;
  /** Human-readable phrase describing the change (without the actor's name). */
  message: string;
}
