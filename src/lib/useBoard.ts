// Board state, activity trail, and persistence — the single source of truth.
//
// Everything the board needs lives in one `BoardState` object: the `clients`
// array (each card carries its own `column`, so moving a card is just a field
// update), an append-only `activity` log, and the `currentUser` (who is acting).
// Keeping these together lets each mutation update the data *and* record an audit
// entry atomically in one `setState`, and lets us persist the whole thing to
// localStorage in one shot. For a single-user internal tool that's simpler and
// more robust than a normalized store or a backend.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActivityEntry,
  ActivityType,
  ChecklistItem,
  Client,
  ColumnId,
  MemberId,
  NewClientDraft,
  Priority,
} from "./types";
import { SEED_CLIENTS } from "../data/seedClients";
import { columnTitle, memberLabel, PRIORITY } from "./brand";
import { todayIso } from "./dates";

// v2: the shape changed (checklist items gained id/assignee; state now also
// carries the activity log + current user), so we use a fresh storage key
// rather than migrating older data.
const STORAGE_KEY = "guhr.onboarding.board.v2";

/** Default acting user — the firm's principal. */
const DEFAULT_USER: MemberId = "KG";

interface BoardState {
  clients: Client[];
  activity: ActivityEntry[];
  currentUser: MemberId;
}

function freshState(): BoardState {
  return { clients: SEED_CLIENTS, activity: [], currentUser: DEFAULT_USER };
}

function loadState(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    // Guard against an empty/malformed payload clobbering the board.
    if (parsed && Array.isArray(parsed.clients) && parsed.clients.length > 0) {
      return {
        clients: parsed.clients as Client[],
        activity: Array.isArray(parsed.activity) ? (parsed.activity as ActivityEntry[]) : [],
        currentUser: (parsed.currentUser as MemberId) ?? DEFAULT_USER,
      };
    }
    return freshState();
  } catch {
    return freshState();
  }
}

// Monotonic-ish id helper. The counter avoids collisions when several entries
// are created within the same millisecond.
let seq = 0;
function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;
}

export interface BoardApi {
  clients: Client[];
  activity: ActivityEntry[];
  currentUser: MemberId;
  setCurrentUser: (member: MemberId) => void;

  /** Move a client to a different phase (drag-and-drop and the panel dropdown). */
  moveClient: (id: string, column: ColumnId) => void;
  setPriority: (id: string, priority: Priority) => void;
  setAdvisor: (id: string, member: MemberId | null) => void;
  setMandate: (id: string, mandate: Client["mandate"]) => void;
  /** Commit an edit to one or more free-text contact fields (logged once). */
  editDetails: (id: string, patch: Partial<Client>, fieldLabel: string) => void;
  updateNotes: (id: string, notes: string) => void;

  addTask: (id: string, label: string) => void;
  removeTask: (id: string, taskId: string) => void;
  toggleTask: (id: string, taskId: string) => void;
  assignTask: (id: string, taskId: string, member: MemberId | null) => void;

  /** Create a client from the new-client form; returns the new id. */
  addClient: (draft: NewClientDraft) => string;
  /** Archive a card (hidden from the board, kept and restorable). */
  archiveClient: (id: string) => void;
  /** Restore an archived card to the board. */
  unarchiveClient: (id: string) => void;
  /** Permanently remove a card. */
  deleteClient: (id: string) => void;
  resetBoard: () => void;
  clearActivity: () => void;
}

