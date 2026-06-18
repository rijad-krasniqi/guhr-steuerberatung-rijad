// Board state + persistence.
//
// All client data lives in a single `clients` array (each card carries its own
// `column`). This flat shape keeps moves trivial — changing a phase is just a
// field update — and makes localStorage persistence a one-liner. For an
// internal tool of this size that's simpler and more robust than a normalized,
// column-keyed structure. The whole array is debounced-saved to localStorage so
// edits survive a refresh without any backend to run.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Client, ColumnId, MandateType, Priority } from "./types";
import { SEED_CLIENTS } from "../data/seedClients";
import { todayIso } from "./dates";

const STORAGE_KEY = "guhr.onboarding.board.v1";

/** Load persisted clients, falling back to the seed data on first run / bad data. */
function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_CLIENTS;
    const parsed = JSON.parse(raw);
    // Guard against an empty or malformed payload clobbering the board.
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Client[];
    return SEED_CLIENTS;
  } catch {
    return SEED_CLIENTS;
  }
}

export interface BoardApi {
  clients: Client[];
  /** Apply a partial update to one client. */
  updateClient: (id: string, patch: Partial<Client>) => void;
  /** Move a client to a different phase (used by drag-and-drop and the panel). */
  moveClient: (id: string, column: ColumnId) => void;
  /** Toggle one checklist item's done state. */
  toggleChecklistItem: (id: string, index: number) => void;
  /** Add a new client to a column; returns the created id. */
  addClient: (column: ColumnId, name: string) => string;
  /** Reset the board back to the seeded sample data. */
  resetBoard: () => void;
}

export function useBoard(): BoardApi {
  const [clients, setClients] = useState<Client[]>(loadClients);

  // Persist on every change. A short debounce avoids hammering localStorage
  // while the user types into the notes field.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    }, 250);
    return () => window.clearTimeout(timer.current);
  }, [clients]);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const moveClient = useCallback((id: string, column: ColumnId) => {
    // Move the card to the end of its new column so it reads as "most recent".
    setClients((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      if (i < 0 || cs[i].column === column) return cs;
      const next = cs.slice();
      const [card] = next.splice(i, 1);
      next.push({ ...card, column });
      return next;
    });
  }, []);

  const toggleChecklistItem = useCallback((id: string, index: number) => {
    setClients((cs) =>
      cs.map((c) => {
        if (c.id !== id || !c.checklist) return c;
        return {
          ...c,
          checklist: c.checklist.map((item, i) =>
            i === index ? { ...item, done: !item.done } : item,
          ),
        };
      }),
    );
  }, []);

  const addClient = useCallback((column: ColumnId, name: string): string => {
    const id = "c" + Date.now();
    const card: Client = {
      id,
      name: name.trim(),
      sub: "New client",
      mandate: "Income Tax" as MandateType,
      member: null,
      date: todayIso(),
      priority: "normal" as Priority,
      column,
      email: "",
      phone: "",
      notes: "",
      checklist: null,
    };
    setClients((cs) => [...cs, card]);
    return id;
  }, []);

  const resetBoard = useCallback(() => setClients(SEED_CLIENTS), []);

  return { clients, updateClient, moveClient, toggleChecklistItem, addClient, resetBoard };
}
