// Drag-and-drop interaction state, using the native HTML5 DnD API.
//
// We deliberately use the browser's built-in drag events rather than a library:
// the interaction here is simple (move a card from one column to another), the
// design itself was built this way, and it keeps the dependency list honest.
// This hook owns only *transient* UI state — which card is being dragged and
// which column is hovered — so it never touches persistence.

import { useCallback, useState } from "react";
import type { ColumnId } from "./types";

export interface DragState {
  /** Id of the card currently being dragged, or null. */
  draggingId: string | null;
  /** Column currently hovered as a drop target, or null. */
  overColumn: ColumnId | null;
  startDrag: (id: string) => void;
  endDrag: () => void;
  /** Call on dragOver of a column body; returns true while it's the active target. */
  setOverColumn: (column: ColumnId) => void;
  /** Resolve a drop on a column; returns the dragged id (or null) and clears state. */
  drop: () => string | null;
}

export function useDragAndDrop(): DragState {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOver] = useState<ColumnId | null>(null);

  const startDrag = useCallback((id: string) => setDraggingId(id), []);
  const endDrag = useCallback(() => {
    setDraggingId(null);
    setOver(null);
  }, []);

  const setOverColumn = useCallback(
    (column: ColumnId) => setOver((cur) => (cur === column ? cur : column)),
    [],
  );

  const drop = useCallback((): string | null => {
    const id = draggingId;
    setDraggingId(null);
    setOver(null);
    return id;
  }, [draggingId]);

  return { draggingId, overColumn, startDrag, endDrag, setOverColumn, drop };
}