export function useBoard(): BoardApi {
  const [state, setState] = useState<BoardState>(loadState);

  // Persist on every change. A short debounce avoids hammering localStorage
  // while the user types into a text field.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 250);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  /**
   * Core helper: apply `change` to the matching client and, unless it returns
   * null, append the resulting activity entry — all in one atomic update.
   * `change` receives the card and the acting user and returns the updated card
   * plus an audit record (type + message), or null to skip (e.g. no real change).
   */
  const mutate = useCallback(
    (
      id: string,
      change: (
        card: Client,
        actor: MemberId,
      ) => { card: Client; type: ActivityType; message: string } | null,
    ) => {
      setState((s) => {
        const i = s.clients.findIndex((c) => c.id === id);
        if (i < 0) return s;
        const result = change(s.clients[i], s.currentUser);
        if (!result) return s;
        const clients = s.clients.slice();
        clients[i] = result.card;
        const entry: ActivityEntry = {
          id: uid("a"),
          timestamp: Date.now(),
          actor: s.currentUser,
          type: result.type,
          cardId: result.card.id,
          cardName: result.card.name,
          message: result.message,
        };
        return { ...s, clients, activity: [entry, ...s.activity] };
      });
    },
    [],
  );

  const setCurrentUser = useCallback((member: MemberId) => {
    setState((s) => ({ ...s, currentUser: member }));
  }, []);

  const moveClient = useCallback(
    (id: string, column: ColumnId) => {
      setState((s) => {
        const i = s.clients.findIndex((c) => c.id === id);
        if (i < 0 || s.clients[i].column === column) return s;
        const card = s.clients[i];
        // Move to the end of the array so it reads as "most recent" in its new column.
        const clients = s.clients.slice();
        clients.splice(i, 1);
        clients.push({ ...card, column });
        const entry: ActivityEntry = {
          id: uid("a"),
          timestamp: Date.now(),
          actor: s.currentUser,
          type: "moved",
          cardId: card.id,
          cardName: card.name,
          message: `moved “${card.name}” from ${columnTitle(card.column)} to ${columnTitle(column)}`,
        };
        return { ...s, clients, activity: [entry, ...s.activity] };
      });
    },
    [],
  );

  const setPriority = useCallback(
    (id: string, priority: Priority) =>
      mutate(id, (card) =>
        card.priority === priority
          ? null
          : {
              card: { ...card, priority },
              type: "priority",
              message: `set “${card.name}” to ${PRIORITY[priority].short} priority`,
            },
      ),
    [mutate],
  );

  const setAdvisor = useCallback(
    (id: string, member: MemberId | null) =>
      mutate(id, (card) =>
        card.member === member
          ? null
          : {
              card: { ...card, member },
              type: "advisor",
              message: member
                ? `assigned “${card.name}” to ${memberLabel(member)}`
                : `removed the advisor from “${card.name}”`,
            },
      ),
    [mutate],
  );

  const setMandate = useCallback(
    (id: string, mandate: Client["mandate"]) =>
      mutate(id, (card) =>
        card.mandate === mandate
          ? null
          : {
              card: { ...card, mandate },
              type: "mandate",
              message: `changed the mandate of “${card.name}” to ${mandate}`,
            },
      ),
    [mutate],
  );

  const editDetails = useCallback(
    (id: string, patch: Partial<Client>, fieldLabel: string) =>
      mutate(id, (card) => {
        const next = { ...card, ...patch };
        // Skip when nothing actually changed (e.g. blur without an edit).
        const unchanged = (Object.keys(patch) as (keyof Client)[]).every(
          (k) => card[k] === next[k],
        );
        if (unchanged) return null;
        return {
          card: next,
          type: "details",
          message: `updated the ${fieldLabel} for “${next.name}”`,
        };
      }),
    [mutate],
  );

  const updateNotes = useCallback(
    (id: string, notes: string) =>
      mutate(id, (card) =>
        card.notes === notes
          ? null
          : { card: { ...card, notes }, type: "notes", message: `updated the notes on “${card.name}”` },
      ),
    [mutate],
  );

  const addTask = useCallback(
    (id: string, label: string) => {
      const text = label.trim();
      if (!text) return;
      mutate(id, (card) => {
        const task: ChecklistItem = { id: uid("t"), label: text, done: false, assignee: null };
        return {
          card: { ...card, checklist: [...(card.checklist ?? []), task] },
          type: "task_added",
          message: `added the task “${text}” to “${card.name}”`,
        };
      });
    },
    [mutate],
  );

  const removeTask = useCallback(
    (id: string, taskId: string) =>
      mutate(id, (card) => {
        const task = card.checklist?.find((t) => t.id === taskId);
        if (!task) return null;
        const checklist = card.checklist!.filter((t) => t.id !== taskId);
        return {
          card: { ...card, checklist: checklist.length ? checklist : null },
          type: "task_removed",
          message: `removed the task “${task.label}” from “${card.name}”`,
        };
      }),
    [mutate],
  );

  const toggleTask = useCallback(
    (id: string, taskId: string) =>
      mutate(id, (card) => {
        const task = card.checklist?.find((t) => t.id === taskId);
        if (!task) return null;
        const done = !task.done;
        return {
          card: {
            ...card,
            checklist: card.checklist!.map((t) => (t.id === taskId ? { ...t, done } : t)),
          },
          type: done ? "task_done" : "task_undone",
          message: `${done ? "completed" : "reopened"} “${task.label}” on “${card.name}”`,
        };
      }),
    [mutate],
  );

  const assignTask = useCallback(
    (id: string, taskId: string, member: MemberId | null) =>
      mutate(id, (card) => {
        const task = card.checklist?.find((t) => t.id === taskId);
        if (!task || task.assignee === member) return null;
        return {
          card: {
            ...card,
            checklist: card.checklist!.map((t) =>
              t.id === taskId ? { ...t, assignee: member } : t,
            ),
          },
          type: "task_assigned",
          message: member
            ? `assigned the task “${task.label}” to ${memberLabel(member)} on “${card.name}”`
            : `unassigned the task “${task.label}” on “${card.name}”`,
        };
      }),
    [mutate],
  );

  const addClient = useCallback((draft: NewClientDraft): string => {
    const id = uid("c");
    const card: Client = {
      id,
      name: draft.name.trim(),
      sub: draft.sub.trim() || "New client",
      mandate: draft.mandate,
      member: draft.member,
      date: todayIso(),
      priority: draft.priority,
      column: draft.column,
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      notes: "",
      checklist: null,
      archived: false,
    };
    setState((s) => {
      const entry: ActivityEntry = {
        id: uid("a"),
        timestamp: Date.now(),
        actor: s.currentUser,
        type: "created",
        cardId: id,
        cardName: card.name,
        message: `added “${card.name}” to ${columnTitle(card.column)}`,
      };
      return { ...s, clients: [...s.clients, card], activity: [entry, ...s.activity] };
    });
    return id;
  }, []);

  const archiveClient = useCallback(
    (id: string) =>
      mutate(id, (card) =>
        card.archived
          ? null
          : { card: { ...card, archived: true }, type: "archived", message: `archived “${card.name}”` },
      ),
    [mutate],
  );

  const unarchiveClient = useCallback(
    (id: string) =>
      mutate(id, (card) =>
        !card.archived
          ? null
          : {
              card: { ...card, archived: false },
              type: "unarchived",
              message: `restored “${card.name}” from the archive`,
            },
      ),
    [mutate],
  );

  const deleteClient = useCallback((id: string) => {
    setState((s) => {
      const card = s.clients.find((c) => c.id === id);
      if (!card) return s;
      const entry: ActivityEntry = {
        id: uid("a"),
        timestamp: Date.now(),
        actor: s.currentUser,
        type: "deleted",
        cardId: card.id,
        cardName: card.name,
        message: `permanently deleted “${card.name}”`,
      };
      return {
        ...s,
        clients: s.clients.filter((c) => c.id !== id),
        activity: [entry, ...s.activity],
      };
    });
  }, []);

  const resetBoard = useCallback(() => {
    setState((s) => {
      const entry: ActivityEntry = {
        id: uid("a"),
        timestamp: Date.now(),
        actor: s.currentUser,
        type: "reset",
        cardId: "",
        cardName: "",
        message: "reset the board to the sample data",
      };
      return { clients: SEED_CLIENTS, activity: [entry], currentUser: s.currentUser };
    });
  }, []);

  const clearActivity = useCallback(() => {
    setState((s) => ({ ...s, activity: [] }));
  }, []);

  return {
    clients: state.clients,
    activity: state.activity,
    currentUser: state.currentUser,
    setCurrentUser,
    moveClient,
    setPriority,
    setAdvisor,
    setMandate,
    editDetails,
    updateNotes,
    addTask,
    removeTask,
    toggleTask,
    assignTask,
    addClient,
    archiveClient,
    unarchiveClient,
    deleteClient,
    resetBoard,
    clearActivity,
  };
}
